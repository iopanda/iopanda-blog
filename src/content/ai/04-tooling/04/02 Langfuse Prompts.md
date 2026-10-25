---
title: "Langfuse Prompts"
number: "04.04.02"
chapter: 4
chapterTitle: "Tooling"
section: 4
sectionTitle: "Prompt Management"
group: "01 Langfuse Prompts"
created: 2026-09-03 22:20
author: "iopanda"
tags: ["course", "ai-tooling", "prompt-management", "langfuse-prompts"]
sourceId: "3.10.4.4 Prompt Management/01 Langfuse Prompts/README"
---
# Langfuse Prompts

> 模块定位：从「把 prompt 变成版本化、可发布、可回滚、可协作资产」这条路线理解 Prompt Management。和 Promptfoo 这种更偏测试门禁、DSPy 这种更偏程序抽象的路线不同，Langfuse Prompts 更像把 prompt 放回一个完整 AI engineering 工作台里：与 traces、playground、datasets、evaluations 一起管理。[2][4][5]

**本目录建议阅读顺序**：

1. [01 产品定位、Prompt资产化与适用场景](/ai/04-tooling/04/03/)
2. [02 版本、发布、回滚、Playground与协作能力](/ai/04-tooling/04/04/)
3. [03 质量、价格与采用边界](/ai/04-tooling/04/05/)
4. [04 与 Promptfoo、DSPy、Guidance、Outlines 的竞品对比](/ai/04-tooling/04/06/)
5. [05 真实组织案例：Canva、Khan Academy、Merck、SumUp与跨组织采用信号](/ai/04-tooling/04/07/)

## 这一产品为什么值得单开

- 它不是简单的 prompt 库，而是 prompt versioning + fetching + release management + playground 的组合；
- 它天然和 tracing、evaluation、datasets 联动，适合讲“prompt 如何进入真实工程流”；
- 它适合展示一种重要路线：prompt 不是字符串，而是产品资产；
- 对产品经理来说，它很适合理解“提示词管理”从个人技巧升级到团队协作系统的过程。[2][4][5]

## 本目录会回答什么问题

| 问题 | 对应章节 |
|---|---|
| Langfuse Prompts 到底是什么，适合谁 | 01 |
| 它的版本、发布、回滚与协作能力为什么有价值 | 02 |
| 它成熟吗，怎么收费，采用边界在哪里 | 03 |
| 它和 Promptfoo / DSPy / Guidance / Outlines 有什么区别 | 04 |
| 哪些真实组织已经公开把它用于 prompt 相关工作流 | 05 |

## 建议阅读方法

- 如果你最关心 prompt 资产化：先读 01、02；
- 如果你在做工具选型：先读 03、04；
- 如果你最关心真实组织采用：先读 05；
- 如果你想判断它是不是团队协作型 prompt 管理方案：优先看 02 与 05。

## 本目录笔记导航

1. [01 产品定位、Prompt资产化与适用场景](/ai/04-tooling/04/03/)
2. [02 版本、发布、回滚、Playground与协作能力](/ai/04-tooling/04/04/)
3. [03 质量、价格与采用边界](/ai/04-tooling/04/05/)
4. [04 与 Promptfoo、DSPy、Guidance、Outlines 的竞品对比](/ai/04-tooling/04/06/)
5. [05 真实组织案例：Canva、Khan Academy、Merck、SumUp与跨组织采用信号](/ai/04-tooling/04/07/)

## 引用

- [1] https://github.com/langfuse/langfuse — Langfuse GitHub
- [2] https://raw.githubusercontent.com/langfuse/langfuse/main/README.md — Langfuse README
- [3] https://api.github.com/repos/langfuse/langfuse — Langfuse GitHub API
- [4] https://langfuse.com/docs/prompt-management/get-started — Langfuse prompt management docs
- [5] https://langfuse.com/pricing — Langfuse pricing

上一篇：[04.04 Prompt Management](/ai/04-tooling/04/01/)——先看整组地图，再进入第一个最像团队协作工作台的 prompt 管理方案。

下一篇：[01 产品定位、Prompt资产化与适用场景](/ai/04-tooling/04/03/)——先从产品定位与适用边界开始。
