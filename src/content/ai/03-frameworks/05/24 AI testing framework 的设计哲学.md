---
title: "AI testing framework 的设计哲学"
number: "03.05.24"
chapter: 3
chapterTitle: "Frameworks"
section: 5
sectionTitle: "Evaluation and Observability Frameworks"
group: "3.10.3.5.4 promptfoo"
created: 2026-09-04 08:30
author: "iopanda"
tags: ["framework", "evaluation", "observability", "promptfoo", "architecture"]
sourceId: "3.10.3.5 Evaluation and Observability Frameworks/3.10.3.5.4 promptfoo/01 AI testing framework 的设计哲学"
---
# AI testing framework 的设计哲学

> promptfoo README 对自己的定位极其直接：LLM evals & red teaming；它是一个 CLI and library for evaluating and red-teaming LLM apps。[10] 这句话很重要，因为 promptfoo 的第一性问题不是“怎么做产品化 trace 平台”，也不是“怎么统一传统 ML 和 GenAI 平台”，而是：**如何把 prompts、RAG、agents 的质量验证、安全扫描、模型比较和回归测试变成像测试工程一样可执行、可自动化、可进 CI 的事情。**

**学习目标**：学完本章，你将能够——
1. 解释为什么 promptfoo 首先像 AI testing framework；
2. 理解它与 Langfuse、Phoenix、MLflow、DeepEval 的根本差异；
3. 说出 declarative eval、red teaming、CI gate 为什么会收敛成一条路线；
4. 判断什么时候团队最自然进入 promptfoo 路线；
5. 为一个 Agent / RAG / prompt 系统写框架判断卡。

## 1. 概念：promptfoo 解决的是“把 AI 质量检查测试化”

很多团队做 LLM 评估时，常见方式是：
- 跑几次 prompt；
- 人眼比较输出；
- 临时记几个失败案例；
- 上线前再手动做一轮检查。

promptfoo 的路线完全不同：
- 用配置定义测试；
- 用 CLI 跑 eval；
- 用 assertions 判定结果；
- 用 red teaming 做安全扫描；
- 用 CI/CD 自动化这些步骤。[10][11][12]

也就是说，它要把 AI 质量问题变成测试工程对象。

## 2. 为什么这条路线独立成立

因为很多系统真正缺的不是 trace 平台，而是：
- 一个稳定可复跑的 regression harness；
- 一个能比较 prompt / model / provider 的 test matrix；
- 一个可以在 PR、发布前、CI 里自动触发的 gate；
- 一个能把 security / compliance / jailbreak 风险也纳入同一测试流的框架。

这正是 promptfoo 的核心价值。

## 3. 为什么它不是只会“跑几个断言”

README 和 CLI docs 很清楚地说明，它不只是 eval：[10][11]
- eval
- view/share
- generate dataset / assertions / redteam
- code scans
- optimize
- mcp
- retry / export / validate

这说明它并不是一个小型 assertion helper，而是在搭建完整的 AI testing toolchain。

## 4. 与其他路线的差异

| 框架 | 第一性问题 | promptfoo 相比的定位 |
|---|---|---|
| [Langfuse](/ai/03-frameworks/05/02/) | 如何把 LLM 产品工程闭环收进平台 | promptfoo 更偏测试门禁而非平台闭环 |
| [Phoenix](/ai/03-frameworks/05/09/) | 如何开放地做 traces / diagnosis / eval 分析 | promptfoo 更偏 regression harness |
| [MLflow](/ai/03-frameworks/05/16/) | 如何统一更广义 AI engineering 平台 | promptfoo 更偏 testing workflow |
| [DeepEval](/ai/03-frameworks/05/30/) | 如何 code-first 写 eval 测试 | promptfoo 更偏 declarative + CLI + CI |

## 5. 什么时候最自然进入 promptfoo

- 想把 eval 纳入 CI/CD；
- 想做模型/提示词 side-by-side 比较；
- 想做发布前 regression；
- 想做 red team / security scanning；
- 想用声明式配置而不是自己拼测试 harness。

## 6. 动手活动

> [!example] 动手活动：输出 `promptfoo-fit.md`
>
> 列你的系统现在最缺什么：回归测试、模型比较、安全扫描、CI gate、team sharing。写一句结论：你缺的是观测平台，还是一个 AI testing framework。

## 7. 总结

| 关键问题 | 一句话 |
|---|---|
| promptfoo 首先是什么 | AI testing framework |
| 它在解决什么 | prompts/agents/RAG 的测试、回归和红队问题 |
| 为什么值钱 | 把 AI 质量控制收敛成可自动化测试流 |
| 最适合什么 | 需要 CI gate 与 regression harness 的团队 |

## 引用

- [10] https://github.com/promptfoo/promptfoo/blob/main/README.md — promptfoo README
- [11] https://github.com/promptfoo/promptfoo/blob/main/site/docs/usage/command-line.md — promptfoo command line docs

上一篇：[03.05 promptfoo](/ai/03-frameworks/05/23/)

下一篇：[02 declarative eval configs、providers 与 assertion model](/ai/03-frameworks/05/25/)
