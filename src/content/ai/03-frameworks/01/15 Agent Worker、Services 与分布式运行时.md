---
title: "Agent Worker、Services 与分布式运行时"
number: "03.01.15"
chapter: 3
chapterTitle: "Frameworks"
section: 1
sectionTitle: "Agent Frameworks"
group: "02 AutoGen"
created: 2026-09-03 19:10
author: "iopanda"
tags: ["course", "ai-agent", "framework", "autogen", "runtime", "services", "distributed"]
sourceId: "3.10.3.1 Agent Frameworks/02 AutoGen/04 Agent Worker、Services 与分布式运行时"
---
# Agent Worker、Services 与分布式运行时

> 如果只看 AgentChat，AutoGen 很像一个“多角色对话框架”；但继续往设计文档里看，尤其是 `Services.md`，你会发现它其实还有一套更大的野心：**把 Agent system 看成一组 workers 加若干 supporting services 组成的 runtime。** 文档明确说，AutoGen agent systems 可以同进程，也可以分布式；workers 与 services 在分布式下通过 gRPC 通信，事件统一包装为 CloudEvents；backend 可以是 in-memory，也可以走更重的分布式路径。[40] 这一章就讲这一层：为什么 AutoGen 不只是“多 Agent chat”，而是在尝试把多 Agent 做成一个可扩展、可分布式的系统运行时。

**学习目标**：学完本章，你将能够——

1. 解释 AutoGen 为什么会引入 workers、services、gateway、event bus 这些系统级概念；
2. 理解为什么同进程与分布式运行在 AutoGen 里只是部署层变化，不是编程模型突变；
3. 说出 CloudEvents、gRPC、message session state 在运行时里的职责；
4. 比较 AutoGen 这种 runtime 视角与 [LangGraph](/iopanda-blog/ai/03-frameworks/01/03/)、[OpenAI Agents SDK](/iopanda-blog/ai/03-frameworks/01/25/) 的差异；
5. 为一个可能扩展到多进程/多语言的 Agent 系统画出 runtime 结构图。

## 1. 概念：AutoGen 不只在造 Agent，也在造 Agent runtime

`Services.md` 的第一段就很说明问题：每个 AutoGen agent system 有一个或多个 Agent Workers，以及一组管理/支持 agents 的 services；这些东西可以同进程，也可以分布式；在所有情况下，events 都包装成 CloudEvents。[40]

这句话的分量很重，因为它说明框架关心的不是：
- 你有没有几个角色；
而是：
- 这些角色如何被托管；
- 如何通讯；
- 如何跨进程；
- 如何保持统一事件模型。

这已经明显超出“聊天框架”的范畴，更像 runtime architecture 了。

## 2. Agent Worker：为什么它比“一个 Agent 实例”更像系统单元

在 AutoGen 的 runtime 视角里，Worker 的意义大致相当于：
- 承载 agent 执行；
- 连接消息流；
- 对外通过 runtime/service/gateway 协同；
- 在分布式时成为真正的部署单元。[40]

这和只在代码里 new 几个 agent object 很不一样。因为一旦概念升级到 Worker，系统就开始关心：
- agent 是在哪里运行的；
- 它的消息怎样进出；
- 它是否跨语言或跨机器；
- 它的状态如何保存和迁移。

这说明 AutoGen 对“扩展性”的理解从一开始就偏系统工程。

## 3. Services：为什么支撑多 Agent 的不只是 agents 自己

文档列出 services/gateway/message session state 这些概念时，实际在提醒你：
**复杂多 Agent 系统需要一圈外部系统来支撑，而不是只靠 agent 自己互相说话。**[40]

至少包括：
- agent registry
- message/session state
- event bus bridge
- RPC gateway
- 分布式消息递送支持

这和很多“把多个模型摆在一起聊”式 demo 的根本差别就在这里：
- demo 把复杂度埋在代码里；
- AutoGen 试图把复杂度抽到运行时服务层。

## 4. CloudEvents：为什么消息格式标准化是跨系统协作的前提

`Programming Model` 文档已经说明，AutoGen 事件使用 CloudEvents 规范。[8] `Services.md` 又再次确认：不论同进程还是分布式，events 都是 CloudEvents。[40]

这件事特别重要，因为它意味着：
- 事件是可跨语言理解的；
- 事件不仅仅给某个本地 Python 对象看；
- 系统的协作语义试图摆脱“框架内私有消息格式”的局限。

对架构师来说，这非常值钱。因为标准化消息模型会直接影响：
- 多语言 agent 互通；
- 外部系统能否参与消息链；
- 事件审计与桥接是否容易；
- 未来是否能替换或扩展底层服务。

## 5. 同进程 vs 分布式：为什么编程模型尽量不变很关键

AutoGen 设计里一个很成熟的点是：
- 同进程时，通信和事件投递走内存；
- 分布式时，workers 通过 gRPC 与 service 通信；
- 但上层 agent/message/handler 思想尽量保持一致。[40]

这很重要，因为它在保护开发者心智：
- 你可以先在单进程里做实验；
- 未来再按需求迁到分布式；
- 不至于每次扩展部署形态都要重写整个协作模型。

这也是 AutoGen 从一开始就比很多实验性多 Agent demo 更“系统”的地方。

## 6. Gateway / Session State：为什么它们说明 AutoGen 在认真看“运营中的系统”

文档里提到 gateway 提供：
- 其他服务 API 的 RPC bridge；
- workers 与 event bus 的 RPC bridge；
- message session state 跟踪消息队列与投递。[40]

这些词说明它关心的是已经运营起来的系统，而不是只关心本地 demo。因为一旦系统真的运行在：
- 多 worker
- 多用户
- 多轮消息
- 跨服务协作
环境里，message session state 就不再是附属信息，而是决定：
- 哪条消息已投递；
- 哪条消息在排队；
- 哪个会话走到哪里；
- 哪个 worker 应继续接哪段流。

这说明 AutoGen 在 runtime 层的想象力其实很大。

## 7. 这和 LangGraph / OpenAI Agents SDK 的差异是什么

| 框架 | 最像哪种 runtime 视角 | AutoGen 的不同 |
|---|---|---|
| LangGraph | 图执行与状态恢复 runtime | AutoGen 更像消息驱动、worker/service runtime |
| OpenAI Agents SDK | 产品化 agent runtime primitives | AutoGen 更像分布式协作系统 runtime |
| CrewAI | 业务角色与流程系统 | AutoGen 更偏 runtime/message/system 抽象 |

一句话：LangGraph 像状态机运行时，OpenAI Agents SDK 像产品 runtime，AutoGen 则更像**消息协作系统 runtime**。

## 8. 为什么这层设计既先进，也让它更难维护

先进的地方：
- 能承接大规模协作想象；
- 更适合研究分布式/跨语言 agent systems；
- 编程模型有机会从单机延展到系统级。

难维护的地方：
- 心智负担很重；
- 同时要理解 agent 协作和 runtime 服务层；
- 生产治理、调试、运维成本更高；
- maintenance mode 后，这类大 runtime 想象的后续演进更依赖继任者或自维护。

也就是说，AutoGen 最迷人的地方，也是它最容易让团队低估成本的地方。

## 9. 动手活动：为一个分布式课程助教画 runtime 图

> [!example] 动手活动：输出 `autogen-runtime-map.md`
>
> **目标**：不要只画几个角色，而是画 worker / service / gateway / event bus 的结构。
>
> **步骤**：
> 1. 画 3 类 agent workers：研究、回答、审查；
> 2. 画 supporting services：registry、session state、event bus bridge；
> 3. 标哪些事件在同进程可内存走，哪些未来可能经 gRPC 走；
> 4. 标 CloudEvents 在哪里定义消息语义；
> 5. 写一句结论：系统复杂度主要来自角色数，还是来自 runtime 层。
>
> **完成标准**：你能清楚说出“为什么这已经不是几个 agent 对话那么简单”。

## 10. 边界与排错

- **误区一：分布式只是部署问题。** 在多 Agent 系统里，runtime 模型会直接影响架构；
- **误区二：有 message handler 就天然能跨服务。** 还需要统一事件语义与服务边界；
- **误区三：同进程跑通就等于系统设计合理。** 分布式一来，隐式约定会被放大；
- **误区四：gateway/session state 只是运维细节。** 它们恰恰定义了运营中的系统行为；
- **误区五：框架愿景大就代表适合每个团队。** 愿景越大，心智和维护成本也越高。

## 11. 总结

| 关键问题 | 一句话 |
|---|---|
| AutoGen 在 runtime 层更像什么 | 一个 agent workers + services 的消息协作系统 |
| Worker 的意义 | 把 agent 从代码对象提升为运行单元 |
| Services 的意义 | 把 registry、gateway、session state、event bus 支撑显式化 |
| CloudEvents 的意义 | 让事件语义跨进程、跨语言可统一 |
| 同进程/分布式差异 | 部署形态可变，但消息/事件编程模型尽量连续 |
| 最大代价 | 系统心智和维护复杂度都很高 |

**思考题**：为什么一个框架如果从 Day 1 就认真考虑 workers、services、gateway、session state 和 CloudEvents，会比普通多 Agent demo 更有系统潜力，但也更容易让团队掉进“过早复杂化”的坑？

> [!note] 参考答案
> 因为它解决的是更大尺度的问题：不是“几个 agent 能不能合作”，而是“这套协作能不能成为运行中的系统”。这当然更有潜力，但也意味着团队必须更早面对协议、服务边界、消息语义、部署与运维成本。如果需求还停留在单机实验阶段，这套复杂度很可能是过早引入的负担；只有当系统真的朝分布式、多语言或大规模协作方向演进时，这些抽象才开始真正值回票价。

## 引用

- [8] https://raw.githubusercontent.com/microsoft/autogen/main/docs/design/01%20-%20Programming%20Model.md — AutoGen programming model
- [40] https://raw.githubusercontent.com/microsoft/autogen/main/docs/design/05%20-%20Services.md — AutoGen services design
- [2] https://github.com/microsoft/autogen — AutoGen GitHub

上一篇：[03 AgentChat、RoutedAgent 与消息协议](/iopanda-blog/ai/03-frameworks/01/14/)——消息协议层立住后，本篇继续往更大的 runtime 图景推进。

下一篇：[05 课程助教 Agent 的 AutoGen 架构案例](/iopanda-blog/ai/03-frameworks/01/16/)——把协议与 runtime 结构重新落回课程助教这个真实系统。
