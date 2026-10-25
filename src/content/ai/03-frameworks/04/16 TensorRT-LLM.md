---
title: "TensorRT-LLM"
number: "03.04.16"
chapter: 3
chapterTitle: "Frameworks"
section: 4
sectionTitle: "Inference and Serving Frameworks"
group: "3.10.3.4.3 TensorRT-LLM"
created: 2026-09-04 03:25
author: "iopanda"
tags: ["framework", "inference", "serving", "tensorrt-llm"]
sourceId: "3.10.3.4 Inference and Serving Frameworks/3.10.3.4.3 TensorRT-LLM/README"
---
# TensorRT-LLM

> 模块定位：从“面向 NVIDIA GPU 的深度优化推理栈”这条路线理解 inference framework。TensorRT-LLM 适合回答：如果你的主问题是 NVIDIA 环境下把吞吐、延迟、量化、kernel 和 graph 优化压到极致，该用什么 serving 后端？[8]

**本目录计划关注**：
1. TensorRT-LLM 为什么首先像硬件优化 inference stack；
2. graph/kernels/quantization 与 serving 如何耦合；
3. 与 vLLM、SGLang、Triton 的协作与边界；
4. 企业推理集群 / NVIDIA 生产部署案例；
5. 性能与工程复杂度的权衡。

**建议后续拆分**：
- 01 NVIDIA 优化推理栈的设计哲学
- 02 kernels、graph compilation、quantization 与 execution
- 03 与 Triton、Kubernetes、企业推理平台的关系
- 04 性能、硬件依赖与工程边界
- 05 企业推理服务的 TensorRT-LLM 架构案例
- 06 TensorRT-LLM 与 vLLM、SGLang、llama.cpp、Triton 的深度对比

## 本目录笔记导航

1. [01 NVIDIA 优化推理栈的设计哲学](/ai/03-frameworks/04/17/)
2. [02 kernels、graph compilation、quantization 与 execution](/ai/03-frameworks/04/18/)
3. [03 与 Triton、Kubernetes、企业推理平台的关系](/ai/03-frameworks/04/19/)
4. [04 性能、硬件依赖与工程边界](/ai/03-frameworks/04/20/)
5. [05 企业推理服务的 TensorRT-LLM 架构案例](/ai/03-frameworks/04/21/)
6. [06 TensorRT-LLM 与 vLLM、SGLang、llama.cpp、Triton 的深度对比](/ai/03-frameworks/04/22/)

上一篇：[03.04 SGLang](/ai/03-frameworks/04/09/)

下一篇：[01 NVIDIA 优化推理栈的设计哲学](/ai/03-frameworks/04/17/)
