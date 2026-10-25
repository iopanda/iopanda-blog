---
title: "课程助教系统的 workflow 选型卡"
number: "03.06.41"
chapter: 3
chapterTitle: "Frameworks"
section: 6
sectionTitle: "Workflow Orchestration Frameworks"
group: "3.10.3.6.6 Workflow Framework 选型矩阵"
created: 2026-09-09 12:15
author: "iopanda"
tags: ["framework", "workflow", "orchestration", "selection", "case-study"]
sourceId: "3.10.3.6 Workflow Orchestration Frameworks/3.10.3.6.6 Workflow Framework 选型矩阵/04 课程助教系统的 workflow 选型卡"
---
# 课程助教系统的 workflow 选型卡

> 前三篇分别给了方法论、矩阵、场景速查表。这一篇把它们收口成一份完整的选型卡，对象就是这一整章反复用来做案例的课程助教系统。目标不是“选出唯一的框架”，而是示范一种更现实的结论：**一个真实系统往往需要按子系统边界组合多个 workflow framework，选型卡的价值在于把每个子系统的判断依据和边界写清楚，而不是强求统一。**

**学习目标**：学完本章，你将能够——
1. 把课程助教系统拆成五个子系统，分别对应五个框架的主场；
2. 说出每个子系统选择对应框架的判断依据，以及“为什么不选别的”；
3. 理解子系统之间怎么交接（谁触发谁、谁产出谁消费）；
4. 判断这份选型卡在什么情况下需要重新评估；
5. 把这份卡当作模板，套用到自己的系统上。

## 1. 课程助教系统的五个子系统

按照第 03 篇的四类场景，把课程助教拆成五个子系统（AI automation 场景本身又分两类）：

| 子系统 | 核心问题 | 框架 |
|---|---|---|
| 内容审核与发布审批 | 生成的课程内容/答疑反馈要经过教师审批才能发布，涉及跨天等待和人工决定 | [Temporal](/ai/03-frameworks/06/02/) |
| 知识库/评估离线管线 | 定时更新知识库、跑离线评估、聚合问答日志、生成周报 | [Airflow](/ai/03-frameworks/06/09/) |
| 检索/生成/批改脚本 | 检索课程知识、调用生成模型、批改反馈、发信这些 Python 脚本本身的可靠性 | [Prefect](/ai/03-frameworks/06/16/) |
| 知识资产治理 | 知识库表、切片、向量索引、评估集的血缘、新鲜度、责任人 | [Dagster](/ai/03-frameworks/06/23/) |
| 跨团队自动化与集成 | 学生答疑 webhook、教师/运营通知、跨系统集成、非工程角色调整流程 | [Kestra](/ai/03-frameworks/06/30/) |

## 2. 每个子系统的判断依据（为什么选它，为什么不选别的）

**内容审核与发布审批 → Temporal**：主矛盾是“流程要等人、等外部反馈，失败后不能简单重跑”。不选 Airflow，因为这不是稳定批处理；不选 Dagster，因为这里不是资产血缘问题；不选 Kestra，因为需要的是彻底的状态恢复语义，而不是轻量的 Pause/HumanTask。

**知识库/评估离线管线 → Airflow**：主矛盾是“大量定时批处理任务，需要 backfill 和统一运营视图”。不选 Temporal，因为这里的失败大多靠重跑这一步就能解决，不需要状态机恢复；不选 Prefect，因为这一层已经是稳定的批处理运营场景，Airflow 的成熟度更合适。

**检索/生成/批改脚本 → Prefect**：主矛盾是“已有 Python 脚本要用最小改动获得重试/并发/观测能力”。不选 Airflow，因为这一层还没到需要重调度平台的规模；不选 Kestra，因为团队本身就是工程师主导，不需要声明式多角色协作。

**知识资产治理 → Dagster**：主矛盾是“知识库、评估集、模型版本需要被追踪血缘和新鲜度”。不选任何其他四个框架，因为它们都不以资产血缘为设计中心。

**跨团队自动化与集成 → Kestra**：主矛盾是“既要定时又要事件触发，还需要非工程角色（教研/运营）参与调整”。不选 Prefect，因为这里需要跨语言、跨角色协作，而不是 Python 脚本升级；不选 Airflow，因为这里混合了大量事件驱动需求，不是纯批处理。

## 3. 子系统之间怎么交接

这五个子系统不是孤立的，交接关系大致是：

1. **Kestra** 的 webhook trigger 接住学生提问，触发一次答疑流程；
2. 答疑流程内部调用的检索/生成/批改逻辑，是 **Prefect** 包裹的 Python task；
3. 用到的知识库、向量索引这些数据资产，由 **Dagster** 负责定期物化和治理，Prefect task 只是读取者；
4. 如果生成的内容需要教师审批才能正式发布，交给 **Temporal** 驱动的审批流程，等教师确认后再回调通知学生；
5. 知识库更新、离线评估、周报生成这类稳定批处理，由 **Airflow** 定时调度，产出的报表可以被 **Kestra** 的 schedule trigger 拉去做通知分发。

这条交接链说明：五个框架不是互相竞争同一层，而是分别负责不同的层——事件入口层（Kestra）、脚本执行层（Prefect）、数据资产层（Dagster）、审批状态层（Temporal）、批处理运营层（Airflow）。

## 4. 什么情况下需要重新评估这份选型卡

- 如果“内容审核审批”从偶发变成高频、且审批规则变复杂（多级审批、超时升级），继续留在 Temporal 是对的，但要重新评估 workflow 设计本身；
- 如果“检索/生成/批改脚本”规模膨胀到需要复杂的批处理运维（大量历史 backfill、多团队共享调度平台），可能要重新评估是否该把这层也迁到 Airflow；
- 如果团队规模缩小、非工程角色不再参与流程调整，Kestra 带来的“多角色协作”价值会下降，这时可以评估是否要收敛掉一个框架，降低运维复杂度；
- 任何时候，重新评估都应该回到第 01 篇的方法论：先问主矛盾有没有变，而不是先看有没有新框架出现。

## 5. 动手活动

> [!example] 动手活动：完成 `workflow-framework-selection-card.md`（最终版）
>
> 参照第 1、2 节的表格和判断依据，把你自己的系统拆成子系统，为每个子系统写清楚：主矛盾是什么、选了哪个框架、为什么不选别的、和其他子系统怎么交接。这就是这一章要产出的最终 selection card。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| 课程助教需要几个框架 | 五个子系统对应五个框架，各自负责不同层 |
| 选型卡的核心价值 | 不是选出“唯一答案”，而是让每个判断依据可追溯、可复查 |
| 子系统怎么交接 | 事件入口层→脚本执行层→数据资产层→审批状态层→批处理运营层 |
| 什么时候要重新评估 | 主矛盾变了才重新评估，不是有新框架就重新评估 |

## 引用

- [11] https://github.com/temporalio/temporal — Temporal GitHub
- [12] https://github.com/apache/airflow — Apache Airflow GitHub
- [13] https://github.com/PrefectHQ/prefect — Prefect GitHub
- [14] https://github.com/dagster-io/dagster — Dagster GitHub
- [15] https://github.com/kestra-io/kestra — Kestra GitHub

上一篇：[03 典型业务场景对比](/ai/03-frameworks/06/40/)

下一篇：暂无——`03.06 Workflow Orchestration Frameworks` 模块至此完整收官（Temporal/Airflow/Prefect/Dagster/Kestra 五个框架 + 本选型矩阵均已完成）；`03 Frameworks` 的下一个子模块尚未规划。
