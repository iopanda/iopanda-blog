---
title: "AutoGen 与 LangGraph、CrewAI、OpenAI Agents SDK、PydanticAI 的深度对比"
number: "03.01.17"
chapter: 3
chapterTitle: "Frameworks"
section: 1
sectionTitle: "Agent Frameworks"
group: "02 AutoGen"
created: 2026-09-03 19:28
author: "iopanda"
tags: ["course", "ai-agent", "framework", "autogen", "comparison", "architecture"]
sourceId: "3.10.3.1 Agent Frameworks/02 AutoGen/06 AutoGen 与 LangGraph、CrewAI、OpenAI Agents SDK、PydanticAI 的深度对比"
---
# AutoGen 与 LangGraph、CrewAI、OpenAI Agents SDK、PydanticAI 的深度对比

> 到这一篇，AutoGen 本身已经不再只是两篇薄文档了：[会话与事件驱动](/iopanda-blog/ai/03-frameworks/01/12/)、[维护与迁移](/iopanda-blog/ai/03-frameworks/01/13/)、[AgentChat 与消息协议](/iopanda-blog/ai/03-frameworks/01/14/)、[worker/service runtime](/iopanda-blog/ai/03-frameworks/01/15/)、[课程助教案例](/iopanda-blog/ai/03-frameworks/01/16/)。现在最后要做的是：**把它放回整个框架版图里，讲清楚它最独特的地方，以及为什么它既重要又不再是多数新项目的默认答案。**

**学习目标**：学完本章，你将能够——

1. 站在 AutoGen 视角，解释它与 LangGraph、CrewAI、OpenAI Agents SDK、PydanticAI 的第一性差异；
2. 理解为什么 AutoGen 的历史重要性和今天的新项目优先级必须分开判断；
3. 用协作复杂度、运行时复杂度、组织复杂度、工程契约复杂度四个坐标做比较；
4. 判断什么时候 AutoGen 更像学习标杆或遗留系统现实，而不是主骨架；
5. 写出一段“为什么这里不选 AutoGen / 或为什么仍保留 AutoGen”的架构说明。

## 1. 比较前提：AutoGen 首先是一套多角色协作想象力

理解 AutoGen 的关键，不是把它当“一个有点老的框架”，而是把它看成一套曾经极大放大了多 Agent 想象力的系统：
- 角色分工
- 协作对话
- 评审代理
- 用户代理
- 事件驱动
- 多语言/分布式 runtime 野心

所以它最独特的地方不是某个具体 API，而是：**它把多 Agent 从概念实验推向了工程讨论。**

## 2. AutoGen vs LangGraph：会话协作系统 vs 状态图运行时

| 维度 | AutoGen | LangGraph |
|---|---|---|
| 第一语言 | 角色、消息、事件传播 | 状态、节点、边、checkpoint |
| 更像什么 | 协作系统 / 消息驱动 runtime | 图运行时 / 控制流内核 |
| 最先解决什么 | 多角色怎么协作 | 复杂流程怎么显式化和恢复 |
| 最大风险 | 控制流埋进对话 | 建模成本高 |

一句话：
- AutoGen 让你先看到“大家怎么合作”；
- LangGraph 让你先看到“系统怎么转”。

如果主矛盾是协作范式和消息分工，AutoGen 很迷人；
如果主矛盾是控制流、恢复和审计，LangGraph 更直接。

## 3. AutoGen vs CrewAI：研究协作范式 vs 业务组织流程

CrewAI 和 AutoGen 都有角色味，但它们味道不同：

| 维度 | AutoGen | CrewAI |
|---|---|---|
| 角色更像什么 | 会话中的参与者 | 组织中的岗位 |
| 协作怎么表达 | 消息与对话 | role/task/crew/flow |
| 更偏哪种世界 | 协作范式与 runtime 想象 | 业务流程与组织表达 |
| 今天的新项目直觉 | 偏研究/遗留/迁移 | 偏业务自动化落地 |

也就是说：
- AutoGen 更像“多角色系统史上的先驱模型”；
- CrewAI 更像“把这套角色直觉翻译成业务流程框架”。

## 4. AutoGen vs OpenAI Agents SDK：自由协作范式 vs 受控 runtime 原语

OpenAI Agents SDK 的多 Agent 不是从“大家聊天”出发，而是从：
- handoff
- agent-as-tool
- sessions
- guardrails
- tracing
等 runtime 原语出发。

| 维度 | AutoGen | OpenAI Agents SDK |
|---|---|---|
| 多 Agent 的主表达 | 对话与消息协作 | handoff / agent-as-tool / runtime ownership |
| 更像什么 | 协作范式框架 | 产品 runtime 框架 |
| 最吸引人的点 | 多角色很直观 | 现代原语很完整 |
| 风险 | 容易把控制流埋进会话 | 易用但不自动解决复杂状态图 |

一句话：AutoGen 更像“让几个人开会”，OpenAI Agents SDK 更像“让系统明确知道谁该接手哪一段”。

## 5. AutoGen vs PydanticAI：协作想象力 vs typed engineering discipline

PydanticAI 的中心是：
- output_type
- deps_type
- capabilities
- UsageLimits
- cancellation
- 渐进升级到 graph/durable

AutoGen 的中心则是：
- 角色对话
- 协作分工
- 事件路由
- worker/service runtime 想象

| 维度 | AutoGen | PydanticAI |
|---|---|---|
| 第一性问题 | 多角色如何协作 | Agent 如何像系统组件一样被维护 |
| 更像什么 | 协作系统 | 工程框架 |
| 首先让团队讨论什么 | 谁和谁说话 | 输出、依赖、能力、预算 |
| 风格 | 外扩式想象力 | 内收式工程纪律 |

所以如果你首先在乎“多 Agent 到底能怎么玩”，AutoGen 更有启发；
如果你首先在乎“系统能不能写稳、测稳、扩稳”，PydanticAI 更有吸引力。

## 6. 为什么 AutoGen 今天更像“学习标杆”和“遗留现实”

这是我对它现在位置的核心判断：

### 它仍是学习标杆
因为：
- 你能从它看懂多 Agent 协作的很多原初问题；
- 你能看见为什么协作会放大能力，也会放大治理难度；
- 它对后来框架的影响非常真实。

### 它也是遗留现实
因为：
- 存量项目仍在；
- 迁移问题真实存在；
- maintenance mode 不会自动抹去它的工程遗产。

### 但它不再天然是绿地项目默认首选
因为：
- 官方维护状态已改变；
- 后续框架对不同复杂度给出了更专门化的答案；
- 今天更少团队会从“自由多角色协作”作为第一实现路线出发。

## 7. 什么时候仍可能保留 AutoGen

下面几类情况，保留 AutoGen 仍可能合理：

1. 已有系统稳定运行；
2. 团队熟悉其协作模型；
3. 迁移成本高于短期收益；
4. 你做的是研究/教学/实验，而不是长期平台主骨架；
5. 你需要复盘历史多 Agent 范式，而不是重新押注未来路线。

## 8. 什么时候不该再把它作为第一选项

下面这些场景里，通常不该把 AutoGen 当第一选项：

1. 你做的是全新产品；
2. 你需要强状态恢复和显式控制流；
3. 你需要强 typed contract；
4. 你想少拼治理和 runtime glue；
5. 你需要长期稳定演进的官方主路线。

这不是否定它，而是接受它已经完成了自己历史阶段的核心使命。

## 9. 动手活动：写一段“为什么我们不选/仍保留 AutoGen”的说明

> [!example] 动手活动：输出 `why-or-why-not-autogen.md`
>
> **目标**：把 AutoGen 的历史价值与当前选型现实分开写清楚。
>
> **步骤**：
> 1. 写出系统主矛盾；
> 2. 写出 AutoGen 在这个问题上最自然的地方；
> 3. 写出它最危险或最不合适的地方；
> 4. 若保留，说明保留理由；若不选，说明替代框架更先解决了什么；
> 5. 明确写出这不是“好坏判断”，而是“复杂度匹配判断”。
>
> **完成标准**：读者能同时看懂 AutoGen 的历史贡献和当前局限，而不是二极管式评价。

## 10. 边界与排错

- **误区一：进入 maintenance mode 就说明它毫无价值。** 历史价值和绿地项目优先级不是一回事；
- **误区二：它曾经代表前沿，就应该继续代表默认未来。** 框架生态会分化；
- **误区三：多 Agent 越自由越先进。** 自由也意味着治理负担；
- **误区四：存量系统还活着，就说明选型没问题。** 活着不等于长期成本可接受；
- **误区五：迁移只是工具问题。** 真正难的是迁移协作语义与控制边界。

## 11. 总结

| 关键问题 | 一句话 |
|---|---|
| AutoGen 最独特的地方 | 它放大了多角色协作和消息驱动 Agent system 的想象力 |
| 它和 LangGraph 的差异 | 一个先讲协作，一个先讲控制流 |
| 它和 CrewAI 的差异 | 一个更像研究协作范式，一个更像业务组织框架 |
| 它和 OpenAI Agents SDK 的差异 | 一个更自由协作，一个更受控 runtime |
| 它和 PydanticAI 的差异 | 一个先讲想象力，一个先讲工程纪律 |
| 今天最合理的位置 | 学习标杆 + 遗留现实，而非多数新项目默认首选 |

**思考题**：为什么一个框架最有价值的历史贡献，有时恰恰也是它后来不再适合作为默认新项目起点的原因？把 AutoGen 放在这个位置上，会帮助你避免哪两种极端错误？

> [!note] 参考答案
> 因为很多框架在历史上的任务，是把一个新范式从不可见变成可见。AutoGen 在多 Agent 协作上完成了这一使命，所以它极有启发性；但范式一旦被看见，后续生态就会分化出更针对状态、流程、typed contract、产品 runtime 的专门化框架。因此，把 AutoGen 视为“重要但不必盲选”的位置，可以避免两种极端：一是把它神化成永远默认答案，二是因为维护状态改变就否认它的全部价值。

## 引用

- [2] https://github.com/microsoft/autogen — AutoGen GitHub
- [7] https://microsoft.github.io/autogen/stable — AutoGen stable docs
- [8] https://raw.githubusercontent.com/microsoft/autogen/main/docs/design/01%20-%20Programming%20Model.md — AutoGen programming model
- [9] https://arxiv.org/abs/2308.08155 — AutoGen paper
- [10] https://github.com/microsoft/agent-framework — Microsoft Agent Framework GitHub
- [40] https://raw.githubusercontent.com/microsoft/autogen/main/docs/design/05%20-%20Services.md — AutoGen services design

上一篇：[05 课程助教 Agent 的 AutoGen 架构案例](/iopanda-blog/ai/03-frameworks/01/16/)——真实案例让它的优点与风险都更清楚；本篇则把它重新放回整个框架版图中判断。

下一篇：回到 [06 Agent Framework 选型矩阵](/iopanda-blog/ai/03-frameworks/01/02/)，从全局再次复核 AutoGen 在 top5 中应占什么位置。
