---
title: "Temporal"
number: "03.06.02"
chapter: 3
chapterTitle: "Frameworks"
section: 6
sectionTitle: "Workflow Orchestration Frameworks"
group: "3.10.3.6.1 Temporal"
created: 2026-09-04 09:40
author: "iopanda"
tags: ["framework", "workflow", "orchestration", "temporal"]
sourceId: "3.10.3.6 Workflow Orchestration Frameworks/3.10.3.6.1 Temporal/README"
---
# Temporal

> 模块定位：从“durable workflow engine”这条路线理解 workflow orchestration framework。Temporal 适合回答：如果你的主问题是长生命周期流程的状态恢复、重试、补偿、等待外部事件和可靠执行，该用什么框架承载？[11]

**本目录计划关注**：
1. Temporal 为什么首先像 durable execution engine；
2. workflows、activities、retries、timers、signals 的关系；
3. 与 Airflow、Prefect、Dagster、Kestra 的差异；
4. AI agent / approval / long-running task 案例；
5. 可靠恢复、状态管理与工程边界。

**建议后续拆分**：
- 01 durable workflow engine 的设计哲学
- 02 workflow state、activity、retry、timer 与 signal
- 03 human-in-the-loop、external events 与长时流程
- 04 可恢复性、幂等性、补偿与工程边界
- 05 课程助教 Agent 的 Temporal 架构案例
- 06 Temporal 与 Airflow、Prefect、Dagster、Kestra 的深度对比

## 本目录笔记导航

1. [01 durable workflow engine 的设计哲学](/ai/03-frameworks/06/03/)
2. [02 workflow state、activity、retry、timer 与 signal](/ai/03-frameworks/06/04/)
3. [03 human-in-the-loop、external events 与长时流程](/ai/03-frameworks/06/05/)
4. [04 可恢复性、幂等性、补偿与工程边界](/ai/03-frameworks/06/06/)
5. [05 课程助教 Agent 的 Temporal 架构案例](/ai/03-frameworks/06/07/)
6. [06 Temporal 与 Airflow、Prefect、Dagster、Kestra 的深度对比](/ai/03-frameworks/06/08/)

上一篇：[03.06 Workflow Orchestration Frameworks](/ai/03-frameworks/06/01/)

下一篇：[01 durable workflow engine 的设计哲学](/ai/03-frameworks/06/03/)
