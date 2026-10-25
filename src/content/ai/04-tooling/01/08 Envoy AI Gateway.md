---
title: "Envoy AI Gateway"
number: "04.01.08"
chapter: 4
chapterTitle: "Tooling"
section: 1
sectionTitle: "Model Gateways and Routing"
group: "02 Envoy AI Gateway"
created: 2026-09-03 18:52
author: "iopanda"
tags: ["course", "ai-tooling", "model-gateways-and-routing", "envoy-ai-gateway"]
sourceId: "3.10.4.1 Model Gateways and Routing/02 Envoy AI Gateway/README"
---
# Envoy AI Gateway

> 模块定位：从「基于 Envoy Gateway 的模型访问入口」这条路线理解 Model Gateways and Routing。和 LiteLLM 那种从 AI 应用接入问题长出来的 gateway 不同，Envoy AI Gateway 更像是把 GenAI 流量纳入云原生网关与平台工程体系的一种做法。[1][2]

**本目录建议阅读顺序**：

1. [01 产品定位、两层网关与适用场景](/iopanda-blog/ai/04-tooling/01/09/)
2. [02 AIGatewayRoute、AIServiceBackend 与流量治理](/iopanda-blog/ai/04-tooling/01/10/)
3. [03 质量、社区、价格与平台门槛](/iopanda-blog/ai/04-tooling/01/11/)
4. [04 与 LiteLLM、APISIX、LocalAI 的竞品对比](/iopanda-blog/ai/04-tooling/01/12/)
5. [05 公开平台实践：多 Provider、Fallback、限流、监控、Goose、MCP](/iopanda-blog/ai/04-tooling/01/13/)

## 这一产品为什么值得单开

- 它代表的是“平台网关世界进入 AI”的路线，而不是“AI SDK 进入网关”的路线；
- 它把控制面、数据面、Kubernetes CRD、策略治理、流量可观测这些平台能力直接带进 AI 接入层；
- 对产品经理来说，它非常适合用来理解：同样是 AI Gateway，为什么不同产品服务的对象完全不同。[2][3][4]

## 本目录会回答什么问题

| 问题 | 对应章节 |
|---|---|
| Envoy AI Gateway 到底是什么，适合谁 | 01 |
| 它的核心资源模型与流量治理怎么理解 | 02 |
| 它成熟吗，上线成本高吗 | 03 |
| 它和 LiteLLM / APISIX / LocalAI 有什么差别 | 04 |
| 它在公开实践里通常怎么被用 | 05 |

## 建议阅读方法

- 如果你在做平台选型：优先看 01、03、04；
- 如果你在写架构方案：优先看 02、04、05；
- 如果你只是想知道它和 LiteLLM 有何不同：直接看 04；
- 如果你想拿真实落地素材：先看 05。

## 本目录笔记导航

1. [01 产品定位、两层网关与适用场景](/iopanda-blog/ai/04-tooling/01/09/)
2. [02 AIGatewayRoute、AIServiceBackend 与流量治理](/iopanda-blog/ai/04-tooling/01/10/)
3. [03 质量、社区、价格与平台门槛](/iopanda-blog/ai/04-tooling/01/11/)
4. [04 与 LiteLLM、APISIX、LocalAI 的竞品对比](/iopanda-blog/ai/04-tooling/01/12/)
5. [05 公开平台实践：多 Provider、Fallback、限流、监控、Goose、MCP](/iopanda-blog/ai/04-tooling/01/13/)

## 引用

- [1] https://raw.githubusercontent.com/envoyproxy/ai-gateway/main/README.md — Envoy AI Gateway README
- [2] https://raw.githubusercontent.com/envoyproxy/ai-gateway/main/site/docs/index.md — Envoy AI Gateway Overview
- [3] https://raw.githubusercontent.com/envoyproxy/ai-gateway/main/site/docs/concepts/resources.md — Envoy AI Gateway Resources
- [4] https://api.github.com/repos/envoyproxy/ai-gateway — Envoy AI Gateway GitHub API

上一篇：[01 LiteLLM](/iopanda-blog/ai/04-tooling/01/02/)——上一产品代表 AI-native 的统一接入路线；这一篇切到平台网关路线。

下一篇：[01 产品定位、两层网关与适用场景](/iopanda-blog/ai/04-tooling/01/09/)——先从定位、两层网关架构与适用边界开始。
