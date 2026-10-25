---
title: "llama.cpp 与 vLLM、SGLang、TensorRT-LLM、Triton 的深度对比"
number: "03.04.29"
chapter: 3
chapterTitle: "Frameworks"
section: 4
sectionTitle: "Inference and Serving Frameworks"
group: "3.10.3.4.4 llama.cpp"
created: 2026-09-04 05:25
author: "iopanda"
tags: ["framework", "inference", "serving", "llama-cpp", "comparison"]
sourceId: "3.10.3.4 Inference and Serving Frameworks/3.10.3.4.4 llama.cpp/06 llama.cpp 与 vLLM、SGLang、TensorRT-LLM、Triton 的深度对比"
---
# llama.cpp 与 vLLM、SGLang、TensorRT-LLM、Triton 的深度对比

> 到这里，llama.cpp 的位置已经很清楚：它首先不是数据中心高吞吐 serving engine，不是 structured/agentic runtime，也不是 NVIDIA 深度优化后端，更不是通用多模型平台；它首先是 **local/edge inference runtime**。[9] 这一篇就是把它放回整个 inference framework 版图里。

**学习目标**：学完本章，你将能够——
1. 站在 llama.cpp 视角解释它与 vLLM、SGLang、TensorRT-LLM、Triton 的差异；
2. 理解为什么本地/边缘运行时是一条独立路线；
3. 判断什么时候该优先选 llama.cpp，什么时候不该；
4. 写出一段“为什么这里选 llama.cpp”的架构说明；
5. 识别 llama.cpp 最常见的误用。

## 1. 与 vLLM 的差异

- vLLM 更像高吞吐在线 serving engine；
- llama.cpp 更像本地和边缘运行时。

## 2. 与 SGLang 的差异

- SGLang 更像 structured / agentic generation runtime；
- llama.cpp 更像轻量本地部署路线。

## 3. 与 TensorRT-LLM 的差异

- TensorRT-LLM 更像 NVIDIA 深度优化后端；
- llama.cpp 更像跨硬件 portability 路线。

## 4. 与 Triton 的差异

- Triton 更像通用平台；
- llama.cpp 更像设备侧运行时。

## 5. 什么时候最适合 llama.cpp

适合：
- 本地部署；
- 边缘设备；
- Mac / CPU-only / 离线产品；
- GGUF 分发和量化是主路径。

不那么适合：
- 公网高并发多租户平台；
- 极端吞吐/时延 SLA；
- 需要强平台治理和大规模集群运营。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| llama.cpp 最像什么 | 本地 / 边缘推理运行时 |
| 与 vLLM 的差异 | 一个偏在线 serving，一个偏本地交付 |
| 与 SGLang 的差异 | 一个偏 agent runtime，一个偏轻量运行时 |
| 与 TensorRT-LLM 的差异 | 一个偏 NVIDIA 深优化，一个偏跨硬件可达性 |
| 与 Triton 的差异 | 一个偏平台，一个偏设备侧运行时 |

## 引用

- [9] https://github.com/ggml-org/llama.cpp/blob/master/README.md — llama.cpp README
- [6] https://github.com/vllm-project/vllm — vLLM GitHub
- [7] https://github.com/sgl-project/sglang — SGLang GitHub
- [8] https://github.com/NVIDIA/TensorRT-LLM — TensorRT-LLM GitHub
- [10] https://github.com/triton-inference-server/server — Triton Inference Server GitHub

上一篇：[05 离线课程助教的 llama.cpp 架构案例](/iopanda-blog/ai/03-frameworks/04/28/)

下一篇：回到 [03.04 Inference Framework 选型矩阵](/iopanda-blog/ai/03-frameworks/04/37/)
