---
title: "Observability、Evaluations、Prompts 与 Datasets"
number: "04.02.04"
chapter: 4
chapterTitle: "Tooling"
section: 2
sectionTitle: "Observability and Evaluation"
group: "01 Langfuse"
created: 2026-09-03 19:43
author: "iopanda"
tags: ["course", "ai-tooling", "observability-and-evaluation", "langfuse", "capabilities"]
sourceId: "3.10.4.2 Observability and Evaluation/01 Langfuse/02 Observability、Evaluations、Prompts 与 Datasets"
---
# Observability、Evaluations、Prompts 与 Datasets

> Langfuse 最强的地方，不是它有很多功能，而是这些功能之间能互相喂数据。Observability 文档强调 tracing 是 foundation；Evaluation 文档强调 live traces、datasets、experiments、manual/automated evaluators 贯穿整个 workflow；README 又把 prompt management、datasets、playground 放进核心特性。[1][2][3][4][5] 这说明它的产品设计重点是闭环，而不是功能堆叠。

**学习目标**：学完本章，你将能够——

1. 看懂 Langfuse 的能力为什么形成闭环；
2. 区分 trace、evaluation、prompt、dataset、playground 各自解决的问题；
3. 理解 Langfuse 为什么比单点工具更适合团队协作；
4. 从产品使用者角度判断哪些能力最先能产生 ROI；
5. 避免把 Langfuse 用成“只是收日志”。

## 1. Observability：先把系统看见

Observability 文档明确说 tracing 是 LLM 应用里最重要的 observability tool，因为它能保留 prompts、responses、tool calls 和它们之间的关系。[2]

对产品团队来说，trace 的价值是：

- 知道请求经过了哪些步骤；
- 看到 token、latency、retrieval、tool use 等信息；
- 把“用户说它不好用”翻译成可调试的系统证据。

如果没有这一层，后面的 eval 和 prompt 优化都会变得很盲。

## 2. Evaluations：从“看见问题”走到“验证改进”

Evaluation 文档强调，Langfuse 的评测覆盖 live production traces 和 offline dataset runs，支持 manual notes、automated evaluators、LLM-as-a-judge、experiments 等方式。[3]

这很关键，因为很多团队会停在“看见了坏 trace”，但不知道：

- 哪类问题最常见；
- 新 prompt 是否真的更好；
- 某个模型切换到底值不值；
- 哪些坏样本应该拉成长期回归集。

Langfuse 的答案是：**不要让 trace 只停在排障层，而要让它流入评测层。**

## 3. Prompt Management：把 prompt 变成团队资产

README 和 Prompt Management 文档都明确把 prompt management 作为核心产品能力：集中管理、版本控制、协作迭代，并尽量不增加线上延迟。[1][4]

从 PM 角度看，这意味着：

- prompt 不再只是代码里的字符串；
- prompt 改动可以被版本化和协作管理；
- prompt 与 traces、playground、evaluations 可以互相联动。

这尤其适合多角色团队：产品、算法、工程、运营都可能对 prompt 有输入。

## 4. Datasets：把生产经验沉淀为测试资产

Datasets 文档强调，dataset 是一组 inputs 和 expected outputs，可用于测试应用，并可从真实 production traces 中创建测试集。[5]

这是 Langfuse 非常有价值的一点：

- 坏 case 不只看过就算；
- 好 case 也不只是截图留档；
- 线上数据可以逐步沉淀成离线实验和回归测试资产。

对产品使用者来说，这会显著降低“同一个坑反复踩”的概率。

## 5. Playground：缩短迭代回路

README 明确说，当你在 tracing 中看到 bad result，可以直接跳到 playground 迭代 prompt 和模型配置。[1]

这意味着 Langfuse 试图消灭一种非常常见的低效工作流：

- 在 trace 页面发现问题；
- 跳出系统去另一个地方手工试 prompt；
- 结果和原始 trace 上下文割裂。

Playground 的价值不是“能测试 prompt”，而是**把调参与证据保持在同一套工作台里。**

## 6. 为什么这套闭环对团队协作很重要

Langfuse 的工作流可以粗略理解为：

| 步骤 | 核心问题 |
|---|---|
| Trace | 发生了什么 |
| Evaluate | 好还是坏 |
| Dataset | 这些样本要不要长期记住 |
| Prompt | 我们应该改哪里 |
| Playground / Experiment | 改了以后有没有更好 |

这套闭环比单点工具更像一个团队协作系统，而不只是工程师调试台。

## 7. 哪些能力最先产生 ROI

通常顺序是：

1. 先上 tracing，立刻获得排障收益；
2. 再把坏样本沉淀为 dataset；
3. 再把 prompt 管理纳入团队工作流；
4. 最后把 evaluations 与 experiments 常态化。

也就是说，Langfuse 的价值可以分阶段释放，不一定要一开始全用满。

## 8. 总结

| 能力 | 它回答的问题 |
|---|---|
| Observability | 系统到底做了什么 [2] |
| Evaluations | 系统有没有变好 [3] |
| Prompt Management | prompt 如何成为协作资产 [1][4] |
| Datasets | 怎样把线上经验转成回归资产 [5] |
| Playground | 如何缩短修问题的反馈回路 [1] |

**思考题**：为什么很多团队明明已经有 traces，却仍然很难持续优化 AI 应用？

> [!note] 参考答案
> 因为 traces 只解决“看见问题”，不自动解决“怎么验证改进”。如果没有 dataset、prompt versioning、evaluation 和 experiment，团队会一直停留在经验式修修补补，而不是形成持续优化闭环。

## 引用

- [1] https://raw.githubusercontent.com/langfuse/langfuse/main/README.md — Langfuse README
- [2] https://langfuse.com/docs/observability/overview — Langfuse observability overview
- [3] https://langfuse.com/docs/evaluation/overview — Langfuse evaluation overview
- [4] https://langfuse.com/docs/prompt-management/get-started — Langfuse prompt management
- [5] https://langfuse.com/docs/evaluation/dataset-runs/datasets — Langfuse datasets

上一篇：[01 产品定位、能力地图与适用场景](/ai/04-tooling/02/03/)——先知道它是什么，再看它为什么形成工作流闭环。

下一篇：[03 质量、社区、价格与商业化边界](/ai/04-tooling/02/05/)——能力闭环立住以后，再看它够不够成熟、贵不贵、开源边界在哪。
