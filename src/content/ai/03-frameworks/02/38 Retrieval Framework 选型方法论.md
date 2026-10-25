---
title: "Retrieval Framework 选型方法论"
number: "03.02.38"
chapter: 3
chapterTitle: "Frameworks"
section: 2
sectionTitle: "RAG and Retrieval Frameworks"
group: "06 RAG Framework 选型矩阵"
created: 2026-09-09 13:00
author: "iopanda"
tags: ["framework", "rag", "retrieval", "selection", "methodology"]
sourceId: "3.10.3.2 RAG and Retrieval Frameworks/06 RAG Framework 选型矩阵/01 Retrieval Framework 选型方法论"
---
# Retrieval Framework 选型方法论

> 前面五组内容已经把这一章的五条主路线拆开了：[LlamaIndex](/ai/03-frameworks/02/02/) 代表文档对象与查询对象路线，[Haystack](/ai/03-frameworks/02/09/) 代表显式检索工作流路线，[RAGFlow](/ai/03-frameworks/02/16/) 代表端到端 context engine / 平台路线，[LightRAG](/ai/03-frameworks/02/23/) 代表轻量 graph-enhanced retrieval 路线，[Pathway](/ai/03-frameworks/02/30/) 代表实时数据流与增量更新路线。[41][42][43][44][45] 这一篇不再逐个介绍框架，而是先把“怎么选”本身变成方法论：**先诊断 retrieval system 的主矛盾住在哪一类复杂度上，再用排除法筛掉不对症的框架，而不是直接比较谁的功能列表更长。**

**学习目标**：学完本章，你将能够——
1. 解释为什么选型首先要看“主要复杂度住在哪里”，而不是“能不能做 RAG”；
2. 用对象、管道、平台、图检索、实时流五类复杂度诊断一个系统；
3. 理解“功能覆盖”和“复杂度匹配”不是一回事；
4. 避免把选型问题和生成问题、向量库选型问题混在一起；
5. 产出 retrieval-framework-selection-card.md 的第一版诊断结果。

## 1. 选型首先看什么：不是“能不能做 RAG”，而是“主要复杂度住在哪里”

几乎所有主流框架都能做：
- 文档接入
- chunking
- embedding
- retrieval
- rerank
- generation
- citations
- 某种形式的 evaluation

所以真正的问题从来不是“能不能做 RAG”，而是：
- 你的系统最先痛在哪里；
- 你的团队最先需要哪种语言组织复杂度；
- 哪一层如果处理错了，会先成为瓶颈。

## 2. 把 retrieval system 的复杂度拆成五类

| 复杂度 | 典型问题 |
|---|---|
| 对象复杂度 | 文档、节点、索引、metadata、query objects 怎样组织？ |
| 管道复杂度 | retrieval、rerank、filter、route、generation 怎样串起来？ |
| 平台复杂度 | 知识编译、citation、权限、团队协作、数据运营怎样一体化？ |
| 图检索复杂度 | entity / relation / chunk 如何共同参与召回？ |
| 实时流复杂度 | 数据持续变化时，索引与答案如何随之更新？ |

选型的本质，就是判断哪一种复杂度是你的主矛盾——这五类复杂度和五个框架的设计中心是一一对应的，第 02 篇的横向矩阵会把这层对应关系具体铺开。

## 3. 两个容易踩的误区

- **误区一：RAG framework 都差不多**。它们的第一语言完全不同——LlamaIndex 先讲对象，Haystack 先讲链路，RAGFlow 先讲平台，LightRAG 先讲图增强，Pathway 先讲数据流。把它们当作互相替代的选项，会导致选型标准变成“谁更热门”而不是“谁匹配主矛盾”。
- **误区二：谁功能最多谁最好**。功能覆盖和复杂度匹配不是一回事——一个功能全面但设计中心不对的框架，用起来会持续别扭（比如用轻量文档框架硬撑一个需要平台化权限治理的知识系统）。

## 4. 两个容易混进来的相邻问题

- **把生成问题和检索问题混在一起**：模型选型（用哪个 LLM 生成答案）和 retrieval framework 选型是两个独立决策，混在一起会直接模糊选型判断——检索层设计变差不会因为换了更强的生成模型而被掩盖，反而会被放大。
- **把向量库选型和 retrieval framework 选型混成一回事**：向量库（Qdrant/Weaviate/Milvus/Pinecone/Elasticsearch 等）更像 retrieval infrastructure，retrieval framework 更像组织这层基础设施之上复杂度的语言。两者可以独立决策，framework 换了，向量库未必要换；反之亦然。

## 5. 动手活动

> [!example] 动手活动：输出 `retrieval-framework-selection-card.md`（第一版）
>
> 对你的知识系统写清楚：主矛盾住在对象、管道、平台、图关系还是实时更新五类复杂度中的哪一类（可以是多类）；哪些是相邻但独立的决策（生成模型选型、向量库选型），不要混进来。写一句结论：你的系统现在最先会死在哪一层。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| 选型最先看什么 | 看 retrieval system 的主矛盾住在哪一类复杂度 |
| 五类复杂度 | 对象、管道、平台、图检索、实时流 |
| 两个常见误区 | “都差不多”论、“功能最多最好”论 |
| 两个容易混进来的相邻问题 | 生成模型选型、向量库选型——都应该独立决策 |

## 引用

- [41] https://github.com/run-llama/llama_index — LlamaIndex GitHub
- [42] https://github.com/deepset-ai/haystack — Haystack GitHub
- [43] https://github.com/infiniflow/ragflow — RAGFlow GitHub
- [44] https://github.com/HKUDS/LightRAG — LightRAG GitHub
- [45] https://github.com/pathwaycom/pathway — Pathway GitHub

上一篇：[06 RAG Framework 选型矩阵](/ai/03-frameworks/02/37/)

下一篇：[02 五个框架横向矩阵](/ai/03-frameworks/02/39/)
