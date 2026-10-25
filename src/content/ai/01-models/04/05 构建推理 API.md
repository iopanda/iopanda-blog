---
title: "构建推理 API"
number: "01.04.05"
chapter: 1
chapterTitle: "Models"
section: 4
sectionTitle: "Inference and Deployment"
group: ""
created: 2026-09-02 23:40
author: "iopanda"
tags: ["course", "model-deployment", "fastapi"]
sourceId: "3.10.1.4 Inference and Deployment/4.5 构建推理 API"
---
![](/iopanda-blog/ai/images/Pasted%20image%2020261012143628.png)

> 上一章把模型变成了「会说话的标准服务」,本章回答一个更尖锐的问题:**这个服务能直接交给产品用吗?** 不能。vLLM 知道怎么生成,却不知道你的产品允许什么输入、错误该如何表达、日志要不要脱敏、依赖是否还活着。本章在 vLLM 前面再立一层**业务 API**(用 FastAPI 自己写):先讲清这层边界为什么非有不可、HTTP 状态码与 schema 各自回答什么问题,再动手实现健康检查与问答端点、把请求转发给本地 vLLM,最后用自动文档与 curl 验证正常与失败两条路径。

**学习目标**:学完本章,你将能够——

1. 解释为什么模型服务不能直接面向产品,说出业务 API 补上了哪几类能力;
2. 说出 200/400/422/503 各代表什么,判断一次失败该归责给调用方还是服务方;
3. 解释 API schema 与 Pydantic 校验在业务逻辑运行之前做了什么、不能做什么;
4. 实现转发(proxy)模式:业务 API 校验输入后把请求转给本地模型服务并回传答案;
5. 解释健康检查回答什么、不回答什么,并区分「业务挂了」与「模型挂了」;
6. 识别演示 API 的边界:无认证、无限流、日志未脱敏时绝不能直接暴露公网。

## 1. 概念:为什么模型服务不能直接面向产品

- vLLM 解决的是「吞吐与服务化」(见 04),但它对客户端的假设是:**你会正确地构造请求**。格式合法的请求它一律执行,格式不对就按 OpenAI 协议的默认方式报错——它不管你的 question 该不该超过 1000 字、这条日志里有没有用户隐私、上游模型是不是换了一版。
- 把 vLLM 直接交给产品,等于把以下四件事全部甩给每一个客户端自己处理:

| 缺口 | 直接暴露时会发生什么 | 业务 API 补上的做法 |
|---|---|---|
| **输入约束** | 任意长度、任意内容的请求直达 GPU,超长输入烧显存与算力 | schema 里用 `Field(min_length=1, max_length=1000)` 先拦 |
| **错误语义** | 产品只能拿到模型服务的原始报错,不知道能不能重试 | 把失败翻译成 400/422/503 等明确状态码 |
| **日志脱敏** | 原始请求直接落日志,用户问题里的隐私照单全收 | 在业务层决定「记什么、不记什么」 |
| **健康可见性** | 没有统一探针,监控脚本只能去猜模型端口 | 提供 `/health`,回答「现在能不能服务」 |
| **内部细节耦合** | 产品代码里硬编码模型 ID、端口、生成参数,换模型要改产品 | 产品只见「问一个问题 → 得到一个 answer」,内部随便换 |

- 打个比方:vLLM 是**发动机**,业务 API 是**仪表盘与踏板**——发动机只负责产生动力,不负责理解你要去哪儿;油门、刹车、仪表该由驾驶舱负责。没有驾驶舱就把发动机交给乘客,后果由 01~04 章攒下的每一分性能优势都救不回来。
- 直接暴露还有一层隐患:**模型与部署细节泄漏给所有调用方**。请求里带着 `Qwen/Qwen2.5-0.5B-Instruct` 这样的模型 ID,产品端一旦写死,将来升级模型就得产品发版;藏在业务 API 后面,换模型只改一处配置。

## 2. 概念:请求的三种结果:HTTP 状态码语义

- HTTP 状态码是互联网通用的「失败语言」:2xx 成功、4xx 是**调用方的错**、5xx 是**服务方的错**。API 设计的第一课就是别把所有失败都回 200——那会让产品无法决定要不要重试。本章只出现四种:

| 状态码 | 含义 | 谁的问题 | 本章出现场景 | 调用方该怎么做 |
|---|---|---|---|---|
| **200** | 正常回答 | — | `/health` 探活成功;`/ask` 返回答案 | 解析响应体 |
| **400** | Bad Request,请求体本身不合法 | 调用方 | JSON 语法错误、`Content-Type` 不对,根本没法解析 | 修正请求,重试无意义 |
| **422** | Unprocessable Entity,能解析但**不符合 schema** | 调用方 | question 为空、超过 1000 字、字段缺失或类型错 | 看响应里的 `detail` 逐条改正 |
| **503** | Service Unavailable,依赖暂时不可用 | 服务方 | 下游 vLLM 没启动或正在重启 | 稍后重试(指数退避) |

- **400 与 422 的差别值得记住**:400 是「这句话我听不懂」(不是合法 JSON);422 是「我听懂了,但内容不合约定」(字段类型错、长度越界)——FastAPI 会先把请求体解析成 JSON,再交给 Pydantic 校验,所以校验失败默认返回 422 并附 `detail` 说明错在哪。
- **更关键:模型「答错」仍然是 200**。状态码描述的是**传输是否成功**,不是**内容是否正确**。模型一本正经地胡说,HTTP 层照样 200;503 只表示模型服务这个依赖本身不可用(没启动、崩了、在重启)。别用状态码判断答案质量——质量问题是评测(01.06)与压测(06)的事。
- 错误语义的价值在自动化:4xx 说明「改请求」,5xx 说明「稍后再来」。没有这套约定,客户端只能靠猜,重试策略与告警阈值都无从谈起。

## 3. 概念:API schema 与 Pydantic 校验

- **schema(模式)**是调用双方约定的 JSON 结构:有哪些字段、什么类型、哪些必填、取值范围多大。没有它,每个客户端都会发明自己的请求格式,业务逻辑里塞满 `if not isinstance(...)` 的防御代码。
- **Pydantic** 用 Python 类型注解声明这个约定:`class Ask(BaseModel): question: str = Field(min_length=1, max_length=1000)` 声明「必须有一个字符串字段 question,长度 1~1000」。FastAPI 收到 POST 后,会在**进入你的函数之前**完成解析与校验:合法则构造出 `Ask` 实例交给函数;不合法则直接返回 422 与错误明细,你的业务代码根本不会执行。
- 为什么值得为它单独写一节?因为校验发生在「请求到达模型之前」——它把垃圾挡在 GPU 门外:空问题不必占一次生成、超长文本不必烧一次 KV cache。**校验越严,浪费越少**;但校验太严又会误伤合法用户(比如把 1001 字的真问题拒了)。所以 schema 是**产品规则的落地**,不是随手写的技术细节,长度上限该由产品语义决定,而不是「随便给个数」。
- **校验不能替代什么**:身份认证(谁在调用)、限流(调用多频繁)、内容安全(模型答出了违规内容——模型生成在业务逻辑之后,Pydantic 管不到)。schema 只保证「进来的形状对」,不保证「进来的动机对、出去的内容对」,后者要等 01.07 与部署层(07)补上。

## 4. 概念:转发 vs 直接调用

- **直接调用**:产品客户端 → vLLM。**转发(proxy)**:产品客户端 → 你的 FastAPI →(httpx)→ vLLM → 原路返回。多一跳看似浪费,但这一跳正是第 1 节四类能力的容身之处;转发是「把校验、错误翻译、日志、健康检查放在请求的必经之路上」。
- 转发的本质是**适配两层协议**。对外,产品只发业务形状 `{"question": "..."}`;对内,你把字段拼装成 OpenAI 兼容的 chat payload(固定模型 ID、`temperature=0`、`max_tokens=160`——生成参数在 02 章已定下可复现口径),再把 vLLM 返回的 `choices[0].message.content` 抽出来包成 `{"answer": ...}` 还给产品。产品从此**不接触模型协议**,模型协议升级了也只改这里。
- 转发还承担**超时与错误映射**:`/health` 用 `timeout=3` 快速失败(探活不该等);`/ask` 用 `timeout=60` 容忍一次完整生成长度。`raise_for_status()` 把上游非 2xx 变成异常,统一转成你的 503——产品看到的永远是你的语义,而不是 vLLM 的原始报错。
- 注意:转发只是网络层搬运,**不自动带来认证与限流**。它的安全收益是把 vLLM 藏到内网、只留一个受控入口;入口本身没锁,依然谁都进得来。

## 5. 概念:健康检查的意义

- `/health` 回答的问题是「**现在能不能服务新请求**」——给负载均衡、监控、编排系统(07 章的容器平台)一个统一的探针。没有它,平台只能猜「端口通 = 活着」,而端口通可能只是 uvicorn 活着、vLLM 已经死了。
- 本章的健康检查**真的去探下游依赖**:向 vLLM 的 `/v1/models` 发一个 3 秒超时的请求,成功才回 `{"status":"ok"}`,失败抛 503。返回「永远 ok」的健康检查是自欺欺人——它把模型挂掉的真相藏起来,让上游以为一切正常。
- **健康检查不回答什么**:模型质量好不好(那是评测)、响应快不快(那是压测,06 章)、容量还剩多少。一个「健康」的服务完全可以输出垃圾答案或慢到超时——健康只承诺「依赖可达」,不承诺「表现合格」。
- 先探 `/v1/models` 而非直接 `/v1/chat/completions` 也是设计:探活请求要**便宜、无副作用**,不能每次健康检查都烧一次完整生成。

## 6. 动手:创建最小服务

安装依赖(在 `minigpt-course` 根目录,仍激活 `.venv`):

```bash
pip install fastapi "uvicorn[standard]" httpx
```

创建 `finetune/src/api.py`:

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import httpx

app = FastAPI(title="Course Assistant")
VLLM = "http://127.0.0.1:8000/v1/chat/completions"
class Ask(BaseModel):
    question: str = Field(min_length=1, max_length=1000)

@app.get("/health")
async def health():
    try:
        async with httpx.AsyncClient(timeout=3) as client:
            r = await client.get("http://127.0.0.1:8000/v1/models")
            r.raise_for_status()
        return {"status":"ok"}
    except httpx.HTTPError:
        raise HTTPException(503, "model service unavailable")

@app.post("/ask")
async def ask(body: Ask):
    payload = {"model":"Qwen/Qwen2.5-0.5B-Instruct", "messages":[{"role":"user","content":body.question}], "temperature":0, "max_tokens":160}
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            r = await client.post(VLLM, json=payload); r.raise_for_status()
        return {"answer": r.json()["choices"][0]["message"]["content"]}
    except httpx.HTTPError:
        raise HTTPException(503, "model service unavailable")
```

逐行读懂它:第 1 节的问题由 `Ask` 的 `Field` 拦截(空串与超长直接 422);第 4 节的转发由 `/ask` 完成(业务形状进、拼 chat payload、抽 `content` 出);第 5 节的健康检查由 `/health` 完成。先启动 vLLM(04 章的命令),再运行 `uvicorn finetune.src.api:app --host 127.0.0.1 --port 8080`。打开 `http://127.0.0.1:8080/docs`,或执行 `curl http://127.0.0.1:8080/health`。再发送 `curl -X POST http://127.0.0.1:8080/ask -H 'Content-Type: application/json' -d '{"question":"什么是主键？"}'`。

- **自动文档不是赠品**:FastAPI 从 `Ask` 的声明直接生成 OpenAPI 文档——schema 本身就是文档,产品端照着 `/docs` 就能对接,这正是「契约」二字的具体形态。
- **监听边界**:`--host 127.0.0.1` 让服务只在本机回环可见(呼应 04 的安全讨论);若改成 `0.0.0.0`,局域网内任何机器都能访问这个**无认证**端口——演示期千万别这么干。

> [!example] 动手活动:正常与失败路径
>
> **目标**:`reports/api-smoke-test.md`。
>
> **步骤**:保存 health 200、正常 `/ask`、空 question 的 422,以及关闭 vLLM 后 health 503 的响应。
>
> **完成标准**:每个状态符合本章定义,服务仅监听 127.0.0.1。

## 7. 排错速查与边界

| 现象 | 处理 | 原因 |
|---|---|---|
| `/docs` 打不开 | 确认 uvicorn 进程在跑、端口没被占 | 服务未启动或端口冲突 |
| `/health` 返回 503 | 启动 vLLM,核对它监听 8000 | 健康检查真的探了依赖,而不是假装 ok |
| `/ask` 返回 422 | 看响应 `detail` 里是哪个字段违规 | 请求不符合 schema,被 Pydantic 拦在业务逻辑前 |
| 返回 400 | 检查引号转义与 `Content-Type: application/json` | 请求体根本不是合法 JSON |
| curl 长时间无响应 | 加 `--max-time`;查看 vLLM 日志 | `/ask` 是长耗时转发,也可能是模型服务卡死 |
| 空字符串能发出去 | 检查是否少了 `min_length=1` | 校验规则没生效,垃圾进了模型 |

- **边界,必须说清**:这个演示 API **没有认证、没有限流、日志未脱敏、错误可能含内部细节**,只能用于本地学习,不能直接暴露公网——公网等于把 GPU 与模型使用权免费送人,还可能被当跳板。生产化还差认证/TLS/密钥/权限管理,那是 07 章的内容;而在那之前,先要知道它能扛多大流量——下一章(06)就在真实请求形状下把它的容量测出来。

## 8. 总结

| 关键问题 | 一句话 |
|---|---|
| 模型服务为何不能直接面向产品 | 它不约束输入、不懂错误语义、不脱敏、不报健康,这些是业务 API 的职责 |
| schema 是什么 | 双方约定的 JSON 结构;Pydantic 让它在业务逻辑前自动执行 |
| 各状态码什么意思 | 200 成功;400 请求不合法;422 不合 schema;503 依赖不可用 |
| 校验能做什么、不能做什么 | 挡坏形状的输入;挡不了未认证者、也管不了生成内容 |
| 转发 vs 直接调用 | 转发把校验/错误映射/日志/健康放在必经之路,产品只见业务形状 |
| 健康检查回答什么 | 「现在能不能服务」——探真依赖;不回答质量与容量 |
| 演示的边界 | 无认证无限流,只监听 127.0.0.1,不上公网 |

**思考题**:为什么「模型答错了」返回 200 而不是 4xx/5xx?健康检查为什么不直接调一次 `/v1/chat/completions` 来验证?把模型 ID 写死在业务 API 里,和写死在产品端相比,好在哪?

> [!note] 参考答案
> 状态码描述传输成败,不描述内容正确性:请求被正确处理并返回了答案,就该是 200;答案质量由评测体系负责。健康检查探 `/v1/models` 是因为它必须便宜、无副作用、可高频执行,每次烧一次完整生成会把探活本身变成负载。模型 ID 藏在业务 API 里,升级或切换模型只改一处、产品零改动;写死在产品端则每次换模型都要产品发版,还泄漏内部部署细节。

## 引用

- [FastAPI:入门与自动文档](https://fastapi.tiangolo.com/tutorial/first-steps/)
- [MDN:HTTP 响应状态码](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Status)

上一篇:[本地推理与 vLLM](/iopanda-blog/ai/01-models/04/04/)——vLLM 把模型变成 OpenAI 兼容的标准服务,本章在其上立起业务边界层。

下一篇:[压测与容量规划](/iopanda-blog/ai/01-models/04/06/)——在真实请求形状下测量这层 API 的承载能力与失败边界。
