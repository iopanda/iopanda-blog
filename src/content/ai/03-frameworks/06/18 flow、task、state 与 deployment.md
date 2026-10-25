---
title: "flow、task、state 与 deployment"
number: "03.06.18"
chapter: 3
chapterTitle: "Frameworks"
section: 6
sectionTitle: "Workflow Orchestration Frameworks"
group: "3.10.3.6.3 Prefect"
created: 2026-09-09 09:42
author: "iopanda"
tags: ["framework", "workflow", "orchestration", "prefect", "state", "deployment"]
sourceId: "3.10.3.6 Workflow Orchestration Frameworks/3.10.3.6.3 Prefect/02 flow、task、state 与 deployment"
---
# flow、task、state 与 deployment

> Prefect 的独特性，不在于“也有 flow 和 task 这两个词”，而在于它把 flow、task、state、deployment、work pool 组织成一条从“写代码”到“上线运行”的连续链路。[18][19][20][21] 在 Prefect 里，一个 Python 函数只要加上装饰器，就自动获得状态追踪；只要配上一个 deployment，就能被调度和远程触发；只要配上 work pool，就能决定真正跑在哪里。

**学习目标**：学完本章，你将能够——
1. 理解 flow 与 task 在 Prefect 里的分工与嵌套关系；
2. 说出 flow run 的状态生命周期，以及“failed”判定的真实规则；
3. 理解 `PrefectFuture`、`.submit()`、`.result()` 在并发执行中的角色；
4. 说出 deployment、work pool、worker 三者如何分层；
5. 为系统写一张 prefect-architecture card。

## 1. flow 在做什么

Prefect 文档说得很清楚：「Flows compose work into a workflow」，「Flows are defined as decorated Python functions」。[18] 一个被 `@flow` 装饰的函数会自动获得：
- 参数类型校验；
- 重试与超时能力；
- 「Metadata about their execution, like each state the flow enters, is automatically tracked」。

也就是说，flow 不是一张手画的依赖图，而是一段被自动追踪状态的 Python 调用。

## 2. task 在做什么，以及嵌套 flow 的规则

task 的定位是「quick, cacheable, retryable, have transactional semantics and are easy to run concurrently」。[18] flow 可以调用 task，也可以调用另一个 flow——这时会形成 nested flow run，「Nested flow runs block execution of the parent flow run until completion」，且每个嵌套 flow run 会自己起一个 task runner，跑完就关闭。[18]

这说明 Prefect 的编排单位是分层的：flow 负责“这一轮运行的上下文”，task 负责“具体一步的执行语义”，嵌套 flow 负责“更大颗粒度的子流程复用”。

## 3. flow run 的状态生命周期与“failed”判定

flow run 的生命周期大致是 Scheduled → Pending → Running → Completed，也可能走向 Failed、Cancelled 或 Crashed；如果一个 flow run 迟迟没有到达终态，就会被称为 “zombie” flow run。[18] 一个容易被误解的细节是：flow 的终态**取决于返回值**，而不只是内部 task 是否失败——「If an exception is raised directly in the flow function, the flow run is marked as `FAILED`」，但返回 future、state 或普通对象时，还有专门的“final state determination”规则。[18]

这意味着：即使内部某个 task 失败了，只要 flow 函数本身正常返回（比如捕获了异常），flow run 也可能不会被标记为 Failed——这是设计使用重试/容错逻辑时必须留意的边界。

## 4. `.submit()`、`PrefectFuture`、`.result()` 在做什么

默认情况下，直接调用一个 task 函数是同步执行、阻塞调用方的。[21] 想要并发/并行，需要用 `.submit()` 把 task 提交给 task runner，返回一个 `PrefectFuture`：
- 把这个 future 传给下游 task 时，Prefect 会自动等待并传入**解析后的值**，而不是 future 本身；[21]
- 想要主动拿到结果，用 `.result()`，它会阻塞并在任务失败时默认抛异常（可用 `raise_on_failure` 关闭）；[21]
- `PrefectFuture` 在 flow/task 返回前必须被显式解析（return、`.wait()`、`.result()` 或 `wait`/`as_completed` 工具）。[21]

## 5. deployment、work pool、worker 三者如何分层

Prefect 文档把 deployment 定义得很明确：「Deployments are server-side representations of flows」，负责存「when, where, and how a workflow should run」的元数据，并且「Deployments do not contain code definitions」。[19] 命名上，「Flow names describe **what** a workflow does; deployment names describe **how, where, or when** it runs」。[19]

真正决定“跑在哪”的是 work pool 和 worker：
- work pool 是「a bridge between the Prefect orchestration layer and the infrastructure where flows are run」；[20]
- hybrid/pull 类型的 work pool 需要一个 worker——「A Prefect worker is a client-side process that checks for scheduled flow runs in the work pool that it matches」；[19]
- push 或 Prefect-managed 类型的 work pool 则不需要 worker，由 Prefect 或云端 serverless 基础设施直接接单。[19][20]

这三层分工意味着：**flow 代码本身、调度这次运行的元数据、真正执行的基础设施**是三件可以独立替换的事情。

## 6. 动手活动

> [!example] 动手活动：输出 `prefect-architecture-card.md`
>
> 列你的系统里 flow、task、deployment、work pool 分别是谁；哪些 task 之间需要 `.submit()`/`PrefectFuture` 做并发。写一句结论：你的 flow 判定“成功/失败”的规则，是否和内部 task 的真实结果一致。

## 7. 总结

| 关键问题 | 一句话 |
|---|---|
| flow 在做什么 | 编排上下文并自动追踪状态 |
| task 在做什么 | 承接可重试、可缓存、可并发的执行单元 |
| flow run 的终态规则 | 取决于返回值/异常，而不只是内部 task 是否失败 |
| deployment/work pool/worker 分工 | 一个存运行元数据，一个连接基础设施，一个真正拉起执行 |

## 引用

- [18] https://docs.prefect.io/v3/concepts/flows — Prefect flows concept doc
- [19] https://docs.prefect.io/v3/concepts/deployments — Prefect deployments concept doc
- [20] https://docs.prefect.io/v3/concepts/work-pools — Prefect work pools concept doc
- [21] https://docs.prefect.io/v3/concepts/task-runners — Prefect task runners concept doc

上一篇：[01 Python-native orchestration 的设计哲学](/ai/03-frameworks/06/17/)

下一篇：[03 retries、mapping、events 与 resilient pipelines](/ai/03-frameworks/06/19/)
