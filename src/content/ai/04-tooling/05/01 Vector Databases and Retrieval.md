---
title: "Vector Databases and Retrieval"
number: "04.05.01"
chapter: 4
chapterTitle: "Tooling"
section: 5
sectionTitle: "Vector Databases and Retrieval"
group: ""
created: 2026-09-03 18:29
author: "iopanda"
tags: ["course", "ai-tooling", "vector-db-retrieval"]
sourceId: "3.10.4.5 Vector Databases and Retrieval/README"
---
# Vector Databases and Retrieval

> `03.02 RAG and Retrieval Frameworks` 已经回答了“检索系统如何被框架组织起来”；`04.05` 则回到更底层的问题：**那些真正承载 embedding、payload、filter、hybrid search、ANN、索引更新与查询语义的检索后端，应该怎样理解？** 这一章的重点不是把向量库当成“存 embedding 的桶”，而是看它们分别把什么复杂度当作一等公民。

**学习目标**：完成本模块后，你将能够——

1. 区分 vector database、search engine、hybrid retrieval backend 各自解决的问题；
2. 解释 Qdrant、Weaviate、Milvus、OpenSearch、Chroma 的设计中心差异；
3. 理解过滤、payload/schema、hybrid search、规模化、实时更新为何会改变选型；
4. 为课程助教或企业知识库画出 retrieval backend 选型卡；
5. 知道什么时候该把复杂度留给 framework，什么时候必须下沉到底层检索后端。

## 1. 为什么这一组工具要单独讲

- 很多人第一次做 RAG 时只盯着 chunk 和 prompt，却忽略了底层查询语义、过滤、索引维护与运维成本；
- 向量数据库之间不是“谁都差不多”，它们在 schema、云原生、混合检索、开发体验、规模化上差异很大；
- 这一章承接 `03.02`：前者讲如何组织 retrieval system，这里讲 retrieval system 靠什么底座站住；
- 学习重点不是背 ANN 名词，而是知道系统最先会被哪类检索复杂度拖住。

## 2. 2026-09 我建议先聚焦的开源产品

| 产品 | 一句话定位 | 设计中心 | 更适合谁 |
|---|---|---|---|
| [Qdrant](/iopanda-blog/ai/04-tooling/05/02/) | 强调 payload 过滤与工程易用性的向量检索后端 | vector search + filtering + practical API | 想快速做工程落地的团队 |
| [Weaviate](/iopanda-blog/ai/04-tooling/05/03/) | 对象与向量并存、偏 schema / module 生态的路线 | objects + vectors、modules、cloud-native | 重视对象建模与可扩展生态的团队 |
| [Milvus](/iopanda-blog/ai/04-tooling/05/04/) | 高性能、云原生、规模化 ANN 的经典路线 | scale、performance、cloud-native vector DB | 数据量大、吞吐与集群能力要求高的团队 |
| [OpenSearch](/iopanda-blog/ai/04-tooling/05/05/) | 从通用搜索引擎延伸到向量与混合检索 | text search + filters + vector/hybrid | 本来就有搜索基础设施的组织 |
| [Chroma](/iopanda-blog/ai/04-tooling/05/06/) | 强调开发者友好与本地原型的检索基础设施 | developer UX、local-first、simple collections | 先做原型和中小规模应用的团队 |

## 3. 这一模块建议怎么读

1. 先看 [01 Qdrant](/iopanda-blog/ai/04-tooling/05/02/) 与 [05 Chroma](/iopanda-blog/ai/04-tooling/05/06/)：从工程易用与原型体验切入；
2. 再看 [02 Weaviate](/iopanda-blog/ai/04-tooling/05/03/)：理解对象建模与模块生态路线；
3. 然后看 [03 Milvus](/iopanda-blog/ai/04-tooling/05/04/)：理解规模化与性能为什么会改变架构；
4. 最后看 [04 OpenSearch](/iopanda-blog/ai/04-tooling/05/05/)：理解搜索引擎世界如何与向量检索合流。

## 4. 我建议本模块的内容结构

这一模块可以复用你已经稳定下来的写法：

1. 本组总览 README；
2. 每个产品一个文件夹与 `README.md`；
3. 每个产品至少拆成 4~6 篇：
   - 它为什么存在 / 解决什么首要复杂度；
   - 核心抽象、架构与部署形态；
   - 与同类产品相比的设计中心；
   - 在课程助教或企业内部知识系统中的落点；
   - 适用边界、排错与迁移成本；
4. 最终再补一篇本组的选型矩阵：回答“为什么选 A，不选 B”。

## 5. 本模块的推荐交付物

| 交付物 | 说明 | 验收标准 |
|---|---|---|
| retrieval-backend-selection-card.md | 按规模、过滤、更新、混合检索需求选后端 | 能说清“为什么选这个库，不选那个库” |
| metadata-and-filtering-plan.md | 设计 metadata schema 与过滤策略 | 避免只有相似度、没有业务约束 |
| rag-infra-boundary.md | 定义 framework 与 backend 的分工边界 | 知道复杂度应落在哪层 |

## 6. 本模块笔记导航

1. [01 Qdrant](/iopanda-blog/ai/04-tooling/05/02/)
2. [02 Weaviate](/iopanda-blog/ai/04-tooling/05/03/)
3. [03 Milvus](/iopanda-blog/ai/04-tooling/05/04/)
4. [04 OpenSearch](/iopanda-blog/ai/04-tooling/05/05/)
5. [05 Chroma](/iopanda-blog/ai/04-tooling/05/06/)

## 7. 这一模块该怎么学，才不会学成“产品说明书”

- 不要先记安装命令，先问它把哪类复杂度当作一等公民；
- 不要只看 happy path，重点看治理、排错、迁移、协作与上线证据；
- 不要问“谁最强”，要问“谁最匹配当前系统的首要矛盾”；
- 不要把开源工具当成银弹，工具只是把某类工程纪律做成现成组件。

## 8. 总结

| 关键问题 | 一句话 |
|---|---|
| 这一模块讲什么 | RAG 背后的检索后端与向量数据库 |
| 为什么重要 | 很多 RAG 失败不是因为模型差，而是因为检索底座太弱 |
| 代表产品 | Qdrant / Weaviate / Milvus / OpenSearch / Chroma |
| 学习重点 | 看过滤、更新、规模化与混合检索的真实代价 |

## 引用

- [141] https://github.com/qdrant/qdrant — Qdrant GitHub
- [142] https://github.com/weaviate/weaviate — Weaviate GitHub
- [143] https://github.com/milvus-io/milvus — Milvus GitHub
- [144] https://github.com/opensearch-project/OpenSearch — OpenSearch GitHub
- [145] https://github.com/chroma-core/chroma — Chroma GitHub

上一篇：[04.04 Prompt Management](/iopanda-blog/ai/04-tooling/04/01/)——prompt 是前台约束；本章开始看 RAG 的后台基础设施。

下一篇：[04.06 Data Curation and Annotation](/iopanda-blog/ai/04-tooling/06/01/)——检索底座之外，数据本身如何被清洗、标注、精选，也是一整条工具链。
