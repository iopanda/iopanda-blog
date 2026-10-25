---
title: "多索引、多数据源与 Agentic Retrieval"
number: "03.02.06"
chapter: 3
chapterTitle: "Frameworks"
section: 2
sectionTitle: "RAG and Retrieval Frameworks"
group: "01 LlamaIndex"
created: 2026-09-03 21:06
author: "iopanda"
tags: ["framework", "rag", "retrieval", "llamaindex", "multi-index", "workflow", "agentic-retrieval"]
sourceId: "3.10.3.2 RAG and Retrieval Frameworks/01 LlamaIndex/04 多索引、多数据源与 Agentic Retrieval"
---
# 多索引、多数据源与 Agentic Retrieval

> 到这里为止，LlamaIndex 的主线已经逐渐清楚：[对象层](/iopanda-blog/ai/03-frameworks/02/03/) 定义了文档和节点，[ingestion](/iopanda-blog/ai/03-frameworks/02/04/) 定义了数据怎么进入系统，[query chain](/iopanda-blog/ai/03-frameworks/02/05/) 定义了知识怎么被取出并拼成答案。但真实系统很少永远停在“一个索引、一类文档、一种查询模式”。只要系统一长大，就会遇到：多文档源、多索引、多 query engine、多 retriever、甚至更 agentic 的 retrieval decision。LlamaIndex README 里已经明确把 workflows、agents、indices、retrievers、query engines、reranking modules 都列为可定制模块；core 和 integrations 的巨大生态也说明，它从一开始就在为“多源知识系统”做准备。[41][46]

**学习目标**：学完本章，你将能够——

1. 解释为什么真实 RAG 系统很快会从单索引长成多索引、多数据源系统；
2. 理解 LlamaIndex 为什么天然适合“对象扩展式”地进入 agentic retrieval；
3. 说出多索引、多数据源、多 query engine 系统最核心的架构问题；
4. 区分“复杂 retrieval”与“把检索也做成 agent”之间的边界；
5. 为一个课程助教或企业知识系统设计多索引 retrieval 架构。

## 1. 为什么单索引心智很快就不够用

最小 RAG 往往从：
- 一个文档目录；
- 一个切块策略；
- 一个向量索引；
- 一个 query engine
开始。

这在 demo 阶段常常够用，但真实系统很快会遇到：
- 不同知识域：FAQ、政策、讲义、数据库说明；
- 不同查询模式：事实问答、规则说明、复杂比较、汇总型问题；
- 不同更新节奏：有些文档每天变，有些几乎不变；
- 不同权限边界：有些可公开，有些只对特定身份开放。

这时若还试图用一个统一索引硬扛，问题通常不是“完全不能用”，而是：
- 召回不稳定；
- 路由不清；
- metadata 过滤压力越来越大；
- 评测和调试越来越困难。

## 2. 为什么 LlamaIndex 特别适合多索引系统

LlamaIndex 的对象层设计天然适合扩展：
- 不同数据源可以是不同 Document 集；
- 不同索引可以承载不同 Node 集；
- 不同 retriever / query engine 可以按知识域分开；
- 最后用 RouterQueryEngine、SubQuestionQueryEngine 或 workflow 式编排把它们连接起来。[46][50][51][52]

这和某些“从单条 pipeline 起手”的框架不同。LlamaIndex 更像在说：
**先把知识对象世界搭出来，再让查询对象世界接管复杂度。**

## 3. 多数据源：为什么接入能力不是“会读 PDF”那么简单

README 里反复强调 data connectors 与 300+ integrations。[46] 这意味着在 LlamaIndex 里，多数据源不是例外，而是常态。

对架构师来说，多数据源真正带来的问题包括：
- 接入格式不同；
- 更新节奏不同；
- metadata 规范不同；
- 权限模型不同；
- 是否该进入同一 index 也不同。

所以“多数据源”真正的系统问题不是能否读入，而是：
- 是否该共用 node schema；
- 是否该共用 chunk strategy；
- 是否该共用 retriever；
- 是否该共用 query engine。

## 4. 多索引：为什么有时“分开存”比“全混一起检”更专业

多索引不是炫技，而是知识域治理。

适合分索引的典型情况：
- 课程讲义 vs 课程规则；
- FAQ vs 历史工单；
- 公开文档 vs 敏感内部文档；
- 结构化数据库说明 vs 非结构化说明文档。

分索引的好处：
1. 路由更清楚；
2. 召回质量更容易优化；
3. metadata 过滤压力降低；
4. 权限边界更容易分层。

代价是：
- 需要路由；
- 需要跨索引组合查询策略；
- 需要更明确的评测体系。

## 5. agentic retrieval：什么时候 retrieval 本身开始“像 Agent”

LlamaIndex 虽然在这个模块里我们先把它当 retrieval framework 看，但 README 已经明确把 agentic applications、workflows、retrievers、query engines 放在同一个大版图里。[46]

这说明在它的世界里，retrieval 会逐渐长出更 agentic 的行为，例如：
- 先尝试一个 retriever；
- 发现证据不足，再换另一个；
- 先路由到 FAQ，再发现应该查规则库；
- 先拆子问题，再分别交给不同 query engines。

这类行为介于传统检索和完整 agent system 之间。它不是“检索就是个被动函数”，而更像“检索也会决策下一步”。

## 6. 但别把一切复杂 retrieval 都叫 agentic retrieval

这点非常重要。

复杂 retrieval 不等于 agentic retrieval。

例如：
- 固定的 hybrid search + rerank
- 固定的 router 规则
- 固定的多索引 fallback

这些可以很复杂，但仍然是确定性系统。

只有当系统开始出现：
- 动态选择 retriever；
- 动态决定是否拆子问题；
- 动态选择 query engine 组合；
- 动态决定要不要继续找更多证据；
才更接近 agentic retrieval。

这一区分很值钱，因为它直接影响：
- 你该用 deterministic pipeline 还是更自由的 query/workflow system；
- 评测该怎么做；
- 护栏和预算该怎么设。

## 7. 课程助教很适合做多索引示例

课程助教天然可以拆成：
- `course_content_index`
- `course_policy_index`
- `faq_index`
- `assignment_index`

再进一步：
- 普通知识问答先走 course_content；
- 规则问题走 policy；
- 复杂复习比较题走 sub-question；
- 如果资料不足，可再追加 FAQ 或作业说明。

这比“把所有文档混成一个大索引”更能说明系统为什么答对，也更容易做后续评测和治理。

## 8. 为什么这条路线对开发者和架构师都友好

### 对开发者
- 组件可渐进扩展；
- 从单 index 慢慢长到多 index，不必推倒重来；
- 可以先用 query engine objects 控制复杂度。

### 对架构师
- 能把知识域边界显式化；
- 能讨论索引策略和权限策略；
- 能区分数据组织问题和模型回答问题。

这就是 LlamaIndex 的一大优势：复杂度是沿对象家族自然长出来的，而不是一开始就要求你接受全量大 pipeline。

## 9. 动手活动：给课程助教设计多索引 retrieval 架构

> [!example] 动手活动：输出 `llamaindex-multi-index-plan.md`
>
> **目标**：把课程助教从单索引 demo 升级成多索引 retrieval system。
>
> **步骤**：
> 1. 按知识域拆索引：讲义、规则、FAQ、作业说明；
> 2. 为每个索引定义 node 粒度和 metadata；
> 3. 定义哪类问题走哪类 query engine；
> 4. 定义哪些复杂问题走 sub-question；
> 5. 写一句结论：为什么不能一直靠一个统一索引解决所有问题。
>
> **完成标准**：你能清楚说明“多索引不是增加复杂度，而是在控制复杂度”。

## 10. 边界与排错

- **误区一：多索引 = 更高级。** 若知识域不清，拆太多会徒增路由负担；
- **误区二：一出现复杂查询就要上 Agent。** 很多时候 Router/SubQuestion 已够；
- **误区三：多数据源一定要共用一套 ingestion。** 数据语义不同，未必该共用；
- **误区四：agentic retrieval 越多越好。** 决策越动态，评测和预算也越难；
- **误区五：复杂 retrieval 和复杂工作流是一回事。** retrieval 复杂度和 agent workflow 复杂度应区分。

## 11. 总结

| 关键问题 | 一句话 |
|---|---|
| 为什么单索引不够 | 多知识域、多更新节奏、多权限边界会把它压垮 |
| LlamaIndex 为什么适合扩到多索引 | 对象层和查询对象层都支持渐进扩展 |
| agentic retrieval 的正确理解 | retrieval 开始动态决定下一步，而不只是被动 top-k |
| 多索引的价值 | 让知识域边界、路由边界和治理边界更清楚 |
| 课程助教为什么适合这条路线 | 它天然就是多知识域系统 |

**思考题**：为什么一个系统越是想回答“复杂问题”，越不能只靠一个大索引和统一 top-k 检索硬扛？LlamaIndex 的多 query engine / 多索引路线，本质上是在替系统管理哪一类增长中的复杂度？

> [!note] 参考答案
> 因为复杂问题往往不是“同一个知识域里再多找几段”就能解决，而是需要不同知识域、不同检索策略和不同合成方式协同。一个大索引会把这些差异压平，导致召回、路由、治理和评测都越来越糊。LlamaIndex 的多 query engine / 多索引路线，本质上是在替系统管理“查询形态和知识域同时增长”的复杂度。

## 引用

- [41] https://github.com/run-llama/llama_index — LlamaIndex GitHub
- [46] https://github.com/run-llama/llama_index/blob/main/README.md — LlamaIndex README
- [51] https://github.com/run-llama/llama_index/blob/main/llama-index-core/llama_index/core/query_engine/router_query_engine.py — LlamaIndex router query engine source
- [52] https://github.com/run-llama/llama_index/blob/main/llama-index-core/llama_index/core/query_engine/sub_question_query_engine.py — LlamaIndex sub question query engine source

上一篇：[03 Retriever、Query Engine、Rerank 与 Router](/iopanda-blog/ai/03-frameworks/02/05/)——查询对象族已经出现；本篇继续看它如何扩展到多索引、多数据源与更 agentic 的 retrieval。

下一篇：[05 课程助教 Agent 的 LlamaIndex 架构案例](/iopanda-blog/ai/03-frameworks/02/07/)——对象层、ingestion、query chain 和多索引都讲完后，下一篇把它们组装回课程助教这个真实系统。
