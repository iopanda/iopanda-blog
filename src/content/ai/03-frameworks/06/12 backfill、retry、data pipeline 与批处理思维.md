---
title: "backfill、retry、data pipeline 与批处理思维"
number: "03.06.12"
chapter: 3
chapterTitle: "Frameworks"
section: 6
sectionTitle: "Workflow Orchestration Frameworks"
group: "3.10.3.6.2 Apache Airflow"
created: 2026-09-04 10:44
author: "iopanda"
tags: ["framework", "workflow", "orchestration", "airflow", "backfill", "batch"]
sourceId: "3.10.3.6 Workflow Orchestration Frameworks/3.10.3.6.2 Apache Airflow/03 backfill、retry、data pipeline 与批处理思维"
---
# backfill、retry、data pipeline 与批处理思维

> Airflow 最有代表性的工程心智之一，不是“实时等待外部事件”，而是 batch run、schedule interval、backfill、idempotent tasks 和历史运行管理。[11] README 甚至直接把 Backfill 单独放在 UI 重要视图里，并强调任务应 ideally be idempotent、不要在 task 之间传大量数据。[11] 这说明 Airflow 的 workflow 语义，本质上是批处理和任务调度思维。

**学习目标**：学完本章，你将能够——
1. 理解为什么 backfill 是 Airflow 世界里的核心概念；
2. 说出 task idempotency 在 Airflow 里的重要性；
3. 理解为什么它适合 data/AI pipelines 而不是任意长时状态机；
4. 判断什么时候流程更像 batch pipeline；
5. 为系统写一张 batch-orchestration card。

## 1. backfill 为什么重要

Airflow 的工作流不是一次性的，而是按 schedule 重复发生。[11]
这就意味着你迟早会遇到：
- 某天没跑；
- 某段时间失败；
- 某次逻辑修复后要重算历史区间。

backfill 正是在解决“历史批次如何被补跑”。

## 2. idempotent task 为什么是关键纪律

README 很明确：tasks should ideally be idempotent。[11]
因为在批处理系统里：
- retry 会发生；
- backfill 会发生；
- rerun 会发生。

如果任务不是幂等的，数据重复写入和副作用重复执行就会立刻变成平台问题。

## 3. 为什么它不鼓励 task 之间传大数据

README 也明确指出，不应在 task 之间传大量数据，XCom 更适合传 metadata。[11]
这说明 Airflow 的编排理念是：
- 调度平台负责 orchestrate；
- 重数据处理交给外部系统；
- task 间主要传控制信息和引用，而不是大对象。

## 4. AI/数据流程为什么适合它

很多 AI data pipeline 本质上就是：
- 取数；
- 清洗；
- 评估；
- 训练；
- 导出；
- 定时重跑。

这类问题天然更像 Airflow 世界，而不一定更像 Temporal 世界。

## 5. 动手活动

> [!example] 动手活动：输出 `airflow-batch-card.md`
>
> 列你的流程是否有 schedule interval、历史补跑、重试、幂等需求、外部大数据处理。写一句结论：你的系统是 batch pipeline，还是 stateful workflow。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| backfill 在做什么 | 让历史批次可补跑 |
| 幂等性为什么关键 | 因为 retry/rerun/backfill 都会发生 |
| 为什么不该 task 间传大数据 | 编排层应传控制信息，重数据交给外部系统 |
| 最大价值 | 把批处理流程组织成可重复、可回放、可运营的系统 |

## 引用

- [11] https://github.com/apache/airflow/blob/main/README.md — Apache Airflow README

上一篇：[02 DAG、operator、scheduler 与 executor](/iopanda-blog/ai/03-frameworks/06/11/)

下一篇：[04 运营可视化、部署与工程边界](/iopanda-blog/ai/03-frameworks/06/13/)
