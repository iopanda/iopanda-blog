---
title: "Agentic Pipeline、Routing 与 Tool-aware Retrieval"
number: "03.02.13"
chapter: 3
chapterTitle: "Frameworks"
section: 2
sectionTitle: "RAG and Retrieval Frameworks"
group: "02 Haystack"
created: 2026-09-03 21:50
author: "iopanda"
tags: ["framework", "rag", "retrieval", "haystack", "routing", "agentic-pipeline", "tools"]
sourceId: "3.10.3.2 RAG and Retrieval Frameworks/02 Haystack/04 Agentic Pipeline、Routing 与 Tool-aware Retrieval"
---
# Agentic Pipeline、Routing 与 Tool-aware Retrieval

> Haystack 的一个容易被忽略的特点是：它虽然首先是 pipeline framework，但并不意味着它只能做僵硬直线流程。README 明确提到 loops、branches、conditional logic，以及 agent workflows；`ConditionalRouter` 则直接把条件路由做成正式 component。[54][59] 这说明 Haystack 的态度不是“要么完全 deterministic，要么上自由 agent”，而是允许你在显式 pipeline 里逐步引入更动态的检索和工具感知逻辑。对 retrieval system 来说，这非常重要：很多真实问题的复杂度，恰恰卡在“什么时候该换路、什么时候该取更多上下文、什么时候该调用别的能力”。

**学习目标**：学完本章，你将能够——

1. 解释为什么 Haystack 的 pipeline 可以逐渐长出 agentic 行为；
2. 理解 ConditionalRouter 在系统里为什么是关键组件；
3. 说出 tool-aware retrieval 与普通 retrieval 的区别；
4. 比较 Haystack 的动态 pipeline 路线与 LlamaIndex 的 Router/SubQuestion 路线差异；
5. 为一个知识问答系统设计带 route 的 retrieval chain。

## 1. 概念：agentic pipeline 不是放弃显式控制，而是把动态决策拉回显式链路

很多人一听到 agentic，就以为意味着：
- 完全交给模型自己决定一切；
- 链路不再可预测。

但 Haystack 这条路不是这样。它更像：
- 基础骨架仍然是 pipeline；
- 只是某些节点开始做动态判断；
- loops、branches、routes 仍然是显式表达的。

这和纯 agent-first 路线不同。它试图保住：
- 可追踪；
- 可调试；
- 可替换；
- 可评测。

## 2. `ConditionalRouter`：为什么它是动态 pipeline 的关键支点

`ConditionalRouter` 的实现很有代表性：[59]
- route 由 condition / output / output_name / output_type 定义；
- 用 Jinja2 表达条件和输出；
- 可以根据输入 kwargs 选择不同输出通道；
- 甚至支持 passthrough 路由复杂对象。

这说明 Haystack 对“动态决策”的理解非常系统：
- 不是隐藏在 prompt 里；
- 而是做成显式 routing node。

这样做的好处非常直接：
- 你知道为什么走这条路；
- 你知道另一条路为什么没走；
- 你可以单独测试这个路由条件；
- 你可以把路由接到完全不同的 retrieval chain 上。

## 3. routing 在 retrieval system 里为什么重要

真实 RAG 系统很快会遇到这些问题：
- 这是 FAQ 问题还是规则问题？
- 这次应该走 BM25 还是 embedding retrieval？
- 召回太少时要不要退回宽搜索？
- 问题是否需要调用外部工具，而不是只查文档？

如果没有显式 route，这些逻辑就会逐渐埋进：
- prompt
- if/else
- 隐式 helper 函数

到最后会非常难以维护。Haystack 的 routing component 化，正是在提前阻止这种隐式复杂度蔓延。

## 4. tool-aware retrieval：为什么“检索”有时不只查 document store

Haystack 既讲 pipelines，也讲 agents/workflows。[54] 这意味着在更复杂的系统里，retrieval chain 可能会包含：
- document retriever
- web search
- database lookup
- skill/tool invocation
- memory retrieval

这种时候，retrieval 已经不只是“向量库 top-k”，而是“为当前回答寻找合适上下文来源”的 broader process。

tool-aware retrieval 的关键不是“工具更多”，而是：
- 某些查询应查文档；
- 某些查询应查数据库；
- 某些查询应先扩问题再查；
- 某些查询应直接转人工或走别的 toolchain。

而这些在 Haystack 里最自然的表达方式，不是单个 giant agent，而是**显式的路由与组件组合**。

## 5. 为什么这条路线适合现实业务，而不是只适合 Demo

现实业务系统往往不会问你“你是不是 agentic”。它只会问：
- 遇到这类问题系统能不能换一条更正确的路？
- 问题不适合文档检索时，系统会不会傻傻继续检索？
- 某类高风险请求会不会被分流到更安全的链路？

Haystack 的价值正在这里：
- 动态决策不必牺牲显式结构；
- 工具和检索仍可作为 component 被治理；
- 路由依旧可追踪、可测试、可评测。

## 6. 与 LlamaIndex 的差别：路由也有两种语言

LlamaIndex 的 route 更常落在：
- RouterQueryEngine
- SubQuestionQueryEngine
这类 query objects 上。

Haystack 的 route 更常落在：
- ConditionalRouter
- pipeline branching
- component graph
这类流程图上。

| 维度 | Haystack | LlamaIndex |
|---|---|---|
| 动态决策主要表达在哪 | pipeline/component/route graph | query object family |
| 更像什么 | 流程级路由 | 查询级路由 |
| 最适合什么 | 多链路检索系统 | 多查询对象知识系统 |

一句话：同样是 routing，Haystack 更像“流程分叉”，LlamaIndex 更像“查询对象分派”。

## 7. 课程助教很适合做路由型 retrieval 案例

课程助教天然会遇到：
- FAQ 问题
- 课程概念问答
- 课程规则问答
- 成绩/隐私敏感问题

一个合理的 Haystack 路由可以是：
- FAQ → FAQ retrieval chain
- 概念 → content retrieval chain
- 规则 → policy retrieval chain
- 敏感问题 → approval / manual review path

这说明课程助教在 Haystack 下特别适合通过 ConditionalRouter 表达，而不必一开始就上完整 agent framework。

## 8. 动手活动：给课程助教设计一个 route-first retrieval flow

> [!example] 动手活动：输出 `haystack-routing-plan.md`
>
> **目标**：不要只画一条检索链，而是为不同问题类型设计显式分流。
>
> **步骤**：
> 1. 列问题类型：FAQ、课程内容、课程规则、敏感请求；
> 2. 定义 ConditionalRouter 条件；
> 3. 为每条路分别定义 retriever / ranker / generator；
> 4. 标哪些链路要转人工或调用外部工具；
> 5. 写一句结论：为什么动态 retrieval 不等于黑箱 agent。
>
> **完成标准**：你能清楚说明“这条问题为什么走这条链，而不是别的链”。

## 9. 边界与排错

- **误区一：一动态就该交给 Agent。** 很多动态性可以先靠显式 route 解决；
- **误区二：ConditionalRouter 只是 if/else 语法糖。** 它的价值在于进入 pipeline graph 和测试体系；
- **误区三：tool-aware retrieval 就是工具乱接。** 真正重要的是路由和边界；
- **误区四：显式 route 会太死板。** 事实上它常常比隐式 prompt 路由更稳；
- **误区五：routing 不需要评测。** 实际上 route 错了，后面全链路都白跑。

## 10. 总结

| 关键问题 | 一句话 |
|---|---|
| agentic pipeline 在这里是什么 | 动态决策被保留在显式 pipeline 结构内 |
| ConditionalRouter 的意义 | 把分流逻辑做成正式可观测组件 |
| tool-aware retrieval 的意义 | 查询上下文来源不再局限于单一文档检索 |
| Haystack 的独特性 | 动态 retrieval 不必放弃流程透明性 |
| 课程助教为什么适合 | 问题类型天然分流、治理要求明显 |

**思考题**：为什么很多团队在 retrieval system 复杂起来后，最容易犯的错误不是“没加 enough tools”，而是“没把换路逻辑显式化”？Haystack 的 routing 世界观，本质上是在提前预防哪类系统退化？

> [!note] 参考答案
> 因为系统一复杂，最先失控的往往不是工具数量，而是系统不知道什么时候该走哪条链。若换路逻辑不显式，最终就会埋进 prompt、helper 和零散分支里，导致调试、测试、评测和治理都越来越困难。Haystack 的 routing 世界观，本质上是在预防 retrieval system 从“可解释流程”退化成“隐式 decision soup”。

## 引用

- [54] https://github.com/deepset-ai/haystack/blob/main/README.md — Haystack README
- [59] https://github.com/deepset-ai/haystack/blob/main/haystack/components/routers/conditional_router.py — Haystack conditional router source

上一篇：[03 Hybrid Retrieval、Evaluation 与 Production RAG](/ai/03-frameworks/02/12/)——生产化链路与评测纪律立住后，本篇继续看它如何扩展到更动态的 retrieval/workflow。

下一篇：[05 课程助教 Agent 的 Haystack 架构案例](/ai/03-frameworks/02/14/)——route 和 component 讲完后，下一篇把它们组装回课程助教这个真实系统。
