---
title: "Function Calling 原理"
number: "02.04.02"
chapter: 2
chapterTitle: "Agents"
section: 4
sectionTitle: "Tool Use and Protocols"
group: ""
created: 2026-09-03 04:00
author: "iopanda"
tags: ["course", "ai-agent", "tool-use", "function-calling"]
sourceId: "3.10.2.4 Tool Use and Protocols/01 Function Calling 原理"
---
# Function Calling 原理

> 02.03 的「06 规划评测与预算」给出了一个清醒的结论:规划有代价,没有免费午餐。但比「怎么规划」更基本的问题是——想好之后,课程助教 Agent 凭什么把手伸向外部世界?答案在 02.04 Tool Use and Protocols:靠工具。本章是模块第一课 **function calling 原理**:模型怎样「声明」要调用工具、为什么它从不亲自执行、应用怎样把结果送回模型。读完,你的课程助教将第一次拥有「先查证、再作答」的能力。

**学习目标**:学完本章,你将能够——

1. 说出 function calling 的本质:模型输出结构化的调用声明(名字+参数),执行发生在应用侧;
2. 解释「模型只声明、不执行」的设计理由(可验证、可控、可审计);
3. 画出并说出工具调用的完整闭环:声明 schema → 模型决策 → 应用执行 → 结果回填;
4. 对比 ReAct 文本协议,说明 function calling 是「结构化的 Action 槽位」;
5. 用 OpenAI 兼容 API 跑通课程助教「查课程目录→基于结果作答」的第一个循环。

## 1. 概念:Function Calling 是什么

- **Function Calling(函数调用)**:一种让模型「声明想调用哪个函数、传什么参数」的接口机制。模型不执行任何代码,只在回复里输出一段结构化声明:「我要调用函数 X,参数是 Y」;真正的执行由应用代码完成,结果再送回模型。
- 该机制由 OpenAI 于 2023 年 6 月随 `functions` 参数引入,现在的 OpenAI 兼容 API 普遍使用 `tools` 参数;Claude、Gemini 等主流模型均有同构实现。模型收到工具清单后,如果判断需要外部信息,就在回复里携带 `tool_calls`,例如:

```json
{
  "role": "assistant",
  "tool_calls": [
    {
      "id": "call_9f8h2k",
      "type": "function",
      "function": {
        "name": "search_course",
        "arguments": "{\"module_id\": \"02.04\"}"
      }
    }
  ]
}
```

- 拆开看三个关键字段:**name** 是模型从清单里选中的工具;**arguments** 是模型按 schema 生成的参数(注意它是 **JSON 字符串**,应用要自己 `json.loads`);**id** 是这张「调用单」的编号,应用执行完后凭它把结果回填给对应调用。
- 呼应 02.02 的 04 结构化输出约束:`tool_calls` 就是「受 JSON schema 约束的结构化输出」在工具场景的专用形态——只不过这次的输出不是给用户看的答案,而是给应用执行的指令。

## 2. 为什么需要:模型为什么「只声明、不执行」

- **模型是文本生成器,不是操作系统**(呼应 02.01 的 04 章):它的权重里没有数据库连接、没有 HTTP 客户端、没有「执行」这个概念,只有「下一个 token 是什么」的概率。要求模型去执行,等于要求一本书自己翻页。
- 反事实推演:如果让模型把「执行结果」直接写进回答,它只能**编**——「我查过了,02.04 讲工具调用,共 6 章」这句话,和真实查询得到的目录在文本上无法区分,应用也无从验证。幻觉与事实被焊死在同一个句子里,是最危险的情况。
- 因此执行权必须留在应用代码里:应用可以校验参数、限制范围、记录日志、失败重试。把「声明」与「执行」分开,是安全与可控的前提(权限细节在 06 章展开)。

| 维度 | 模型直接「执行」(把结果写进回复) | 模型声明 + 应用执行 |
|---|---|---|
| 结果来源 | 无法区分真实与编造 | 执行结果可核对、可复现 |
| 出错时 | 模型继续圆谎 | 应用捕获异常,把错误回填给模型 |
| 副作用控制 | 无任何闸门 | 应用在调用前拦截、加权限 |
| 审计 | 无痕迹 | 每次调用都有参数与结果日志 |

## 3. 作用:Function Calling 在 Agent 循环里的位置

- 呼应 02.01 的 05 章与 02.03 的 03 章:ReAct 循环是 Thought→Action→Observation→…。function calling 不改变这个循环,它只是把 **Action 槽位从自由文本换成受 schema 约束的 JSON**,把 Observation 槽位交给应用回填的 `tool` 消息。从 ReAct 的视角看,function calling 是「结构化的 ReAct Action」。

```
① 应用把工具清单(tools,含 schema)随消息一起发给模型
        │
        ▼
② 模型决策:输出 tool_calls(name + arguments);不需要工具则直接给文本
        │ 有 tool_calls
        ▼
③ 应用执行:json.loads(arguments) → 校验 → 调用真实函数
        │
        ▼
④ 结果以 role:"tool" 回填上下文,再请求模型 → 回到②
```

- 这段闭环与 02.03 的 ReAct 循环同构,只是动作与观察都以结构化消息传递。工具返回的内容和用户消息一样**不可信**,要按 01.04 的口径对待(06 章展开);function calling 本身只解决「格式可靠」,不解决「内容可信」。

## 4. 详细介绍:一次 Function Calling 的完整闭环

### 4.1 四步闭环拆解

| 步骤 | 谁执行 | 发生什么 |
|---|---|---|
| ① 声明 schema | 应用 | 把每个工具的 JSON schema 放进 `tools` 参数随请求发出 |
| ② 模型决策 | 模型 | 读用户问题与工具描述,输出 tool_calls(name + arguments),或直接回答 |
| ③ 应用执行 | 应用 | `json.loads` 解析 `arguments`,校验后调用真实函数(数据库、API、计算) |
| ④ 结果回填 | 应用 | 以 `role: "tool"` 追加结果,再次请求模型,直到它不再声明调用 |

- 值得注意的细节:模型携带 `tool_calls` 时同一条消息的 `content` 通常为 `null`;一次回复可含**多个** `tool_calls`(并行调用),应用逐张执行、逐张回填。`tool_choice` 控制决策自由度:`auto`(默认,模型自己判断)、`none`(禁用工具)、`required`(必须调用)、或指定工具名(强制调用)。

### 4.2 最小可运行闭环

```python
import json
from openai import OpenAI

client = OpenAI()  # 需要 OPENAI_API_KEY;也可传 base_url 指向 01.04 部署的兼容服务

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_course",
            "description": "按模块编号检索课程目录,返回模块主题与章节清单",
            "parameters": {
                "type": "object",
                "properties": {
                    "module_id": {
                        "type": "string",
                        "description": "课程模块编号,例如 02.04"
                    }
                },
                "required": ["module_id"],
            },
        },
    }
]

COURSE_INDEX = {"02.04": "Tool Use and Protocols:Agent 的手;6 章,从 function calling 讲到权限边界。"}


def search_course(module_id: str) -> str:  # 应用侧真实执行:查本地目录
    return COURSE_INDEX.get(module_id, "未收录该模块")


def run_once(user_text: str, max_steps: int = 3) -> str:
    messages = [{"role": "user", "content": user_text}]
    for _ in range(max_steps):
        msg = client.chat.completions.create(
            model="gpt-4o-mini", messages=messages, tools=TOOLS
        ).choices[0].message
        messages.append(msg)                # 保留助手消息(含 tool_calls)
        if not msg.tool_calls:              # 没有调用声明 → 这就是最终回答
            return msg.content
        for call in msg.tool_calls:         # 模型只声明,应用此刻才真正执行
            module_id = json.loads(call.function.arguments)["module_id"]
            messages.append({"role": "tool", "tool_call_id": call.id,
                             "content": search_course(module_id)})  # 凭编号回填
    return "已达最大轮次,停止"


if __name__ == "__main__":
    print(run_once("02.04 这门课讲什么?有几章?"))
```

- 代码里最容易漏的一步是 **④ 回填**:如果应用执行完不把 `role: "tool"` 的消息追加回去,模型就看不到观察,只能继续声明调用或凭空作答。回填后模型才能「基于事实说话」。

### 4.3 与 ReAct 文本协议的对比

| 维度 | ReAct 文本协议(02.01/02.03) | Function Calling |
|---|---|---|
| Action 格式 | 自由文本,如 `Action: Search[02.04]` | JSON:`{"name": ..., "arguments": {...}}` |
| 解析方式 | 正则/关键字匹配,易碎 | 应用按 schema 直接解析,可靠 |
| 参数约束 | 无,靠模型自觉 | 生成时受 JSON schema 引导,可选 strict 强约束 |
| 依赖条件 | 任意文本模型可用 | 需要模型支持 tools(微调/对齐过) |

- 文本协议的优势是**通用**:本地小模型或老模型没有 function calling 能力时,02.01 的 05 章那样用文本 Action 也能搭出 Agent;function calling 则把这份「约定」内置进了模型与 API。两者不是取代关系,而是同一循环在不同模型能力下的两种实现。

## 5. 动手活动:课程助教第一次「查了再答」

> [!example] 动手活动:跑通 search_course 工具闭环
>
> **目标**:产出并运行 `tool_loop.py`,让课程助教对「02.04 讲什么」先调用工具、再基于返回内容作答。
>
> **步骤**:
> 1. 在可用的 OpenAI 兼容端点(01.04 部署的服务或云端 API,需支持 tools)上运行 4.2 的 `tool_loop.py`,并在每轮 `create` 后打印 `msg.tool_calls`,观察模型「先声明、后回答」的两段式输出;
> 2. 追问目录外的模块编号(如 `09.09`),并重跑 `tool_choice: "none"` 的对照问题,观察「未收录」时模型不编造、禁用工具时直接作答的差异;
> 3. 把两个问题的完整消息序列(含 tool_calls 与 tool 回填)存成 `reports/tool-loop-log.jsonl`。
>
> **完成标准**:日志里能清楚看到「用户问题 → tool_calls 声明 → 应用执行 → tool 回填 → 最终回答」五个环节;未收录模块时模型没有编造内容;能说出 `tool_choice` 为 `none` 时模型为何直接作答。

## 6. 边界与排错

- **只管格式,不管对错**:function calling 保证「调用声明是合法 JSON」,不保证「选对了工具、填对了语义」。选错工具要靠工具描述(02 章),参数越界要靠应用校验(02 章)。
- **不设权限、不防注入**:模型可能被诱导去调用危险工具或伪造参数,function calling 本身没有闸门(06 章);工具返回的内容也要按不可信输入处理(01.04)。
- **依赖模型能力**:模型不支持 tools 时会忽略参数或报错,此时退化为文本协议(4.3)或换模型。
- 常见排错:① `arguments` 是 JSON 字符串,忘 `json.loads` 会得到字符串而非字典;② 忘回填 `tool` 消息,模型会反复要求调用或开始编造;③ 忘记 `tool_call_id` 或对不上号,API 会拒绝;④ 循环没设最大步数,模型可能无限调用工具(呼应 02.03 的 05 章防死循环)。

## 7. 总结

| 概念 | 一句话 |
|---|---|
| Function Calling | 模型输出「调 X、参数 Y」的结构化声明,执行在应用侧 |
| 为什么分开 | 模型是文本生成器;执行权在应用才可验证、可控、可审计 |
| 闭环 | 声明 schema → 模型决策 → 应用执行 → 结果回填 → 继续或收尾 |
| 与 ReAct | 同一循环,Action/Observation 槽位被 JSON 结构化 |
| 边界 | 不保证选对工具、不设权限;工具返回不可信 |

**思考题**:让模型直接说「已查到:02.04 讲工具调用」,和走完一轮 function calling 再回答,差别在哪?为什么说 function calling 没有改变 Agent 循环本身?

> [!note] 参考答案
> 前者是模型自报「查过了」,应用无法区分真查询与编造,幻觉与事实混在一起;后者有真实的执行记录与可回填的结果,出错可重试、行为可审计。function calling 只是把 ReAct 的 Action 槽位与 Observation 槽位结构化、格式化了,「决策→执行→观察→再决策」的循环骨架与 02.01/02.03 完全一致——它让循环更可靠,但没有创造新的循环形态。

## 引用

- [OpenAI:Function calling guide(工具定义与调用循环)](https://developers.openai.com/api/docs/guides/function-calling)
- [OpenAI:Structured Outputs(strict 模式与 schema 强约束)](https://developers.openai.com/api/docs/guides/structured-outputs)
- [Anthropic:Tool use(函数调用)文档](https://platform.claude.com/docs/en/tools)

上一篇:02.03 Planning and Reasoning 的末篇「06 规划评测与预算」——评测告诉你规划值不值,而任何规划都要靠执行兑现;从本章起,课程助教长出了「手」。

下一篇:[工具定义与校验](/ai/02-agents/04/03/)——模型会递调用单了,单子上的工具怎么写才能让模型选得准、应用接得住?下一章定义课程助教的工具与校验层。
