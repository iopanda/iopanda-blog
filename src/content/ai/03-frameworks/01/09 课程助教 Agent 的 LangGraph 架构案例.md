---
title: "课程助教 Agent 的 LangGraph 架构案例"
number: "03.01.09"
chapter: 3
chapterTitle: "Frameworks"
section: 1
sectionTitle: "Agent Frameworks"
group: "01 LangGraph"
created: 2026-09-03 16:05
author: "iopanda"
tags: ["course", "ai-agent", "framework", "langgraph", "case-study", "architecture"]
sourceId: "3.10.3.1 Agent Frameworks/01 LangGraph/06 课程助教 Agent 的 LangGraph 架构案例"
---
# 课程助教 Agent 的 LangGraph 架构案例

> 前五篇已经把 LangGraph 的主要能力拆开了：[为什么要用状态图](/iopanda-blog/ai/03-frameworks/01/04/)、[为什么必须有恢复与中断](/iopanda-blog/ai/03-frameworks/01/05/)、[如何借 prebuilt 快速起步](/iopanda-blog/ai/03-frameworks/01/06/)、[状态到底怎么落盘](/iopanda-blog/ai/03-frameworks/01/07/)、[高级控制流怎么组织](/iopanda-blog/ai/03-frameworks/01/08/)。这一章把这些零件重新组装回一个真实案例：**如果要把课程助教 Agent 做成一个可上线、可恢复、可审计、可人工介入的系统，用 LangGraph 应该怎样拆？** 这篇不是官方教程翻译，而是按前面 01.07 和 02 的治理纪律，给一个面向开发者和架构师的完整结构示例。

**学习目标**：学完本章，你将能够——

1. 把一个课程助教 Agent 从“会回答”拆成“会运行的系统”；
2. 为 LangGraph 设计 state schema、context schema、节点、边、checkpoint 点和 interrupt 点；
3. 区分哪些复杂度应该落在图里，哪些应该落在工具层、护栏层和人工层；
4. 解释为什么课程助教这种看起来简单的系统，最终也会长出状态图；
5. 画出一版足够接近生产系统的 LangGraph 架构草图。

## 1. 问题定义：课程助教不是“问答机器人”，而是“受治理的教学流程”

如果你只看 happy path，课程助教似乎很简单：
- 学生提问；
- 检索资料；
- 模型回答；
- 返回结果。

但一旦把 [章导览](/iopanda-blog/ai/02-agents/00/) 与 [风险评审与发布](/iopanda-blog/ai/01-models/07/05/) 的要求带进来，真实系统马上复杂起来：

1. 有些问题需要检索多轮资料，而不是一次命中；
2. 有些问题涉及成绩、隐私、课程规则，需要权限判断；
3. 有些回答需要结构化输出、引用、甚至升级人工复核；
4. 有些步骤失败后不能整轮重来；
5. 不同用户、不同会话、不同任务需要 thread 隔离；
6. 还要给发布评审留下审计痕迹。

这时它已经不再只是“聊天”，而是一个**带治理要求的长流程系统**。这正是 LangGraph 的适用区间。

## 2. 为什么这类系统适合 LangGraph，而不只是高层 SDK

课程助教的主矛盾并不是“角色很多”，而是：
- 分支多；
- 风险分类多；
- 恢复点重要；
- 人审有正式位置；
- 输出前要过校验。

因此它更像一条带状态和治理的工作流，而不是纯粹的多角色协作系统。若直接用一个高层 agent loop 去承载全部逻辑，会很快出现：
- 什么时候继续检索，埋在 prompt 里；
- 哪一步需要停给人看，写在外围 if/else；
- 哪一步失败能否复用前面的结果，说不清；
- 最后出了事故，只能读长日志猜系统想了什么。

LangGraph 的价值就在于把这些决策边界显式化。

## 3. 先定 schema：state 和 context 必须分开

### 3.1 `state_schema`

建议课程助教至少有这些 state 字段：

| 字段 | 含义 | 生命周期 |
|---|---|---|
| `messages` | 对话消息与工具消息 | 全流程 |
| `user_query` | 当前用户问题 | 全流程 |
| `retrieved_chunks` | 检索得到的候选资料片段 | 可跨多轮检索聚合 |
| `retrieval_attempts` | 已检索次数 | 全流程 |
| `draft_answer` | 模型生成的草稿答案 | 中后段 |
| `risk_flags` | 风险检查结果 | 中后段 |
| `approval_required` | 是否需要人工复核 | 中后段 |
| `approved_answer` | 人工批准或修改后的答案 | 人审后 |
| `final_answer` | 最终返回内容 | 收尾阶段 |
| `audit_events` | 审计痕迹摘要 | 全流程 |

这里有两个设计要点：
- `retrieved_chunks`、`risk_flags`、`audit_events` 很可能需要 reducer/聚合语义；
- `draft_answer`、`final_answer` 则更适合 LastValue 风格的“当前最后值”。

### 3.2 `context_schema`

建议把这些放进 context，而不是 state：

| 字段 | 为什么是 context |
|---|---|
| `user_id` | 本次运行的身份上下文，不应被节点任意修改 |
| `role` | 权限判断用，但不应在图中被篡改 |
| `request_id` | 审计追踪字段 |
| `db_conn` / service clients | 运行依赖，不是业务状态 |
| `current_term` / course_id | 课程作用域 |
| `policy_version` | 风险规则版本 |

这与 [PydanticAI 的依赖边界](/iopanda-blog/ai/03-frameworks/01/33/) 是相通的：**可变业务状态与不可变运行依赖必须分家。**

## 4. 再定节点：按“决策边界”拆，而不是按函数名拆

建议拆成下面几层：

### 4.1 输入层

1. `normalize_input`
   - 清理输入格式；
   - 统一消息结构；
   - 初始化 state。

2. `classify_request`
   - 判断是普通课程问答、成绩查询、治理规则咨询、还是高风险请求；
   - 输出 route label。

### 4.2 检索与生成层

3. `retrieve_materials`
   - 调检索工具；
   - 向 `retrieved_chunks` 聚合片段；
   - 记录 `retrieval_attempts`。

4. `judge_evidence_sufficiency`
   - 判断资料是否足够；
   - 不足则回到检索；
   - 充足则前进到生成。

5. `draft_answer`
   - 基于资料与问题生成草稿；
   - 输出 `draft_answer`。

### 4.3 治理层

6. `risk_check`
   - 判断是否涉及隐私、成绩、越权、政策敏感；
   - 输出 `risk_flags`、`approval_required`。

7. `human_review_interrupt`
   - 若需要人工复核，则 interrupt；
   - 人工回复通过 `Command(resume=...)` 或同类恢复机制回写结果。

### 4.4 收尾层

8. `validate_output`
   - 检查结构、引用、拒答模板、敏感内容；
   - 不通过可回到生成或转人工。

9. `finalize_response`
   - 生成 `final_answer`；
   - 写审计摘要。

10. `persist_audit`
   - 输出必要审计事件；
   - 结束流程。

## 5. 边怎么连：流程图的真正价值在这里

课程助教最关键的不是“有几个节点”，而是边怎么定义：

| 从 | 到 | 条件 |
|---|---|---|
| `normalize_input` | `classify_request` | 固定 |
| `classify_request` | `retrieve_materials` | 普通问答 / 规则咨询 |
| `classify_request` | `risk_check` | 成绩/隐私/高风险请求 |
| `retrieve_materials` | `judge_evidence_sufficiency` | 固定 |
| `judge_evidence_sufficiency` | `retrieve_materials` | 证据不足且次数未超限 |
| `judge_evidence_sufficiency` | `draft_answer` | 证据充足 |
| `draft_answer` | `risk_check` | 固定 |
| `risk_check` | `human_review_interrupt` | 需要人工 |
| `risk_check` | `validate_output` | 风险可自动放行 |
| `human_review_interrupt` | `validate_output` | 人工批准/修改完成 |
| `validate_output` | `draft_answer` | 校验失败但可修正 |
| `validate_output` | `finalize_response` | 校验通过 |
| `finalize_response` | `persist_audit` | 固定 |

这张边表本身就已经是架构文档的一部分。因为它明确回答了：系统为什么会走到某一步，以及失败时为什么会回到哪里。

## 6. checkpoint 该打在哪：不是每一步都一样重要

建议至少在以下节点后 checkpoint：

1. `classify_request` 后
   - 因为这是主路由分叉点；
2. `retrieve_materials` 后
   - 检索成本高，且资料可复用；
3. `draft_answer` 后
   - 草稿生成贵，且供后续审查；
4. `human_review_interrupt` 前后
   - 人工决策必须成为正式恢复点；
5. `finalize_response` 后
   - 最终状态与审计信息要有清晰快照。

这样做的目的不是“多存一些”，而是让失败恢复时：
- 不重做已经贵的工作；
- 不重跑已经人工做过的判断；
- 能清楚区分哪个阶段已经完成。

## 7. interrupt 应该放在哪：不是所有高风险都在最后一层

课程助教至少有三类典型 interrupt 点：

1. **成绩/隐私查询**
   - 需要确认权限和身份；
2. **导出/发送类动作**
   - 即使答案正确，也可能带来不可逆副作用；
3. **模型草稿存在规则冲突**
   - 如资料外编造、敏感边界不清、规则冲突。

关键不是“让人看一下”，而是让人工复核进入图的正规结构：
- 进入前 checkpoint；
- 恢复时有明确 `resume` 输入；
- 审批结果回写 state；
- trace 能看见人在哪一步接管过系统。

## 8. thread_id 怎么设计：别等上线后再想

对课程助教这类系统，一个简单但稳的设计是：
- `thread_id = learner_id + session_id`

如果还要支持某些任务型流程（例如“生成复习提纲”）与普通聊天分开，可以进一步拆成：
- `thread_id = learner_id + task_type + session_id`

为什么要这么早设计？因为后续这些都依赖它：
- 会话恢复；
- 审计查询；
- 单用户数据清理；
- 任务级别回放；
- 多线程并行学习场景隔离。

## 9. 哪些逻辑不该塞进 LangGraph 本身

LangGraph 适合承载的是：
- 控制流；
- 状态语义；
- 中断与恢复；
- 模块化流程。

但下面这些仍应留在图外或作为工具/护栏职责：
- 真正的数据库鉴权；
- PII 正则脱敏实现；
- API 网关级速率限制；
- 向量检索底层实现；
- 组织层面的审批制度。

也就是说：**LangGraph 负责编排和边界，不负责替代所有基础设施。**

## 10. 一个更接近生产的最终结构

你可以把整个课程助教系统理解成：

- LangGraph：负责运行主流程与恢复语义；
- 检索工具层：负责课程资料、成绩、规则查询；
- 护栏层：负责输入/输出与工具边界过滤；
- 审批层：负责人类接管；
- 观测层：负责 trace、审计、监控；
- 持久化层：负责 checkpoints、线程历史、删除与恢复。

这正是为什么 LangGraph 更像“运行时内核”，而不是“又一个 prompt 框架”。

## 11. 动手活动：产出一份课程助教 LangGraph 设计文档

> [!example] 动手活动：输出 `course-ta-langgraph-architecture.md`
>
> **目标**：基于本章内容，为课程助教输出一份可评审的 LangGraph 设计文档。
>
> **步骤**：
> 1. 写 `state_schema` 与 `context_schema`；
> 2. 画节点表与边表；
> 3. 标每个 checkpoint 点与 interrupt 点；
> 4. 指出每个高风险工具的权限与审计策略；
> 5. 写一段“为什么选 LangGraph，而不是更轻 SDK”的结论。
>
> **完成标准**：另一个工程师只看文档，就能实现出同一张图的第一版原型。

## 12. 边界与排错

- **误区一：课程助教只是问答，不需要图。** 一旦加上治理、检索回查、人审、恢复，它就不只是问答；
- **误区二：把所有状态都长期保存。** 临时中间值要区分出来，否则 checkpoint 越积越脏；
- **误区三：人审只写在制度文档，不写进图。** 这样运行时就无法恢复和追踪；
- **误区四：thread_id 随便取。** 后续恢复、审计、删除都会痛；
- **误区五：图能承载控制流，就把权限判断也全交给图。** 真实权限校验仍需在工具/服务层落地。

## 13. 总结

| 关键问题 | 一句话 |
|---|---|
| 课程助教为什么会长成图 | 因为它很快会长出回查、分支、人审、恢复和审计要求 |
| state / context 如何分 | 业务可变状态进 state，身份与依赖进 context |
| 节点怎么拆 | 按决策边界拆，不按函数名拆 |
| checkpoint 打在哪 | 打在高成本、高分叉、高责任的阶段后 |
| interrupt 放在哪 | 放在高风险、不可逆、需要问责的动作前 |
| LangGraph 真正承载什么 | 主流程、状态语义、恢复、中断与运行边界 |

**思考题**：如果课程助教下一阶段要支持“自动为全班生成个性化复习提纲并邮件发送”，为什么你几乎肯定不能继续把它当成一个简单问答 Agent？在 LangGraph 架构上，最先需要扩的会是哪几层？

> [!note] 参考答案
> 因为系统会从单次回答扩展成批量流程：需要按学生逐个生成、记录进度、校验发送对象、支持失败恢复、处理人工审批和发送审计。它不再只是“回答得对不对”，而是“流程能否安全、可控、可恢复地执行完”。在 LangGraph 上，最先要扩的是子图/批量编排、checkpoint 设计、人工审批节点、发送工具的权限与审计，以及 thread/task 粒度的状态隔离。

## 引用

- [1] https://github.com/langchain-ai/langgraph — LangGraph GitHub
- [2] https://docs.langchain.com/oss/python/langgraph/overview — LangGraph docs overview
- [3] https://github.com/langchain-ai/langgraph/tree/main/libs/checkpoint — LangGraph checkpoint README
- [28] https://github.com/langchain-ai/langgraph/tree/main/libs/prebuilt — LangGraph prebuilt README
- [29] https://github.com/langchain-ai/langgraph/blob/main/libs/langgraph/langgraph/graph/message.py — LangGraph message graph source

上一篇：[05 Channels、Command、子图与高级控制流](/iopanda-blog/ai/03-frameworks/01/08/)——高级控制流的零件讲完后，本篇把它们组装回一个真实业务案例。

下一篇：[07 LangGraph 与 CrewAI、OpenAI Agents SDK、PydanticAI 的深度对比](/iopanda-blog/ai/03-frameworks/01/10/)——案例落地之后，再回头看它和其他框架的根本差异。
