---
title: "asset-first orchestration 的设计哲学"
number: "03.06.24"
chapter: 3
chapterTitle: "Frameworks"
section: 6
sectionTitle: "Workflow Orchestration Frameworks"
group: "3.10.3.6.4 Dagster"
created: 2026-09-09 10:00
author: "iopanda"
tags: ["framework", "workflow", "orchestration", "dagster", "architecture"]
sourceId: "3.10.3.6 Workflow Orchestration Frameworks/3.10.3.6.4 Dagster/01 asset-first orchestration 的设计哲学"
---
# asset-first orchestration 的设计哲学

> Dagster README 把自己定位成「a cloud-native data pipeline orchestrator for the whole development lifecycle, with integrated lineage and observability, a declarative programming model, and best-in-class testability」，并强调它「designed for developing and maintaining data assets, such as tables, data sets, machine learning models, and reports」。[14] 这句话的关键不在“orchestrator”，而在 **data assets**：Dagster 的第一性问题不是“任务按什么顺序跑”，也不是“流程状态怎么恢复”，而是：**你声明你想要的数据资产（表、数据集、模型、报表），Dagster 负责在正确的时间把它们生产出来并保持最新。**

**学习目标**：学完本章，你将能够——
1. 解释为什么 Dagster 首先像 asset orchestration platform，而不是任务调度器或状态引擎；
2. 理解它和 Temporal、Airflow、Prefect、Kestra 的主语差异；
3. 说出为什么“资产”而不是“任务”是核心设计对象；
4. 判断什么时候系统最自然进入 Dagster 路线；
5. 为一个数据/AI 平台写框架判断卡。

## 1. 概念：Dagster 解决的是“资产是什么，而不是任务怎么排”

README 的表述很直接：「you declare—as Python functions—the data assets that you want to build」，「Dagster then helps you run your functions at the right time and keep your assets up-to-date」。[14] 这意味着你写代码时首先回答的问题是“这个数据对象是什么、它依赖谁”，而不是“这一步任务放在依赖图的哪个位置”。

## 2. 为什么这条路线独立成立

很多团队用任务调度器（DAG、cron、queue）拼了很久之后，会发现真正难回答的问题不是“任务跑完了吗”，而是：
- 现在这张表、这份报表、这个模型，到底是不是最新的；
- 它依赖了哪些上游数据，上游变了会不会传染下来；
- 谁负责这份数据，它的字段结构是什么；
- 不同工具（dbt、Spark、Python 脚本）产出的数据资产要怎么被统一追踪。

这类问题的主语是“数据资产”本身，而不是“某次任务运行”。这是 Dagster 作为独立路线成立的原因。

## 3. 为什么 asset、AssetKey 和 code version 是核心设计对象

Dagster 把资产直接建模成一等对象：`@dg.asset` 装饰的函数「computes the contents of the asset, such as a database table or file」，一个资产定义由三部分组成——`AssetKey`（「a handle for referring to the asset」）、上游依赖、以及负责计算内容的函数。[25]

更关键的是 code version 机制：「Versions let you help Dagster track what assets haven't been re-materialized since their code has changed, and avoid performing redundant computation」。[25] 这说明 Dagster 关心的是**资产的新鲜度**（这份数据是否因为代码变了而过期），而不只是“上一次运行成功还是失败”。

## 4. 与其他路线的第一差异

| 框架 | 第一性问题 | Dagster 相比的定位 |
|---|---|---|
| [Temporal](/ai/03-frameworks/06/02/) | 如何让 stateful 流程跨失败恢复 | Dagster 更偏数据资产的血缘、新鲜度和治理，而不是业务流程状态恢复 |
| [Apache Airflow](/ai/03-frameworks/06/09/) | 如何调度 DAG 和 batch tasks | Dagster 更偏 asset-first，任务图是资产依赖关系的副产品，而不是主对象 |
| [Prefect](/ai/03-frameworks/06/16/) | 如何用 Python 更自然写 resilient flows | Dagster 更偏资产建模和数据目录，而不是脚本到生产的最短路径 |
| [Kestra](/ai/03-frameworks/06/30/) | 如何围绕 triggers/schedules/integrations 做自动化 | Dagster 更偏资产血缘与目录治理，而不是事件驱动自动化 |

## 5. 什么时候最自然进入 Dagster

- 数据/AI 平台里“资产是什么、依赖谁、新不新鲜”是核心问题；
- 需要跨工具（dbt、Spark、Python）统一追踪数据资产的血缘和所有权；
- 需要把数据质量检查、字段结构、责任人挂在数据对象本身，而不是挂在某次任务运行上；
- 团队愿意先花时间把数据模型声明清楚，换取长期的可治理性。

## 6. 动手活动

> [!example] 动手活动：输出 `dagster-fit.md`
>
> 列你的系统里有哪些“数据资产”（表、数据集、模型、报表），它们的血缘和新鲜度现在是不是可追踪的。写一句结论：你的主问题是“任务怎么调度/恢复”，还是“数据资产怎么被声明、追踪和治理”。

## 7. 总结

| 关键问题 | 一句话 |
|---|---|
| Dagster 首先是什么 | asset-first data orchestration platform |
| 它在解决什么 | 声明数据资产、追踪血缘与新鲜度、按需保持资产更新 |
| 为什么值钱 | 把“这份数据是不是最新的”变成一等公民问题 |
| 最适合什么 | 需要资产治理、血缘和数据目录的数据/AI 平台 |

## 引用

- [14] https://github.com/dagster-io/dagster — Dagster GitHub / README
- [25] https://docs.dagster.io/guides/build/assets/defining-assets — Dagster defining assets guide

上一篇：[03.06 Dagster](/ai/03-frameworks/06/23/)

下一篇：[02 assets、jobs、ops、resources 与 lineage](/ai/03-frameworks/06/25/)
