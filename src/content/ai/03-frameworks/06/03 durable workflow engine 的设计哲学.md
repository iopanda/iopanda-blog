---
title: "durable workflow engine 的设计哲学"
number: "03.06.03"
chapter: 3
chapterTitle: "Frameworks"
section: 6
sectionTitle: "Workflow Orchestration Frameworks"
group: "3.10.3.6.1 Temporal"
created: 2026-09-04 10:10
author: "iopanda"
tags: ["framework", "workflow", "orchestration", "temporal", "architecture"]
sourceId: "3.10.3.6 Workflow Orchestration Frameworks/3.10.3.6.1 Temporal/01 durable workflow engine 的设计哲学"
---
# durable workflow engine 的设计哲学

> Temporal README 一上来就把自己定义成 durable execution platform。[5] 这句话很关键，因为 Temporal 的第一性问题不是“怎么画 DAG”，也不是“怎么定时调度任务”，而是：**当业务流程跨步骤、跨服务、跨时间，甚至跨天、跨人工审批和外部事件时，怎样让它在失败后还能继续，并且继续得对。**

**学习目标**：学完本章，你将能够——
1. 解释为什么 Temporal 首先像 durable workflow engine；
2. 理解它和 Airflow、Prefect、Dagster、Kestra 的根本差异不只是 API，而是主语不同；
3. 说出 workflow history、state transition、task queues 为什么是核心设计对象；
4. 判断什么时候系统真正需要 durable execution；
5. 为一个长生命周期 AI/业务流程写框架判断卡。

## 1. 概念：Temporal 解决的是“流程跨失败继续执行”

很多流程系统只回答：
- 哪些步骤按什么顺序执行；
- 什么时候跑；
- 失败后重试几次。

Temporal 关心的是更强的问题：[5]
- 流程本身的状态如何持久化；
- 某一步失败后如何按语义恢复；
- 外部事件、超时、信号、人工介入如何进入流程；
- 长时间运行时如何保证一致性与可靠性。

这就是 durable execution 和普通任务调度的核心区别。

## 2. 为什么这条路线独立成立

真实业务流程经常不是一次函数调用：
- 先调用外部 API；
- 等待对方系统回调；
- 超时则补偿；
- 中间还可能要人工批准；
- 流程持续几小时甚至几天。

如果用普通 queue + cron + DB 自己拼，很快会遇到：
- 状态难恢复；
- retries 语义不一致；
- 定时与补偿逻辑散落；
- 很难证明流程不会半途“逻辑丢失”。

Temporal 的价值正是在这里。

## 3. 为什么 history 和 mutable state 是核心

Temporal 的 workflow lifecycle 和 history service 文档写得非常清楚：[6][9]
- workflow history 是线性（或分支）事件序列；
- mutable state 是 workflow 当前状态的汇总；
- 输入请求、本地状态更新、history events、history tasks 一起构成 state transition。

这说明 Temporal 并不是把 workflow 当作“当前代码跑到哪”，而是当作一个可被重建、可被推进、可被恢复的状态机系统。

## 4. 和其他路线的第一差异

| 框架 | 第一性问题 | Temporal 相比的定位 |
|---|---|---|
| [Airflow](/ai/03-frameworks/06/09/) | 如何调度 DAG 和 batch tasks | Temporal 更先解决长生命周期 stateful execution |
| [Prefect](/ai/03-frameworks/06/16/) | 如何用 Python 写更友好的 resilient flows | Temporal 更偏 durable engine，而不只偏 DX |
| [Dagster](/ai/03-frameworks/06/23/) | 如何围绕 data assets 组织流程 | Temporal 更偏业务流程和状态恢复 |
| [Kestra](/ai/03-frameworks/06/30/) | 如何围绕 triggers/schedules/integrations 做自动化 | Temporal 更偏 execution semantics |

## 5. 什么时候最自然进入 Temporal

- 流程会运行很久；
- 流程需要等待外部信号、事件、审批；
- retries、timers、compensation 是核心语义；
- 你不能接受“失败后从头来一遍”这种粗糙恢复方式；
- AI agent 或业务流程已经长成 stateful system。

## 6. 动手活动

> [!example] 动手活动：输出 `temporal-fit.md`
>
> 列你的流程是否会跨服务、跨小时、跨人工审批、跨外部回调、跨重试补偿。写一句结论：你的主问题是任务调度，还是 durable execution。

## 7. 总结

| 关键问题 | 一句话 |
|---|---|
| Temporal 首先是什么 | durable workflow engine |
| 它在解决什么 | 跨失败、跨时间、跨外部事件的流程可靠执行 |
| 为什么值钱 | 把长生命周期状态与恢复语义正式化 |
| 最适合什么 | stateful business/agent workflows |

## 引用

- [5] https://github.com/temporalio/temporal/blob/main/README.md — Temporal README
- [6] https://github.com/temporalio/temporal/blob/main/docs/architecture/workflow-lifecycle.md — Temporal workflow lifecycle doc
- [9] https://github.com/temporalio/temporal/blob/main/docs/architecture/history-service.md — Temporal history service doc

上一篇：[03.06 Temporal](/ai/03-frameworks/06/02/)

下一篇：[02 workflow state、activity、retry、timer 与 signal](/ai/03-frameworks/06/04/)
