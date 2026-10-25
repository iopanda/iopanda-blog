---
title: "AutoGen"
number: "03.01.11"
chapter: 3
chapterTitle: "Frameworks"
section: 1
sectionTitle: "Agent Frameworks"
group: "02 AutoGen"
created: 2026-09-03 13:25
author: "iopanda"
tags: ["course", "ai-agent", "framework", "autogen"]
sourceId: "3.10.3.1 Agent Frameworks/02 AutoGen/README"
---
# AutoGen

> 如果说 [LangGraph](/iopanda-blog/ai/03-frameworks/01/03/) 代表的是“把复杂 Agent 写成状态图”，那么 AutoGen 代表的就是另一条同样深刻的路线：**把复杂任务拆给多个会对话、会分工、会互相转交工作的角色。** 这条路线对 2023~2026 的 Agent 生态影响极大，很多今天仍在流行的概念——专家代理、评审代理、代理间协作、工具化子代理——都能在 AutoGen 的世界观里找到早期成型版本。[2][9] 但与其他四个框架不同，AutoGen 在 2026 年已经进入 maintenance mode，官方明确建议新用户转向 Microsoft Agent Framework。[2][7][10] 所以本章的重点不是“盲目推荐 AutoGen”，而是讲清它为什么重要、它解决了什么问题、以及为什么架构师在 2026 年还需要读懂它。

**学习目标**：学完本章，你将能够——

1. 解释 AutoGen 为什么是多 Agent 协作框架史上的关键坐标；
2. 说出 AutoGen 的两层设计：上层会话式 AgentChat，下层事件驱动/发布订阅编程模型；
3. 说明为什么它擅长快速实验多角色协作，却不再是多数绿地项目的默认首选；
4. 区分 AutoGen 与 [CrewAI](/iopanda-blog/ai/03-frameworks/01/18/)、[OpenAI Agents SDK](/iopanda-blog/ai/03-frameworks/01/25/)、[LangGraph](/iopanda-blog/ai/03-frameworks/01/03/) 的协作模型差异；
5. 为一个遗留 AutoGen 项目写出“保留 / 迁移 / 重构”的判断卡。

## 1. 概念：AutoGen 的核心不是“一个 Agent”，而是“多个角色之间的可编排会话”

- AutoGen 的公开定位是：一个用于创建多 Agent AI 应用的框架，Agent 可以自治，也可以与人类协同工作。[2][7]
- 这句话要抓住两个关键词：
  1. **multi-agent**：它默认你的系统不是单个智能体，而是一组角色；
  2. **work alongside humans**：人类不是框架外的临时补丁，而是协作对象。
- 早期很多开发者第一次接触 AutoGen，真正感受到的新东西并不是“模型能调工具”，而是“研究员、程序员、审稿人、用户代理居然可以彼此说话，并围绕一个任务形成协作回路”。
- 这和单 Agent world view 很不一样：
  - 单 Agent 关注一个智能体如何调用工具；
  - AutoGen 关注多个角色如何通过消息形成工作流。

从课程角度看，AutoGen 的最大价值在于：它帮助你理解**多 Agent 协作不是把几个模型摆在一起，而是要定义谁收消息、谁发消息、谁有权结束任务、谁负责调用外部工具。**

## 2. 为什么 AutoGen 当年会爆发：因为它把“多角色协作”从论文概念拉成了工程接口

AutoGen 的论文直接以 “Enabling Next-Gen LLM Applications via Multi-Agent Conversation” 为题，这本身就说明了它的时代任务：把 Agent system 从单轮 prompt 拉到多角色 conversation。[9]

为什么这件事重要？

- 单 Agent 容易把所有职责压在一个模型里：理解问题、找资料、写答案、审答案、调工具，全由一个上下文承担；
- 一旦任务复杂，单体 prompt 会越来越长，角色冲突、目标冲突、记忆污染也会越来越明显；
- 多角色拆分的直觉因此很自然：
  - 让研究员找资料；
  - 让作者写草稿；
  - 让评审者找错；
  - 让执行代理调工具。

AutoGen 的价值是把这种直觉变成可编程接口。对很多团队来说，它第一次让“多 Agent”从演示概念变成了可以真正写代码、打印消息、观察协作轨迹的东西。

但这个优点也埋下了后来的复杂度：**一旦系统默认靠消息和角色协作推进，控制流就容易从显式流程变成隐式对话。** 这也是为什么后来一部分团队转向 [LangGraph](/iopanda-blog/ai/03-frameworks/01/03/) 这类更显式的状态图，另一部分转向 [CrewAI](/iopanda-blog/ai/03-frameworks/01/18/) 这类更产品化的角色流程框架。

## 3. 架构：上层像聊天团队，下层其实是事件系统

很多人只记得 AutoGen 的聊天代理示例，却忽略了它更底层的编程模型。官方设计文档明确写道：AutoGen 的 programming model 基本上是 **publish-subscribe**，Agent 订阅自己关心的事件，也可以发布其他 Agent 关心的事件；事件采用 CloudEvents 规范表示。[8]

这意味着 AutoGen 实际有两层世界观：

| 层 | 你看到什么 | 实际解决什么问题 |
|---|---|---|
| 上层：AgentChat / 多角色会话 | 研究员、审稿人、用户代理彼此对话 | 快速搭建协作体验 |
| 下层：事件驱动 / pub-sub | 事件类型、处理器、路由、状态变化 | 让协作具备可编排性与扩展性 |

这种两层设计非常有启发：

- 对产品开发者，上层足够友好：你可以像设计组织结构那样设计一组代理；
- 对系统设计者，下层提供了一种更可扩展的解释：**Agent 协作本质上是事件在角色之间传播。**

换句话说，AutoGen 不是简单的“多窗口聊天”。它把消息当成系统总线，把角色当成事件消费者。这种视角和传统事件驱动架构之间是可以互通的。

## 4. 它和同类框架究竟怎么不一样

### 4.1 与 LangGraph 的区别

- AutoGen 默认从“谁和谁对话、谁帮谁完成任务”出发；
- [LangGraph](/iopanda-blog/ai/03-frameworks/01/03/) 默认从“系统有哪些节点和状态转移”出发；
- 前者更像在设计组织协作，后者更像在设计状态机。

结果是：

- 要快速实验多角色协作，AutoGen 很自然；
- 要做长流程恢复、人工中断、显式状态审计，LangGraph 通常更直观。

### 4.2 与 CrewAI 的区别

- AutoGen 强调多 Agent conversation 的研究与抽象演化；
- [CrewAI](/iopanda-blog/ai/03-frameworks/01/18/) 则更强调 role-based collaboration 的业务落地，把 Agent、Task、Crew、Flow 做成更直接的产品语义。[3][12][13][14]
- 你可以把它理解为：
  - AutoGen 更像“多 Agent 研究平台”；
  - CrewAI 更像“角色团队自动化平台”。

### 4.3 与 OpenAI Agents SDK 的区别

- AutoGen 的一等公民是“代理之间如何互相说话”；
- [OpenAI Agents SDK](/iopanda-blog/ai/03-frameworks/01/25/) 的一等公民则是“现代 Agent 运行时该默认内置哪些原语：tools、handoffs、guardrails、sessions、tracing”。[15][16][17][18]
- AutoGen 让你先看见“协作”；OpenAI Agents SDK 让你先拿到“一整盒当代基础设施”。

### 4.4 与 PydanticAI 的区别

- AutoGen 的组织方式是角色与消息；
- [PydanticAI](/iopanda-blog/ai/03-frameworks/01/32/) 的组织方式是类型、依赖和可验证输出。[19][20][23]
- 所以一个重 Python 后端工程纪律的团队，常常会觉得 PydanticAI 更贴近日常工程；而一个要快速验证多 Agent 对话分工的团队，会更容易从 AutoGen 起步。

## 5. 2026 年为什么还要学它：因为它“过时得很有价值”

AutoGen 在 2026 年的官方 README 明确给出 caution：项目进入 maintenance mode，不再接收新特性，建议新用户从 Microsoft Agent Framework 开始。[2][10] 这不是小注脚，而是架构判断的核心依据。

那为什么还值得学？

1. **它定义了一个时代的问题意识**：很多后来的框架，其实都是在修正或收敛 AutoGen 暴露出的复杂度；
2. **它仍有大量存量项目**：会有真实团队需要维护、收敛、迁移，而不是从零造绿地新系统；
3. **它是理解多 Agent 协作的好教材**：特别适合帮助你看清“协作”到底增加了什么价值，也增加了什么风险。

所以对 2026 年的开发者和架构师，正确态度不是“用不用 AutoGen”，而是：

- 如果你接手旧系统，要会读、会改、会评估迁移成本；
- 如果你做新系统，要知道它贡献了什么思想，但不要无视官方维护状态去盲选。

## 6. 什么时候适合保留，什么时候该迁移

| 场景 | 建议 | 理由 |
|---|---|---|
| 现有系统稳定、已跑在线上、改动少 | 谨慎保留 | 迁移成本可能大于短期收益 |
| 正在快速扩张新能力、需要长期支持 | 评估迁移 | maintenance mode 意味着未来能力和生态会变弱 |
| 纯新项目、无历史包袱 | 优先看别的框架 | 没必要主动把自己绑到维护模式项目上 |
| 研究/教学/复现多 Agent 协作 | 可以保留 | 它仍是讲多 Agent conversation 的好教材 |

迁移时最重要的不是“翻译 API”，而是识别你的系统真正依赖了 AutoGen 的哪一层：

- 只是依赖多角色协作概念？可迁到 CrewAI / OpenAI Agents SDK；
- 依赖事件驱动和复杂编排？可能更接近 LangGraph 或 Microsoft Agent Framework；
- 依赖 Python 工程类型与测试？PydanticAI 可能更合适。

## 7. 动手活动：给一个 AutoGen 存量项目做迁移体检

> [!example] 动手活动：输出 `autogen-migration-card.md`
>
> **目标**：对一个使用 AutoGen 的多 Agent 项目写一张迁移体检卡，而不是一上来就重构。
>
> **步骤**：
> 1. 列出现有角色：谁负责研究、谁负责写作、谁负责调用工具、谁负责审批；
> 2. 画出消息流：哪些代理互相通信、谁可以结束任务、谁能触发外部动作；
> 3. 标出隐式控制流：哪些逻辑只存在于提示词或会话约定里，而没有显式节点/规则；
> 4. 评估迁移方向：
>    - 若要更强状态控制与恢复，考虑 [LangGraph](/iopanda-blog/ai/03-frameworks/01/03/)；
>    - 若要更业务化的角色团队与流程，考虑 [CrewAI](/iopanda-blog/ai/03-frameworks/01/18/)；
>    - 若要现代工具/guardrails/runtime 原语，考虑 [OpenAI Agents SDK](/iopanda-blog/ai/03-frameworks/01/25/)；
> 5. 给出结论：保留 / 局部替换 / 全量迁移，并写明原因。
>
> **完成标准**：不是“把项目迁了”，而是能清楚回答「它今天为什么还活着、明天为什么该或不该迁」。

## 8. 边界与排错

- **误区一：历史重要 = 现在还该盲选。** 不对。技术史地位和绿地项目首选是两回事；
- **误区二：多 Agent 一定比单 Agent 强。** 很多时候只是把隐式复杂度从 prompt 移到代理间对话；
- **误区三：把对话当控制流。** 角色彼此说话很自然，但对架构师来说，自然不等于可治理；
- **误区四：迁移只看 API 名称。** 真正难的是把隐式协作契约迁成显式控制流、显式权限和显式审计；
- **误区五：忽略维护状态。** maintenance mode 不是情绪问题，而是风险信号：未来 bug、兼容性、生态演进都可能受影响。

## 9. 总结

| 关键问题 | 一句话 |
|---|---|
| AutoGen 是什么 | 多 Agent 协作框架先驱，把任务组织成角色之间的会话与事件 |
| 历史价值 | 它把多 Agent conversation 从论文直觉变成了工程接口 |
| 架构中心 | 上层会话式协作，下层事件驱动 / pub-sub 模型 |
| 今天的现实位置 | 重要，但已进入 maintenance mode；新项目应谨慎 |
| 你该怎么学它 | 学协作范式、学迁移判断，而不是把它当默认新项目模板 |

## 10. 本目录笔记导航

1. [01 多 Agent 会话与事件驱动](/iopanda-blog/ai/03-frameworks/01/12/)
2. [02 维护模式、迁移与遗留系统治理](/iopanda-blog/ai/03-frameworks/01/13/)
3. [03 AgentChat、RoutedAgent 与消息协议](/iopanda-blog/ai/03-frameworks/01/14/)
4. [04 Agent Worker、Services 与分布式运行时](/iopanda-blog/ai/03-frameworks/01/15/)
5. [05 课程助教 Agent 的 AutoGen 架构案例](/iopanda-blog/ai/03-frameworks/01/16/)
6. [06 AutoGen 与 LangGraph、CrewAI、OpenAI Agents SDK、PydanticAI 的深度对比](/iopanda-blog/ai/03-frameworks/01/17/)

**思考题**：如果你接手一个 AutoGen 系统，线上主要问题不是“功能缺失”，而是“轨迹太难审计、人工确认点不清、失败恢复经常整轮重跑”，你会优先继续堆多角色提示词，还是考虑迁到更显式的状态编排框架？为什么？

> [!note] 参考答案
> 这类问题的根因往往不在“角色还不够多”，而在控制流与状态边界太隐式。继续堆多角色提示词，只会让协作逻辑进一步埋进对话。更合理的方向通常是：保留角色分工思想，但把状态、恢复、人审与权限迁到更显式的编排层，例如图式工作流或更现代的受控 SDK。迁移的目标不是减少 Agent 数量，而是让系统从“会聊”升级到“可治理”。

## 引用

- [2] https://github.com/microsoft/autogen — AutoGen GitHub
- [7] https://microsoft.github.io/autogen/stable — AutoGen stable docs
- [8] https://raw.githubusercontent.com/microsoft/autogen/main/docs/design/01%20-%20Programming%20Model.md — AutoGen programming model
- [9] https://arxiv.org/abs/2308.08155 — AutoGen paper
- [10] https://github.com/microsoft/agent-framework — Microsoft Agent Framework GitHub
- [3] https://github.com/crewAIInc/crewAI — CrewAI GitHub
- [12] https://raw.githubusercontent.com/crewAIInc/crewAI/main/docs/v1.15.18/en/concepts/agents.mdx — CrewAI agents concepts
- [13] https://raw.githubusercontent.com/crewAIInc/crewAI/main/docs/v1.15.18/en/concepts/crews.mdx — CrewAI crews concepts
- [14] https://raw.githubusercontent.com/crewAIInc/crewAI/main/docs/v1.15.18/en/concepts/flows.mdx — CrewAI flows concepts
- [15] https://openai.github.io/openai-agents-python — OpenAI Agents SDK docs
- [16] https://raw.githubusercontent.com/openai/openai-agents-python/main/docs/agents.md — OpenAI Agents core agents doc
- [17] https://raw.githubusercontent.com/openai/openai-agents-python/main/docs/handoffs.md — OpenAI Agents handoffs doc
- [18] https://raw.githubusercontent.com/openai/openai-agents-python/main/docs/guardrails.md — OpenAI Agents guardrails doc
- [19] https://pydantic.dev/docs/ai — Pydantic AI docs
- [20] https://raw.githubusercontent.com/pydantic/pydantic-ai/main/docs/agent.md — Pydantic AI agent doc
- [23] https://raw.githubusercontent.com/pydantic/pydantic-ai/main/docs/multi-agent-applications.md — Pydantic AI multi-agent applications doc

上一篇：[01 LangGraph](/iopanda-blog/ai/03-frameworks/01/03/)——上一章强调状态机与显式控制流；本章转到角色协作与事件传播。

下一篇：[03 CrewAI](/iopanda-blog/ai/03-frameworks/01/18/)——如果说 AutoGen 更像研究范式的先驱，那么 CrewAI 则更像把角色团队做成业务自动化产品语义。
