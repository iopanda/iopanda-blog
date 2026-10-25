---
title: "human-in-the-loop、external events 与长时流程"
number: "03.06.05"
chapter: 3
chapterTitle: "Frameworks"
section: 6
sectionTitle: "Workflow Orchestration Frameworks"
group: "3.10.3.6.1 Temporal"
created: 2026-09-04 10:14
author: "iopanda"
tags: ["framework", "workflow", "orchestration", "temporal", "human-in-the-loop"]
sourceId: "3.10.3.6 Workflow Orchestration Frameworks/3.10.3.6.1 Temporal/03 human-in-the-loop、external events 与长时流程"
---
# human-in-the-loop、external events 与长时流程

> Temporal 真正与很多传统调度框架拉开距离的地方，不只是状态恢复，而是它天然适合那些会等待外部世界的流程：人工审批、异步回调、用户确认、长时间 sleep、周期性推进。[5][6][8] 也就是说，Temporal 不是只会跑“任务图”，而是在处理“会等待现实世界”的工作流。

**学习目标**：学完本章，你将能够——
1. 理解为什么 Temporal 特别适合 human-in-the-loop 和 external events；
2. 说出 schedules、signals、timers 在长时流程中的价值；
3. 判断为什么这类流程不适合只用 cron/queue 自己拼；
4. 识别等待、恢复、补偿之间的关系；
5. 为系统写一张 long-lived-workflow card。

## 1. 长时流程的主难点不是步骤，而是等待

很多流程真正难的地方不是“先干 A 再干 B”，而是：
- A 完成后要等人；
- 等完人还要等外部系统；
- 外部系统超时了要补偿；
- 过了一段时间又要重新推进。

这类问题用普通任务调度很容易碎成大量状态表和补丁逻辑。

## 2. Temporal 为什么适合这种问题

Temporal 的核心语义里本来就有：
- workflow state
- timers
- retries
- signals
- schedules

这意味着“等待”本身就是一等公民，而不是外挂逻辑。[6][8]

## 3. AI/Agent 系统为什么也会长成这种流程

AI 系统并不总是一次 prompt 完成：
- agent 可能要等待人工批准；
- 长文档任务可能分阶段执行；
- 某些审批或发信流程要等待用户反馈；
- 外部工具或远程任务可能晚些才回调。

这时 Temporal 会比单纯 task scheduler 更自然，因为它在建模等待与恢复。

## 4. 动手活动

> [!example] 输出 `temporal-long-lived-workflow-card.md`
>
> 列你的流程中哪些地方需要等待人工、等待回调、等待定时器、等待状态变化。写一句结论：这些等待现在是正式流程语义，还是散落在业务代码里的状态补丁。

## 5. 总结

| 关键问题 | 一句话 |
|---|---|
| 长时流程最难的地方是什么 | 等待、恢复和补偿 |
| Temporal 为什么适合 | 因为等待和外部事件本来就是 workflow 语义的一部分 |
| AI 系统什么时候会需要它 | 当 agent 或业务流程开始跨时间、跨审批、跨回调 |
| 最大价值 | 让现实世界的异步性进入正式执行模型 |

## 引用

- [5] https://github.com/temporalio/temporal/blob/main/README.md — Temporal README
- [6] https://github.com/temporalio/temporal/blob/main/docs/architecture/workflow-lifecycle.md — Temporal workflow lifecycle doc
- [8] https://github.com/temporalio/temporal/blob/main/docs/architecture/schedules.md — Temporal schedules architecture doc

上一篇：[02 workflow state、activity、retry、timer 与 signal](/ai/03-frameworks/06/04/)

下一篇：[04 可恢复性、幂等性、补偿与工程边界](/ai/03-frameworks/06/06/)
