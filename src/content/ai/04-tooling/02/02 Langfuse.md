---
title: "Langfuse"
number: "04.02.02"
chapter: 4
chapterTitle: "Tooling"
section: 2
sectionTitle: "Observability and Evaluation"
group: "01 Langfuse"
created: 2026-09-03 19:43
author: "iopanda"
tags: ["course", "ai-tooling", "observability-and-evaluation", "langfuse"]
sourceId: "3.10.4.2 Observability and Evaluation/01 Langfuse/README"
---
# Langfuse

> 模块定位：从「可自托管的 LLM observability + evaluation + prompt management 平台」这条路线理解 Observability and Evaluation。和 Phoenix 这种更偏观测诊断的产品、Promptfoo/DeepEval 这种更偏测试框架的产品不同，Langfuse 更像把 tracing、评测、prompt、dataset、playground 和 API 工作流放在一个统一工作台里。[2][4][5][7][8]

**本目录建议阅读顺序**：

1. [01 产品定位、能力地图与适用场景](/iopanda-blog/ai/04-tooling/02/03/)
2. [02 Observability、Evaluations、Prompts 与 Datasets](/iopanda-blog/ai/04-tooling/02/04/)
3. [03 质量、社区、价格与商业化边界](/iopanda-blog/ai/04-tooling/02/05/)
4. [04 与 Phoenix、Promptfoo、DeepEval 的竞品对比](/iopanda-blog/ai/04-tooling/02/06/)
5. [05 真实组织案例：Canva、Khan Academy、Merck、SumUp、Hugging Face、Cresta](/iopanda-blog/ai/04-tooling/02/07/)

## 这一产品为什么值得单开

- 它不是单一 tracing 工具，而是完整的 AI engineering 平台；
- 它同时覆盖 observability、evaluation、prompt management、datasets、playground 与 API；
- 它既有 Cloud，也强调 Self Host，对很多企业团队很有吸引力；
- 对产品经理来说，它很适合训练“工作台型 LLMOps 产品”该如何评估。[2][6]

## 本目录会回答什么问题

| 问题 | 对应章节 |
|---|---|
| Langfuse 到底是什么，适合谁 | 01 |
| 它的核心能力为什么有产品价值 | 02 |
| 它成熟吗，贵不贵，开源边界是什么 | 03 |
| 它和 Phoenix / Promptfoo / DeepEval 有什么差别 | 04 |
| 真实用户通常怎样把它接进工作流 | 05 |

## 建议阅读方法

- 如果你在做 LLMOps 平台选型：先读 01、03、04；
- 如果你在写质量闭环方案：先读 02、05；
- 如果你最关心自托管与价格：先读 03；
- 如果你想知道它是不是“LangSmith 的开源替代思路之一”：优先看 01 和 04。

## 本目录笔记导航

1. [01 产品定位、能力地图与适用场景](/iopanda-blog/ai/04-tooling/02/03/)
2. [02 Observability、Evaluations、Prompts 与 Datasets](/iopanda-blog/ai/04-tooling/02/04/)
3. [03 质量、社区、价格与商业化边界](/iopanda-blog/ai/04-tooling/02/05/)
4. [04 与 Phoenix、Promptfoo、DeepEval 的竞品对比](/iopanda-blog/ai/04-tooling/02/06/)
5. [05 真实组织案例：Canva、Khan Academy、Merck、SumUp、Hugging Face、Cresta](/iopanda-blog/ai/04-tooling/02/07/)

## 引用

- [1] https://github.com/langfuse/langfuse — Langfuse GitHub
- [2] https://raw.githubusercontent.com/langfuse/langfuse/main/README.md — Langfuse README
- [3] https://api.github.com/repos/langfuse/langfuse — Langfuse GitHub API
- [4] https://langfuse.com/docs/observability/overview — Langfuse observability overview
- [5] https://langfuse.com/docs/evaluation/overview — Langfuse evaluation overview
- [6] https://langfuse.com/pricing — Langfuse pricing
- [7] https://langfuse.com/docs/prompt-management/get-started — Langfuse prompt management
- [8] https://langfuse.com/docs/evaluation/dataset-runs/datasets — Langfuse datasets

上一篇：[04.02 Observability and Evaluation](/iopanda-blog/ai/04-tooling/02/01/)——这一组先讲工具地图，再进入第一个最像“统一工作台”的产品。

下一篇：[01 产品定位、能力地图与适用场景](/iopanda-blog/ai/04-tooling/02/03/)——先从定位、能力地图和适用边界开始。
