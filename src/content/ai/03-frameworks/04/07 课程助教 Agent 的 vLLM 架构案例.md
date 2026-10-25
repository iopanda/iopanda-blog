---
title: "课程助教 Agent 的 vLLM 架构案例"
number: "03.04.07"
chapter: 3
chapterTitle: "Frameworks"
section: 4
sectionTitle: "Inference and Serving Frameworks"
group: "3.10.3.4.1 vLLM"
created: 2026-09-04 03:58
author: "iopanda"
tags: ["framework", "inference", "serving", "vllm", "case-study"]
sourceId: "3.10.3.4 Inference and Serving Frameworks/3.10.3.4.1 vLLM/05 课程助教 Agent 的 vLLM 架构案例"
---
# 课程助教 Agent 的 vLLM 架构案例

> 把 vLLM 放回课程助教主线时，它最自然的角色不是“本地离线助手”，而是：**课程助教已经训好，现在要把它作为一个稳定的在线问答与工具调用 API 服务出去。** 这时候真正重要的，不是单个回答能不能生成，而是高峰期多个学生同时提问时，系统是否还能稳住吞吐、延迟和上下文复用。

**学习目标**：学完本章，你将能够——
1. 用 vLLM 的语言为课程助教设计在线 serving 架构；
2. 判断课程助教何时适合用 vLLM，而不是 llama.cpp 或 Triton；
3. 设计课程助教的 structured outputs、tool calling 和多 adapter 方案；
4. 设计课程助教的关键监控指标；
5. 写一张课程助教的 vLLM 适配卡。

## 1. 为什么课程助教适合 vLLM

当课程助教开始出现：
- 高并发学生问答；
- 长系统提示和课程规则前缀；
- 统一 OpenAI-compatible 接口接前端/agent；
- 结构化输出（如引用、评分、任务拆分）；
- 多课程 adapter 或多学期 adapter；
它就很自然进入 vLLM 世界。

## 2. 推荐架构

- 模型层：一个或多个 instruction-tuned 助教模型；
- 服务层：vLLM OpenAI-compatible API；
- 输出层：structured outputs 约束引用、答案结构；
- 运营层：/metrics 接监控，观察 TTFT、吞吐、tail latency；
- 可选：多 LoRA 承接不同课程或不同院系。

## 3. 为什么这里不是优先选 llama.cpp

因为这里的主问题不是：
- 单机离线运行；
而是：
- 在线并发服务；
- 多请求调度；
- 统一 API 面；
- 课程峰值流量吸收。

## 4. 动手活动

> [!example] 输出 `course-ta-vllm-card.md`
>
> 为课程助教列：模型、平均并发、平均上下文长度、是否需要 tool calling、是否需要 structured outputs、是否需要多课程 adapter。写一句结论：为什么这里的主复杂度是 serving，而不是本地推理。

## 5. 总结

| 关键问题 | 一句话 |
|---|---|
| 课程助教为什么适合 vLLM | 因为它一旦在线化，主问题就是吞吐、调度和服务面 |
| 最大价值 | 把助教模型稳定交付成 API 服务 |
| 不适合什么 | 完全离线、本地单用户、小规模边缘部署 |

## 引用

- [13] https://github.com/vllm-project/vllm/blob/main/README.md — vLLM README
- [14] https://github.com/vllm-project/vllm/blob/main/docs/serving/online_serving/openai_compatible_server.md — vLLM OpenAI-compatible server doc
- [15] https://github.com/vllm-project/vllm/blob/main/docs/features/structured_outputs.md — vLLM structured outputs doc

上一篇：[04 吞吐、延迟、可观测性与工程边界](/ai/03-frameworks/04/06/)

下一篇：[06 vLLM 与 SGLang、TensorRT-LLM、llama.cpp、Triton 的深度对比](/ai/03-frameworks/04/08/)
