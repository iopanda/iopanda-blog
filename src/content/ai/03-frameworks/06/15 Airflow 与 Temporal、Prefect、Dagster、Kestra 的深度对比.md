---
title: "Airflow 与 Temporal、Prefect、Dagster、Kestra 的深度对比"
number: "03.06.15"
chapter: 3
chapterTitle: "Frameworks"
section: 6
sectionTitle: "Workflow Orchestration Frameworks"
group: "3.10.3.6.2 Apache Airflow"
created: 2026-09-04 10:50
author: "iopanda"
tags: ["framework", "workflow", "orchestration", "airflow", "comparison"]
sourceId: "3.10.3.6 Workflow Orchestration Frameworks/3.10.3.6.2 Apache Airflow/06 Airflow 与 Temporal、Prefect、Dagster、Kestra 的深度对比"
---
# Airflow 与 Temporal、Prefect、Dagster、Kestra 的深度对比

> 到这里，Airflow 的位置已经很清楚：它首先不是 durable execution engine，不是 Python-first resilient flow 框架，不是 asset-first data orchestration 平台，也不是 event-driven automation platform；它首先是 **DAG scheduling and task orchestration platform**。[11] 这一篇就是把它放回整个 workflow orchestration framework 版图里。

**学习目标**：学完本章，你将能够——
1. 站在 Airflow 视角解释它与 Temporal、Prefect、Dagster、Kestra 的差异；
2. 理解为什么“DAG scheduling”是一条独立路线；
3. 判断什么时候该优先选 Airflow，什么时候不该；
4. 写出一段“为什么这里选 Airflow”的架构说明；
5. 识别 Airflow 最常见的误用。

## 1. 与 Temporal 的差异

- Temporal 更像 durable workflow engine；
- Airflow 更像 DAG scheduling / batch orchestration platform。

## 2. 与 Prefect 的差异

- Prefect 更像 Python-native resilient flow；
- Airflow 更像成熟调度平台与运营界面。

## 3. 与 Dagster 的差异

- Dagster 更像 asset-first orchestration；
- Airflow 更像 task/DAG-first 调度系统。

## 4. 与 Kestra 的差异

- Kestra 更像 event-driven orchestration platform；
- Airflow 更像定时/批处理调度平台。

## 5. 什么时候最适合 Airflow

适合：
- workflow 结构相对稳定；
- 需要 schedule + backfill + ops UI；
- 大量 batch/data/AI pipelines；
- 想把任务调度和运营统一在成熟平台中。

不那么适合：
- 流程会长期等待外部事件和审批；
- 主要问题是 durable state recovery；
- 主要问题是资产治理而不是 task DAG；
- 主要问题是事件驱动自动化而不是批处理调度。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| Airflow 最像什么 | DAG scheduling platform |
| 与 Temporal 的差异 | 一个偏 durable execution，一个偏 DAG 调度 |
| 与 Prefect 的差异 | 一个偏成熟平台，一个偏 Python-native flow |
| 与 Dagster 的差异 | 一个偏 task 图，一个偏 data assets |
| 与 Kestra 的差异 | 一个偏 batch scheduling，一个偏 event-driven automation |

## 引用

- [11] https://github.com/apache/airflow/blob/main/README.md — Apache Airflow README
- [11] https://github.com/temporalio/temporal — Temporal GitHub
- [13] https://github.com/PrefectHQ/prefect — Prefect GitHub
- [14] https://github.com/dagster-io/dagster — Dagster GitHub
- [15] https://github.com/kestra-io/kestra — Kestra GitHub

上一篇：[05 课程助教系统的数据/评估管线案例](/iopanda-blog/ai/03-frameworks/06/14/)

下一篇：回到 [03.06 Workflow Framework 选型矩阵](/iopanda-blog/ai/03-frameworks/06/37/)
