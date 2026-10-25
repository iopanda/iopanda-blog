---
title: "serving、program execution 与结构化输出"
number: "03.04.11"
chapter: 3
chapterTitle: "Frameworks"
section: 4
sectionTitle: "Inference and Serving Frameworks"
group: "3.10.3.4.2 SGLang"
created: 2026-09-04 04:22
author: "iopanda"
tags: ["framework", "inference", "serving", "sglang", "structured-outputs"]
sourceId: "3.10.3.4 Inference and Serving Frameworks/3.10.3.4.2 SGLang/02 serving、program execution 与结构化输出"
---
# serving、program execution 与结构化输出

> SGLang README 里把 structured outputs、reasoning、OpenAI APIs、runtime 放在同一层讲，[7] 而 Go OpenAI router 文档进一步展示了：请求前处理、chat template、tokenization、tool constraints、响应后处理、tool parsing，都可以被放在同一条高性能链路中。[12] 这意味着在 SGLang 里，serving 不是“接受字符串 → 返回字符串”，而更像“执行一段受约束生成程序”。

**学习目标**：学完本章，你将能够——
1. 理解为什么结构化输出在 SGLang 里不是边缘功能；
2. 说出 preprocessing / tokenization / parsing 为什么属于 runtime 一部分；
3. 解释 OpenAI-compatible 接口和内部执行模型之间的关系；
4. 判断什么时候应该把结构控制放进 serving runtime；
5. 为系统写一张 generation-control card。

## 1. 结构化输出在这里不是“后处理插件”

很多系统会这样做：
- 模型先自由生成；
- 应用层再正则抽；
- 抽不出来就重试。

SGLang 的路线不是这样。它更像：
- 结构控制前置；
- tool constraints 在请求阶段就进入链路；
- reasoning / tool parsing 在响应阶段正式执行。[12]

这意味着结构不是附属品，而是运行时契约。

## 2. 为什么 preprocessing 也属于 serving runtime

Go router 文档特别清楚：[12]
- FFI preprocess 负责 chat template 和 tokenization；
- gRPC 只负责和 backend 通信；
- postprocessing 负责 token decode 和 tool parsing。

这说明在 SGLang 世界里：
- 请求进入后，不只是简单转发；
- 运行时要理解 prompt contract；
- 也要理解 response contract。

## 3. program execution 的含义是什么

这里说的 program execution，不一定是显式写 DSL，更多是说：
- 生成要遵守结构；
- 某些阶段要解析 reasoning；
- 某些阶段要提取 tool call；
- 某些场景要控制 prefill / response continuation。

也就是说，推理过程越来越像一个受控程序，而不是裸文本生成。

## 4. 为什么这和 OpenAI-compatible API 不冲突

OpenAI-compatible 只是外部接口长得像标准 API；
SGLang 真正独特的地方在于，内部对请求和响应做了更多 runtime work。

所以它不是“只做兼容层”，而是：
- 用兼容层接生态；
- 用内部 runtime 做控制和优化。

## 5. 动手活动

> [!example] 动手活动：输出 `sglang-generation-control-card.md`
>
> 列你的系统需要哪些生成控制：chat template、response prefill、JSON、tool parsing、reasoning 分离。写一句结论：这些控制若全堆在应用层，会带来什么工程代价。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| 结构化输出在 SGLang 里像什么 | 运行时契约的一部分 |
| preprocessing 为什么重要 | 请求本身也需要被 runtime 理解和执行 |
| OpenAI-compatible 的作用 | 接入生态，而不是替代内部控制模型 |
| 最大价值 | 把生成控制从胶水代码提升为运行时能力 |

## 引用

- [7] https://github.com/sgl-project/sglang/blob/main/README.md — SGLang README
- [8] https://github.com/sgl-project/sglang/blob/main/examples/runtime/README.md — SGLang runtime examples README
- [12] https://github.com/sgl-project/sglang/blob/main/sgl-model-gateway/bindings/golang/examples/oai_server/README.md — SGLang Go OpenAI router README

上一篇：[01 structured generation runtime 的设计哲学](/iopanda-blog/ai/03-frameworks/04/10/)

下一篇：[03 agent 推理、tool use 与 workflow control](/iopanda-blog/ai/03-frameworks/04/12/)
