---
title: "DAG、operator、scheduler 与 executor"
number: "03.06.11"
chapter: 3
chapterTitle: "Frameworks"
section: 6
sectionTitle: "Workflow Orchestration Frameworks"
group: "3.10.3.6.2 Apache Airflow"
created: 2026-09-04 10:42
author: "iopanda"
tags: ["framework", "workflow", "orchestration", "airflow", "dag", "scheduler"]
sourceId: "3.10.3.6 Workflow Orchestration Frameworks/3.10.3.6.2 Apache Airflow/02 DAG、operator、scheduler 与 executor"
---
# DAG、operator、scheduler 与 executor

> Airflow 的核心不是某一个 operator，而是 DAG、task、scheduler、worker、executor 一起构成的调度系统。[11][12][13] 这意味着在 Airflow 里，workflow 首先不是“状态机”，而是“被计划、被触发、被执行、被监控的一组任务图”。

**学习目标**：学完本章，你将能够——
1. 理解 DAG、task、operator、scheduler、executor 在 Airflow 里的分工；
2. 说出为什么 code-defined DAG 会比脚本集合更适合长期维护；
3. 理解 scheduler 和 executor 为什么是平台核心；
4. 判断什么时候系统最需要的是调度平面而不是恢复语义；
5. 为系统写一张 airflow-architecture card。

## 1. DAG 在做什么

在 Airflow 里，DAG 首先是任务依赖图，而不是业务对象图。[11]
它回答的是：
- 哪些任务存在；
- 谁先谁后；
- 什么时间触发；
- 某一轮运行里哪些节点完成、失败、等待。

## 2. operator / task 为什么重要

Airflow 强调 author workflows as code，这意味着 task 本身是编排单位。[11]
operator 让你用统一框架组织：
- Python 任务；
- shell/外部命令；
- provider 集成任务；
- AI/ML/data tasks。

## 3. scheduler / executor 在做什么

README 明确说 scheduler 按依赖在 workers 上执行任务。[11]
这说明：
- scheduler 负责“什么时候轮到谁”；
- executor/worker 负责“任务去哪跑、怎么跑”；
- UI 负责“运行状态怎么被理解”。

## 4. task SDK 说明了什么

Task SDK README 强调它提供的是 dag authors 和 task execution logic 的接口。[13]
这说明 Airflow 的生态不只是调度器本身，也在试图标准化任务定义与执行面。

## 5. 动手活动

> [!example] 动手活动：输出 `airflow-architecture-card.md`
>
> 列你的流程里 DAG、tasks、schedule、workers、executor 分别是谁。写一句结论：你的系统主复杂度是任务图调度，还是跨时间状态恢复。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| DAG 在做什么 | 定义任务依赖图 |
| operator/task 在做什么 | 提供可复用的执行单元 |
| scheduler 在做什么 | 按依赖和时间推进工作流 |
| executor/worker 在做什么 | 承接具体执行 |

## 引用

- [11] https://github.com/apache/airflow/blob/main/README.md — Apache Airflow README
- [12] https://github.com/apache/airflow/blob/main/INSTALLING.md — Apache Airflow installing guide
- [13] https://github.com/apache/airflow/blob/main/task-sdk/README.md — Apache Airflow task SDK README

上一篇：[01 DAG scheduling platform 的设计哲学](/ai/03-frameworks/06/10/)

下一篇：[03 backfill、retry、data pipeline 与批处理思维](/ai/03-frameworks/06/12/)
