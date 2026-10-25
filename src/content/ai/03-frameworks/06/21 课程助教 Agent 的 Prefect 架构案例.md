---
title: "课程助教 Agent 的 Prefect 架构案例"
number: "03.06.21"
chapter: 3
chapterTitle: "Frameworks"
section: 6
sectionTitle: "Workflow Orchestration Frameworks"
group: "3.10.3.6.3 Prefect"
created: 2026-09-09 09:48
author: "iopanda"
tags: ["framework", "workflow", "orchestration", "prefect", "case-study"]
sourceId: "3.10.3.6 Workflow Orchestration Frameworks/3.10.3.6.3 Prefect/05 课程助教 Agent 的 Prefect 架构案例"
---
# 课程助教 Agent 的 Prefect 架构案例

> 把 Prefect 放回课程助教主线时，它最自然的角色不是“管理长时审批流程”，也不是“运营大量定时批处理 DAG”，而是：**课程助教团队本来就在写 Python 脚本（检索、生成、评分、发信），想让这些脚本原地升级成可重试、可观测、能对失败自动响应的生产工作流，而不必先搭一整套调度平台。**

**学习目标**：学完本章，你将能够——
1. 判断课程助教何时适合 Prefect；
2. 设计课程助教中的内容生成、批改反馈、通知发送等 flow/task 结构；
3. 说明为什么这里最重要的是“脚本到生产”的最短路径，而不是 durable execution 或 batch 调度；
4. 识别这个案例里的关键风险：`.map()` 的资源边界、automation 的告警噪音、work pool 选型；
5. 写一张课程助教的 Prefect 适配卡。

## 1. 什么时候课程助教适合 Prefect

- 团队已经有一批 Python 脚本在做检索、生成、批改、发信；
- 想要重试、缓存、超时控制，但还没有专门的调度或状态恢复平台；
- 单次任务的失败大多可以“重跑这一步”解决，不需要复杂的补偿逻辑；
- 需要事件驱动的自动化，比如生成失败发告警、批改积压超时自动升级；
- 需要在本地开发、小规模容器、按需 serverless 之间灵活切换执行环境。

## 2. 推荐架构

- flow 层：单次答疑/批改会话的整体流程；一批学生的批量生成任务
- task 层：检索课程知识、调用生成模型、格式化反馈、发信、写入日志
- 并发层：对一批学生用 `.map()` 并发跑同一个批改 task，配合 `ThreadPoolTaskRunner`/`ProcessPoolTaskRunner` 控制并发上限
- 重试层：调用外部模型/发信 API 失败时按 `exponential_backoff` + `retry_jitter_factor` 重试，用 `retry_condition_fn` 排除不该重试的错误（如 401/内容审核拒绝）
- automation 层：`prefect.flow-run.Failed` 触发告警；批改队列长时间未完成时用 Proactive trigger 自动升级或取消
- 部署层：小流量场景先用 hybrid work pool + 本地 worker，流量增长后再评估 push/serverless work pool

## 3. 为什么这里不优先选 Temporal 或 Airflow

不是因为 Temporal、Airflow 不强，而是这里的问题主语更偏：
- 团队已经有可运行的 Python 脚本，想要最小改动升级，而不是先接受 durable execution 的状态语义（这是 Temporal 的主场）；
- 任务大多是即时的生成/批改/通知，不是大量稳定的定时批处理 DAG（这是 Airflow 的主场）；
- 大部分失败通过“重跑这一步”就能解决，还没有走到需要人工审批、跨天等待、补偿这类正式语义的阶段。

如果未来课程助教长出跨天审批、外部系统异步回调的环节，那时候更适合评估是否要把这部分迁到 Temporal；如果长出大量定时数据/评估管线，那部分更适合评估是否要交给 Airflow。

## 4. 动手活动

> [!example] 输出 `course-ta-prefect-card.md`
>
> 为课程助教列：哪些步骤是纯 Python 函数可以直接包一层 `@task`、哪些批量场景适合 `.map()`、哪些失败需要重试而哪些不需要、哪些状态变化需要 automation 告警。写一句结论：你的课程助教系统现在最缺的是“把脚本变生产工作流”的能力，还是已经需要更重的 durable execution 或 batch 调度语义。

## 5. 总结

| 关键问题 | 一句话 |
|---|---|
| 课程助教为什么适合 Prefect | 因为团队本来就在写 Python 脚本，需要的是原地升级而不是重的平台迁移 |
| 最大价值 | 用最小改动获得重试、并发、观测和事件响应能力 |
| 不适合什么 | 已经长成跨天审批/补偿的业务流程，或已经是大量定时批处理管线 |

## 引用

- [13] https://github.com/PrefectHQ/prefect/blob/main/README.md — Prefect README
- [21] https://docs.prefect.io/v3/concepts/task-runners — Prefect task runners concept doc
- [22] https://docs.prefect.io/v3/how-to-guides/workflows/retries — Prefect retries how-to guide
- [23] https://docs.prefect.io/v3/how-to-guides/automations/creating-automations — Prefect automations how-to guide

上一篇：[04 观测、部署与工程边界](/iopanda-blog/ai/03-frameworks/06/20/)

下一篇：[06 Prefect 与 Temporal、Airflow、Dagster、Kestra 的深度对比](/iopanda-blog/ai/03-frameworks/06/22/)
