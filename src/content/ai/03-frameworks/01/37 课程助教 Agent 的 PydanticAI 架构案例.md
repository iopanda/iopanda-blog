---
title: "课程助教 Agent 的 PydanticAI 架构案例"
number: "03.01.37"
chapter: 3
chapterTitle: "Frameworks"
section: 1
sectionTitle: "Agent Frameworks"
group: "05 PydanticAI"
created: 2026-09-03 18:16
author: "iopanda"
tags: ["course", "ai-agent", "framework", "pydantic-ai", "case-study", "architecture"]
sourceId: "3.10.3.1 Agent Frameworks/05 PydanticAI/05 课程助教 Agent 的 PydanticAI 架构案例"
---
# 课程助教 Agent 的 PydanticAI 架构案例

> 前四篇已经把 PydanticAI 的主要部件拆开了：[类型/依赖/输出契约](/ai/03-frameworks/01/33/)、[graph/durable execution](/ai/03-frameworks/01/34/)、[tools/capabilities/usage/cancel](/ai/03-frameworks/01/35/)、[应用形态](/ai/03-frameworks/01/36/)。这一章回到你的课程助教主线，回答一个更具体的问题：**如果我们不从“角色协作”或“状态图”先出发，而是从“typed Python service”先出发，课程助教应该怎么在 PydanticAI 里长出来？**

**学习目标**：学完本章，你将能够——

1. 用 PydanticAI 的语言为课程助教设计类型边界、依赖边界和能力边界；
2. 判断课程助教在什么阶段只需要 typed agent，什么阶段该升级到 delegation、graph 或 durable execution；
3. 设计适合课程助教的 output schema、deps、tools、UsageLimits 与取消策略；
4. 解释为什么这个案例在 PydanticAI 里首先像“后端服务”，而不是像“团队”或“状态图”；
5. 画出一张可供开发者直接实现的 PydanticAI 架构草图。

## 1. 先定问题：课程助教在这里首先是一个有契约的服务

如果从 PydanticAI 出发，课程助教的第一步不是：
- 画几个角色；
- 先搭状态图；
而是：
- 输入是什么；
- 输出是什么；
- 依赖是什么；
- 哪些工具和能力需要注入；
- 哪些预算和取消规则要先定。

这就是它和 LangGraph / CrewAI 最不一样的地方：它首先把课程助教看成**一个有明确接口和边界的后端 Agent 服务**。

## 2. 先定 output schema：输出稳定比 prompt 花哨更值钱

课程助教至少可以拆三类输出：

| 输出类型 | 适用场景 | 关键字段 |
|---|---|---|
| `AnswerResult` | 普通课程问答 | `answer`, `citations`, `confidence`, `needs_review` |
| `ScoreResult` | 成绩查询 | `student_id`, `score`, `course_scope`, `needs_review` |
| `EscalationResult` | 风险或权限不足 | `reason`, `review_queue`, `user_message` |

这样设计的价值在于：
- 下游应用不再靠猜字符串；
- 普通回答、成绩查询、升级人工不再混成一类散文；
- 后面加 web、teacher workspace、voice 时也更容易统一消费。

这正是 PydanticAI 的强项：先把结果变成“程序也能信”的对象。

## 3. 再定 deps：课程助教真正依赖什么

建议至少显式注入这些依赖：

| 依赖 | 用途 |
|---|---|
| `current_user` | 判断学生/教师/管理员身份 |
| `course_id` / `term` | 约束查询范围 |
| `retriever` | 课程讲义与规则检索 |
| `score_service` | 成绩查询接口 |
| `audit_logger` | 审计记录 |
| `policy_config` | 风险与权限规则 |

这些如果不显式化，会很快变成：
- 全局对象；
- 隐式闭包；
- specialist 间难以复用；
- 测试时难以替换。

所以课程助教在 PydanticAI 下的第一步，其实是把“系统真实依赖”从隐式变显式。

## 4. tools / toolsets / capabilities：课程助教要怎么分层

### 4.1 tools

单点工具可以包括：
- `search_course_material()`
- `lookup_course_policy()`
- `lookup_student_score()`

### 4.2 toolsets

如果你想把相关工具按域打包，可以分成：
- `CourseKnowledgeToolset`
- `PolicyToolset`
- `StudentRecordToolset`

### 4.3 capabilities

更高一层可以是：
- `CourseAnsweringCapability`
- `PolicyReviewCapability`
- `AuditAndBudgetCapability`

这样分层的好处是：
- 普通问答不必接触成绩能力；
- 成绩查询能力可以单独受限；
- 审计与预算能力可以复用到多个 agent。

这说明 PydanticAI 的组合方式很适合课程助教这类“能力域清晰”的系统。

## 5. UsageLimits：课程助教为什么也需要预算边界

课程助教看起来不像代码 Agent 那么昂贵，但仍然会遇到这些问题：
- 反复检索；
- 规则冲突时多轮自我修正；
- specialist delegation；
- 长语音会话；
- 高并发考试周流量。

所以建议至少设计：
- 最大请求数；
- 最大 tool 调用数；
- 最大总 token；
- 某些高风险查询的更低预算。

这不是为了省几分钱，而是为了让系统在复杂问题面前“知道什么时候该停”。

## 6. cancellation：课程助教有哪些合理的停止条件

课程助教里常见的 cancel 触发包括：
- 用户主动结束会话；
- approval 被拒绝；
- tool 调用达到上限；
- 连续检索仍无足够证据；
- 预算耗尽；
- 前端 realtime/voice session 中断。

如果这些都不显式建模，系统就会：
- 明明用户退出了还在继续跑；
- 审批没过却仍在后台尝试生成；
- 预算超了还在不断检索和重试。

所以课程助教虽然不是最复杂的 Agent，也已经值得拥有 cancellation 设计。

## 7. 什么时候课程助教要从 typed agent 升级

### Stage 1：typed agent 即可

适合：
- 普通课程问答；
- 简单规则查询；
- 只读工具；
- 无人工审批。

### Stage 2：加 capabilities 与 UsageLimits

适合：
- 检索逻辑变多；
- 审计和预算要求提高；
- 需要更稳定的工具域组合。

### Stage 3：加 delegation

适合：
- 课程问答和成绩查询开始明显分叉；
- 规则审查需要独立 specialist。

### Stage 4：加 graph / durable execution

适合：
- 审批流出现；
- 批量任务出现；
- 恢复和长时运行变重要。

这说明 PydanticAI 很适合课程助教这种“逐步长大”的系统：先把地基写稳，再决定是否长复杂骨架。

## 8. 为什么这个案例很能体现 PydanticAI 的优势

课程助教这个案例对 PydanticAI 很友好，原因在于：
- 输出类型天然清晰；
- 依赖天然清晰；
- 工具域天然可分；
- 复杂度是渐进上升的；
- 并不是 Day 1 就必须上最重状态图。

所以它很适合 PydanticAI 的渐进哲学：
- 先稳定接口；
- 再稳定能力；
- 再稳定运行时；
- 最后才引入更重编排。

## 9. 和 LangGraph / CrewAI / OpenAI Agents SDK 做同一案例时的差异

| 框架 | 第一张图最像什么 | PydanticAI 的不同 |
|---|---|---|
| LangGraph | 状态图 | 它先画接口和依赖，不先画状态迁移 |
| CrewAI | 角色与任务组织图 | 它先画服务契约，不先画组织结构 |
| OpenAI Agents SDK | triage / specialists / runtime 原语图 | 它先画 typed service boundary |

一句话：课程助教在 PydanticAI 里首先像“可维护的后端 Agent 服务”，然后才可能长成更复杂系统。

## 10. 动手活动：写课程助教的 PydanticAI 架构说明

> [!example] 动手活动：输出 `course-ta-pydanticai-architecture.md`
>
> **目标**：为课程助教写一份以类型、依赖、能力和升级路径为中心的架构说明。
>
> **步骤**：
> 1. 定义三类输出 schema；
> 2. 列依赖与工具域；
> 3. 设计 capability 组合；
> 4. 写 UsageLimits 与 cancellation 规则；
> 5. 写一段“什么时候要升级到 graph/durable”的结论。
>
> **完成标准**：另一个后端工程师只看文档，就能知道怎样从一个 typed agent 起步，并为将来升级留好口子。

## 11. 边界与排错

- **误区一：课程助教只是问答，不需要 schema。** 一旦有成绩、升级人工、前端消费，schema 立刻变重要；
- **误区二：把所有工具都挂到一个 agent 上。** 工具域不分，会放大权限和职责混乱；
- **误区三：typed output 稳了就够了。** 预算、取消、审批仍然要管；
- **误区四：看不到 graph 就以为永远不需要 graph。** 随业务长大，审批流和批量任务会逼你升级；
- **误区五：把 PydanticAI 当成只适合轻应用。** 它更适合渐进式长成复杂系统。

## 12. 总结

| 关键问题 | 一句话 |
|---|---|
| 课程助教在这里首先像什么 | 一个 typed Python Agent 服务 |
| 第一阶段最重要的是什么 | output schema、deps、tools、capabilities |
| 为什么要设计 UsageLimits | 防止检索、重试、delegation 持续烧预算 |
| 为什么要设计 cancellation | 让系统在用户退出、审批拒绝、预算耗尽时停得住 |
| 什么时候升级 | 当流程复杂度从接口边界转向审批、恢复、长时运行 |
| PydanticAI 的优势 | 让课程助教可以从稳定接口逐步长成复杂系统 |

**思考题**：为什么对课程助教这类系统来说，“先把返回值和依赖写稳”常常比“先把协作和流程写复杂”更划算？什么情况下这个优先级会反过来？

> [!note] 参考答案
> 因为在很多早期阶段，系统最先痛的往往是接口不稳、工具边界不清、测试困难和上下游难对接，而不是流程本身不够复杂。先把返回值、依赖、能力边界写稳，能让系统尽快成为可维护服务。只有当审批流、批量任务、长时恢复、人工插入开始成为主矛盾时，这个优先级才会反过来，届时需要更强的 graph 或 durable execution 支撑。

## 引用

- [19] https://pydantic.dev/docs/ai — Pydantic AI docs
- [20] https://raw.githubusercontent.com/pydantic/pydantic-ai/main/docs/agent.md — Pydantic AI agent doc
- [23] https://raw.githubusercontent.com/pydantic/pydantic-ai/main/docs/multi-agent-applications.md — Pydantic AI multi-agent applications doc
- [34] https://github.com/pydantic/pydantic-ai/blob/main/docs/tools.md — Pydantic AI tools doc
- [35] https://github.com/pydantic/pydantic-ai/blob/main/pydantic_ai_slim/pydantic_ai/_cancel.py — Pydantic AI cancellation source

上一篇：[04 Realtime、Examples、Evals 与多 Agent 形态](/ai/03-frameworks/01/36/)——丰富应用形态说明它不只是后端小工具；本篇则把这些能力重新落回课程助教这个真实系统。

下一篇：[06 PydanticAI 与 LangGraph、CrewAI、OpenAI Agents SDK 的深度对比](/ai/03-frameworks/01/38/)——具体案例落地后，再回头看 PydanticAI 在整个框架版图里的独特位置。
