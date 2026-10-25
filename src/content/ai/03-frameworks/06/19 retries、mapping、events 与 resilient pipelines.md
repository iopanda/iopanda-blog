---
title: "retries、mapping、events 与 resilient pipelines"
number: "03.06.19"
chapter: 3
chapterTitle: "Frameworks"
section: 6
sectionTitle: "Workflow Orchestration Frameworks"
group: "3.10.3.6.3 Prefect"
created: 2026-09-09 09:44
author: "iopanda"
tags: ["framework", "workflow", "orchestration", "prefect", "retry", "events"]
sourceId: "3.10.3.6 Workflow Orchestration Frameworks/3.10.3.6.3 Prefect/03 retries、mapping、events 与 resilient pipelines"
---
# retries、mapping、events 与 resilient pipelines

> Prefect README 把自己的价值总结成一句话：帮团队「build resilient, dynamic data pipelines that react to the world around them and recover from unexpected changes」。[13] 这一篇要讲清楚这句话背后具体是什么机制在起作用：retries 怎么配、`.map()`/task runner 怎么做并发、events/automations 怎么让流程“对外部变化有反应”。

**学习目标**：学完本章，你将能够——
1. 理解 `retries`、`retry_delay_seconds`、`exponential_backoff`、`retry_jitter_factor`、`retry_condition_fn` 分别在解决什么问题；
2. 说出并发（concurrency）与并行（parallelism）在 Prefect 里的区别，以及 `.map()` 的资源风险；
3. 理解 automations 的 trigger/action 模型，以及 Reactive/Proactive 两种触发姿态；
4. 判断什么时候流程需要这些正式语义，什么时候不需要；
5. 为系统写一张 resilient-pipeline card。

## 1. retries 为什么不只是“重试几次”

`@flow` 和 `@task` 都接受 `retries` 参数，失败时按整数次数重跑；task 级别的 `retries` 可以把重试范围限定得比 flow 级别更细。[22] 真正的工程细节在 `retry_delay_seconds`：
- 可以是单个数字，也可以是一串递增延迟，比如 `[1, 2, 4, 8]`；[22]
- 也可以直接用 `exponential_backoff` 工具按 `backoff_factor` 自动生成这串延迟，不用手写；[22]
- `retry_jitter_factor` 给延迟加随机抖动，理由很直接：「Adding jitter to the retry delays avoids multiple tasks introducing load to external systems by failing and retrying at the exact same cadence」。[22]

## 2. 为什么重试还需要“条件判断”

不是所有失败都值得重试——比如对方返回 401/404 时再重试没有意义。`retry_condition_fn` 让你用代码判断某次失败是否该重试：「If a callable passed to `retry_condition_fn` returns `True`, the task will be retried. Otherwise, the task will exit with an exception」。[22] 系统级默认值也可以通过 `PREFECT_TASKS_DEFAULT_RETRIES`、`PREFECT_TASKS_DEFAULT_RETRY_DELAY_SECONDS` 统一设置，再按需在单个 task 上覆盖。[22]

这说明 Prefect 把“该不该重试”“重试要不要错峰”都变成了正式参数，而不是让每个团队各自在 try/except 里手写。

## 3. `.map()` 与并发/并行的边界

Prefect 明确区分了两个概念：「Concurrency refers to a system that can do more than one thing simultaneously, but not at the *exact* same time」，「Parallelism refers to a system that can do more than one thing at the *exact* same time」。[21] task 默认同步执行、阻塞调用方；要并发/并行，需要 `.submit()` 提交给 task runner，或用 `.map()` 对一批输入并发跑同一个 task。[21]

`.map()` 的风险也写得很直接：它「can create many task instances very quickly, which might exceed your resource availability」。[21] 也就是说，`.map()` 好用，但对一个大数据集直接 map 很容易把并发数打到超出资源承受范围，需要配合 `ThreadPoolTaskRunner`/`ProcessPoolTaskRunner`/`DaskTaskRunner`/`RayTaskRunner` 的资源上限一起规划。[21]

## 4. automations/events：让流程对外部变化有反应

automations 是 Prefect 里“resilient pipelines that react to the world around them”这句话的具体落地：一个 automation 由 trigger（触发条件）和一个或多个 action（响应动作）组成。[23] trigger 有两种姿态：
- **Reactive**：某个事件确实发生时触发，例如 `prefect.flow-run.Failed`；
- **Proactive**：某个预期事件在时间窗口内**没有**发生时触发，例如“5 分钟内没有完成”。[23]

典型用法包括失败告警（收到 `prefect.flow-run.Failed` 事件就发通知）和取消长时间挂起的 flow run（Proactive trigger + `within` 时间窗口）。[23] action 是一个列表，意味着一次触发可以同时“取消 + 通知”，而不必只做一件事。[23]

## 5. 这三者合起来为什么叫 resilient pipeline

- retries/backoff/jitter 处理“单次失败怎么恢复”；
- `.map()`/task runner 处理“同类任务怎么并发跑得快”；
- automations/events 处理“系统状态变化时怎么自动响应”。

三者组合起来，才是 README 里那句「react to the world around them and recover from unexpected changes」的完整含义——它不是一个单一功能，而是重试语义、并发模型、事件响应三条能力叠加的结果。

## 6. 动手活动

> [!example] 动手活动：输出 `prefect-resilience-card.md`
>
> 列你的流程中哪些失败该重试、哪些错误码不该重试、哪一批任务适合 `.map()`、哪些状态变化需要自动通知或自动取消。写一句结论：你现在的“容错”逻辑是分散在业务代码里，还是已经收进 retries/automations 这类正式语义。

## 7. 总结

| 关键问题 | 一句话 |
|---|---|
| retries 在解决什么 | 把重试次数、延迟、抖动、条件判断变成正式参数 |
| `.map()`/task runner 在解决什么 | 让同类任务并发/并行执行，同时暴露资源边界 |
| automations/events 在解决什么 | 让流程对状态变化和外部事件自动响应 |
| 三者合起来是什么 | resilient, dynamic pipeline：会恢复、会并发、会对外部变化反应 |

## 引用

- [13] https://github.com/PrefectHQ/prefect/blob/main/README.md — Prefect README
- [21] https://docs.prefect.io/v3/concepts/task-runners — Prefect task runners concept doc
- [22] https://docs.prefect.io/v3/how-to-guides/workflows/retries — Prefect retries how-to guide
- [23] https://docs.prefect.io/v3/how-to-guides/automations/creating-automations — Prefect automations how-to guide

上一篇：[02 flow、task、state 与 deployment](/ai/03-frameworks/06/18/)

下一篇：[04 观测、部署与工程边界](/ai/03-frameworks/06/20/)
