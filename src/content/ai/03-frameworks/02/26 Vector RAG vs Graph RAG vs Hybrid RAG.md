---
title: "Vector RAG vs Graph RAG vs Hybrid RAG"
number: "03.02.26"
chapter: 3
chapterTitle: "Frameworks"
section: 2
sectionTitle: "RAG and Retrieval Frameworks"
group: "04 LightRAG"
created: 2026-09-03 23:44
author: "iopanda"
tags: ["framework", "rag", "retrieval", "lightrag", "hybrid", "graph-rag"]
sourceId: "3.10.3.2 RAG and Retrieval Frameworks/04 LightRAG/03 Vector RAG vs Graph RAG vs Hybrid RAG"
---
# Vector RAG vs Graph RAG vs Hybrid RAG

> LightRAG README 直接给出了 local / global / hybrid / naive / mix 多种 query mode，并强调默认 `mix` 往往效果最好。[72] 这很重要，因为它说明它并不主张“图替代一切”，而是在系统层承认不同召回模式各有优劣。

**学习目标**：
1. 解释 naive、local、global、hybrid、mix 的基本思路；
2. 理解为什么 hybrid 常常比纯 vector 或纯 graph 更稳；
3. 说出 LightRAG 怎样平衡局部事实与全局关系；
4. 判断什么问题该更偏 local，什么更偏 global；
5. 为系统设计 query mode 策略。

## 1. naive vs graph-aware

`naive` 更像传统 chunk vector RAG。
`local/global/hybrid/mix` 才更体现 LightRAG 的图增强路线。[72]

## 2. local / global / hybrid / mix 的差异

- local：更偏具体实体和局部上下文
- global：更偏宏观主题和关系链
- hybrid：把 local + global 合并
- mix：把 local + global + naive 都纳入

这说明 LightRAG 的关键不是“选图还是选向量”，而是让模式成为可调策略。

## 3. 为什么 hybrid 往往最实用

纯向量：细节强，但结构弱。
纯图：结构强，但原文细节和局部证据可能不足。

hybrid / mix 的价值正在于：
- 保住原文证据
- 又引入关系语义

## 4. 总结

| 关键问题 | 一句话 |
|---|---|
| naive 是什么 | 传统 chunk-based RAG |
| local/global 在干什么 | 分别强调局部实体事实与全局关系结构 |
| hybrid/mix 的价值 | 让向量与图关系协同，而不是互斥 |

## 引用

- [72] https://github.com/HKUDS/LightRAG/blob/main/README.md — LightRAG README

上一篇：[02 Entity、Relation、Chunk 与 Graph-aware Retrieval](/ai/03-frameworks/02/25/)

下一篇：[04 性能、复杂度与适用边界](/ai/03-frameworks/02/27/)
