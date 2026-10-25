---
title: "promptfoo 与 Langfuse、Phoenix、MLflow、DeepEval 的深度对比"
number: "03.05.29"
chapter: 3
chapterTitle: "Frameworks"
section: 5
sectionTitle: "Evaluation and Observability Frameworks"
group: "3.10.3.5.4 promptfoo"
created: 2026-09-04 08:40
author: "iopanda"
tags: ["framework", "evaluation", "observability", "promptfoo", "comparison"]
sourceId: "3.10.3.5 Evaluation and Observability Frameworks/3.10.3.5.4 promptfoo/06 promptfoo 与 Langfuse、Phoenix、MLflow、DeepEval 的深度对比"
---
# promptfoo 与 Langfuse、Phoenix、MLflow、DeepEval 的深度对比

> 到这里，promptfoo 的位置已经很清楚：它首先不是 LLM-native observability 平台，不是开放 diagnosis workbench，不是通用 AI governance 平台，也不是纯 code-first eval 库；它首先是 **CI-style AI testing / regression / red-team framework**。[10] 这一篇就是把它放回整个 evaluation framework 版图里。

**学习目标**：学完本章，你将能够——
1. 站在 promptfoo 视角解释它与 Langfuse、Phoenix、MLflow、DeepEval 的差异；
2. 理解为什么“测试门禁框架”是一条独立路线；
3. 判断什么时候该优先选 promptfoo，什么时候不该；
4. 写出一段“为什么这里选 promptfoo”的架构说明；
5. 识别 promptfoo 最常见的误用。

## 1. 与 Langfuse 的差异

- Langfuse 更像 LLM-native 产品化 observability 平台；
- promptfoo 更像 regression / red-team gate 工具。

## 2. 与 Phoenix 的差异

- Phoenix 更像开放 diagnosis workbench；
- promptfoo 更像测试执行与比较框架。

## 3. 与 MLflow 的差异

- MLflow 更像通用 AI engineering 平台；
- promptfoo 更像专门的 quality/security harness。

## 4. 与 DeepEval 的差异

- DeepEval 更像 code-first eval 库；
- promptfoo 更像 declarative + CLI + CI testing 工具链。

## 5. 什么时候最适合 promptfoo

适合：
- 要做 regression；
- 要做 red-team / vulnerability scanning；
- 要把 eval 纳入 PR / CI/CD；
- 要做 providers / prompts / agents 对比。

不那么适合：
- 你首先缺的是 trace-first 产品化 observability；
- 你首先缺的是开放 diagnosis workbench；
- 你主要要统一传统 ML 和 GenAI 的平台治理；
- 你只想在代码里写小规模 eval tests。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| promptfoo 最像什么 | CI-style AI testing / regression / red-team framework |
| 与 Langfuse 的差异 | 一个偏平台，一个偏测试门禁 |
| 与 Phoenix 的差异 | 一个偏诊断工作台，一个偏执行 harness |
| 与 MLflow 的差异 | 一个偏平台治理，一个偏 AI testing toolchain |
| 与 DeepEval 的差异 | 一个偏 declarative/CLI，一个偏 code-first |

## 引用

- [10] https://github.com/promptfoo/promptfoo/blob/main/README.md — promptfoo README
- [18] https://github.com/langfuse/langfuse — Langfuse GitHub
- [19] https://github.com/Arize-ai/phoenix — Phoenix GitHub
- [20] https://github.com/mlflow/mlflow — MLflow GitHub
- [22] https://github.com/confident-ai/deepeval — DeepEval GitHub

上一篇：[05 课程助教 Agent 的 promptfoo 架构案例](/ai/03-frameworks/05/28/)

下一篇：回到 [03.05 Evaluation Framework 选型矩阵](/ai/03-frameworks/05/37/)
