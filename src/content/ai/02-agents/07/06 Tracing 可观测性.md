---
title: "Tracing 可观测性"
number: "02.07.06"
chapter: 2
chapterTitle: "Agents"
section: 7
sectionTitle: "Evaluation and Observability"
group: ""
created: 2026-09-03 05:20
author: "iopanda"
tags: ["course", "ai-agent", "agent-evaluation"]
sourceId: "3.10.2.7 Evaluation and Observability/05 Tracing 可观测性"
---
# Tracing 可观测性

> 04 章请来的裁判,读的是「任务 + 期望路径 + 带步号的轨迹」——可你有没有发现,这些轨迹一直是我们**手工誊写**的:真实课程助教跑起来是个黑盒,只在终端留下一句最终回答。它到底先查了讲义还是先翻了档案?检索返回了什么?哪一步最贵?没有记录,02 章的轨迹标注、03 章的任务级判定、04 章的裁判全都成了「无米之炊」。本章是 02.07 的倒数第二章,给 Agent 装上记录仪:**tracing**——把一次任务的完整链路(每步思考、每次工具调用、每段观察、每次 LLM 生成及其 token 与耗时)落成结构化日志,并对比 Langfuse、LangSmith 与自建 JSONL 三条路,最后亲手重放一条失败任务、指认失败步。

**学习目标**:学完本章,你将能够——

1. 说出 trace 与普通服务日志的区别:一次任务一棵「事件树」,事件带父子与阶段语义;
2. 默写 trace 记录字段表(step/类型/工具/参数摘要/结果摘要/token/耗时)并照表埋点;
3. 对比 Langfuse、LangSmith、自建 JSONL 的取舍,为项目选一条路;
4. 运行结构化日志 Demo,从 `traces/traces.jsonl` 重放出完整链路;
5. 用重放分析指认失败步(冗余调用、副作用写、编造引用),并说出 trace 的脱敏与成本边界。

## 1. 概念:一次任务一棵「事件树」

- **tracing(链路追踪)**:把 Agent 处理一个任务的**完整过程**按树形结构记录下来——树根是一次任务(trace),树枝是任务里的各个阶段(span),叶子是具体的 LLM 生成(generation)。呼应 02.01 的运行循环:循环里的「思考 → 工具调用 → 观察」每一圈都是一条树枝。
- 与 02 章的步类型一一对应:thought(思考)、tool_call(工具调用,即 action)、observation(观察结果)、answer(最终回答)在 trace 里各是一类事件;04 章裁判看到的「带步号轨迹转写」,本质就是 trace 的**文本导出**。课程助教的一条 trace 长这样:

```text
answer_question(根 = trace)          任务:「第 3 章讲窗口函数吗?」
├─ span: 检索讲义                    search_material(query="窗口函数")
│    └─ generation: 读命中文本        LLM 调用(token/耗时/费用记在此)
├─ span: 读学员档案                  get_learner_profile(id="L-1001")
└─ span: 生成最终回答                LLM 调用,输出「……见 3.5 节」(编造?)
```

- 每个事件都记:输入摘要、输出摘要、耗时、token(与估算费用)、错误。**trace 不是给人读的散文,是可回放、可查询、可重算的结构化数据**——这是它与普通日志的本质区别。

## 2. 为什么需要:黑盒循环里,最后一步最显眼、最不是病因

| 没有 trace 的症状 | 例子 |
|---|---|
| 归因靠猜 | 助教答错,是检索词错、档案读错还是提示没写清?五个嫌疑犯(01 章)一个证据都没有 |
| 无法复现 | Agent 带随机性,同样的任务第二次跑结果可能不同,「现场」稍纵即逝 |
| 看不见过程 | 绕远路、重复检索只体现在账单上,代码里没有任何痕迹 |
| 副作用无审计 | 谁在几点几分把学员档案写脏了?没记录就只能查 SQLite 的最后写入时间 |
| 成本无归属 | 哪一步烧掉了 80% 的 token?凭感觉猜 |

- 05 章的 trace 正是 01 章那张五层归因表里「重放轨迹逐步核对」要用的记录:上一步的错误输出是下一步的输入,没有 trace 就只能从终态倒推,而终态把中间过程全抹平了。

## 3. 作用:评测与排障的公共数据源

```text
课程助教每次运行 ──埋点──> trace(结构化链路)
                              ├─> 02 章:轨迹标注与无效步统计(规则,便宜)
                              ├─> 03 章:任务级判定消费最终结果
                              ├─> 04 章:导出带步号转写喂裁判;超窗先做阶段摘要
                              └─> 06 章:回归评测每次改动都重跑、对比新旧 trace
```

- 前四章的所有评测方法都假设「轨迹拿得到」,本章把这条假设变成工程现实:埋点一次,标注、裁判、回归全部复用同一份数据;
- 呼应 01.04 的 07 章运维纪律:服务日志管「服务活着没有」(请求 ID、耗时、错误码),trace 管「这次任务内部怎么走的」,两者互补,字段同样要克制、要脱敏。

## 4. 详细介绍:记录字段、三方案选型与接入示例

### 4.1 记录字段:一条事件一行

| 字段 | 记什么 | 课程助教示例 |
|---|---|---|
| trace_id | 一次任务的唯一 ID(可关联 03 章任务与 04 章裁判结果) | `a1b2c3d4` |
| step | 事件在链路内的序号,供裁判理由引用 | `5` |
| type | 事件类型:thought / tool_call / observation / answer | `tool_call` |
| tool | 工具名(非工具事件为空) | `search_material` |
| params | **参数摘要**,脱敏后写入(见 6 节) | `{"query": "窗口函数"}` |
| result | 结果摘要:命中数、关键字段,不存原始全文 | `无命中` |
| tokens | 该步消耗的 token(LLM 相关事件才有) | `90` |
| ms | 该步耗时(毫秒) | `140` |
| ts | 时间戳,配合 trace_id 可对齐多用户并发 | `2026-09-03T10:12:31` |

- **字段齐全度直接决定裁判可信度**:04 章裁判要判「能否回指讲义」,trace 里就必须有 observation 的结果文本;只记「调用了 search_material」而不记返回了什么,裁判只能靠猜。

### 4.2 三个方案怎么选

| 维度 | Langfuse | LangSmith | 自建 JSONL |
|---|---|---|---|
| 形态 | 开源(可自托管),也有云服务 | LangChain 出品的闭源 SaaS | 自己写,零依赖 |
| 接入方式 | Python/JS SDK、`@observe` 装饰器、OpenAI 兼容客户端即插即用 | 与 LangChain 生态深度集成,`LANGSMITH_TRACING=true` 自动埋点 | 自己定义 schema 与写入时机 |
| 看板 | 有:trace 树、耗时瀑布、token 成本、评分面板 | 有:trace 树、数据集与在线评测 | 无 UI,自己写重放/分析脚本 |
| 适用 | 想自托管或平台中立、要开源可控 | 主力栈是 LangChain,要最低接入成本 | 教学、内网隔离、数据不出域 |
| 代价 | 自托管要维护服务;云服务按量付费 | 数据在第三方;迁移成本 | 没有检索与可视化,分析全靠手写 |

- 选型一句话:**要省心跟生态走 LangSmith,要开源可控选 Langfuse,要绝对可控或只做教学就用 JSONL**;本章动手走第三条,因为它把 trace 的本质(字段、写入、重放)暴露得最干净,换成前两条只是换一个写入器。

### 4.3 平台接入示例:Langfuse 与 LangSmith

```python
# langfuse_trace.py —— 最小 Langfuse 接入:装饰器埋点 + OpenAI 兼容客户端自动入 trace
# 安装: pip install langfuse;密钥环境变量: LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY / LANGFUSE_BASE_URL(自托管填自己地址,默认云服务 https://cloud.langfuse.com)
from langfuse.decorators import observe      # 最外层被装饰函数 = 一条 trace
from langfuse.openai import openai           # 用它发请求,调用自动成为子 generation

@observe(name="search_material")             # 嵌套的被装饰函数自动成为子 span
def search_material(query):
    return ["3.2 节:WHERE 过滤行,HAVING 过滤组"]

@observe(name="answer_question")
def answer_question(task):
    hits = search_material(task)
    return openai.chat.completions.create(   # langfuse.openai:模型/token/耗时自动记录
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": f"{task}\n资料:{hits}"}],
    ).choices[0].message.content
```

```python
# langsmith_trace.py —— 最小 LangSmith 接入:环境变量开启自动追踪 + 装饰器命名
# 安装: pip install langsmith;环境变量: LANGSMITH_TRACING=true / LANGSMITH_API_KEY / LANGSMITH_PROJECT
import os
os.environ.setdefault("LANGSMITH_TRACING", "true")   # 全局开关:内部 LangChain 调用自动入 trace
os.environ.setdefault("LANGSMITH_PROJECT", "course-ta")

from langsmith import traceable

@traceable(name="search_material")
def search_material(query):
    return ["3.2 节:WHERE 过滤行,HAVING 过滤组"]

@traceable(name="answer_question")
def answer_question(task):
    hits = search_material(query=task)               # 真实项目在这里调 LLM,同样被记录
    return f"命中 {len(hits)} 条,详见讲义 3.2 节。"
```

- 两个平台的 SDK 都是**异步批量上报**:进程退出前要等发送完成(各自提供 flush/等待机制),否则最后几步可能丢;两个平台也都允许给 trace 打 tag 与评分,评分接口正好接 06 章回归。

## 5. 动手活动:结构化日志 + 重放失败任务

> [!example] 动手活动:给课程助教加 trace,重放并指认失败步
>
> **目标**:产出 `traces/traces.jsonl`(每次运行追加一条完整 trace)与 `reports/replay-failure.md`(重放分析报告)。
>
> **步骤**:
> 1. 通读脚本:`TraceRecorder` 负责把事件写成一行 JSONL(字段同 4.1 表),`run_failed_task` 模拟课程助教跑一个失败任务并逐事件埋点,`analyze` 是重放分析器;
> 2. 运行 `python trace_agent_demo.py`,连跑两次,观察 `traces/traces.jsonl` 如何按 trace_id 追加两条链路;
> 3. 对照终端重放输出,把问题清单里的三条(重复调用、副作用写、编造引用)抄进 `reports/replay-failure.md`,回答:失败步是第几步?病因最早能追溯到第几步?
>
> **完成标准**:JSONL 每条含 4.1 表的全部字段;重放分析能指出 step5 与 step2 参数相同(冗余)、写档案事件(副作用风险)、回答引用了观察结果里不存在的「3.5 节」(疑似编造);报告写清「最后一步是表象,病因在检索无命中仍不换招」。

```python
# trace_agent_demo.py —— 自建结构化 trace:记录 + 重放 + 指认失败步(离线可跑)
# 输出:traces/traces.jsonl(每次运行追加一条 trace);终端打印重放与问题清单
import json, os, re, time, uuid

TRACE_DIR = "traces"
TRACE_FILE = os.path.join(TRACE_DIR, "traces.jsonl")

class TraceRecorder:
    """把一步事件写成一行 JSONL;字段与 4.1 记录字段表一一对应"""
    def __init__(self):
        self.trace_id = uuid.uuid4().hex[:8]          # 一次任务一条 trace
        os.makedirs(TRACE_DIR, exist_ok=True)
    def record(self, step, kind, tool, params, result, tokens, ms):
        line = {"trace_id": self.trace_id, "step": step, "type": kind,
                "tool": tool, "params": params, "result": result,
                "tokens": tokens, "ms": ms, "ts": time.strftime("%Y-%m-%dT%H:%M:%S")}
        with open(TRACE_FILE, "a", encoding="utf-8") as fh:   # 演示逐条追加;生产用批量缓冲
            fh.write(json.dumps(line, ensure_ascii=False) + "\n")

def run_failed_task(rec):
    n = 0
    def emit(kind, tool="", params="", result="", tokens=0, ms=0):
        nonlocal n
        n += 1
        rec.record(n, kind, tool, params, result, tokens, ms)
    emit("thought", result="先查讲义里有没有窗口函数")
    emit("tool_call", "search_material", '{"query": "窗口函数", "chapter": "第3章"}', tokens=90, ms=140)
    emit("observation", result="无命中")
    emit("thought", result="没查到?换个说法再搜一次")
    emit("tool_call", "search_material", '{"query": "窗口函数", "chapter": "第3章"}', tokens=90, ms=130)
    emit("observation", result="仍无命中")                     # 与 step2 同参数 = 冗余
    emit("thought", result="先看学员档案,顺手记录学习进度")
    emit("tool_call", "get_learner_profile", '{"learner_id": "L-1001"}', tokens=40, ms=60)
    emit("observation", result="零基础学员")
    emit("tool_call", "save_learner_profile", '{"learner_id": "L-1001", "learned": "窗口函数"}', tokens=40, ms=50)   # 任务并未要求写档案
    emit("observation", result="已写入")
    emit("answer", result="第 3 章 3.5 节介绍了窗口函数,适合零基础学习。")       # 讲义无此内容

def load_trace(trace_id=None):
    with open(TRACE_FILE, encoding="utf-8") as fh:
        rows = [json.loads(line) for line in fh if line.strip()]
    return rows if trace_id is None else [r for r in rows if r["trace_id"] == trace_id]

def replay(rows):
    print(f"\n== 重放 trace {rows[0]['trace_id']} 共 {len(rows)} 个事件 ==")
    for r in rows:
        what = r["tool"] if r["tool"] else r["result"]
        print(f"step{r['step']:<3} {r['type']:<12} tok={r['tokens']:<4} ms={r['ms']:<5} {what[:40]}")

def analyze(rows):
    issues, first_seen = [], {}
    for r in rows:
        if r["type"] == "tool_call":
            key = (r["tool"], r["params"])
            if key in first_seen:
                issues.append(f"step{r['step']}:与 step{first_seen[key]} 相同参数的重复调用 → 冗余(两次都无命中仍不换招)")
            else:
                first_seen[key] = r["step"]
        if r["tool"].startswith("save"):
            issues.append(f"step{r['step']}:写类工具 {r['tool']} 被调用,须核对任务是否需要"
                          f" → 副作用风险(04 章 safety 维同样扣分)")
    obs = " | ".join(r["result"] for r in rows if r["type"] == "observation")
    ans = next(r for r in rows if r["type"] == "answer")
    for cite in re.findall(r"第\s*\d+\s*章\s*\d+(?:\.\d+)?\s*节", ans["result"]):
        if cite not in obs:
            issues.append(f"step{ans['step']}:引用「{cite}」未出现在任何观察结果 → 疑似编造")
    return issues

def main():
    rec = TraceRecorder()
    run_failed_task(rec)
    rows = load_trace(rec.trace_id)
    print(f"已追加 trace_id={rec.trace_id} 到 {TRACE_FILE}")
    replay(rows)
    issues = analyze(rows)
    print("\n== 重放分析 ==")
    for issue in issues or ["未发现结构性问题"]:
        print("- " + issue)
    print(f"\n合计 tokens={sum(r['tokens'] for r in rows)} 耗时={sum(r['ms'] for r in rows)}ms")
    print("结论:最后一步(编造 3.5 节)是表象;病因最早可追溯到 step2~step5 检索无命中仍重复尝试。")

if __name__ == "__main__":
    main()
```

## 6. 边界与排错:别把 trace 当评测

- **脱敏纪律(呼应 01.04 的 07 章)**:params 记「检索词、ID」这类定位所需字段,不记整段用户提问与讲义原文;学员名等个人信息进 trace 前先脱敏或只记 ID——trace 里每多存一个字,泄露面就大一分;
- **trace ≠ 指标**:trace 是「数据」,02 章的无效步占比、03 章的完成率要**另写统计脚本**在 trace 上算;看到一条漂亮 trace 不等于任务成功(编造回答的链路可能全程无异常,01 章已强调);
- **写入成本与丢尾巴**:每条事件一次磁盘 IO 会拖慢 Agent,生产上要异步批量、按需采样(如 1/10 任务);异步上报与缓冲写入都可能丢最后几步——进程退出前务必 flush,排查「trace 少了几步」先怀疑这里,别怀疑 Agent;
- **trace 会累积隐私与费用**:JSONL 只增不减,记得轮转(按天/按大小)与保留期策略,呼应 01.04 的日志生命周期。

## 7. 总结

| 概念 | 一句话 |
|---|---|
| tracing | 一次任务一棵事件树:根=trace,枝=span,LLM 调用=generation |
| 为什么需要 | 黑盒循环里失败要归因,先得有「办案记录」;最后一步最显眼、最不是病因 |
| 记录字段 | trace_id/step/type/tool/参数摘要/结果摘要/token/ms/ts,照表埋点 |
| 三方案 | Langfuse(开源可自托管)/ LangSmith(跟 LangChain 生态)/ 自建 JSONL(零依赖可控) |
| 与评测关系 | 02 标注、04 裁判、06 回归的数据源;裁判的带步号转写 = trace 导出 |
| 边界 | 脱敏、异步 flush、采样、轮转;trace 是数据不是指标 |

**思考题**:04 章裁判提示词里的「带步号轨迹转写」,在真实项目里应该由谁产出?如果 trace 只记了工具调用、没记 observation 的结果文本,裁判还能可靠地判「编造」吗?

> [!note] 参考答案
> 应由 trace 自动导出(重放或导出器),而不是像演示那样手工誊写——手工誊写既慢又会悄悄「修正」现场,失去评测意义。没记观察文本,裁判无法把回答回指到讲义命中内容,「是否可回指讲义」这一锚点(04 章 4.1)直接失效,编造很容易漏判;所以 4.1 表里 result 字段不是可选项——字段齐全度决定裁判可信度,也决定 06 章回归能不能抓到「改坏了」。

## 引用

- [Langfuse 官方文档:Get Started(密钥配置、OpenAI SDK 即插即用、自托管与云)](https://langfuse.com/docs/get-started)
- [LangSmith 官方文档:Tracing LangChain 应用(LANGSMITH_TRACING 环境变量与项目隔离)](https://docs.smith.langchain.com/observability/how_to_guides/trace_with_langchain)
- [OpenTelemetry:Traces 概念(span/trace 树与链路语义的标准出处)](https://opentelemetry.io/docs/concepts/signals/traces/)

上一篇:[LLM 裁判评轨迹](/ai/02-agents/07/05/)——裁判读的「办案记录」不该手工誊写;本章装上记录仪:没有完整 trace,轨迹级、任务级、裁判全是无米之炊。

下一篇:[回归评测与开发循环](/ai/02-agents/07/07/)——有了可重放的 trace 与整套指标,06 章把它们装进 pytest:每次改动自动重跑,「修好一个坏十个」在合入前就被拦下。
