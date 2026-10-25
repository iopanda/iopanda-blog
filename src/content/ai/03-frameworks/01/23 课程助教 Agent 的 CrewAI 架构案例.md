---
title: "课程助教 Agent 的 CrewAI 架构案例"
number: "03.01.23"
chapter: 3
chapterTitle: "Frameworks"
section: 1
sectionTitle: "Agent Frameworks"
group: "03 CrewAI"
created: 2026-09-03 16:48
author: "iopanda"
tags: ["course", "ai-agent", "framework", "crewai", "case-study", "architecture"]
sourceId: "3.10.3.1 Agent Frameworks/03 CrewAI/05 课程助教 Agent 的 CrewAI 架构案例"
---
# 课程助教 Agent 的 CrewAI 架构案例

> 前四篇把 CrewAI 的主要部件都拆开了：[角色与任务](/ai/03-frameworks/01/19/)、[Flow 与业务流程](/ai/03-frameworks/01/20/)、[单角色执行边界](/ai/03-frameworks/01/21/)、[人审与恢复](/ai/03-frameworks/01/22/)。这一章把这些抽象重新落回一个真实的、与你前面 01/02 主线一致的系统：**课程助教 Agent**。重点不是“能不能用 CrewAI 做出一个问答 demo”，而是：**如果要做成一个带检索、草稿、风险审查、人工复核、可恢复流程的教学系统，CrewAI 应该如何拆层？**

**学习目标**：学完本章，你将能够——

1. 用 CrewAI 的语言拆一个真实课程助教 Agent：角色、任务、Crew、Flow、审批；
2. 判断哪些逻辑属于角色自治，哪些逻辑属于流程控制；
3. 为课程助教设计 knowledge、guardrail、human feedback 与 persistence；
4. 解释为什么这个系统用 CrewAI 时，最关键的不是“多 Agent”，而是“分层”；
5. 画出一张可供开发者实现的 CrewAI 架构草图。

## 1. 问题定义：课程助教不是一个角色，而是一套教学服务流程

如果只把课程助教理解成“回答课程问题”，你会自然倾向于单 Agent + 检索。但一旦把真实教学场景加进来，系统很快扩展为：
- 检索讲义和课程规则；
- 生成答案草稿；
- 审查是否越权、是否涉及隐私/成绩；
- 必要时升级人工；
- 保留流程状态，方便追责和恢复；
- 某些任务可能是批量型，比如生成个性化复习提纲。

因此它更像一个教学服务流程，而不是一个纯问答机器人。CrewAI 在这里的价值，就在于它既能表达角色，也能表达流程。

## 2. 先拆角色：不要一上来就拆太多

课程助教并不需要五六个花哨角色。一个更稳的起点通常是三角结构：

| 角色 | 主要职责 | 不该做什么 |
|---|---|---|
| 资料研究员 | 检索课程资料、规则、参考片段 | 不做最终放行 |
| 答案撰写员 | 基于资料生成草稿答案 | 不直接决定高风险回答 |
| 风险审查员 | 检查隐私、成绩、越权、规则冲突 | 不负责大量资料探索 |

这样拆的原因不是为了“多 Agent 好看”，而是为了让知识域和责任域相对一致：
- 研究员负责找；
- 撰写员负责写；
- 审查员负责卡边界。

如果一开始再加“协调员”“评估员”“总结员”等一堆角色，系统复杂度会上升得很快，收益却不一定同步上升。

## 3. 再拆任务：角色只是人设，任务才是运行骨架

每个角色对应的任务要尽量具体：

| 任务 | 执行角色 | 输入 | 输出 |
|---|---|---|---|
| 检索课程资料 | 资料研究员 | 用户问题、课程范围 | 相关片段、规则依据 |
| 生成答案草稿 | 答案撰写员 | 资料片段、问题 | draft answer |
| 风险审查 | 风险审查员 | 草稿、资料、用户身份 | 风险标记、是否需人工 |
| 人工复核 | 人类审核者 | 草稿、风险说明、上下文 | 批准/修改/拒绝 |
| 最终返回 | Flow/系统 | 批准后的结果 | final answer |

CrewAI 在这里的关键价值，是让这些任务和角色之间的关系显式化，而不是把它们塞进一个万能 prompt。

## 4. Crew 怎么组织：别把所有问题都交给 Crew

一个合理的 Crew 可以只负责中间的“自治协作段” ：
- 研究员检索资料；
- 撰写员产出草稿；
- 审查员做第一轮风险判断。

也就是说，Crew 最适合承接的是：
- 需要多专长角色参与；
- 路线有一定开放性；
- 但还没有进入最终系统级放行动作。

而这些事情通常不该交给 Crew 自己决定：
- 流程什么时候开始；
- 命中高风险是否直接进入人工复核；
- 审批超时怎么处理；
- 审批后从哪里恢复；
- 最终输出前的系统级校验与审计。

这些应当交给 Flow。也就是说：**Crew 负责“内容生产段”，Flow 负责“业务治理段”。**

## 5. Flow 怎么组织：课程助教的真正主骨架在这里

一个更稳的 Flow 可以是：

1. `start`: 接收用户提问
2. `precheck`: 判断请求类别与风险级别
3. `crew_run`: 触发内容生产 Crew
4. `review_gate`: 若风险低则进入输出校验；若风险高则触发 `@human_feedback`
5. `resume_after_review`: 人工批准/修改/拒绝后的恢复节点
6. `final_validation`: 输出格式、安全与引用校验
7. `finish`: 返回结果并落审计记录

你会发现，这里真正承担系统骨架的是 Flow，而不是 Crew。Crew 是中段的“智能协作模块”。这正是 CrewAI 最成熟的使用方式。

## 6. knowledge / guardrail / feedback 各落哪层

### 6.1 knowledge

更适合挂在角色层：
- 研究员读课程讲义、FAQ、规则；
- 审查员读安全边界、成绩政策、隐私规则。

不要把所有知识源平铺给所有角色，否则边界会快速模糊。

### 6.2 guardrail

应该分层：
- 角色层：限制单个角色的输出边界；
- Flow 层：限制整个流程是否可继续、是否需人工。

### 6.3 human feedback

不要作为“事后加一个确认框”，而要放在 review gate 这种明确流程节点里，并保留恢复语义。

## 7. persistence 怎么设计：课程助教并不只是聊天记录

流程状态至少应覆盖：
- 当前问题类型；
- Crew 已跑到哪一步；
- 研究结果与草稿是否生成；
- 风险审查结果；
- 是否等待人工；
- 人工反馈内容；
- 最终放行与审计摘要。

这说明 persistence 在这里并不是“保存聊天历史”，而是保存教学服务流程的运行现场。

## 8. 为什么这个案例很能说明 CrewAI 的适用边界

课程助教这个案例有趣的地方在于：
- 它确实需要多个角色，但不需要无限多角色；
- 它确实需要流程控制，而且流程控制比角色数量更重要；
- 它确实需要知识、guardrail、人工反馈、恢复；
- 它对业务语义的要求比对底层状态机语义更直接。

这正好说明 CrewAI 最适合的场景：**角色协作存在，而且业务流程语言比底层状态机语言更适合团队沟通。**

## 9. 和 LangGraph 做同一案例时最大的差异

如果你用 LangGraph 做这个课程助教，第一张图会更像：
- state
- nodes
- edges
- checkpoint
- interrupt

如果你用 CrewAI 做，第一张图则更像：
- 研究员
- 撰写员
- 审查员
- 任务链
- 审批流

这不是孰优孰劣，而是表达语言不同：
- LangGraph 更接近运行时视角；
- CrewAI 更接近业务组织视角。

## 10. 动手活动：写课程助教的 Crew + Flow 架构说明

> [!example] 动手活动：输出 `course-ta-crewai-architecture.md`
>
> **目标**：为课程助教输出一份可评审的 CrewAI 架构说明。
>
> **步骤**：
> 1. 列角色、任务和每个角色的知识域；
> 2. 画出 Crew 段与 Flow 段的边界；
> 3. 标记哪个节点需要 human feedback；
> 4. 标记持久化内容与恢复点；
> 5. 写一段“为什么这里用 CrewAI 更自然”的结论。
>
> **完成标准**：团队成员只看这份说明，就能理解“谁负责生成内容，谁负责管流程”。

## 11. 边界与排错

- **误区一：课程助教一复杂就拼命加角色。** 先问复杂度到底来自协作还是来自流程；
- **误区二：Crew 和 Flow 责任不分。** 会导致系统一半像群聊，一半像 workflow，但两边都不清楚；
- **误区三：研究员和审查员共用全部知识源。** 容易污染职责边界；
- **误区四：human feedback 放在最后。** 高风险动作应在真正放行前停住；
- **误区五：把 persistence 只当聊天记录。** 业务流程状态才是更重要的持久化对象。

## 12. 总结

| 关键问题 | 一句话 |
|---|---|
| 课程助教为什么适合 CrewAI | 因为它既有角色协作，又有明显业务流程 |
| 角色怎么拆 | 少而清晰：研究、撰写、审查 |
| Crew 负责什么 | 中间的自治协作与内容生产 |
| Flow 负责什么 | 入口、路由、审批、恢复、收尾 |
| human feedback 放哪 | 放在 review gate 这类正式流程节点 |
| persistence 存什么 | 不是只存聊天，而是存教学服务流程现场 |

**思考题**：如果课程助教下一阶段扩展成“批量为全班生成个性化复习提纲并发邮件”，为什么你首先要重新思考的不是“要不要多加一个写邮件角色”，而是 Flow 和持久化策略？

> [!note] 参考答案
> 因为这时系统的主矛盾从“单次内容协作”转向了“批量流程管理”：需要批次状态、失败恢复、审批、发件审计、收件人隔离和长时运行。多一个写邮件角色只能补局部功能，真正需要重构的是流程骨架和状态保存方式。先把 Flow 与 persistence 设计好，角色才不会把流程复杂度吞进对话黑箱里。

## 引用

- [11] https://docs.crewai.com — CrewAI docs
- [12] https://raw.githubusercontent.com/crewAIInc/crewAI/main/docs/v1.15.18/en/concepts/agents.mdx — CrewAI agents concepts
- [13] https://raw.githubusercontent.com/crewAIInc/crewAI/main/docs/v1.15.18/en/concepts/crews.mdx — CrewAI crews concepts
- [14] https://raw.githubusercontent.com/crewAIInc/crewAI/main/docs/v1.15.18/en/concepts/flows.mdx — CrewAI flows concepts
- [30] https://github.com/crewAIInc/crewAI/blob/main/lib/crewai/src/crewai/agent/core.py — CrewAI agent core source
- [31] https://github.com/crewAIInc/crewAI/blob/main/lib/crewai/src/crewai/flow/flow.py — CrewAI flow source
- [32] https://github.com/crewAIInc/crewAI/blob/main/lib/crewai/src/crewai/flow/human_feedback.py — CrewAI human feedback source
- [33] https://github.com/crewAIInc/crewAI/tree/main/lib/crewai/src/crewai/flow/persistence — CrewAI flow persistence source tree

上一篇：[04 Human Feedback、Checkpoint 与可恢复业务流程](/ai/03-frameworks/01/22/)——人审与恢复机制立住后，本篇把它们落回一个真实教学系统。

下一篇：[06 CrewAI 与 LangGraph、OpenAI Agents SDK、PydanticAI 的深度对比](/ai/03-frameworks/01/24/)——具体案例落地后，再回头看 CrewAI 为什么更像业务组织框架。
