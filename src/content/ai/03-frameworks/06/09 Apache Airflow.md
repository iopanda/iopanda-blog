---
title: "Apache Airflow"
number: "03.06.09"
chapter: 3
chapterTitle: "Frameworks"
section: 6
sectionTitle: "Workflow Orchestration Frameworks"
group: "3.10.3.6.2 Apache Airflow"
created: 2026-09-04 09:40
author: "iopanda"
tags: ["framework", "workflow", "orchestration", "airflow"]
sourceId: "3.10.3.6 Workflow Orchestration Frameworks/3.10.3.6.2 Apache Airflow/README"
---
# Apache Airflow

> 模块定位：从“DAG scheduling 与任务调度平台”这条路线理解 workflow orchestration framework。Apache Airflow 适合回答：如果你的主问题是 batch workflows、依赖调度、定时任务、运营可视化和海量数据任务监控，该用什么平台承载？[12]

**本目录计划关注**：
1. Airflow 为什么首先像 DAG scheduling platform；
2. DAG、task、operator、scheduler、executor 的关系；
3. 与 Temporal、Prefect、Dagster 的差异；
4. AI data pipelines / evaluation pipelines 案例；
5. 定时调度、backfill 与运营边界。

**建议后续拆分**：
- 01 DAG scheduling platform 的设计哲学
- 02 DAG、operator、scheduler 与 executor
- 03 backfill、retry、data pipeline 与批处理思维
- 04 运营可视化、部署与工程边界
- 05 课程助教系统的数据/评估管线案例
- 06 Airflow 与 Temporal、Prefect、Dagster、Kestra 的深度对比

## 本目录笔记导航

1. [01 DAG scheduling platform 的设计哲学](/ai/03-frameworks/06/10/)
2. [02 DAG、operator、scheduler 与 executor](/ai/03-frameworks/06/11/)
3. [03 backfill、retry、data pipeline 与批处理思维](/ai/03-frameworks/06/12/)
4. [04 运营可视化、部署与工程边界](/ai/03-frameworks/06/13/)
5. [05 课程助教系统的数据/评估管线案例](/ai/03-frameworks/06/14/)
6. [06 Airflow 与 Temporal、Prefect、Dagster、Kestra 的深度对比](/ai/03-frameworks/06/15/)

上一篇：[03.06 Temporal](/ai/03-frameworks/06/02/)

下一篇：[01 DAG scheduling platform 的设计哲学](/ai/03-frameworks/06/10/)
