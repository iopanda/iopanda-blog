---
title: "Entity、Relation、Chunk 与 Graph-aware Retrieval"
number: "03.02.25"
chapter: 3
chapterTitle: "Frameworks"
section: 2
sectionTitle: "RAG and Retrieval Frameworks"
group: "04 LightRAG"
created: 2026-09-03 23:42
author: "iopanda"
tags: ["framework", "rag", "retrieval", "lightrag", "entity", "relation", "chunk"]
sourceId: "3.10.3.2 RAG and Retrieval Frameworks/04 LightRAG/02 Entity、Relation、Chunk 与 Graph-aware Retrieval"
---
# Entity、Relation、Chunk 与 Graph-aware Retrieval

> LightRAG 的关键不在“用了图数据库”这么表面，而在它把 retrieval 单元从纯 chunk 扩成了 chunk + entity + relation 的组合视角。[72] 这意味着系统不再只问“哪段文本最像”，还问“哪些实体相关、哪些关系链值得进入上下文”。

**学习目标**：
1. 理解 entity / relation / chunk 三层各自解决什么；
2. 解释 graph-aware retrieval 为什么比纯向量检索更擅长关系型问题；
3. 说出为什么图关系不该替代 chunk，而是补足 chunk；
4. 判断什么问题更适合 local / global / hybrid；
5. 为一个知识系统设计图增强召回思路。

## 1. chunk 解决局部文本，entity/relation 解决结构语义

chunk 擅长：
- 原文片段召回
- 细节保真
- 直接引用

entity/relation 擅长：
- 跨文档概念连接
- 规则依赖
- 比较与归纳
- 关系链解释

所以 LightRAG 不是“抛弃 chunk”，而是给 chunk 加上结构语义支撑。

## 2. 为什么 graph-aware retrieval 很适合复杂问答

当问题是：
- A 和 B 有什么关系？
- 第 3 章和第 5 章如何关联？
- 这个规则受哪些前提限制？
纯相似 chunk 往往不够，因为信息分散在多个段落、多个文档或多个概念节点里。

图关系在这里的价值是：把“本来分散的上下文”组织成可召回结构。

## 3. 但图不是越多越好

图增强的代价也很真实：
- 抽取质量受 LLM 影响；
- 更新、删除、重建更复杂；
- 关系脏了会误导检索。

所以 entity/relation 值不值，要看你的查询是否真的受益于结构语义。

## 4. 总结

| 关键问题 | 一句话 |
|---|---|
| chunk 在做什么 | 保留局部原文与可引用上下文 |
| entity/relation 在做什么 | 提供跨 chunk 的结构语义 |
| LightRAG 的独特性 | 同时把原文和关系都纳入召回面 |

## 引用

- [72] https://github.com/HKUDS/LightRAG/blob/main/README.md — LightRAG README

上一篇：[01 LightRAG 的设计哲学：为什么是“轻量图检索”](/ai/03-frameworks/02/24/)

下一篇：[03 Vector RAG vs Graph RAG vs Hybrid RAG](/ai/03-frameworks/02/26/)
