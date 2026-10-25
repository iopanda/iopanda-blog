---
title: "vLLM"
number: "04.07.05"
chapter: 4
chapterTitle: "Tooling"
section: 7
sectionTitle: "Local Models and Development"
group: "04 vLLM"
created: 2026-09-03 18:29
author: "iopanda"
tags: ["course", "ai-tooling", "local-models-and-development", "vllm"]
sourceId: "3.10.4.7 Local Models and Development/04 vLLM/README"
---
# vLLM

> 模块定位：从「高吞吐与内存效率优先的 serving 引擎」这条路线理解 Local Models and Development。这一目录先不急着写成产品手册，而是先抓住它的设计中心——throughput、serving、OpenAI-compatible server。

**本目录计划关注**：
1. vLLM 为什么会出现，它优先解决什么问题；
2. 它的核心抽象、部署形态与集成方式；
3. 它与同组其他产品相比的设计中心差异；
4. 它在课程助教或企业内部 AI 系统中的自然落点；
5. 什么时候适合用它，什么时候不该先用它。

## 建议拆分主题

1. 它更偏本地开发体验、轻量推理、统一接口还是正式 serving
2. 硬件门槛与兼容层
3. 适合哪个阶段
4. 与其他本地工具相比的边界
5. 课程助教 Agent 的本地到服务化路线

## 适合谁

- 需要把模型服务正式托起来的团队
- 学习重点不是 API 清单，而是它默认把什么复杂度提前结构化了。

## 引用

- 回到本组总览：[04.07 Local Models and Development](/iopanda-blog/ai/04-tooling/07/01/)

上一篇：[LocalAI](/iopanda-blog/ai/04-tooling/07/04/)
下一篇：[SGLang](/iopanda-blog/ai/04-tooling/07/06/)
