---
title: "kernels、graph compilation、quantization 与 execution"
number: "03.04.18"
chapter: 3
chapterTitle: "Frameworks"
section: 4
sectionTitle: "Inference and Serving Frameworks"
group: "3.10.3.4.3 TensorRT-LLM"
created: 2026-09-04 04:47
author: "iopanda"
tags: ["framework", "inference", "serving", "tensorrt-llm", "quantization", "kernels"]
sourceId: "3.10.3.4 Inference and Serving Frameworks/3.10.3.4.3 TensorRT-LLM/02 kernels、graph compilation、quantization 与 execution"
---
# kernels、graph compilation、quantization 与 execution

> TensorRT-LLM 的 README 几乎在不停强调 specialized kernels、quantization、runtime optimizations、speculative decoding、prefill-decode disaggregation。[13] quantization README 也直接把“预量化 checkpoint”和 Model Optimizer 导出路径摆在前面。[16] 这说明在 TensorRT-LLM 世界里，量化不是后处理小技巧，而是执行路径的一部分。

**学习目标**：学完本章，你将能够——
1. 理解为什么 kernels、graph、quantization 在 TensorRT-LLM 里不能分开看；
2. 说出预量化 checkpoint 和 execution path 的关系；
3. 理解为什么它的性能优化不是单点参数，而是全栈耦合；
4. 判断什么时候要把 serving 问题定义成 execution optimization 问题；
5. 为系统写一张 execution-path card。

## 1. quantization 在这里不是“压一下模型大小”

quantization README 讲得很清楚：[16]
- 可以直接加载预量化 HF checkpoint；
- 也可以通过 NVIDIA TensorRT Model Optimizer 自己导出；
- 支持格式要看 GPU 架构。

这意味着量化在这里首先是部署执行语义，而不是简单模型压缩。

## 2. 为什么 kernels 和 graph 必须一起看

TensorRT-LLM 的价值不只是某个注意力 kernel 快，而是：
- kernel 选型；
- 图级优化；
- quantized weights 形态；
- runtime scheduling；
这些一起决定最终效果。[13]

所以这里的性能不是“某个 op 更快”，而是整条 execution graph 更适合目标硬件。

## 3. 为什么 LLM API 也重要

LLM API README 显示，用户不是只能通过底层接口手工拼执行路径，还可以通过高层 API 使用：
- FP8
- KV cache dtype
- TP size
- speculative decoding
等能力。[19]

这说明 TensorRT-LLM 不是只给底层工程师用，它在尝试把复杂执行优化暴露成较可用的 API。

## 4. 动手活动

> [!example] 输出 `trtllm-execution-card.md`
>
> 列你的模型、目标 GPU、量化格式、TP 配置、是否 speculative decoding、是否多节点。写一句结论：你的 serving 主复杂度住在 API 层，还是 execution path 层。

## 5. 总结

| 关键问题 | 一句话 |
|---|---|
| quantization 在 TensorRT-LLM 里像什么 | 执行路径的一部分 |
| kernels 和 graph 为什么要一起看 | 因为最终性能来自全栈耦合 |
| 高层 API 为什么重要 | 它让复杂优化不至于只停在底层黑魔法 |
| 最大价值 | 把执行路径优化系统化 |

## 引用

- [13] https://github.com/NVIDIA/TensorRT-LLM/blob/main/README.md — TensorRT-LLM README
- [16] https://github.com/NVIDIA/TensorRT-LLM/blob/main/examples/quantization/README.md — TensorRT-LLM quantization README
- [19] https://github.com/NVIDIA/TensorRT-LLM/blob/main/examples/llm-api/README.md — TensorRT-LLM LLM API README

上一篇：[01 NVIDIA 优化推理栈的设计哲学](/ai/03-frameworks/04/17/)

下一篇：[03 与 Triton、Kubernetes、企业推理平台的关系](/ai/03-frameworks/04/19/)
