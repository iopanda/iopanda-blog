---
title: "SGLang"
number: "03.04.09"
chapter: 3
chapterTitle: "Frameworks"
section: 4
sectionTitle: "Inference and Serving Frameworks"
group: "3.10.3.4.2 SGLang"
created: 2026-09-04 03:25
author: "iopanda"
tags: ["framework", "inference", "serving", "sglang"]
sourceId: "3.10.3.4 Inference and Serving Frameworks/3.10.3.4.2 SGLang/README"
---
# SGLang

> 模块定位：从“结构化生成 + 高性能 serving”这条路线理解 inference framework。SGLang 适合回答：如果你的主问题不只是吞吐，而是生成过程本身需要程序化控制、结构化输出、agent/workflow execution，该用什么 serving 运行时承载？[7]

**本目录计划关注**：
1. SGLang 为什么既像 serving framework，又像 generation runtime；
2. 结构化生成、agent execution、serving 优化如何被统一；
3. 与 vLLM、TensorRT-LLM、Triton 的差异；
4. 课程助教 / tool-use / workflow 推理案例；
5. 部署、吞吐与控制能力之间的权衡。

**建议后续拆分**：
- 01 structured generation runtime 的设计哲学
- 02 serving、program execution 与结构化输出
- 03 agent 推理、tool use 与 workflow control
- 04 性能优化、部署方式与工程边界
- 05 课程助教 Agent 的 SGLang 架构案例
- 06 SGLang 与 vLLM、TensorRT-LLM、llama.cpp、Triton 的深度对比

## 本目录笔记导航

1. [01 structured generation runtime 的设计哲学](/iopanda-blog/ai/03-frameworks/04/10/)
2. [02 serving、program execution 与结构化输出](/iopanda-blog/ai/03-frameworks/04/11/)
3. [03 agent 推理、tool use 与 workflow control](/iopanda-blog/ai/03-frameworks/04/12/)
4. [04 性能优化、部署方式与工程边界](/iopanda-blog/ai/03-frameworks/04/13/)
5. [05 课程助教 Agent 的 SGLang 架构案例](/iopanda-blog/ai/03-frameworks/04/14/)
6. [06 SGLang 与 vLLM、TensorRT-LLM、llama.cpp、Triton 的深度对比](/iopanda-blog/ai/03-frameworks/04/15/)

上一篇：[03.04 vLLM](/iopanda-blog/ai/03-frameworks/04/02/)

下一篇：[01 structured generation runtime 的设计哲学](/iopanda-blog/ai/03-frameworks/04/10/)
