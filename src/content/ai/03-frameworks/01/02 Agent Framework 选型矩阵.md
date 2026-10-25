---
title: "Agent Framework 选型矩阵"
number: "03.01.02"
chapter: 3
chapterTitle: "Frameworks"
section: 1
sectionTitle: "Agent Frameworks"
group: ""
created: 2026-09-03 14:05
author: "iopanda"
tags: ["course", "ai-agent", "framework", "architecture", "selection"]
sourceId: "3.10.3.1 Agent Frameworks/06 Agent Framework 选型矩阵"
---
# Agent Framework 选型矩阵

> 前五篇分别拆了 [LangGraph](/iopanda-blog/ai/03-frameworks/01/03/)、[AutoGen](/iopanda-blog/ai/03-frameworks/01/11/)、[CrewAI](/iopanda-blog/ai/03-frameworks/01/18/)、[OpenAI Agents SDK](/iopanda-blog/ai/03-frameworks/01/25/)、[PydanticAI](/iopanda-blog/ai/03-frameworks/01/32/) 的设计中心：有的先抓状态图，有的先抓角色协作，有的先抓现代运行时原语，有的先抓类型与工程契约。读到这里，开发者和架构师最需要的已经不是“再认识一个框架”，而是回答一个更难、也更值钱的问题：**面对真实项目，为什么选它，而不是别的？** 本章把前五篇收口成一张选型矩阵：从任务形态、控制流复杂度、错误代价、团队语言栈、治理要求、迁移成本六个维度，给出面向工程决策的判断框架，并补上一条经常被忽略但最重要的结论——很多场景里，你真正该选的不是“最强框架”，而是“最少后悔的框架”。[1][2][3][4][5][24]

**学习目标**：学完本章，你将能够——

1. 用一张表比较五个主流 Agent Framework 的设计中心、优势、代价与盲区；
2. 说明为什么框架选型首先是架构问题，而不是 API 喜好问题；
3. 用六个维度为真实项目做框架判断：任务形态、控制流、错误代价、语言栈、治理、迁移；
4. 识别四类典型错配：小题大做、协作过度、控制流过隐、契约失控；
5. 为一个课程助教 Agent 写出可审计的 framework-selection-card.md。

## 1. 概念：框架选型不是“谁功能多”，而是“谁先解决你的首要矛盾”

- 很多框架页面都会列出一长串能力：tool use、memory、guardrails、streaming、multi-agent、observability、human in the loop…… 但这些能力名单本身并不能回答架构问题。
- 真正决定选型的，不是“框架会不会这些”，而是**框架默认把哪一类复杂度当成一等公民**。
- 换句话说，框架差异首先不是功能覆盖面，而是工程哲学：
  - 谁先把状态显式化？
  - 谁先把角色协作抽象出来？
  - 谁先把工具/guardrails/session/tracing 收进统一运行时？
  - 谁先把类型、依赖和输出契约钉死？
- 所以选型问题不能问“哪个最好”，只能问：**你的系统最先会死在哪一类复杂度上？**

## 2. 为什么需要矩阵：同样叫 Agent，死法完全不同

在 [02 Agents](/iopanda-blog/ai/03-frameworks/01/01/) 里我们已经见过，Agent 的失败从来不只有一种：

- 有的死在上下文失控；
- 有的死在工具越权；
- 有的死在多 Agent 协作混乱；
- 有的死在输出结构不稳定；
- 有的死在长流程恢复不了；
- 有的死在护栏、审计和人审补不上。

不同框架其实是在优先消灭不同死法：

| 首要风险 | 更自然的框架倾向 | 解释 |
|---|---|---|
| 长流程、复杂分支、失败恢复 | [LangGraph](/iopanda-blog/ai/03-frameworks/01/03/) | 图、状态、checkpoint 是它的主战场 [1][6] |
| 多角色协作与对话分工 | [AutoGen](/iopanda-blog/ai/03-frameworks/01/11/) / [CrewAI](/iopanda-blog/ai/03-frameworks/01/18/) | 前者偏协作范式，后者偏业务团队 [2][8][12][13] |
| 现代 Agent 原语快速集成 | [OpenAI Agents SDK](/iopanda-blog/ai/03-frameworks/01/25/) | tools、handoffs、guardrails、sessions、tracing 一盒给齐 [15][16][17][18] |
| Python 工程契约、typed output、依赖治理 | [PydanticAI](/iopanda-blog/ai/03-frameworks/01/32/) | 类型、依赖、capabilities、usage limits 是强项 [19][20][23] |

因此矩阵的作用，不是排榜单，而是把“不同死法 → 不同优先框架”这件事讲清楚。

## 3. 六个选型维度：开发者和架构师真正该问什么

### 3.1 维度一：任务形态——你做的是聊天、流程、工作台，还是自治系统？

| 任务形态 | 更像什么 | 优先想到 |
|---|---|---|
| 单 Agent 问答 + 少量工具 | 轻应用 | [OpenAI Agents SDK](/iopanda-blog/ai/03-frameworks/01/25/) / [PydanticAI](/iopanda-blog/ai/03-frameworks/01/32/) |
| 角色明确的业务自动化 | 团队协作 | [CrewAI](/iopanda-blog/ai/03-frameworks/01/18/) |
| 长流程、多分支、多中断点 | 有状态运行时 | [LangGraph](/iopanda-blog/ai/03-frameworks/01/03/) |
| 多代理研究/实验/遗留协作系统 | 会话式多 Agent | [AutoGen](/iopanda-blog/ai/03-frameworks/01/11/) |

第一问永远不是“哪家最火”，而是“我的系统更像哪种东西”。系统形态错判，后面所有 API 比较都失去意义。

### 3.2 维度二：控制流复杂度——流程是写死的，还是边跑边决定的？

Anthropic 的建议很明确：能写死成 workflow 的，就不要先上 fully agentic system。[24] 这条建议其实直接决定框架优先级：

- 流程大多可预编排：优先工作流/typed SDK；
- 流程要在运行中频繁分叉、暂停、恢复：优先显式状态图；
- 流程核心是多角色协作而非状态恢复：优先 CrewAI / AutoGen；
- 流程本身不复杂，但你需要 tool、handoff、guardrail、session 一次凑齐：优先 OpenAI Agents SDK。

一句话：**控制流越复杂，越要远离“隐式 prompt 协作”；控制流越简单，越要避免过重编排。**

### 3.3 维度三：错误代价——错一次，是重问，还是事故？

这个维度最容易被低估。框架能力再强，只要错误代价高，系统就必须优先选择更容易审计、插入人审、限制权限的路线。

| 错误代价 | 典型场景 | 选型含义 |
|---|---|---|
| 低 | 普通问答、灵感生成 | 可以优先考虑开发效率 |
| 中 | 企业知识回答、内部分析 | 要加强输出契约、日志、trace |
| 高 | 写库、发通知、成绩/财务/隐私操作 | 优先看权限、人审、显式控制流、回滚 |

因此：

- 高错误代价 + 长流程 = LangGraph/PydanticAI 一类更容易做显式边界；
- 高错误代价 + 业务审批流 = CrewAI 的 Flow 或其他显式流程更自然；
- 高错误代价但系统只是短流程 = 轻量 SDK 也能做，但 guardrails、human-in-the-loop、session 隔离必须补齐。[15][18]

## 4. 五个框架的横向矩阵：看设计中心，不看宣传页

| 框架 | 默认一等公民 | 最强点 | 最大代价 | 最适合 | 最不适合 |
|---|---|---|---|---|---|
| [LangGraph](/iopanda-blog/ai/03-frameworks/01/03/) | 图、状态、恢复、人审 | 长流程与复杂控制流可显式化 [1][6] | 建模成本高，小任务显得重 | 复杂业务流程、审批、恢复、持久状态 | 只有一两步的小 Agent |
| [AutoGen](/iopanda-blog/ai/03-frameworks/01/11/) | 多 Agent 会话与事件协作 | 理解和实验多角色协作很自然 [2][8][9] | 2026 已 maintenance mode，绿地项目风险高 [2][10] | 教学、研究、遗留系统维护 | 新项目长期主干框架 |
| [CrewAI](/iopanda-blog/ai/03-frameworks/01/18/) | 角色团队 + 流程双抽象 | 业务语义强，适合角色协作自动化 [3][12][13][14] | 抽象层次多，设计不清时会“既像人又像流，结果两头都重” | 组织结构明确、任务分工清晰的自动化系统 | 没有角色专长拆分的简单单 Agent |
| [OpenAI Agents SDK](/iopanda-blog/ai/03-frameworks/01/25/) | tools / handoffs / guardrails / sessions / tracing | 现代 Agent 原语一体化，产品落地快 [15][16][17][18] | 对超复杂显式状态图的表达不如 LangGraph 直接 | 多终端、多模态、快速产品化的 Agent 应用 | 极重流程控制、状态恢复主导的系统 |
| [PydanticAI](/iopanda-blog/ai/03-frameworks/01/32/) | 类型、依赖、输出契约、能力组合 | Python 工程纪律强，typed output 和依赖治理清晰 [19][20][23] | 若团队不重类型或不在 Python 主栈，优势会被削弱 | Python 后端团队、重测试与可维护性场景 | 只求快速原型、对契约不敏感的临时项目 |

### 一句人话版

- 你怕系统变成“黑箱长流程”——先看 LangGraph；
- 你怕系统变成“多个角色吵成一团”——先看 CrewAI，再回头理解 AutoGen；
- 你怕自己要手拼一堆现代 Agent 基础设施——先看 OpenAI Agents SDK；
- 你怕输出不稳、依赖乱飞、代码难测——先看 PydanticAI；
- 你已经有 AutoGen 存量——先做迁移评估，不要直接重写，也不要假装维护状态不存在。

## 5. 典型场景：用案例而不是抽象名词做判断

### 场景 A：课程助教问答系统

特点：
- 主体是单 Agent；
- 主要工具是检索、成绩查询、规则查询；
- 高风险请求需要人审；
- 会话隔离和审计很重要；
- 控制流不算极端复杂。

建议：
- 首选 [OpenAI Agents SDK](/iopanda-blog/ai/03-frameworks/01/25/) 或 [PydanticAI](/iopanda-blog/ai/03-frameworks/01/32/)；
- 若后续演化出审批流、长恢复、复杂状态机，再考虑 [LangGraph](/iopanda-blog/ai/03-frameworks/01/03/)。

原因：这里的首要矛盾不是多角色协作，而是工具、安全、会话、输出契约与审计。

### 场景 B：企业内部报告流水线

特点：
- 任务长；
- 有资料收集、草稿、审阅、审批、发布；
- 中途可能失败、暂停、回退；
- 输出要可追溯。

建议：
- 首选 [LangGraph](/iopanda-blog/ai/03-frameworks/01/03/)；
- 若角色协作特别强，可在图中嵌子 Agent 或混合 [CrewAI](/iopanda-blog/ai/03-frameworks/01/18/) 思路。

原因：这里真正复杂的是状态与控制流，而不是“角色能不能多开几个”。

### 场景 C：销售/运营多角色自动化

特点：
- 有线索研究、邮件撰写、线索评分、审批、发送；
- 角色职责天然清晰；
- 与业务流程结合强。

建议：
- 优先 [CrewAI](/iopanda-blog/ai/03-frameworks/01/18/)；
- 若只需要较轻运行时原语，也可看 [OpenAI Agents SDK](/iopanda-blog/ai/03-frameworks/01/25/)。

原因：这里的首要矛盾是“组织协作如何贴近业务语言”，Crew/Flow 的表达优势会更明显。

### 场景 D：Python 后端团队的结构化智能服务

特点：
- 输出需要稳定 schema；
- 依赖要严格注入；
- 测试、mock、静态检查重要；
- 复杂度来自工程治理，而不一定来自多 Agent。

建议：
- 优先 [PydanticAI](/iopanda-blog/ai/03-frameworks/01/32/)；
- 若未来控制流升级，再与图式方案结合。

原因：系统首先会死在契约和维护性，而不是死在“不会多 Agent”。

## 6. 什么时候不该急着上框架，甚至该先自研

这部分也要诚实：不是所有场景都值得立刻选重框架。

先自研最小循环更合适的信号：

1. 你还没验证任务本身是否成立；
2. 任务只有 1~2 个工具调用；
3. 没有长状态、没有审批流、没有多角色专长拆分；
4. 你甚至还说不清 trace、session、guardrail 到底需不需要。

这和 [24] 的建议完全一致：**先用最简单的可行结构，复杂度按需加装。**

一句话：
- 还没确定自己在解决什么问题时，框架会放大迷茫；
- 已经确定复杂度在哪时，框架才会放大生产力。

## 7. 迁移视角：框架选型不是一次性婚姻，而是阶段性联盟

架构师最容易犯的错之一，是把框架当永久信仰。更合理的做法是把它看成阶段性复杂度管理工具。

| 现在的痛点 | 可能的迁移方向 |
|---|---|
| 从手写循环长成复杂状态机 | 自研 → [LangGraph](/iopanda-blog/ai/03-frameworks/01/03/) |
| 从单 Agent 长成角色团队自动化 | 自研 / OpenAI Agents SDK → [CrewAI](/iopanda-blog/ai/03-frameworks/01/18/) |
| 从原型代码长成需要强类型服务 | 自研 / OpenAI Agents SDK → [PydanticAI](/iopanda-blog/ai/03-frameworks/01/32/) |
| 从 AutoGen 存量走向长期维护 | [AutoGen](/iopanda-blog/ai/03-frameworks/01/11/) → 目标框架按实际复杂度重选 |

所以“现在选哪个”不够，最好连“半年后最可能迁去哪”一起想清楚。这样你会自然关注：
- 状态能不能抽出来；
- 工具边界是不是够清楚；
- 输出契约是不是显式；
- 审计和 trace 有没有可迁移性。

## 8. 动手活动：为课程助教 Agent 写框架选型卡

> [!example] 动手活动：输出 `framework-selection-card.md`
>
> **目标**：不是写“我喜欢哪个框架”，而是写一张开发者与架构师都能复核的选型卡。
>
> **步骤**：
> 1. 用一句话定义当前系统：单 Agent 问答、审批型流程、角色协作系统，还是长生命周期有状态系统；
> 2. 从六个维度打分：任务形态、控制流复杂度、错误代价、语言栈、治理要求、迁移压力；
> 3. 对五个框架逐个写：
>    - 为什么可能选它；
>    - 为什么现在不选它；
> 4. 明确给出主选项 + 备选项；
> 5. 再写一行迁移预案：若复杂度增加，下一步会往哪种框架形态演化。
>
> **完成标准**：另一名工程师只读你的选型卡，就能回答「为什么不是别的框架」「三个月后复杂度升级时往哪迁」。

## 9. 边界与排错

- **误区一：把 star 数当架构结论。** 热度只能证明关注度，不能证明你的系统与其设计中心匹配；
- **误区二：把功能表当选型依据。** 大多数主流框架最后都能“做出类似 demo”，真正差在默认路径和维护成本；
- **误区三：觉得多 Agent 天然更高级。** 协作只有在专长分工清晰时才值回复杂度；
- **误区四：低错误代价系统上重框架。** 会把简单问题工程化过度；
- **误区五：高错误代价系统上轻自由度框架却不补治理。** 这是把未来事故留给值班人；
- **误区六：忽略维护状态。** 像 [AutoGen](/iopanda-blog/ai/03-frameworks/01/11/) 这种 maintenance mode 项目，历史价值和新项目风险必须分开判断。[2][7][10]

## 10. 总结

| 关键问题 | 一句话 |
|---|---|
| 选型首先看什么 | 看首要复杂度，不看功能清单 |
| 六个维度 | 任务形态、控制流、错误代价、语言栈、治理要求、迁移压力 |
| LangGraph 什么时候强 | 状态、路由、恢复、人审是主矛盾时 |
| CrewAI 什么时候强 | 角色协作与业务流程表达是主矛盾时 |
| OpenAI Agents SDK 什么时候强 | 现代 Agent 原语要快速凑齐时 |
| PydanticAI 什么时候强 | Python 工程契约、typed output、依赖治理是主矛盾时 |
| AutoGen 的现实位置 | 协作范式重要，但新项目要谨慎看维护状态 |
| 最重要的心法 | 不是选“最强”，而是选“最少后悔” |

**思考题**：如果你的项目今天只是一个带检索和工具调用的课程助教，但你已经确定三个月后要加入审批流、长期记忆、跨会话状态、以及失败恢复，你是现在就一步到位选显式状态图框架，还是先上轻量 SDK 再迁移？哪种选择更合理，取决于什么证据？

> [!note] 参考答案
> 没有唯一正确答案，关键看你是否已经确认那些复杂度“真的会来”，以及它们何时来、代价多大。若三个月后的需求高度确定，且现在就需要按那套边界设计状态与审批，提前选显式状态图框架可能更省返工；若这些需求仍是模糊路线图，而当前系统主要痛点只是工具、会话、输出和 guardrail，先用轻量 SDK 更符合“复杂度按需加装”的工程纪律。证据不应是愿景，而应是已排期的需求、风险等级、团队能力与迁移成本评估。

## 引用

- [1] https://github.com/langchain-ai/langgraph — LangGraph GitHub
- [2] https://github.com/microsoft/autogen — AutoGen GitHub
- [3] https://github.com/crewAIInc/crewAI — CrewAI GitHub
- [4] https://github.com/openai/openai-agents-python — OpenAI Agents SDK GitHub
- [5] https://github.com/pydantic/pydantic-ai — PydanticAI GitHub
- [6] https://docs.langchain.com/oss/python/langgraph/overview — LangGraph docs overview
- [7] https://microsoft.github.io/autogen/stable — AutoGen stable docs
- [8] https://raw.githubusercontent.com/microsoft/autogen/main/docs/design/01%20-%20Programming%20Model.md — AutoGen programming model
- [10] https://github.com/microsoft/agent-framework — Microsoft Agent Framework GitHub
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
- [24] https://www.anthropic.com/research/building-effective-agents — Anthropic: Building effective agents

上一篇：[05 PydanticAI](/iopanda-blog/ai/03-frameworks/01/32/)——上一章把框架视角压到 Python 工程契约；本章把前五篇收口成真正可用于做架构决策的选型矩阵。

下一篇：回到 [03.01 Agent Frameworks](/iopanda-blog/ai/03-frameworks/01/01/) 总览，开始为你的系统写 `framework-selection-card.md`。
