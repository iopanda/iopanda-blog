---
title: "structured generation runtime 的设计哲学"
number: "03.04.10"
chapter: 3
chapterTitle: "Frameworks"
section: 4
sectionTitle: "Inference and Serving Frameworks"
group: "3.10.3.4.2 SGLang"
created: 2026-09-04 04:20
author: "iopanda"
tags: ["framework", "inference", "serving", "sglang", "architecture"]
sourceId: "3.10.3.4 Inference and Serving Frameworks/3.10.3.4.2 SGLang/01 structured generation runtime 的设计哲学"
---
# structured generation runtime 的设计哲学

> SGLang README 对自己的定位很不一样：它不是单纯说自己是 high-performance serving framework，而是把 fast runtime、structured outputs、tool use、reasoning、RL rollout backbone、OpenAI-compatible serving 放在同一张能力图里。[7] 这说明 SGLang 的第一性问题，不只是“怎样把 token 吐得更快”，而是：**当生成过程本身需要被程序化、结构化、工作流化时，怎样同时保住 serving 性能。**

**学习目标**：学完本章，你将能够——
1. 解释为什么 SGLang 既像 serving framework，又像 generation runtime；
2. 理解它和 vLLM 的第一差异不只是 benchmark，而是主语不同；
3. 说出 structured generation 为什么值得独立成一条 serving 路线；
4. 判断什么时候系统真正需要 SGLang 这样的 runtime；
5. 为一个 agent / workflow 服务写框架判断卡。

## 1. 概念：SGLang 解决的是“被控制的生成”

普通 serving engine 重点关心：
- 吞吐；
- 延迟；
- KV cache；
- batching。

SGLang 当然也关心这些，但 README 明确还把这些放到一起：[7]
- structured outputs
- tool use
- reasoning
- RL rollout backbone
- OpenAI APIs
- prefill-decode disaggregation

这说明它的核心不是只把模型当成 token machine，而是把生成过程当成可编排运行时。

## 2. 为什么这是独立路线

很多真实系统不是只要自然语言结果，而是要：
- JSON
- grammar-constrained output
- reasoning / tool parsing
- workflow step control
- agent loop 中的请求前后处理

如果这些能力都放在模型外层用胶水代码拼，很快会出现：
- 性能损失；
- 结构不稳定；
- prompt hack 越来越重；
- server 和 agent runtime 分裂成两套系统。

SGLang 的路线，就是把这些“控制能力”往 runtime 里收。

## 3. 为什么它不是只会做结构化输出

如果只是“能输出 JSON”，它还不够成为独立章节。
SGLang 真正独特的地方是：
- 结构化输出
- tool 解析
- 推理解析
- rollout 支持
- router / gateway
- cache-aware serving
被放进同一 serving 世界观里。[7][10][11][12]

所以它更像“程序化推理运行时”，而不是单点 decoding feature。

## 4. 与其他路线的差异

| 框架 | 第一性问题 | SGLang 相比的定位 |
|---|---|---|
| [vLLM](/iopanda-blog/ai/03-frameworks/04/02/) | 如何把 LLM online serving 做到高吞吐 | SGLang 更先解决受控生成与程序化推理 |
| [TensorRT-LLM](/iopanda-blog/ai/03-frameworks/04/16/) | 如何在 NVIDIA 上极限优化执行 | SGLang 更像上层 runtime，而不是只做硬件后端 |
| [llama.cpp](/iopanda-blog/ai/03-frameworks/04/23/) | 如何在本地和边缘设备跑模型 | SGLang 更偏在线服务与 agent/workflow 场景 |
| [Triton](/iopanda-blog/ai/03-frameworks/04/30/) | 如何统一多模型平台治理 | SGLang 更偏 LLM generation runtime |

## 5. 什么时候最自然进入 SGLang

- 你不只需要 chat completion；
- 你需要结构化输出、reasoning 解析、tool parsing；
- 你要把模型嵌进 agent / workflow / MCP loop；
- 你既关心性能，也关心 generation control；
- 你不想把所有控制逻辑都堆在应用层。

## 6. 动手活动

> [!example] 动手活动：输出 `sglang-fit.md`
>
> 列你的服务需要什么：高吞吐、JSON、tool parsing、reasoning、workflow control、router。写一句结论：你的系统最痛的是 serving 本身，还是“可控生成”。

## 7. 总结

| 关键问题 | 一句话 |
|---|---|
| SGLang 首先是什么 | structured generation runtime |
| 它在解决什么 | 把受控生成与 serving 性能放进同一运行时 |
| 为什么值钱 | 让 agent / workflow / structured output 不必全靠应用层胶水 |
| 最适合什么 | 在线 agentic serving 和结构化生成系统 |

## 引用

- [7] https://github.com/sgl-project/sglang/blob/main/README.md — SGLang README
- [11] https://github.com/sgl-project/sglang/blob/main/sgl-model-gateway/README.md — SGLang model gateway README
- [12] https://github.com/sgl-project/sglang/blob/main/sgl-model-gateway/bindings/golang/examples/oai_server/README.md — SGLang Go OpenAI router README

上一篇：[03.04 SGLang](/iopanda-blog/ai/03-frameworks/04/09/)

下一篇：[02 serving、program execution 与结构化输出](/iopanda-blog/ai/03-frameworks/04/11/)
