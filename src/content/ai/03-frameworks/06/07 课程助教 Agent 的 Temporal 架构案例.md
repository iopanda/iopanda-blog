---
title: "课程助教 Agent 的 Temporal 架构案例"
number: "03.06.07"
chapter: 3
chapterTitle: "Frameworks"
section: 6
sectionTitle: "Workflow Orchestration Frameworks"
group: "3.10.3.6.1 Temporal"
created: 2026-09-04 10:18
author: "iopanda"
tags: ["framework", "workflow", "orchestration", "temporal", "case-study"]
sourceId: "3.10.3.6 Workflow Orchestration Frameworks/3.10.3.6.1 Temporal/05 课程助教 Agent 的 Temporal 架构案例"
---
# 课程助教 Agent 的 Temporal 架构案例

> 把 Temporal 放回课程助教主线时，它最自然的角色不是“跑一个 nightly job”，而是：**课程助教已经长成一个会跨审批、跨异步反馈、跨多阶段处理并且需要可靠恢复的业务流程系统。** 这时候最关键的问题不再是 DAG 好不好画，而是流程在等待、失败、补偿之后还能不能继续得对。

**学习目标**：学完本章，你将能够——
1. 判断课程助教何时适合 Temporal；
2. 设计课程助教中的长时审批、人工复核、异步通知和外部事件流；
3. 说明为什么这里最重要的是 durable execution；
4. 识别这个案例里的关键风险：幂等性、补偿、流程设计复杂度；
5. 写一张课程助教的 Temporal 适配卡。

## 1. 什么时候课程助教适合 Temporal

- 要等待教师审批或人工复核；
- 要跨多阶段生成、审校、发送；
- 要和外部系统异步交互；
- 某一步失败后不能简单从头再来；
- 需要稳定保存流程进度和上下文。

## 2. 推荐架构

- workflow 层：课程助教整体处理流程
- activity 层：检索、生成、发信、更新状态、调用外部系统
- signal/event 层：审批、学生回复、外部系统回调
- timer 层：超时提醒、重试等待、升级路径
- compensation 层：撤回、重发、状态回滚

## 3. 为什么这里不优先选 Airflow

不是因为 Airflow 不强，
而是这里的问题主语更偏：
- 长时 stateful workflow
- human-in-the-loop
- external events
- durable recovery

这不是 classic batch DAG 的主问题。

## 4. 动手活动

> [!example] 输出 `course-ta-temporal-card.md`
>
> 为课程助教列：哪些步骤会等待人工、哪些会等待外部回调、哪些失败需要补偿、哪些 activity 必须幂等。写一句结论：你的课程助教系统现在最缺的是任务调度，还是 durable workflow engine。

## 5. 总结

| 关键问题 | 一句话 |
|---|---|
| 课程助教为什么适合 Temporal | 因为它开始长成跨时间、跨审批、跨失败恢复的业务流程 |
| 最大价值 | 让长生命周期流程有正式恢复语义 |
| 不适合什么 | 只做简单 batch/cron 编排的轻量场景 |

## 引用

- [5] https://github.com/temporalio/temporal/blob/main/README.md — Temporal README
- [6] https://github.com/temporalio/temporal/blob/main/docs/architecture/workflow-lifecycle.md — Temporal workflow lifecycle doc
- [8] https://github.com/temporalio/temporal/blob/main/docs/architecture/schedules.md — Temporal schedules architecture doc

上一篇：[04 可恢复性、幂等性、补偿与工程边界](/ai/03-frameworks/06/06/)

下一篇：[06 Temporal 与 Airflow、Prefect、Dagster、Kestra 的深度对比](/ai/03-frameworks/06/08/)
