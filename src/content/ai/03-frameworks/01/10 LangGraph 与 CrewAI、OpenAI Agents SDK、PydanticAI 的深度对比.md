---
title: "LangGraph 与 CrewAI、OpenAI Agents SDK、PydanticAI 的深度对比"
number: "03.01.10"
chapter: 3
chapterTitle: "Frameworks"
section: 1
sectionTitle: "Agent Frameworks"
group: "01 LangGraph"
created: 2026-09-03 16:12
author: "iopanda"
tags: ["course", "ai-agent", "framework", "langgraph", "comparison", "architecture"]
sourceId: "3.10.3.1 Agent Frameworks/01 LangGraph/07 LangGraph 与 CrewAI、OpenAI Agents SDK、PydanticAI 的深度对比"
---
# LangGraph 与 CrewAI、OpenAI Agents SDK、PydanticAI 的深度对比

> 到这一篇，LangGraph 本身已经讲得足够深了：从 [状态图](/ai/03-frameworks/01/04/) 到 [课程助教架构案例](/ai/03-frameworks/01/09/)，你应该已经能回答“LangGraph 是什么”。但架构师真正值钱的最后一步，是回答：**它不是什么。** 也就是说：当一个团队看着 LangGraph、[CrewAI](/ai/03-frameworks/01/18/)、[OpenAI Agents SDK](/ai/03-frameworks/01/25/)、[PydanticAI](/ai/03-frameworks/01/32/) 都摆在眼前时，到底该怎么判断？这一章不重复一般性的选型矩阵，而是专门站在 LangGraph 的视角，反向比较它和其他主流路线的第一性差异：**为什么它更像运行时，而别的框架更像角色系统、原语 SDK 或 typed 工程框架。**

**学习目标**：学完本章，你将能够——

1. 站在 LangGraph 视角，清楚说明它与 CrewAI、OpenAI Agents SDK、PydanticAI 的设计中心差异；
2. 理解为什么“都能做 Agent”不等于“维护复杂度相同”；
3. 用流程复杂度、角色复杂度、原语复杂度、工程契约复杂度四个坐标做对比；
4. 判断什么时候 LangGraph 是更自然的主骨架，什么时候它只是更重的选项；
5. 为团队写出“为什么选 LangGraph / 为什么不选 LangGraph”的架构解释。

## 1. 比较的前提：不是谁功能多，而是谁默认把什么问题当中心

表面看，这几个框架都能做：
- tools
- multi-agent
- memory
- tracing
- human-in-the-loop
- persistence（不同程度）

但真正差别不在“能不能做”，而在：
- 哪件事是一等公民；
- 哪件事是扩展能力；
- 哪件事是默认心智模型；
- 哪件事要你自己拼。

LangGraph 的最大特点是：**它默认你在构建一个有状态、可恢复、可中断的运行系统。**

## 2. LangGraph vs CrewAI：状态机语言 vs 组织流程语言

### 2.1 共同点

两者都承认：
- Agent 系统不能只靠一次模型调用；
- 需要流程；
- 需要人审；
- 需要持久化或恢复语义。

### 2.2 根本差异

| 维度 | LangGraph | CrewAI |
|---|---|---|
| 第一语言 | 节点、边、状态、channel | Agent、Task、Crew、Flow |
| 主要直觉 | 系统如何迁移状态 | 团队如何组织工作 |
| 最强点 | 控制流、恢复、显式状态 | 业务角色表达、流程贴近组织语义 |
| 更像什么 | 运行时内核 | 业务自动化框架 |

这意味着：
- 若你的团队首先在讨论“状态从哪到哪、哪一步可恢复”，LangGraph 会自然；
- 若你的团队首先在讨论“谁负责研究、谁负责审查、谁负责执行”，CrewAI 会自然。

一句话：CrewAI 更像把 Agent 系统说成人类组织；LangGraph 更像把 Agent 系统说成状态机。

## 3. LangGraph vs OpenAI Agents SDK：显式控制流 vs 统一现代原语

### 3.1 OpenAI Agents SDK 的强处

OpenAI Agents SDK 最大的价值是：
- tools
- handoffs
- guardrails
- sessions
- tracing
- sandbox
- realtime / voice
这些现代 Agent 原语一开始就给得很齐。[15][16][17][18]

### 3.2 LangGraph 的不同

LangGraph 的第一反应不是“给你一整盒原语”，而是“先让你的控制流有结构”。

| 维度 | LangGraph | OpenAI Agents SDK |
|---|---|---|
| 默认先解决 | 状态图与恢复 | 现代 Agent runtime 原语 |
| 多 Agent 的组织方式 | 作为图的一部分组合 | handoff / agent-as-tool 更自然 |
| 人审表达 | interrupt / graph control | human-in-the-loop 原语 |
| 最强心智模型 | 系统是图 | 系统是运行时对象组合 |

所以：
- 如果你的主矛盾是“流程太复杂、需要显式恢复和分支”，LangGraph 更顺；
- 如果你的主矛盾是“我要快速拿到 tools + handoffs + guardrails + sessions + sandbox”，OpenAI Agents SDK 更顺。

## 4. LangGraph vs PydanticAI：状态与恢复优先 vs 契约与依赖优先

### 4.1 PydanticAI 的强处

PydanticAI 首先帮你稳住的是：
- output_type
- deps_type
- capabilities
- usage limits
- graph / durable execution 的渐进升级路径。[19][20][21][22][23]

### 4.2 LangGraph 的不同

LangGraph 会更早逼你回答：
- state schema 是什么；
- 哪个节点写什么；
- 哪个点 interrupt；
- 哪个点 checkpoint；
- 哪条边为什么分叉。

| 维度 | LangGraph | PydanticAI |
|---|---|---|
| 先稳住什么 | 控制流与恢复语义 | 输出契约、依赖边界、工程类型系统 |
| graph 的地位 | 主入口之一 | 高级升级路径 |
| 对后端工程师的第一感觉 | 运行时很强 | 工程契约很舒服 |
| 最适合的主矛盾 | 复杂状态系统 | 复杂接口与维护系统 |

也就是说：
- LangGraph 更像“系统先活对”；
- PydanticAI 更像“系统先写对”。

两者不冲突，但起手式完全不同。

## 5. 为什么 LangGraph 常常更像“骨架”，而其他框架更像“肌肉”

这是一个非常有用的比喻：

- LangGraph 提供的是骨架：
  - 流程结构
  - 状态迁移
  - checkpoint
  - interrupt
  - 子图
- 其他框架更像在不同方向给你长肌肉：
  - CrewAI 给角色团队肌肉；
  - OpenAI Agents SDK 给现代原语肌肉；
  - PydanticAI 给类型和依赖治理肌肉。

这也是为什么 LangGraph 适合作为主骨架，但并不总适合作为第一体验：骨架很重要，但骨架不像功能 demo 那样一眼惊艳。

## 6. 什么时候 LangGraph 是正确的“主骨架”

下面这些信号出现时，LangGraph 往往会越来越自然：

1. 流程不是线性的，而是充满回查、分支、恢复；
2. 高风险动作必须插人工中断；
3. 状态不只是消息，还包括多个业务字段；
4. 系统要长期运行，而不是一次性问答；
5. 审计、回放、checkpoint、thread 隔离都变成刚需；
6. 你希望未来复杂度上升时，仍然能解释“系统为什么走到这一步”。

这时 LangGraph 通常不是“更高级的选择”，而是“更少后悔的选择”。

## 7. 什么时候 LangGraph 会显得偏重

反过来也要诚实：下面这些场景里，LangGraph 可能会显得偏重：

1. 只是单 Agent + 少量 tools；
2. 主要目标是快速做产品原型；
3. 团队更熟悉角色/任务表达，而不是状态机表达；
4. 复杂度主要在输出契约和依赖治理，而不是控制流；
5. 还没验证任务是否成立，先建复杂状态图只会放大迷茫。

这和 [24] 的建议完全一致：先用最简单能工作的结构，复杂度按需加装。

## 8. 从 LangGraph 视角看“为什么不用别的”

### 不选 CrewAI 的理由
- 你的主矛盾不是角色分工，而是状态恢复与高风险路径；
- 你更需要可解释的状态机，而不是业务团队语言。

### 不选 OpenAI Agents SDK 的理由
- 你的主矛盾不是原语不齐，而是流程控制太复杂；
- 你需要更强的显式分支、checkpoint、子图与恢复心智。

### 不选 PydanticAI 的理由
- 你的第一痛点不是输出契约，而是复杂运行状态；
- 你更希望 graph 是起点，不是后续升级项。

注意：这些不是“别的框架不好”，而是**LangGraph 解决的是另一个更优先的问题。**

## 9. 动手活动：写一段“为什么我们选 LangGraph”的架构说明

> [!example] 动手活动：输出 `why-langgraph.md`
>
> **目标**：不是写“LangGraph 很强”，而是写清楚为什么它更匹配当前系统主矛盾。
>
> **步骤**：
> 1. 用一句话写出你系统的主矛盾；
> 2. 对比 CrewAI、OpenAI Agents SDK、PydanticAI：它们优先解决的是什么；
> 3. 说明为什么这些都不是你当前的第一优先级；
> 4. 说明 LangGraph 如何直接命中你的控制流/恢复/人审需求；
> 5. 补一段未来演化预案：哪些地方仍可能借别的框架思路。
>
> **完成标准**：读者看完后会觉得“这是基于系统主矛盾的选型”，而不是“作者个人偏好”。

## 10. 边界与排错

- **误区一：LangGraph 更底层，所以一定更通用更好。** 底层不等于适合所有团队；
- **误区二：别的框架没有图，所以做不了复杂系统。** 重点不是能不能做，而是做起来的默认路径和维护代价；
- **误区三：功能相同就意味着架构等价。** 同样支持 tool/human-in-the-loop，表达成本和治理路径仍可能完全不同；
- **误区四：看 demo 判断选型。** Demo 最擅长隐藏长期复杂度；
- **误区五：一旦选 LangGraph，就不要吸收别的框架思想。** 实际上角色语义、typed output、modern runtime 原语都可以借鉴。

## 11. 总结

| 关键问题 | 一句话 |
|---|---|
| LangGraph 最像什么 | 一个以状态、恢复和中断为中心的 Agent 运行时 |
| 它和 CrewAI 的核心差异 | 一个像状态机，一个像组织流程 |
| 它和 OpenAI Agents SDK 的核心差异 | 一个先稳控制流，一个先稳现代原语 |
| 它和 PydanticAI 的核心差异 | 一个先稳运行过程，一个先稳工程契约 |
| 什么时候选它 | 当复杂度首先爆在流程、恢复、人审和状态上 |
| 什么时候谨慎 | 当任务仍轻、仍线性、仍处于原型验证期 |

**思考题**：如果一个团队同时觉得“我们需要强状态控制”和“我们也很想要更舒服的工具、typed output、角色语义”，是否就说明 LangGraph 不够？还是说明真正成熟的架构本来就可能是“LangGraph 做骨架，别的思想做局部能力”？为什么？

> [!note] 参考答案
> 这不说明 LangGraph 不够，而说明复杂系统本来就不是单一抽象能完全包办的。真正成熟的架构往往是分层的：LangGraph 负责主流程、状态、恢复与中断；typed output、依赖治理、角色语义、现代 runtime 原语则可以通过工具层、节点封装、外围服务或团队设计方式引入。好的选型不是要求一个框架解决一切，而是让主骨架和局部能力各就其位。

## 引用

- [1] https://github.com/langchain-ai/langgraph — LangGraph GitHub
- [2] https://docs.langchain.com/oss/python/langgraph/overview — LangGraph docs overview
- [15] https://openai.github.io/openai-agents-python — OpenAI Agents SDK docs
- [19] https://pydantic.dev/docs/ai — Pydantic AI docs
- [24] https://www.anthropic.com/research/building-effective-agents — Anthropic: Building effective agents

上一篇：[06 课程助教 Agent 的 LangGraph 架构案例](/ai/03-frameworks/01/09/)——具体案例说明了 LangGraph 怎么落地；本篇反过来说明它为什么值得被选为主骨架。

下一篇：回到 [06 Agent Framework 选型矩阵](/ai/03-frameworks/01/02/)，把 LangGraph 放回整个 top5 框架版图中复核。
