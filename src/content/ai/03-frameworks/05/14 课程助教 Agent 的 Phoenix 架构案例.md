---
title: "课程助教 Agent 的 Phoenix 架构案例"
number: "03.05.14"
chapter: 3
chapterTitle: "Frameworks"
section: 5
sectionTitle: "Evaluation and Observability Frameworks"
group: "3.10.3.5.2 Phoenix"
created: 2026-09-04 07:28
author: "iopanda"
tags: ["framework", "evaluation", "observability", "phoenix", "case-study"]
sourceId: "3.10.3.5 Evaluation and Observability Frameworks/3.10.3.5.2 Phoenix/05 课程助教 Agent 的 Phoenix 架构案例"
---
# 课程助教 Agent 的 Phoenix 架构案例

> 把 Phoenix 放回课程助教主线时，它最自然的角色不是“多一个平台界面”，而是：**课程助教已经开始出现复杂质量问题，你需要开放地观察 retrieval、prompt、tool call、agent 步骤，并把这些问题转成可分析、可对比、可实验的对象。** 这时候 Phoenix 更像一个 diagnosis workbench，而不是单纯的 dashboard。

**学习目标**：学完本章，你将能够——
1. 判断课程助教何时适合 Phoenix；
2. 设计课程助教的 traces、evals、datasets、experiments 诊断链；
3. 说明为什么这里最重要的是根因分析，而不是单次打分；
4. 设计课程助教的故障定位工作流；
5. 写一张课程助教的 Phoenix 适配卡。

## 1. 什么时候课程助教适合 Phoenix

- 问题已经不是“有没有答案”，而是“为什么答案经常在某些路径失真”；
- retrieval、tool call、prompt 版本之间开始互相影响；
- 团队需要开放 traces 来定位 agent 运行问题；
- 想把失败样本沉淀成 dataset，再用于 experiment 比较。

## 2. 推荐架构

- trace 层：记录课程问答、检索、工具调用、agent steps；
- diagnosis 层：围绕 OTEL/OpenInference spans 做问题定位；
- eval 层：把失败样本沉淀为 datasets；
- experiment 层：比较不同 prompt、retrieval、model 配置；
- workbench 层：用 Phoenix 统一看这些关系。

## 3. 为什么这里不优先选 Langfuse

不是因为 Langfuse 不好，
而是这里的问题主语更偏：
- traces 和 spans 的开放式诊断；
- 对复杂调用链的 root cause analysis；
- experiment workbench。

## 4. 动手活动

> [!example] 输出 `course-ta-phoenix-card.md`
>
> 为课程助教列：最需要跟踪的 5 个 spans、最常见的失败样本、最想比较的 2 个实验变量。写一句结论：你的助教系统现在最需要的是平台闭环，还是开放式诊断工作台。

## 5. 总结

| 关键问题 | 一句话 |
|---|---|
| 课程助教为什么适合 Phoenix | 因为它开始需要系统性 root cause analysis |
| 最大价值 | 把复杂质量问题从“感觉不对”变成可分析对象 |
| 不适合什么 | 只做轻量离线测试或只要产品化协作平台的场景 |

## 引用

- [25] /private/tmp/eval-framework-research/phoenix/README.md — Phoenix README

上一篇：[04 线上诊断、根因分析与工程边界](/iopanda-blog/ai/03-frameworks/05/13/)

下一篇：[06 Phoenix 与 Langfuse、MLflow、promptfoo、DeepEval 的深度对比](/iopanda-blog/ai/03-frameworks/05/15/)
