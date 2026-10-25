---
title: "Temporal 与 Airflow、Prefect、Dagster、Kestra 的深度对比"
number: "03.06.08"
chapter: 3
chapterTitle: "Frameworks"
section: 6
sectionTitle: "Workflow Orchestration Frameworks"
group: "3.10.3.6.1 Temporal"
created: 2026-09-04 10:20
author: "iopanda"
tags: ["framework", "workflow", "orchestration", "temporal", "comparison"]
sourceId: "3.10.3.6 Workflow Orchestration Frameworks/3.10.3.6.1 Temporal/06 Temporal 与 Airflow、Prefect、Dagster、Kestra 的深度对比"
---
# Temporal 与 Airflow、Prefect、Dagster、Kestra 的深度对比

> 到这里，Temporal 的位置已经很清楚：它首先不是经典 DAG 调度平台，不是 Python-friendly data flow 工具，不是 asset orchestration 平台，也不是 event-driven integration platform；它首先是 **durable workflow engine**。[5] 这一篇就是把它放回整个 workflow orchestration framework 版图里。

**学习目标**：学完本章，你将能够——
1. 站在 Temporal 视角解释它与 Airflow、Prefect、Dagster、Kestra 的差异；
2. 理解为什么“durable execution”是一条独立路线；
3. 判断什么时候该优先选 Temporal，什么时候不该；
4. 写出一段“为什么这里选 Temporal”的架构说明；
5. 识别 Temporal 最常见的误用。

## 1. 与 Airflow 的差异

- Airflow 更像 DAG scheduling / batch orchestration platform；
- Temporal 更像长生命周期 stateful workflow engine。

## 2. 与 Prefect 的差异

- Prefect 更像 Python-native resilient flow 框架；
- Temporal 更像在 durable execution 语义上更重更正式的引擎。

## 3. 与 Dagster 的差异

- Dagster 更像围绕 data assets 与 lineage 组织流程；
- Temporal 更像围绕业务流程和状态恢复组织执行。

## 4. 与 Kestra 的差异

- Kestra 更像 event-driven orchestration / scheduling platform；
- Temporal 更像把等待、重试、补偿、恢复做成执行语义。

## 5. 什么时候最适合 Temporal

适合：
- 流程很长；
- 有 signals、timers、human-in-the-loop；
- 恢复语义和补偿语义是核心；
- 不能接受粗糙的“失败就重跑整个流程”。

不那么适合：
- 只是定时 batch DAG；
- 主要是数据资产治理；
- 主要想用 Python 更轻松写流程；
- 主要是事件驱动自动化而不是 durable workflow。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| Temporal 最像什么 | durable workflow engine |
| 与 Airflow 的差异 | 一个偏状态恢复，一个偏 DAG 调度 |
| 与 Prefect 的差异 | 一个偏 durable engine，一个偏 Python-native flow |
| 与 Dagster 的差异 | 一个偏业务流程，一个偏资产治理 |
| 与 Kestra 的差异 | 一个偏执行语义，一个偏事件驱动自动化 |

## 引用

- [5] https://github.com/temporalio/temporal/blob/main/README.md — Temporal README
- [12] https://github.com/apache/airflow — Apache Airflow GitHub
- [13] https://github.com/PrefectHQ/prefect — Prefect GitHub
- [14] https://github.com/dagster-io/dagster — Dagster GitHub
- [15] https://github.com/kestra-io/kestra — Kestra GitHub

上一篇：[05 课程助教 Agent 的 Temporal 架构案例](/ai/03-frameworks/06/07/)

下一篇：回到 [03.06 Workflow Framework 选型矩阵](/ai/03-frameworks/06/37/)
