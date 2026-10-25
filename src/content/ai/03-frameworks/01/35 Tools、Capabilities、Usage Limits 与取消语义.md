---
title: "Tools、Capabilities、Usage Limits 与取消语义"
number: "03.01.35"
chapter: 3
chapterTitle: "Frameworks"
section: 1
sectionTitle: "Agent Frameworks"
group: "05 PydanticAI"
created: 2026-09-03 18:00
author: "iopanda"
tags: ["course", "ai-agent", "framework", "pydantic-ai", "tools", "capabilities", "usage-limits"]
sourceId: "3.10.3.1 Agent Frameworks/05 PydanticAI/03 Tools、Capabilities、Usage Limits 与取消语义"
---
# Tools、Capabilities、Usage Limits 与取消语义

> 前两篇已经把 PydanticAI 的两条主线立住了：[类型/依赖/输出契约](/iopanda-blog/ai/03-frameworks/01/33/) 解决“系统怎么写得稳”，[graph/durable execution](/iopanda-blog/ai/03-frameworks/01/34/) 解决“复杂度上来以后怎么升级”。但如果继续往 docs 和源码里看，会发现它还有另一组非常工程化的能力：tools / toolsets / capabilities / usage limits / cancellation。`docs/tools.md` 明确把工具分成 decorator、工具参数、toolsets 与 combined toolset 路线，并强调 function tools 本质上是比 RAG 更一般化的能力增强。[34] `_run_context.py` 和 `_cancel.py` 又显示出 usage limits、validation context、tracer、cancellation token 都是运行时一等成员。[35] 这说明 PydanticAI 想解决的，不只是“Agent 会不会返回正确结构”，还包括：**能力怎么组合，预算怎么约束，运行怎么中断，系统怎么不在长时间执行里失控。**

**学习目标**：学完本章，你将能够——

1. 解释 PydanticAI 为什么把 tools、toolsets、capabilities 视为不同层次的能力抽象；
2. 理解 UsageLimits 为什么应被视为运行时治理能力，而不是计费附属信息；
3. 说出 CancellationToken / run cancellation 为什么对长时 Agent 很重要；
4. 比较它与 [OpenAI Agents SDK](/iopanda-blog/ai/03-frameworks/01/25/) 在 runtime 原语上的区别；
5. 为一个真实 Agent 设计能力组合、预算边界与取消策略。

## 1. tools：为什么它在 PydanticAI 里首先是“可验证能力”，不是随手函数

`docs/tools.md` 开头说得很清楚：function tools 的作用，是让模型能执行动作或获取额外信息，以帮助生成响应；并且这件事比把所有上下文塞进 instructions 更可控、更可靠。[34]

这里至少有三层含义：
- tool 是能力增强；
- tool 是确定性增强；
- tool 是把一部分逻辑从模型迁回代码。

这与很多人对工具的直觉不同。很多人会把 tools 看成“模型会调用的插件”；PydanticAI 的文档则更像在说：**tools 是让系统重新长出工程边界的方法。**

## 2. tools / toolsets / capabilities：为什么它要做三层而不是一层

PydanticAI 把这几层抽象区分得很清楚：[34]

| 抽象 | 解决什么 | 更像什么 |
|---|---|---|
| tool | 单个可调用能力 | 一个函数或操作点 |
| toolset | 一组相关工具的打包 | 能力包 / 工具域 |
| capability | tools + hooks + instructions + settings 的组合 | 可复用的行为模块 |

这说明它不是在说“工具多就够了”，而是在说：
- 有时你只需要一个工具；
- 有时你需要一个工具域；
- 有时你需要一整簇行为、约束和上下文处理。

这与 [OpenAI Agents SDK](/iopanda-blog/ai/03-frameworks/01/25/) 的思路不同：后者更像统一 runtime primitives，PydanticAI 则更像在做**typed composition ladder**。

## 3. 为什么 function tools 文档会专门拿 RAG 作对比

`docs/tools.md` 里专门写了 “Function tools vs. RAG”。[34]

这件事很值得注意，因为它暴露了 PydanticAI 的一个重要立场：
- RAG 不是特殊神圣能力；
- 它只是 tool augmentation 的一种具体实现；
- 真正的一般性抽象是 tools，不是向量检索本身。

这对架构师尤其重要。因为很多团队一谈 Agent 就立刻想到 RAG，但在 PydanticAI 的语言里，更正确的问题往往是：
- 这是一项 retrieval tool 能解决的事吗？
- 它是否需要作为一组 toolset 存在？
- 它需要被更大 capability 包裹吗？

这让“知识增强”重新回到了通用系统抽象里，而不是继续当特例处理。

## 4. UsageLimits：为什么成本、请求数、工具调用数都是行为边界

从 docs 和 `_run_context.py` 可见，`UsageLimits` 包括：
- `cost_limit`
- `request_limit`
- `total_tokens_limit`
- `tool_calls_limit`
等约束。[23][35]

这非常重要，因为它说明 PydanticAI 的治理不只面向“语义正确”，还面向：
- 预算正确；
- 行为边界正确；
- 运行不会无休止扩张。

对开发者和架构师来说，UsageLimits 的真正价值是：
1. 防止 tool loops；
2. 防止多模型 delegation 无限烧钱；
3. 为实时产品设置运行预算；
4. 让高风险长流程在工程层面“有刹车”。

所以 UsageLimits 不是“账单展示”，而是**运行时宪法的一部分**。

## 5. cancellation：为什么真正成熟的 Agent 框架必须认真处理“停下来”

`_cancel.py` 里对 `CancellationToken` 的说明非常直接：
- 它是 thread-safe handle；
- 可以取消一个或多个 agent runs；
- 一个 token 可以附着到多个并发 run 上，统一取消。[35]

这比普通“raise timeout”思维成熟很多。因为真实 Agent 系统里，停止执行通常有很多来源：
- 用户主动取消；
- 上游请求超时；
- 审批被拒绝；
- 预算耗尽；
- 某个 specialist 已经没必要继续跑。

如果 cancellation 不被当成一等概念，系统最后很容易：
- 半停半跑；
- 工具还在后台继续烧钱；
- stream 关了但 run 没停；
- 子 Agent 不知道父 Agent 已经取消。

PydanticAI 在这里的认真程度非常高，这也是它像工程框架而不像 demo 库的原因。

## 6. run context：为什么 usage / tracer / validation context 都要挂进去

`_run_context.py` 里的 `RunContext` 不只是把 deps 放进去，还挂了：
- `usage_limits`
- `usage`
- `messages`
- `validation_context`
- `tracer`
- retry 计数
- run_step
- tool_call_metadata 等。[35]

这意味着在 PydanticAI 的世界里，Agent 运行上下文不是“顺手带几个对象”，而是一个**统一的运行时事实面板**。

这很关键，因为 tool、capability、output validator、delegate agent 都可能需要：
- 看到预算；
- 看到 trace；
- 看到历史；
- 知道当前 run 处于第几步；
- 知道当前是在第几次重试。

这说明它并不是只靠类型安全，而是在把运行时治理一起工程化。

## 7. capabilities：为什么它在这里真的像中间件组合，而不是功能开关

前面已经提过 capability 是组合单位；这里要再往前推进一步：

在 PydanticAI 里，一个 capability 经常不只改变“模型能做什么”，还改变：
- tool 暴露方式；
- event stream 处理；
- output hook；
- history processor；
- model settings；
- instrumentation。

因此 capability 更像：
- AI 版 middleware
- 或 AI 版 policy bundle

这比传统插件概念强得多，也更接近大型系统里的组合方式。

## 8. 与 OpenAI Agents SDK 的差异：两者都重 runtime，但 PydanticAI 更重 typed governance

OpenAI Agents SDK 也有：
- tools
- sessions
- handoffs
- guardrails
- tracing

但 PydanticAI 在这一层的独特性是：
- 更强调类型和上下文约束如何贯穿这些能力；
- 更强调 UsageLimits 和 cancellation 这样的工程边界；
- 更强调 capability 组合，而不是单个原语的易用性。

一句话：OpenAI Agents SDK 更像“原语全家桶”，PydanticAI 更像“原语受 typed governance 约束的工程系统”。

## 9. 动手活动：为课程助教写一张能力与预算边界表

> [!example] 动手活动：输出 `pydanticai-runtime-budget-plan.md`
>
> **目标**：为课程助教设计一个不是只谈功能、而是同时谈预算与取消的能力边界表。
>
> **步骤**：
> 1. 列出核心 tools：课程资料检索、规则查询、成绩查询；
> 2. 把它们分成 tool / toolset / capability 三层；
> 3. 设计 UsageLimits：最大请求数、最大 tokens、最大 tool calls；
> 4. 设计 cancellation：用户取消、审批拒绝、预算耗尽时分别如何停；
> 5. 写一句结论：为什么这些约束不应留到运维阶段才想。
>
> **完成标准**：你能清楚说明“能力如何组合、预算如何生效、何时应该停”。

## 10. 边界与排错

- **误区一：tool 只是函数注册。** 在 PydanticAI 里，tool 更像运行时契约的一部分；
- **误区二：UsageLimits 只是计费显示。** 它首先是行为边界；
- **误区三：cancel 不重要，最多 timeout。** 多 tool、多 agent、长时任务里，取消是系统语义；
- **误区四：capability 只是功能开关。** 它其实能改写运行时多个层面；
- **误区五：typed framework 就不需要 runtime discipline。** 恰恰相反，它是在把 runtime discipline 拉进类型和上下文体系里。

## 11. 总结

| 关键问题 | 一句话 |
|---|---|
| tool / toolset / capability 的区别 | 单点能力 / 工具域 / 行为与策略组合单元 |
| UsageLimits 是什么 | 运行时预算与行为边界控制器 |
| cancellation 是什么 | 让长时、多步、多 agent 运行真正可停的系统语义 |
| RunContext 暴露了什么 | usage、trace、messages、validation、retry 等统一运行面板 |
| PydanticAI 在 runtime 上的特点 | 不是只给原语，而是给受类型和治理约束的原语 |

**思考题**：为什么一个看似“类型很安全”的 Agent 系统，如果没有 UsageLimits 和 cancellation，仍然可能在真实环境里失控？这暴露的是哪一类工程盲点？

> [!note] 参考答案
> 因为类型安全主要解决结构与接口问题，并不自动解决行为边界问题。没有 UsageLimits，系统可能在工具循环、多模型 delegation、长流式会话里持续烧 tokens 和请求；没有 cancellation，系统可能在用户已放弃、审批已拒绝、预算已超限后仍继续运行。这暴露的不是类型盲点，而是运行时治理盲点：系统“写得对”不等于系统“停得住”。

## 引用

- [19] https://pydantic.dev/docs/ai — Pydantic AI docs
- [23] https://raw.githubusercontent.com/pydantic/pydantic-ai/main/docs/multi-agent-applications.md — Pydantic AI multi-agent applications doc
- [34] https://github.com/pydantic/pydantic-ai/blob/main/docs/tools.md — Pydantic AI tools doc
- [35] https://github.com/pydantic/pydantic-ai/blob/main/pydantic_ai_slim/pydantic_ai/_cancel.py — Pydantic AI cancellation source

上一篇：[02 Graph、Durable Execution 与工程化升级](/iopanda-blog/ai/03-frameworks/01/34/)——图与 durable 路线解释了复杂度怎么升级；本篇继续下钻能力组合、预算与取消这些运行时纪律。

下一篇：[04 Realtime、Examples、Evals 与多 Agent 形态](/iopanda-blog/ai/03-frameworks/01/36/)——运行纪律立住后，下一篇再看它如何覆盖 realtime、examples、评测与多 Agent 产品形态。
