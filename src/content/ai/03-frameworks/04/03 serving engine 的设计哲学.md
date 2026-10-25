---
title: "serving engine 的设计哲学"
number: "03.04.03"
chapter: 3
chapterTitle: "Frameworks"
section: 4
sectionTitle: "Inference and Serving Frameworks"
group: "3.10.3.4.1 vLLM"
created: 2026-09-04 03:50
author: "iopanda"
tags: ["framework", "inference", "serving", "vllm", "architecture"]
sourceId: "3.10.3.4 Inference and Serving Frameworks/3.10.3.4.1 vLLM/01 serving engine 的设计哲学"
---
# serving engine 的设计哲学

> vLLM README 对自己的定位非常直接：它是 fast and easy-to-use library for LLM inference and serving，而且最醒目的卖点不是“支持多少模型”，而是 state-of-the-art serving throughput、PagedAttention、continuous batching、chunked prefill、prefix caching。[13] 这说明 vLLM 的第一性问题不是“怎么把模型跑起来”，而是：**当请求持续流入时，怎样把大模型服务做成一个高吞吐、低浪费、可持续吃流量的运行时。**

**学习目标**：学完本章，你将能够——
1. 解释为什么 vLLM 首先是 serving engine，而不是普通推理库；
2. 理解它为什么把 KV memory management 和 scheduler 放到设计中心；
3. 说出它与一般 `generate()` 式推理的根本差异；
4. 比较 vLLM 与 [SGLang](/iopanda-blog/ai/03-frameworks/04/09/)、[TensorRT-LLM](/iopanda-blog/ai/03-frameworks/04/16/) 的定位差异；
5. 判断项目什么时候自然进入 vLLM 路线。

## 1. 概念：vLLM 解决的是“服务态推理”

离线推理只要回答：
- 给定 prompt，模型能不能生成；
- 单个 batch 能不能跑完。

但在线 serving 要回答的是另一组问题：
- 新请求随时进来，怎么插队或排队；
- 长短请求混合时，GPU 怎么不被浪费；
- KV cache 怎么存才不碎；
- 同时有很多活跃序列时，吞吐怎么保持高位。

vLLM 从一开始就是围绕这些问题设计的。[13]

## 2. 为什么 serving engine 和推理库不是一回事

很多人第一次接触 inference，会把它理解成：
- 加载模型；
- 调 `generate()`；
- 外面套一个 API server。

但 vLLM 的设计重心说明这不够：
- PagedAttention 管 KV memory；
- continuous batching 管请求混合；
- chunked prefill 管长 prompt 进入系统的方式；
- prefix caching 管重复上下文的复用；
- OpenAI-compatible server 管对外服务协议。[13][14]

这已经不是“库函数 + Web server”，而是完整运行时。

## 3. 为什么它的主语是内存和调度

LLM serving 的成本主要不是来自“算不算得出来”，而是：
- attention KV 占不占住大量显存；
- 请求长度不一致导致的调度浪费；
- prefill 和 decode 的节奏是否互相拖累。

所以 vLLM 真正值钱的地方是：
**把显存碎片、请求并发、序列调度这几件事变成系统级设计对象。**

## 4. 和其他路线的第一差异

| 框架 | 第一性问题 | vLLM 相比的定位 |
|---|---|---|
| [SGLang](/iopanda-blog/ai/03-frameworks/04/09/) | 结构化生成和程序化推理如何高性能执行 | vLLM 更先解决 LLM API serving 本身 |
| [TensorRT-LLM](/iopanda-blog/ai/03-frameworks/04/16/) | NVIDIA 环境里如何极限优化执行 | vLLM 更像通用 LLM serving runtime |
| [llama.cpp](/iopanda-blog/ai/03-frameworks/04/23/) | 本地和边缘设备如何高可移植推理 | vLLM 更偏在线服务，不偏边缘本地 |
| [Triton](/iopanda-blog/ai/03-frameworks/04/30/) | 如何统一管理多模型多后端平台 | vLLM 更偏 LLM-native engine |

## 5. 什么时候最适合进入 vLLM

- 你要把大模型挂成在线 API；
- 并发和吞吐开始重要；
- 显存利用率开始影响成本；
- 你希望 OpenAI-compatible 接口尽快接入现有生态；
- 你想优先解决 serving efficiency，而不是先做复杂平台治理。

## 6. 动手活动

> [!example] 动手活动：输出 `vllm-fit.md`
>
> 列出你的服务目标：并发、P95 延迟、模型大小、上下文长度、重复 prompt 比例。写一句结论：你的主问题是“模型能不能生成”，还是“服务能不能持续吃流量”。

## 7. 总结

| 关键问题 | 一句话 |
|---|---|
| vLLM 首先是什么 | LLM-native serving engine |
| 它在解决什么 | 在线推理时的显存、调度、吞吐复杂度 |
| 为什么值钱 | 把大模型 serving 从函数调用升级为运行时系统 |
| 最适合什么 | 高频在线 API 服务 |

## 引用

- [13] https://github.com/vllm-project/vllm/blob/main/README.md — vLLM README
- [14] https://github.com/vllm-project/vllm/blob/main/docs/serving/online_serving/openai_compatible_server.md — vLLM OpenAI-compatible server doc

上一篇：[03.04 vLLM](/iopanda-blog/ai/03-frameworks/04/02/)

下一篇：[02 continuous batching、paged attention 与 KV cache](/iopanda-blog/ai/03-frameworks/04/04/)
