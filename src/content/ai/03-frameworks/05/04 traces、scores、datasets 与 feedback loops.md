---
title: "traces、scores、datasets 与 feedback loops"
number: "03.05.04"
chapter: 3
chapterTitle: "Frameworks"
section: 5
sectionTitle: "Evaluation and Observability Frameworks"
group: "3.10.3.5.1 Langfuse"
created: 2026-09-04 06:52
author: "iopanda"
tags: ["framework", "evaluation", "observability", "langfuse", "traces", "datasets", "feedback"]
sourceId: "3.10.3.5 Evaluation and Observability Frameworks/3.10.3.5.1 Langfuse/02 traces、scores、datasets 与 feedback loops"
---
# traces、scores、datasets 与 feedback loops

> Langfuse README 里最关键的一组能力，其实不是单个功能，而是一条闭环：trace 进来，score 生成，dataset 形成，feedback 回流，再支撑下一轮 evaluation 和 prompt/model 调整。[25] score analytics、dataset actions、trace graph view 这些实现侧说明，它不是把这些对象随便摆在 UI 里，而是在认真把它们建成平台内的一组正式实体。[27][28][29]

**学习目标**：学完本章，你将能够——
1. 理解为什么 trace、score、dataset、feedback 应该一起看；
2. 说出 Langfuse 怎样把“坏结果”变成可复用 eval 资产；
3. 理解 trace graph、score analytics、dataset mutation 分别意味着什么；
4. 判断什么时候系统需要 feedback loop，而不是一次性打分；
5. 为系统写一张 quality-loop card。

## 1. trace 在这里不是日志，而是质量证据入口

Langfuse 把 traces 放在最中心，并且明确追踪 retrieval、embedding、agent actions 等应用逻辑。[25]
这意味着 trace 的作用不只是排错，而是：
- 回看系统具体行为；
- 找出失败样本；
- 把失败样本变成 dataset / eval 输入。

## 2. score 为什么重要

score analytics 架构说明，Langfuse 在认真对 score 做统计、比较、时间序列和可视化。[27]
这说明 score 不是一列附属字段，而是平台里真正的质量信号对象。

## 3. dataset 为什么重要

datasets 文档虽然很短，但规则很明确：必须通过专门 mutation 函数，名称校验和 upsert 语义被正式管理。[28]
这说明 dataset 在 Langfuse 里不是临时样本袋，而是正式测试资产。

## 4. feedback loop 的真正意义

当线上出现坏结果时，理想路径应该是：
- 从 trace 找到问题；
- 关联 score / 人工反馈；
- 沉淀为 dataset item；
- 进入后续 eval / regression。

这就是 Langfuse 平台路线最值钱的地方：把反馈变成结构化改进资产，而不是散落评论。

## 5. trace graph 为什么值得单拿出来看

trace graph 文档说明它是只读 agent graph renderer，能把 observation、step、hierarchy、happened-before 关系可视化。[29]
这说明 Langfuse 不满足于“看一串 spans”，而是在努力让复杂 agent traces 可理解。

## 6. 动手活动

> [!example] 动手活动：输出 `langfuse-quality-loop-card.md`
>
> 为你的系统写一条质量闭环：trace → score → feedback → dataset → eval。写一句结论：现在你的失败案例有没有真正回流成可复用资产。

## 7. 总结

| 关键问题 | 一句话 |
|---|---|
| trace 在做什么 | 成为质量问题的证据入口 |
| score 在做什么 | 把质量变成可比较信号 |
| dataset 在做什么 | 把问题样本沉淀成可复用测试资产 |
| feedback loop 在做什么 | 把线上坏结果转成持续改进闭环 |

## 引用

- [25] https://github.com/langfuse/langfuse/blob/main/README.md — Langfuse README
- [27] https://github.com/langfuse/langfuse/blob/main/web/src/features/score-analytics/README.md — Langfuse score analytics README
- [28] https://github.com/langfuse/langfuse/blob/main/web/src/features/datasets/server/actions/README.md — Langfuse datasets README
- [29] https://github.com/langfuse/langfuse/blob/main/web/src/features/trace-graph-view/README.md — Langfuse trace graph README

上一篇：[01 AI engineering observability 的设计哲学](/ai/03-frameworks/05/03/)

下一篇：[03 prompt management、experiments 与 product analytics](/ai/03-frameworks/05/05/)
