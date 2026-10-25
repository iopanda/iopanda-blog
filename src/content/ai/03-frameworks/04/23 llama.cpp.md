---
title: "llama.cpp"
number: "03.04.23"
chapter: 3
chapterTitle: "Frameworks"
section: 4
sectionTitle: "Inference and Serving Frameworks"
group: "3.10.3.4.4 llama.cpp"
created: 2026-09-04 03:25
author: "iopanda"
tags: ["framework", "inference", "serving", "llama-cpp"]
sourceId: "3.10.3.4 Inference and Serving Frameworks/3.10.3.4.4 llama.cpp/README"
---
# llama.cpp

> 模块定位：从“本地 / 边缘 LLM 推理运行时”这条路线理解 inference framework。llama.cpp 适合回答：如果你的主问题不是云端大集群 serving，而是本地、CPU、Mac、边缘设备和 GGUF 交付，该用什么运行时？[9]

**本目录计划关注**：
1. llama.cpp 为什么首先像本地推理运行时；
2. GGUF、量化、本地部署、跨平台 portability 的价值；
3. 与 vLLM、TensorRT-LLM、Triton 的差异；
4. 个人知识助手 / edge AI / 离线课程助教案例；
5. 本地性能、模型规模和硬件边界。

**建议后续拆分**：
- 01 本地推理运行时的设计哲学
- 02 GGUF、量化、CPU/GPU 后端与 portability
- 03 OpenAI-compatible server、桌面应用与边缘交付
- 04 性能、模型规模与适用边界
- 05 离线课程助教的 llama.cpp 架构案例
- 06 llama.cpp 与 vLLM、SGLang、TensorRT-LLM、Triton 的深度对比

## 本目录笔记导航

1. [01 本地推理运行时的设计哲学](/iopanda-blog/ai/03-frameworks/04/24/)
2. [02 GGUF、量化、CPU/GPU 后端与 portability](/iopanda-blog/ai/03-frameworks/04/25/)
3. [03 OpenAI-compatible server、桌面应用与边缘交付](/iopanda-blog/ai/03-frameworks/04/26/)
4. [04 性能、模型规模与适用边界](/iopanda-blog/ai/03-frameworks/04/27/)
5. [05 离线课程助教的 llama.cpp 架构案例](/iopanda-blog/ai/03-frameworks/04/28/)
6. [06 llama.cpp 与 vLLM、SGLang、TensorRT-LLM、Triton 的深度对比](/iopanda-blog/ai/03-frameworks/04/29/)

上一篇：[03.04 TensorRT-LLM](/iopanda-blog/ai/03-frameworks/04/16/)

下一篇：[01 本地推理运行时的设计哲学](/iopanda-blog/ai/03-frameworks/04/24/)
