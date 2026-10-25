---
title: "continuous batching、paged attention 与 KV cache"
number: "03.04.04"
chapter: 3
chapterTitle: "Frameworks"
section: 4
sectionTitle: "Inference and Serving Frameworks"
group: "3.10.3.4.1 vLLM"
created: 2026-09-04 03:52
author: "iopanda"
tags: ["framework", "inference", "serving", "vllm", "paged-attention", "kv-cache"]
sourceId: "3.10.3.4 Inference and Serving Frameworks/3.10.3.4.1 vLLM/02 continuous batching、paged attention 与 KV cache"
---
# continuous batching、paged attention 与 KV cache

> vLLM README 直接把 PagedAttention、continuous batching、chunked prefill、prefix caching 放在最核心的位置。[13] 这非常说明问题：vLLM 的护城河不是“又一个 API server”，而是它对 LLM serving 最贵资源——KV cache 和 decode 调度——的系统化处理。

**学习目标**：学完本章，你将能够——
1. 解释为什么 KV cache 是 serving 系统的核心资源；
2. 理解 continuous batching 为什么比静态 batch 更接近真实在线流量；
3. 说出 paged attention、prefix caching、chunked prefill 分别在解决什么；
4. 理解 disaggregated prefill/decode 为什么会出现；
5. 为一个在线服务写出 cache 与 scheduler 风险卡。

## 1. KV cache 为什么是 LLM serving 的资产负债表

在线推理最贵的不是单次算力，而是大量活跃请求带来的 KV cache 驻留。
一旦 cache 管不好，就会出现：
- 显存碎片；
- 并发上不去；
- 长上下文请求拖垮系统。

vLLM 的 PagedAttention，本质上就是在把 KV cache 的内存管理问题正式化。[13]

## 2. continuous batching 为什么比静态 batch 更重要

离线推理常按固定 batch 想问题；
在线流量不是这样：
- 请求随时到；
- 长短不一；
- 有的刚 prefill，有的已经进入 decode。

continuous batching 的意义在于：
- 不等整批齐了才执行；
- 让系统持续吸收新请求；
- 尽量减少 GPU 空转。[13]

## 3. prefix caching 和 chunked prefill 在补哪两种洞

- **prefix caching**：重复系统提示、重复长上下文、共享文档前缀时减少重复工作；
- **chunked prefill**：长 prompt 进入系统时，避免 prefill 一口气占满资源，拖住 decode 流。

这两者和 continuous batching 一起，构成了 vLLM 对“在线流量不规则性”的主要回答。[13]

## 4. 为什么会出现 disaggregated prefill/decode

vLLM README 和 kv transfer README 都明确提到 disaggregated prefill/decode，以及 distributed KV cache transfer。[13][17][18]

这说明当服务进一步放大后，团队会开始把：
- prefill
- decode
- KV transfer
拆成不同运行阶段，甚至不同实例。

背后原因很简单：
- prefill 和 decode 的资源形态不同；
- 高 QPS 时，二者混在一起未必最优；
- cache 传递和请求顺序也不天然一致，所以还需要 lookup buffer 这类抽象。[17]

## 5. 动手活动

> [!example] 动手活动：输出 `vllm-cache-scheduler-card.md`
>
> 列你的服务中：平均 prompt 长度、平均 output 长度、重复前缀比例、并发量。写一句结论：你的瓶颈更像 prefill、decode，还是 KV cache 驻留。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| KV cache 为什么重要 | 它决定并发上限和显存成本 |
| continuous batching 在做什么 | 让在线请求持续被调度，不被静态 batch 思维束缚 |
| prefix caching 在做什么 | 复用重复上下文 |
| chunked prefill 在做什么 | 降低长 prompt 对服务节奏的冲击 |
| disaggregated serving 为什么出现 | 因为 prefill 和 decode 的资源模式开始需要分治 |

## 引用

- [13] https://github.com/vllm-project/vllm/blob/main/README.md — vLLM README
- [17] https://github.com/vllm-project/vllm/blob/main/vllm/distributed/kv_transfer/README.md — vLLM KV transfer README
- [18] https://github.com/vllm-project/vllm/blob/main/examples/disaggregated/disaggregated_serving/README.md — vLLM disaggregated serving example

上一篇：[01 serving engine 的设计哲学](/iopanda-blog/ai/03-frameworks/04/03/)

下一篇：[03 OpenAI-compatible API、LoRA、多模型与部署形态](/iopanda-blog/ai/03-frameworks/04/05/)
