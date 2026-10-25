---
title: "Retrieval、Context Layer 与 Agent Integration"
number: "03.02.19"
chapter: 3
chapterTitle: "Frameworks"
section: 2
sectionTitle: "RAG and Retrieval Frameworks"
group: "03 RAGFlow"
created: 2026-09-03 22:00
author: "iopanda"
tags: ["framework", "rag", "retrieval", "ragflow", "context-layer", "agent-integration"]
sourceId: "3.10.3.2 RAG and Retrieval Frameworks/03 RAGFlow/03 Retrieval、Context Layer 与 Agent Integration"
---
# Retrieval、Context Layer 与 Agent Integration

> RAGFlow 在 README 里反复强调的不是单点检索，而是 superior context layer、converged context engine、agent templates。[62] 这说明它对 retrieval 的理解不是“给模型拼几段上下文”，而是要把上下文组织、引用、回显、与 agent 的连接一起当成一套产品能力。

**学习目标**：
1. 解释 RAGFlow 所说的 context layer 为什么比普通 RAG 更像平台语义；
2. 理解 retrieval、citation、references、agent integration 之间的关系；
3. 说出为什么 RAGFlow 很强调 grounded citations；
4. 判断什么时候 retrieval system 已经开始长成 agent context engine；
5. 为一个带 agent 的知识系统设计 context layer。

## 1. retrieval 不只是 recall，而是上下文生产

RAGFlow 的表述里，retrieval 最后要服务的是 superior context layer。[62]

这意味着平台关心的不只是：
- 找到没找到；
还关心：
- 找到之后怎样展示；
- 引用怎样追溯；
- chunk 如何可视化；
- agent 如何消费这些上下文。

## 2. grounded citations 为什么是产品能力

README 明确列出：
- visualization of text chunking
- quick view of key references
- traceable citations。[62]

这非常关键，因为它说明在 RAGFlow 的世界里：
- groundedness 不是评测报告里的分数；
- 而是前台产品体验的一部分。

## 3. retrieval testing 为什么值得单独一整页文档

RAGFlow 文档把 Retrieval Testing 单列，并明确建议：文档解析完成后，先用典型问题测试 retrieval 结果，再把数据集接到 Chat / Search / Agent。[65]

这句话很值钱。它说明：
- retrieval 先独立验收；
- 回答差时先分层定位；
- 若 target chunk 已召回，再看模型或 prompt；
- 若 target chunk 未召回，先回到 parsing / chunk / metadata / retrieval params。

这是一种非常成熟的检索系统思维。

## 4. 什么时候它开始像 agent context engine

当系统同时具备：
- retrieval
- citation
- memory
- agent templates
- workflow
- MCP / tools
时，检索层就不再只是检索层，而开始变成 agent 的 context engine。[62]

也就是说，RAGFlow 想解决的不只是“文档问答”，而是“agent 背后的上下文底座”。

## 5. 动手活动

> [!example] 输出 `ragflow-context-layer.md`
>
> 以课程助教为例，写出：哪些上下文来自讲义，哪些来自规则，哪些需要 citation 回显，哪些会被上层 agent 消费。说明为什么这里不是单纯 chat with docs。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| context layer 是什么 | 不只是召回结果，而是 agent 可消费、用户可追溯的上下文层 |
| grounded citations 的意义 | 把 groundedness 变成前台能力 |
| retrieval testing 的意义 | 把检索层先独立验收，再接聊天或 agent |
| agent integration 的意义 | retrieval 开始从问答配件变成 agent 底座 |

## 引用

- [62] https://github.com/infiniflow/ragflow/blob/main/README.md — RAGFlow README
- [65] https://github.com/infiniflow/ragflow/blob/main/docs/guides/dataset/retrieval_testing.md — RAGFlow retrieval testing guide

上一篇：[02 Parsing、Chunking、Indexing 与 Knowledge Pipeline](/ai/03-frameworks/02/18/)

下一篇：[04 多用户、权限、平台化运营与评测](/ai/03-frameworks/02/20/)
