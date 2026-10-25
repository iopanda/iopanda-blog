---
title: "workflow state、activity、retry、timer 与 signal"
number: "03.06.04"
chapter: 3
chapterTitle: "Frameworks"
section: 6
sectionTitle: "Workflow Orchestration Frameworks"
group: "3.10.3.6.1 Temporal"
created: 2026-09-04 10:12
author: "iopanda"
tags: ["framework", "workflow", "orchestration", "temporal", "state", "retry"]
sourceId: "3.10.3.6 Workflow Orchestration Frameworks/3.10.3.6.1 Temporal/02 workflow state、activity、retry、timer 与 signal"
---
# workflow state、activity、retry、timer 与 signal

> Temporal 的独特性，不在于“也支持重试”，而在于它把 workflow state、activity、retry、timer、signal 这些对象纳入同一套 durable execution 语义。[6][7][8][9] 这意味着在 Temporal 里，重试不是外挂、计时器不是外挂、外部事件也不是外挂，它们都是 workflow system 的一部分。

**学习目标**：学完本章，你将能够——
1. 理解为什么 Temporal 会把 workflow history 和 mutable state 作为核心对象；
2. 说出 activity、retry、timer、signal 分别在解决什么；
3. 理解 Matching/History 两类服务在执行路径中的角色；
4. 判断什么时候流程需要这些正式语义；
5. 为系统写一张 workflow-semantics card。

## 1. workflow state 在做什么

workflow lifecycle 和 history service 文档已经很清楚：[6][9]
- 用户请求会转成 history events；
- mutable state 是当前状态汇总；
- transfer/timer tasks 负责继续推进执行。

这说明 workflow 不是“脚本跑到哪”，而是一个可持久化的状态演化系统。

## 2. activity 为什么重要

在 Temporal 里，workflow 不是直接把所有副作用都吞进去，而是通过 activity 去执行外部操作。[6]
这意味着：
- 副作用和流程状态被分层；
- 重试和恢复更可控；
- 外部调用失败不会让整个流程语义散掉。

## 3. retry、timer、signal 为什么必须正式化

retry 文档说明，重试策略和可重试错误是正式原语，不是 if/else 小逻辑。[7]
workflow lifecycle 里 timer 和 signal 也都进入正式状态推进路径。[6][9]

这说明 Temporal 不是在“帮你少写代码”，而是在帮你把最容易写错的控制语义收成平台能力。

## 4. Matching / History 服务说明了什么

- History Service 负责事件、mutable state、timer/transfer tasks；[9]
- Matching Service 负责 task queues 与 worker polling。[10]

这意味着 Temporal 的可靠性来自明确的内部职责分层，而不是单进程内的魔法。

## 5. 动手活动

> [!example] 动手活动：输出 `temporal-workflow-semantics-card.md`
>
> 列你的流程中哪些步骤是 activity、哪些地方需要 timer、哪些事件来自外部 signal、哪些错误需要 retry。写一句结论：这些语义现在是平台能力，还是散落在应用逻辑里。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| mutable state 在做什么 | 汇总 workflow 当前可恢复状态 |
| activity 在做什么 | 承接外部副作用操作 |
| retry/timer/signal 在做什么 | 把失败、等待、外部事件变成正式流程语义 |
| History/Matching 分工是什么 | 一个管状态推进，一个管任务投递 |

## 引用

- [6] https://github.com/temporalio/temporal/blob/main/docs/architecture/workflow-lifecycle.md — Temporal workflow lifecycle doc
- [7] https://github.com/temporalio/temporal/blob/main/docs/architecture/retry.md — Temporal retry doc
- [8] https://github.com/temporalio/temporal/blob/main/docs/architecture/schedules.md — Temporal schedules architecture doc
- [9] https://github.com/temporalio/temporal/blob/main/docs/architecture/history-service.md — Temporal history service doc
- [10] https://github.com/temporalio/temporal/blob/main/docs/architecture/matching-service.md — Temporal matching service doc

上一篇：[01 durable workflow engine 的设计哲学](/ai/03-frameworks/06/03/)

下一篇：[03 human-in-the-loop、external events 与长时流程](/ai/03-frameworks/06/05/)
