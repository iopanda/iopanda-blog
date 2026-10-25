---
title: "agent 推理、tool use 与 workflow control"
number: "03.04.12"
chapter: 3
chapterTitle: "Frameworks"
section: 4
sectionTitle: "Inference and Serving Frameworks"
group: "3.10.3.4.2 SGLang"
created: 2026-09-04 04:24
author: "iopanda"
tags: ["framework", "inference", "serving", "sglang", "agent", "tools"]
sourceId: "3.10.3.4 Inference and Serving Frameworks/3.10.3.4.2 SGLang/03 agent 推理、tool use 与 workflow control"
---
# agent 推理、tool use 与 workflow control

> SGLang 不只是做模型响应，它还非常明确地往 agent/workflow 方向长。README 直接提到 reasoning parsers、tool use、RL rollout backbone，[7] sgl-model-gateway README 则把 MCP、conversation storage、tool parser、reasoning parser、router policies 放到了正式控制面里。[11] 这说明它在尝试回答的问题是：**当模型不是单轮回答器，而是工作流参与者时，runtime 应该长成什么样。**

**学习目标**：学完本章，你将能够——
1. 理解为什么 SGLang 特别适合 agentic serving；
2. 说出 tool parsing、reasoning parsing、conversation storage 的系统意义；
3. 理解 router / gateway / MCP 为什么会成为运行时一部分；
4. 判断什么时候系统需要 workflow-aware serving；
5. 为 agent 服务写一张 runtime-control card。

## 1. agent serving 的主语不再只是 token

一旦系统进入 agent/workflow 场景，关键对象会变成：
- 会话状态；
- 工具调用；
- reasoning 抽取；
- 多轮路由；
- 外部能力接入。

这时，如果 serving engine 只会“收 prompt、吐文本”，应用层会很快被胶水逻辑淹没。

## 2. SGLang 在把哪些东西往 runtime 里收

sgl-model-gateway README 里已经给出一长串非常清楚的东西：[11]
- reasoning parser
- function/tool parser
- conversation storage
- MCP client integration
- rate limiting / retries / circuit breakers
- per-model policies
- PD serving topologies

这说明它不是只把 agent 当调用方，而是把 agentic serving 作为一等公民。

## 3. router 为什么重要

experimental/sgl-router README 说明它是 KV-aware、OpenAI-compatible router，并且能按 worker、cache、prefill/decode 进行路由。[10]

这很关键，因为 agent/workflow 系统经常会出现：
- 不同请求阶段有不同资源形态；
- 同一模型多 worker；
- prefix / cache 命中影响调度策略；
- 单模型下也需要 smarter routing。

## 4. MCP 与 conversation storage 为什么特别说明问题

这两点其实说明了 SGLang 的 ambition：
- 模型不只是文本生成器；
- runtime 需要管理工具与状态边界；
- 多轮和外部能力接入，不应全由上层业务代码裸管。[11]

## 5. 动手活动

> [!example] 动手活动：输出 `sglang-agent-serving-card.md`
>
> 列你的系统是否需要：tool parsing、reasoning 分离、conversation storage、MCP、router policy。写一句结论：你的复杂度主要住在模型生成，还是住在 agent workflow。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| 为什么 SGLang 适合 agentic serving | 因为它把工具、状态、路由、解析一起拉进 runtime |
| router 的意义 | 让 serving 按 cache、worker、PD 拓扑进行更聪明调度 |
| MCP / storage 的意义 | 把多轮与工具边界正式化 |
| 最大价值 | 降低 agent 系统对应用层胶水代码的依赖 |

## 引用

- [7] https://github.com/sgl-project/sglang/blob/main/README.md — SGLang README
- [10] https://github.com/sgl-project/sglang/blob/main/experimental/sgl-router/README.md — SGLang router README
- [11] https://github.com/sgl-project/sglang/blob/main/sgl-model-gateway/README.md — SGLang model gateway README

上一篇：[02 serving、program execution 与结构化输出](/ai/03-frameworks/04/11/)

下一篇：[04 性能优化、部署方式与工程边界](/ai/03-frameworks/04/13/)
