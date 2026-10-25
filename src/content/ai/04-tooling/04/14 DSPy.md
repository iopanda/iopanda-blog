---
title: "DSPy"
number: "04.04.14"
chapter: 4
chapterTitle: "Tooling"
section: 4
sectionTitle: "Prompt Management"
group: "03 DSPy"
created: 2026-09-03 22:45
author: "iopanda"
tags: ["course", "ai-tooling", "prompt-management", "dspy"]
sourceId: "3.10.4.4 Prompt Management/03 DSPy/README"
---
# DSPy

> 模块定位：从「把提示词工程升级为 LM 程序设计与优化问题」这条路线理解 Prompt Management。和 Langfuse Prompts 这种更偏资产管理、Promptfoo 这种更偏测试门禁的路线不同，DSPy 的核心主张是：**不要手工堆 prompt，而要写可组合、可优化、可编译的语言模型程序。**[2][4][5][6]

**本目录建议阅读顺序**：

1. [01 产品定位、程序化Prompt工程与适用场景](/iopanda-blog/ai/04-tooling/04/15/)
2. [02 Signatures、Modules、Optimizers与评测闭环](/iopanda-blog/ai/04-tooling/04/16/)
3. [03 质量、社区、价格与采用边界](/iopanda-blog/ai/04-tooling/04/17/)
4. [04 与 Langfuse Prompts、Promptfoo、Guidance、Outlines 的竞品对比](/iopanda-blog/ai/04-tooling/04/18/)
5. [05 公开组织案例有限：Stanford OVAL、IBM、Snowflake与开源采用信号](/iopanda-blog/ai/04-tooling/04/19/)

## 这一产品为什么值得单开

- 它不是把 prompt 当文案资产，而是把它当程序与可优化对象；
- 它把 signatures、modules、optimizers、metrics 放在一个统一编程范式里；
- 它很适合讲“提示词工程如何从手工调参走向系统设计”；
- 对产品经理来说，它特别适合理解“提示词治理”里最偏工程研究的一条路线。[2][4][5]

## 本目录会回答什么问题

| 问题 | 对应章节 |
|---|---|
| DSPy 到底是什么，适合谁 | 01 |
| 它的 signatures / modules / optimizers 为什么有价值 | 02 |
| 它成熟吗，采用边界在哪里 | 03 |
| 它和 Langfuse Prompts / Promptfoo / Guidance / Outlines 有什么区别 | 04 |
| 公开资料里有哪些真实组织与项目采用信号 | 05 |

## 建议阅读方法

- 如果你最关心“program, don’t prompt”到底意味着什么：先读 01、02；
- 如果你在做工具选型：先读 03、04；
- 如果你最关心真实采用信号：先读 05；
- 如果你想判断它是否适合团队生产环境：优先看 03 和 04。

## 本目录笔记导航

1. [01 产品定位、程序化Prompt工程与适用场景](/iopanda-blog/ai/04-tooling/04/15/)
2. [02 Signatures、Modules、Optimizers与评测闭环](/iopanda-blog/ai/04-tooling/04/16/)
3. [03 质量、社区、价格与采用边界](/iopanda-blog/ai/04-tooling/04/17/)
4. [04 与 Langfuse Prompts、Promptfoo、Guidance、Outlines 的竞品对比](/iopanda-blog/ai/04-tooling/04/18/)
5. [05 公开组织案例有限：Stanford OVAL、IBM、Snowflake与开源采用信号](/iopanda-blog/ai/04-tooling/04/19/)

## 引用

- [1] https://github.com/stanfordnlp/dspy — DSPy GitHub
- [2] https://raw.githubusercontent.com/stanfordnlp/dspy/main/README.md — DSPy README
- [3] https://api.github.com/repos/stanfordnlp/dspy — DSPy GitHub API
- [4] https://dspy.ai/ — DSPy homepage
- [5] https://dspy.ai/learn/optimization/overview/ — DSPy optimization docs
- [6] https://dspy.ai/learn/programming/modules/ — DSPy modules docs
- [10] https://dspy.ai/community/built-with-dspy/ — Built with DSPy

上一篇：[02 Promptfoo](/iopanda-blog/ai/04-tooling/04/08/)——上一产品代表 prompt 的测试与门禁层；这一篇切到程序抽象与优化层。

下一篇：[01 产品定位、程序化Prompt工程与适用场景](/iopanda-blog/ai/04-tooling/04/15/)——先从产品定位与适用边界开始。
