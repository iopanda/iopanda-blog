---
title: "vLLM 与 SGLang、TensorRT-LLM、llama.cpp、Triton 的深度对比"
number: "03.04.08"
chapter: 3
chapterTitle: "Frameworks"
section: 4
sectionTitle: "Inference and Serving Frameworks"
group: "3.10.3.4.1 vLLM"
created: 2026-09-04 04:00
author: "iopanda"
tags: ["framework", "inference", "serving", "vllm", "comparison"]
sourceId: "3.10.3.4 Inference and Serving Frameworks/3.10.3.4.1 vLLM/06 vLLM 与 SGLang、TensorRT-LLM、llama.cpp、Triton 的深度对比"
---
# vLLM 与 SGLang、TensorRT-LLM、llama.cpp、Triton 的深度对比

> 到这里，vLLM 的位置已经很清楚：它首先不是通用 inference platform，不是本地边缘运行时，也不是纯硬件优化后端；它首先是 **LLM-native serving engine**。[13] 这一篇就是把它放回整个 inference framework 版图里。

**学习目标**：学完本章，你将能够——
1. 站在 vLLM 视角解释它与 SGLang、TensorRT-LLM、llama.cpp、Triton 的差异；
2. 理解为什么高吞吐 serving engine 是独立路线；
3. 判断什么时候该优先选 vLLM，什么时候不该；
4. 写出一段“为什么这里选 vLLM”的架构说明；
5. 识别 vLLM 最常见的误用。

## 1. 与 SGLang 的差异

- SGLang 更强调结构化生成与程序化控制；
- vLLM 更先解决高吞吐在线 serving 本身。

## 2. 与 TensorRT-LLM 的差异

- TensorRT-LLM 更像 NVIDIA 优化后端；
- vLLM 更像面向应用接入的 serving runtime。

## 3. 与 llama.cpp 的差异

- llama.cpp 更像本地/边缘运行时；
- vLLM 更像在线服务引擎。

## 4. 与 Triton 的差异

- Triton 更像通用多模型平台；
- vLLM 更像专门为 LLM online serving 优化的引擎。

## 5. 什么时候最适合 vLLM

适合：
- 在线 API 服务；
- 并发高；
- 长上下文和 KV cache 成本重要；
- 需要 OpenAI-compatible 接口；
- 希望 LoRA、structured outputs、tool calling 一起进入服务面。

不那么适合：
- 纯本地单用户离线应用；
- 平台主语是“多模型统一治理”而非 LLM serving 本身；
- 强硬件锁定、极限 NVIDIA 优化优先于通用 serving 面。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| vLLM 最像什么 | 高吞吐 LLM-native serving engine |
| 与 SGLang 的差异 | 一个偏 serving efficiency，一个偏 structured generation runtime |
| 与 TensorRT-LLM 的差异 | 一个偏应用引擎，一个偏硬件优化后端 |
| 与 llama.cpp 的差异 | 一个偏在线服务，一个偏本地运行 |
| 与 Triton 的差异 | 一个偏 LLM-native，一个偏通用平台 |

## 引用

- [13] https://github.com/vllm-project/vllm/blob/main/README.md — vLLM README
- [6] https://github.com/vllm-project/vllm — vLLM GitHub
- [7] https://github.com/sgl-project/sglang — SGLang GitHub
- [8] https://github.com/NVIDIA/TensorRT-LLM — TensorRT-LLM GitHub
- [9] https://github.com/ggml-org/llama.cpp — llama.cpp GitHub
- [10] https://github.com/triton-inference-server/server — Triton Inference Server GitHub

上一篇：[05 课程助教 Agent 的 vLLM 架构案例](/iopanda-blog/ai/03-frameworks/04/07/)

下一篇：回到 [03.04 Inference Framework 选型矩阵](/iopanda-blog/ai/03-frameworks/04/37/)
