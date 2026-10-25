---
title: "课程助教 Agent 的 Pathway 架构案例"
number: "03.02.35"
chapter: 3
chapterTitle: "Frameworks"
section: 2
sectionTitle: "RAG and Retrieval Frameworks"
group: "05 Pathway"
created: 2026-09-03 22:35
author: "iopanda"
tags: ["framework", "rag", "retrieval", "pathway", "case-study", "architecture"]
sourceId: "3.10.3.2 RAG and Retrieval Frameworks/05 Pathway/05 课程助教 Agent 的 Pathway 架构案例"
---
# 课程助教 Agent 的 Pathway 架构案例

> 课程助教大多数时候并不是最典型的 Pathway 场景，因为它通常不像实时日志系统那样高频流式更新。但如果你把课程资料、FAQ、规则、作业说明、教学公告、日历变更都纳入同一知识流，并要求“资料一更新，检索层就尽快反映”，那课程助教就开始变得非常像 Pathway 的世界。这个案例不是它最典型的第一用法，但恰好很适合说明：**什么时候课程助教开始从静态知识库变成实时知识流系统。**

**学习目标**：
1. 判断课程助教在什么条件下适合 Pathway；
2. 设计课程资料实时更新的 retrieval path；
3. 区分静态课程问答与实时课程知识流的架构差异；
4. 为课程助教设计 freshness 与 replay 需求；
5. 写出一段“为什么这里值得用或不值得用 Pathway”的结论。

## 1. 什么时候课程助教会变成 Pathway 场景

当这些条件同时出现时：
- 课程公告经常变化；
- FAQ 和规则持续被修订；
- 外部源（Drive / Notion / SharePoint / DB）持续同步；
- 希望查询尽快反映最新内容；
- 重启后仍要恢复知识更新状态。

## 2. 适合的设计

可以把：
- 讲义更新流
- FAQ 更新流
- 规则更新流
- 作业说明更新流
- 教学公告流
接成一条 live data pipeline，再由 Pathway 支撑实时索引和查询服务。[68][70]

## 3. 不适合的情况

如果课程资料：
- 很静态；
- 更新频率低；
- 更关注 chunk/metadata/query-engine 设计；
那 LlamaIndex / Haystack 往往更自然。

## 4. 动手活动

> [!example] 输出 `course-ta-pathway-fit.md`
>
> 列课程助教的更新源、更新频率、可接受延迟、失败恢复要求。写一句结论：它还只是静态知识库，还是已经进入 live knowledge system 阶段。

## 5. 总结

| 关键问题 | 一句话 |
|---|---|
| 课程助教什么时候适合 Pathway | 当它的知识层持续变化并要求近实时反映 |
| 不适合什么时候 | 当它仍主要是静态知识问答系统 |
| Pathway 在这里的价值 | 让知识更新流本身成为系统主骨架 |

## 引用

- [68] https://github.com/pathwaycom/pathway/blob/main/README.md — Pathway README
- [70] https://github.com/pathwaycom/pathway/blob/main/examples/projects/question-answering-rag/README.md — Pathway question answering RAG example

上一篇：[04 生产系统中的吞吐、延迟与治理](/ai/03-frameworks/02/34/)

下一篇：[06 Pathway 与 LlamaIndex、Haystack、RAGFlow、LightRAG 的深度对比](/ai/03-frameworks/02/36/)
