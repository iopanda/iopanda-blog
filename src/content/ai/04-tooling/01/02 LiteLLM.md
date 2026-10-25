---
title: "LiteLLM"
number: "04.01.02"
chapter: 4
chapterTitle: "Tooling"
section: 1
sectionTitle: "Model Gateways and Routing"
group: "01 LiteLLM"
created: 2026-09-03 18:29
author: "iopanda"
tags: ["course", "ai-tooling", "model-gateways-and-routing", "litellm"]
sourceId: "3.10.4.1 Model Gateways and Routing/01 LiteLLM/README"
---
# LiteLLM

> 模块定位：从「统一多供应商 LLM API 的轻量代理与 SDK」这条路线理解 Model Gateways and Routing。现在这一目录已经按章节拆开，阅读时不必一次吞完整篇总稿，而可以沿着“定位 → 能力 → 质量 → 竞品 → 案例”的顺序进入。

**本目录建议阅读顺序**：

1. [01 产品定位、能力地图与适用场景](/iopanda-blog/ai/04-tooling/01/03/)
2. [02 Proxy、Virtual Keys、Budget 与 Routing](/iopanda-blog/ai/04-tooling/01/04/)
3. [03 质量、社区、价格与商业化成熟度](/iopanda-blog/ai/04-tooling/01/05/)
4. [04 与 Envoy AI Gateway、APISIX、LocalAI 的竞品对比](/iopanda-blog/ai/04-tooling/01/06/)
5. [05 生态集成案例：OpenHands、OpenAI Agents SDK、Google ADK、Aider、CrewAI](/iopanda-blog/ai/04-tooling/01/07/)

## 这一产品为什么值得单开

- LiteLLM 很适合作为 `04.01` 的第一篇产品，因为它代表了最典型的 AI-native gateway 路线；
- 它既能让开发者快速统一模型接口，也能往组织级治理延展；
- 对产品经理来说，它非常适合训练“能力、场景、采购、竞品、案例”这套完整分析框架。

## 本目录会回答什么问题

| 问题 | 对应章节 |
|---|---|
| LiteLLM 到底是什么，适合谁 | 01 |
| 它的核心能力为什么有产品价值 | 02 |
| 它是否成熟、价格是否友好 | 03 |
| 它和竞品相比到底差在哪 | 04 |
| 真实用户为什么会接它 | 05 |

## 建议阅读方法

- 如果你是第一次看：从 01 → 05 顺序读；
- 如果你在做选型：优先看 03 和 04；
- 如果你在写方案或做汇报：优先看 02、04、05；
- 如果你想做课程化拆分：这 5 篇已经可以作为独立小节继续扩展。

## 本目录笔记导航

1. [01 产品定位、能力地图与适用场景](/iopanda-blog/ai/04-tooling/01/03/)
2. [02 Proxy、Virtual Keys、Budget 与 Routing](/iopanda-blog/ai/04-tooling/01/04/)
3. [03 质量、社区、价格与商业化成熟度](/iopanda-blog/ai/04-tooling/01/05/)
4. [04 与 Envoy AI Gateway、APISIX、LocalAI 的竞品对比](/iopanda-blog/ai/04-tooling/01/06/)
5. [05 生态集成案例：OpenHands、OpenAI Agents SDK、Google ADK、Aider、CrewAI](/iopanda-blog/ai/04-tooling/01/07/)

## 引用

- [1] https://raw.githubusercontent.com/BerriAI/litellm/main/README.md — LiteLLM README
- [2] https://api.github.com/repos/BerriAI/litellm — LiteLLM GitHub API
- [3] https://www.litellm.ai/enterprise — LiteLLM Enterprise

上一篇：[04.01 Model Gateways and Routing](/iopanda-blog/ai/04-tooling/01/01/)——先有这一组工具的地图，再进入第一个最典型的 AI-native gateway 产品。

下一篇：[01 产品定位、能力地图与适用场景](/iopanda-blog/ai/04-tooling/01/03/)——先从定位、能力地图和适用边界开始。
