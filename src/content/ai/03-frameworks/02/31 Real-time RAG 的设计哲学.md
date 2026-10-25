---
title: "Real-time RAG 的设计哲学"
number: "03.02.31"
chapter: 3
chapterTitle: "Frameworks"
section: 2
sectionTitle: "RAG and Retrieval Frameworks"
group: "05 Pathway"
created: 2026-09-03 22:35
author: "iopanda"
tags: ["framework", "rag", "retrieval", "pathway", "realtime", "streaming"]
sourceId: "3.10.3.2 RAG and Retrieval Frameworks/05 Pathway/01 Real-time RAG 的设计哲学"
---
# Real-time RAG 的设计哲学

> Pathway 一上来就不把自己说成“RAG 框架”，而是把自己定义成 Live Data Framework：一个 Python ETL framework，用于 stream processing、real-time analytics、LLM pipelines 和 RAG。[45][68] 这背后的问题意识与 LlamaIndex、Haystack、RAGFlow 都不同：**如果数据不是静态语料，而是持续流入、持续更新、持续重算的，那么 retrieval system 应该从一开始就按 live system 去设计。**

**学习目标**：
1. 解释为什么 Pathway 首先像 live data framework，而不是传统 RAG library；
2. 理解 batch 与 streaming 统一语义为什么对 real-time RAG 很关键；
3. 说出 Pathway 与静态离线索引式 RAG 的根本差异；
4. 判断什么时候你的系统真正需要 real-time RAG；
5. 为一个持续更新知识流写出框架适配判断。

## 1. 概念：real-time RAG 的主角不是向量库，而是数据变化

Pathway README 强调：
- same code for batch and streaming
- scalable Rust engine
- incremental computation
- in-memory pipeline with deployment support。[68]

这说明它首先在解决：
- 数据变化怎么进入系统；
- 更新怎样传播到下游结果；
- 检索如何随新数据及时变化；
- 查询如何在 live 数据环境下保持有效。

## 2. 为什么静态索引心智不够

静态 RAG 往往默认：
- 文档先离线处理好；
- 索引建好；
- 查询只打现成索引。

但当数据是：
- 日志流
- 数据库变更流
- Drive/SharePoint/Notion 持续同步
- 实时业务文档
时，真正困难的是 freshness，不是 first build。

## 3. Pathway 的第一性问题

一句话概括：
**不是“如何检索一份知识库”，而是“知识库持续变化时，结果怎样随它可靠更新”。**

## 4. 适合什么场景

- 实时知识问答
- 持续更新文档中心
- 流式事件驱动 RAG
- 数据变化后希望尽快体现在答案里的系统

## 5. 动手活动

> [!example] 输出 `pathway-live-rag-fit.md`
>
> 列你的数据源是否持续变化、变化频率如何、过期答案代价有多高。写一句结论：为什么这里需要或不需要 real-time RAG。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| Pathway 首先是什么 | 一个 live data / streaming framework，也支持 RAG |
| real-time RAG 在解决什么 | 数据持续变化时，检索结果如何持续正确更新 |
| 和静态 RAG 最大差异 | 重点从索引构建转向更新语义 |

## 引用

- [45] https://github.com/pathwaycom/pathway — Pathway GitHub
- [68] https://github.com/pathwaycom/pathway/blob/main/README.md — Pathway README

上一篇：[05 Pathway](/ai/03-frameworks/02/30/)

下一篇：[02 Streaming ETL、Incremental Index 与 Update Semantics](/ai/03-frameworks/02/32/)
