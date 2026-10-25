---
title: "Model Gateways and Routing"
number: "04.01.01"
chapter: 4
chapterTitle: "Tooling"
section: 1
sectionTitle: "Model Gateways and Routing"
group: ""
created: 2026-09-03 18:29
author: "iopanda"
tags: ["course", "ai-tooling", "gateway-routing"]
sourceId: "3.10.4.1 Model Gateways and Routing/README"
---
# Model Gateways and Routing

> 在 `01 Models` 里，我们已经知道模型可以通过 API 或本地推理服务被调用；在 `02 Agents` 与 `03 Frameworks` 里，我们又把模型接进了工具、记忆、流程与框架。接下来 `04.01` 要回答的是更靠近平台层的问题：**当一个系统要同时面对多家模型供应商、多种鉴权方式、限流、配额、成本、回退与路由策略时，入口应该如何被统一管理？** 这一章不把 gateway 看成“多写一个代理层”，而是把它视为模型流量、策略与治理的第一道基础设施。

**学习目标**：完成本模块后，你将能够——

1. 说出为什么模型接入一旦跨团队、跨环境、跨供应商，就需要 gateway / proxy / routing 层；
2. 区分 LiteLLM、Envoy AI Gateway、Apache APISIX、LocalAI 各自代表的接入与治理路线；
3. 解释鉴权、配额、故障回退、模型别名、流量分发、OpenAI 兼容接口之间的关系；
4. 为课程助教或企业内部 AI 服务设计一张 model access topology 图；
5. 写出“什么时候该上 gateway，什么时候暂时不该上”的判断标准。

## 1. 为什么这一组工具要单独讲

- 最早期的 AI 应用常把 `model="xxx"` 写死在代码里，但一旦换模型、切环境、做配额，就会迅速失控；
- 真实系统的复杂度常常先死在接入层，而不是 prompt 层：秘钥散落、计费不可见、限流无处安放、回退逻辑重复造轮子；
- gateway 的价值不只是“转发请求”，而是把身份、路由、成本、可靠性、审计做成统一入口；
- 这一模块的学习重点不是背某个代理工具的 YAML，而是理解模型流量为什么需要像 API 流量一样被治理。

## 2. 2026-09 我建议先聚焦的开源产品

| 产品 | 一句话定位 | 设计中心 | 更适合谁 |
|---|---|---|---|
| [LiteLLM](/iopanda-blog/ai/04-tooling/01/02/) | 统一多供应商 LLM API 的轻量代理与 SDK | provider abstraction、成本与日志、fallback/load balancing | 想快速统一 OpenAI 兼容接口的应用团队 |
| [Envoy AI Gateway](/iopanda-blog/ai/04-tooling/01/08/) | 基于 Envoy Gateway 的模型访问入口 | gateway policy、流量治理、平台级接入 | 已经有 API gateway / platform engineering 体系的团队 |
| [Apache APISIX](/iopanda-blog/ai/04-tooling/01/14/) | 从通用 API Gateway 延展到 AI Gateway 的云原生路线 | 插件化、鉴权、限流、路由、可观测 | 需要把 AI 接入并入既有 API 治理系统的团队 |
| [LocalAI](/iopanda-blog/ai/04-tooling/01/20/) | 本地自托管、OpenAI 兼容的统一模型入口 | self-hosted endpoint、私有化、统一调用面 | 先解决私有化与本地开发一致性的团队 |

## 3. 这一模块建议怎么读

1. 先看 [01 LiteLLM](/iopanda-blog/ai/04-tooling/01/02/)：理解多供应商 API 统一入口为什么会成为第一需求；
2. 再看 [02 Envoy AI Gateway](/iopanda-blog/ai/04-tooling/01/08/)：理解平台团队如何把 AI 流量纳入 gateway 策略；
3. 然后看 [03 Apache APISIX](/iopanda-blog/ai/04-tooling/01/14/)：理解传统 API 治理与 AI 接入如何合流；
4. 最后看 [04 LocalAI](/iopanda-blog/ai/04-tooling/01/20/)：理解本地私有化入口如何改变接入与调试方式。

## 4. 我建议本模块的内容结构

这一模块可以复用你已经稳定下来的写法：

1. 本组总览 README；
2. 每个产品一个文件夹与 `README.md`；
3. 每个产品至少拆成 4~6 篇：
   - 它为什么存在 / 解决什么首要复杂度；
   - 核心抽象、架构与部署形态；
   - 与同类产品相比的设计中心；
   - 在课程助教或企业内部知识系统中的落点；
   - 适用边界、排错与迁移成本；
4. 最终再补一篇本组的选型矩阵：回答“为什么选 A，不选 B”。

## 5. 本模块的推荐交付物

| 交付物 | 说明 | 验收标准 |
|---|---|---|
| model-access-topology.md | 画出应用、gateway、供应商、本地模型、鉴权与配额关系图 | 能回答“请求从哪里进、怎么路由、在哪里限流与审计” |
| routing-policy-card.md | 写清模型别名、回退链、超时、限流与成本约束 | 能解释“为什么默认走 A，何时切到 B” |
| gateway-adoption-checklist.md | 判断项目是否已到需要 gateway 的阶段 | 能区分单应用直连与平台化接入的边界 |

## 6. 本模块笔记导航

1. [01 LiteLLM](/iopanda-blog/ai/04-tooling/01/02/)
2. [02 Envoy AI Gateway](/iopanda-blog/ai/04-tooling/01/08/)
3. [03 Apache APISIX](/iopanda-blog/ai/04-tooling/01/14/)
4. [04 LocalAI](/iopanda-blog/ai/04-tooling/01/20/)

## 7. 这一模块该怎么学，才不会学成“产品说明书”

- 不要先记安装命令，先问它把哪类复杂度当作一等公民；
- 不要只看 happy path，重点看治理、排错、迁移、协作与上线证据；
- 不要问“谁最强”，要问“谁最匹配当前系统的首要矛盾”；
- 不要把开源工具当成银弹，工具只是把某类工程纪律做成现成组件。

## 8. 总结

| 关键问题 | 一句话 |
|---|---|
| 这一模块讲什么 | 模型接入入口、路由策略与治理层 |
| 为什么重要 | 多模型系统最容易先在鉴权、限流、回退与成本上失控 |
| 代表产品 | LiteLLM / Envoy AI Gateway / Apache APISIX / LocalAI |
| 学习重点 | 理解模型流量治理，而不是背配置项 |

## 引用

- [101] https://github.com/BerriAI/litellm — LiteLLM GitHub
- [102] https://github.com/envoyproxy/ai-gateway — Envoy AI Gateway GitHub
- [103] https://github.com/apache/apisix — Apache APISIX GitHub
- [104] https://github.com/mudler/LocalAI — LocalAI GitHub

上一篇：[03.02 RAG and Retrieval Frameworks](/iopanda-blog/ai/03-frameworks/02/01/)——框架回答“系统怎么组织”；本章开始回答“模型流量怎么接入与治理”。

下一篇：[04.02 Observability and Evaluation](/iopanda-blog/ai/04-tooling/02/01/)——有了入口，还要有显微镜：请求走完以后，如何追踪、评测与复盘。
