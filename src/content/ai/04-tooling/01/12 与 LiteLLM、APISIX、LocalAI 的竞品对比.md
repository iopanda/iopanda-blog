---
title: "与 LiteLLM、APISIX、LocalAI 的竞品对比"
number: "04.01.12"
chapter: 4
chapterTitle: "Tooling"
section: 1
sectionTitle: "Model Gateways and Routing"
group: "02 Envoy AI Gateway"
created: 2026-09-03 18:52
author: "iopanda"
tags: ["course", "ai-tooling", "model-gateways-and-routing", "envoy-ai-gateway", "competitive-analysis"]
sourceId: "3.10.4.1 Model Gateways and Routing/02 Envoy AI Gateway/04 与 LiteLLM、APISIX、LocalAI 的竞品对比"
---
# 与 LiteLLM、APISIX、LocalAI 的竞品对比

> Envoy AI Gateway 真正要比较的，不是“谁功能更多”，而是“谁默认站在哪个组织视角解决问题”。同样都能出现在 AI 接入架构图里，LiteLLM、Envoy AI Gateway、Apache APISIX、LocalAI 其实代表了四种不同思路：AI-native 接入层、平台网关扩展层、API-native 网关层、本地推理运行层。[1][2][3][4]

**学习目标**：学完本章，你将能够——

1. 把 Envoy AI Gateway 放进更准确的竞品版图；
2. 用产品出发点比较而不是用功能表比较；
3. 区分它与 LiteLLM、APISIX、LocalAI 的边界；
4. 根据组织现状判断哪条路线更顺；
5. 避免因为“都叫 gateway”而误判产品定位。

## 1. 总览对比

| 维度 | Envoy AI Gateway | LiteLLM | Apache APISIX | LocalAI |
|---|---|---|---|---|
| 产品出发点 | 把 GenAI 流量纳入 Envoy Gateway 体系 [1] | AI-native 模型统一入口 [2] | Cloud-Native API Gateway 向 AI Gateway 延展 [3] | 本地自托管 AI 引擎 [4] |
| 第一主角 | gateway policy + control/data plane | provider abstraction + unified API | API 治理 + 插件化流量控制 | 模型运行与统一本地 API |
| 主要服务对象 | 平台团队、K8s 团队、企业 AI 平台 | AI 应用团队、平台初创团队 | 已有 API Gateway 传统的大组织 | 私有化 / 本地推理团队 |
| 最自然的环境 | Kubernetes + Envoy Gateway | 任意能部署 proxy 的环境 | 云原生 API 基础设施 | 本地机器 / 私有服务器 |
| 强项 | 两层网关、控制面/数据面、平台一致性 [1][5] | 快速统一多 provider、预算/回退/虚拟密钥 | 把 AI 并入既有 API 网关治理 | 让模型在自己环境里跑起来 |
| 主要短板 | 学习曲线与平台门槛高 | 更偏 AI 接入层，平台治理深度依组织而定 | AI-native 体验不如前两者直接 | 不擅长多 provider 平台治理 |

## 2. Envoy AI Gateway vs LiteLLM

这是最值得比较的一组。

### 2.1 相同点

- 都想统一 AI 请求入口；
- 都支持多 provider / 多后端语境；
- 都关注路由、故障处理和治理能力。

### 2.2 最大差别

- LiteLLM 是从“AI 应用如何快速统一模型接入”长出来的；
- Envoy AI Gateway 是从“组织网关体系如何吸收 AI 流量”长出来的。[1][2]

所以：

- LiteLLM 更像 AI 团队先跑起来的路线；
- Envoy AI Gateway 更像平台团队把 AI 收编进现有基础设施的路线。

### 2.3 什么时候选谁

| 场景 | 更适合 |
|---|---|
| 快速统一十几家 SaaS 模型接口 | LiteLLM |
| 已有 Envoy / Gateway API / K8s 平台体系 | Envoy AI Gateway |
| 强调组织入口分层和自托管集群治理 | Envoy AI Gateway |
| 强调 OpenAI-compatible 生态兼容和接入速度 | LiteLLM |

## 3. Envoy AI Gateway vs Apache APISIX

这一组更像“平台路线内部比较”。

- APISIX 的起点是成熟的 cloud-native API Gateway，并明确把自己延展到 AI Gateway。[3]
- Envoy AI Gateway 则更垂直地建立在 Envoy Gateway 之上，围绕 GenAI traffic 明确建模资源和能力。[1][5]

可以粗略理解为：

- APISIX：先有 API 网关，再给 AI 腾位置；
- Envoy AI Gateway：直接把 AI 视为要专门建模的流量类型。

如果组织已经深度采用 APISIX，增量路线可能更顺；如果组织深度在 Envoy / Gateway API 世界里，Envoy AI Gateway 更自然。

## 4. Envoy AI Gateway vs LocalAI

严格说，这不是同层竞品，而更像相邻层。

- LocalAI 解决的是“模型怎么在本地或私有环境跑起来”；[4]
- Envoy AI Gateway 解决的是“模型请求如何被平台级入口治理”。[1]

它们甚至可以组合：

- LocalAI 作为后端模型服务；
- Envoy AI Gateway 作为入口治理与路由层。

所以如果团队真正的问题是 GPU、模型运行、私有推理性能，应该先看 LocalAI；如果问题是多集群、多入口、安全、策略与流量治理，应该先看 Envoy AI Gateway。

## 5. Envoy AI Gateway 的真实竞争优势

它最强的不是“有 AI 功能”，而是：

1. 把 AI 流量纳入现有网关语义；
2. 有控制面/数据面拆分；
3. 有清晰的资源模型；
4. 对自托管模型集群是第一等公民；
5. 天然适合平台团队分工与治理。[1][5]

## 6. 谁不该选它

以下情况通常不该优先选 Envoy AI Gateway：

- 团队没有 K8s / Envoy / Gateway API 基础；
- 只是想快速统一几个 SaaS provider；
- 需求主要是本地模型运行，而不是入口治理；
- 项目仍在验证产品价值，尚未到平台化阶段。

## 7. 总结

| 关键问题 | 一句话 |
|---|---|
| 和 LiteLLM 的差别 | 一个从 AI 应用问题长成 gateway，一个从平台 gateway 世界吸收 AI |
| 和 APISIX 的差别 | 一个更 Envoy/Gateway API 原生，一个更 API 网关传统原生 |
| 和 LocalAI 的差别 | 一个管入口和流量，一个管模型运行 |
| Envoy AI Gateway 的优势 | 平台一致性、分层治理、自托管模型入口控制 |

**思考题**：为什么“我们已经有很强的平台团队”并不自动意味着应该选 Envoy AI Gateway？

> [!note] 参考答案
> 因为平台能力强不等于当前问题就在平台层。如果团队最紧迫的痛点是快速接多 provider、快速试模型、快速给应用团队统一接口，LiteLLM 可能更快见效。是否选 Envoy AI Gateway，要看当前最贵的复杂度是在“接入速度”还是“平台治理”。

## 引用

- [1] https://raw.githubusercontent.com/envoyproxy/ai-gateway/main/README.md — Envoy AI Gateway README
- [2] https://raw.githubusercontent.com/BerriAI/litellm/main/README.md — LiteLLM README
- [3] https://github.com/apache/apisix — Apache APISIX GitHub
- [4] https://github.com/mudler/LocalAI — LocalAI GitHub
- [5] https://raw.githubusercontent.com/envoyproxy/ai-gateway/main/site/docs/concepts/resources.md — Envoy AI Gateway Resources

上一篇：[03 质量、社区、价格与平台门槛](/ai/04-tooling/01/11/)——看完成熟度，再把它放回竞品版图里。

下一篇：[05 公开平台实践：多 Provider、Fallback、限流、监控、Goose、MCP](/ai/04-tooling/01/13/)——最后从公开平台实践看它通常如何被使用。
