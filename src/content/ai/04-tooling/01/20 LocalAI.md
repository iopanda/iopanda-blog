---
title: "LocalAI"
number: "04.01.20"
chapter: 4
chapterTitle: "Tooling"
section: 1
sectionTitle: "Model Gateways and Routing"
group: "04 LocalAI"
created: 2026-09-03 19:43
author: "iopanda"
tags: ["course", "ai-tooling", "model-gateways-and-routing", "localai"]
sourceId: "3.10.4.1 Model Gateways and Routing/04 LocalAI/README"
---
# LocalAI

> 模块定位：从「本地自托管、OpenAI 兼容的统一模型入口」这条路线理解 Model Gateways and Routing。和 LiteLLM、APISIX、Envoy AI Gateway 这类“先管入口流量”的产品不同，LocalAI 更像“先把模型真正跑在你的机器和你的基础设施里，再顺手把它们统一暴露成一个兼容 API”。[2][3]

**本目录建议阅读顺序**：

1. [01 产品定位、统一接口与适用场景](/ai/04-tooling/01/21/)
2. [02 多后端、多模态、分布式与代理能力](/ai/04-tooling/01/22/)
3. [03 质量、社区、价格与总拥有成本](/ai/04-tooling/01/23/)
4. [04 与 Ollama、vLLM、LiteLLM 的竞品对比](/ai/04-tooling/01/24/)
5. [05 生态集成与公开实践：OpenCode、Claude Code、GitHub Actions、Flowise、AnythingLLM、Home Assistant](/ai/04-tooling/01/25/)

## 这一产品为什么值得单开

- 它代表的是“本地/私有化模型运行 + 统一兼容接口”路线，而不是传统 gateway 路线；
- 它同时覆盖 LLM、vision、voice、image、video，多模态范围非常大；
- 它把 llama.cpp、vLLM、MLX、whisper.cpp 等后端包装成按需拉取的模块化 backend，比单一引擎更像产品平台。[2]

## 本目录会回答什么问题

| 问题 | 对应章节 |
|---|---|
| LocalAI 到底是什么，适合谁 | 01 |
| 它的多后端、多模态、分布式能力怎么理解 | 02 |
| 它成熟吗，贵不贵，隐性成本是什么 | 03 |
| 它和 Ollama / vLLM / LiteLLM 差在哪 | 04 |
| 真实用户通常把它接到哪里 | 05 |

## 建议阅读方法

- 如果你在做本地化/私有化选型：先读 01、03、04；
- 如果你关心工程能力边界：先读 02、04；
- 如果你要写落地方案：先读 02、05；
- 如果你只想知道它和 Ollama 有何不同：直接看 04。

## 本目录笔记导航

1. [01 产品定位、统一接口与适用场景](/ai/04-tooling/01/21/)
2. [02 多后端、多模态、分布式与代理能力](/ai/04-tooling/01/22/)
3. [03 质量、社区、价格与总拥有成本](/ai/04-tooling/01/23/)
4. [04 与 Ollama、vLLM、LiteLLM 的竞品对比](/ai/04-tooling/01/24/)
5. [05 生态集成与公开实践：OpenCode、Claude Code、GitHub Actions、Flowise、AnythingLLM、Home Assistant](/ai/04-tooling/01/25/)

## 引用

- [1] https://github.com/mudler/LocalAI — LocalAI GitHub
- [2] https://raw.githubusercontent.com/mudler/LocalAI/master/README.md — LocalAI README
- [3] https://api.github.com/repos/mudler/LocalAI — LocalAI GitHub API

上一篇：[03 Apache APISIX](/ai/04-tooling/01/14/)——上一产品代表 API-native 网关路线；这一篇切到本地自托管统一模型入口路线。

下一篇：[01 产品定位、统一接口与适用场景](/ai/04-tooling/01/21/)——先从产品定位、价值主张与适用边界开始。
