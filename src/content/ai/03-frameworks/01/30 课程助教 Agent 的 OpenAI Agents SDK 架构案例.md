---
title: "课程助教 Agent 的 OpenAI Agents SDK 架构案例"
number: "03.01.30"
chapter: 3
chapterTitle: "Frameworks"
section: 1
sectionTitle: "Agent Frameworks"
group: "04 OpenAI Agents SDK"
created: 2026-09-03 17:38
author: "iopanda"
tags: ["course", "ai-agent", "framework", "openai-agents-sdk", "case-study", "architecture"]
sourceId: "3.10.3.1 Agent Frameworks/04 OpenAI Agents SDK/05 课程助教 Agent 的 OpenAI Agents SDK 架构案例"
---
# 课程助教 Agent 的 OpenAI Agents SDK 架构案例

> 前四篇已经把 OpenAI Agents SDK 的主要能力拆开了：[运行时原语](/iopanda-blog/ai/03-frameworks/01/26/)、[产品边界](/iopanda-blog/ai/03-frameworks/01/27/)、[多 Agent 路由与工具生态](/iopanda-blog/ai/03-frameworks/01/28/)、[应用形态](/iopanda-blog/ai/03-frameworks/01/29/)。这一章回到你的主线：**课程助教 Agent**。重点不是“用这个 SDK 能不能做出来”，而是：**如果要做成一个支持课程问答、规则咨询、成绩查询、人工审批、会话隔离、可追踪的教学产品，OpenAI Agents SDK 应该怎么拆？**

**学习目标**：学完本章，你将能够——

1. 用 OpenAI Agents SDK 的原语为课程助教设计 Router + Specialists 架构；
2. 判断哪些地方该用 handoff，哪些地方该用 agent-as-tool；
3. 为课程助教设计 sessions、guardrails、approvals、tracing 策略；
4. 解释为什么课程助教在这个框架下更像产品 runtime，而不是状态图；
5. 画出一版可供开发者实现的 OpenAI Agents SDK 架构草图。

## 1. 先定问题：课程助教在这里首先是一个产品，而不是一条状态图

同样是课程助教，如果用 LangGraph 去想，你会先画状态、节点和 checkpoint；
如果用 OpenAI Agents SDK 去想，你更自然会先问：
- 入口有哪些？
- 谁负责分流？
- 哪个 specialist 负责哪类问题？
- 会话怎么隔离？
- 工具和审批怎么接？
- trace 怎么看？

这不是优劣之分，而是默认表达语言不同。OpenAI Agents SDK 更像“产品 runtime 结构图”。

## 2. 推荐总体结构：一个 triage，三个 specialists

课程助教最自然的第一版结构通常是：

| Agent | 职责 | 适合的协作模式 |
|---|---|---|
| Triage Agent | 判断问题类型、决定路由 | handoff 或 manager |
| 课程问答 Specialist | 课程内容问答、讲义解释 | handoff 或 as-tool |
| 规则说明 Specialist | 课程规则、评分政策、作业流程 | as-tool 更常见 |
| 成绩查询 Specialist | 成绩/隐私类高风险查询 | handoff 更常见 |

为什么这样拆：
- 课程问答与规则说明是两个不同知识域；
- 成绩查询拥有不同的权限和 guardrail；
- triage 可以保持外层统一入口与产品体验。

## 3. handoff 还是 agent-as-tool：课程助教里怎么选

### 3.1 课程问答 Specialist

如果你希望：
- Triage 保留统一口径；
- 最终答复风格统一；
- 外层共享统一 guardrails；
那么更适合 agent-as-tool。

如果你希望：
- 某些课程问题由专家代理直接接管当前回合；
- specialist 的 instructions 明显不同；
则可以用 handoff。

### 3.2 规则说明 Specialist

通常更适合 agent-as-tool：
- 它更像一个规则解释助手；
- 往往不必单独拥有当前回合的全部 ownership；
- manager 汇总说明更自然。

### 3.3 成绩查询 Specialist

通常更适合 handoff：
- 它的权限边界单独重要；
- 它的 guardrail 和审批逻辑更特殊；
- 当前回合很可能需要强身份校验与审批语义。

一句话：**规则解释更像咨询专家，成绩查询更像敏感路由目标。**

## 4. tools / MCP：课程助教需要哪些外部能力

课程助教至少会需要：
- 课程资料检索工具；
- 课程规则文档查询；
- 成绩查询接口；
- 审批或人工确认入口；
- 审计日志记录能力。

在 OpenAI Agents SDK 里，这些可以来自：
- 本地函数工具；
- MCP tools；
- hosted MCP connectors；
- agent-as-tool specialists。

设计原则不是“能接多少接多少”，而是：
- 哪些工具是公开只读；
- 哪些工具是敏感只读；
- 哪些动作需要 approval；
- 哪些结果必须走 output guardrail。

## 5. sessions：课程助教最容易被低估的系统边界

课程助教这类产品最容易被忽略的不是工具，而是 session 设计。

建议至少按问题类型隔离：
- 普通课程问答 session
- 规则咨询 session
- 成绩查询 session

为什么？
- 普通问答上下文可以连续延续；
- 成绩查询涉及隐私，不应与普通问答上下文混杂；
- specialist handoff 之后，不同 session 策略会直接影响数据边界。

这再次说明：在 OpenAI Agents SDK 里，session 不是聊天功能，而是产品治理边界。

## 6. guardrails：课程助教至少要做三层

### 6.1 输入 guardrail

- 判断是否是代写、越权、要求泄露他人成绩；
- 某些高风险请求直接阻断或升级人工。

### 6.2 tool input/output guardrail

尤其对成绩查询：
- 输入前验证身份、学号、权限；
- 输出后检查是否泄露他人信息。

### 6.3 输出 guardrail

- 最终答复是否越界；
- 是否把不该直接透露的内容说出；
- 是否需要替换为拒答模板或升级结果。

这三层 guardrail 的组合，决定课程助教是不是“能上线的产品”，而不只是“会回答的 demo”。

## 7. approvals：哪些动作应显式需要人类许可

课程助教并不一定有很多写操作，但只要出现下面这些场景，就应考虑 approval：
- 导出成绩
- 批量发送复习提纲
- 修改学生记录
- 访问更高敏感度数据

这些审批并不是 UI 附件，而是 runtime 语义的一部分：
- 当前 run 因审批而暂停；
- 审批结果应能被 trace；
- 审批后 run 应能恢复而不是重来。

## 8. tracing：真正上线后，课程助教最需要看什么

建议至少追踪：
- triage 是如何分类该问题的；
- 是 handoff 还是 agent-as-tool；
- 调用了哪些 tools / MCP servers；
- 哪些 guardrails 命中；
- 是否发生 approval；
- 最终由哪个 specialist 产出结果；
- 某些问题是否在 session 边界上被错误混合。

这说明 tracing 在这里不是开发时 debug，而是上线后的运行解释系统。

## 9. 为什么这个案例非常适合 OpenAI Agents SDK

课程助教与这个框架高度契合的原因是：
- 它天然需要 triage + specialists；
- 它天然需要 sessions；
- 它天然需要 guardrails；
- 它天然可能需要 approval；
- 它未来可能扩展 voice / web / teacher workspace 多入口。

也就是说，这不是一个只靠状态机就能完全解释的系统，它也非常像一个多入口、多 specialist 的产品 runtime。

## 10. 动手活动：写课程助教的 OpenAI Agents SDK 架构说明

> [!example] 动手活动：输出 `course-ta-openai-agents-architecture.md`
>
> **目标**：基于 OpenAI Agents SDK 原语，为课程助教写一份可评审的架构说明。
>
> **步骤**：
> 1. 定 triage 与 specialists；
> 2. 为每类问题决定 handoff 还是 as-tool；
> 3. 列每个 specialist 可接的 tools / MCP；
> 4. 设计 session 隔离、guardrails、approvals；
> 5. 定义 tracing 里必须可见的关键事件。
>
> **完成标准**：另一个工程师只看文档，就能知道“谁在路由、谁在执行、谁在审批、系统该看哪些轨迹”。

## 11. 边界与排错

- **误区一：看到多 Agent 就一律 handoff。** 很多 specialist 其实更适合作为工具；
- **误区二：session 按用户统一一锅端。** 高敏感问题需要更细粒度隔离；
- **误区三：成绩查询只是换一个工具。** 它本质上是权限和审批问题；
- **误区四：有 specialist 就不需要统一外层体验。** triage/manager 的产品作用仍很重要；
- **误区五：把 tracing 当日志。** 真正要看的是 routing、guardrails、tool usage、approval 的组合轨迹。

## 12. 总结

| 关键问题 | 一句话 |
|---|---|
| 课程助教在这里更像什么 | 一个多入口、多 specialist、多边界的产品 runtime |
| 推荐结构 | triage + 课程问答 specialist + 规则 specialist + 成绩 specialist |
| handoff / as-tool 怎么选 | 看 specialist 是接管当前回合，还是只提供边界明确的辅助能力 |
| session 的作用 | 不是多轮聊天便利，而是上下文与隐私边界 |
| guardrail 的作用 | 输入、工具、输出三层协同，决定是否可上线 |
| approval 的作用 | 把敏感动作纳入运行时暂停与恢复语义 |

**思考题**：如果课程助教未来要扩展到“语音助教 + 教师工作台 + 学生聊天入口”三种界面，为什么 OpenAI Agents SDK 的优势会比单一文本问答框架更明显？哪些新问题会因此从“可选项”变成“必须设计的项”？

> [!note] 参考答案
> 因为一旦变成多界面产品，系统复杂度会从“单次回答”升级到“统一 runtime”：session 生命周期、voice/realtime 事件流、tool 调用时机、approval 恢复、specialist 路由、trace 关联都必须被统一设计。原本在单一文本问答场景里可以暂时忽略的 tracing、session 隔离、审批恢复、多 specialist 协作与工作区边界，都会变成必需项。OpenAI Agents SDK 的优势恰恰在于它天然按这一层思考系统。

## 引用

- [1] https://openai.github.io/openai-agents-python — OpenAI Agents SDK docs
- [2] https://raw.githubusercontent.com/openai/openai-agents-python/main/docs/handoffs.md — OpenAI Agents handoffs doc
- [3] https://raw.githubusercontent.com/openai/openai-agents-python/main/docs/guardrails.md — OpenAI Agents guardrails doc
- [4] https://github.com/openai/openai-agents-python — OpenAI Agents SDK GitHub

上一篇：[04 Tracing、Testing、Realtime 与 Voice 的应用形态](/iopanda-blog/ai/03-frameworks/01/29/)——运行时形态讲完后，本篇把它们装回课程助教这个真实系统。

下一篇：[06 OpenAI Agents SDK 与 LangGraph、CrewAI、PydanticAI 的深度对比](/iopanda-blog/ai/03-frameworks/01/31/)——真实案例落地后，再回头看它和其他框架的根本差异。
