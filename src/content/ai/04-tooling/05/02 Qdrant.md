---
title: "Qdrant"
number: "04.05.02"
chapter: 4
chapterTitle: "Tooling"
section: 5
sectionTitle: "Vector Databases and Retrieval"
group: "01 Qdrant"
created: 2026-09-03 18:29
author: "iopanda"
tags: ["course", "ai-tooling", "vector-databases-and-retrieval", "qdrant"]
sourceId: "3.10.4.5 Vector Databases and Retrieval/01 Qdrant/README"
---
# Qdrant

> 模块定位：从「强调 payload 过滤与工程易用性的向量检索后端」这条路线理解 Vector Databases and Retrieval。这一目录先不急着写成产品手册，而是先抓住它的设计中心——vector search + filtering + practical API。

**本目录计划关注**：
1. Qdrant 为什么会出现，它优先解决什么问题；
2. 它的核心抽象、部署形态与集成方式；
3. 它与同组其他产品相比的设计中心差异；
4. 它在课程助教或企业内部 AI 系统中的自然落点；
5. 什么时候适合用它，什么时候不该先用它。

## 建议拆分主题

1. 它把哪类 retrieval 复杂度当作一等问题
2. 数据模型、过滤与更新语义
3. 规模化与运维形态
4. 与其他后端相比的边界
5. 课程助教知识库中最自然的使用方式

## 适合谁

- 想快速做工程落地的团队
- 学习重点不是 API 清单，而是它默认把什么复杂度提前结构化了。

## 引用

- 回到本组总览：[04.05 Vector Databases and Retrieval](/ai/04-tooling/05/01/)

上一篇：[04.05 Vector Databases and Retrieval](/ai/04-tooling/05/01/)
下一篇：[Weaviate](/ai/04-tooling/05/03/)
