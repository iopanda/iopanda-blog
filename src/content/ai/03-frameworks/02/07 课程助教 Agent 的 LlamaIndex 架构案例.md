---
title: "课程助教 Agent 的 LlamaIndex 架构案例"
number: "03.02.07"
chapter: 3
chapterTitle: "Frameworks"
section: 2
sectionTitle: "RAG and Retrieval Frameworks"
group: "01 LlamaIndex"
created: 2026-09-03 21:16
author: "iopanda"
tags: ["framework", "rag", "retrieval", "llamaindex", "case-study", "architecture"]
sourceId: "3.10.3.2 RAG and Retrieval Frameworks/01 LlamaIndex/05 课程助教 Agent 的 LlamaIndex 架构案例"
---
# 课程助教 Agent 的 LlamaIndex 架构案例

> 前四篇已经把 LlamaIndex 的主要部件拆开了：[对象层](/ai/03-frameworks/02/03/)、[ingestion](/ai/03-frameworks/02/04/)、[query chain](/ai/03-frameworks/02/05/)、[多索引与 agentic retrieval](/ai/03-frameworks/02/06/)。这一章把它们重新装回你的课程助教主线：**如果我们要做一个基于课程讲义、FAQ、课程规则、作业说明的知识问答系统，而且重点是把检索层做对，而不是一上来先做复杂 Agent 协作，该怎么用 LlamaIndex 去搭？**

**学习目标**：学完本章，你将能够——

1. 用 LlamaIndex 的对象语言为课程助教设计文档、节点、索引、retriever 和 query engine；
2. 判断课程助教为什么天然是多知识域 retrieval system；
3. 为课程助教设计 ingestion、metadata、routing、rerank 与引用追溯策略；
4. 解释为什么这个系统在 LlamaIndex 里首先像“文档与检索系统”，而不是像“多 Agent 团队”；
5. 画出一版可供开发者实现的 LlamaIndex 架构草图。

## 1. 先定问题：课程助教在这里首先是知识系统

如果你从 LlamaIndex 出发看课程助教，第一步不是先想角色，而是先想：
- 有哪些知识源；
- 它们怎么被读入；
- 怎样切成可检索节点；
- metadata 怎么设计；
- 哪些问题该打到哪个 query engine。

这说明课程助教在 LlamaIndex 下最像：
**一个多知识域检索增强系统。**

## 2. 知识源怎么拆：不要一锅炖成“课程文档库”

建议至少分成 4 类 Document：

| 知识源 | 典型内容 | 为什么单独成域 |
|---|---|---|
| 课程讲义 | 每章教学内容、定义、示例 | 主要承载概念问答 |
| FAQ | 高频问答、常见误区 | 适合高命中短答 |
| 课程规则 | 作业、评分、补交、考试边界 | 权威规则语义更强 |
| 作业说明 | 题目、格式要求、提交规则 | 更偏操作性语义 |

这么拆的好处是：
- metadata 更清楚；
- query engine 更容易专用化；
- 后续路由更容易解释。

## 3. Node 怎么切：不同知识域不一定该用同一种 chunk 粒度

课程讲义常适合按：
- 小节
- 段落
- 主题块
切分。

FAQ 更适合按：
- 一问一答对
切分。

课程规则适合按：
- 规则条款
- 章节条目
切分。

作业说明可能适合按：
- 题目部分
- 提交要求部分
- 评分说明部分
切分。

这说明 Node 的切分策略不该全局统一。课程助教这个案例很能体现：**知识域不同，检索粒度往往也不同。**

## 4. metadata 怎么设计：别等做过滤时才补

建议课程助教的 Node metadata 至少包含：
- `source_type`：lecture / faq / policy / assignment
- `chapter`
- `topic`
- `course_id`
- `version`
- `visibility`
- `updated_at`

为什么这么重要？
- `source_type` 支撑路由和过滤；
- `chapter/topic` 支撑更精确检索；
- `version` 支撑课程更新；
- `visibility` 支撑权限边界；
- `updated_at` 支撑后续 freshness 判断。

对课程助教来说，metadata 不是高级优化，而是后续治理、检索、引用追溯的核心基础。

## 5. 索引怎么拆：至少两层，不建议一开始只放一个大索引

一个合理起点是：
- `course_content_index`
- `policy_index`
- `faq_index`
- `assignment_index`

如果你想先做轻一点，也至少建议：
- 内容索引
- 规则索引

这么做的原因是：
- 讲义与规则的语义本来就不同；
- 规则问答和概念问答经常需要不同 query logic；
- 后续做权限、rerank、评测时会轻松很多。

## 6. query engine 怎么配：别所有问题都打一条链

建议至少这样分：

### 6.1 普通课程问答
- 走 `course_content_index.as_query_engine()`
- 需要正常 rerank / postprocess

### 6.2 规则咨询
- 走 `policy_index.as_query_engine()`
- 输出更强调原文依据与引用

### 6.3 FAQ 型问题
- 优先 `faq_index`
- 若命中低，再回 content / policy

### 6.4 复杂比较 / 综合复习问题
- 走 `SubQuestionQueryEngine`
- 或组合多个 query engine tools

### 6.5 路由
- 用 `RouterQueryEngine` 根据问题类型在 content / policy / faq / assignment 之间选路

这说明课程助教天生就是 RouterQueryEngine 的好例子。

## 7. rerank / postprocess 为什么对课程助教尤其重要

课程助教不是只求“答得像”，还要尽量：
- 引到正确章节；
- 不把过期规则召回进来；
- 不把 FAQ 和正式规则混淆；
- 不把作业说明错当课程理论内容。

所以 node postprocessor / rerank 的价值很大：
- 过滤过时节点；
- 过滤不匹配 source_type；
- 优先权威规则文档；
- 去掉重复解释段落。

也就是说，课程助教的 retrieval quality 不只取决于 top-k 命中，还取决于你后面怎样整理这些节点。

## 8. 课程助教在哪些地方最适合保持“retrieval first”而不是“agent first”

很多团队一做课程助教就想直接上多 Agent，其实未必必要。

在这些场景里，LlamaIndex 式 retrieval-first 往往更合适：
- 课程概念问答；
- 规则引用问答；
- FAQ 高命中问答；
- 复习内容组织；
- 作业要求解释。

只有当你进一步需要：
- 多步工具调用；
- 写操作；
- 复杂审批；
- 长流程记忆；
时，才更自然转向 Agent framework 层。

## 9. 推荐的一版课程助教 LlamaIndex 结构

可以这样理解整个系统：

1. Document layer
- 讲义、FAQ、规则、作业说明

2. Ingestion layer
- reader → chunking → metadata enrich → cache → docstore/vector store

3. Index layer
- 多索引分域存储

4. Query layer
- content / policy / faq / assignment query engines
- RouterQueryEngine
- 复杂问题可选 SubQuestionQueryEngine

5. Output layer
- response synthesis
- citations / source nodes
- 上层应用再决定是否交给 Agent / 审批层

## 10. 动手活动：写课程助教的 LlamaIndex 架构说明

> [!example] 动手活动：输出 `course-ta-llamaindex-architecture.md`
>
> **目标**：为课程助教写一份以知识域、索引、query engine、metadata 为中心的架构说明。
>
> **步骤**：
> 1. 列知识源与文档类型；
> 2. 列 node 切分策略与 metadata；
> 3. 列索引拆分与 query engine 拆分；
> 4. 指定哪类问题走 router，哪类问题走 sub-question；
> 5. 写一段“为什么这里先用 retrieval-first，而不是一开始就 agent-first”的结论。
>
> **完成标准**：另一个工程师只看文档，就能大致实现出同样的 retrieval 系统第一版。

## 11. 边界与排错

- **误区一：课程助教资料不多，一个大索引就够。** 早期可能够，但路由、规则和 FAQ 很快会打架；
- **误区二：metadata 可以后面再补。** 过滤、权限、更新一来就会还债；
- **误区三：FAQ 与规则可以混着查。** 高权威规则和高频问答不是同一种知识源；
- **误区四：复杂问题都交给生成模型自己总结。** 先拆 query engine 或 sub-question 往往更稳；
- **误区五：用了 LlamaIndex 就不需要评测。** retrieval system 更需要评测，而不是更少。

## 12. 总结

| 关键问题 | 一句话 |
|---|---|
| 课程助教在这里像什么 | 一个多知识域 retrieval system |
| 最重要的第一步 | 先拆知识域、文档、节点和 metadata |
| query engine 怎么拆 | 按内容、规则、FAQ、作业说明与复杂问题分层 |
| 为什么适合 RouterQueryEngine | 因为问题类型天然分域 |
| 为什么先 retrieval-first | 很多场景还不需要完整 agent system |
| LlamaIndex 的优势 | 让课程助教可以先把知识层做扎实，再逐步长向 Agent |

**思考题**：为什么课程助教这类系统，若一开始就把“检索系统设计”跳过，直接做成一个会查向量库的聊天机器人，后面几乎一定会在规则冲突、FAQ 混淆、引用追溯和复杂问题分解上补很多债？

> [!note] 参考答案
> 因为那样做会把不同知识域压扁成统一的“上下文来源”，系统无法清楚地区分课程内容、FAQ、正式规则和作业说明。结果就是：规则和 FAQ 容易混、过期内容难过滤、引用难追溯、复杂问题只能硬靠生成模型概括。课程助教表面上像聊天机器人，底层其实更像知识系统；不先把 retrieval system 设计好，后面一定要返工。

## 引用

- [41] https://github.com/run-llama/llama_index — LlamaIndex GitHub
- [46] https://github.com/run-llama/llama_index/blob/main/README.md — LlamaIndex README
- [49] https://github.com/run-llama/llama_index/blob/main/llama-index-core/llama_index/core/ingestion/pipeline.py — LlamaIndex ingestion pipeline source
- [50] https://github.com/run-llama/llama_index/blob/main/llama-index-core/llama_index/core/query_engine/retriever_query_engine.py — LlamaIndex retriever query engine source
- [51] https://github.com/run-llama/llama_index/blob/main/llama-index-core/llama_index/core/query_engine/router_query_engine.py — LlamaIndex router query engine source
- [52] https://github.com/run-llama/llama_index/blob/main/llama-index-core/llama_index/core/query_engine/sub_question_query_engine.py — LlamaIndex sub question query engine source

上一篇：[04 多索引、多数据源与 Agentic Retrieval](/ai/03-frameworks/02/06/)——对象层、查询层和多索引结构都讲完后，本篇把它们组装回课程助教这个真实系统。

下一篇：[06 LlamaIndex 与 Haystack、RAGFlow、LightRAG、Pathway 的深度对比](/ai/03-frameworks/02/08/)——具体案例落地后，再回头看 LlamaIndex 在整个 retrieval framework 版图里的独特位置。
