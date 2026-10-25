---
title: "Graph、Durable Execution 与工程化升级"
number: "03.01.34"
chapter: 3
chapterTitle: "Frameworks"
section: 1
sectionTitle: "Agent Frameworks"
group: "05 PydanticAI"
created: 2026-09-03 15:12
author: "iopanda"
tags: ["course", "ai-agent", "framework", "pydantic-ai", "graph", "durability"]
sourceId: "3.10.3.1 Agent Frameworks/05 PydanticAI/02 Graph、Durable Execution 与工程化升级"
---
# Graph、Durable Execution 与工程化升级

> [上一章](/ai/03-frameworks/01/33/)讲的是 PydanticAI 如何先稳住类型、依赖和输出契约；这一章讲它如何继续向复杂系统升级。很多人误以为 PydanticAI 只是“typed output 比较好的 Agent SDK”，但只要继续往文档和源码里看，就会发现它并没有停在单 Agent：`_agent_graph.py` 把 agent run 写在 graph 运行模型上，官方 docs 单独讨论 graph、multi-agent applications、durable execution，并明确支持 Temporal、DBOS、Prefect、Restate 等 durable backends。[1][2][3][4] 更有意思的是，它对 graph 的态度非常克制：不是鼓励你一上来就上最复杂抽象，而是强调复杂度应该按需升级。[2] 这背后是一套很成熟的工程哲学。

**学习目标**：学完本章，你将能够——

1. 解释为什么 PydanticAI 既提供 graph/durability，又不把它们当默认入口；
2. 说出 `_agent_graph.py` 暗示的运行模型与 `run.py` 暗示的执行接口；
3. 理解 usage limits、event stream、graph run、durable sleep 等设计为什么重要；
4. 比较它与 [LangGraph](/ai/03-frameworks/01/03/) 在 graph 设计态度上的差异；
5. 判断一个 typed Agent 什么时候该升级成 graph / durable system。

## 1. graph：为什么它在这里是“高级能力”，不是“默认世界观”

PydanticAI 的 graph 文档态度非常鲜明，甚至带点反劝退：graph 很强，但也更重，不要为了酷去用；先考虑别的 multi-agent approaches，再决定是否需要 graph。[2]

这段态度本身就很重要。它说明 PydanticAI 的工程哲学是：
- 先用简单抽象解决简单问题；
- 只有复杂度真的压上来，才升级到 graph；
- 框架不该鼓励开发者一上来就过度工程化。

这与某些图框架截然不同。PydanticAI 并不否认 graph 的价值，而是把它放在**复杂度管理路径**里，而不是起点上。

## 2. `_agent_graph.py`：为什么说它其实一直把 Agent 当图来运行

虽然对外不要求你一开始就画 graph，但从 `_agent_graph.py` 可以清楚看出，PydanticAI 的运行模型内部已经高度图化。[3]

几个关键信号：
- 直接依赖 `pydantic_graph` 的 `BaseNode`、`Graph`、`GraphBuilder`、`GraphRunContext`；
- 定义 `GraphAgentState`、`GraphAgentDeps`；
- 处理 event stream、tool calls、history processor、cancellation、continuation；
- 明确存在 `EndStrategy`，决定结果与工具调用如何协调结束。

这说明它的内部世界观其实是：
- Agent run 不是一个线性函数；
- Agent run 是节点驱动、可中断、可流式、可组合的执行图；
- 只是框架选择不把这套复杂度过早暴露给每个普通用户。

这是一种很成熟的产品取舍：**内部足够强，外部默认足够轻。**

## 3. `run.py` 与 `iter()`：为什么它把步骤级消费暴露出来

从搜索结果和 `abstract.py` 可以看出，PydanticAI 不只是给你最终结果，还允许通过 `iter()`、`run_stream_events()` 这类接口按节点和事件观察整个 run。[4]

这说明它已经认真面对两个现实：

1. 复杂 Agent 需要被观测，而不只是被调用；
2. 工程团队需要的不总是“最终答案”，还包括：
   - 过程事件；
   - tool 调用；
   - usage；
   - 节点级排错；
   - cancellation 与 teardown 语义。

这也解释了为什么它能自然衔接更强的 graph 与 durability：它的运行接口从一开始就不是“只有一个同步 return”。

## 4. durable execution：为什么它直接支持多种 backend

官方 durable execution 文档明确列出：Temporal、DBOS、Prefect、Restate，并说明 durable agents 可以跨 transient API failures、application restarts、long-running asynchronous and human-in-the-loop workflows。[1]

这件事有三层意义：

1. PydanticAI 承认 Agent 终将进入工作流可靠性世界；
2. 它不想把 durability 绑定到单一平台；
3. 它希望开发者能在熟悉的 Agent API 之上，逐步接入更重的可靠执行引擎。

这和很多“先写一个 Agent，再另想怎么上 Temporal”的松散路线完全不同。PydanticAI 是提前为这一升级留了接口。

## 5. durable sleep / continuation：为什么这些细节特别工程化

`_agent_graph.py` 中有一个很能体现品味的设计：`set_agent_graph_sleep()`，允许 durable frameworks 替换默认的 `asyncio.sleep`，使等待逻辑也能适应可恢复工作流。[3]

这类细节非常能说明一个框架是否真的考虑过生产运行：
- 普通 demo 只管“能 sleep”；
- 可恢复工作流要管“sleep 之后怎么 replay、怎么不浪费活动时间”。

还有 continuation、stream interruption state 这些处理，也说明框架在认真考虑：
- 流式输出中断怎么办；
- 工具和输出同时发生时怎么定最终结果；
- 取消是否真的能传递到整个 run tree。

这不是文档 marketing，而是底层运行时在认真处理现实复杂度。

## 6. usage limits：为什么成本控制应被当成框架能力

PydanticAI 的 multi-agent docs 明确提到 `UsageLimits`，包括 `cost_limit`、`request_limit`、`total_tokens_limit`、`tool_calls_limit`。[4]

这意味着它非常清楚 Agent 系统一个常被忽略的问题：**系统不是只会错，还会烧钱。**

尤其在：
- delegate agents
- multiple models
- graph-based control flow
- tool-heavy runs
这些场景里，成本和重试预算必须成为运行时一等能力，而不是上线后再看账单的运维问题。

这也是为什么它对开发者和架构师都很有吸引力：它把“成本也是行为边界”这件事收进了框架词汇表。

## 7. 和 LangGraph 的关系：都重 graph，但起手式完全不同

| 框架 | graph 的地位 | 对开发者的默认引导 |
|---|---|---|
| LangGraph | graph 是主入口 | 一上来就用状态图思考 |
| PydanticAI | graph 是高级升级路径 | 先用 typed agent，复杂度上来再升级 |

这意味着两者并不互斥，而是代表两种团队心智：
- 如果你从 Day 1 就知道自己面对的是复杂控制流系统，LangGraph 更直达；
- 如果你先要把单 Agent 工程边界做好，再逐步长出 graph，PydanticAI 更自然。

## 8. 为什么这种渐进升级路线很适合真实团队

真实团队的问题常常不是“缺最强框架”，而是：
- 需求还在变；
- 简单问题不想一开始过度工程化；
- 但又知道未来可能要上更复杂运行模型。

PydanticAI 的路线正好适合这种情境：
1. 先用 typed agent 起步；
2. 再加 capabilities；
3. 再加 event/stream 观测；
4. 真有需要时上 graph；
5. 真跨长时任务与人工环节时上 durable backend。

这不是保守，而是**让复杂度的引入和需求的成熟度同步**。

## 9. 动手活动：给课程助教写一张升级路线图

> [!example] 动手活动：输出 `pydanticai-upgrade-roadmap.md`
>
> **目标**：不是一上来就把课程助教做成最复杂系统，而是写出它的阶段性升级路线。
>
> **步骤**：
> 1. Stage 1：typed output + deps + basic tools；
> 2. Stage 2：加入 usage limits、event stream、capabilities；
> 3. Stage 3：若出现审批流、重试、复杂分支，评估 graph；
> 4. Stage 4：若出现长时任务、异步恢复、人工停顿，评估 durable backend；
> 5. 为每一阶段写“触发升级”的客观信号。
>
> **完成标准**：你能清楚说明“为什么现在不该一步到位上最重方案”，以及“何时应该升级”。

## 10. 边界与排错

- **误区一：既然内部是 graph，就一开始全用 graph。** 这违背了框架自己的复杂度观；
- **误区二：typed agent 就够一辈子。** 当控制流、恢复、人审成为主矛盾时，必须升级；
- **误区三：durability 是部署问题，不是框架问题。** 真正成熟的框架会提前为它留接口；
- **误区四：只盯正确率，不盯成本。** Agent 的失控常常先体现在 usage 上；
- **误区五：把渐进升级理解成功能不全。** 恰恰相反，这是工程克制。

## 11. 总结

| 关键问题 | 一句话 |
|---|---|
| PydanticAI 对 graph 的态度 | graph 很强，但不该过早使用 |
| 内部运行模型是什么 | 实际已高度图化，只是外部默认更轻 |
| durable execution 的意义 | 让 Agent 能跨失败、跨重启、跨人审长时运行 |
| usage limits 的意义 | 把成本与请求预算纳入行为边界 |
| 最适合的团队路线 | 先 typed、再 capability、再 graph、再 durable |

**思考题**：为什么“内部很强，外部默认很轻”会是一种成熟的框架设计？反过来，什么时候这种克制会让人觉得“不如直接用图框架来得痛快”？

> [!note] 参考答案
> 因为多数团队并不是一开始就需要最重的抽象。内部足够强，说明框架能承接未来复杂度；外部默认很轻，说明它不会逼简单问题过度工程化。这种设计能让需求成熟度和系统复杂度同步增长。但如果团队从一开始就明确面对复杂状态图、共享状态聚合、节点级恢复和严格人审流程，那么这种渐进路径可能显得绕，直接采用图为中心的框架会更痛快。

## 引用

- [1] https://raw.githubusercontent.com/pydantic/pydantic-ai/main/docs/durable_execution/overview.md — Pydantic AI durable execution doc
- [2] https://raw.githubusercontent.com/pydantic/pydantic-ai/main/docs/graph.md — Pydantic AI graph doc
- [3] https://github.com/pydantic/pydantic-ai — PydanticAI GitHub
- [4] https://raw.githubusercontent.com/pydantic/pydantic-ai/main/docs/multi-agent-applications.md — Pydantic AI multi-agent applications doc

上一篇：[01 类型系统、依赖注入与输出契约](/ai/03-frameworks/01/33/)——先把单体 Agent 的工程边界立住；本篇继续看它如何向复杂运行时升级。

下一篇：[03 Tools、Capabilities、Usage Limits 与取消语义](/ai/03-frameworks/01/35/)——graph/durable 的升级路径立住后，下一篇继续看它如何把工具、能力、预算和取消做成运行纪律。
