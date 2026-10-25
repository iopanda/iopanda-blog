---
title: "Workflow Framework 选型方法论"
number: "03.06.38"
chapter: 3
chapterTitle: "Frameworks"
section: 6
sectionTitle: "Workflow Orchestration Frameworks"
group: "3.10.3.6.6 Workflow Framework 选型矩阵"
created: 2026-09-09 12:00
author: "iopanda"
tags: ["framework", "workflow", "orchestration", "selection", "methodology"]
sourceId: "3.10.3.6 Workflow Orchestration Frameworks/3.10.3.6.6 Workflow Framework 选型矩阵/01 Workflow Framework 选型方法论"
---
# Workflow Framework 选型方法论

> 前五个子目录已经分别讲清楚了 [Temporal](/iopanda-blog/ai/03-frameworks/06/02/)、[Airflow](/iopanda-blog/ai/03-frameworks/06/09/)、[Prefect](/iopanda-blog/ai/03-frameworks/06/16/)、[Dagster](/iopanda-blog/ai/03-frameworks/06/23/)、[Kestra](/iopanda-blog/ai/03-frameworks/06/30/) 各自的第一性问题。这一篇不再逐个介绍框架，而是把“怎么选”本身变成一套可复用的方法论：**先诊断你系统的主矛盾，再用排除法筛掉不对症的框架，而不是直接比较谁的 star 数更多、谁的生态更大。**

**学习目标**：学完本章，你将能够——
1. 用五个维度诊断一个 workflow 系统的主矛盾；
2. 理解“为什么不选某个框架”往往比“为什么选某个框架”更容易判断，也更可靠；
3. 避免两个常见误区：唯生态论、唯性能论；
4. 判断一个系统是否同时存在多个主矛盾，需不需要多框架组合；
5. 产出一份可复用的 workflow-framework-selection-card 模板。

## 1. 五个维度：诊断主矛盾的量尺

前五个子目录反复出现的差异，可以收敛成五个正交的维度：

1. **状态恢复（state recovery）**：流程失败后，能不能、该不该按正式语义恢复？需不需要补偿、幂等、人工审批这类跨时间的状态语义？
2. **调度模型（scheduling model）**：流程主要是按时间节奏跑（batch/cron），还是按事件触发，还是两者都要？
3. **lineage（血缘与治理）**：你关心的核心对象是“任务跑得怎么样”，还是“这份数据资产现在新不新鲜、依赖了谁、谁负责”？
4. **事件触发（event orchestration）**：系统需要对外部世界（文件到达、消息队列、webhook、人工决定）做出低延迟反应吗？
5. **开发者体验（developer experience）**：团队现在的起点是“一堆已有脚本想升级”，还是“需要工程师和业务方共同维护”，还是“愿意先投入建模成本换治理能力”？

## 2. 方法论核心：先诊断主矛盾，再排除，不要直接选“最强”

选型最容易踩的坑，是拿一张“功能对比表”去找“功能最全”的框架——但五个框架都不是彼此的弱化版，而是在五个维度上做了完全不同的取舍。正确的顺序是：

1. **先问“我的系统现在卡在哪个维度”**：是状态恢复、调度、血缘、事件响应，还是开发者体验？
2. **再问“这个维度是不是真的是主矛盾，还是我把它想得比实际更重要”**：比如很多“需要重试”的需求，本质上并不需要 Temporal 级别的状态恢复语义，[Prefect](/iopanda-blog/ai/03-frameworks/06/16/) 的 retries/backoff 就足够。
3. **用排除法砍掉明显不对症的框架**：如果主矛盾是数据资产的血缘治理，[Temporal](/iopanda-blog/ai/03-frameworks/06/02/) 和 [Kestra](/iopanda-blog/ai/03-frameworks/06/30/) 基本可以先排除，不用再逐条比较它们的功能列表。
4. **剩下 1-2 个候选后，再看工程边界和团队现状**：团队规模、现有技术栈、运维能力、是否需要非工程角色参与。

## 3. 两个常见误区

- **唯生态论**：“这个框架 star 最多/公司最大，肯定错不了。” 生态成熟度是加分项，但不能替代“主矛盾诊断”——一个生态很成熟但方向不对的框架，用起来会持续别扭（比如用 Airflow 硬撑一个需要长时间等人工审批的业务流程）。
- **唯性能论**：“哪个框架吞吐量/延迟数据最好看，就用哪个。” 五个框架的性能特征本来就是为不同问题优化的，脱离场景比较性能没有意义。

## 4. 系统可能同时有多个主矛盾，这不是失败，是正常状态

现实系统往往不是单一主矛盾，而是不同子系统卡在不同维度——这时候答案通常不是“选一个框架通吃”，而是“按子系统边界组合使用”。这一点会在第 03、04 篇的场景对比和课程助教选型卡里具体展开。

## 5. 动手活动

> [!example] 动手活动：输出 `workflow-framework-selection-card.md`（第一版）
>
> 对你的系统（或子系统）逐个维度打分（高/中/低）：状态恢复需求、调度模型（batch/事件/混合）、lineage 治理需求、事件响应需求、开发者体验优先级。写一句结论：你的主矛盾集中在哪一个或哪两个维度。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| 选型方法论的核心 | 先诊断主矛盾，再用排除法筛选，而不是直接比“谁更强” |
| 五个诊断维度 | 状态恢复、调度模型、lineage、事件触发、开发者体验 |
| 两个常见误区 | 唯生态论、唯性能论 |
| 系统有多个主矛盾怎么办 | 按子系统边界组合使用，而不是强求一个框架通吃 |

## 引用

- [11] https://github.com/temporalio/temporal — Temporal GitHub
- [12] https://github.com/apache/airflow — Apache Airflow GitHub
- [13] https://github.com/PrefectHQ/prefect — Prefect GitHub
- [14] https://github.com/dagster-io/dagster — Dagster GitHub
- [15] https://github.com/kestra-io/kestra — Kestra GitHub

上一篇：[03.06 Workflow Framework 选型矩阵](/iopanda-blog/ai/03-frameworks/06/37/)

下一篇：[02 五个框架横向矩阵](/iopanda-blog/ai/03-frameworks/06/39/)
