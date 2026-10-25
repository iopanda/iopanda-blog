---
title: "Pathway"
number: "03.02.30"
chapter: 3
chapterTitle: "Frameworks"
section: 2
sectionTitle: "RAG and Retrieval Frameworks"
group: "05 Pathway"
created: 2026-09-03 20:05
author: "iopanda"
tags: ["framework", "rag", "retrieval", "pathway"]
sourceId: "3.10.3.2 RAG and Retrieval Frameworks/05 Pathway/README"
---
# Pathway

> 模块定位：从“流式数据路径与实时 RAG”这条路线理解 retrieval system。Pathway 适合回答：如果数据持续变化、索引不能靠每天离线重建、系统要随数据流实时更新上下文，该怎么设计 retrieval layer？[45]

**本目录计划关注**：
1. Pathway 为什么把自己定位成 stream processing + LLM/RAG framework；
2. 流式 ETL、增量更新、实时索引与实时 retrieval；
3. 与静态离线索引式 RAG 的根本差异；
4. 课程助教 / 实时知识更新系统案例；
5. 与 LlamaIndex、Haystack、RAGFlow、LightRAG 的对比。

**建议后续拆分**：
- 01 Real-time RAG 的设计哲学
- 02 Streaming ETL、Incremental Index 与 Update Semantics
- 03 Real-time Retrieval、Windowing 与 Freshness
- 04 生产系统中的吞吐、延迟与治理
- 05 课程助教 Agent 的 Pathway 架构案例
- 06 Pathway 与 LlamaIndex、Haystack、RAGFlow、LightRAG 的深度对比

## 本目录笔记导航

1. [01 Real-time RAG 的设计哲学](/iopanda-blog/ai/03-frameworks/02/31/)
2. [02 Streaming ETL、Incremental Index 与 Update Semantics](/iopanda-blog/ai/03-frameworks/02/32/)
3. [03 Real-time Retrieval、Windowing 与 Freshness](/iopanda-blog/ai/03-frameworks/02/33/)
4. [04 生产系统中的吞吐、延迟与治理](/iopanda-blog/ai/03-frameworks/02/34/)
5. [05 课程助教 Agent 的 Pathway 架构案例](/iopanda-blog/ai/03-frameworks/02/35/)
6. [06 Pathway 与 LlamaIndex、Haystack、RAGFlow、LightRAG 的深度对比](/iopanda-blog/ai/03-frameworks/02/36/)

上一篇：[04 LightRAG](/iopanda-blog/ai/03-frameworks/02/23/)

下一篇：[01 Real-time RAG 的设计哲学](/iopanda-blog/ai/03-frameworks/02/31/)
