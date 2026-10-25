---
title: "Dagster"
number: "03.06.23"
chapter: 3
chapterTitle: "Frameworks"
section: 6
sectionTitle: "Workflow Orchestration Frameworks"
group: "3.10.3.6.4 Dagster"
created: 2026-09-04 09:40
author: "iopanda"
tags: ["framework", "workflow", "orchestration", "dagster"]
sourceId: "3.10.3.6 Workflow Orchestration Frameworks/3.10.3.6.4 Dagster/README"
---
# Dagster

> 模块定位：从“data asset orchestration platform”这条路线理解 workflow orchestration framework。Dagster 适合回答：如果你的主问题不是 task DAG 本身，而是数据资产、lineage、software-defined assets 和 data platform governance，该用什么平台承载？[14]

**本目录计划关注**：
1. Dagster 为什么首先像 asset orchestration platform；
2. assets、jobs、ops、resources、sensors 的关系；
3. 与 Airflow、Prefect、Temporal 的差异；
4. AI / analytics / feature pipelines 案例；
5. 资产治理、lineage 与工程边界。

**建议后续拆分**：
- 01 asset-first orchestration 的设计哲学
- 02 assets、jobs、ops、resources 与 lineage
- 03 sensors、partitions、data platform workflows
- 04 资产治理、可观测性与工程边界
- 05 课程助教系统的数据资产案例
- 06 Dagster 与 Temporal、Airflow、Prefect、Kestra 的深度对比

## 本目录笔记导航

1. [01 asset-first orchestration 的设计哲学](/ai/03-frameworks/06/24/)
2. [02 assets、jobs、ops、resources 与 lineage](/ai/03-frameworks/06/25/)
3. [03 sensors、partitions、data platform workflows](/ai/03-frameworks/06/26/)
4. [04 资产治理、可观测性与工程边界](/ai/03-frameworks/06/27/)
5. [05 课程助教系统的数据资产案例](/ai/03-frameworks/06/28/)
6. [06 Dagster 与 Temporal、Airflow、Prefect、Kestra 的深度对比](/ai/03-frameworks/06/29/)

上一篇：[03.06 Prefect](/ai/03-frameworks/06/16/)

下一篇：[01 asset-first orchestration 的设计哲学](/ai/03-frameworks/06/24/)
