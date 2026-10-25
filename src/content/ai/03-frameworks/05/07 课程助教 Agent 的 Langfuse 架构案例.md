---
title: "课程助教 Agent 的 Langfuse 架构案例"
number: "03.05.07"
chapter: 3
chapterTitle: "Frameworks"
section: 5
sectionTitle: "Evaluation and Observability Frameworks"
group: "3.10.3.5.1 Langfuse"
created: 2026-09-04 06:58
author: "iopanda"
tags: ["framework", "evaluation", "observability", "langfuse", "case-study"]
sourceId: "3.10.3.5 Evaluation and Observability Frameworks/3.10.3.5.1 Langfuse/05 课程助教 Agent 的 Langfuse 架构案例"
---
# 课程助教 Agent 的 Langfuse 架构案例

> 把 Langfuse 放回课程助教主线时，它最自然的角色不是“多打一层日志”，而是：**课程助教已经成为一个真实产品，需要把 traces、retrieval、tool calls、scores、用户反馈、prompt 版本和测试集放进同一条质量闭环。** 这时候最重要的不是某一次回答好不好，而是团队能不能持续证明它在变好。

**学习目标**：学完本章，你将能够——
1. 判断课程助教何时适合 Langfuse；
2. 设计课程助教的 trace、score、dataset、feedback、prompt 管理链；
3. 说明为什么这里最重要的是质量闭环，而不是单点调试；
4. 设计课程助教的线上观测面与改进路径；
5. 写一张课程助教的 Langfuse 适配卡。

## 1. 什么时候课程助教适合 Langfuse

- 已经有真实学生或教师在使用；
- retrieval、tool call、prompt 版本开始影响结果；
- 需要人工反馈与自动评分一起工作；
- 团队要多人协作，而不是个人 notebook 调试；
- 想把线上坏回答沉淀成后续 eval 资产。

## 2. 推荐架构

- trace 层：记录问答、检索、工具调用、会话逻辑；
- score 层：记录 correctness、groundedness、policy adherence 等质量信号；
- dataset 层：沉淀失败案例和关键 benchmark；
- prompt 层：集中版本化与迭代；
- feedback 层：收学生/助教人工反馈；
- 平台层：用 Langfuse 把它们关联起来。

## 3. 为什么这里不优先选 promptfoo

不是因为 promptfoo 不好，
而是这里的问题不只是离线 regression，
而是：
- 线上 traces 是否可见；
- 反馈是否能回流；
- prompt、dataset、scores 是否能成为同一工作面。

## 4. 动手活动

> [!example] 输出 `course-ta-langfuse-card.md`
>
> 为课程助教列：trace 里要看什么、score 里要记录什么、哪些线上坏案例要回流 dataset、prompt 如何版本化。写一句结论：你的助教系统现在有质量闭环吗？

## 5. 总结

| 关键问题 | 一句话 |
|---|---|
| 课程助教为什么适合 Langfuse | 因为它开始像真实 AI 产品，而不是单次实验 |
| 最大价值 | 把线上观测、评分、反馈和改进串成闭环 |
| 不适合什么 | 只有一次性离线测试需求的极轻量场景 |

## 引用

- [25] https://github.com/langfuse/langfuse/blob/main/README.md — Langfuse README
- [27] https://github.com/langfuse/langfuse/blob/main/web/src/features/score-analytics/README.md — Langfuse score analytics README
- [28] https://github.com/langfuse/langfuse/blob/main/web/src/features/datasets/server/actions/README.md — Langfuse datasets README
- [29] https://github.com/langfuse/langfuse/blob/main/web/src/features/trace-graph-view/README.md — Langfuse trace graph README

上一篇：[04 线上监控、回归与工程边界](/iopanda-blog/ai/03-frameworks/05/06/)

下一篇：[06 Langfuse 与 Phoenix、MLflow、promptfoo、DeepEval 的深度对比](/iopanda-blog/ai/03-frameworks/05/08/)
