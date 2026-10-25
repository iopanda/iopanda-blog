---
title: "vLLM"
number: "03.04.02"
chapter: 3
chapterTitle: "Frameworks"
section: 4
sectionTitle: "Inference and Serving Frameworks"
group: "3.10.3.4.1 vLLM"
created: 2026-09-04 03:25
author: "iopanda"
tags: ["framework", "inference", "serving", "vllm"]
sourceId: "3.10.3.4 Inference and Serving Frameworks/3.10.3.4.1 vLLM/README"
---
# vLLM

> 模块定位：从“高吞吐、内存高效的 LLM serving engine”这条路线理解 inference framework。vLLM 适合回答：如果你的主问题是 API 吞吐、延迟、KV cache 利用率、batching 与 serving 成本，该用什么运行时承载？[6]

**本目录计划关注**：
1. vLLM 为什么首先是 serving engine，而不是普通推理库；
2. continuous batching、KV cache、OpenAI-compatible serving 的核心价值；
3. 与 SGLang、TensorRT-LLM、Triton、llama.cpp 的差异；
4. 课程助教 / 企业内推理 API 案例；
5. 生产环境下的吞吐、延迟、部署边界。

**建议后续拆分**：
- 01 serving engine 的设计哲学
- 02 continuous batching、paged attention 与 KV cache
- 03 OpenAI-compatible API、LoRA、多模型与部署形态
- 04 吞吐、延迟、可观测性与工程边界
- 05 课程助教 Agent 的 vLLM 架构案例
- 06 vLLM 与 SGLang、TensorRT-LLM、llama.cpp、Triton 的深度对比

## 本目录笔记导航

1. [01 serving engine 的设计哲学](/iopanda-blog/ai/03-frameworks/04/03/)
2. [02 continuous batching、paged attention 与 KV cache](/iopanda-blog/ai/03-frameworks/04/04/)
3. [03 OpenAI-compatible API、LoRA、多模型与部署形态](/iopanda-blog/ai/03-frameworks/04/05/)
4. [04 吞吐、延迟、可观测性与工程边界](/iopanda-blog/ai/03-frameworks/04/06/)
5. [05 课程助教 Agent 的 vLLM 架构案例](/iopanda-blog/ai/03-frameworks/04/07/)
6. [06 vLLM 与 SGLang、TensorRT-LLM、llama.cpp、Triton 的深度对比](/iopanda-blog/ai/03-frameworks/04/08/)

上一篇：[03.04 Inference and Serving Frameworks](/iopanda-blog/ai/03-frameworks/04/01/)

下一篇：[01 serving engine 的设计哲学](/iopanda-blog/ai/03-frameworks/04/03/)
