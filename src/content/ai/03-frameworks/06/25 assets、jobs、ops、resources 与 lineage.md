---
title: "assets、jobs、ops、resources 与 lineage"
number: "03.06.25"
chapter: 3
chapterTitle: "Frameworks"
section: 6
sectionTitle: "Workflow Orchestration Frameworks"
group: "3.10.3.6.4 Dagster"
created: 2026-09-09 10:02
author: "iopanda"
tags: ["framework", "workflow", "orchestration", "dagster", "assets", "lineage"]
sourceId: "3.10.3.6 Workflow Orchestration Frameworks/3.10.3.6.4 Dagster/02 assets、jobs、ops、resources 与 lineage"
---
# assets、jobs、ops、resources 与 lineage

> Dagster 的独特性，不在于“也有 op 和 job 这两个执行概念”，而在于它把 op/job 变成了资产的**实现细节**，把 asset 变成了用户真正打交道的对象。[25][26][27] 在 Dagster 里，你声明的是“这份数据从哪来、怎么算”，op 和 job 只是背后负责“怎么跑”的引擎。

**学习目标**：学完本章，你将能够——
1. 理解 asset、op、job、resource 四者的分层关系；
2. 说出为什么“资产是可寻址对象，函数只是生产它的机制”；
3. 理解 resource 如何把环境差异从业务逻辑里剥离出去；
4. 判断什么时候该直接用 op/job，而不是 asset API；
5. 为系统写一张 dagster-architecture card。

## 1. asset 是可寻址对象，函数只是生产它的机制

一个资产定义由 `AssetKey`、上游依赖、计算函数三部分构成。[25] 更细节的是 `@multi_asset` 的例子：函数名不是资产本身——「Note that `my_multi_asset` is the function name, not an asset itself. When you materialize either `asset_one` or `asset_two`, the `my_multi_asset` function is executed」。[25] `@graph_asset` 也是类似逻辑：把多个 op 串起来，只对外暴露一个资产，「This approach encapsulates a series of operations and exposes them as a single asset, allowing you to model complex pipelines while only exposing the final output」。[25]

这说明 Dagster 里“可被追踪、被目录化、被赋予血缘”的对象始终是 asset，而函数、op、graph 都只是实现细节。

## 2. op 是资产计算的引擎，job 是把 op 绑定到执行器的方式

文档说得很直接：「Ops are the core unit of computation in Dagster」，「The computational core of an asset definition is an op」。[26] 多个 op 可以组成 graph，再通过 job 绑定到执行器上单进程或分布式运行：「Collections of ops - called graphs - can be bound via jobs to an appropriate executor for single-process execution or distribution across a cluster」。[26]

也就是说，asset 是你在业务层面思考和交流的对象，op/job 是 Dagster 在执行层面真正调度的对象——两者不是竞争关系，而是分层关系。

## 3. 什么时候该直接用 op/job，而不是 asset API

Dagster 的官方建议很明确：「If you are just getting started with Dagster, we strongly recommend you use assets rather than ops to build your data pipelines」。[26] op/job 文档面向的是「Dagster users who need to manage existing ops, or who have complex use cases」——典型场景是维护既有的 op 编写的历史流水线，或者需要更细粒度的执行控制（op hooks、op retries、动态/嵌套 op 图），或者流程本身不是“生产一份数据资产”，而是一串带副作用的动作序列。[26]

## 4. resource 如何把“环境差异”从业务逻辑里剥离

resource 是「objects used by Dagster assets and ops that provide access to external systems, databases, or services」。[27] 它解决的核心问题是环境切换：「Plug in different implementations in different environments」——本地开发用轻量数据库，生产环境用 Snowflake/BigQuery，asset/op 的代码本身不用改，只是运行时注入的 resource 实现不同。[27] resource 还会「surfaced in the Dagster UI」，方便确认当前到底连的是哪个环境的哪个系统。[27]

## 5. 依赖关系本身就是最初的血缘

因为 asset 定义里天然包含“上游依赖”这一部分[25]，所以你在声明资产的那一刻，就已经在声明血缘图——不需要额外画一张依赖图去描述“谁产出了谁”。这一点会在下一篇（sensors/partitions）和第四篇（资产治理/可观测性）里进一步展开成更完整的字段级血缘和资产目录。

## 6. 动手活动

> [!example] 动手活动：输出 `dagster-architecture-card.md`
>
> 列你的系统里哪些是“应该被追踪的数据资产”，哪些只是内部计算步骤（更适合留在 op 层）。写一句结论：你的 resource 层是否已经把环境差异（本地/测试/生产）从业务代码里剥离出去，还是还散落在代码里的 if/else。

## 7. 总结

| 关键问题 | 一句话 |
|---|---|
| asset 在做什么 | 声明可寻址、可追踪的数据对象及其上游依赖 |
| op/job 在做什么 | 承接资产背后的实际计算与执行绑定 |
| 什么时候该用 op/job | 维护既有流水线，或需要更细粒度执行控制的复杂场景 |
| resource 在做什么 | 把外部系统的具体实现从业务逻辑中剥离，按环境切换 |

## 引用

- [25] https://docs.dagster.io/guides/build/assets/defining-assets — Dagster defining assets guide
- [26] https://docs.dagster.io/guides/build/ops — Dagster ops and jobs guide
- [27] https://docs.dagster.io/guides/build/external-resources — Dagster resources guide

上一篇：[01 asset-first orchestration 的设计哲学](/iopanda-blog/ai/03-frameworks/06/24/)

下一篇：[03 sensors、partitions、data platform workflows](/iopanda-blog/ai/03-frameworks/06/26/)
