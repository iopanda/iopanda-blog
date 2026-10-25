---
title: "与 TensorRT-LLM、vLLM、KServe 的集成方式"
number: "03.04.33"
chapter: 3
chapterTitle: "Frameworks"
section: 4
sectionTitle: "Inference and Serving Frameworks"
group: "3.10.3.4.5 Triton Inference Server"
created: 2026-09-04 05:49
author: "iopanda"
tags: ["framework", "inference", "serving", "triton", "kserve", "vllm", "tensorrt-llm"]
sourceId: "3.10.3.4 Inference and Serving Frameworks/3.10.3.4.5 Triton Inference Server/03 与 TensorRT-LLM、vLLM、KServe 的集成方式"
---
# 与 TensorRT-LLM、vLLM、KServe 的集成方式

> Triton 最容易被误解成“另一个推理引擎”。其实从 README 和 LLM getting started 文档看，它更自然的角色经常是：承接不同 inference backend，并通过统一协议和部署模型把它们接成平台。[7][12] 这也正是为什么它和 TensorRT-LLM、vLLM、KServe 这样的东西，经常不是互斥关系，而是上下层关系。

**学习目标**：学完本章，你将能够——
1. 理解 Triton 与 TensorRT-LLM、vLLM、KServe 的典型层次关系；
2. 说明为什么 Triton 更像平台壳，而不是单一 LLM engine；
3. 理解 LLM 在 Triton 中如何被后端化；
4. 判断什么时候该把强引擎放进 Triton，而不是二选一；
5. 画出一张多层 serving 栈图。

## 1. Triton 与 TensorRT-LLM

LLM getting started 文档已经明确：
- Triton 可以通过 TensorRT-LLM PyTorch backend 服务 Hugging Face LLM；
- 现代路径是 LLM API / PyTorch backend，而不是老式 engine-build workflow。[12]

这说明 TensorRT-LLM 可以是后端执行层，而 Triton 是承接它的更上层平台。

## 2. Triton 与 vLLM

README 和 metrics 文档都明确有 vLLM backend metrics 的位置。[7][11]
这说明 Triton 并不排斥 vLLM 这类 LLM-native engine，反而可以把它纳入平台统一治理面。

## 3. Triton 与 KServe

README 直接说明其 HTTP/REST 和 gRPC inference protocols 基于社区发展的 KServe protocol。[7]
这说明 Triton 在协议层本身就与更广泛的 serving 生态对齐，而不是自造封闭接口。

## 4. 为什么这很重要

对于企业来说，常见正确问题不是：
- “Triton 还是 TensorRT-LLM？”
而是：
- “TensorRT-LLM 放在哪一层？”
- “vLLM 放在哪一层？”
- “平台要不要统一到 Triton/KServe 协议面？”

## 5. 动手活动

> [!example] 输出 `triton-stack-card.md`
>
> 画一张分层图：协议层、平台层、后端执行层、模型工件层。标出 Triton、KServe、TensorRT-LLM、vLLM 各自更自然的位置。写一句结论：你的系统当前最缺的是哪一层。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| Triton 和 TensorRT-LLM 的关系 | 平台层与高性能后端的关系 |
| Triton 和 vLLM 的关系 | 平台治理与 LLM-native engine 的关系 |
| Triton 和 KServe 的关系 | 协议/生态对齐关系 |
| 最大价值 | 帮企业把多个强引擎装进一个统一平台面 |

## 引用

- [7] https://github.com/triton-inference-server/server/blob/main/README.md — Triton README
- [11] https://github.com/triton-inference-server/server/blob/main/docs/user_guide/metrics.md — Triton metrics doc
- [12] https://github.com/triton-inference-server/server/blob/main/docs/getting_started/llm.md — Triton LLM getting started doc

上一篇：[02 model repository、backend、batching 与 ensemble](/iopanda-blog/ai/03-frameworks/04/32/)

下一篇：[04 多模型运营、可观测性与工程边界](/iopanda-blog/ai/03-frameworks/04/34/)
