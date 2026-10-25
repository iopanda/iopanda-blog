---
title: "LangGraph"
number: "03.01.03"
chapter: 3
chapterTitle: "Frameworks"
section: 1
sectionTitle: "Agent Frameworks"
group: "01 LangGraph"
created: 2026-09-03 13:20
author: "iopanda"
tags: ["course", "ai-agent", "framework", "langgraph"]
sourceId: "3.10.3.1 Agent Frameworks/01 LangGraph/README"
---
# LangGraph

> 在 [最小 ReAct Agent 实战](/iopanda-blog/ai/02-agents/01/06/) 里，我们已经手写过一个最小 Agent 循环：Thought → Action → Observation，能跑，但也很快暴露出工程问题——状态靠变量临时拼、出错后只能整轮重来、插入人工确认全靠 if/else、长流程一多就不知道自己现在到底在哪一步。LangGraph 的出现，正是为了把这类「会跑但不好管」的 Agent，重写成**显式状态 + 显式节点 + 显式边**的运行图：官方把它定义为一个面向 long-running、stateful agents 的 low-level orchestration framework，强调 durable execution、streaming、human-in-the-loop、persistence 与 memory。[1][6] 这一章要讲的不是 LangGraph 的 API 细节，而是它背后的工程判断：**为什么复杂 Agent 迟早会长成图，以及图为什么比一条长 prompt 链更适合交付。**

**学习目标**：学完本章，你将能够——

1. 用一句话定义 LangGraph，并解释它和高层 Agent SDK 的分工；
2. 说出为什么长流程 Agent 会自然演化为「状态机 / 有向图」；
3. 区分节点、边、共享状态、持久化、人工中断在架构中的不同职责；
4. 解释 LangGraph 与 [CrewAI](/iopanda-blog/ai/03-frameworks/01/18/)、[OpenAI Agents SDK](/iopanda-blog/ai/03-frameworks/01/25/)、[PydanticAI](/iopanda-blog/ai/03-frameworks/01/32/) 的设计中心差异；
5. 为一个需要人审、可恢复、带记忆的课程助教 Agent 画出 LangGraph 风格的执行图。

## 1. 概念：LangGraph 不是“再一个 Agent 库”，而是 Agent 运行时

- 官方定位非常直白：LangGraph 是一个**低层编排框架**，用来构建、管理、部署 long-running、stateful agents；其关键词不是 prompt，而是 orchestration。[1][6]
- 这句话里有三个词最关键：
  1. **low-level**：它不替你规定业务结构，反而要求你自己把节点、状态、路由条件想清楚；
  2. **stateful**：状态不是顺手放在函数局部变量里，而是显式成为系统的一等公民；
  3. **long-running**：默认你构建的不是“一次性对话”，而是可能会跨多步、跨人、跨故障边界的流程。
- 所以它和高层框架的分工应当这样理解：
  - 高层 Agent SDK 解决「怎么快搭起来」；
  - LangGraph 解决「搭起来以后怎么活下去」。
- 官方 README 也明确建议：如果你只是想快速构建 Agent，可以先用 LangChain；只有当你需要 deterministic + agentic workflows 的组合、重度定制、以及精细控制延迟时，才真正需要 LangGraph。[1]

## 2. 为什么需要：复杂 Agent 的真正难点不是“会思考”，而是“可恢复、可插手、可追责”

一个最小 ReAct Agent 在 demo 里通常只要几十行，但真正上线时会撞上四类问题：

1. **步骤一多，控制流变隐形**：任务到底在检索、总结、评审还是等待人工确认？如果这些阶段没有显式建模，排错时只能读日志猜；
2. **中途失败无法断点恢复**：第 7 步调用工具超时，如果系统不知道第 1~6 步的状态是否有效，就只能整轮重来；
3. **人工介入没有固定插槽**：风险高的地方本应暂停，让人看一眼再继续；如果运行时没有 interruption 机制，只能手写大量旁路逻辑；
4. **状态随代码蔓延**：提示词、工具结果、审计信息、用户上下文、审批结果全在不同对象里漂，系统会越来越难维护。

LangGraph 的回答不是「把 prompt 写得更好」，而是换一个问题框架：**把 Agent 看成状态机，而不是一段会递归调用模型的脚本。** 一旦这样看，很多工程动作就清楚了：

- 每一步是一个节点；
- 节点之间的去向是边；
- 整个过程共享一份状态；
- 中断和恢复发生在状态边界上；
- tracing 不再只看 token，而是看状态转移。

这就是为什么很多复杂 Agent 最终都会从 chain 演化到 graph：不是因为图更酷，而是因为**图比隐式循环更容易被人类工程团队理解和治理**。

## 3. 核心抽象：节点、边、状态，比“工具列表”更重要

LangGraph 的设计中心可以压缩成一句话：**先把控制流建模出来，再把 LLM 塞进去。**

| 抽象 | 它回答的问题 | 为什么重要 | 没有它会怎样 |
|---|---|---|---|
| 节点(Node) | 当前这一步在做什么 | 把一个大任务拆成可观测的小阶段 | 所有逻辑混在一个循环里 |
| 边(Edge) | 下一步往哪里走 | 让路由条件显式化 | 分支逻辑埋在 prompt 和 if/else 里 |
| 状态(State) | 整个图共享什么信息 | 让恢复、审计、人工修改成为可能 | 上下文散落四处，无法整体快照 |
| 持久化(Checkpoints) | 中途挂了从哪继续 | 长流程可恢复 | 工具超时就整轮重跑 |
| 中断(Interrupts) | 哪一步必须让人插手 | 高风险动作可控 | 人审只能硬编码到业务外层 |

几个工程判断特别值得记住：

- **节点不是函数分解，而是决策边界分解。** 把「检索文档」和「判断资料是否足够」拆成两个节点，不是为了代码优雅，而是为了让“是否继续检索”这个决策可见、可测；
- **边不是流程图装饰，而是责任边界。** 一条从“风险检查”到“人工复核”的边，意味着系统承认自己在这里不该自动做决定；
- **状态不是缓存，而是事实账本。** 用户问题、检索片段、候选答案、审批结果、最终响应，都应当被视作同一份状态在不同阶段的演化。

从架构师角度看，这种建模的价值非常大：你不再是“写一个智能脚本”，而是在定义一个**可检查的决策系统**。

## 4. 为什么 LangGraph 偏爱图：因为 Agent 真正难的是“混合控制流”

Anthropic 把 Agent 形态分成 workflows 与 agents，并强调能写死的流程尽量写死，不要过早交给模型自由发挥。[24] LangGraph 恰好适合这种混合路线：

- 一部分步骤是**确定性的**：如参数校验、权限检查、缓存命中判断；
- 一部分步骤是**Agentic 的**：如是否继续查、是否改写问题、是否调用另一个专家节点；
- 两者要在一个长流程里混排，且能被恢复、追踪、插入人工判断。

这正是图优于单一“Agent loop”的地方：

- 你可以把确定性节点写成纯函数；
- 把不确定节点写成 LLM 决策；
- 用边表达两者如何拼接；
- 用统一状态承接所有中间产物。

同类框架也都在解决控制流问题，但重心不同：

| 框架 | 先抽象什么 | 设计倾向 |
|---|---|---|
| LangGraph | 图、状态、持久化 | 把复杂运行时显式化 |
| [CrewAI](/iopanda-blog/ai/03-frameworks/01/18/) | 角色团队、任务、流程 | 先搭业务协作，再补执行细节 |
| [OpenAI Agents SDK](/iopanda-blog/ai/03-frameworks/01/25/) | Agent、tools、handoffs、guardrails | 先提供现代 Agent 原语，再由你组合 |
| [PydanticAI](/iopanda-blog/ai/03-frameworks/01/32/) | 类型、输出、依赖、能力(capabilities) | 先稳住工程契约，再上复杂控制流 |
| [AutoGen](/iopanda-blog/ai/03-frameworks/01/11/) | 对话中的角色协作 | 先把多 Agent 协作跑起来 |

所以如果你系统的首要矛盾是**多角色协作建模**，LangGraph 可能不是第一选择；但如果你的首要矛盾是**流程长、分支多、需要恢复和人审**，LangGraph 往往会非常自然。

## 5. LangGraph 的强项，不是“更聪明”，而是“更可交付”

官方把 durable execution、human-in-the-loop、memory、debugging 与 production deployment 全部摆在 Why use LangGraph 一节里，这暴露了它的真实价值观：它关心的不是让模型多说一句，而是让系统少死一次。[6]

### 5.1 Durable execution

- Agent 一旦接工具、记忆、外部审批，就不再是毫秒级函数调用，而是一个会跨失败边界的事务；
- durable execution 的价值不是性能，而是**恢复语义**：系统要知道自己已经完成了什么、哪些步骤可复用、哪些必须重试；
- 这和 [风险评审与发布](/iopanda-blog/ai/01-models/07/05/) 里“上线必须可回滚、可追责”是同一种工程心法：复杂系统先问失败后怎么办，而不是成功时多顺滑。

### 5.2 Human-in-the-loop

- 复杂 Agent 最危险的地方，往往不是回答错一句话，而是做错一个不可逆动作；
- LangGraph 直接把人工中断视作一等能力，说明它默认系统里存在“模型不该独断”的阶段；
- 这与 [护栏与人工复核](/iopanda-blog/ai/01-models/07/04/) 的治理思想完全一致：**高风险动作必须有制度化的停顿点。**

### 5.3 Memory and persistence

- 很多团队最初会把 memory 视作“再接个向量库”；
- 但一旦你需要短期运行状态、长期用户记忆、工具结果缓存、审批记录并存，memory 就不再只是检索，而是状态管理问题；
- LangGraph 把 memory 放进运行时视角里，这很关键：记忆不是外挂，而是控制流的一部分。

### 5.4 Observability

- 没有可视化状态转移，调试复杂 Agent 基本靠猜；
- LangGraph 与 LangSmith 的组合，核心价值不是“有 tracing”，而是**trace 有结构**：你能看见走了哪些节点、为什么拐弯、哪一步时间长、哪一步反复重试。[6]

## 6. 开发者与架构师应该怎么用 LangGraph 去想系统

给课程助教 Agent 画图时，不要先想模型说什么，先想系统要经过哪些决策边界：

1. 用户输入进入后，是先权限检查，还是先上下文改写？
2. 检索资料后，如何判断“证据足够”还是“继续查”？
3. 涉及成绩、隐私、删除请求时，是否切到人工节点？
4. 输出前是否经过 schema 校验和安全过滤？
5. 失败时回到哪个节点，而不是整轮重跑？

你会发现，这个思考方式和普通 prompt 编程完全不同。普通 prompt 编程问的是“怎样把一句话说明白”；LangGraph 式思维问的是：

- 系统有哪些状态？
- 哪些状态转移是确定性的？
- 哪些状态转移需要模型判断？
- 哪些状态转移必须让人确认？
- 每一步失败后回到哪？

这正是架构师最需要的视角：**先设计决策系统，再选择模型填进去。**

## 7. 动手活动：把课程助教 Agent 画成一张图

> [!example] 动手活动：为课程助教设计 LangGraph 风格运行图
>
> **目标**：产出 `langgraph-design.md`，把一个带检索、人工复核、记忆与输出校验的助教 Agent 画成图，并说明每个节点为什么存在。
>
> **步骤**：
> 1. 列出状态字段：`user_query`、`retrieved_chunks`、`risk_level`、`draft_answer`、`approved`、`final_answer`；
> 2. 列出节点：输入清洗、检索、证据充足性判断、答案起草、风险检查、人工复核、输出校验、结束；
> 3. 画边：证据不足回到检索，高风险转人工，人工通过后进输出校验；
> 4. 指出哪些节点是纯代码、哪些节点是 LLM 决策；
> 5. 标出中断与恢复点：人工复核前暂停，工具失败后从最近 checkpoint 恢复。
>
> **完成标准**：另一名开发者只看你的图，就能回答「系统为什么会走到这一步、失败时从哪里继续、哪一步需要人介入」。

## 8. 边界与排错

- **误区一：把 LangGraph 当成“更高级的 prompt chaining”**。错。它真正提供的是显式控制流与状态管理，不是更花哨的 prompt 包装；
- **误区二：小任务也上图**。如果只是一次问答 + 一次工具调用，图的建模成本可能高于收益；
- **误区三：节点切得过细**。每个节点都只做一句话，会把图切成一地碎片；节点应围绕“可观测的决策边界”来划；
- **误区四：状态放太多**。把所有原始上下文都塞进共享状态，会让恢复与可视化负担过重；状态要保留足以恢复和审计的关键事实，而不是无差别堆日志；
- **误区五：有图就以为安全了**。图解决的是可控与可恢复，不自动等于安全；权限、护栏、人工确认依旧要按 [护栏与人工复核](/iopanda-blog/ai/01-models/07/04/) 与 [风险评审与发布](/iopanda-blog/ai/01-models/07/05/) 的纪律外置。

## 9. 总结

| 关键问题 | 一句话 |
|---|---|
| LangGraph 是什么 | 面向 long-running、stateful agents 的低层编排框架 |
| 为什么会需要它 | 长流程 Agent 的真正难点是状态、恢复、人审与追责 |
| 核心抽象 | 节点、边、共享状态、checkpoint、interrupt |
| 它最适合什么 | 复杂、长生命周期、混合确定性与 Agentic 的流程 |
| 与同类差别 | 它首先是运行时/状态机，而不是角色团队或轻量 SDK |

## 10. 本目录笔记导航

1. [01 设计哲学与状态图](/iopanda-blog/ai/03-frameworks/01/04/)
2. [02 持久化、中断、人审与工程落地](/iopanda-blog/ai/03-frameworks/01/05/)
3. [03 MessagesState、ToolNode 与 create_react_agent](/iopanda-blog/ai/03-frameworks/01/06/)
4. [04 Checkpointer、thread_id 与持久化后端选型](/iopanda-blog/ai/03-frameworks/01/07/)
5. [05 Channels、Command、子图与高级控制流](/iopanda-blog/ai/03-frameworks/01/08/)
6. [06 课程助教 Agent 的 LangGraph 架构案例](/iopanda-blog/ai/03-frameworks/01/09/)
7. [07 LangGraph 与 CrewAI、OpenAI Agents SDK、PydanticAI 的深度对比](/iopanda-blog/ai/03-frameworks/01/10/)

**思考题**：如果一个课程助教 Agent 只有「检索课件 → 生成答案」两步，且不涉及写操作、人工复核、跨会话状态，你还会优先用 LangGraph 吗？当流程从 2 步变成 12 步、还要穿过审批与重试时，答案为什么会变？

> [!note] 参考答案
> 两步、低风险、无持久化需求的流程，优先级通常不应是 LangGraph，而应是更轻的工作流或 SDK：建图本身会引入额外心智和样板代码。只有当系统开始跨越多个决策边界——需要显式状态、失败恢复、人工中断、复杂路由——LangGraph 的收益才会快速超过建模成本。换言之，它不是让简单系统更简单，而是让复杂系统不至于失控。

## 引用

- [1] https://github.com/langchain-ai/langgraph — LangGraph GitHub
- [6] https://docs.langchain.com/oss/python/langgraph/overview — LangGraph docs overview
- [24] https://www.anthropic.com/research/building-effective-agents — Anthropic: Building effective agents

上一篇：[03.01 Agent Frameworks](/iopanda-blog/ai/03-frameworks/01/01/)——先有框架地图，再看单个框架的设计中心。

下一篇：[02 AutoGen](/iopanda-blog/ai/03-frameworks/01/11/)——从状态图切到多 Agent 协作：为什么 AutoGen 会把 Agent 系统想成一组彼此通信的角色。
