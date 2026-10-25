---
title: "LightRAG 与 LlamaIndex、Haystack、RAGFlow、Pathway 的深度对比"
number: "03.02.29"
chapter: 3
chapterTitle: "Frameworks"
section: 2
sectionTitle: "RAG and Retrieval Frameworks"
group: "04 LightRAG"
created: 2026-09-03 23:50
author: "iopanda"
tags: ["framework", "rag", "retrieval", "lightrag", "comparison", "architecture"]
sourceId: "3.10.3.2 RAG and Retrieval Frameworks/04 LightRAG/06 LightRAG 与 LlamaIndex、Haystack、RAGFlow、Pathway 的深度对比"
---
# LightRAG 与 LlamaIndex、Haystack、RAGFlow、Pathway 的深度对比

> 到这里，LightRAG 的位置已经很清楚：它不是先给你对象体系，不是先给你显式检索流水线，不是先给你平台整机，也不是先给你实时流更新；它先给你的是“轻量 graph-enhanced retrieval”这条路线。[44][72] 这一篇就是把它放回整个 retrieval framework 版图里。

**学习目标**：
1. 站在 LightRAG 视角解释它与 LlamaIndex、Haystack、RAGFlow、Pathway 的差异；
2. 理解为什么 graph-enhanced retrieval 是独立路线；
3. 判断什么时候应该上图，什么时候不该；
4. 写出一段“为什么这里选 LightRAG”的判断；
5. 识别 graph RAG 的常见错配。

## 1. LightRAG vs LlamaIndex

- LlamaIndex 先组织对象；
- LightRAG 先增强关系召回。

## 2. LightRAG vs Haystack

- Haystack 先组织显式检索工作流；
- LightRAG 先组织图增强检索模式。

## 3. LightRAG vs RAGFlow

- RAGFlow 更像完整 context engine / 平台；
- LightRAG 更像轻量 graph retrieval 路线。

## 4. LightRAG vs Pathway

- Pathway 先解决知识流更新；
- LightRAG 先解决关系语义召回。

## 5. 什么时候最适合 LightRAG

适合：
- 关系密集知识库
- 跨实体、跨章节、跨文档关系问答
- 想比重 GraphRAG 更轻

不适合：
- 纯 FAQ
- 高速实时流
- 更需要平台治理而非图增强的团队

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| LightRAG 最像什么 | 一条轻量 graph-enhanced retrieval 路线 |
| 与 LlamaIndex 的差异 | 一个先讲对象，一个先讲图增强召回 |
| 与 Haystack 的差异 | 一个先讲工作流，一个先讲关系检索 |
| 与 RAGFlow 的差异 | 一个轻量路线，一个平台路线 |
| 与 Pathway 的差异 | 一个先稳图语义，一个先稳更新语义 |

## 引用

- [44] https://github.com/HKUDS/LightRAG — LightRAG GitHub
- [72] https://github.com/HKUDS/LightRAG/blob/main/README.md — LightRAG README
- [41] https://github.com/run-llama/llama_index — LlamaIndex GitHub
- [42] https://github.com/deepset-ai/haystack — Haystack GitHub
- [43] https://github.com/infiniflow/ragflow — RAGFlow GitHub
- [45] https://github.com/pathwaycom/pathway — Pathway GitHub

上一篇：[05 课程助教 Agent 的 LightRAG 架构案例](/iopanda-blog/ai/03-frameworks/02/28/)

下一篇：回到 [06 RAG Framework 选型矩阵](/iopanda-blog/ai/03-frameworks/02/37/)
