---
title: "生态集成案例：OpenHands、OpenAI Agents SDK、Google ADK、Aider、CrewAI"
number: "04.01.07"
chapter: 4
chapterTitle: "Tooling"
section: 1
sectionTitle: "Model Gateways and Routing"
group: "01 LiteLLM"
created: 2026-09-03 19:10
author: "iopanda"
tags: ["course", "ai-tooling", "model-gateways-and-routing", "litellm", "case-studies"]
sourceId: "3.10.4.1 Model Gateways and Routing/01 LiteLLM/05 生态集成案例：OpenHands、OpenAI Agents SDK、Google ADK、Aider、CrewAI"
---
# 生态集成案例：OpenHands、OpenAI Agents SDK、Google ADK、Aider、CrewAI

> LiteLLM 真正的产品价值，不是在介绍页上，而是在别的产品为什么愿意把它接进来。下面这 5 个案例都可以在公开文档中验证到 LiteLLM 的存在和集成方式。它们共同说明：LiteLLM 在现实世界最常扮演的，不是“主产品”，而是“模型接入复杂度吸收器”。[1][2][3][4][5]

**学习目标**：学完本章，你将能够——

1. 从真实案例里识别 LiteLLM 的落点；
2. 分析不同产品为什么选择 LiteLLM；
3. 从背景、痛点、集成、成本收益、结果五个维度复盘案例；
4. 理解 LiteLLM 更像“平台能力层”而不是前台应用；
5. 把案例经验转译到自己的产品设计中。

> [!note] 说明
> 以下案例都基于公开文档可验证的集成说明来写；其中“成本/收益分析”是站在产品使用者角度做的现实推演，不是假装拿到了内部财务数据。

## 案例 1：OpenHands

**背景**
OpenHands 是面向编码 Agent 的开放平台，官方文档专门提供了 `LiteLLM Proxy` 页面。[1]

**痛点**
编码 Agent 对模型质量、延迟、区域和成本都很敏感。如果每个 provider 都由 OpenHands 自己单独深度适配，维护成本会迅速膨胀。

**集成方法**
OpenHands 官方给出的方式是：先部署 LiteLLM proxy；然后在 OpenHands 中把 `Custom Model` 设为 `litellm_proxy/<model-name>`，并配置 Base URL 与 API Key。文档还明确写到：OpenHands supports any model that your LiteLLM proxy is configured to handle。[1]

**成本收益分析**
- 成本：多一层 proxy，需要网关基本运维能力；
- 收益：模型支持范围由产品代码问题，转成网关配置问题；
- 产品意义：更容易做模型灰度、套餐差异、故障切换。

**结果**
LiteLLM 在这里扮演的是“统一模型入口”，让 OpenHands 可以把更多精力放在编码 Agent 能力，而不是 provider 适配矩阵。[1]

## 案例 2：OpenAI Agents SDK

**背景**
OpenAI Agents SDK 官方文档有单独的 `LiteLLM` 页面，把它作为模型/提供商相关适配路径的一部分。[2]

**痛点**
很多团队想使用 OpenAI Agents SDK 的 Agents、Tools、Handoffs、Sessions、Tracing 等上层体验，但不希望底层模型供应商被绑定死。

**集成方法**
官方文档把 LiteLLM 作为一个可用的 LiteLLM model / provider 入口呈现，本质上是：上层继续用 OpenAI Agents SDK，下层模型访问交给 LiteLLM。[2]

**成本收益分析**
- 成本：系统多一层网关，需要处理兼容性测试；
- 收益：Agent 框架和模型供应商选择被解耦；
- 产品意义：更适合做企业 Agent 平台的长期演进。

**结果**
这个案例说明 LiteLLM 的核心价值之一，是避免“框架选型 = 模型选型”。[2]

## 案例 3：Google ADK

**背景**
Google ADK 的模型文档明确写到，对于 Google 生态外的模型，或需特殊 client config 的模型，可以通过像 `LiteLlm` 这样的 wrapper class 接入。[3]

**痛点**
团队可能认可 ADK 的 Agent 开发体验，但业务上不可能只用 Google 自家模型。

**集成方法**
ADK 提供 `LiteLlm` wrapper，把它作为 `model` 注入 Agent 配置，用于 broader compatibility。[3]

**成本收益分析**
- 成本：多一层 wrapper，需要验证 wrapper 与上游行为；
- 收益：ADK 不必原生维护大量 provider 集成；
- 产品意义：平台路线与模型路线分离，迁移成本更低。

**结果**
LiteLLM 在这里承担的是“跨生态兼容层”的角色，而不是主框架本身。[3]

## 案例 4：Aider

**背景**
Aider 文档明确写道：Aider uses the `litellm` package to connect to hundreds of other models。[4]

**痛点**
AI 编程 CLI 很容易被用户对 provider 覆盖面的需求拖死；如果团队自己维护每个 provider，对主产品创新反而会形成拖累。

**集成方法**
Aider 直接把 LiteLLM 作为连接大量其他模型的底层包，并把用户进一步导向 LiteLLM provider docs。[4]

**成本收益分析**
- 成本：排障时要区分 CLI、LiteLLM、上游 provider 三层；
- 收益：大幅扩展模型覆盖面，减少主产品团队的适配负担；
- 产品意义：把生态复杂度外包给专门组件，让团队聚焦核心体验。

**结果**
LiteLLM 在这里不是“前台功能”，而是“生态放大器”。[4]

## 案例 5：CrewAI

**背景**
CrewAI 官方文档写得很直白：主流 provider 走 native SDK integrations，其他 provider uses LiteLLM as a flexible fallback。[5]

**痛点**
多 Agent / 工作流框架很难同时兼顾主流 provider 的深度体验和长尾 provider 的覆盖面。

**集成方法**
CrewAI 建议在非原生 provider 场景下使用 `crewai[litellm]`，并通过 LiteLLM Providers 文档支持更广范围模型。[5]

**成本收益分析**
- 成本：多一层依赖与兼容验证；
- 收益：既保留主流 provider 的原生体验，又扩展长尾生态；
- 产品意义：核心路径自研，长尾生态外包，是很成熟的产品策略。

**结果**
LiteLLM 在 CrewAI 里的角色，是一个“灵活后备层”和“生态扩展器”。[5]

## 6. 这 5 个案例共同说明了什么

它们看起来分属不同领域：编码 Agent、Agent SDK、Google Agent 框架、CLI、工作流框架。

但共同点非常一致：

1. 主产品都不想自己维护完整 provider 适配矩阵；
2. LiteLLM 都被放在“模型接入复杂度吸收层”；
3. 接入 LiteLLM 后，模型切换更接近配置问题，而不是产品重构问题；
4. LiteLLM 很少是用户最先看到的产品，但经常是后台最关键的杠杆之一。

## 7. 总结

| 案例 | LiteLLM 的角色 |
|---|---|
| OpenHands | 统一模型入口 |
| OpenAI Agents SDK | 模型供应商解耦层 |
| Google ADK | 跨生态兼容层 |
| Aider | 生态放大器 |
| CrewAI | 长尾 provider 后备层 |

**思考题**：为什么 LiteLLM 常常不是用户界面里最显眼的产品，却可能是平台演进里最关键的“幕后组件”？

> [!note] 参考答案
> 因为它解决的不是前台交互问题，而是后台可扩展性问题。用户未必直接看见它，但一旦没有它，模型切换、成本治理、provider 扩展、长尾兼容这些事情都会变得更慢、更贵、更难维护。

## 引用

- [1] https://docs.all-hands.dev/openhands/usage/llms/litellm-proxy — OpenHands LiteLLM Proxy
- [2] https://openai.github.io/openai-agents-python/models/litellm — OpenAI Agents SDK LiteLLM
- [3] https://google.github.io/adk-docs/agents/models — Google ADK models
- [4] https://aider.chat/docs/llms/other.html — Aider other LLMs
- [5] https://docs.crewai.com/learn/llm-connections — CrewAI LLM connections

上一篇：[04 与 Envoy AI Gateway、APISIX、LocalAI 的竞品对比](/iopanda-blog/ai/04-tooling/01/06/)——知道它和谁不一样之后，再看真实用户为什么会接它。

下一篇：[02 Envoy AI Gateway](/iopanda-blog/ai/04-tooling/01/08/)——LiteLLM 看完后，下一章切到另一条完全不同的产品路线。
