---
title: "experiments、traces、evals 与 model lifecycle"
number: "03.05.18"
chapter: 3
chapterTitle: "Frameworks"
section: 5
sectionTitle: "Evaluation and Observability Frameworks"
group: "3.10.3.5.3 MLflow"
created: 2026-09-04 07:57
author: "iopanda"
tags: ["framework", "evaluation", "observability", "mlflow", "experiments", "lifecycle"]
sourceId: "3.10.3.5 Evaluation and Observability Frameworks/3.10.3.5.3 MLflow/02 experiments、traces、evals 与 model lifecycle"
---
# experiments、traces、evals 与 model lifecycle

> MLflow 的独特之处，不只是“既有 experiment tracking，又加了 traces”，而是它在努力把这些对象放进同一个 lifecycle：experiment 负责比较，trace 负责观察，eval 负责验证，model lifecycle 负责交付。[31][32][33][34] 这让它看起来不像单纯 observability 工具，也不像单纯 eval 框架，而像一个贯通研发到交付的系统。

**学习目标**：学完本章，你将能够——
1. 理解 experiments、traces、evals、model lifecycle 为什么在 MLflow 里是一个系统；
2. 说出 trace 不只是 debug，eval 不只是打分，registry 不只是存模型；
3. 理解 MLflow 怎样把传统模型和 LLM workflows 拉到共同结构下；
4. 判断什么时候你的组织需要 lifecycle 平台，而不是单点 eval 工具；
5. 为系统写一张 lifecycle card。

## 1. experiment 不是单次 run，而是组织比较能力

MLflow 从一开始就强在 experiments，但现在它不再只记录训练参数，而是在扩到：
- tracing
- evaluation
- prompt optimization
- model and application comparisons。[31]

这意味着 experiment 的角色在扩大：它变成组织比较不同 AI 方案的正式容器。

## 2. traces 为什么会进入同一平台

README 和 TypeScript SDK 都明确把 traces 放进核心能力里。[31][32]
这说明在 MLflow 视角里，应用行为观察不再是另起一套系统，而是和实验、评估、反馈一起存在。

## 3. eval 为什么会自然连到 model lifecycle

evaluation examples 和 llms examples 都说明，MLflow 的评估结果会直接记录到 tracking 中，并与模型选择、验证阈值、后续使用衔接。[33][34]

所以 eval 在这里不是一个外部报告，而是 lifecycle 的正式阶段。

## 4. registry / deployment 为什么不能缺席

如果一个平台只有 tracing 和 eval，但没有 model lifecycle，它很难真正承接组织级治理。
MLflow 的独特性就在于：
- 模型怎么被比较；
- 模型怎么被记账；
- 模型怎么进入 registry；
- 最终怎么部署；
这些都在同一平台语义里。

## 5. 动手活动

> [!example] 输出 `mlflow-lifecycle-card.md`
>
> 列你的系统里：experiment、trace、eval、registry、deployment 各由谁承接。写一句结论：你现在是多工具拼接，还是已经有统一 lifecycle 平台。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| experiment 在做什么 | 承接组织对方案的比较能力 |
| trace 在做什么 | 承接应用行为观察 |
| eval 在做什么 | 承接质量验证与阈值判断 |
| lifecycle 在做什么 | 把观察、验证和交付收进同一平台 |

## 引用

- [31] https://github.com/mlflow/mlflow/blob/master/README.md — MLflow README
- [32] https://github.com/mlflow/mlflow/blob/master/libs/typescript/README.md — MLflow TypeScript SDK README
- [33] https://github.com/mlflow/mlflow/blob/master/examples/evaluation/README.md — MLflow evaluation examples README
- [34] https://github.com/mlflow/mlflow/blob/master/examples/llms/README.md — MLflow LLM examples README

上一篇：[01 通用 AI engineering 平台的设计哲学](/ai/03-frameworks/05/17/)

下一篇：[03 GenAI 与传统 ML 的统一治理](/ai/03-frameworks/05/19/)
