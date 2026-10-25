---
title: "Agent Frameworks"
number: "03.01.01"
chapter: 3
chapterTitle: "Frameworks"
section: 1
sectionTitle: "Agent Frameworks"
group: ""
created: 2026-09-03 13:27
author: "iopanda"
tags: []
sourceId: "3.10.3.1 Agent Frameworks/README"
---
# Agent Frameworks

> `02 Agents` 已经把 Agent 的底层骨架讲清楚了：模型为什么能行动、上下文如何塑形、规划为什么会跑偏、工具与记忆怎么接、护栏与评测为什么必须外置。接下来 03 不再问「Agent 是什么」，而是问另一个更工程化的问题：**当你真的要把 Agent 做成系统，应该拿什么框架来承载状态、工具、记忆、协作、审计与发布？** `03.01 Agent Frameworks` 就是这张地图：围绕 2026 年 9 月仍然有代表性、且足以影响架构决策的五个框架——[01 LangGraph](/iopanda-blog/ai/03-frameworks/01/03/)、[02 AutoGen](/iopanda-blog/ai/03-frameworks/01/11/)、[03 CrewAI](/iopanda-blog/ai/03-frameworks/01/18/)、[04 OpenAI Agents SDK](/iopanda-blog/ai/03-frameworks/01/25/)、[05 PydanticAI](/iopanda-blog/ai/03-frameworks/01/32/)——拆它们各自的核心抽象、适用边界、架构取舍与迁移含义，帮助开发者与架构师回答「为什么用它，而不是别的」这个真正值钱的问题。[1][2][3][4][5]

**学习目标**：完成本模块后，你将能够——

1. 说出 Agent Framework 在系统里的职责：不是替你发 prompt，而是承载状态、控制流、工具接入、审计与人机边界；
2. 区分五类主流设计路线：图编排、对话协作、角色团队、轻量 SDK、强类型工程化；
3. 解释为什么同样是「做 Agent」，LangGraph、AutoGen、CrewAI、OpenAI Agents SDK、PydanticAI 的设计中心各不相同；
4. 用任务复杂度、错误代价、团队语言栈、可观测与治理要求，为真实项目选框架；
5. 为一个课程助教 Agent 写出「框架选型卡」：为什么选、为什么不选、未来怎么迁移。

## 1. 为什么 03 还要单开一个 Framework 模块

- 在 [最小 ReAct Agent 实战](/iopanda-blog/ai/02-agents/01/06/) 里，你已经能徒手写循环；在 [02.04 Tool Use and Protocols](/iopanda-blog/ai/02-agents/04/01/)、[02.05 Memory and Retrieval](/iopanda-blog/ai/02-agents/05/01/)、[02.07 Evaluation and Observability](/iopanda-blog/ai/02-agents/07/01/) 里，你也知道工具、记忆、评测与 tracing 该怎么接。但**知道部件是什么，不等于知道系统该怎么搭**。
- 手写 Agent 最大的问题不是「能不能跑起来」，而是**跑起来以后怎么继续活下去**：
  - 状态在哪里持久化？
  - 失败后如何恢复？
  - 多 Agent 怎么通信？
  - 工具权限谁来裁决？
  - 人工确认卡在哪一层？
  - 线上问题怎么追根溯源？
- Framework 的价值不在「少写几行代码」，而在**把这些重复而高风险的基础设施提前做成一套有抽象边界的运行时**。你选的不是库，而是一套工程假设。

## 2. 2026-09 的 top 5：为什么是这五个

> [!note] 现实边界
> Agent 生态更新极快。这里的 top 5 不是「永远正确的榜单」，而是按 2026-09 的工程代表性筛出的五条路线：社区采用度、项目活跃度、抽象清晰度、架构辨识度，以及对开发者/架构师的学习价值。[1][2][3][4][5]

| 框架 | 一句话定位 | 设计中心 | 更像什么 | 更适合谁 |
|---|---|---|---|---|
| [LangGraph](/iopanda-blog/ai/03-frameworks/01/03/) | 低层状态图编排框架 | 状态机、可恢复执行、人工中断 | Agent 运行时/编排内核 | 需要强控制、长流程、复杂状态的团队 |
| [AutoGen](/iopanda-blog/ai/03-frameworks/01/11/) | 多 Agent 对话范式先驱 | 角色协作、事件驱动、会话式编排 | 研究与实验框架 | 要理解多 Agent 演化、维护存量系统的人 |
| [CrewAI](/iopanda-blog/ai/03-frameworks/01/18/) | 角色团队 + 工作流自动化 | Crews + Flows 双抽象 | 业务自动化平台 | 要快速落地角色化多 Agent 流程的人 |
| [OpenAI Agents SDK](/iopanda-blog/ai/03-frameworks/01/25/) | 现代轻量 Agent SDK | tools、handoffs、guardrails、sessions、tracing | 一体化应用 SDK | 需要快接入现代 Agent 能力栈的产品团队 |
| [PydanticAI](/iopanda-blog/ai/03-frameworks/01/32/) | 强类型 Python Agent 工程栈 | 类型、安全边界、依赖注入、可测试性 | AI 版 FastAPI + typed runtime | Python 后端团队、重工程纪律的团队 |

补充判断：

- [AutoGen](/iopanda-blog/ai/03-frameworks/01/11/) 在 2026 年官方已明确进入 maintenance mode，并建议新用户转向 Microsoft Agent Framework；它仍然值得进 top 5，不是因为它最适合绿地新项目，而是因为它定义了 2023~2026 年多 Agent 协作的很多讨论方式，理解它有助于理解后续框架为什么会这样演化。[2][7][10]
- [LangGraph](/iopanda-blog/ai/03-frameworks/01/03/) 与 [PydanticAI](/iopanda-blog/ai/03-frameworks/01/32/) 都很强调控制流，但前者优先谈图与状态，后者优先谈类型与工程契约；这是两种完全不同的架构重心。[1][6][19][21]
- [CrewAI](/iopanda-blog/ai/03-frameworks/01/18/) 和 [OpenAI Agents SDK](/iopanda-blog/ai/03-frameworks/01/25/) 都想让开发者更快落地 Agent，但 CrewAI 强在角色团队与业务编排，OpenAI Agents SDK 强在统一现代原语（tools、handoffs、guardrails、voice、sandbox）。[3][11][15]

## 3. 五条路线，本质上在争什么

不是所有框架都在解决同一个问题。它们的差别，首先不是 API 名称，而是「默认把哪件事当成一等公民」：

| 路线 | 默认先解决的问题 | 典型问题意识 |
|---|---|---|
| 图编排 | 流程如何显式建模与恢复 | 「长流程跑到第 7 步挂了，怎么从第 7 步继续？」 |
| 多 Agent 对话 | 多角色如何分工协作 | 「让研究员、审稿人、执行者彼此说话」 |
| 角色团队自动化 | 业务角色和流程怎么快速搭起来 | 「像组织团队一样组织 Agent」 |
| 轻量一体化 SDK | 如何快速获得一套现代 Agent 原语 | 「我不想自己拼 tools/handoffs/guardrails/sessions」 |
| 强类型工程化 | 如何把 Agent 代码做成可维护后端系统 | 「输出契约、依赖注入、测试、cost limit 都要可控」 |

所以本模块不是「学 5 套 API」，而是学 5 种工程假设。真正的架构判断是：**你的系统最先会死在哪一类复杂度上？** 是状态爆炸、协作混乱、流程不可控、接口契约不稳，还是测试和治理跟不上？不同答案，会把你带向不同框架。

## 4. 建议阅读顺序

1. [01 LangGraph](/iopanda-blog/ai/03-frameworks/01/03/)：先看底层控制流为什么会变成图；
2. [04 OpenAI Agents SDK](/iopanda-blog/ai/03-frameworks/01/25/)：再看现代 Agent SDK 已经把哪些共性原语做成标配；
3. [05 PydanticAI](/iopanda-blog/ai/03-frameworks/01/32/)：如果你来自 Python 后端，把类型与契约视角补上；
4. [03 CrewAI](/iopanda-blog/ai/03-frameworks/01/18/)：再看业务流程与角色团队化这条路；
5. [02 AutoGen](/iopanda-blog/ai/03-frameworks/01/11/)：最后回头看多 Agent 先驱及其迁移含义。

## 5. 本模块的推荐交付物

| 交付物 | 说明 | 验收标准 |
|---|---|---|
| framework-comparison.md | 五个框架的横向对比卡 | 至少能回答「为什么选 A 不选 B」 |
| framework-selection-card.md | 针对你的课程助教 Agent 的选型卡 | 写清选型依据、风险、替代方案、迁移预案 |
| one-framework-demo/ | 任选一个框架做最小 demo | 能跑通工具调用、状态记录和基本观测 |

## 5.1 本模块笔记导航

1. [01 LangGraph](/iopanda-blog/ai/03-frameworks/01/03/)
2. [02 AutoGen](/iopanda-blog/ai/03-frameworks/01/11/)
3. [03 CrewAI](/iopanda-blog/ai/03-frameworks/01/18/)
4. [04 OpenAI Agents SDK](/iopanda-blog/ai/03-frameworks/01/25/)
5. [05 PydanticAI](/iopanda-blog/ai/03-frameworks/01/32/)
6. [06 Agent Framework 选型矩阵](/iopanda-blog/ai/03-frameworks/01/02/)

## 6. 这一模块该怎么学，才不会学成“框架说明书”

- 不要先背 API，先问它把什么复杂度当作一等公民；
- 不要只看 happy path，先看失败恢复、人审、权限、成本控制怎么做；
- 不要把框架宣传页当选型依据，重点看：状态、控制流、工具、审计、部署、迁移；
- 不要问「谁最好」，要问「谁最匹配当前系统的首要矛盾」。

## 7. 总结

| 关键问题 | 一句话 |
|---|---|
| 本模块讲什么 | 不是再讲 Agent 概念，而是讲 Agent 系统由什么框架承载 |
| 为什么重要 | 框架决定状态、控制流、工具边界、审计与迁移成本 |
| top 5 是哪五个 | LangGraph / AutoGen / CrewAI / OpenAI Agents SDK / PydanticAI |
| 真正的学习重点 | 学五种架构假设，而不是五套 API |
| 选型方法 | 看你的系统最先会死在哪一类复杂度上 |

## 引用

- [1] https://github.com/langchain-ai/langgraph — LangGraph GitHub
- [2] https://github.com/microsoft/autogen — AutoGen GitHub
- [3] https://github.com/crewAIInc/crewAI — CrewAI GitHub
- [4] https://github.com/openai/openai-agents-python — OpenAI Agents SDK GitHub
- [5] https://github.com/pydantic/pydantic-ai — PydanticAI GitHub
- [6] https://docs.langchain.com/oss/python/langgraph/overview — LangGraph docs overview
- [7] https://microsoft.github.io/autogen/stable — AutoGen stable docs
- [10] https://github.com/microsoft/agent-framework — Microsoft Agent Framework GitHub
- [11] https://docs.crewai.com — CrewAI docs
- [15] https://openai.github.io/openai-agents-python — OpenAI Agents SDK docs
- [19] https://pydantic.dev/docs/ai — Pydantic AI docs
- [21] https://raw.githubusercontent.com/pydantic/pydantic-ai/main/docs/graph.md — Pydantic AI graph doc

上一篇：[发布评审与收官](/iopanda-blog/ai/02-agents/08/07/)——上一模块把 Agent 应用真正组装起来并做了发布评审；本模块开始回答「这些应用该由什么框架来承载」。

下一篇：[01 LangGraph](/iopanda-blog/ai/03-frameworks/01/03/)——先从最偏“运行时”和“状态机”的那一类开始：为什么 LangGraph 会把 Agent 写成图。
