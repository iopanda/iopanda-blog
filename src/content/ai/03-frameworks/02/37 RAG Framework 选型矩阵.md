---
title: "RAG Framework 选型矩阵"
number: "03.02.37"
chapter: 3
chapterTitle: "Frameworks"
section: 2
sectionTitle: "RAG and Retrieval Frameworks"
group: "06 RAG Framework 选型矩阵"
created: 2026-09-03 23:10
author: "iopanda"
tags: ["framework", "rag", "retrieval", "architecture", "selection"]
sourceId: "3.10.3.2 RAG and Retrieval Frameworks/06 RAG Framework 选型矩阵/README"
---
# RAG Framework 选型矩阵

> 前面五组内容已经把 `03.02 RAG and Retrieval Frameworks` 的五条主路线拆开了：[LlamaIndex](/ai/03-frameworks/02/02/) 代表文档对象与查询对象路线，[Haystack](/ai/03-frameworks/02/09/) 代表显式检索工作流路线，[RAGFlow](/ai/03-frameworks/02/16/) 代表端到端 context engine / 平台路线，[LightRAG](/ai/03-frameworks/02/23/) 代表轻量 graph-enhanced retrieval 路线，[Pathway](/ai/03-frameworks/02/30/) 代表实时数据流与增量更新路线。[41][42][43][44][45] 到这一步，真正值钱的问题已经不是"这些框架分别是什么"，而是：**当一个系统要做 RAG，你怎么判断它最先会死在哪一类 retrieval complexity 上？** 本模块就是把前五条路线收口成一张面向开发者和架构师的选型矩阵。

**学习目标**：学完本模块，你将能够——
1. 用一张表比较五类 retrieval framework 的设计中心、强项、代价与盲区；
2. 区分对象复杂度、管道复杂度、平台复杂度、图检索复杂度、实时流复杂度；
3. 用数据形态、更新频率、查询形态、治理要求、团队能力五个维度做框架判断；
4. 识别四类常见错配：把静态知识库当流系统、把复杂工作流当单索引、把图检索当默认答案、把平台当库；
5. 为一个课程助教或企业知识系统写出 retrieval framework 选型卡。

**本目录计划关注**：
1. 选型方法论：先诊断主矛盾，再用排除法筛选，而不是直接比“谁更强”；
2. 五个框架横向矩阵：第一性差异、数据形态、查询形态、治理运营、反向排除信号；
3. 五类典型业务场景对比，以及四类常见错配；
4. 课程助教系统的完整 retrieval framework 选型卡。

**内容拆分**：
- 01 Retrieval Framework 选型方法论
- 02 五个框架横向矩阵
- 03 典型业务场景对比
- 04 课程助教系统的 retrieval framework 选型卡

## 本目录笔记导航

1. [01 Retrieval Framework 选型方法论](/ai/03-frameworks/02/38/)
2. [02 五个框架横向矩阵](/ai/03-frameworks/02/39/)
3. [03 典型业务场景对比](/ai/03-frameworks/02/40/)
4. [04 课程助教系统的 retrieval framework 选型卡](/ai/03-frameworks/02/41/)

## 引用

- [41] https://github.com/run-llama/llama_index — LlamaIndex GitHub
- [42] https://github.com/deepset-ai/haystack — Haystack GitHub
- [43] https://github.com/infiniflow/ragflow — RAGFlow GitHub
- [44] https://github.com/HKUDS/LightRAG — LightRAG GitHub
- [45] https://github.com/pathwaycom/pathway — Pathway GitHub
- [46] https://github.com/run-llama/llama_index/blob/main/README.md — LlamaIndex README
- [54] https://github.com/deepset-ai/haystack/blob/main/README.md — Haystack README
- [62] https://github.com/infiniflow/ragflow/blob/main/README.md — RAGFlow README
- [68] https://github.com/pathwaycom/pathway/blob/main/README.md — Pathway README

上一篇：[05 Pathway](/ai/03-frameworks/02/30/)——最后一条实时知识流路线已经讲完；本模块把五条 retrieval framework 路线收口成真正可用的选型方法。

下一篇：[01 Retrieval Framework 选型方法论](/ai/03-frameworks/02/38/)
