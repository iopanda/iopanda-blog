---
title: "课程助教 Agent 的 SGLang 架构案例"
number: "03.04.14"
chapter: 3
chapterTitle: "Frameworks"
section: 4
sectionTitle: "Inference and Serving Frameworks"
group: "3.10.3.4.2 SGLang"
created: 2026-09-04 04:28
author: "iopanda"
tags: ["framework", "inference", "serving", "sglang", "case-study"]
sourceId: "3.10.3.4 Inference and Serving Frameworks/3.10.3.4.2 SGLang/05 课程助教 Agent 的 SGLang 架构案例"
---
# 课程助教 Agent 的 SGLang 架构案例

> 把 SGLang 放回课程助教主线时，它最自然的角色不是“最便宜跑一个 API”，而是：**课程助教已经不只是问答器，而是一个需要结构化输出、工具调用、引用解析、多轮状态和工作流控制的 agent 服务。** 这时候，应用层如果全靠 prompt + parser + retry 拼，会很快失控。

**学习目标**：学完本章，你将能够——
1. 判断课程助教何时适合 SGLang 而不是 vLLM；
2. 设计课程助教的 structured output、tool use、router 和会话状态；
3. 说明为什么这里主复杂度住在 workflow-aware serving；
4. 设计课程助教的控制面与观测面；
5. 写一张课程助教的 SGLang 适配卡。

## 1. 什么时候课程助教适合 SGLang

当课程助教开始出现：
- 结构化答案卡片；
- citation / rubric / action items 等固定输出结构；
- tool calling（查课程资料、作业规则、日历、评分服务）；
- reasoning / tool parsing；
- 多轮状态和 router policy；
它就开始更像 SGLang 场景，而不只是普通 chat serving。

## 2. 推荐架构

- 推理层：SGLang runtime
- 协议层：OpenAI-compatible API
- 控制层：tool parser、reasoning parser、conversation storage
- 路由层：worker/router，根据 cache 和负载做分流
- 观测层：Prometheus + Grafana

## 3. 为什么这里不优先选 vLLM

不是因为 vLLM 不强，
而是这里的主问题不只是高吞吐，
而是：
- 结构化生成是否稳定；
- 多轮与工具边界是否正式化；
- 工作流控制是否进入 runtime。

## 4. 动手活动

> [!example] 输出 `course-ta-sglang-card.md`
>
> 为课程助教列：是否要 JSON 输出、是否要工具调用、是否要会话存储、是否要 reasoning 解析、是否要 cache-aware routing。写一句结论：你的主复杂度是吞吐，还是“可控的 agent serving”。

## 5. 总结

| 关键问题 | 一句话 |
|---|---|
| 课程助教为什么适合 SGLang | 因为它长成了 agent/workflow 服务 |
| 最大价值 | 把结构化生成、工具和多轮控制纳入 runtime |
| 不适合什么 | 只要简单 chat completion 的轻量在线服务 |

## 引用

- [7] https://github.com/sgl-project/sglang/blob/main/README.md — SGLang README
- [10] https://github.com/sgl-project/sglang/blob/main/experimental/sgl-router/README.md — SGLang router README
- [11] https://github.com/sgl-project/sglang/blob/main/sgl-model-gateway/README.md — SGLang model gateway README

上一篇：[04 性能优化、部署方式与工程边界](/ai/03-frameworks/04/13/)

下一篇：[06 SGLang 与 vLLM、TensorRT-LLM、llama.cpp、Triton 的深度对比](/ai/03-frameworks/04/15/)
