---
title: "OpenAI Agents SDK"
number: "03.01.25"
chapter: 3
chapterTitle: "Frameworks"
section: 1
sectionTitle: "Agent Frameworks"
group: "04 OpenAI Agents SDK"
created: 2026-09-03 13:35
author: "iopanda"
tags: ["course", "ai-agent", "framework", "openai-agents-sdk"]
sourceId: "3.10.3.1 Agent Frameworks/04 OpenAI Agents SDK/README"
---
# OpenAI Agents SDK

> 如果说 [LangGraph](/ai/03-frameworks/01/03/) 是从控制流切入，[CrewAI](/ai/03-frameworks/01/18/) 是从角色团队切入，那么 OpenAI Agents SDK 的切入点更像“把 2025~2026 年现代 Agent 应用反复需要的基础原语，直接做成标准配置”：agents、tools、agents as tools / handoffs、guardrails、human in the loop、sessions、tracing，再加上 sandbox、realtime、voice 这些真实应用很快会碰到的运行环境。[4][15][16][17][18] 它的价值不在于抽象最底层，也不在于角色叙事最强，而在于**把今天构建现代 Agent 应用最常见的组件收拢成一套一致的开发体验**。

**学习目标**：学完本章，你将能够——

1. 说出 OpenAI Agents SDK 的核心原语，以及它们分别解决什么问题；
2. 理解为什么 handoffs、guardrails、sessions、tracing 在 2026 年已经应被视为 Agent SDK 的“标配”；
3. 解释 sandbox agent、realtime agent、voice pipeline 为什么代表了 Agent 正在脱离单纯文本应用；
4. 区分它与 [LangGraph](/ai/03-frameworks/01/03/)、[PydanticAI](/ai/03-frameworks/01/32/)、[CrewAI](/ai/03-frameworks/01/18/) 的边界；
5. 为一个开发者向的课程助教 Agent 设计 OpenAI Agents SDK 风格的运行结构。

## 1. 概念：不是一个“聊天包装器”，而是一组现代 Agent 原语的集合

OpenAI Agents SDK 的 README 开头就给出两个重要信息：

- 它是一个 lightweight yet powerful framework，用于构建 multi-agent workflows；
- 它是 provider-agnostic 的，除 OpenAI 自家接口外，也支持 100+ 其他 LLMs。[4][15]

这两句话共同传达的意思是：它不是为了把某个模型接口封装得更好看，而是为了定义一套**与单个模型厂商解耦的 Agent 运行方式**。

官方列出的 core concepts 也非常说明问题：[15]

1. Agents
2. Sandbox agents
3. Realtime agents
4. Voice agents
5. Agents as tools / Handoffs
6. Tools
7. Guardrails
8. Human in the loop
9. Sessions
10. Tracing

这份清单比很多框架都更“时代化”。它实际上在说：到了 2026 年，一个像样的 Agent SDK，不应该只会发 prompt 和调函数，而应该自带下面这些能力假设：

- Agent 会分工；
- Agent 会接工具；
- Agent 会跨轮记上下文；
- Agent 会需要人类审批；
- Agent 会需要 trace；
- Agent 可能不只活在文本框，还活在语音、实时连接和沙箱里。

## 2. 为什么这种设计重要：因为现代 Agent 应用的复杂度已经不只在 prompt 里

在早期 LLM 应用里，很多团队会自己拼装：

- 一个模型 SDK；
- 一套函数调用封装；
- 一份上下文管理器；
- 一套 guardrail；
- 一个 trace 方案；
- 如果要多 Agent，再补一个 handoff；
- 如果要语音或沙箱，再接别的组件。

问题是，这种“拼装式架构”很快会出现接口风格不统一、状态边界混乱、调试上下文割裂的问题。OpenAI Agents SDK 的工程判断是：**这些能力已经足够通用，应该被收口到同一个运行时语义里。**

- 这和 [02.04 Tool Use and Protocols](/ai/02-agents/04/01/)、[02.07 Evaluation and Observability](/ai/02-agents/07/01/) 的演进是完全一致的：当一个模式反复出现，就不该继续靠胶水代码维持。

## 3. 核心原语：为什么这一套组合很有代表性

### 3.1 Agent

在 OpenAI Agents SDK 里，Agent 是配置了 instructions、tools、guardrails、handoffs 等能力的 LLM 单元。[15][16] 这一定义比很多“模型 + prompt”式封装更完整，因为它承认 Agent 不是裸模型，而是**带边界条件的可执行主体**。

### 3.2 Tools

tool 在这里不是插件市场概念，而是 Agent 对外行动的标准接口。[15][16]

- 有了 tool，模型从“说”变成“做”；
- 有了 tool schema，调用边界才变得可验证；
- 有了统一 tool 语义，guardrail 和 tracing 才能真正落地。

这与 [提示注入与工具安全](/ai/01-models/07/03/) 里的判断完全一致：真正危险的不是模型会说错话，而是它会不会借应用身份把工具调错。

### 3.3 Agents as tools / Handoffs

这是 OpenAI Agents SDK 非常重要的一层抽象。[15][17]

- “agent as tool” 的意思是：一个 Agent 可以把另一个 Agent 当作专长能力来调用；
- “handoff” 的意思是：控制权可以从一个 Agent 交给另一个 Agent。

这两个能力把多 Agent 从“并排放几个模型”提升到“具备明确委托关系的协作结构”。与 [AutoGen](/ai/03-frameworks/01/11/) 相比，它不是从群聊式协作切入，而是从**受控委托和控制权转移**切入；与 [CrewAI](/ai/03-frameworks/01/18/) 相比，它不是先谈角色，而是先谈运行时关系。

### 3.4 Guardrails

OpenAI Agents SDK 直接把 input/output guardrails 做成官方一等概念。[15][18]

这件事的意义非常大：

- 它承认安全与策略校验不该是业务代码里的零散钩子；
- 它让输入检查、输出检查与 Agent 执行同处一个可观察语义里；
- 它说明“模型之外的独立控制层”已经从最佳实践变成默认组件，呼应 [护栏与人工复核](/ai/01-models/07/04/)。

### 3.5 Sessions

多轮上下文管理被做成 Sessions，而不是让开发者自己拼消息历史。[15] 这很关键，因为很多 Agent bug 其实不是模型理解问题，而是历史上下文累积失控：

- 该保留的没保留；
- 不该保留的全塞进去了；
- 会话边界不清；
- 不同会话污染彼此上下文。

把 session 做成官方抽象，等于承认“上下文管理本身就是系统设计问题”。

### 3.6 Tracing

官方直接把 tracing 作为核心概念列出。[15] 这说明 Agent 已经不再是一个“输入一句话、输出一句话”的黑箱接口，而是一个**需要被观测的运行过程**。没有 tracing，多 Agent、tool use、guardrail 命中、handoff 轨迹都很难调试。

## 4. Sandbox / Realtime / Voice：Agent 正在脱离“纯文本后台程序”

OpenAI Agents SDK 很值得重视的一点，是它没有停在文本 Agent 上，而是明确给出了：

- `SandboxAgent`：适合读文件、跑命令、打补丁、维护较长工作时程；[15]
- `RealtimeAgent`：适合低延迟、服务端语音/多模态交互；[15]
- `VoicePipeline`：适合语音输入、Agent 工作流、语音输出整合。[15]

这背后不是“功能堆得多”，而是一个更深的趋势判断：**Agent 的宿主环境正在从聊天窗口扩展到工作空间、实时连接和语音通道。**

对于开发者和架构师，这意味着：

- 你不能再只考虑 prompt 和 tool；
- 还要考虑运行时隔离、会话持续、流式事件、前后端交互方式；
- Agent framework 已经开始兼管“应用形态”。

## 5. 与同类产品相比，它的真正位置在哪里

| 框架 | 设计中心 | 更适合的首要问题 |
|---|---|---|
| OpenAI Agents SDK | 统一现代 Agent 原语 | 我想尽快获得一套完整运行时能力栈 |
| [LangGraph](/ai/03-frameworks/01/03/) | 状态图与可恢复执行 | 我首先担心复杂控制流与恢复 |
| [CrewAI](/ai/03-frameworks/01/18/) | 角色团队与业务流程 | 我首先担心角色协作与流程表达 |
| [PydanticAI](/ai/03-frameworks/01/32/) | 类型、输出、依赖、能力组合 | 我首先担心工程契约与测试性 |
| [AutoGen](/ai/03-frameworks/01/11/) | 多 Agent 对话与事件协作 | 我想理解多 Agent 先驱模式或维护旧系统 |

一句话看差别：

- LangGraph 像“Agent 编排内核”；
- CrewAI 像“角色团队自动化框架”；
- PydanticAI 像“Python 工程化 Agent SDK”；
- OpenAI Agents SDK 像“现代 Agent 原语全家桶”。

## 6. 为什么它适合开发者产品化落地

这个框架对产品团队特别友好，原因不在于它“最简单”，而在于它给出了一套相对完整的默认答案：

- 需要委托？有 handoffs；
- 需要输入输出校验？有 guardrails；
- 需要多轮历史？有 sessions；
- 需要调试运行轨迹？有 tracing；
- 需要跑在文件/命令环境？有 sandbox；
- 需要语音或实时体验？有 realtime / voice。

也就是说，它帮产品团队省下的不是几行封装代码，而是**一整轮“我们到底要不要自己拼这些基础设施”的架构犹豫**。

## 7. 动手活动：把课程助教做成 Router + Specialist 的 handoff 结构

> [!example] 动手活动：输出 `openai-agents-design.md`
>
> **目标**：用 OpenAI Agents SDK 的词汇表，为课程助教 Agent 设计一套受控委托结构。
>
> **步骤**：
> 1. 设计一个 Router Agent：负责判断用户问题属于课程问答、成绩查询、治理规则咨询中的哪一类；
> 2. 设计三个 Specialist Agents：
>    - 课程问答 Agent
>    - 成绩查询 Agent
>    - 治理规则 Agent
> 3. 定义 handoff 关系：Router 只负责分流，不直接给最终答案；
> 4. 为成绩查询 Agent 加 input/output guardrails：
>    - 输入必须带本人身份信息；
>    - 输出禁止出现其他学生的成绩；
> 5. 设计 session 策略：普通问答保留短期上下文，成绩查询单独隔离会话。
>
> **完成标准**：你能清楚说明哪一步是 handoff、哪一步是 tool use、哪一步是 guardrail、哪一步依赖 session 隔离。

## 8. 边界与排错

- **误区一：原语很多 = 适合所有复杂系统。** 如果你主要问题是显式状态恢复和长流程图控制，仍可能更适合 [LangGraph](/ai/03-frameworks/01/03/)；
- **误区二：有 guardrail 就自动安全。** guardrail 是控制点，不是免责牌；权限、人工确认、审计仍要补齐；
- **误区三：handoff = 多 Agent 万能药。** 委托关系设计不好，只会把问题拆散而不是解决；
- **误区四：provider-agnostic 就等于零迁移成本。** 抽象统一不等于模型差异消失，真实行为、成本、工具效果仍需评测；
- **误区五：把 session 当缓存。** session 本质是上下文治理问题，不只是顺手存几轮消息。

## 9. 总结

| 关键问题 | 一句话 |
|---|---|
| OpenAI Agents SDK 是什么 | 把现代 Agent 常见原语做成统一运行时的轻量 SDK |
| 核心原语 | agents、tools、handoffs、guardrails、sessions、tracing、sandbox、realtime、voice |
| 它的工程价值 | 少的不是几行代码，而是少了一轮自己拼基础设施的复杂度 |
| 与同类差异 | 它优先统一运行时原语，而不是优先建图或优先讲角色团队 |
| 最适合什么 | 想快速构建现代 Agent 应用，且需要多原语协同的产品团队 |

## 10. 本目录笔记导航

1. [01 核心原语与运行时设计](/ai/03-frameworks/01/26/)
2. [02 Sandbox、Guardrails、Sessions 与产品化](/ai/03-frameworks/01/27/)
3. [03 Handoffs、Agent-as-Tool 与 MCP 工具生态](/ai/03-frameworks/01/28/)
4. [04 Tracing、Testing、Realtime 与 Voice 的应用形态](/ai/03-frameworks/01/29/)
5. [05 课程助教 Agent 的 OpenAI Agents SDK 架构案例](/ai/03-frameworks/01/30/)
6. [06 OpenAI Agents SDK 与 LangGraph、CrewAI、PydanticAI 的深度对比](/ai/03-frameworks/01/31/)

**思考题**：如果你的 Agent 主要工作是“长流程文档审查 + 多次人工批注 + 故障后从中断点继续”，你会直接选 OpenAI Agents SDK，还是更倾向 [LangGraph](/ai/03-frameworks/01/03/) 一类显式状态图框架？为什么？如果你的核心需求改成“多终端聊天 + 语音 + 专家 Agent 分流”，答案为什么又可能变化？

> [!note] 参考答案
> 若首要矛盾是长流程恢复、人工批注和显式状态控制，更偏向状态图与持久化导向的框架，因为复杂度主要落在控制流；OpenAI Agents SDK 依然能做，但它的设计中心不是首先把流程写成图。反过来，如果核心需求变成多终端交互、语音接入、专家分流、输入输出 guardrails 和统一 tracing，那么 OpenAI Agents SDK 的一体化原语优势会非常明显。选型不是看功能清单谁更长，而是看你的系统最先在哪里变复杂。

## 引用

- [4] https://github.com/openai/openai-agents-python — OpenAI Agents SDK GitHub
- [15] https://openai.github.io/openai-agents-python — OpenAI Agents SDK docs
- [16] https://raw.githubusercontent.com/openai/openai-agents-python/main/docs/agents.md — OpenAI Agents core agents doc
- [17] https://raw.githubusercontent.com/openai/openai-agents-python/main/docs/handoffs.md — OpenAI Agents handoffs doc
- [18] https://raw.githubusercontent.com/openai/openai-agents-python/main/docs/guardrails.md — OpenAI Agents guardrails doc

上一篇：[03 CrewAI](/ai/03-frameworks/01/18/)——上一章把多 Agent 放进业务团队与流程语义；本章转向一体化现代 Agent 原语。

下一篇：[05 PydanticAI](/ai/03-frameworks/01/32/)——如果说 OpenAI Agents SDK 想帮你把原语凑齐，那么 PydanticAI 要解决的是另一件事：这些能力怎样在 Python 工程里变得类型安全、可测试、可维护。
