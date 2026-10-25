---
title: "与 LiteLLM、Envoy AI Gateway、LocalAI 的竞品对比"
number: "04.01.18"
chapter: 4
chapterTitle: "Tooling"
section: 1
sectionTitle: "Model Gateways and Routing"
group: "03 Apache APISIX"
created: 2026-09-03 19:02
author: "iopanda"
tags: ["course", "ai-tooling", "model-gateways-and-routing", "apache-apisix", "competitive-analysis"]
sourceId: "3.10.4.1 Model Gateways and Routing/03 Apache APISIX/04 与 LiteLLM、Envoy AI Gateway、LocalAI 的竞品对比"
---
# 与 LiteLLM、Envoy AI Gateway、LocalAI 的竞品对比

> APISIX 的竞品分析，如果只看功能，很容易得出“大家都能路由、限流、鉴权”的空结论。真正有区分度的，是它们分别从哪个世界长出来：LiteLLM 来自 AI-native 接入层，Envoy AI Gateway 来自 Envoy/Gateway API 平台路线，APISIX 来自成熟 API Gateway 世界，LocalAI 则来自本地推理运行时世界。[1][2][3][4]

**学习目标**：学完本章，你将能够——

1. 把 APISIX 放进更准确的竞品坐标系；
2. 理解它与 LiteLLM、Envoy、LocalAI 的边界；
3. 根据组织现状判断哪条路线更顺；
4. 避免把“都叫 gateway”误当成“都是同一类产品”；
5. 给出更可信的选型建议。

## 1. 总览对比

| 维度 | Apache APISIX | LiteLLM | Envoy AI Gateway | LocalAI |
|---|---|---|---|---|
| 产品出发点 | API Gateway 向 AI Gateway 延展 [1][2] | AI-native 模型统一入口 [3] | Envoy Gateway 承接 GenAI 流量 [4] | 本地自托管 AI 引擎 |
| 第一主角 | 插件化流量治理 | provider abstraction + unified API | control plane / data plane / gateway policy | 模型运行与本地 API |
| 主要服务对象 | 已有 API 平台传统的组织 | AI 应用团队、平台初创团队 | K8s / Envoy 平台团队 | 私有化、本地推理团队 |
| 强项 | API 与 AI traffic 合流、插件生态、成熟度 | 快速多 provider 接入 | 平台分层治理、自托管模型入口 | 本地模型运行 |
| 主要短板 | 对纯 AI 团队不够直给 | 平台深度较弱于重型网关体系 | 平台门槛高 | 不解决多 provider 平台治理 |

## 2. APISIX vs LiteLLM

这是一组“API-native”与“AI-native”的对比。

- LiteLLM 先解决的是 AI 应用团队怎样快速统一 provider；[3]
- APISIX 先解决的是组织怎样统一治理流量，再把 AI 纳入其中。[1][2]

所以：

- 如果你的核心痛点是“尽快统一十几家模型 API”，LiteLLM 更直接；
- 如果你的核心痛点是“API 和 AI 流量最好都走同一套治理体系”，APISIX 更自然。

一句话概括：LiteLLM 更像 AI 团队的加速器，APISIX 更像平台团队的延续线。

## 3. APISIX vs Envoy AI Gateway

这是一组“平台路线内部”的对比。

- Envoy AI Gateway 更强调 control plane / data plane、AIGatewayRoute、AIServiceBackend 这类 AI 专门资源建模；[4]
- APISIX 更强调插件系统与成熟 API Gateway 能力，把 AI 作为新流量类型吸收进去。[1][2]

粗略地说：

- Envoy AI Gateway：更像专门为 GenAI traffic 构一层平台入口；
- APISIX：更像让原有 API gateway 世界学会处理 AI。

如果组织已经在 Envoy / Gateway API 体系里，Envoy 路线更顺；如果组织原本就在 APISIX 或传统 API Gateway 体系里，APISIX 增量成本更低。

## 4. APISIX vs LocalAI

严格说这不是同层竞品，而是上下层。

- LocalAI 解决“模型怎么在本地或私有环境跑起来”；
- APISIX 解决“这些模型入口和 AI 流量怎么被统一治理”。

因此它们可以组合：

- LocalAI 暴露本地模型 API；
- APISIX 统一接住外部 provider 与本地模型的流量，并加上鉴权、限流、日志、审计。

## 5. APISIX 的真正竞争优势

APISIX 最强的地方，不是某一个 AI 功能特别新，而是：

1. 它本来就擅长治理流量；
2. 它有成熟插件生态；
3. 它可以同时管 API 与 AI；
4. 它的无厂商锁定叙事强；
5. 对已有平台传统的组织迁移成本低。[1][2]

## 6. 谁不该优先选它

以下情况通常不该先选 APISIX：

- 只想快速统一少量模型接入；
- 团队没有任何 API Gateway 运维经验；
- 主要目标是本地推理而不是统一入口治理；
- 项目还处在很早期的单应用试验阶段。

## 7. 总结

| 关键问题 | 一句话 |
|---|---|
| 和 LiteLLM 的差别 | 一个 AI-native，一个 API-native |
| 和 Envoy AI Gateway 的差别 | 一个更插件化传统网关，一个更显式 AI 平台建模 |
| 和 LocalAI 的差别 | 一个管入口治理，一个管模型运行 |
| APISIX 的优势 | 成熟网关能力可直接延展到 AI 流量 |

**思考题**：为什么“组织已经在用 APISIX”会极大改变 AI 网关选型结论？

> [!note] 参考答案
> 因为这意味着认证、限流、日志、插件开发、运维流程、组织认知和发布体系大概率已经存在。此时继续扩展 APISIX 承接 AI，通常比引入一套全新网关体系的组织阻力更小。

## 引用

- [1] https://raw.githubusercontent.com/apache/apisix/master/README.md — Apache APISIX README
- [2] https://apisix.apache.org/ai-gateway/ — APISIX AI Gateway landing page
- [3] https://raw.githubusercontent.com/BerriAI/litellm/main/README.md — LiteLLM README
- [4] https://raw.githubusercontent.com/envoyproxy/ai-gateway/main/README.md — Envoy AI Gateway README

上一篇：[03 质量、社区、价格与商业化边界](/ai/04-tooling/01/17/)——知道它够不够成熟之后，再看它和不同路线的差别。

下一篇：[05 公开实践与企业采用信号：AI Gateway、MCP、限流、RAG、提示安全](/ai/04-tooling/01/19/)——最后从公开实践与企业采用信号看它通常如何被使用。
