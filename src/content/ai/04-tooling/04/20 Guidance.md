---
title: "Guidance"
number: "04.04.20"
chapter: 4
chapterTitle: "Tooling"
section: 4
sectionTitle: "Prompt Management"
group: "04 Guidance"
created: 2026-09-04 10:07
author: "iopanda"
tags: ["course", "ai-tooling", "prompt-management", "guidance"]
sourceId: "3.10.4.4 Prompt Management/04 Guidance/README"
---
# Guidance

> 模块定位：从「把 prompt 写成可执行、可约束、可插入控制逻辑的生成程序」这条路线理解 Prompt Management。和 Langfuse Prompts 这种更偏资产管理、Promptfoo 这种更偏测试门禁、DSPy 这种更偏程序抽象优化的路线不同，Guidance 更关心的是：**怎样在生成过程中直接施加结构约束与控制流。**[2][4]

**本目录建议阅读顺序**：

1. [01 产品定位、受控生成心智与适用场景](/ai/04-tooling/04/21/)
2. [02 Constraints、Control Flow、Tool Use与离线语法调试](/ai/04-tooling/04/22/)
3. [03 质量、社区、价格与采用边界](/ai/04-tooling/04/23/)
4. [04 与 Langfuse Prompts、Promptfoo、DSPy、Outlines 的竞品对比](/ai/04-tooling/04/24/)
5. [05 公开组织案例有限：可复现实践与开源采用信号](/ai/04-tooling/04/25/)

## 这一产品为什么值得单开

- 它不是把 prompt 当静态文本，而是把 prompt、控制逻辑和约束生成合并成一个连续程序；
- 它强调 regex、CFG、select、conditionals、loops、tool use 等能力；
- 它特别适合讲“结构控制”这条路线，而不是版本管理或评测闭环；
- 对产品经理来说，它能帮助理解：有些 prompt 问题并不该通过反复改文案解决，而该通过约束生成和控制流解决。[2][4]

## 本目录会回答什么问题

| 问题 | 对应章节 |
|---|---|
| Guidance 到底是什么，适合谁 | 01 |
| 它的约束、控制流、工具调用与离线调试为什么有价值 | 02 |
| 它成熟吗，适用边界在哪里 | 03 |
| 它和 Langfuse Prompts / Promptfoo / DSPy / Outlines 有什么区别 | 04 |
| 公开资料里有哪些可信的采用信号 | 05 |

## 建议阅读方法

- 如果你最关心如何控制生成结构：先读 01、02；
- 如果你在做工具选型：先读 03、04；
- 如果你最关心案例证据边界：先读 05；
- 如果你想判断它适不适合进入团队生产流：优先看 03 和 04。

## 本目录笔记导航

1. [01 产品定位、受控生成心智与适用场景](/ai/04-tooling/04/21/)
2. [02 Constraints、Control Flow、Tool Use与离线语法调试](/ai/04-tooling/04/22/)
3. [03 质量、社区、价格与采用边界](/ai/04-tooling/04/23/)
4. [04 与 Langfuse Prompts、Promptfoo、DSPy、Outlines 的竞品对比](/ai/04-tooling/04/24/)
5. [05 公开组织案例有限：可复现实践与开源采用信号](/ai/04-tooling/04/25/)

## 引用

- [1] https://github.com/guidance-ai/guidance — Guidance GitHub
- [2] https://raw.githubusercontent.com/guidance-ai/guidance/main/README.md — Guidance README
- [3] https://api.github.com/repos/guidance-ai/guidance — Guidance GitHub API
- [4] https://guidance.readthedocs.io/en/latest/ — Guidance docs

上一篇：[03 DSPy](/ai/04-tooling/04/14/)——上一产品代表程序抽象与优化路线；这一篇切到生成控制与约束路线。

下一篇：[01 产品定位、受控生成心智与适用场景](/ai/04-tooling/04/21/)——先从产品定位与适用边界开始。
