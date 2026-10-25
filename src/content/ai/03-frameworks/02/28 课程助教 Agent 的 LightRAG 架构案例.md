---
title: "课程助教 Agent 的 LightRAG 架构案例"
number: "03.02.28"
chapter: 3
chapterTitle: "Frameworks"
section: 2
sectionTitle: "RAG and Retrieval Frameworks"
group: "04 LightRAG"
created: 2026-09-03 23:48
author: "iopanda"
tags: ["framework", "rag", "retrieval", "lightrag", "case-study", "architecture"]
sourceId: "3.10.3.2 RAG and Retrieval Frameworks/04 LightRAG/05 课程助教 Agent 的 LightRAG 架构案例"
---
# 课程助教 Agent 的 LightRAG 架构案例

> 课程助教如果只是 FAQ + 课程讲义问答，并不一定非要上 LightRAG。但如果问题开始大量涉及：概念关系、章节依赖、规则前提、跨文档比较、复习知识图谱，那么它就开始很像 LightRAG 的典型世界。也就是说，课程助教在这里更像“关系增强知识系统”，而不只是普通文档问答。

**学习目标**：
1. 判断课程助教什么时候适合 LightRAG；
2. 设计章节、概念、规则之间的图增强检索；
3. 说明为什么这里比纯 vector RAG 更受益于关系结构；
4. 识别什么时候不值得引入图；
5. 写一张课程助教适配卡。

## 1. 什么样的课程助教适合 LightRAG

适合：
- 章节间依赖很强
- 规则和前提链复杂
- 问题常是“比较 / 关联 / 总结关系”
- 希望构造复习知识图谱

不那么适合：
- 主要是 FAQ
- 主要是直接概念问答
- 数据小且关系简单

## 2. 一种合理结构

- chunk 保留原文讲义和规则文本
- entity 抽出术语、章节、概念、作业对象
- relation 抽出依赖、包含、对比、前提、引用关系
- query mode 按问题选择 local / global / hybrid / mix

## 3. 为什么它值钱

因为课程助教里很多高价值问题，本质上是关系问题，而不是单段相似度问题。

## 4. 总结

| 关键问题 | 一句话 |
|---|---|
| 课程助教何时适合 LightRAG | 当关系语义开始比单段文本更重要 |
| 它在这里像什么 | 一个关系增强的课程知识系统 |
| 何时不适合 | 当问题主要还是简单 FAQ/直问直答 |

## 引用

- [72] https://github.com/HKUDS/LightRAG/blob/main/README.md — LightRAG README

上一篇：[04 性能、复杂度与适用边界](/iopanda-blog/ai/03-frameworks/02/27/)

下一篇：[06 LightRAG 与 LlamaIndex、Haystack、RAGFlow、Pathway 的深度对比](/iopanda-blog/ai/03-frameworks/02/29/)
