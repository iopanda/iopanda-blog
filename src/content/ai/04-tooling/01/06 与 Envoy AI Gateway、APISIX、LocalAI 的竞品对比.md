---
title: "与 Envoy AI Gateway、APISIX、LocalAI 的竞品对比"
number: "04.01.06"
chapter: 4
chapterTitle: "Tooling"
section: 1
sectionTitle: "Model Gateways and Routing"
group: "01 LiteLLM"
created: 2026-09-03 19:10
author: "iopanda"
tags: ["course", "ai-tooling", "model-gateways-and-routing", "litellm", "competitive-analysis"]
sourceId: "3.10.4.1 Model Gateways and Routing/01 LiteLLM/04 与 Envoy AI Gateway、APISIX、LocalAI 的竞品对比"
---
# 与 Envoy AI Gateway、APISIX、LocalAI 的竞品对比

> 单看 LiteLLM 很容易觉得它什么都能做；但真正做产品选型时，关键不是“它强不强”，而是“它和邻近方案相比，第一性问题到底有什么不同”。LiteLLM、Envoy AI Gateway、Apache APISIX、LocalAI 看起来都可能出现在同一张架构图里，但它们的出发点其实并不一样。[1][2][3][4]

**学习目标**：学完本章，你将能够——

1. 说清 LiteLLM 的直接竞品和邻近替代方案；
2. 用“产品出发点”而不是“功能清单”比较竞品；
3. 区分 AI-native gateway、通用 API gateway、推理引擎三条路线；
4. 判断你的组织更适合 LiteLLM，还是更适合现有网关体系；
5. 输出一份更可信的竞品对比结论。

## 1. 为什么不能只比功能

如果只比功能，你会发现大家都能说自己支持：

- 统一入口；
- 访问控制；
- 路由；
- 某种程度的 observability；
- 某种形式的部署能力。

但产品选型真正决定成败的，往往不是“有没有这个功能”，而是：

- 这个产品最先服务的是谁；
- 它默认假设组织已经具备什么能力；
- 它希望复杂度落在哪一层；
- 它对 AI 流量的理解是“特殊场景”还是“第一主角”。

## 2. 总览对比

| 维度 | LiteLLM | Envoy AI Gateway | Apache APISIX | LocalAI |
|---|---|---|---|---|
| 产品出发点 | AI-native 模型统一入口 [1] | 基于 Envoy Gateway 的生成式 AI 统一访问 [2] | 云原生 API Gateway 向 AI Gateway 延展 [3] | 本地自托管 AI 引擎 [4] |
| 第一主角 | provider abstraction + AI gateway | gateway policy + platform ingress | API 治理 + 插件化流量控制 | 本地模型运行与统一 API |
| 最适合谁 | AI 应用团队、平台初创团队 | 已有 Envoy / K8s / 平台工程体系的组织 | 已有成熟 API Gateway 传统的大组织 | 首要问题是本地推理/私有化的团队 |
| 上手体验 | 快 | 中 | 中 | 中 |
| 多 provider 统一体验 | 强 | 中 | 中 | 弱到中 |
| AI 语义化运营能力 | 强 | 中 | 中 | 弱 |
| 本地模型运行能力 | 间接支持 | 无 | 无 | 强 |
| 主要短板 | 版本快、产品面宽 | 平台门槛高 | AI-native 体验不够直接 | 不擅长多 provider 治理 |

## 3. LiteLLM vs Envoy AI Gateway

Envoy AI Gateway 的逻辑，是把生成式 AI 服务纳入 Envoy Gateway 这条基础设施路线。[2]

这意味着它天然更适合：

- 已经深度使用 Kubernetes；
- 已有 Gateway API / Envoy 的平台工程团队；
- 习惯用策略、网关规则和平台接口治理流量的组织。

LiteLLM 的起点则更直接：先把 AI 模型 provider 统一接起来，再把预算、密钥、回退、路由做进去。[1]

所以两者的差异不是“谁先进”，而是：

- Envoy AI Gateway 更像“平台基础设施延展到 AI”；
- LiteLLM 更像“AI 应用问题长成平台入口”。

如果你的组织平台能力很强，Envoy 路线会更顺；如果你的组织是从 AI 应用侧起步，LiteLLM 通常更容易先跑出价值。

## 4. LiteLLM vs Apache APISIX

APISIX 是成熟的 cloud-native API Gateway，并且明确把自己描述为 Cloud-Native API Gateway and AI Gateway。[3]

这带来一个很现实的选型分叉：

- 如果你把 AI 当作企业 API 版图的一部分，希望复用现有插件、认证、安全、路由和治理体系，APISIX 很有吸引力；
- 如果你更关心的是 100+ provider 的统一调用面、AI 语义更强的 budget / fallback / model routing，LiteLLM 会更直接。[1]

产品上可以这样理解：

- APISIX 是“先有网关，再扩 AI”；
- LiteLLM 是“先有 AI 接入问题，再长成网关”。

## 5. LiteLLM vs LocalAI

LocalAI 的定位和前两者都不同，它首先是 open-source AI engine，强调在本地或私有环境运行模型，并提供统一 API。[4]

因此它解决的是：

- 模型怎么在自己的硬件上跑起来；
- 如何避免完全依赖云端 provider；
- 如何做私有化部署和离线环境支持。

而 LiteLLM 解决的是：

- 怎么把很多模型入口统一起来；
- 怎么做多 provider 路由；
- 怎么做预算、虚拟密钥、回退和花费治理。[1]

所以 LiteLLM 和 LocalAI 更像上下层关系，而不是完全替代关系：

- LocalAI 负责“跑模型”；
- LiteLLM 负责“管访问”。

## 6. 产品经理该怎么选

| 你的主问题 | 更优先看的路线 |
|---|---|
| 想快速统一大量云端模型 provider | LiteLLM |
| 组织已经强依赖 Envoy / K8s / Gateway API | Envoy AI Gateway |
| 组织已有成熟 API 网关治理体系 | Apache APISIX |
| 首要诉求是本地私有推理与自托管 | LocalAI |
| 同时想统一本地与云端模型入口 | LocalAI + LiteLLM 组合 |

## 7. 结论：LiteLLM 的真正竞争优势是什么

LiteLLM 最强的地方，不是“它能做路由”，而是它把 AI 模型访问这件事做成了一个开发者友好、平台也能接得住的中间层产品。

它最适合的不是最重的平台团队，也不是最轻的单应用团队，而是这类组织：

- 已经有多个 AI 应用；
- 需要在多个模型间切换；
- 又还没有把 AI 流量完全纳入传统平台体系；
- 希望先快、再稳、再治理。

## 8. 总结

| 关键问题 | 一句话 |
|---|---|
| 和 Envoy AI Gateway 的差别 | 一个从 AI 问题长成网关，一个从网关体系延展到 AI |
| 和 APISIX 的差别 | 一个 AI-native，一个 API-native |
| 和 LocalAI 的差别 | 一个管访问，一个跑模型 |
| LiteLLM 的竞争优势 | 多 provider 统一接入 + AI 语义化治理能力 |

**思考题**：为什么“组织已经有成熟平台团队”并不自动意味着 LiteLLM 没价值？

> [!note] 参考答案
> 因为平台团队强，只说明你有能力把 AI 流量纳入更通用的基础设施；但如果 AI 应用增长很快、provider 多、业务团队需要立刻统一接入，LiteLLM 仍可能是最快形成业务价值的前置层。关键不是平台强不强，而是当前最急的复杂度在哪。

## 引用

- [1] https://raw.githubusercontent.com/BerriAI/litellm/main/README.md — LiteLLM README
- [2] https://github.com/envoyproxy/ai-gateway — Envoy AI Gateway GitHub
- [3] https://github.com/apache/apisix — Apache APISIX GitHub
- [4] https://github.com/mudler/LocalAI — LocalAI GitHub

上一篇：[03 质量、社区、价格与商业化成熟度](/iopanda-blog/ai/04-tooling/01/05/)——成熟度判断之后，再把 LiteLLM 放回竞品版图里。

下一篇：[05 生态集成案例：OpenHands、OpenAI Agents SDK、Google ADK、Aider、CrewAI](/iopanda-blog/ai/04-tooling/01/07/)——最后从生态集成案例看，用户为什么会选择它。
