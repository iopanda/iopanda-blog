---
title: "Realtime、Examples、Evals 与多 Agent 形态"
number: "03.01.36"
chapter: 3
chapterTitle: "Frameworks"
section: 1
sectionTitle: "Agent Frameworks"
group: "05 PydanticAI"
created: 2026-09-03 18:08
author: "iopanda"
tags: ["course", "ai-agent", "framework", "pydantic-ai", "realtime", "evals", "examples", "multi-agent"]
sourceId: "3.10.3.1 Agent Frameworks/05 PydanticAI/04 Realtime、Examples、Evals 与多 Agent 形态"
---
# Realtime、Examples、Evals 与多 Agent 形态

> 前三篇已经把 PydanticAI 的核心路线讲清楚了：[先稳住契约](/ai/03-frameworks/01/33/)、[再按需升级 graph/durable](/ai/03-frameworks/01/34/)、[再补运行时治理](/ai/03-frameworks/01/35/)。这一篇要补的是另一半：**它并不是一个只适合写后端结构化抽取的小框架。** 从 examples 树和文档可见，PydanticAI 已经覆盖了 realtime voice、WebRTC、medical delegation、data analyst、evals、AG-UI、人类审批、chat app 等非常多样的产品形态。[19][23][36] 这说明它的野心并不只是“让输出更类型安全”，而是：**在不放弃工程契约的前提下，把 Agent 系统逐步扩展到真实应用形态。**

**学习目标**：学完本章，你将能够——

1. 解释为什么 PydanticAI 的 examples 目录本身就暴露了它的产品版图；
2. 理解 realtime、voice、evals、AG-UI、多 Agent delegation 在这个框架里是怎样被吸纳的；
3. 说出为什么 typed engineering 路线并不排斥丰富应用形态；
4. 比较它与 [OpenAI Agents SDK](/ai/03-frameworks/01/25/) 在多形态产品支持上的区别；
5. 为一个课程助教系统设计 PydanticAI 风格的应用演化路线。

## 1. examples 目录为什么值得认真看

有些框架的 examples 只是 quickstart 变体；PydanticAI 的 examples 则更像一张产品形态地图。[36]

里面至少能看到这些方向：
- weather / chat / bank support 这类轻应用；
- data analyst / SQL generation 这类工具增强应用；
- medical delegation 这类多 Agent 委托；
- realtime voice / WebRTC / camera 这类实时与多模态；
- evals 这类评测与数据集生成；
- AG-UI / tool approval / human-in-the-loop 这类交互形态。

这说明 PydanticAI 的真实目标并不是“只把一个模型包好”，而是让**typed runtime 能延展到多种应用形态**。

## 2. realtime / voice：为什么 typed engineering 路线也会走向实时交互

很多人会误以为：
- typed framework 更像后端；
- realtime / voice 更像产品 runtime；
- 两者不太相干。

但 PydanticAI 其实在告诉你：这两者完全可以结合。原因很简单：
- 即使进入实时交互，依赖仍然要显式；
- 工具仍然要受约束；
- 输出仍然要可消费；
- 事件流、usage、取消、trace 反而更需要工程化。

也就是说，realtime 不是在逃离工程纪律，而是在更强地要求工程纪律。

## 3. delegation：为什么它对多 Agent 的态度依然很“渐进”

在 multi-agent 文档里，PydanticAI 把复杂度分成：
- 单 Agent workflows
- agent delegation
- programmatic hand-off
- graph based control flow
- deep agents。[23]

examples 中也能看到诸如 `medical_agent_delegation.py` 这种模式。[36]

这暴露了一个很清楚的设计哲学：
- 多 Agent 不是默认起点；
- delegation 是在单 Agent 工程稳定之后的下一步；
- 框架更在乎“升级路径是否干净”，而不是“一上来就支持多少角色”。

对开发者和架构师，这一点非常有价值，因为它避免了很多团队刚摸到 Agent 就直接过度协作化。

## 4. evals：为什么评测会被自然纳入框架世界观

examples 里有完整的 evals 示例：
- 生成数据集
- 加自定义 evaluators
- 单元测试
- 比较模型。[36]

这说明 PydanticAI 很清楚：一旦把 Agent 做成工程组件，评测和测试就不再是“附加流程”，而会自然进入开发主路径。

这和你的写作风格其实高度一致：
- 不是只讲会不会做；
- 而是讲怎么验证、怎么比较、怎么把行为变成证据。

所以在 PydanticAI 这条路上，evals 不是独立世界，而是工程闭环的一部分。

## 5. AG-UI / human-in-the-loop：为什么这不是在偏离后端框架，而是在补完应用形态

examples 里还有：
- tool approval
- shared state
- predictive state updates
- human in the loop
- agentic generative UI。[36]

这说明 PydanticAI 并不满足于“后端 typed SDK”这个身份，而是开始正面接触：
- 前后端协同的 agentic UI；
- 人类如何正式进入运行环；
- 共享状态如何在交互层表现出来。

这很值得注意，因为它说明 PydanticAI 的 typed engineering 路线不是保守收缩，而是在尝试把应用形态也纳入有纪律的设计里。

## 6. 为什么这条路和 OpenAI Agents SDK 看起来像，但本质不同

两者都已经支持：
- realtime
- voice
- 多 agent delegation
- tools
- eval / tracing / UI-like examples

但它们的出发点不同：

| 维度 | PydanticAI | OpenAI Agents SDK |
|---|---|---|
| 起点 | typed engineering contract | runtime primitives |
| 扩展方式 | 从稳定组件向丰富形态延展 | 从丰富原语向多形态产品覆盖 |
| 最自然的心智 | 先把系统写稳，再做更多形态 | 先把形态支撑起来，再统一 runtime |

这就是为什么它们表面能力越来越接近，气质却仍然不同。

## 7. 为什么 examples 的多样性反而说明它不是“玩具 typed SDK”

如果一个框架只能优雅地做结构化抽取，却很难走向：
- 实时交互
- 多 Agent 委托
- 人工审批
- 评测闭环
- UI 共享状态
那它更像某类窄工具。

PydanticAI 不是这样。它在 examples 上铺开的版图，恰恰说明：
**typed 路线不是限制，而是试图让更多复杂形态也受工程约束。**

## 8. 给课程助教的演化路线：PydanticAI 怎么从后端服务长成产品系统

一个自然路线可以是：

1. Stage 1：typed output + deps + tools
   - 先把课程问答和成绩查询做稳；
2. Stage 2：capabilities + UsageLimits + event streams
   - 加预算边界、观测和能力组合；
3. Stage 3：delegation / hand-off
   - 把规则解释或审查角色拆出；
4. Stage 4：graph / durable execution
   - 当审批流和恢复需求变强时升级；
5. Stage 5：voice / web / teacher workspace
   - 再把系统长成多终端产品。

这很符合 PydanticAI 的整体哲学：复杂度按阶段进入，而不是一步到位全开。

## 9. 动手活动：为课程助教写一份 PydanticAI 演化路线图

> [!example] 动手活动：输出 `course-ta-pydanticai-roadmap.md`
>
> **目标**：不是直接堆 feature，而是按复杂度成熟度设计课程助教的演化节奏。
>
> **步骤**：
> 1. 列第一阶段最小 typed 能力；
> 2. 列第二阶段要加的 capabilities 和 UsageLimits；
> 3. 判断何时需要 delegation；
> 4. 判断何时需要 graph / durable execution；
> 5. 判断何时值得扩到 voice / realtime / UI。
>
> **完成标准**：你能解释“为什么先做什么，后做什么”，而不是列一张功能愿望清单。

## 10. 边界与排错

- **误区一：typed framework 就只能做后端。** examples 已经说明不是；
- **误区二：一看到 voice/realtime 就说明框架该从产品入口学起。** PydanticAI 更像从工程边界往外扩；
- **误区三：多 Agent 支持了就说明应该早早拆角色。** 它的文档恰恰反着建议：渐进升级；
- **误区四：examples 多就等于每种都该上。** 复杂度依然要按需加装；
- **误区五：有 evals 就等于质量自动可控。** 评测能力要进入开发纪律，不能只停在示例目录里。

## 11. 总结

| 关键问题 | 一句话 |
|---|---|
| examples 暴露了什么 | PydanticAI 的应用版图远不止结构化输出 |
| realtime / voice 说明什么 | typed engineering 与现代交互形态并不冲突 |
| delegation 说明什么 | 多 Agent 是渐进升级路径，而不是默认起点 |
| evals 说明什么 | 评测是工程闭环的一部分，而不是附加文档 |
| 整体定位 | 它像一个从 typed backend 稳步长成完整 Agent 系统的平台 |

**思考题**：为什么一个强调类型、依赖和输出契约的框架，最终反而更有可能稳稳地长出 voice、realtime、multi-agent、UI 等复杂形态？这和“先把边界写稳”之间是什么关系？

> [!note] 参考答案
> 因为复杂形态真正可怕的不是界面变多，而是边界和组合复杂度爆炸。先把类型、依赖、输出、工具、预算和取消这些边界写稳，后面新增 voice、realtime、delegation、UI 时，就不是在沙地上叠楼，而是在稳定接口上扩层。PydanticAI 的思路正是：先修地基，再长复杂形态。

## 引用

- [19] https://pydantic.dev/docs/ai — Pydantic AI docs
- [23] https://raw.githubusercontent.com/pydantic/pydantic-ai/main/docs/multi-agent-applications.md — Pydantic AI multi-agent applications doc
- [36] https://github.com/pydantic/pydantic-ai/tree/main/examples/pydantic_ai_examples — Pydantic AI examples tree

上一篇：[03 Tools、Capabilities、Usage Limits 与取消语义](/ai/03-frameworks/01/35/)——运行时纪律讲完后，本篇继续看它如何扩展到更丰富的产品形态。

下一篇：[05 课程助教 Agent 的 PydanticAI 架构案例](/ai/03-frameworks/01/37/)——把这些 typed/runtime 能力重新装回课程助教这个真实系统。
