---
title: "Handoffs、Agent-as-Tool 与 MCP 工具生态"
number: "03.01.28"
chapter: 3
chapterTitle: "Frameworks"
section: 1
sectionTitle: "Agent Frameworks"
group: "04 OpenAI Agents SDK"
created: 2026-09-03 17:20
author: "iopanda"
tags: ["course", "ai-agent", "framework", "openai-agents-sdk", "handoffs", "mcp", "multi-agent"]
sourceId: "3.10.3.1 Agent Frameworks/04 OpenAI Agents SDK/03 Handoffs、Agent-as-Tool 与 MCP 工具生态"
---
# Handoffs、Agent-as-Tool 与 MCP 工具生态

> [前面那一篇](/iopanda-blog/ai/03-frameworks/01/26/)已经讲过：OpenAI Agents SDK 对多 Agent 的理解，不是先把几个角色摆在一起聊天，而是先给出 handoff 和 agent-as-tool 这类受控委托原语。这条路线在官方 `multi_agent.md` 里讲得非常清楚：**Agents as tools** 适合 manager 持有控制权并调用 specialists；**handoffs** 适合 triage agent 把当前回合直接交给 specialist。[1][2] 再结合 MCP 文档与 examples 目录，你会发现 OpenAI Agents SDK 对“外部世界”的理解也很现代：工具不再只有本地函数，还包括 MCP servers、hosted MCP、approval callbacks、远程连接与工具过滤。[1] 这一章就专门拆这条生态线：**为什么受控委托和标准化工具连接，比传统多 Agent 群聊更适合产品级系统。**

**学习目标**：学完本章，你将能够——

1. 区分 handoff 与 agent-as-tool 的职责边界；
2. 理解为什么 OpenAI Agents SDK 的多 Agent 设计更像“委托系统”而不是“群聊系统”；
3. 说出 MCP 在这里扮演的角色：不仅是工具接入协议，也是运行时边界的一部分；
4. 比较它与 [AutoGen](/iopanda-blog/ai/03-frameworks/01/11/)、[CrewAI](/iopanda-blog/ai/03-frameworks/01/18/) 的协作模型差异；
5. 为一个课程助教系统设计 triage + specialist + MCP 工具拓扑。

## 1. 概念：OpenAI Agents SDK 的多 Agent 核心不是“大家一起聊”，而是“谁接管、谁辅助”

官方 `multi_agent.md` 给出的两种主要模式非常具有代表性：[1]

| 模式 | 工作方式 | 最适合 |
|---|---|---|
| Agents as tools | manager agent 保留控制权，把 specialist 当工具调用 | 你希望一个上层 agent 统一整合结果、统一 guardrail、统一输出 |
| Handoffs | triage agent 把当前 turn 交给 specialist，由 specialist 直接完成余下工作 | 你希望 specialist 真正接管当前会话上下文和指令 |

这两种模式的差异不是 API 细节，而是责任结构差异：
- agent-as-tool：上层负责最后一公里；
- handoff：上层负责分流，专长代理负责该回合剩余工作。

这比“让多个角色来回聊天，最后看谁说得像对的”成熟得多。

## 2. 为什么这条路线更适合产品系统

多 Agent 在真实系统里最大的风险之一，是责任边界不清：
- 谁负责最终输出？
- 谁负责上下文继承？
- 谁负责 guardrails？
- 谁决定是否继续调用更多子代理？

OpenAI Agents SDK 的 handoff / as-tool 分离，实际上是在提前为这些问题定规则：

1. **bounded help**：specialist 只帮忙做一段明确子任务；
2. **explicit takeover**：当 routing 本身就是任务的一部分，才交控制权；
3. **traceability**：谁接管了任务、谁返回了结果，会更容易追踪；
4. **shared control surface**：manager 模式下，guardrails、sessions、最终 output 更容易统一控制。

所以这不是更花哨的多 Agent，而是更适合产品治理的多 Agent。

## 3. Agents as tools：为什么它特别适合“经理-专家”结构

当一个系统需要多个 specialist，但你不希望 specialist 直接和用户对话时，agent-as-tool 很自然。

典型场景：
- 一个课程助教 Router 负责统一接待；
- 它调用“课程问答专家”“成绩查询专家”“规则说明专家”；
- 最后仍由 Router 汇总并统一回答用户。

这条路线的好处是：
- 统一输出风格；
- 统一外层 guardrail；
- 统一 session 边界；
- specialist 可以非常专注，不必承担全部产品责任。

代价是：
- manager prompt 更重；
- manager 成为中心协调点；
- 若 specialists 太多，调度复杂度会上升。

## 4. Handoffs：为什么它更像“路由到正确处理者”

handoff 适合这样的问题：
- 当前回合真正需要 specialist 自己带着专门 instructions 去完成；
- 不是“帮主代理做个子任务”，而是“现在由你来处理这类问题”。

比如：
- 普通课程问答由助教主代理处理；
- 一旦识别成“成绩查询”，handoff 给成绩 specialist；
- 成绩 specialist 拥有更窄但更强的权限与 guardrail；
- 该回合后续由它直接完成。

与 agent-as-tool 相比，它更像真正的路由，不只是“专家咨询”。

## 5. 为什么官方明确区分这两者

`multi_agent.md` 里直接给出使用建议：[1]
- bounded subtask → agents as tools
- routing and ownership of current turn → handoffs

这件事非常值得强调，因为很多团队会把两者混着用，导致：
- specialist 到底是在帮忙，还是在接管，不清楚；
- tracing 里角色关系难解释；
- session 和记忆边界混乱；
- 输出责任不清。

所以这不是“两个名字差不多的 feature”，而是两种不同的系统责任模型。

## 6. MCP：为什么工具生态会成为这里的重要组成部分

OpenAI Agents SDK 不只支持本地函数工具，还在 docs/examples 中大量展示 MCP：
- filesystem examples
- remote servers
- HTTP/SSE transport
- `MCPServerManager`
- `MCPUtil.get_all_function_tools`
- approval callbacks
- hosted MCP connectors。[1]

这说明框架对工具世界的理解已经不是：
- 写几个本地 Python 函数；
而是：
- agent 要接到一个标准化的工具生态；
- 工具可能远程部署；
- 工具可能需要审批；
- 工具列表可能需要过滤和生命周期管理。

这和普通“function calling”相比，工程成熟度高了一个层级。

## 7. 为什么 MCP 对开发者和架构师重要

对开发者：
- 少写重复胶水；
- 工具接口更统一；
- 本地函数和远程工具世界开始收敛。

对架构师：
- 工具从应用内实现，逐渐升级成平台能力；
- 工具生命周期、权限、审批和远程接入都开始成为架构问题；
- agent 系统不再只依赖单仓库内的函数定义。

也就是说，MCP 在这里不仅是工具协议，也是**系统边界协议**。

## 8. 与 AutoGen / CrewAI 的协作思路差异

| 框架 | 多 Agent 默认怎么想 | OpenAI Agents SDK 的不同 |
|---|---|---|
| AutoGen | 角色对话与事件传播 | 它更强调显式委托与接管 |
| CrewAI | 角色团队与任务分工 | 它更强调 runtime 级委托和 specialist ownership |
| OpenAI Agents SDK | handoff / agent-as-tool / MCP tools | 协作更像产品运行时，而不是组织模拟 |

一句话：它更像“任务路由与能力委托系统”，而不像“让角色彼此开会”。

## 9. 课程助教的推荐拓扑：triage + specialist + MCP

一个适合课程助教的拓扑可以是：

1. Triage Agent
   - 判断是普通问答、规则说明、成绩查询、资料整理请求；
2. 课程问答 Specialist
   - 可接课程资料检索 MCP；
3. 规则说明 Specialist
   - 可接课程规则 / 发布规范工具；
4. 成绩查询 Specialist
   - 权限最严格，外层额外加 tool guardrail 与 approval。

如果是：
- 想统一口径回复 → triage + agent-as-tool
- 想把不同类问题真正交给 specialist 当前回合接管 → handoffs

## 10. 动手活动：为课程助教设计 handoff / as-tool 决策表

> [!example] 动手活动：输出 `openai-agents-routing-plan.md`
>
> **目标**：不要只说“会多 Agent”，而是明确什么时候 handoff、什么时候 as-tool。
>
> **步骤**：
> 1. 列 4 类问题：课程问答、规则咨询、成绩查询、资料整理；
> 2. 对每类问题判断：
>    - specialist 是辅助 manager，还是直接接管？
> 3. 为每类 specialist 写出允许接的 MCP/tool 列表；
> 4. 标哪一类需要 approval；
> 5. 写一句结论：为什么不能把所有 specialist 都当成 handoff。
>
> **完成标准**：你能清楚解释“什么时候让 manager 保持控制，什么时候让 specialist 拿走本回合”。

## 11. 边界与排错

- **误区一：handoff 和 as-tool 差不多。** 它们背后是不同责任模型；
- **误区二：specialist 越多越强。** 多 specialist 也会带来 session、trace、guardrail 管理负担；
- **误区三：有 MCP 就不用想权限。** 标准化接入不等于默认安全；
- **误区四：把 MCP 当插件市场。** 它更像系统边界协议；
- **误区五：triage 只是分类器。** 在 handoff 场景里，它其实是控制权分配器。

## 12. 总结

| 关键问题 | 一句话 |
|---|---|
| agent-as-tool 适合什么 | specialist 辅助 manager 完成子任务 |
| handoff 适合什么 | specialist 接管当前回合并直接完成处理 |
| 为什么要区分 | 因为责任边界、上下文继承和最终输出归属不同 |
| MCP 在这里是什么 | 标准化工具生态与系统边界协议 |
| OpenAI Agents SDK 的协作观 | 受控委托与路由，而不是自由群聊 |

**思考题**：如果一个团队把所有 specialist 都设计成 handoff，会带来什么问题？反过来，若所有 specialist 都只是 manager 的工具，又会在哪些场景下显得别扭？

> [!note] 参考答案
> 若全部 handoff，系统容易出现活跃 agent 切换过多、上下文 ownership 混乱、用户体验不一致、外层统一 guardrail 更难控制的问题；若全部 as-tool，又会让 manager prompt 变得越来越重，且某些本该由 specialist 直接接管的场景会变得别扭，例如强权限 specialist 或强专长 specialist 无法自然拥有当前回合。正确做法不是统一一种模式，而是按责任边界选择。

## 引用

- [1] https://openai.github.io/openai-agents-python — OpenAI Agents SDK docs
- [2] https://raw.githubusercontent.com/openai/openai-agents-python/main/docs/handoffs.md — OpenAI Agents handoffs doc
- [4] https://github.com/openai/openai-agents-python — OpenAI Agents SDK GitHub

上一篇：[02 Sandbox、Guardrails、Sessions 与产品化](/iopanda-blog/ai/03-frameworks/01/27/)——产品化底座讲完后，本篇继续拆它的多 Agent 与工具生态观。

下一篇：[04 Tracing、Testing、Realtime 与 Voice 的应用形态](/iopanda-blog/ai/03-frameworks/01/29/)——协作和工具拓扑立住后，下一篇看它如何覆盖现代 Agent 的多终端、多模态与测试观测场景。
