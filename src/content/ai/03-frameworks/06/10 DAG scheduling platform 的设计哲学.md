---
title: "DAG scheduling platform 的设计哲学"
number: "03.06.10"
chapter: 3
chapterTitle: "Frameworks"
section: 6
sectionTitle: "Workflow Orchestration Frameworks"
group: "3.10.3.6.2 Apache Airflow"
created: 2026-09-04 10:40
author: "iopanda"
tags: ["framework", "workflow", "orchestration", "airflow", "architecture"]
sourceId: "3.10.3.6 Workflow Orchestration Frameworks/3.10.3.6.2 Apache Airflow/01 DAG scheduling platform 的设计哲学"
---
# DAG scheduling platform 的设计哲学

> Apache Airflow README 对自己的定位非常经典：a platform to programmatically author, schedule, and monitor workflows。[11] 这句话的关键不在“workflow”这个词本身，而在 **schedule** 和 **monitor**。也就是说，Airflow 的第一性问题不是“如何让长生命周期状态流程自动恢复”，而是：**怎样把一组大体稳定、可重复、可观测的任务依赖图持续调度起来。**

**学习目标**：学完本章，你将能够——
1. 解释为什么 Airflow 首先像 DAG scheduling platform；
2. 理解它和 Temporal、Prefect、Dagster、Kestra 的主语差异；
3. 说出 Airflow 为什么特别适合 mostly static and slowly changing workflows；
4. 判断什么时候系统最自然进入 Airflow 路线；
5. 为一个 batch/data/AI pipeline 写框架判断卡。

## 1. 概念：Airflow 解决的是“依赖图调度”

Airflow README 已经说得很清楚：[11]
- workflows are defined as code；
- scheduler 执行 tasks；
- worker 遵循 dependencies；
- UI 负责 visualize、monitor、troubleshoot。

这说明 Airflow 的核心心智不是“状态机恢复”，而是“任务图调度 + 运营可视化”。

## 2. 为什么它适合 mostly static workflows

README 明确强调：Airflow works best with workflows that are mostly static and slowly changing。[11]
这句话非常重要，因为它直接给出了边界：
- 它适合有清晰拓扑的 pipeline；
- 适合每天、每小时、每批次重复运行；
- 适合结构不会在运行期发生巨大变化的工作流。

## 3. 为什么这条路线独立成立

很多组织真正最需要的不是 durable execution，而是：
- 定时调度；
- DAG 依赖；
- backfill；
- 运维可视化；
- 海量 task runs 的统一管理。

这类问题更像 scheduler/ops 问题，而不是 workflow state semantics 问题。

## 4. 与其他路线的差异

| 框架 | 第一性问题 | Airflow 相比的定位 |
|---|---|---|
| [Temporal](/ai/03-frameworks/06/02/) | 如何让 stateful 流程跨失败恢复 | Airflow 更偏 DAG scheduling 和 batch orchestration |
| [Prefect](/ai/03-frameworks/06/16/) | 如何用 Python 更自然写 resilient flows | Airflow 更偏成熟调度平台和运营视角 |
| [Dagster](/ai/03-frameworks/06/23/) | 如何围绕 data assets 组织流程 | Airflow 更偏 task DAG，而不是 asset-first |
| [Kestra](/ai/03-frameworks/06/30/) | 如何围绕 triggers/integrations 做事件驱动自动化 | Airflow 更偏批处理和调度主语 |

## 5. 什么时候最自然进入 Airflow

- 任务图相对稳定；
- 有大量定时/批处理任务；
- 需要 backfill；
- 需要成熟的 UI 和运营视角；
- 想把 AI/数据流程嵌进既有 data platform 调度系统。

## 6. 动手活动

> [!example] 动手活动：输出 `airflow-fit.md`
>
> 列你的系统是否主要是定时批处理、依赖稳定 DAG、需要 backfill、需要统一 UI 运营。写一句结论：你的主问题是 durable state recovery，还是 DAG scheduling。

## 7. 总结

| 关键问题 | 一句话 |
|---|---|
| Airflow 首先是什么 | DAG scheduling platform |
| 它在解决什么 | 稳定任务图的调度、监控和运营复杂度 |
| 为什么值钱 | 把 batch/data/AI pipelines 组织成可调度、可视化系统 |
| 最适合什么 | mostly static and slowly changing workflows |

## 引用

- [11] https://github.com/apache/airflow/blob/main/README.md — Apache Airflow README
- [12] https://github.com/apache/airflow/blob/main/INSTALLING.md — Apache Airflow installing guide

上一篇：[03.06 Apache Airflow](/ai/03-frameworks/06/09/)

下一篇：[02 DAG、operator、scheduler 与 executor](/ai/03-frameworks/06/11/)
