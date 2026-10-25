---
title: "Apache APISIX"
number: "04.01.14"
chapter: 4
chapterTitle: "Tooling"
section: 1
sectionTitle: "Model Gateways and Routing"
group: "03 Apache APISIX"
created: 2026-09-03 19:02
author: "iopanda"
tags: ["course", "ai-tooling", "model-gateways-and-routing", "apache-apisix"]
sourceId: "3.10.4.1 Model Gateways and Routing/03 Apache APISIX/README"
---
# Apache APISIX

> 模块定位：从「通用 API Gateway 向 AI Gateway 延展」这条路线理解 Model Gateways and Routing。和 LiteLLM 这种从 AI 接入问题长出来的产品不同，APISIX 的根更深地扎在传统 API 流量治理世界里：动态路由、插件热更新、鉴权、限流、可观测、灰度发布、本地与 Kubernetes 双栈部署，然后再把这些能力扩展到 AI 流量。[1][4]

**本目录建议阅读顺序**：

1. [01 产品定位、插件体系与适用场景](/iopanda-blog/ai/04-tooling/01/15/)
2. [02 AI Gateway 能力、插件化治理与运营视角](/iopanda-blog/ai/04-tooling/01/16/)
3. [03 质量、社区、价格与商业化边界](/iopanda-blog/ai/04-tooling/01/17/)
4. [04 与 LiteLLM、Envoy AI Gateway、LocalAI 的竞品对比](/iopanda-blog/ai/04-tooling/01/18/)
5. [05 公开实践与企业采用信号：AI Gateway、MCP、限流、RAG、提示安全](/iopanda-blog/ai/04-tooling/01/19/)

## 这一产品为什么值得单开

- APISIX 代表的是“API-native 网关如何吸收 AI 流量”这条路线；
- 它的核心竞争力不是只支持 LLM，而是把既有网关治理能力直接迁移到 AI 入口；
- 对产品经理来说，它很适合训练一种判断：当组织已经有 API 平台传统时，AI 不一定需要另起一套网关体系。[1][4]

## 本目录会回答什么问题

| 问题 | 对应章节 |
|---|---|
| APISIX 在 AI 时代到底是什么角色 | 01 |
| 它如何把插件、流量治理、AI 能力组合起来 | 02 |
| 它成熟吗，值不值得纳入平台 | 03 |
| 它和 LiteLLM / Envoy / LocalAI 差在哪 | 04 |
| 它在公开场景里通常怎样被使用 | 05 |

## 建议阅读方法

- 如果你来自 API 平台团队：先读 01、02、04；
- 如果你在做采购或选型：先读 03、04；
- 如果你更关心 AI 场景落地：先读 02、05；
- 如果你只想知道它和 LiteLLM 的差异：直接看 04。

## 本目录笔记导航

1. [01 产品定位、插件体系与适用场景](/iopanda-blog/ai/04-tooling/01/15/)
2. [02 AI Gateway 能力、插件化治理与运营视角](/iopanda-blog/ai/04-tooling/01/16/)
3. [03 质量、社区、价格与商业化边界](/iopanda-blog/ai/04-tooling/01/17/)
4. [04 与 LiteLLM、Envoy AI Gateway、LocalAI 的竞品对比](/iopanda-blog/ai/04-tooling/01/18/)
5. [05 公开实践与企业采用信号：AI Gateway、MCP、限流、RAG、提示安全](/iopanda-blog/ai/04-tooling/01/19/)

## 引用

- [1] https://raw.githubusercontent.com/apache/apisix/master/README.md — Apache APISIX README
- [2] https://api.github.com/repos/apache/apisix — Apache APISIX GitHub API
- [3] https://apisix.apache.org/ai-gateway/ — APISIX AI Gateway landing page
- [4] https://github.com/apache/apisix — Apache APISIX GitHub

上一篇：[02 Envoy AI Gateway](/iopanda-blog/ai/04-tooling/01/08/)——上一产品代表 Envoy/Gateway API 平台路线；这一篇切到 API-native 网关路线。

下一篇：[01 产品定位、插件体系与适用场景](/iopanda-blog/ai/04-tooling/01/15/)——先从产品定位、插件体系和适用边界开始。
