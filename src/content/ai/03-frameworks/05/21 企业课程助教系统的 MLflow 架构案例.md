---
title: "企业课程助教系统的 MLflow 架构案例"
number: "03.05.21"
chapter: 3
chapterTitle: "Frameworks"
section: 5
sectionTitle: "Evaluation and Observability Frameworks"
group: "3.10.3.5.3 MLflow"
created: 2026-09-04 08:03
author: "iopanda"
tags: ["framework", "evaluation", "observability", "mlflow", "case-study"]
sourceId: "3.10.3.5 Evaluation and Observability Frameworks/3.10.3.5.3 MLflow/05 企业课程助教系统的 MLflow 架构案例"
---
# 企业课程助教系统的 MLflow 架构案例

> 把 MLflow 放回课程助教主线时，它最自然的角色不是“只看一个 LangChain trace”，而是：**课程助教已经进入组织级运营，需要把模型、提示词、traces、评估、反馈、工件和部署都放进统一平台治理。** 这时候问题主语已经不是单一 LLM 应用，而是整套 AI system。

**学习目标**：学完本章，你将能够——
1. 判断课程助教系统何时适合 MLflow；
2. 设计课程助教从实验、trace、eval 到 registry/deployment 的统一治理链；
3. 说明为什么这里最重要的是 platform governance；
4. 识别这个案例里的关键风险：平台过重、组织成本、LLM-native 深度不足；
5. 写一张课程助教的 MLflow 适配卡。

## 1. 什么时候课程助教适合 MLflow

- 助教系统不再只是单一产品原型；
- 组织里还有其他传统 ML 模型和服务；
- 需要统一 tracking、registry、deployment、trace、eval；
- 平台治理和审计开始比单点诊断更重要。

## 2. 推荐架构

- tracking 层：experiment runs、metrics、artifacts
- tracing 层：Agent / RAG / tool 调用 traces
- eval 层：datasets、metrics、validation thresholds
- prompt / model 层：prompt registry + model lifecycle
- 平台层：统一在 MLflow 下治理

## 3. 为什么这里不优先选 Langfuse

不是因为 Langfuse 不强，
而是这里的问题主语更偏：
- 混合 AI 资产统一治理；
- registry / deployment / tracking 一体化；
- 传统 ML 与 GenAI 共存。

## 4. 动手活动

> [!example] 输出 `course-ta-mlflow-card.md`
>
> 为课程助教系统列：experiments、traces、evals、artifacts、registry、deployment 各由谁承接。写一句结论：你的系统现在更像单个产品，还是组织级 AI 平台资产。

## 5. 总结

| 关键问题 | 一句话 |
|---|---|
| 课程助教为什么适合 MLflow | 因为它开始进入组织级 AI 治理面 |
| 最大价值 | 把 ML 和 GenAI 资产收回一个统一平台 |
| 不适合什么 | 只需要轻量 LLM-native observability 的场景 |

## 引用

- [31] https://github.com/mlflow/mlflow/blob/master/README.md — MLflow README
- [34] https://github.com/mlflow/mlflow/blob/master/examples/llms/README.md — MLflow LLM examples README
- [35] https://github.com/mlflow/mlflow/blob/master/docker-compose/README.md — MLflow docker compose README

上一篇：[04 线上监控、权限、成本与工程边界](/ai/03-frameworks/05/20/)

下一篇：[06 MLflow 与 Langfuse、Phoenix、promptfoo、DeepEval 的深度对比](/ai/03-frameworks/05/22/)
