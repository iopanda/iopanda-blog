---
title: "Promptfoo"
number: "04.02.14"
chapter: 4
chapterTitle: "Tooling"
section: 2
sectionTitle: "Observability and Evaluation"
group: "03 Promptfoo"
created: 2026-09-03 20:08
author: "iopanda"
tags: ["course", "ai-tooling", "observability-and-evaluation", "promptfoo"]
sourceId: "3.10.4.2 Observability and Evaluation/03 Promptfoo/README"
---
# Promptfoo

> 模块定位：从「声明式 eval + red teaming + CI/CD 的开发者优先路线」理解 Observability and Evaluation。和 Langfuse、Phoenix 这类先从 tracing/workspace 切入的产品不同，Promptfoo 更像一个把 prompt、agent、RAG 的测试、安全扫描、PR 审查和流水线门禁做成配置化工作流的工具链。[2][4][5][6][9][10]

**本目录建议阅读顺序**：

1. [01 产品定位、配置驱动与适用场景](/ai/04-tooling/02/15/)
2. [02 Evals、Assertions、Red Teaming 与 CI/CD](/ai/04-tooling/02/16/)
3. [03 质量、社区、价格与商业化边界](/ai/04-tooling/02/17/)
4. [04 与 Langfuse、Phoenix、DeepEval 的竞品对比](/ai/04-tooling/02/18/)
5. [05 真实组织案例：OpenAI、Anthropic与若干公开匿名企业客户](/ai/04-tooling/02/19/)

## 这一产品为什么值得单开

- 它不是 observability 平台，而是测试/安全/门禁工具；
- 它把 YAML config、assertions、providers、red team、CI/CD 串成一套开发者工作流；
- 它很适合“先把测试跑起来，再把风险挡在发布前”的团队；
- 对产品经理来说，它代表的是“配置驱动型 AI 质量工具”，和工作台型产品有明显差异。[2][4][5][6]

## 本目录会回答什么问题

| 问题 | 对应章节 |
|---|---|
| Promptfoo 到底是什么，适合谁 | 01 |
| 它的 eval / red team / CI 能力为什么有价值 | 02 |
| 它成熟吗，怎么收费，企业边界在哪里 | 03 |
| 它和 Langfuse / Phoenix / DeepEval 有什么区别 | 04 |
| 真实团队通常怎样把它接进开发流程 | 05 |

## 建议阅读方法

- 如果你最关心发布前测试与门禁：先读 02、05；
- 如果你在做采购或平台选型：先读 03、04；
- 如果你只想理解它和 Langfuse/Phoenix 的差异：直接看 04；
- 如果你最关心 red teaming：优先看 02、03、05。

## 本目录笔记导航

1. [01 产品定位、配置驱动与适用场景](/ai/04-tooling/02/15/)
2. [02 Evals、Assertions、Red Teaming 与 CI/CD](/ai/04-tooling/02/16/)
3. [03 质量、社区、价格与商业化边界](/ai/04-tooling/02/17/)
4. [04 与 Langfuse、Phoenix、DeepEval 的竞品对比](/ai/04-tooling/02/18/)
5. [05 真实组织案例：OpenAI、Anthropic与若干公开匿名企业客户](/ai/04-tooling/02/19/)

## 引用

- [1] https://github.com/promptfoo/promptfoo — Promptfoo GitHub
- [2] https://raw.githubusercontent.com/promptfoo/promptfoo/main/README.md — Promptfoo README
- [3] https://api.github.com/repos/promptfoo/promptfoo — Promptfoo GitHub API
- [4] https://www.promptfoo.dev/docs/intro/ — Promptfoo intro docs
- [5] https://www.promptfoo.dev/docs/configuration/guide/ — Promptfoo config guide
- [6] https://www.promptfoo.dev/docs/red-team/quickstart/ — Promptfoo red team quickstart
- [7] https://www.promptfoo.dev/docs/integrations/langfuse/ — Promptfoo Langfuse integration
- [8] https://www.promptfoo.dev/pricing/ — Promptfoo pricing
- [9] https://www.promptfoo.dev/docs/integrations/ci-cd/ — Promptfoo CI/CD
- [10] https://www.promptfoo.dev/docs/code-scanning/ — Promptfoo code scanning

上一篇：[02 Phoenix](/ai/04-tooling/02/08/)——上一产品代表 tracing/diagnostics 路线；这一篇切到配置驱动的 eval/红队/门禁路线。

下一篇：[01 产品定位、配置驱动与适用场景](/ai/04-tooling/02/15/)——先从定位、配置驱动思维与适用边界开始。
