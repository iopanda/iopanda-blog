---
title: "多 Agent 会话与事件驱动"
number: "03.01.12"
chapter: 3
chapterTitle: "Frameworks"
section: 1
sectionTitle: "Agent Frameworks"
group: "02 AutoGen"
created: 2026-09-03 14:33
author: "iopanda"
tags: ["course", "ai-agent", "framework", "autogen", "multi-agent"]
sourceId: "3.10.3.1 Agent Frameworks/02 AutoGen/01 多 Agent 会话与事件驱动"
---
# 多 Agent 会话与事件驱动

> 如果说 [LangGraph 的第一性问题](/ai/03-frameworks/01/04/) 是“复杂流程如何变成图”，那么 AutoGen 的第一性问题则是：**复杂任务能否拆给多个会协作的角色，通过对话与消息流共同完成？** AutoGen 论文标题就叫“Enabling Next-Gen LLM Applications via Multi-Agent Conversation”，而官方设计文档进一步说明：其 programming model 本质上是 publish-subscribe，Agent 订阅自己关心的事件，也发布其他 Agent 关心的事件。[1][2][3] 这两层——上层对话协作、下层事件驱动——共同构成了 AutoGen 的真正独特性。

**学习目标**：学完本章，你将能够——

1. 解释 AutoGen 为什么会把“会话”当成多 Agent 系统的主舞台；
2. 说出它的上层 AgentChat 和下层 event-driven / pub-sub 编程模型分别在解决什么问题；
3. 理解 `RoutedAgent`、message handler、事件类型这些源码入口在表达什么；
4. 比较 AutoGen 的协作模型与 [CrewAI](/ai/03-frameworks/01/18/)、[OpenAI Agents SDK](/ai/03-frameworks/01/25/) 的区别；
5. 判断多 Agent 协作何时是在降复杂度，何时是在制造复杂度。

## 1. 概念：AutoGen 的默认世界观是“角色通过消息协作”

- AutoGen 不是先问“一个 Agent 如何调用更多工具”，而是先问“多个 Agent 能不能像团队一样协作”。[1][3]
- 论文与文档共同传递的世界观是：
  - 复杂任务可以拆分为不同角色；
  - 不同角色通过对话交换中间结果；
  - 会话本身就是编排机制的一部分。
- 这和传统单 Agent 系统差别很大：
  - 单 Agent 里，复杂度主要存在于一个上下文窗口；
  - AutoGen 里，复杂度被搬运到多个角色之间的消息传播里。

它的优点也因此非常直接：很多复杂任务天然就像组织协作，而不像单线程状态机。

## 2. 为什么这条路在 2023~2026 年影响巨大

AutoGen 之所以重要，不仅因为它火过，更因为它把几个后来几乎变成公共语言的概念提前做成了代码体验：

1. 专家代理：数学专家、写作专家、执行代理；
2. 用户代理：把人类也作为协作节点；
3. 审稿代理：让一个 Agent 评另一个 Agent；
4. 工具代理：把工具或外部服务包成特定角色；
5. 代理间委托：一个代理发现自己不擅长，就让别的代理接手。

很多今天看起来“很自然”的多 Agent 设计直觉，其实都是被这条路线放大并普及的。

但影响巨大不代表没有代价。恰恰相反，AutoGen 非常值得学习的一点，是它让我们更早看见了：**协作本身会制造新的系统复杂度。**

## 3. 上层：为什么 AgentChat 会这么有吸引力

官方 stable README 里的 quickstart、multi-agent orchestration 示例，都明显偏向会话式协作。[1] 这也是很多开发者第一次接触 AutoGen 时最直观的体验：

- 定义几个角色；
- 让它们互相发送消息；
- 观察它们围绕任务来回协作。

这种体验之所以有吸引力，是因为它非常接近人类直觉：
- 研究员找资料；
- 作者写草稿；
- 审稿人挑错；
- 用户代理或管理员决定是否继续。

相比之下，很多状态机或 workflow 框架在第一眼体验上没有这么“活”。AutoGen 把 Agent 系统变成了一场可见的协作过程，这正是它的教学价值所在。

## 4. 下层：为什么它其实是事件系统，而不是“高级群聊”

AutoGen 的 programming model 设计文档说得非常明白：它本质上是 publish-subscribe；事件定义使用 CloudEvents；每个 Agent 有一组 event handlers，绑定到某些 event type；Agent 也可以发布别的事件。[2]

这说明：

- 会话只是上层表现；
- 真正的系统语义，是**事件在角色之间流动**。

从架构角度看，这种设计特别有启发：

| 表层现象 | 底层实质 |
|---|---|
| 代理彼此对话 | 消息/事件路由 |
| 某个角色收到任务 | 某类事件被特定 handler 消费 |
| 代理把结果发给下一个 | 生产新事件交给别的订阅者 |
| 一个团队完成任务 | 一个事件流推动多个处理器协作 |

也就是说，AutoGen 的“多 Agent”并不只是多开几个模型，而是把 Agent system 解释为一套**事件驱动协作系统**。

## 5. 源码入口：`RoutedAgent` 和 message handler 暴露了什么设计思想

在 `autogen_core/_routed_agent.py` 里，可以清楚看到 `@message_handler` 装饰器的设计：[4]

- handler 必须有明确签名：`self, message, ctx`；
- message 类型需要 type hint；
- return 类型也需要 type hint；
- 可以为同一 message type 再加二次路由 `match`；
- strict 模式下，类型不对会直接报错。

这几个细节很关键：

1. **消息是协议，不是随手字符串。**
2. **角色行为是对消息类型的响应，不是无限自由聊天。**
3. **路由条件是显式的，而不是全靠 prompt 理解。**

所以 AutoGen 的深层设计，其实比很多“多 Agent 群聊 demo”严肃得多。它试图给协作加上类型、路由和处理器语义。

## 6. 为什么这种协作方式既强，也危险

### 6.1 强在哪里

- 对角色分工清晰的任务非常自然；
- 易于快速实验：只要角色定义合理，就能迅速得到可观察的协作轨迹；
- 很适合研究“多个代理之间如何互评、互补、互相纠错”。

### 6.2 危险在哪里

- 控制流容易变隐式：真正决定为什么继续或停止的逻辑，常埋在会话约定里；
- 成本容易失控：多个代理各自拉长上下文，token 消耗成倍放大；
- 责任边界容易模糊：到底是谁决定了最终动作，很难一眼说清；
- 失败恢复难度高：比起显式状态图，对话历史里的“系统状态”更难切片恢复。

这也是为什么后来很多团队从“多 Agent 群聊”慢慢回到更显式的 graph / workflow / typed runtime：不是多 Agent 错了，而是**隐式协作一旦进入生产就会遇到治理账单。**

## 7. 和同类框架相比，AutoGen 在“协作”这件事上的位置

| 框架 | 协作如何发生 | AutoGen 的特点 |
|---|---|---|
| AutoGen | 会话 + 事件传播 | 更像“角色通过消息达成任务” |
| [CrewAI](/ai/03-frameworks/01/18/) | 角色团队 + tasks/process | 更业务流程化，协作语义更产品化 |
| [OpenAI Agents SDK](/ai/03-frameworks/01/25/) | handoff / agent-as-tool | 协作更受控，更像委托关系 |
| [LangGraph](/ai/03-frameworks/01/03/) | 状态图节点与边 | 更像状态迁移，而不是会话传播 |

一句话：AutoGen 最强的时候，不是“当成生产平台”，而是“当成理解多 Agent 协作范式的显微镜”。

## 8. 动手活动：把课程助教需求改写成 AutoGen 协作图

> [!example] 动手活动：输出 `autogen-collaboration-plan.md`
>
> **目标**：把一个课程助教需求拆成角色协作，而不是先写状态图。
>
> **步骤**：
> 1. 定义角色：课程资料研究员、答案撰写员、合规审查员、用户代理；
> 2. 为每个角色说明：接收什么消息、产出什么消息；
> 3. 标出哪类消息触发审查员介入；
> 4. 指出哪些消息其实更像事件，而不是自然语言对话；
> 5. 写出一段结论：这个任务更适合会话协作，还是更适合显式流程。
>
> **完成标准**：你能清楚区分“角色分工”与“系统控制流”是两层不同问题。

## 9. 边界与排错

- **误区一：多 Agent 就是多开几个聊天窗口。** 真正值钱的是消息类型、路由与协作边界；
- **误区二：角色越多越高级。** 角色越多，消息复杂度和 token 成本也越高；
- **误区三：把对话当全部控制流。** 在实验里行，在生产里常常不够；
- **误区四：只看上层 AgentChat，不看底层事件语义。** 这样会误读框架设计；
- **误区五：觉得有 message handler 就天然可治理。** 协作仍需要权限、审计、人工确认和恢复策略。

## 10. 总结

| 关键问题 | 一句话 |
|---|---|
| AutoGen 的第一性问题是什么 | 多个角色能否通过消息协作完成复杂任务 |
| 上层看起来像什么 | 多 Agent 对话与协作 |
| 下层本质是什么 | publish-subscribe 的事件系统 |
| `RoutedAgent` 暴露了什么 | 消息有类型、handler 有协议、路由有显式条件 |
| 它的长处 | 多角色协作实验非常自然 |
| 它的隐患 | 控制流容易埋进会话，恢复与治理更难 |

**思考题**：如果一个系统的主要复杂度不是“谁和谁协作”，而是“什么时候暂停、从哪里恢复、哪一步必须人审”，为什么仅靠多 Agent 会话往往不够？这是否说明 AutoGen 不适合生产？

> [!note] 参考答案
> 这说明系统复杂度已经从“角色协作”转移到了“控制流治理”。多 Agent 会话擅长拆分专长，但不天然擅长显式表达恢复、人审和分支状态，因此仅靠会话模型常常不够。这并不等于 AutoGen 完全不适合生产，而是说明：若系统主矛盾变成状态、恢复和治理，就要补显式编排层，或考虑迁向更契合 تلك类复杂度的框架。框架是否适合生产，取决于主矛盾是否与其第一性抽象匹配。

## 引用

- [1] https://microsoft.github.io/autogen/stable — AutoGen stable docs
- [2] https://raw.githubusercontent.com/microsoft/autogen/main/docs/design/01%20-%20Programming%20Model.md — AutoGen programming model
- [3] https://arxiv.org/abs/2308.08155 — AutoGen paper
- [4] https://github.com/microsoft/autogen — AutoGen GitHub

上一篇：[02 AutoGen](/ai/03-frameworks/01/11/)——总览篇先讲它在生态史上的位置；本篇开始拆它真正的协作模型。

下一篇：[02 维护模式、迁移与遗留系统治理](/ai/03-frameworks/01/13/)——理解完协作范式后，必须面对 2026 年的现实问题：为什么新项目要谨慎，旧项目该怎么迁。
