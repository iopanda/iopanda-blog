---
title: "DeepEval 与 Langfuse、Phoenix、MLflow、promptfoo 的深度对比"
number: "03.05.36"
chapter: 3
chapterTitle: "Frameworks"
section: 5
sectionTitle: "Evaluation and Observability Frameworks"
group: "3.10.3.5.5 DeepEval"
created: 2026-09-04 09:05
author: "iopanda"
tags: ["framework", "evaluation", "observability", "deepeval", "comparison"]
sourceId: "3.10.3.5 Evaluation and Observability Frameworks/3.10.3.5.5 DeepEval/06 DeepEval 与 Langfuse、Phoenix、MLflow、promptfoo 的深度对比"
---
# DeepEval 与 Langfuse、Phoenix、MLflow、promptfoo 的深度对比

> 到这里，DeepEval 的位置已经很清楚：它首先不是 LLM-native observability 平台，不是开放 diagnosis workbench，不是通用 AI engineering 平台，也不是 declarative CI-style testing harness；它首先是 **code-first LLM evaluation framework**。[10][12] 这一篇就是把它放回整个 evaluation framework 版图里。

**学习目标**：学完本章，你将能够——
1. 站在 DeepEval 视角解释它与 Langfuse、Phoenix、MLflow、promptfoo 的差异；
2. 理解为什么“代码里的 eval 语言”是一条独立路线；
3. 判断什么时候该优先选 DeepEval，什么时候不该；
4. 写出一段“为什么这里选 DeepEval”的架构说明；
5. 识别 DeepEval 最常见的误用。

## 1. 与 Langfuse 的差异

- Langfuse 更像 LLM-native 平台闭环；
- DeepEval 更像 code-first eval 语言。

## 2. 与 Phoenix 的差异

- Phoenix 更像开放 diagnosis / eval workbench；
- DeepEval 更像 metrics + test cases + runner 组合层。

## 3. 与 MLflow 的差异

- MLflow 更像通用 AI engineering 平台；
- DeepEval 更像局部但强的 eval authoring 层。

## 4. 与 promptfoo 的差异

- promptfoo 更像 declarative + CLI + CI testing harness；
- DeepEval 更像 pytest/vitest 风格的 code-first eval 框架。

## 5. 什么时候最适合 DeepEval

适合：
- 团队有强代码测试文化；
- 想把 metrics 和 test cases 直接写进代码；
- 需要 end-to-end、trajectory、component eval 共存；
- 想快速在本地或 CI 跑可执行评估。

不那么适合：
- 你首先缺的是产品化 observability 平台；
- 你首先缺的是开放 trace diagnosis workbench；
- 你首先缺的是组织级统一治理；
- 你更喜欢声明式 config-first harness。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| DeepEval 最像什么 | code-first LLM evaluation framework |
| 与 Langfuse 的差异 | 一个偏平台闭环，一个偏代码评估层 |
| 与 Phoenix 的差异 | 一个偏开放诊断，一个偏测试 authoring |
| 与 MLflow 的差异 | 一个偏治理平台，一个偏 eval layer |
| 与 promptfoo 的差异 | 一个偏 declarative，一个偏 code-first |

## 引用

- [10] https://github.com/confident-ai/deepeval/blob/main/README.md — DeepEval README
- [12] https://github.com/confident-ai/deepeval/blob/main/typescript/README.md — DeepEval TypeScript README
- [18] https://github.com/langfuse/langfuse — Langfuse GitHub
- [19] https://github.com/Arize-ai/phoenix — Phoenix GitHub
- [20] https://github.com/mlflow/mlflow — MLflow GitHub
- [21] https://github.com/promptfoo/promptfoo — promptfoo GitHub

上一篇：[05 课程助教 Agent 的 DeepEval 架构案例](/iopanda-blog/ai/03-frameworks/05/35/)

下一篇：回到 [03.05 Evaluation Framework 选型矩阵](/iopanda-blog/ai/03-frameworks/05/37/)
