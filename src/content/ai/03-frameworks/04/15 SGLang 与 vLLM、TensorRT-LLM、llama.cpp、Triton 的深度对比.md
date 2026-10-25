---
title: "SGLang 与 vLLM、TensorRT-LLM、llama.cpp、Triton 的深度对比"
number: "03.04.15"
chapter: 3
chapterTitle: "Frameworks"
section: 4
sectionTitle: "Inference and Serving Frameworks"
group: "3.10.3.4.2 SGLang"
created: 2026-09-04 04:30
author: "iopanda"
tags: ["framework", "inference", "serving", "sglang", "comparison"]
sourceId: "3.10.3.4 Inference and Serving Frameworks/3.10.3.4.2 SGLang/06 SGLang 与 vLLM、TensorRT-LLM、llama.cpp、Triton 的深度对比"
---
# SGLang 与 vLLM、TensorRT-LLM、llama.cpp、Triton 的深度对比

> 到这里，SGLang 的位置已经很清楚：它首先不是本地边缘运行时，不是通用推理平台，也不是单纯硬件优化后端；它首先是 **structured generation runtime + high-performance serving framework**。[7] 这一篇就是把它放回整个 inference framework 版图里。

**学习目标**：学完本章，你将能够——
1. 站在 SGLang 视角解释它与 vLLM、TensorRT-LLM、llama.cpp、Triton 的差异；
2. 理解为什么“受控生成 runtime”是一条独立 serving 路线；
3. 判断什么时候该优先选 SGLang，什么时候不该；
4. 写出一段“为什么这里选 SGLang”的架构说明；
5. 识别 SGLang 最常见的误用。

## 1. 与 vLLM 的差异

- vLLM 更先解决高吞吐 LLM serving；
- SGLang 更先解决结构化生成、tool use、workflow-aware serving。

## 2. 与 TensorRT-LLM 的差异

- TensorRT-LLM 更像 NVIDIA 优化执行后端；
- SGLang 更像上层运行时和控制面。

## 3. 与 llama.cpp 的差异

- llama.cpp 更像本地/边缘离线运行时；
- SGLang 更像在线 agentic serving runtime。

## 4. 与 Triton 的差异

- Triton 更像通用多模型平台；
- SGLang 更像 LLM generation runtime，尤其偏 structured/agentic 路线。

## 5. 什么时候最适合 SGLang

适合：
- 既要性能，又要生成控制；
- 需要 tool parsing、reasoning parsing、workflow control；
- 想让 router、gateway、MCP、会话边界进入正式运行时。

不那么适合：
- 只是简单 chat completion API；
- 主要场景是离线、本地、边缘运行；
- 主问题是通用多模型平台治理而非 LLM generation runtime。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| SGLang 最像什么 | structured generation runtime |
| 与 vLLM 的差异 | 一个偏高吞吐 serving，一个偏受控生成 runtime |
| 与 TensorRT-LLM 的差异 | 一个偏控制面，一个偏硬件后端 |
| 与 llama.cpp 的差异 | 一个偏在线 agent serving，一个偏本地推理 |
| 与 Triton 的差异 | 一个偏 LLM runtime，一个偏通用平台 |

## 引用

- [7] https://github.com/sgl-project/sglang/blob/main/README.md — SGLang README
- [6] https://github.com/vllm-project/vllm — vLLM GitHub
- [8] https://github.com/NVIDIA/TensorRT-LLM — TensorRT-LLM GitHub
- [9] https://github.com/ggml-org/llama.cpp — llama.cpp GitHub
- [10] https://github.com/triton-inference-server/server — Triton Inference Server GitHub

上一篇：[05 课程助教 Agent 的 SGLang 架构案例](/iopanda-blog/ai/03-frameworks/04/14/)

下一篇：回到 [03.04 Inference Framework 选型矩阵](/iopanda-blog/ai/03-frameworks/04/37/)
