---
title: "sensors、partitions、data platform workflows"
number: "03.06.26"
chapter: 3
chapterTitle: "Frameworks"
section: 6
sectionTitle: "Workflow Orchestration Frameworks"
group: "3.10.3.6.4 Dagster"
created: 2026-09-09 10:04
author: "iopanda"
tags: ["framework", "workflow", "orchestration", "dagster", "sensors", "partitions"]
sourceId: "3.10.3.6 Workflow Orchestration Frameworks/3.10.3.6.4 Dagster/03 sensors、partitions、data platform workflows"
---
# sensors、partitions、data platform workflows

> 如果第 01、02 篇讲的是“资产是什么”，这一篇讲的是数据平台里两个最常见的现实问题：**数据什么时候该被重新生产**（sensors）和**数据应该按什么颗粒度被追踪与重算**（partitions）。[28][29][30] 两者合起来，才构成一个真正能长期运营的 data platform workflow。

**学习目标**：学完本章，你将能够——
1. 理解 sensor 与 schedule 的差异，以及为什么两者会共存；
2. 说出 partition 的几种典型策略，以及它为什么能支撑增量处理；
3. 理解 backfill 存在的两个典型原因；
4. 判断你的资产应该按什么维度分区，什么时候需要 single-run backfill；
5. 为系统写一张 data-platform-workflow card。

## 1. sensor 在解决“事件发生了，该不该动”

sensor 的机制是「check for events at regular intervals and either perform an action or provide an explanation for why the action was skipped」。[28] 它靠 `@sensor` 装饰的评估函数工作：满足条件就用 `RunRequest` 发起一次运行，不满足就返回 `SkipReason` 解释为什么跳过。[28] 典型监听对象包括「a run completes in Dagster」「a job materializes a specific asset」「a file appears in an s3 bucket」「an external system is down」，典型动作包括「launching a run」「sending a Slack message」「inserting a row into a database」。[28]

为了避免同一个事件触发重复运行，sensor 用 `run_key` 去重：「Dagster will skip processing requests with previously used run keys, ensuring that duplicate runs won't be created」；面对持续事件流（比如目录里不断出现新文件），还可以用 cursor 记录“上次处理到哪”，避免每次重新扫描全部数据。[28]

## 2. sensor 与 schedule 为什么会共存

schedule 是按固定时间节奏触发（这更接近 Airflow 的调度心智），sensor 是持续轮询、按条件触发。两者不是互斥关系：一个资产平台里，日常按天更新的资产可以用 schedule，而“外部文件到达”“上游资产刚物化完成”这类事件驱动的场景更适合 sensor（其中 asset sensor 甚至可以读取上游物化的 partition key，直接触发匹配 partition 的下游任务）。[28]

## 3. partition 在解决“数据该按什么颗粒度追踪”

partition 的价值很直接：「partitioning is a powerful technique for managing large datasets, improving pipeline performance, and enabling incremental processing」。[29] Dagster 支持多种分区策略：[29]
- **按时间**：如 `DailyPartitionsDefinition`，一个资产按天切分，每次运行只处理一天的数据；
- **按静态类别**：如按地区（`us`/`eu`/`jp`）切分；
- **二维分区**：同时按“日期 × 地区”切分；
- **动态分区**：类别在运行时才确定，可以由 sensor 动态创建；
- **自定义日历**：比如排除节假日的交易日日历。

每个 partition 可以独立物化，下游资产按匹配的 partition 依赖上游，这就是“增量处理”的具体实现：不是每次都重算整张表，而是只算变化的那一小片。文档也给出了规模上限的提醒：单个资产的 partition 数量建议不超过 10 万，否则 UI 加载会变慢。[29]

## 4. backfill 在解决“历史数据/逻辑变化怎么补”

backfill 是「the process of running partitions for assets that either don't exist or updating existing records」。[30] 它的两个典型触发场景是：[30]
- **首次搭建 pipeline 时的历史数据**：资产上线前就存在的历史数据需要被补算；
- **逻辑变更后的历史重算**：修改了资产的计算逻辑后，历史 partition 相对新逻辑已经“过期”，需要重新物化。

默认情况下，backfill 会给每个 partition 单独发起一次 run（N 个 partition 就是 N 次 run）；如果你在用 Spark、Snowflake 这类自带并行能力的外部引擎，重复发起大量小 run 反而低效，这时可以用 `backfill_policy` 配置成 single-run backfill——一次 run 处理整段 partition 区间，Dagster 仍然会在这次 run 完成后正确记录所有 partition 都已被填补。[30]

## 5. 三者合起来是什么

- sensor 回答“什么时候该重新生产这份资产”；
- partition 回答“这份资产应该按什么颗粒度被追踪和重算”；
- backfill 回答“历史数据或逻辑变化之后，怎么把缺口补齐”。

这三者组合起来，才是一个真正的数据平台工作流——不是“跑一次脚本”，而是一个持续运营、能对事件响应、能增量处理、能补历史缺口的系统。

## 6. 动手活动

> [!example] 动手活动：输出 `dagster-platform-workflow-card.md`
>
> 列你的资产里哪些该用 schedule、哪些该用 sensor 触发；哪些资产该按天/按类别/按二维分区；哪些场景需要 backfill，是否该用 single-run backfill。写一句结论：你现在的“增量处理”和“历史补数”逻辑，是分散在脚本里，还是已经收进 partition/backfill 这类正式语义。

## 7. 总结

| 关键问题 | 一句话 |
|---|---|
| sensor 在解决什么 | 让流程对事件（而非固定时间）做出响应 |
| partition 在解决什么 | 把资产按颗粒度切分，支撑增量处理 |
| backfill 在解决什么 | 补历史数据缺口，或用新逻辑重算历史 partition |
| 三者合起来是什么 | 一个可持续运营、可增量处理、可补历史的数据平台工作流 |

## 引用

- [28] https://docs.dagster.io/guides/automate/sensors — Dagster sensors guide
- [29] https://docs.dagster.io/guides/build/partitions-and-backfills/partitioning-assets — Dagster partitioning assets guide
- [30] https://docs.dagster.io/guides/build/partitions-and-backfills/backfilling-data — Dagster backfilling data guide

上一篇：[02 assets、jobs、ops、resources 与 lineage](/iopanda-blog/ai/03-frameworks/06/25/)

下一篇：[04 资产治理、可观测性与工程边界](/iopanda-blog/ai/03-frameworks/06/27/)
