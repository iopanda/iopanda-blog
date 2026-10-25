---
title: "与 Triton、Kubernetes、企业推理平台的关系"
number: "03.04.19"
chapter: 3
chapterTitle: "Frameworks"
section: 4
sectionTitle: "Inference and Serving Frameworks"
group: "3.10.3.4.3 TensorRT-LLM"
created: 2026-09-04 04:49
author: "iopanda"
tags: ["framework", "inference", "serving", "tensorrt-llm", "triton", "kubernetes"]
sourceId: "3.10.3.4 Inference and Serving Frameworks/3.10.3.4.3 TensorRT-LLM/03 与 Triton、Kubernetes、企业推理平台的关系"
---
# 与 Triton、Kubernetes、企业推理平台的关系

> TensorRT-LLM README 和 AGENTS.md 都明确把 Triton、Dynamo、`trtllm-serve`、部署指南放在一条线上。[13][14] 这说明 TensorRT-LLM 的正确理解方式不是“单独立国”，而是：**它常常作为高性能推理后端，被更大的 serving platform、Kubernetes 部署体系或企业平台承接。**

**学习目标**：学完本章，你将能够——
1. 理解 TensorRT-LLM 和 Triton / Kubernetes / 企业平台的分工；
2. 说明为什么它更像 serving backend 而不是完整平台；
3. 理解 `trtllm-serve`、Triton 和平台治理的关系；
4. 判断什么时候该直接上 TensorRT-LLM，什么时候该把它嵌到更大平台里；
5. 画出一张企业推理栈组合图。

## 1. TensorRT-LLM 更像高性能后端

它当然能直接 serve，AGENTS.md 也给出 `trtllm-serve` 命令。[14]
但从整体设计看，它更自然的位置往往是：
- 作为 NVIDIA 优化后端；
- 被 Triton 或企业调度体系承接；
- 被 Kubernetes、autoscaling、observability 等外围设施包住。

## 2. 为什么 Triton 会频繁出现

README 明确说它与 Triton Inference Server 和 NVIDIA Dynamo 无缝集成。[13]
这说明：
- TensorRT-LLM 负责把单模型执行路径做到极强；
- Triton 更适合统一暴露平台化 serving 能力。

## 3. Kubernetes / 企业平台真正承接什么

平台层通常要承接：
- 多模型生命周期管理；
- 弹性扩缩容；
- 网关与认证；
- 统一观测；
- 部署与变更治理。

这些不等于 TensorRT-LLM 不关心，而是它的第一主语不在这里。

## 4. 动手活动

> [!example] 输出 `trtllm-platform-stack.md`
>
> 画一张图：TensorRT-LLM 在底层负责 execution path，Triton/Kubernetes 在上层负责平台化交付。写一句结论：你的系统主复杂度更像模型执行，还是平台运营。

## 5. 总结

| 关键问题 | 一句话 |
|---|---|
| TensorRT-LLM 最自然的生态位置 | 高性能推理后端 |
| Triton 在做什么 | 通用平台化 serving 层 |
| Kubernetes 在做什么 | 部署、扩缩容、运维治理 |
| 关键判断 | 你的主问题是在执行路径，还是在平台运营 |

## 引用

- [13] https://github.com/NVIDIA/TensorRT-LLM/blob/main/README.md — TensorRT-LLM README
- [14] https://github.com/NVIDIA/TensorRT-LLM/blob/main/AGENTS.md — TensorRT-LLM AGENTS overview
- [15] https://github.com/NVIDIA/TensorRT-LLM/blob/main/examples/serve/README.md — TensorRT-LLM serve README

上一篇：[02 kernels、graph compilation、quantization 与 execution](/ai/03-frameworks/04/18/)

下一篇：[04 性能、硬件依赖与工程边界](/ai/03-frameworks/04/20/)
