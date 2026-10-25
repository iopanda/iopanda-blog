---
title: "课程助教 Agent 的 Haystack 架构案例"
number: "03.02.14"
chapter: 3
chapterTitle: "Frameworks"
section: 2
sectionTitle: "RAG and Retrieval Frameworks"
group: "02 Haystack"
created: 2026-09-03 21:50
author: "iopanda"
tags: ["framework", "rag", "retrieval", "haystack", "case-study", "architecture"]
sourceId: "3.10.3.2 RAG and Retrieval Frameworks/02 Haystack/05 课程助教 Agent 的 Haystack 架构案例"
---
# 课程助教 Agent 的 Haystack 架构案例

> 前四篇已经把 Haystack 的核心拆开了：[pipeline 思维](/iopanda-blog/ai/03-frameworks/02/10/)、[核心组件家族](/iopanda-blog/ai/03-frameworks/02/11/)、[production RAG 纪律](/iopanda-blog/ai/03-frameworks/02/12/)、[动态 route 与 tool-aware retrieval](/iopanda-blog/ai/03-frameworks/02/13/)。这一章把这些零件重新组装回你的课程助教主线：**如果课程助教不是先被建成文档对象系统，也不是先被建成多角色团队，而是先被建成一条透明、可评测、可路由的 retrieval pipeline，它在 Haystack 下应该长什么样？**

**学习目标**：学完本章，你将能够——

1. 用 Haystack 的 component/pipeline 语言为课程助教设计 retrieval chain；
2. 判断哪些地方应该拆 pipeline，哪些地方应该加 route，哪些地方应该接人工；
3. 为课程助教设计 hybrid retrieval、policy route、evaluation 与 observability；
4. 解释为什么这个案例在 Haystack 里首先像“检索工作流”，而不是“一个会说话的机器人”；
5. 画出一版可供开发者实现的 Haystack 架构草图。

## 1. 先定问题：课程助教在这里首先是检索工作流

在 Haystack 视角下，课程助教的第一性问题通常不是：
- 角色如何分工；
而是：
- 问题如何分类；
- 文档如何被召回；
- FAQ、课程内容、课程规则怎样分流；
- 哪一步 rerank；
- 哪一步 build prompt；
- 哪一步生成；
- 哪一步评测与审计。

这说明课程助教在 Haystack 里最像：
**一条多路由、多组件、可评测的检索工作流。**

## 2. 先拆文档域：课程助教至少有三条 retrieval 链

建议至少拆成：
- FAQ 链
- 课程内容链
- 课程规则链

为什么不建议一上来混成一个大 document store？
- FAQ 更适合短答高命中；
- 课程内容更偏概念解释；
- 课程规则更强调权威性与边界性。

从 pipeline 视角看，这意味着你很自然会拥有：
- 不同 retriever
- 不同 filters
- 不同 rerank 需求
- 甚至不同 prompt builder

## 3. 推荐的一版课程助教 pipeline

一条很自然的主链可以是：

1. query classifier / router
2. FAQ / content / policy 分流
3. 对应 retriever
4. 可选 hybrid merge 或 ranker
5. prompt builder
6. chat generator
7. answer builder
8. output evaluation / logging

如果是高风险请求：
- classifier 或 router 应把它送到单独链路：
  - policy retrieval
  - approval/manual review

这样设计的关键在于：**把“去哪找上下文”这件事显式化，而不是交给模型自己猜。**

## 4. retriever 该怎么配

### FAQ 链
- 偏 BM25 / keyword retrieval
- top_k 可以更小
- 追求高命中、高效率

### 课程内容链
- 偏 embedding retrieval 或 hybrid retrieval
- 适合更语义化问题
- 需要较强 rerank

### 课程规则链
- 可偏 BM25 + metadata filter
- 优先保证权威条款召回
- 后续生成应尽量保留引用语气

这说明课程助教不是“一个 retriever 够用”的系统，而是天然多 retrieval style 的系统。

## 5. route 该怎么做

用 Haystack 的语言，route 应是正式 component，而不是几句隐式逻辑。

建议至少分：
- FAQ
- content
- policy
- sensitive escalation

比如：
- 包含“成绩、分数、隐私、删除”等词 → sensitive / policy chain
- 包含“规则、补交、评分标准” → policy chain
- 包含“是什么、为什么、区别” → content chain
- 高频短问 → FAQ chain

真正值钱的不是规则多不多，而是 route 本身可见、可测、可调整。

## 6. rerank / evaluation：课程助教为什么特别需要它们

课程助教最怕这些错：
- 召回了相似但错章的内容；
- 把 FAQ 错当正式规则；
- 把过期规则答给学生；
- 对复杂题给出貌似合理但证据薄弱的答案。

所以要显式加：
- ranker / post-filter
- retrieval recall eval
- context relevance eval
- final answer faithfulness eval

这样才能在调试时回答：
- 是 route 错了？
- 是 retriever 错了？
- 是 ranker 错了？
- 还是 generator 才错？

## 7. approval / manual review 在这里该落哪

课程助教里最典型需要人工接管的，不是普通课程问答，而是：
- 成绩相关问题
- 隐私相关问题
- 权限边界不清的问题
- 规则解释可能引发争议的问题

在 Haystack 里，这通常更适合做成：
- 一条 route 分支
- 或 pipeline 断点 / 外层审批流程

也就是说，人工接管应是工作流节点，不是生成完之后“顺手再看一眼”。

## 8. 为什么这个案例特别像 Haystack

课程助教在 Haystack 下特别顺，是因为它天然有：
- 多 retrieval 风格
- 多知识域
- 明显 route 条件
- 明显 evaluation 需求
- 明显可观测性需求

换句话说，它不像一个需要先搭复杂知识对象世界的系统，也不像一开始必须走多角色协作；它很像一条**透明的 retrieval workflow**。

## 9. 动手活动：写课程助教的 Haystack 架构说明

> [!example] 动手活动：输出 `course-ta-haystack-architecture.md`
>
> **目标**：为课程助教写一份以 pipeline、retriever、route、ranker、evaluation 为核心的架构说明。
>
> **步骤**：
> 1. 定 document stores / data domains；
> 2. 定 retrieval chains；
> 3. 定 router 条件；
> 4. 定 ranker / evaluation / observability；
> 5. 写一段“为什么这里更适合 workflow-first 而不是 object-first 或 agent-first”的结论。
>
> **完成标准**：另一个工程师只看文档，就能理解课程助教为什么是一条多链路 retrieval pipeline。

## 10. 边界与排错

- **误区一：课程助教问题不复杂，一个大 chain 就够。** 实际上 FAQ、规则、课程内容很快会互相打架；
- **误区二：有 route 就不需要评测。** route 本身也要测；
- **误区三：retriever 选好了就够。** ranker 和 generator 同样决定结果；
- **误区四：manual review 放到最后。** 高风险分支应尽早显式化；
- **误区五：pipeline 清楚就一定安全。** 权限与治理仍需额外制度和实现。

## 11. 总结

| 关键问题 | 一句话 |
|---|---|
| 课程助教在这里像什么 | 一条多知识域、多 route、多评测层的 retrieval workflow |
| 为什么要拆多链 | FAQ、课程内容、规则问题不是同一种 retrieval 任务 |
| route 的价值 | 让问题去该去的链，而不是交给模型乱猜 |
| rerank/eval 的价值 | 让系统知道是召回错了、排序错了还是生成错了 |
| Haystack 的优势 | 它非常适合把课程助教做成透明可治理的检索工作流 |

**思考题**：为什么课程助教这种系统，如果不先把 retrieval workflow 设计清楚，而是一开始只追求“回答听起来像对的”，后面一定会在规则引用、FAQ 混淆、人工接管和质量回归上吃很多亏？

> [!note] 参考答案
> 因为课程助教不是普通闲聊，它面对的是不同知识域和不同风险等级的问题。若 retrieval workflow 不清楚，系统就会把 FAQ、课程内容、正式规则混着检索和生成，最后很难回答“为什么这条答案这样来、哪里出了错、何时该转人工”。Haystack 的价值就在于把这条工作流显式化，从 Day 1 就让团队知道上下文是如何流动的。

## 引用

- [54] https://github.com/deepset-ai/haystack/blob/main/README.md — Haystack README
- [55] https://github.com/deepset-ai/haystack/blob/main/haystack/core/pipeline/pipeline.py — Haystack pipeline source
- [57] https://github.com/deepset-ai/haystack/blob/main/haystack/components/retrievers/in_memory/bm25_retriever.py — Haystack BM25 retriever source
- [58] https://github.com/deepset-ai/haystack/blob/main/haystack/components/retrievers/in_memory/embedding_retriever.py — Haystack embedding retriever source
- [59] https://github.com/deepset-ai/haystack/blob/main/haystack/components/routers/conditional_router.py — Haystack conditional router source
- [60] https://github.com/deepset-ai/haystack/blob/main/haystack/components/rankers/llm_ranker.py — Haystack LLM ranker source

上一篇：[04 Agentic Pipeline、Routing 与 Tool-aware Retrieval](/iopanda-blog/ai/03-frameworks/02/13/)——route 与动态 retrieval 讲完后，本篇把它们组装回课程助教这个真实系统。

下一篇：[06 Haystack 与 LlamaIndex、RAGFlow、LightRAG、Pathway 的深度对比](/iopanda-blog/ai/03-frameworks/02/15/)——案例落地后，再回头看 Haystack 在 retrieval framework 版图里的独特位置。
