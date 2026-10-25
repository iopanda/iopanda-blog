---
title: "PydanticAI"
number: "03.01.32"
chapter: 3
chapterTitle: "Frameworks"
section: 1
sectionTitle: "Agent Frameworks"
group: "05 PydanticAI"
created: 2026-09-03 13:40
author: "iopanda"
tags: ["course", "ai-agent", "framework", "pydantic-ai"]
sourceId: "3.10.3.1 Agent Frameworks/05 PydanticAI/README"
---
# PydanticAI

> 很多 Agent 框架最先解决的是“怎么跑起来”，而 PydanticAI 想优先解决另一件事：**跑起来以后，怎么像一个正经 Python 后端系统那样维护下去。** 它把自己定义为 the Python AI SDK：typed、extensible，agent loop 可以通过 capabilities 组合，模型可字符串级替换，同一个 Agent 可运行在 web、CLI、voice、durable background queue 等不同界面里。[5][19] 更进一步，它并不把 graph、multi-agent、durable execution、structured output、usage limits 当作框架外的附属物，而是把它们逐步纳入同一个工程词汇表。[20][21][22][23] 如果说 [OpenAI Agents SDK](/iopanda-blog/ai/03-frameworks/01/25/) 的强项是现代运行时原语，PydanticAI 的强项就是：**把这些原语放进 Python 工程纪律里，尽量让 IDE、类型系统、校验器和运行时站到同一边。**

**学习目标**：学完本章，你将能够——

1. 解释 PydanticAI 为什么把类型、依赖和输出契约视为一等公民；
2. 说出 Agent、output_type、deps_type、capabilities、graph、durable execution 在框架中的位置；
3. 理解它为什么对 Python 后端团队特别友好，而不只是“另一个 Agent SDK”；
4. 区分它与 [LangGraph](/iopanda-blog/ai/03-frameworks/01/03/)、[OpenAI Agents SDK](/iopanda-blog/ai/03-frameworks/01/25/)、[CrewAI](/iopanda-blog/ai/03-frameworks/01/18/) 的差别；
5. 为一个开发者向课程助教 Agent 写出 PydanticAI 风格的工程边界设计。

## 1. 概念：PydanticAI 的中心不是“Agent 会不会思考”，而是“代码有没有契约”

PydanticAI 官方对 Agent 的描述非常清楚：Agent 是它与 LLM 交互的主接口，概念上是一个容器，里面装着 instructions、function tools / toolsets、structured output type、dependency type constraint、LLM model、model settings 和 capabilities。[20]

这一定义和很多框架比，最大的差异在于：

- 它一上来就谈 **output type**；
- 它一上来就谈 **dependencies**；
- 它一上来就谈 **capabilities composition**。

这意味着在 PydanticAI 的世界里，Agent 不是“能调模型的对象”，而是：

- 有输入依赖约束；
- 有输出契约；
- 有能力组合边界；
- 能被 IDE、类型检查器、运行时校验共同约束的工程对象。

这和 Pydantic 生态的气质是一脉相承的：**先把数据结构和契约钉住，再谈业务逻辑。**

## 2. 为什么这种路线重要：Agent 最大的问题常常不是智力，而是不可维护

很多 Agent 原型在 demo 阶段看起来工作正常，但一旦进入真实工程，会立即暴露三类问题：

1. **输出不稳定**：下游代码以为会拿到 JSON，实际拿到半段散文；
2. **依赖混乱**：数据库连接、HTTP client、鉴权信息、缓存对象通过闭包和全局变量四处漂；
3. **能力拼装不可控**：一旦加工具、加记忆、加 tracing、加 cost limit、加多 Agent，系统变成胶水堆。

PydanticAI 的回答不是“写更强的 prompt”，而是把这些问题上升为框架级契约：

- output_type 让结果必须经过验证；
- deps_type 让运行依赖显式化；
- capabilities 让能力组合从“散装钩子”变成可重用单元；
- usage limits、graph、durability 则把成本、控制流和恢复继续纳入统一语言。

所以它吸引的不是“只想试试玩 Agent 的人”，而是**已经感受到维护成本的人**。

## 3. Agent：为什么它像 AI 版 FastAPI，而不像一个 prompt helper

官方文档直接用一个很好的比喻：Agents are designed for reuse, like FastAPI Apps。[20] 这个比喻非常到位。

它暗示了三层含义：

1. Agent 应该是可复用的应用组件，而不是一次性脚本；
2. 你可以像复用路由器一样复用 Agent；
3. 真正重要的是接口和依赖约束，而不只是生成文本本身。

从开发者角度，这种心智模型会带来非常实际的好处：

- Agent 更容易纳入现有 Python 服务架构；
- 测试时更容易 mock 依赖；
- 输出结构更容易被下游消费；
- IDE、类型提示、代码审查都会变得更有抓手。

这就是为什么很多 Python 后端团队会对 PydanticAI 有天然亲和力：它让 Agent 像自己熟悉的工程组件，而不是一块难以驯服的“神秘 LLM 黑盒”。

## 4. Capabilities：为什么它把“能力”而不是“插件”做成组合单元

PydanticAI 文档把 capabilities 定义为可重用的 bundles：可以把 tools、hooks、instructions、model settings 等相关行为打包、组合、共享。[19][20]

这比常见的插件思路更进一步，因为它解决的不是“多一个工具”，而是“多一个能力域”。

比如一个“Coder”能力，不只是增加几个 shell 工具，而是连带：

- 文件系统访问；
- shell 执行；
- repo context；
- planning；
- sub-agents；
- context management。

这很重要，因为真实 Agent 的复杂度从来不是线性加法。你以为自己只是加了一个工具，实际上同时引入了：权限、输出限制、上下文管理、观测、预算、重试等一整串问题。capabilities 的价值就在于：**把这串问题作为一个整体去封装。**

与同类相比：

- [OpenAI Agents SDK](/iopanda-blog/ai/03-frameworks/01/25/) 也有丰富原语，但更强调统一运行时概念；
- PydanticAI 则更强调能力组合与类型契约在 Python 代码里的可维护性。

## 5. Graph：为什么它明明不是图框架，却仍然提供 graph

PydanticAI 文档对 graph 的态度非常有趣，甚至有点“反营销”：它明确提醒你，别为了看起来酷就上 graph；graph 是更重的工具，不是默认答案。[21]

这段态度本身就说明了框架的工程品味：

- graph 很强；
- 但 graph 也更重；
- 先确认自己真的有复杂控制流问题，再上 graph。

这和 [LangGraph](/iopanda-blog/ai/03-frameworks/01/03/) 正好形成鲜明对照：

- LangGraph 从一开始就把 graph 当主舞台；
- PydanticAI 把 graph 当高级控制工具，而不是默认入口。

所以两者并不冲突，而是服务于不同类型的团队心智：

- 如果你首先是“我要一张显式状态图”，LangGraph 更直接；
- 如果你首先是“我要一个类型安全的 Agent 应用”，PydanticAI 更自然，graph 只是你后面可能升级的工具。

## 6. Durable execution：为什么它把 Temporal、DBOS、Prefect、Restate 都纳进来了

PydanticAI 的 durable execution 文档明确写道：它支持构建 durable agents，以跨 transient failures、应用重启、长时异步流程和 human-in-the-loop 工作流，并正式支持 Temporal、DBOS、Prefect、Restate 等解决方案。[22]

这件事的含义很大：

- 它承认 Agent 系统最终会进入工作流与可靠性世界；
- 它不把 durability 当成某个供应商绑定能力，而是作为可插拔后端能力；
- 它让开发者能在自己熟悉的 Python 工程接口下，逐步接入生产级持久执行系统。

对架构师来说，这意味着 PydanticAI 并不是“玩具型 typed SDK”。它是有明确向生产流程编排靠拢路径的。

## 7. Multi-agent：它不是不支持多 Agent，而是不把多 Agent 当第一入口

PydanticAI 文档把多 Agent 应用的复杂度分成五个层级：

1. 单 Agent workflows；
2. Agent delegation；
3. Programmatic hand-off；
4. Graph-based control flow；
5. Deep Agents。[23]

这个分层非常值得记住，因为它体现了 PydanticAI 的整体哲学：**复杂度应该渐进升级，而不是一开始就堆到最高档。**

与 [AutoGen](/iopanda-blog/ai/03-frameworks/01/11/) 那种天然从多 Agent 出发的框架不同，PydanticAI 更像在说：

- 先把单 Agent 工程做好；
- 再引入 delegation；
- 再考虑 hand-off；
- 实在需要，再上 graph；
- 更复杂时，才走到 deep agents。

这很符合多数后端团队的现实：**先解决工程稳定性，再放大协作复杂度。**

## 8. 与同类产品相比，它的独特位置在哪里

| 框架 | 设计中心 | 更像什么 | 最吸引谁 |
|---|---|---|---|
| PydanticAI | 类型、输出契约、依赖、能力组合 | AI 版 FastAPI / typed runtime | Python 后端团队 |
| [OpenAI Agents SDK](/iopanda-blog/ai/03-frameworks/01/25/) | 现代 Agent 原语统一运行时 | battery-included SDK | 产品型 Agent 团队 |
| [LangGraph](/iopanda-blog/ai/03-frameworks/01/03/) | 图、状态、恢复 | 编排运行时 | 控制流复杂的团队 |
| [CrewAI](/iopanda-blog/ai/03-frameworks/01/18/) | 角色团队与流程 | 业务自动化框架 | 组织协作明确的团队 |
| [AutoGen](/iopanda-blog/ai/03-frameworks/01/11/) | 多 Agent 对话与消息协作 | 协作范式先驱 | 研究/迁移视角的团队 |

一句话概括：PydanticAI 不是最强调“Agent 像人”，而是最强调“Agent 像系统组件”。

## 9. 动手活动：给课程助教 Agent 写一张 typed contract 设计卡

> [!example] 动手活动：输出 `pydanticai-design.md`
>
> **目标**：不用急着写代码，先把课程助教 Agent 的类型边界、依赖边界和能力边界写清楚。
>
> **步骤**：
> 1. 定义输出契约：普通问答返回 `AnswerResult`，成绩查询返回 `ScoreResult`，风险请求返回 `EscalationResult`；
> 2. 定义依赖：数据库 client、检索 client、审计 logger、当前用户身份；
> 3. 定义能力组合：
>    - 基础问答能力
>    - 检索能力
>    - 安全审查能力
>    - tracing / usage limit 能力
> 4. 判断是否需要 graph：若只有单轮问答 + 检索，不需要；若存在审批、重试、人工插入、长流程恢复，再考虑 graph；
> 5. 判断是否需要 durable execution：若流程可能跨异步队列、人工审核或长时任务，提前设计 durability 接口。
>
> **完成标准**：你能让另一个后端工程师只看类型和依赖设计，就大致明白这个 Agent 能输入什么、输出什么、依赖什么、在哪些地方会被强约束。

## 10. 边界与排错

- **误区一：类型安全 = 业务安全。** output_type 能保证结构，不自动保证语义正确；评测和护栏仍不可少；
- **误区二：什么都抽成 capability。** 组合能力有价值，但抽象过度会让系统变得难追踪；
- **误区三：明明只是单 Agent，却过早上 graph。** PydanticAI 官方自己都提醒 graph 是重工具，不要为了酷而用；
- **误区四：只看 Python 体验，不看运行时需求。** 如果你的核心矛盾是超复杂状态图恢复，LangGraph 也许更贴切；
- **误区五：以为 typed output 就能替代人工复核。** 结构化正确，不等于业务判断安全，尤其涉及隐私、授权和不可逆动作时仍要回到 [提示注入与工具安全](/iopanda-blog/ai/01-models/07/03/)、[护栏与人工复核](/iopanda-blog/ai/01-models/07/04/) 与 [风险评审与发布](/iopanda-blog/ai/01-models/07/05/)。

## 11. 总结

| 关键问题 | 一句话 |
|---|---|
| PydanticAI 是什么 | 面向 Python 工程化的 typed Agent SDK |
| 核心价值 | 输出契约、依赖注入、能力组合、渐进复杂度升级 |
| 为什么开发者喜欢它 | IDE、类型检查、测试和运行时代码更容易站在同一边 |
| graph 的位置 | 是高级控制工具，不是默认入口 |
| durable execution 的位置 | 把可靠性世界自然接入 Agent 世界 |
| 最适合什么 | Python 后端团队、重工程纪律、重可维护性的 Agent 系统 |

## 12. 本目录笔记导航

1. [01 类型系统、依赖注入与输出契约](/iopanda-blog/ai/03-frameworks/01/33/)
2. [02 Graph、Durable Execution 与工程化升级](/iopanda-blog/ai/03-frameworks/01/34/)
3. [03 Tools、Capabilities、Usage Limits 与取消语义](/iopanda-blog/ai/03-frameworks/01/35/)
4. [04 Realtime、Examples、Evals 与多 Agent 形态](/iopanda-blog/ai/03-frameworks/01/36/)
5. [05 课程助教 Agent 的 PydanticAI 架构案例](/iopanda-blog/ai/03-frameworks/01/37/)
6. [06 PydanticAI 与 LangGraph、CrewAI、OpenAI Agents SDK 的深度对比](/iopanda-blog/ai/03-frameworks/01/38/)

**思考题**：如果你的团队最痛的不是“模型效果不够”，而是“下游常因输出不稳定而报错、依赖注入混乱、测试难写、成本难控”，你会更偏向 PydanticAI 还是更偏向以控制流为中心的框架？为什么？如果半年后流程复杂度陡增，需要人工插入和长时恢复，你的答案会怎么变？

> [!note] 参考答案
> 当主要痛点是输出契约、依赖边界、测试与成本控制时，PydanticAI 往往更贴近根因，因为这些正是它的一等抽象；你需要先把 Agent 从“胶水脚本”收敛成“可维护组件”。但如果半年后复杂控制流、人工插入、长时恢复变成新的首要矛盾，就要重新评估是否引入 graph 甚至外部 durable orchestration。框架不是信仰，而是阶段性复杂度管理工具：首要矛盾变了，最优框架也会变。

## 引用

- [5] https://github.com/pydantic/pydantic-ai — PydanticAI GitHub
- [19] https://pydantic.dev/docs/ai — Pydantic AI docs
- [20] https://raw.githubusercontent.com/pydantic/pydantic-ai/main/docs/agent.md — Pydantic AI agent doc
- [21] https://raw.githubusercontent.com/pydantic/pydantic-ai/main/docs/graph.md — Pydantic AI graph doc
- [22] https://raw.githubusercontent.com/pydantic/pydantic-ai/main/docs/durable_execution/overview.md — Pydantic AI durable execution doc
- [23] https://raw.githubusercontent.com/pydantic/pydantic-ai/main/docs/multi-agent-applications.md — Pydantic AI multi-agent applications doc
- [4] https://github.com/openai/openai-agents-python — OpenAI Agents SDK GitHub
- [15] https://openai.github.io/openai-agents-python — OpenAI Agents SDK docs

上一篇：[04 OpenAI Agents SDK](/iopanda-blog/ai/03-frameworks/01/25/)——上一章强调现代 Agent 原语的一体化；本章把视角压回 Python 工程契约。

下一篇：[06 Agent Framework 选型矩阵](/iopanda-blog/ai/03-frameworks/01/02/)——把前五篇画像收口成真正可用于架构决策的横向对比与选型方法。
