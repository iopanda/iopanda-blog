---
title: "通用 AI engineering 平台的设计哲学"
number: "03.05.17"
chapter: 3
chapterTitle: "Frameworks"
section: 5
sectionTitle: "Evaluation and Observability Frameworks"
group: "3.10.3.5.3 MLflow"
created: 2026-09-04 07:55
author: "iopanda"
tags: ["framework", "evaluation", "observability", "mlflow", "architecture"]
sourceId: "3.10.3.5 Evaluation and Observability Frameworks/3.10.3.5.3 MLflow/01 通用 AI engineering 平台的设计哲学"
---
# 通用 AI engineering 平台的设计哲学

> MLflow README 现在对自己的定位已经非常明确：The Open Source AI Engineering Platform for Agents, LLMs & Models。[31] 这句话最重要的地方，不在“它也支持 LLM”，而在 **agents, LLMs, and ML models** 被放到了同一个平台主语下。也就是说，MLflow 的第一性问题不是“某个 LLM 应用如何被观测”，而是：**当组织里传统 ML、LLM、Agent、prompts、traces、evals、models 同时存在时，怎样用一个统一平台来治理它们。**

**学习目标**：学完本章，你将能够——
1. 解释为什么 MLflow 首先像通用 AI engineering platform；
2. 理解它与 Langfuse、Phoenix 的差异不只是 LLM-native 程度，而是平台边界不同；
3. 说出 experiments、traces、prompts、models、governance 为什么会收敛到同一平台；
4. 判断什么时候团队最自然进入 MLflow 路线；
5. 为一个混合 ML + GenAI 团队写框架判断卡。

## 1. 概念：MLflow 解决的是“统一治理面”

很多 LLM 平台主要围绕：
- traces
- evals
- prompts
- feedback
来构建。

MLflow 当然也覆盖这些，但它的出发点更大：[31]
- agents
- LLMs
- ML models
- experiment tracking
- model registry
- deployment
- observability
- evaluation
- prompt optimization
- AI Gateway

这说明它更像一个广义 AI engineering operating surface，而不是单点 LLM 工具。

## 2. 为什么这条路线会独立出来

真实组织里很少只有 LLM 系统。
更常见的是：
- 传统 ML 模型还在跑；
- 新的 Agent / RAG / LLM 应用在长；
- 评估、追踪、部署、权限、成本要被统一审计；
- 团队不想维护两套完全分裂的平台。

MLflow 的路线，就是把“传统 ML 世界”和“GenAI 世界”收敛进同一个治理面。[31]

## 3. 为什么它不只是 experiment tracking 老框架延伸

README 现在已经明显不只是讲 run/metrics/models，而是把这些和 tracing、evaluation、prompt registry、AI Gateway 并列。[31]

这说明 MLflow 并不是简单给旧平台贴一层 LLM 皮肤，而是在扩展自己的平台主语：
- 从 model lifecycle
- 扩到 application lifecycle
- 再扩到 agent / GenAI workflows

## 4. 与其他路线的差异

| 框架 | 第一性问题 | MLflow 相比的定位 |
|---|---|---|
| [Langfuse](/ai/03-frameworks/05/02/) | 如何把 LLM 产品工程闭环收进平台 | MLflow 更广，覆盖传统 ML 与 GenAI 共同治理 |
| [Phoenix](/ai/03-frameworks/05/09/) | 如何开放地做 traces/evals diagnosis | MLflow 更像统一 engineering platform |
| [promptfoo](/ai/03-frameworks/05/23/) | 如何做 CI-style AI testing | MLflow 更像平台底座，而非专用 regression harness |
| [DeepEval](/ai/03-frameworks/05/30/) | 如何 code-first 写 eval tests | MLflow 更偏组织级平台而非代码测试库 |

## 5. 什么时候最自然进入 MLflow

- 组织里同时有传统 ML 和 GenAI；
- 团队已经在用 MLflow，想把 LLM/Agent 纳入同一平台；
- governance、registry、deployment、tracking 不希望分裂；
- 评估和 tracing 需要进入更大的 AI lifecycle；
- 你要的是统一平台，而不是单点工具最强功能。

## 6. 动手活动

> [!example] 动手活动：输出 `mlflow-fit.md`
>
> 列出你的组织里同时存在的 AI 资产：传统模型、LLM、Agent、prompts、datasets、traces、registry。写一句结论：你缺的是 LLM-native 平台，还是统一 AI engineering 治理面。

## 7. 总结

| 关键问题 | 一句话 |
|---|---|
| MLflow 首先是什么 | 通用 AI engineering 平台 |
| 它在解决什么 | ML 与 GenAI 共存时的统一治理问题 |
| 为什么值钱 | 把 experiments、models、traces、evals、prompts 收回同一平台 |
| 最适合什么 | 已经有平台治理需求的混合 AI 团队 |

## 引用

- [31] https://github.com/mlflow/mlflow/blob/master/README.md — MLflow README
- [35] https://github.com/mlflow/mlflow/blob/master/docker-compose/README.md — MLflow docker compose README

上一篇：[03.05 MLflow](/ai/03-frameworks/05/16/)

下一篇：[02 experiments、traces、evals 与 model lifecycle](/ai/03-frameworks/05/18/)
