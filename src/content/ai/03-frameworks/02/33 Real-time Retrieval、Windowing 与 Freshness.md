---
title: "Real-time Retrieval、Windowing 与 Freshness"
number: "03.02.33"
chapter: 3
chapterTitle: "Frameworks"
section: 2
sectionTitle: "RAG and Retrieval Frameworks"
group: "05 Pathway"
created: 2026-09-03 22:35
author: "iopanda"
tags: ["framework", "rag", "retrieval", "pathway", "freshness", "windowing"]
sourceId: "3.10.3.2 RAG and Retrieval Frameworks/05 Pathway/03 Real-time Retrieval、Windowing 与 Freshness"
---
# Real-time Retrieval、Windowing 与 Freshness

> Pathway 最大的不同在于，它天然把 freshness 当一等问题，而不是运维附加问题。README 明说处理 late / out-of-order 数据、支持 persistence、强调 consistency。[68] 这意味着 retrieval 质量不只取决于相似度，还取决于答案是不是基于足够新的上下文。

**学习目标**：
1. 解释 freshness 为什么是 real-time RAG 的核心质量维度；
2. 理解 late / out-of-order data 对 retrieval 的影响；
3. 说出 windowing / consistency 在实时知识系统中的作用；
4. 区分“召回正确”和“时间上正确”；
5. 为一个实时知识场景设计 freshness 策略。

## 1. freshness 不是锦上添花，而是 correctness 的一部分

如果知识源持续变化，那么一个语义上很相关、但已经过期的 chunk，本质上也是错误上下文。

所以 real-time retrieval 至少有两层正确性：
- 检索相关性正确；
- 时间相关性正确。

## 2. late / out-of-order 为什么重要

流系统里，新数据不一定按理想顺序到达。Pathway 把这件事放进框架核心，说明它默认真实数据源会乱序。[68]

对于 RAG，这意味着：
- 最后到的不一定是最新被处理到的；
- 更新传播时序会影响答案；
- consistency 和 latency 需要平衡。

## 3. windowing / persistence 的价值

窗口和持久化的价值，不只是算子层特性，而是 retrieval 结果能否在重启、延迟、重放后仍保持可理解的一致行为。[68]

## 4. 适合什么系统

- 实时监控与问答
- 持续更新的文档中心
- 会被频繁修订的知识源
- 对“最新信息”高度敏感的系统

## 5. 动手活动

> [!example] 输出 `pathway-freshness-plan.md`
>
> 选择一个数据持续变化的知识场景，写出：哪些信息必须分钟级更新，哪些可小时级，哪些需要重放恢复。写一句结论：为什么 freshness 本身就是 retrieval quality。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| freshness 是什么 | 上下文的新鲜度与时间正确性 |
| 为什么重要 | 过期但相关的答案同样会误导用户 |
| Pathway 的优势 | 它从框架层正视更新、一致性和重放问题 |

## 引用

- [68] https://github.com/pathwaycom/pathway/blob/main/README.md — Pathway README

上一篇：[02 Streaming ETL、Incremental Index 与 Update Semantics](/iopanda-blog/ai/03-frameworks/02/32/)

下一篇：[04 生产系统中的吞吐、延迟与治理](/iopanda-blog/ai/03-frameworks/02/34/)
