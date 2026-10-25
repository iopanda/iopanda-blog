---
title: "RAG and Retrieval Frameworks"
number: "03.02.01"
chapter: 3
chapterTitle: "Frameworks"
section: 2
sectionTitle: "RAG and Retrieval Frameworks"
group: ""
created: 2026-09-03 20:00
author: "iopanda"
tags: ["ai", "frameworks", "rag", "retrieval", "learning-path"]
sourceId: "3.10.3.2 RAG and Retrieval Frameworks/README"
---
# RAG and Retrieval Frameworks

> `01 Models` 解决了模型本体怎么训练、评测、部署与治理；`02 Agents` 解决了模型怎样规划、调用工具、记忆与协作；`03.01 Agent Frameworks` 则回答了“把 Agent 做成系统，该拿什么框架承载”。接下来的 `03.02 RAG and Retrieval Frameworks` 要回答另一类同样关键、但经常被低估的问题：**当系统的价值越来越依赖“找到什么上下文、怎么切、怎么召回、怎么重排、怎么流入生成”时，应该拿什么框架来构建检索增强层？** 这一模块不把 RAG 看成“给大模型塞几段参考资料”的小技巧，而是把它视为一条完整的数据—索引—召回—重排—生成—评测—治理链路。[41][42][43][44][45]

**学习目标**：完成本模块后，你将能够——

1. 说出为什么 RAG 的复杂度首先不在 prompt，而在 retrieval system；
2. 区分五条主流 RAG / Retrieval Framework 路线：文档中心、管道中心、RAG engine、轻量图检索、流式数据路径；
3. 解释为什么同样是做 RAG，LlamaIndex、Haystack、RAGFlow、LightRAG、Pathway 的设计中心各不相同；
4. 用数据规模、更新频率、召回复杂度、治理要求、实时性要求，为真实项目选框架；
5. 为一个课程助教或知识问答系统写出 retrieval framework 选型卡。

## 1. 为什么 03 还要单开一个 RAG Framework 模块

- 很多团队第一次做 RAG，会误以为它只是：切 chunk → 做 embedding → top-k 检索 → 拼 prompt。
- 这条 happy path 在 demo 里常常够用，但一旦进入真实系统，很快就会出现：
  - 数据入口不止一种（PDF、网页、表格、数据库、知识库）；
  - chunking 与 metadata 影响召回质量；
  - 混合检索、rerank、过滤、权限、租户隔离都会进入主路径；
  - 文档更新后索引如何增量刷新；
  - 线上如何评测“检索是否真的比没检索好”；
  - 什么时候该做 graph RAG、什么时候该做 streaming RAG、什么时候只该做最小检索增强。
- 所以 RAG 的真正复杂度，不在“模型会不会说”，而在：**系统到底把什么取出来，为什么取出来，怎样证明取得对。**

## 2. 2026-09 我建议这一模块先聚焦的 top 5

> [!note] 现实边界
> 这里的 top 5 不是“RAG 领域唯一正确榜单”，而是按 2026-09 的工程代表性和教学价值筛出来的五条路线：文档索引、检索管道、端到端 RAG 引擎、轻量图检索、实时流式数据路径。[41][42][43][44][45]

| 框架 | 一句话定位 | 设计中心 | 更像什么 | 更适合谁 |
|---|---|---|---|---|
| [LlamaIndex](/ai/03-frameworks/02/02/) | 文档与索引优先的 LLM data framework | ingestion、index、retriever、query engine | 文档操作系统 | 以知识库/文档问答为核心的团队 |
| [Haystack](/ai/03-frameworks/02/09/) | 检索与生成显式管道框架 | pipeline、components、evaluation、production RAG | 检索流水线框架 | 想显式控制检索/生成/评测链路的团队 |
| [RAGFlow](/ai/03-frameworks/02/16/) | 端到端 RAG engine | parsing、indexing、retrieval、agent-capable context layer | RAG 平台/引擎 | 想快速拿到完整 RAG 平台体验的团队 |
| [LightRAG](/ai/03-frameworks/02/23/) | 轻量、快速的 graph-enhanced RAG 路线 | graph-aware retrieval、simple+fast retrieval design | 轻量图检索框架 | 想理解 graph RAG 但不想一上来上重平台的团队 |
| [Pathway](/ai/03-frameworks/02/30/) | 流式数据路径与实时 RAG 路线 | streaming ETL、incremental updates、real-time retrieval | 实时数据管道框架 | 数据在持续变化、不能靠静态离线索引的团队 |

## 3. 为什么先不把 LangChain、向量数据库放进这一组 top 5

- `LangChain` 更像通用 agent / LLM 应用平台，而不是这组里最聚焦的 retrieval framework；若后面要写“通用应用框架如何承载 RAG”，可以单独作为横向补充，不必放进本模块的第一批主角里。
- `Qdrant / Weaviate / Milvus / Pinecone / Elasticsearch` 很重要，但它们更像**retrieval infrastructure / vector store / search backend**，而不是本模块想先聚焦的“RAG framework 设计语言”。更合理的放置位置是后续 `04 Tooling`，或在本模块各篇中作为外部后端生态讲解。
- 也就是说，这一模块先讲“框架如何组织 retrieval 系统”，而不是先讲“底层搜索引擎怎么选”。

## 4. 这一模块建议怎么读

1. 先看 [01 LlamaIndex](/ai/03-frameworks/02/02/)：理解“文档进入系统以后，索引与查询对象该怎么组织”；
2. 再看 [02 Haystack](/ai/03-frameworks/02/09/)：理解“检索—生成—评测链路如何显式做成 pipeline”；
3. 再看 [03 RAGFlow](/ai/03-frameworks/02/16/)：理解“为什么有人希望直接要一个完整 RAG engine”；
4. 再看 [04 LightRAG](/ai/03-frameworks/02/23/)：理解“graph-enhanced retrieval 如何压低复杂度”；
5. 最后看 [05 Pathway](/ai/03-frameworks/02/30/)：理解“实时更新的数据路径如何改变 retrieval system 的设计”。

## 4.1 按读者身份的推荐阅读路径

| 你是谁 | 建议先读什么 | 为什么 |
|---|---|---|
| Python 后端 / 应用开发者 | [LlamaIndex](/ai/03-frameworks/02/02/) → [Haystack](/ai/03-frameworks/02/09/) | 前者帮你建立文档/索引/查询对象心智，后者帮你建立显式检索链路心智 |
| 平台 / 架构师 | [Haystack](/ai/03-frameworks/02/09/) → [RAGFlow](/ai/03-frameworks/02/16/) → [Pathway](/ai/03-frameworks/02/30/) | 更容易从“链路治理 → 平台治理 → 实时治理”三个层次看系统 |
| 做企业知识库 / 文档问答的人 | [LlamaIndex](/ai/03-frameworks/02/02/) → [RAGFlow](/ai/03-frameworks/02/16/) | 一个偏可编程对象体系，一个偏平台化知识层 |
| 做复杂检索质量优化的人 | [Haystack](/ai/03-frameworks/02/09/) → [LightRAG](/ai/03-frameworks/02/23/) | 一个擅长显式调链，一个擅长关系增强检索 |
| 做实时知识流 / 流式问答的人 | [Pathway](/ai/03-frameworks/02/30/) | 主矛盾首先在更新语义，而不是静态知识对象或离线索引 |

## 4.2 按系统主矛盾的速查表

| 你的系统最先会死在哪 | 优先想到 |
|---|---|
| 文档 / 节点 / 索引 / 查询对象组织混乱 | [LlamaIndex](/ai/03-frameworks/02/02/) |
| retrieval / rerank / route / eval 链条不透明 | [Haystack](/ai/03-frameworks/02/09/) |
| 想尽快拿完整知识平台：解析、chunking、citation、testing、共享 | [RAGFlow](/ai/03-frameworks/02/16/) |
| 关系语义与跨文档概念联系是主问题 | [LightRAG](/ai/03-frameworks/02/23/) |
| 数据持续变化，freshness / replay / incremental update 是主问题 | [Pathway](/ai/03-frameworks/02/30/) |

## 4.3 这章最容易读偏的三个误区

- **误区一：把 RAG 看成“embedding + top-k”小技巧。** 这一章讲的是 retrieval system，而不是 prompt 配料；
- **误区二：把向量库选型和 retrieval framework 选型混成一回事。** 前者更像基础设施，后者更像组织复杂度的语言；
- **误区三：只比较谁功能多。** 真正该比较的是：对象复杂度、链路复杂度、平台复杂度、图复杂度、实时复杂度，谁才是你的主矛盾。

## 5. 我建议本模块的内容结构

这一模块可以复用你现在已经稳定下来的写法：

1. 总览 README
2. 每个 framework 一个总 README
3. 每个 framework 至少拆成 4~6 篇：
   - 设计哲学 / 核心抽象
   - ingestion / indexing / retrieval 架构
   - rerank / eval / production / real-time / graph 等差异化能力
   - 课程助教或知识问答案例
   - 与其他框架的深度对比
4. 最后收口一篇：[06 RAG Framework 选型矩阵](/ai/03-frameworks/02/37/)

## 6. 本模块的推荐交付物

| 交付物 | 说明 | 验收标准 |
|---|---|---|
| retrieval-architecture-card.md | 某个系统的 ingestion / index / retrieval / rerank / generation 结构卡 | 能回答“为什么这么检索，不那样检索” |
| retrieval-eval-plan.md | 检索层评测计划 | 能区分召回、精排、最终回答三层质量 |
| framework-selection-card.md | RAG framework 选型卡 | 能解释“为什么选 A，不选 B” |

## 6.1 建议配套产物

如果你要把这一章真正学成“能落地的架构能力”，建议至少同时产出四样东西：

1. `knowledge-source-inventory.md`
   - 列知识源、更新频率、权限边界、格式类型；
2. `retrieval-architecture-card.md`
   - 列 ingestion、index、retriever、rerank、generation 结构；
3. `retrieval-eval-plan.md`
   - 列 recall / precision / ranking / faithfulness 等评测口径；
4. `retrieval-framework-selection-card.md`
   - 写清为什么选某个框架，不选其他路线。

这样做的价值是：把“读完知道”升级成“写完就能进设计评审”。

## 7. 本模块笔记导航

1. [01 LlamaIndex](/ai/03-frameworks/02/02/)
2. [02 Haystack](/ai/03-frameworks/02/09/)
3. [03 RAGFlow](/ai/03-frameworks/02/16/)
4. [04 LightRAG](/ai/03-frameworks/02/23/)
5. [05 Pathway](/ai/03-frameworks/02/30/)
6. [06 RAG Framework 选型矩阵](/ai/03-frameworks/02/37/)

## 8. 总结

| 关键问题 | 一句话 |
|---|---|
| 这一模块讲什么 | 不是“怎么把几段文本塞给模型”，而是“如何构建 retrieval system” |
| 为什么单开 | RAG 的真正复杂度在 ingestion、index、retrieval、rerank、eval、update 链路 |
| top 5 是谁 | LlamaIndex / Haystack / RAGFlow / LightRAG / Pathway |
| 五条路线分别代表什么 | 文档索引 / 检索管道 / RAG 引擎 / 轻量图检索 / 实时流式数据路径 |
| 学习重点 | 学会判断 retrieval system 的首要复杂度，而不是背 API |

## 引用

- [41] https://github.com/run-llama/llama_index — LlamaIndex GitHub
- [42] https://github.com/deepset-ai/haystack — Haystack GitHub
- [43] https://github.com/infiniflow/ragflow — RAGFlow GitHub
- [44] https://github.com/HKUDS/LightRAG — LightRAG GitHub
- [45] https://github.com/pathwaycom/pathway — Pathway GitHub

上一篇：[Agent Framework 选型矩阵](/ai/03-frameworks/01/02/)——Agent 系统的承载层已经讲完；下一模块开始处理“上下文从哪里来、怎样被检索出来”这件更底层的系统问题。

下一篇：[01 LlamaIndex](/ai/03-frameworks/02/02/)——先从文档与索引优先的路线开始：为什么 LlamaIndex 会把数据接入、索引与查询对象做成第一语言。
