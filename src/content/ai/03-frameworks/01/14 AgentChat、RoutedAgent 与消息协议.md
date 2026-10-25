---
title: "AgentChat、RoutedAgent 与消息协议"
number: "03.01.14"
chapter: 3
chapterTitle: "Frameworks"
section: 1
sectionTitle: "Agent Frameworks"
group: "02 AutoGen"
created: 2026-09-03 19:00
author: "iopanda"
tags: ["course", "ai-agent", "framework", "autogen", "agentchat", "routedagent", "message-protocol"]
sourceId: "3.10.3.1 Agent Frameworks/02 AutoGen/03 AgentChat、RoutedAgent 与消息协议"
---
# AgentChat、RoutedAgent 与消息协议

> 前两篇已经把 AutoGen 的大轮廓立住了：[多 Agent 会话与事件驱动](/iopanda-blog/ai/03-frameworks/01/12/)解释了它为什么在 2023~2026 年影响巨大，[维护模式与迁移](/iopanda-blog/ai/03-frameworks/01/13/)解释了为什么今天要谨慎看待它。现在该往下钻到更具体的技术层：**AutoGen 的多 Agent 协作到底是怎么落到代码里的？** 从 docs 和源码看，它至少有两层关键技术面：上层是 AgentChat 这类面向对话编排的抽象，下层是 `RoutedAgent`、`message_handler`、runtime、topic、message context 这些更像事件系统协议的东西。[7][37][38] 这一章就专门讲这部分：为什么 AutoGen 看起来像聊天团队，但源码骨架其实很像消息总线系统。

**学习目标**：学完本章，你将能够——

1. 解释 AgentChat 与 Core runtime 在 AutoGen 里的分工；
2. 理解 `RoutedAgent`、`message_handler`、topic、MessageContext 在协作系统里的职责；
3. 说明为什么消息在 AutoGen 里更像协议，而不是自由文本；
4. 比较 AutoGen 的消息协作模型与 [OpenAI Agents SDK](/iopanda-blog/ai/03-frameworks/01/25/) 的 handoff 模型差异；
5. 为一个多 Agent 系统画出“会话层 + 消息协议层”的双层结构图。

## 1. 概念：AgentChat 是表层体验，Core runtime 才是骨架

AutoGen 一个很容易被误读的地方是：很多人第一次见到它，是通过 AssistantAgent、GroupChat、UserProxy 这类“对话角色”示例，于是以为 AutoGen 的本体就是一套更会聊天的 agent 库。

其实不是。

更准确的理解是：
- AgentChat 负责“你如何直观地组织会话协作”；
- Core runtime 负责“这些协作如何被路由、订阅、分发、调度和持久理解”。

也就是说：
- AgentChat 是舞台表现；
- Core runtime 是后台机械装置。

## 2. `RoutedAgent`：为什么这个名字本身就暴露了框架的本质

`autogen_core/_routed_agent.py` 这个文件名就已经说明很多问题了。[37]

它不叫：
- `chat_agent.py`
- `conversation_agent.py`
- `llm_agent.py`

而叫 `RoutedAgent`。

这背后的工程判断很明确：**Agent 的核心职责不是“会说话”，而是“能正确接收、处理、再发出消息”。**

这让 AutoGen 从一开始就不像单纯 prompt framework，而更像一个：
- 消息处理系统
- 事件订阅系统
- 分布式协作系统

## 3. `message_handler`：为什么 handler 的签名和类型这么重要

在 `_routed_agent.py` 里，`@message_handler` 要求的东西非常工程化：[37]
- 必须是 async 方法；
- 必须有 `self, message, ctx` 这类明确签名；
- message 类型要有 type hints；
- return 类型也要有 type hints；
- 还可以通过 `match` 做二次路由。

这说明三件事：

1. **消息不是随便来一段字符串**；
2. **处理器不是自由 prompt，而是带协议的 handler**；
3. **路由不是全靠模型“理解场景”，而是能落到代码规则。**

这正是 AutoGen 最被低估的地方：它看起来像聊天系统，底层却很强调协议性。

## 4. topic / subscription：为什么它比“谁回复谁”更底层

在 docs/tutorial 以及测试/样例里，AutoGen 不断出现 topic、default subscription、publish message 这些词。[7][37]

这说明协作不是靠“角色之间互相 @”实现的，而是靠：
- 订阅某类消息；
- 在某个 topic 上发布消息；
- 由 runtime 负责把消息送到对应 agent/handler。

换句话说，AutoGen 角色表面上像在聊天，实际上底层更像：
- message bus
- pub-sub system
- event router

这和很多只会把上下文传来传去的“多 Agent demo”完全不是一个严肃程度。

## 5. AgentChat：为什么它对开发者如此有吸引力

虽然底层很工程化，但 AutoGen 没要求所有人一开始都面对 runtime internals。AgentChat 的价值就是：
- 给你更直观的多角色体验；
- 让你先看见协作；
- 让你更容易实验 group chat、用户代理、专家代理、handoff message 等模式。[38]

这也是它当年火起来的原因：
- 不是所有人都先关心消息总线；
- 大家先关心“能不能让几个角色合作”；
- AgentChat 恰好让这件事足够好理解。

所以它的成功，很大程度上来自这层“降低协作心智门槛”的设计。

## 6. 为什么它同时强大又危险

### 强大

- 多角色模式很自然；
- 更容易实验专家分工；
- 更适合研究“协作是否比单体更强”；
- 底层协议性又足够强，不只是 prompt 堆砌。

### 危险

- 表层太像聊天，容易让人忘记底层其实是复杂 runtime；
- 控制流容易从显式规则退化成会话习惯；
- 角色一多，谁负责什么开始变得模糊；
- 如果只用 AgentChat，不理解 Core runtime，系统演化时很容易失控。

也就是说，AutoGen 最危险的地方不是它不够强，而是它太容易让人只看到“会聊”的那一面。

## 7. 和 OpenAI Agents SDK、CrewAI 的差异

| 框架 | 协作表层像什么 | 底层组织方式更像什么 |
|---|---|---|
| AutoGen | 多角色会话 | pub-sub / routed message system |
| [OpenAI Agents SDK](/iopanda-blog/ai/03-frameworks/01/25/) | triage + specialist | runtime primitives + handoff ownership |
| [CrewAI](/iopanda-blog/ai/03-frameworks/01/18/) | 角色团队 | role/task/flow 业务组织系统 |

一句话：
- AutoGen 更像“让一组角色通过消息总线彼此协作”；
- OpenAI Agents SDK 更像“让一组 specialist 在 runtime 内受控接管”；
- CrewAI 更像“把组织结构直接翻译成 agent system”。

## 8. 给开发者和架构师的真正启示

如果你是开发者，AutoGen 给你的启示是：
- 多 Agent 协作最好不要只停在 prompt 层；
- 一旦上工程，就需要 message、handler、context、routing 这些协议概念。

如果你是架构师，AutoGen 给你的启示是：
- 会话只是表层；
- 真正复杂的是消息语义与协作协议；
- 如果这层不显式，系统很快就会变成“会跑但说不清怎么跑”。

## 9. 动手活动：为课程助教画一张“会话层 + 协议层”双层图

> [!example] 动手活动：输出 `autogen-two-layer-map.md`
>
> **目标**：别只画角色聊天图，而是同时画出底层消息协议层。
>
> **步骤**：
> 1. 表层画角色：研究员、撰写员、审查员、用户代理；
> 2. 底层画消息：问题消息、资料消息、审查消息、停止消息；
> 3. 标每类消息由谁订阅、谁发布；
> 4. 标哪些消息会触发工具、哪些消息会触发人工；
> 5. 写一句结论：为什么“看起来像聊天”并不代表本质是聊天。
>
> **完成标准**：别人能从你的图里同时看懂“角色如何交流”和“系统如何路由消息”。

## 10. 边界与排错

- **误区一：把 AgentChat 当 AutoGen 全部。** 它只是更友好的入口；
- **误区二：有 handler 就天然可治理。** 若消息语义和停止条件不清，系统照样混乱；
- **误区三：topic/subscription 只是实现细节。** 它们其实定义了协作拓扑；
- **误区四：会话自然就代表架构自然。** 自然不等于可恢复、可追责；
- **误区五：看到消息总线就以为它一定适合一切系统。** 若主矛盾是显式状态与恢复，其他框架可能更合适。

## 11. 总结

| 关键问题 | 一句话 |
|---|---|
| AutoGen 的表层是什么 | 多角色会话协作 |
| AutoGen 的骨架是什么 | RoutedAgent + message handler + pub-sub 协议 |
| `message_handler` 的意义 | 让协作从自然语言习惯变成带类型和规则的处理器系统 |
| topic/subscription 的意义 | 定义谁接收什么消息、谁参与哪条协作链 |
| 最大优点 | 多 Agent 协作既直观又有底层协议支撑 |
| 最大风险 | 太容易只看到“会聊”，忽略底层复杂 runtime |

**思考题**：为什么一个“表面上很像聊天团队”的系统，如果底层其实是复杂的消息路由和订阅网络，就必须比普通聊天机器人更认真地做协议设计？如果不做，会先坏在哪一层？

> [!note] 参考答案
> 因为这类系统真正依赖的不是模型能不能说，而是消息能否被正确理解、送达、处理和终止。若协议不清，最先坏掉的通常不是回答质量，而是协作语义：谁该接消息、何时停止、谁能触发副作用、哪些消息代表失败或转人工，都会变得模糊。表面上像聊天，底层却像分布式系统；不按分布式系统的纪律设计协议，迟早出问题。

## 引用

- [7] https://microsoft.github.io/autogen/stable — AutoGen stable docs
- [37] https://github.com/microsoft/autogen/blob/main/python/packages/autogen-core/src/autogen_core/_routed_agent.py — AutoGen routed agent source
- [38] https://github.com/microsoft/autogen/tree/main/python/packages/autogen-agentchat/src/autogen_agentchat — AutoGen AgentChat source tree

上一篇：[02 维护模式、迁移与遗留系统治理](/iopanda-blog/ai/03-frameworks/01/13/)——维护现实讲完后，本篇回到技术骨架，拆 AutoGen 到底是怎样运转的。

下一篇：[04 Agent Worker、Services 与分布式运行时](/iopanda-blog/ai/03-frameworks/01/15/)——协议层立住后，下一篇继续看它如何向 worker、service、gateway 和分布式 runtime 扩展。
