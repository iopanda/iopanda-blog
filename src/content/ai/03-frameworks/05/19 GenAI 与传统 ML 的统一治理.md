---
title: "GenAI 与传统 ML 的统一治理"
number: "03.05.19"
chapter: 3
chapterTitle: "Frameworks"
section: 5
sectionTitle: "Evaluation and Observability Frameworks"
group: "3.10.3.5.3 MLflow"
created: 2026-09-04 07:59
author: "iopanda"
tags: ["framework", "evaluation", "observability", "mlflow", "governance"]
sourceId: "3.10.3.5 Evaluation and Observability Frameworks/3.10.3.5.3 MLflow/03 GenAI 与传统 ML 的统一治理"
---
# GenAI 与传统 ML 的统一治理

> MLflow README 最能体现它路线的一点，就是它不把 LLM/Agent 当作完全独立的新世界，而是明确把 agents、LLMs、models 放进同一平台叙事。[31] 这意味着它在试图回答一个组织级问题：**当传统 ML 团队和 GenAI 团队开始共存时，怎样避免治理面裂成两套系统。**

**学习目标**：学完本章，你将能够——
1. 理解为什么 MLflow 特别适合承接传统 ML + GenAI 的统一治理；
2. 说出 experiments、registry、traces、prompts 为什么可以进入共同结构；
3. 理解“统一治理”与“LLM-native 最优工具”不是一回事；
4. 判断什么时候组织最需要平台统一；
5. 为团队写一张 AI governance card。

## 1. 统一治理在现实里意味着什么

不是所有团队都只做 LLM。
现实里常常同时存在：
- 分类/回归/推荐模型；
- embedding / rerank / LLM / Agent；
- Prompt registry；
- trace / eval / deployment。

如果这些分别落在完全不同平台里，协作和审计成本会快速上升。

## 2. MLflow 为什么自然适合承接这件事

因为它不是从“只服务 LLM”起家，而是从 model lifecycle 起家，再把 GenAI 吸收进来。[31]
这意味着它天然具备：
- registry 语义；
- tracking 语义；
- deployment 语义；
- 现在又加上 tracing / prompt / evaluation 语义。

## 3. 统一治理的收益和代价

收益：
- 少一套孤岛平台；
- 资产更可审计；
- 组织协作成本更低；
- 传统 ML 与 GenAI 能共享一些治理基础设施。

代价：
- 某些 LLM-native 功能未必永远最前沿；
- 对只做单一 LLM 产品的团队，平台可能显得偏重。

## 4. 动手活动

> [!example] 输出 `mlflow-governance-card.md`
>
> 列出你的组织里目前有哪些 AI 资产分散在不同地方：experiments、registry、traces、prompts、feedback。写一句结论：平台分裂带来的最大代价是什么。

## 5. 总结

| 关键问题 | 一句话 |
|---|---|
| MLflow 在统一什么 | 传统 ML 与 GenAI 的治理面 |
| 为什么它自然适合 | 因为它本来就有 model lifecycle 基础 |
| 最大收益 | 降低平台孤岛和组织协作成本 |
| 最大边界 | 对纯 LLM-native 小团队可能偏重 |

## 引用

- [31] https://github.com/mlflow/mlflow/blob/master/README.md — MLflow README

上一篇：[02 experiments、traces、evals 与 model lifecycle](/iopanda-blog/ai/03-frameworks/05/18/)

下一篇：[04 线上监控、权限、成本与工程边界](/iopanda-blog/ai/03-frameworks/05/20/)
