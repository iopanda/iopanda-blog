---
title: "Ragas"
number: "04.02.26"
chapter: 4
chapterTitle: "Tooling"
section: 2
sectionTitle: "Observability and Evaluation"
group: "05 Ragas"
created: 2026-09-03 20:35
author: "iopanda"
tags: ["course", "ai-tooling", "observability-and-evaluation", "ragas"]
sourceId: "3.10.4.2 Observability and Evaluation/05 Ragas/README"
---
# Ragas

> 模块定位：从「RAG 专用评测框架」这条路线理解 Observability and Evaluation。和 Langfuse、Phoenix、DeepEval 这些更广义的 AI quality 工具不同，Ragas 的第一性问题更聚焦：**一个检索增强系统到底有没有“检索对、回答准、回答有依据”**。[2][4][5]

**本目录建议阅读顺序**：

1. [01 产品定位、RAG 专用视角与适用场景](/iopanda-blog/ai/04-tooling/02/27/)
2. [02 Metrics、Test Generation、Feedback Loops 与集成能力](/iopanda-blog/ai/04-tooling/02/28/)
3. [03 质量、社区、价格与采用边界](/iopanda-blog/ai/04-tooling/02/29/)
4. [04 与 DeepEval、Langfuse、Phoenix 的竞品对比](/iopanda-blog/ai/04-tooling/02/30/)
5. [05 真实组织案例：SIOS、HIBARI、ARISE analytics、Hakky、KDDI Agile](/iopanda-blog/ai/04-tooling/02/31/)

## 这一产品为什么值得单开

- 它不是通用 LLM eval 框架，而是长期围绕 RAG 质量建模；
- 它把 retrieval 和 generation 的评测拆得很细，这点对知识问答系统尤其重要；
- 它强调 production-aligned test set generation 和 feedback loops，不只是跑几个静态指标；
- 对产品经理来说，它非常适合训练“专用评测工具”和“通用评测平台”之间的差异。[2][5]

## 本目录会回答什么问题

| 问题 | 对应章节 |
|---|---|
| Ragas 到底是什么，适合谁 | 01 |
| 它的指标、测试集生成、反馈回路为什么有价值 | 02 |
| 它成熟吗，贵不贵，组织采用边界在哪里 | 03 |
| 它和 DeepEval / Langfuse / Phoenix 有什么区别 | 04 |
| 哪些真实组织已经公开写过自己如何使用 Ragas | 05 |

## 建议阅读方法

- 如果你在做 RAG 系统评测选型：先读 01、02、04；
- 如果你最关心真实组织采用：先读 05；
- 如果你要判断它是否适合作为长期评测底座：先读 03、04；
- 如果你只想区分它和 DeepEval：直接看 04。

## 本目录笔记导航

1. [01 产品定位、RAG 专用视角与适用场景](/iopanda-blog/ai/04-tooling/02/27/)
2. [02 Metrics、Test Generation、Feedback Loops 与集成能力](/iopanda-blog/ai/04-tooling/02/28/)
3. [03 质量、社区、价格与采用边界](/iopanda-blog/ai/04-tooling/02/29/)
4. [04 与 DeepEval、Langfuse、Phoenix 的竞品对比](/iopanda-blog/ai/04-tooling/02/30/)
5. [05 真实组织案例：SIOS、HIBARI、ARISE analytics、Hakky、KDDI Agile](/iopanda-blog/ai/04-tooling/02/31/)

## 引用

- [1] https://github.com/vibrantlabsai/ragas — Ragas GitHub
- [2] https://raw.githubusercontent.com/vibrantlabsai/ragas/main/README.md — Ragas README
- [3] https://api.github.com/repos/vibrantlabsai/ragas — Ragas GitHub API
- [4] https://docs.ragas.io/en/latest/ — Ragas docs home
- [5] https://docs.ragas.io/en/latest/concepts/metrics/available_metrics/ — Ragas metrics docs

上一篇：[04 DeepEval](/iopanda-blog/ai/04-tooling/02/20/)——上一产品代表通用、代码优先的评测框架；这一篇切到更聚焦 RAG 的专用评测路线。

下一篇：[01 产品定位、RAG 专用视角与适用场景](/iopanda-blog/ai/04-tooling/02/27/)——先从定位、适用边界与 RAG 专用视角开始。
