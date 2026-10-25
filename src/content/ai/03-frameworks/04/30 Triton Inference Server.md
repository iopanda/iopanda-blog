---
title: "Triton Inference Server"
number: "03.04.30"
chapter: 3
chapterTitle: "Frameworks"
section: 4
sectionTitle: "Inference and Serving Frameworks"
group: "3.10.3.4.5 Triton Inference Server"
created: 2026-09-04 03:25
author: "iopanda"
tags: ["framework", "inference", "serving", "triton"]
sourceId: "3.10.3.4 Inference and Serving Frameworks/3.10.3.4.5 Triton Inference Server/README"
---
# Triton Inference Server

> 模块定位：从“通用多模型 inference platform”这条路线理解 inference framework。Triton Inference Server 适合回答：如果你的主问题不只是 LLM，而是要统一管理多种模型、多种后端、多种协议和生产部署，该用什么平台承载？[10]

**本目录计划关注**：
1. Triton 为什么首先像通用 inference platform；
2. model repository、backend、batching、ensemble 和 deployment 的价值；
3. 与 vLLM、TensorRT-LLM 的协作边界；
4. 企业 AI 平台 / 多模型服务案例；
5. LLM-native engine 与通用 serving platform 的权衡。

**建议后续拆分**：
- 01 通用 inference platform 的设计哲学
- 02 model repository、backend、batching 与 ensemble
- 03 与 TensorRT-LLM、vLLM、KServe 的集成方式
- 04 多模型运营、可观测性与工程边界
- 05 企业多模型平台的 Triton 架构案例
- 06 Triton 与 vLLM、SGLang、TensorRT-LLM、llama.cpp 的深度对比

## 本目录笔记导航

1. [01 通用 inference platform 的设计哲学](/iopanda-blog/ai/03-frameworks/04/31/)
2. [02 model repository、backend、batching 与 ensemble](/iopanda-blog/ai/03-frameworks/04/32/)
3. [03 与 TensorRT-LLM、vLLM、KServe 的集成方式](/iopanda-blog/ai/03-frameworks/04/33/)
4. [04 多模型运营、可观测性与工程边界](/iopanda-blog/ai/03-frameworks/04/34/)
5. [05 企业多模型平台的 Triton 架构案例](/iopanda-blog/ai/03-frameworks/04/35/)
6. [06 Triton 与 vLLM、SGLang、TensorRT-LLM、llama.cpp 的深度对比](/iopanda-blog/ai/03-frameworks/04/36/)

上一篇：[03.04 llama.cpp](/iopanda-blog/ai/03-frameworks/04/23/)

下一篇：[01 通用 inference platform 的设计哲学](/iopanda-blog/ai/03-frameworks/04/31/)
