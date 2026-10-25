---
title: "DeepEval"
number: "03.05.30"
chapter: 3
chapterTitle: "Frameworks"
section: 5
sectionTitle: "Evaluation and Observability Frameworks"
group: "3.10.3.5.5 DeepEval"
created: 2026-09-04 06:25
author: "iopanda"
tags: ["framework", "evaluation", "observability", "deepeval"]
sourceId: "3.10.3.5 Evaluation and Observability Frameworks/3.10.3.5.5 DeepEval/README"
---
# DeepEval

> 模块定位：从“code-first LLM evaluation framework”这条路线理解 evaluation framework。DeepEval 适合回答：如果你的主问题是像写单元测试/pytest 一样，直接在代码里写 LLM eval、metrics、assertions、dataset tests，该用什么 eval 库承载？[22]

**本目录计划关注**：
1. DeepEval 为什么首先像 code-first eval framework；
2. metrics、test cases、dataset eval 和 CI 的关系；
3. 与 promptfoo、Langfuse 的差异；
4. Python 开发者工作流案例；
5. code-first 测试和 observability 平台之间的取舍。

**建议后续拆分**：
- 01 code-first LLM eval 的设计哲学
- 02 metrics、test cases 与 dataset-driven testing
- 03 pytest-like workflow、CI 集成与 regression
- 04 judge 可靠性、成本与工程边界
- 05 课程助教 Agent 的 DeepEval 架构案例
- 06 DeepEval 与 Langfuse、Phoenix、MLflow、promptfoo 的深度对比

## 本目录笔记导航

1. [01 code-first LLM eval 的设计哲学](/iopanda-blog/ai/03-frameworks/05/31/)
2. [02 metrics、test cases 与 dataset-driven testing](/iopanda-blog/ai/03-frameworks/05/32/)
3. [03 pytest-like workflow、CI 集成与 regression](/iopanda-blog/ai/03-frameworks/05/33/)
4. [04 judge 可靠性、成本与工程边界](/iopanda-blog/ai/03-frameworks/05/34/)
5. [05 课程助教 Agent 的 DeepEval 架构案例](/iopanda-blog/ai/03-frameworks/05/35/)
6. [06 DeepEval 与 Langfuse、Phoenix、MLflow、promptfoo 的深度对比](/iopanda-blog/ai/03-frameworks/05/36/)

上一篇：[03.05 promptfoo](/iopanda-blog/ai/03-frameworks/05/23/)

下一篇：[01 code-first LLM eval 的设计哲学](/iopanda-blog/ai/03-frameworks/05/31/)
