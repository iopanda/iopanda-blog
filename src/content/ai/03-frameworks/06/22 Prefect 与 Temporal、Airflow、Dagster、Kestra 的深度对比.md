---
title: "Prefect 与 Temporal、Airflow、Dagster、Kestra 的深度对比"
number: "03.06.22"
chapter: 3
chapterTitle: "Frameworks"
section: 6
sectionTitle: "Workflow Orchestration Frameworks"
group: "3.10.3.6.3 Prefect"
created: 2026-09-09 09:50
author: "iopanda"
tags: ["framework", "workflow", "orchestration", "prefect", "comparison"]
sourceId: "3.10.3.6 Workflow Orchestration Frameworks/3.10.3.6.3 Prefect/06 Prefect 与 Temporal、Airflow、Dagster、Kestra 的深度对比"
---
# Prefect 与 Temporal、Airflow、Dagster、Kestra 的深度对比

> 到这里，Prefect 的位置已经很清楚：它首先不是 durable execution engine，不是成熟的 DAG 调度与运营平台，不是 asset-first data orchestration 平台，也不是声明式 event-driven automation platform；它首先是 **Python-native workflow orchestration framework**。[13] 这一篇就是把它放回整个 workflow orchestration framework 版图里。

**学习目标**：学完本章，你将能够——
1. 站在 Prefect 视角解释它与 Temporal、Airflow、Dagster、Kestra 的差异；
2. 理解为什么“Python-native orchestration”是一条独立路线；
3. 判断什么时候该优先选 Prefect，什么时候不该；
4. 写出一段“为什么这里选 Prefect”的架构说明；
5. 识别 Prefect 最常见的误用。

## 1. 与 Temporal 的差异

- Temporal 更像面向长生命周期业务流程的 durable workflow engine，把状态恢复、补偿、human-in-the-loop 变成正式语义；
- Prefect 更像 Python 原生的开发体验优先框架，重试/缓存/事件响应都很正式，但不追求 Temporal 那种彻底的状态恢复语义。

## 2. 与 Airflow 的差异

- Airflow 更像成熟的 DAG 调度与运营平台，强调 backfill、schedule interval、统一 UI 运营，适合大体稳定的 batch pipeline；
- Prefect 更像“脚本到生产”的最短路径，装饰器即可上手，运营面更轻，但也没有 Airflow 那么厚重的批处理运营心智。

## 3. 与 Dagster 的差异

- Dagster 更像围绕 data assets 与 lineage 组织流程的资产治理平台；
- Prefect 更像围绕 flow/task 执行语义组织流程，不强制你先定义资产模型。

## 4. 与 Kestra 的差异

- Kestra 更像声明式 YAML 驱动的 event-driven orchestration 平台，强调 triggers 和 integrations；
- Prefect 更像用 Python 代码本身表达逻辑，automations 是叠加在代码之上的事件响应层，而不是主要的流程定义方式。

## 5. 什么时候最适合 Prefect

适合：
- 团队本来就在写 Python 脚本，想要最小改动获得生产级能力；
- 需要重试、缓存、并发（`.map()`/task runner）这类开发者体验优先的能力；
- 需要事件驱动的告警和自动化响应，但还没有走到企业级 durable execution 或资产治理阶段；
- 想要在本地、容器、K8s、serverless 之间灵活切换执行环境。

不那么适合：
- 流程会长期等待外部事件、人工审批、跨天补偿（这是 Temporal 的主场）；
- 主要问题是大量稳定 batch DAG 的定时调度和统一运营（这是 Airflow 的主场）；
- 核心诉求是数据资产的血缘与治理（这是 Dagster 的主场）；
- 主要想用声明式 YAML 做事件驱动自动化，而不是用代码表达逻辑（这是 Kestra 的主场）。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| Prefect 最像什么 | Python-native workflow orchestration framework |
| 与 Temporal 的差异 | 一个偏开发者体验优先，一个偏彻底的 durable execution |
| 与 Airflow 的差异 | 一个偏“脚本到生产”的最短路径，一个偏成熟批处理调度与运营平台 |
| 与 Dagster 的差异 | 一个偏 flow/task 执行语义，一个偏 data assets 与 lineage |
| 与 Kestra 的差异 | 一个偏代码原生表达，一个偏声明式 YAML 与 triggers |

## 引用

- [11] https://github.com/temporalio/temporal — Temporal GitHub
- [12] https://github.com/apache/airflow — Apache Airflow GitHub
- [13] https://github.com/PrefectHQ/prefect/blob/main/README.md — Prefect README
- [14] https://github.com/dagster-io/dagster — Dagster GitHub
- [15] https://github.com/kestra-io/kestra — Kestra GitHub

上一篇：[05 课程助教 Agent 的 Prefect 架构案例](/iopanda-blog/ai/03-frameworks/06/21/)

下一篇：回到 [03.06 Workflow Framework 选型矩阵](/iopanda-blog/ai/03-frameworks/06/37/)
