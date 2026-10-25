---
title: "Streaming ETL、Incremental Index 与 Update Semantics"
number: "03.02.32"
chapter: 3
chapterTitle: "Frameworks"
section: 2
sectionTitle: "RAG and Retrieval Frameworks"
group: "05 Pathway"
created: 2026-09-03 22:35
author: "iopanda"
tags: ["framework", "rag", "retrieval", "pathway", "streaming", "incremental", "index"]
sourceId: "3.10.3.2 RAG and Retrieval Frameworks/05 Pathway/02 Streaming ETL、Incremental Index 与 Update Semantics"
---
# Streaming ETL、Incremental Index 与 Update Semantics

> Pathway README 最有分量的一句，不是“支持 RAG”，而是：same code can be used for batch jobs, stream replays, and processing data streams；底层由 Rust engine + Differential Dataflow 驱动 incremental computation。[68] 再看 external index integration 文档，就更清楚了：索引不是静态库，而是图计算中的一部分，新增、删除、查询都要纳入更新语义。[71]

**学习目标**：
1. 解释为什么 Pathway 把 streaming ETL 和 retrieval 放在同一个世界里；
2. 理解 incremental index 的价值和限制；
3. 说出 update semantics 为什么比 top-k 参数更关键；
4. 判断什么时候 query stream 必须 append-only；
5. 为一个持续更新知识系统设计增量索引思路。

## 1. streaming ETL 为什么和 RAG 是同一问题

只要知识源在动，RAG 的难点就不只在 query，而在：
- 新文档何时进入系统；
- 旧文档删除怎样反映到结果；
- 延迟和一致性如何平衡；
- 重放和故障恢复时结果是否一致。

这本质上已经是流式数据工程问题。

## 2. external index 文档暴露了什么

`external_index_readme.md` 很关键：
- 提到 as-of-now mode
- query stream 应 append only
- 外部 index 要实现 add/remove/search
- 每个 worker 拿自己的 index instance。[71]

这说明 Pathway 对索引的理解不是黑箱后端，而是计算图中的一个可增量更新对象。

## 3. update semantics 是什么

在静态 RAG 里，更新通常意味着“重建索引”；
在 Pathway 世界里，更新更像：
- add
- remove
- recompute
- replay
- consistency under late/out-of-order data

这决定了系统质量的不只是召回好不好，还有：
- 新数据多久可见；
- 删除多久生效；
- 重启后是否丢状态。

## 4. 为什么 append-only query stream 很重要

external index 文档明确写到：对某些集成，query stream 应 append only，否则后续修改不会触发旧查询答案重算。[71]

这很重要，因为它提醒你：
- real-time retrieval 不是无限自由；
- 不同索引集成对更新语义支持不同；
- 不是所有 live 系统都天然支持“历史查询自动回滚重算”。

## 5. 动手活动

> [!example] 输出 `pathway-update-semantics.md`
>
> 以课程助教为例，列出哪些数据会新增、会删除、会重放，哪些查询只需要 append-only，哪些场景必须重新计算结果。写一句结论：为什么这已经不是普通离线索引问题。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| streaming ETL 与 RAG 为什么连在一起 | 数据一变，检索层就必须跟着变 |
| incremental index 的价值 | 让结果随更新而增量演化，而非全量重建 |
| query append-only 提醒了什么 | 实时系统的查询语义也有限制 |
| Pathway 的重点 | 更新语义和一致性，不只是召回效果 |

## 引用

- [68] https://github.com/pathwaycom/pathway/blob/main/README.md — Pathway README
- [71] https://github.com/pathwaycom/pathway/blob/main/src/external_integration/external_index_readme.md — Pathway external index integration readme

上一篇：[01 Real-time RAG 的设计哲学](/iopanda-blog/ai/03-frameworks/02/31/)

下一篇：[03 Real-time Retrieval、Windowing 与 Freshness](/iopanda-blog/ai/03-frameworks/02/33/)
