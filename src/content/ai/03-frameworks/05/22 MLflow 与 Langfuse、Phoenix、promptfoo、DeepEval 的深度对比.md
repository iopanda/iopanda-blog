---
title: "MLflow 与 Langfuse、Phoenix、promptfoo、DeepEval 的深度对比"
number: "03.05.22"
chapter: 3
chapterTitle: "Frameworks"
section: 5
sectionTitle: "Evaluation and Observability Frameworks"
group: "3.10.3.5.3 MLflow"
created: 2026-09-04 08:05
author: "iopanda"
tags: ["framework", "evaluation", "observability", "mlflow", "comparison"]
sourceId: "3.10.3.5 Evaluation and Observability Frameworks/3.10.3.5.3 MLflow/06 MLflow 与 Langfuse、Phoenix、promptfoo、DeepEval 的深度对比"
---
# MLflow 与 Langfuse、Phoenix、promptfoo、DeepEval 的深度对比

> 到这里，MLflow 的位置已经很清楚：它首先不是 LLM-native observability 平台，不是开放 diagnosis workbench，不是 CI-style testing harness，也不是 code-first eval 库；它首先是 **general-purpose AI engineering platform**。[31] 这一篇就是把它放回整个 evaluation framework 版图里。

**学习目标**：学完本章，你将能够——
1. 站在 MLflow 视角解释它与 Langfuse、Phoenix、promptfoo、DeepEval 的差异；
2. 理解为什么“统一 AI engineering 平台”是一条独立路线；
3. 判断什么时候该优先选 MLflow，什么时候不该；
4. 写出一段“为什么这里选 MLflow”的架构说明；
5. 识别 MLflow 最常见的误用。

## 1. 与 Langfuse 的差异

- Langfuse 更像 LLM-native 产品化 observability 平台；
- MLflow 更像通用 AI engineering 平台。

## 2. 与 Phoenix 的差异

- Phoenix 更像开放 observability / diagnosis workbench；
- MLflow 更像统一 experiments、models、traces、evals 的平台底座。

## 3. 与 promptfoo 的差异

- promptfoo 更像 CI-style regression / red-team 框架；
- MLflow 更像组织级平台，不是专用测试 harness。

## 4. 与 DeepEval 的差异

- DeepEval 更像 code-first eval 库；
- MLflow 更像治理和 lifecycle 平台。

## 5. 什么时候最适合 MLflow

适合：
- 组织里同时有传统 ML 与 GenAI；
- registry / deployment / tracking / tracing / eval 都要统一；
- 平台治理已经成为主问题；
- 团队需要统一资产和审计面。

不那么适合：
- 你只需要 LLM-native tracing 平台；
- 你只要开放 diagnosis workbench；
- 你只要 CI regression；
- 你只要代码里直接写 eval tests。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| MLflow 最像什么 | 通用 AI engineering 平台 |
| 与 Langfuse 的差异 | 一个偏通用平台，一个偏 LLM-native 平台 |
| 与 Phoenix 的差异 | 一个偏统一治理，一个偏开放诊断 |
| 与 promptfoo 的差异 | 一个偏平台，一个偏测试 harness |
| 与 DeepEval 的差异 | 一个偏 lifecycle，一个偏 code-first |

## 引用

- [31] https://github.com/mlflow/mlflow/blob/master/README.md — MLflow README
- [18] https://github.com/langfuse/langfuse — Langfuse GitHub
- [19] https://github.com/Arize-ai/phoenix — Phoenix GitHub
- [21] https://github.com/promptfoo/promptfoo — promptfoo GitHub
- [22] https://github.com/confident-ai/deepeval — DeepEval GitHub

上一篇：[05 企业课程助教系统的 MLflow 架构案例](/iopanda-blog/ai/03-frameworks/05/21/)

下一篇：回到 [03.05 Evaluation Framework 选型矩阵](/iopanda-blog/ai/03-frameworks/05/37/)
