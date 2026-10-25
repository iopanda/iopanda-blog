---
title: "Dagster 与 Temporal、Airflow、Prefect、Kestra 的深度对比"
number: "03.06.29"
chapter: 3
chapterTitle: "Frameworks"
section: 6
sectionTitle: "Workflow Orchestration Frameworks"
group: "3.10.3.6.4 Dagster"
created: 2026-09-09 10:10
author: "iopanda"
tags: ["framework", "workflow", "orchestration", "dagster", "comparison"]
sourceId: "3.10.3.6 Workflow Orchestration Frameworks/3.10.3.6.4 Dagster/06 Dagster 与 Temporal、Airflow、Prefect、Kestra 的深度对比"
---
# Dagster 与 Temporal、Airflow、Prefect、Kestra 的深度对比

> 到这里，Dagster 的位置已经很清楚：它首先不是 durable execution engine，不是经典的 DAG 调度与运营平台，不是脚本到生产的最短路径框架，也不是声明式 event-driven automation platform；它首先是 **asset-first data orchestration platform**。[14] 这一篇就是把它放回整个 workflow orchestration framework 版图里。

**学习目标**：学完本章，你将能够——
1. 站在 Dagster 视角解释它与 Temporal、Airflow、Prefect、Kestra 的差异；
2. 理解为什么“asset-first orchestration”是一条独立路线；
3. 判断什么时候该优先选 Dagster，什么时候不该；
4. 写出一段“为什么这里选 Dagster”的架构说明；
5. 识别 Dagster 最常见的误用。

## 1. 与 Temporal 的差异

- Temporal 更像面向长生命周期业务流程的 durable workflow engine，核心是状态恢复、补偿、human-in-the-loop；
- Dagster 更像围绕数据资产组织流程的治理平台，核心是血缘、新鲜度、数据目录，不追求业务流程状态恢复的正式语义。

## 2. 与 Airflow 的差异

- Airflow 更像 task/DAG-first 的调度与运营平台，任务依赖图是主对象，强调 backfill、schedule interval、统一 ops UI；
- Dagster 同样支持定时调度和 backfill，但任务图是资产依赖关系的副产品，主对象始终是资产本身及其血缘、新鲜度。

## 3. 与 Prefect 的差异

- Prefect 更像“脚本到生产”的最短路径，装饰器直接包裹已有函数，追求开发者体验和最小改动成本；
- Dagster 需要先把“资产是什么、依赖谁”想清楚，前期建模成本更高，换来的是跨工具统一的资产目录和字段级血缘。

## 4. 与 Kestra 的差异

- Kestra 更像声明式 YAML 驱动的 event-driven orchestration 平台，强调 triggers 和 integrations；
- Dagster 更像用 Python 声明数据资产及其依赖，sensor/partition/backfill 都是围绕“资产怎么被生产和追踪”服务，而不是通用的事件自动化。

## 5. 什么时候最适合 Dagster

适合：
- 数据/分析工程团队，需要跨工具（dbt、Spark、Python）统一的资产目录和血缘；
- 需要把数据质量检查、字段结构、责任人正式化，而不是靠文档或口头约定；
- 组织已经大到需要清楚回答“这份数据现在新鲜吗、依赖了谁、谁负责”这类问题；
- 需要按时间/类别/多维度对资产分区，支撑增量处理和历史补数。

不那么适合：
- 流程本质是长期等待外部事件、人工审批、跨天补偿（这是 Temporal 的主场）；
- 主要问题是大量稳定 batch DAG 的调度和统一运营，资产血缘不是当务之急（这是 Airflow 的主场）；
- 团队只是想让已有脚本更可靠，还没到需要资产目录和字段血缘的阶段（这是 Prefect 的主场）；
- 主要想用声明式 YAML 做通用事件驱动自动化，而不是围绕数据资产建模（这是 Kestra 的主场）。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| Dagster 最像什么 | asset-first data orchestration platform |
| 与 Temporal 的差异 | 一个偏资产血缘与新鲜度，一个偏彻底的 durable execution |
| 与 Airflow 的差异 | 一个偏 asset-first，一个偏 task/DAG-first |
| 与 Prefect 的差异 | 一个偏资产建模与治理，一个偏脚本到生产的最短路径 |
| 与 Kestra 的差异 | 一个偏数据资产声明，一个偏声明式事件自动化 |

## 引用

- [11] https://github.com/temporalio/temporal — Temporal GitHub
- [12] https://github.com/apache/airflow — Apache Airflow GitHub
- [13] https://github.com/PrefectHQ/prefect — Prefect GitHub
- [14] https://github.com/dagster-io/dagster — Dagster GitHub
- [15] https://github.com/kestra-io/kestra — Kestra GitHub

上一篇：[05 课程助教系统的数据资产案例](/iopanda-blog/ai/03-frameworks/06/28/)

下一篇：回到 [03.06 Workflow Framework 选型矩阵](/iopanda-blog/ai/03-frameworks/06/37/)
