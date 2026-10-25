---
title: "Workflow Orchestration Frameworks"
number: "03.06.01"
chapter: 3
chapterTitle: "Frameworks"
section: 6
sectionTitle: "Workflow Orchestration Frameworks"
group: ""
created: 2026-09-04 09:40
author: "iopanda"
tags: ["ai", "frameworks", "workflow", "orchestration", "learning-path"]
sourceId: "3.10.3.6 Workflow Orchestration Frameworks/README"
---
# Workflow Orchestration Frameworks

> `03.05 Evaluation and Observability Frameworks` 已经把质量系统讲清楚了；接下来的 `03.06 Workflow Orchestration Frameworks` 要回答的是另一类极其工程化的问题：**当你的 AI 系统不再是单次调用，而是一个会跨步骤、跨服务、跨时间持续执行的业务流程时，你拿什么框架去编排、恢复、调度、重试、监控和治理这些工作流？** 这一章不把 workflow orchestration 看成“写几个 cron 和 queue”，而是把它视为 state、retries、durability、scheduling、human-in-the-loop、data dependencies 和 production operations 的组合系统。[11][12][13][14][15]

**学习目标**：完成本模块后，你将能够——
1. 区分五条主流 workflow orchestration framework 路线：durable execution、data workflow scheduling、Python-native orchestration、data asset orchestration、event-driven orchestration；
2. 解释为什么同样是“编排流程”，Temporal、Airflow、Prefect、Dagster、Kestra 的设计中心完全不同；
3. 用状态持久化、调度模型、恢复语义、开发者体验、资产治理和组织协作方式来做 workflow framework 选型；
4. 判断什么时候你需要的是 durable workflow engine，什么时候更需要 DAG scheduler 或 asset orchestrator；
5. 为一个课程助教、数据系统或企业自动化平台写 workflow framework 选型卡。

## 1. 为什么单开这一章

- 很多团队一开始会把 workflow 理解成：
  - 定时跑一下；
  - 按顺序调几个 API；
  - 失败了重试一下。
- 但一旦进入真实工程，就会出现：
  - 流程跨多步、多服务、多小时甚至多天；
  - 某一步失败后到底从哪恢复；
  - 人工审批、等待外部事件、超时补偿怎么表达；
  - 数据依赖、资产依赖、任务依赖是不是一回事；
  - 哪些是 durable execution 问题，哪些是 DAG scheduling 问题，哪些是资产治理问题。
- 所以 workflow orchestration framework 的真正价值，不在“能把步骤串起来”，而在：**把跨时间、跨状态、跨失败模式的复杂度收进稳定语言。**

## 2. 2026-09 我建议这一模块先聚焦的 top 5

> [!note] 现实边界
> 这里的 top 5 不是“编排生态唯一正确榜单”，而是按 2026-09 的工程代表性和教学价值筛出来的五条路线：durable execution、经典数据调度、Python-native orchestration、asset-first orchestration、event-driven orchestration。[11][12][13][14][15]

| 框架 | 一句话定位 | 设计中心 | 更像什么 | 更适合谁 |
|---|---|---|---|---|
| [Temporal](/iopanda-blog/ai/03-frameworks/06/02/) | 面向长生命周期业务流程的 durable execution engine | stateful workflows + retries + recovery | durable workflow engine | 需要可靠恢复、补偿、长时运行流程的团队 |
| [Apache Airflow](/iopanda-blog/ai/03-frameworks/06/09/) | 经典工作流调度平台 | DAG scheduling + task orchestration + ops | 数据/任务调度平台 | 有大量 batch/ETL/定时调度需求的团队 |
| [Prefect](/iopanda-blog/ai/03-frameworks/06/16/) | Python-native workflow orchestration | developer UX + resilient flows | Python 工作流框架 | 想用 Python 直接写可恢复流程的团队 |
| [Dagster](/iopanda-blog/ai/03-frameworks/06/23/) | data asset orchestration platform | assets + lineage + software-defined data | 数据资产编排平台 | 数据团队、分析工程团队、资产治理需求强的组织 |
| [Kestra](/iopanda-blog/ai/03-frameworks/06/30/) | event-driven orchestration & scheduling platform | declarative workflows + triggers + integrations | 事件驱动自动化平台 | 想统一任务、事件、自动化与关键业务流程的团队 |

## 3. 为什么先不把 n8n / Argo Workflows 放进这一组主角

- `n8n` 很强，也非常流行，但更偏 visual automation / integration platform；在这一章首批主角里，我更优先保留面向开发者和架构师更强的工程编排语言；[16]
- `Argo Workflows` 也很重要，但更偏 Kubernetes-native workflow engine / infra orchestration；如果这一章第一批只留 5 个，`Temporal` 与 `Airflow`/`Dagster`/`Prefect`/`Kestra` 的路线差异更适合作为教学骨架；[17]
- 这一章先讲“你用什么语言组织 workflow complexity”，不先追求把所有自动化平台都列全。

## 4. 这一模块建议怎么读

1. 先看 [03.06 Temporal](/iopanda-blog/ai/03-frameworks/06/02/)：先把 durable workflow engine 的核心心智钉牢；
2. 再看 [03.06 Apache Airflow](/iopanda-blog/ai/03-frameworks/06/09/)：理解 DAG scheduling 路线；
3. 再看 [03.06 Prefect](/iopanda-blog/ai/03-frameworks/06/16/)：理解 Python-native orchestration 路线；
4. 再看 [03.06 Dagster](/iopanda-blog/ai/03-frameworks/06/23/)：理解 asset-first orchestration 路线；
5. 最后看 [03.06 Kestra](/iopanda-blog/ai/03-frameworks/06/30/)：理解 event-driven orchestration 路线。

## 5. 本模块笔记导航

1. [03.06 Temporal](/iopanda-blog/ai/03-frameworks/06/02/)
2. [03.06 Apache Airflow](/iopanda-blog/ai/03-frameworks/06/09/)
3. [03.06 Prefect](/iopanda-blog/ai/03-frameworks/06/16/)
4. [03.06 Dagster](/iopanda-blog/ai/03-frameworks/06/23/)
5. [03.06 Kestra](/iopanda-blog/ai/03-frameworks/06/30/)
6. [03.06 Workflow Framework 选型矩阵](/iopanda-blog/ai/03-frameworks/06/37/)

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| 这一模块讲什么 | 不是“怎么串步骤”，而是“如何组织跨时间状态和恢复的 workflow system” |
| top 5 是谁 | Temporal / Airflow / Prefect / Dagster / Kestra |
| 五条路线分别代表什么 | durable engine / DAG 调度 / Python workflow / asset orchestration / 事件驱动编排 |
| 学习重点 | 学会判断 workflow complexity 的主矛盾，而不是只看谁能画 DAG |

## 引用

- [11] https://github.com/temporalio/temporal — Temporal GitHub
- [12] https://github.com/apache/airflow — Apache Airflow GitHub
- [13] https://github.com/PrefectHQ/prefect — Prefect GitHub
- [14] https://github.com/dagster-io/dagster — Dagster GitHub
- [15] https://github.com/kestra-io/kestra — Kestra GitHub
- [16] https://github.com/n8n-io/n8n — n8n GitHub
- [17] https://github.com/argoproj/argo-workflows — Argo Workflows GitHub

上一篇：[03.05 Evaluation and Observability Frameworks](/iopanda-blog/ai/03-frameworks/05/01/)——质量系统已经讲完；下一模块开始处理“这些 AI 能力如何跨步骤、跨时间、跨失败模式被编排”。

下一篇：[03.06 Temporal](/iopanda-blog/ai/03-frameworks/06/02/)——先从 durable workflow engine 路线开始。
