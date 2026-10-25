---
title: "PydanticAI 与 LangGraph、CrewAI、OpenAI Agents SDK 的深度对比"
number: "03.01.38"
chapter: 3
chapterTitle: "Frameworks"
section: 1
sectionTitle: "Agent Frameworks"
group: "05 PydanticAI"
created: 2026-09-03 18:24
author: "iopanda"
tags: ["course", "ai-agent", "framework", "pydantic-ai", "comparison", "architecture"]
sourceId: "3.10.3.1 Agent Frameworks/05 PydanticAI/06 PydanticAI 与 LangGraph、CrewAI、OpenAI Agents SDK 的深度对比"
---
# PydanticAI 与 LangGraph、CrewAI、OpenAI Agents SDK 的深度对比

> 到这里，PydanticAI 本身已经拆得足够细了：[接口契约](/ai/03-frameworks/01/33/)、[graph/durable 升级](/ai/03-frameworks/01/34/)、[运行时纪律](/ai/03-frameworks/01/35/)、[应用形态](/ai/03-frameworks/01/36/)、[课程助教案例](/ai/03-frameworks/01/37/)。这一篇不再问“它能做什么”，而是专门回答：**它首先不想解决什么。** 也就是说，当你面对 [LangGraph](/ai/03-frameworks/01/03/)、[CrewAI](/ai/03-frameworks/01/18/)、[OpenAI Agents SDK](/ai/03-frameworks/01/25/) 时，PydanticAI 的独特性到底是什么？这篇就从 typed engineering 视角来反向回答。

**学习目标**：学完本章，你将能够——

1. 站在 PydanticAI 视角，解释它与 LangGraph、CrewAI、OpenAI Agents SDK 的设计中心差异；
2. 理解为什么“先稳契约”是一条独立路线，而不是功能少；
3. 用工程契约复杂度、控制流复杂度、组织复杂度、runtime primitives 复杂度四个维度做判断；
4. 判断什么时候 PydanticAI 是最自然的主骨架，什么时候它只是中间层；
5. 写出一段“为什么这里选 PydanticAI 而不是别的”的架构说明。

## 1. 比较前提：PydanticAI 首先是一套 typed engineering 语言

理解 PydanticAI 最关键的一点是：
- 它不是先让系统看起来像团队；
- 也不是先让系统看起来像图；
- 也不是先把所有现代原语摆齐；
- 它先问：系统接口、依赖、输出、能力组合、预算和取消有没有被工程化。

所以它的第一语言是：
- output_type
- deps_type
- capabilities
- UsageLimits
- cancellation
- gradual graph/durable upgrade

这让它的“独特性”并不在花哨，而在收敛。

## 2. PydanticAI vs LangGraph：typed component language vs state graph language

### 2.1 LangGraph 的强项

LangGraph 更先问：
- state 是什么；
- node 是什么；
- edge 怎么分叉；
- interrupt 和 checkpoint 放哪。

### 2.2 PydanticAI 的不同

PydanticAI 更先问：
- 输出对象长什么样；
- 依赖从哪里注入；
- capability 怎么打包；
- 使用预算怎么设；
- 系统什么时候需要升级到 graph。

| 维度 | PydanticAI | LangGraph |
|---|---|---|
| 默认表达语言 | typed components / deps / output | state / node / edge / checkpoint |
| 更像什么 | 工程框架 | 运行时图引擎 |
| 最强主矛盾 | 接口与维护复杂度 | 控制流与恢复复杂度 |
| graph 的位置 | 高级升级路径 | 主入口之一 |

一句话：LangGraph 更像“先让系统转对”，PydanticAI 更像“先让系统写对”。

## 3. PydanticAI vs CrewAI：工程契约语言 vs 业务组织语言

CrewAI 更先让你画：
- 研究员
- 撰写员
- 审查员
- task / crew / flow

PydanticAI 更先让你写：
- output schema
- deps
- tools / toolsets
- capabilities
- UsageLimits

| 维度 | PydanticAI | CrewAI |
|---|---|---|
| 首先关心什么 | 接口稳定、依赖清晰、运行治理 | 角色清晰、任务清晰、流程清晰 |
| 更像什么 | typed backend / service framework | business workflow / organization framework |
| 最适合谁 | Python 后端团队 | 流程组织和角色分工明显的团队 |
| 系统最先讨论什么 | schema / deps / budget | roles / tasks / approvals |

所以：
- 若你的团队首先痛在服务边界与维护性，PydanticAI 很自然；
- 若首先痛在业务角色与流程表达，CrewAI 很自然。

## 4. PydanticAI vs OpenAI Agents SDK：typed governance vs runtime primitives language

OpenAI Agents SDK 更先把：
- tools
- handoffs
- guardrails
- sessions
- tracing
- sandbox
- realtime
- voice
统一成 runtime primitives。

PydanticAI 则更先把：
- output
- deps
- capabilities
- UsageLimits
- cancellation
统一成 typed governance。

| 维度 | PydanticAI | OpenAI Agents SDK |
|---|---|---|
| 第一性问题 | 怎么把 Agent 写成可维护 Python 组件 | 怎么把现代 Agent runtime 原语一口气凑齐 |
| 更像什么 | engineering framework | runtime platform layer |
| 最强吸引力 | 契约、依赖、可测性、渐进升级 | 多形态产品能力、runtime glue 收口 |
| 产品化路径 | 先稳接口，再扩形态 | 先稳形态，再统一 runtime |

一句话：一个更像“工程地基”，一个更像“产品底座”。

## 5. 为什么“先稳契约”不是保守，而是控制复杂度的另一种勇敢

很多团队一看到更炫的多 Agent、voice、实时交互，就会觉得 typed 路线像保守派。

其实不是。PydanticAI 的路线只是把优先级排成：
1. 先稳输出；
2. 先稳依赖；
3. 先稳能力组合；
4. 先稳预算与取消；
5. 再长出 graph、delegation、realtime、voice。

这不是少做事，而是拒绝在边界不稳时盲目放大复杂度。

## 6. 什么时候 PydanticAI 最像正确主骨架

这些场景里，它往往很自然：

1. 你首先在做 Python 后端服务；
2. 你最痛的是下游接口不稳、依赖乱飞、测试难写；
3. 你需要 structured output 和 typed validation；
4. 你希望多 Agent / graph / durable execution 以渐进方式进入；
5. 你不想一开始就被最重的抽象绑住。

这时它常常不是“最花哨的框架”，但会是“最能持续写下去的框架”。

## 7. 什么时候它会显得不够，或者只是中间层

这些情况下，它可能不是最优主骨架：

1. 你从 Day 1 就明确面对复杂状态图与恢复；
2. 你从 Day 1 就是强业务角色协作与审批流；
3. 你更需要一整套 voice/realtime/sandbox/runtime glue 立即成型；
4. 你的团队并不在 Python typed engineering 主栈内。

这时：
- LangGraph 可能更直接；
- CrewAI 可能更贴业务；
- OpenAI Agents SDK 可能更省集成时间。

## 8. 从 PydanticAI 视角看“为什么不用别的”

### 不选 LangGraph 的理由
- 你最大的痛还不是状态图，而是接口和依赖边界；
- 你不想在复杂度尚未成熟时就进入最重编排心智。

### 不选 CrewAI 的理由
- 你当前最大的痛不是组织流程表达，而是代码和服务边界稳定性；
- 你想先把 Agent 像系统组件一样纳入工程体系。

### 不选 OpenAI Agents SDK 的理由
- 你最大的痛不是 runtime primitives 不够，而是 typed contract 不够强；
- 你更希望复杂形态是在稳定地基上长出来。

这些都不是说别的框架弱，而是说：**PydanticAI 首先在解“工程维护复杂度”这个问题。**

## 9. 动手活动：写一段“为什么我们选 PydanticAI”的架构说明

> [!example] 动手活动：输出 `why-pydanticai.md`
>
> **目标**：为一个 Python 后端 Agent 服务写一段可复核的选型说明。
>
> **步骤**：
> 1. 用一句话写出项目主矛盾；
> 2. 说明为什么 output/deps/capabilities/limits 是首要边界；
> 3. 对比 LangGraph、CrewAI、OpenAI Agents SDK：它们优先解决的是什么；
> 4. 说明为什么这些不是当前第一优先级；
> 5. 补一段未来演化：何时可能需要 graph/durable 或更强产品 runtime。
>
> **完成标准**：读者看完后会觉得你是在按工程复杂度选型，而不是按流行度投票。

## 10. 边界与排错

- **误区一：PydanticAI 只是轻量框架。** 它其实只是把复杂度引入得更克制；
- **误区二：typed output 强就代表适合一切。** 若主矛盾是控制流或组织流，它未必优先；
- **误区三：没有先画图，就说明架构不够强。** 有时稳定接口才是更强的起点；
- **误区四：它只适合结构化抽取。** examples 已说明它远不止此；
- **误区五：既然以后可能上 graph，那不如现在就全上。** 这正违背了它的渐进哲学。

## 11. 总结

| 关键问题 | 一句话 |
|---|---|
| PydanticAI 最像什么 | 一个把 Agent 拉回 typed engineering 世界的框架 |
| 它和 LangGraph 的核心差异 | 一个先稳接口契约，一个先稳状态图与恢复 |
| 它和 CrewAI 的核心差异 | 一个先稳服务边界，一个先稳业务组织表达 |
| 它和 OpenAI Agents SDK 的核心差异 | 一个先稳 typed governance，一个先稳 runtime primitives |
| 什么时候选它 | 当你的系统首先死在维护性、接口和依赖复杂度上 |
| 什么时候谨慎 | 当主矛盾早已转到状态机、组织流或产品 runtime glue |

**思考题**：如果一个团队同时想要“更稳定的输出与依赖边界”和“未来能长成复杂 Agent 系统”，这是否说明 PydanticAI 更像起点而不是终点？为什么这种“先收敛、再扩张”的路线在很多真实团队里反而更稳？

> [!note] 参考答案
> 是的，PydanticAI 在很多团队里更像一个优秀起点：先让系统的接口、依赖、能力组合、预算和取消都收敛到可维护状态，再根据真实需求决定是否升级到 graph、durable execution、delegation 或更复杂产品形态。这种路线之所以稳，是因为它把复杂度的引入和需求成熟度绑定起来，避免团队在地基未稳时就同时面对工程复杂度和产品复杂度。

## 引用

- [19] https://pydantic.dev/docs/ai — Pydantic AI docs
- [20] https://raw.githubusercontent.com/pydantic/pydantic-ai/main/docs/agent.md — Pydantic AI agent doc
- [23] https://raw.githubusercontent.com/pydantic/pydantic-ai/main/docs/multi-agent-applications.md — Pydantic AI multi-agent applications doc
- [36] https://github.com/pydantic/pydantic-ai/tree/main/examples/pydantic_ai_examples — Pydantic AI examples tree

上一篇：[05 课程助教 Agent 的 PydanticAI 架构案例](/ai/03-frameworks/01/37/)——案例说明了它如何从 typed service 长成真实系统；本篇则说明它在整个版图中的独特位置。

下一篇：回到 [06 Agent Framework 选型矩阵](/ai/03-frameworks/01/02/)，把 PydanticAI 放回 top5 全局版图中复核。
