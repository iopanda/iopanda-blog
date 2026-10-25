---
title: "Pathway 与 LlamaIndex、Haystack、RAGFlow、LightRAG 的深度对比"
number: "03.02.36"
chapter: 3
chapterTitle: "Frameworks"
section: 2
sectionTitle: "RAG and Retrieval Frameworks"
group: "05 Pathway"
created: 2026-09-03 22:35
author: "iopanda"
tags: ["framework", "rag", "retrieval", "pathway", "comparison", "architecture"]
sourceId: "3.10.3.2 RAG and Retrieval Frameworks/05 Pathway/06 Pathway 与 LlamaIndex、Haystack、RAGFlow、LightRAG 的深度对比"
---
# Pathway 与 LlamaIndex、Haystack、RAGFlow、LightRAG 的深度对比

> 到这里，Pathway 的定位已经清楚：它不是先讲对象，不是先讲显式检索流水线，不是先讲平台化知识层，也不是先讲图检索，而是先讲 live data、incremental computation、stream processing 与 real-time RAG。[68][69][71] 这一篇要做的，就是把它放回整个 retrieval framework 版图中，讲清它最适合解决哪类复杂度。

**学习目标**：
1. 站在 Pathway 视角，解释它与 LlamaIndex、Haystack、RAGFlow、LightRAG 的差异；
2. 理解为什么“实时知识流”是一条独立路线；
3. 用对象复杂度、流程复杂度、平台复杂度、图检索复杂度、实时流复杂度做判断；
4. 判断什么时候 Pathway 是正确主骨架，什么时候它会偏重；
5. 写出一段“为什么这里选 Pathway”的架构说明。

## 1. Pathway vs LlamaIndex

- LlamaIndex 先组织文档对象与查询对象；
- Pathway 先组织知识流和更新传播。

一句话：一个先问“知识是什么对象”，一个先问“知识怎样持续变化”。

## 2. Pathway vs Haystack

- Haystack 先讲显式检索流水线；
- Pathway 先讲 live data pipeline。

一句话：一个先稳 retrieval chain，一个先稳 update semantics。

## 3. Pathway vs RAGFlow

- RAGFlow 先给你整机 context engine / 知识平台；
- Pathway 先给你流处理与实时更新底座。

一句话：一个更像知识平台，一个更像实时数据框架。

## 4. Pathway vs LightRAG

- LightRAG 先解决 graph-enhanced retrieval；
- Pathway 先解决 freshness、incremental updates、streaming。

一句话：一个更像轻量图检索路线，一个更像实时知识流路线。

## 5. 什么时候 Pathway 最自然

适合：
- 数据持续变化；
- 更新后的答案必须尽快可见；
- 流式 ETL 和 retrieval 紧密耦合；
- replay、persistence、一致性是主需求。

## 6. 什么时候它偏重

不那么适合：
- 静态文档问答；
- 重点在对象组织；
- 重点在 pipeline 评测；
- 重点在 graph retrieval；
- 更新频率并不高。

## 7. 动手活动

> [!example] 输出 `why-pathway.md`
>
> 写一段说明：你的系统到底是不是“live knowledge system”。如果是，为什么 Pathway 自然；如果不是，为什么它会偏重。

## 8. 总结

| 关键问题 | 一句话 |
|---|---|
| Pathway 最像什么 | 一个支持 RAG 的 live data / stream processing framework |
| 它和 LlamaIndex 的差异 | 一个先稳对象，一个先稳更新语义 |
| 它和 Haystack 的差异 | 一个先稳检索链，一个先稳 live data pipeline |
| 它和 RAGFlow 的差异 | 一个先稳知识平台，一个先稳实时数据底座 |
| 它和 LightRAG 的差异 | 一个先稳 graph retrieval，一个先稳 freshness 与增量更新 |

## 引用

- [45] https://github.com/pathwaycom/pathway — Pathway GitHub
- [68] https://github.com/pathwaycom/pathway/blob/main/README.md — Pathway README
- [69] https://github.com/pathwaycom/pathway/blob/main/python/pathway/xpacks/llm/README.md — Pathway LLM xpack README
- [71] https://github.com/pathwaycom/pathway/blob/main/src/external_integration/external_index_readme.md — Pathway external index integration readme
- [41] https://github.com/run-llama/llama_index — LlamaIndex GitHub
- [42] https://github.com/deepset-ai/haystack — Haystack GitHub
- [43] https://github.com/infiniflow/ragflow — RAGFlow GitHub
- [44] https://github.com/HKUDS/LightRAG — LightRAG GitHub

上一篇：[05 课程助教 Agent 的 Pathway 架构案例](/iopanda-blog/ai/03-frameworks/02/35/)

下一篇：回到 [06 RAG Framework 选型矩阵](/iopanda-blog/ai/03-frameworks/02/37/)
