---
title: "课程助教 Agent 的 AutoGen 架构案例"
number: "03.01.16"
chapter: 3
chapterTitle: "Frameworks"
section: 1
sectionTitle: "Agent Frameworks"
group: "02 AutoGen"
created: 2026-09-03 19:18
author: "iopanda"
tags: ["course", "ai-agent", "framework", "autogen", "case-study", "architecture"]
sourceId: "3.10.3.1 Agent Frameworks/02 AutoGen/05 课程助教 Agent 的 AutoGen 架构案例"
---
# 课程助教 Agent 的 AutoGen 架构案例

> 现在可以把 AutoGen 的几层世界观重新装回一个真实系统了：[多 Agent 会话](/ai/03-frameworks/01/12/) 给了协作直觉，[AgentChat 与消息协议](/ai/03-frameworks/01/14/) 说明它不是纯聊天，[worker/service runtime](/ai/03-frameworks/01/15/) 又说明它有更大的系统想象。那如果把这些放回你的课程助教主线，会发生什么？答案是：**课程助教在 AutoGen 里最自然的样子，不是一个状态图，也不是一个 typed service，而是一组围绕消息协作的角色系统。** 这一章就专门讲这种架构该怎么拆，以及它为什么既自然又危险。

**学习目标**：学完本章，你将能够——

1. 用 AutoGen 的语言为课程助教设计角色、消息、topic 和 runtime 拓扑；
2. 判断哪些地方 AutoGen 的协作模型很自然，哪些地方会开始吃力；
3. 解释为什么课程助教在这里更像“协作系统”，而不是单体服务或显式状态机；
4. 识别这类架构在权限、停止条件、恢复和审计上的风险点；
5. 画出一版可供实现和复盘的 AutoGen 架构草图。

## 1. 问题定义：课程助教在 AutoGen 里首先是“角色协作系统”

如果从 AutoGen 出发，课程助教最自然的第一反应不是：
- 定 state schema；
- 定 output schema；
而是：
- 哪些角色要参与；
- 谁接学生问题；
- 谁去找资料；
- 谁写草稿；
- 谁审查风险；
- 哪些消息在他们之间流动。

这说明课程助教在 AutoGen 里首先像：
**一组围绕学生问题协作的角色网络。**

## 2. 建议角色：够用就好，不要为了多 Agent 而多 Agent

一个相对合理的起点可以是：

| 角色 | 职责 | 不该做什么 |
|---|---|---|
| UserProxy / Triage | 接学生请求、发布初始消息、协调结束 | 不直接产出所有专业内容 |
| Research Agent | 检索课程讲义、FAQ、规则片段 | 不决定最终高风险输出 |
| Writer Agent | 基于资料生成草稿 | 不直接做权限判断 |
| Review Agent | 检查隐私、成绩、越权、规则边界 | 不负责大规模资料探索 |

这套拆法很符合 AutoGen 的协作直觉：
- 一个角色找；
- 一个角色写；
- 一个角色审；
- 一个用户/协调角色起头并收尾。

但也要克制：角色一多，消息网络会迅速失控。

## 3. 关键不是角色名，而是消息协议

课程助教在 AutoGen 里真正的架构关键，不是“你起了什么角色名”，而是：
- 哪类消息存在；
- 谁订阅哪类消息；
- 哪条消息意味着继续；
- 哪条消息意味着转人工；
- 哪条消息意味着结束。

比如至少可以有：

| 消息类型 | 含义 | 典型发布者 | 典型接收者 |
|---|---|---|---|
| `StudentQuestion` | 学生提出问题 | UserProxy | Research / Triage |
| `RetrievedContext` | 检索结果 | Research | Writer |
| `DraftAnswer` | 草稿回答 | Writer | Review |
| `RiskFlag` | 命中隐私/越权/敏感边界 | Review | UserProxy / Human reviewer |
| `ApprovedAnswer` | 人工或规则放行的结果 | Review / Human | UserProxy |
| `StopMessage` | 本回合结束 | UserProxy / Coordinator | 全体或终止逻辑 |

这一层如果不显式，后续的治理几乎无从谈起。

## 4. topic 怎么想：课程助教为什么不只是一个对话窗口

如果进一步用 topic 思维去组织：
- 普通课程问答 topic
- 成绩与隐私请求 topic
- 审批/人工复核 topic

会更容易把高风险问题与普通问题分开。

这样做的好处是：
- 不同协作链可以有不同参与者；
- 高风险消息不会和普通问答混在一条流里；
- 后面若接入外部审批系统，也更容易桥接。

这再次说明：课程助教在 AutoGen 里不像“一个聊天框”，更像“一个分 topic 的消息协作系统”。

## 5. 这个架构自然的地方在哪里

AutoGen 对课程助教自然的地方至少有三点：

1. **角色分工非常直观**：研究、写作、审查本来就是自然协作流程；
2. **消息流很容易做演示和观察**：谁先找资料、谁再写、谁最后审很清楚；
3. **适合教学和实验**：特别适合展示“多 Agent 协作能带来什么”。

这也是为什么课程助教这种案例在 AutoGen 里很容易讲得生动。

## 6. 这个架构危险的地方又在哪里

同样重要的是，这个案例在 AutoGen 下也会暴露很多问题：

### 6.1 控制流容易埋进会话

比如：
- 什么时候继续检索；
- 什么时候直接输出；
- 什么时候转人工；
如果这些逻辑只存在于角色提示词里，系统一复杂就会失控。

### 6.2 权限边界容易模糊

Research / Writer / Review 哪个可以调成绩查询？
如果角色和工具权限不严格绑定，越权会非常隐蔽。

### 6.3 停止条件不清

AutoGen 很容易写出“大家聊得挺热闹，但到底谁说了算”不清楚的系统。对课程助教这种要面向真实用户的系统，这会很危险。

### 6.4 恢复和审计难

如果一次高风险请求聊到第 6 轮才需要人工接管，你就会立刻发现：
- 哪一轮的结论可信？
- 哪个角色最后触发了风险标记？
- 人工应接管哪段上下文？

这些都是 AutoGen 在真实治理里更吃力的地方。

## 7. 如果硬要做课程助教，哪些纪律必须补上

1. **角色权限显式绑定**
   - 成绩查询只允许特定角色调用；
2. **消息类型显式化**
   - 不要什么都靠自然语言传达；
3. **停止条件写死**
   - 谁能发终止消息、什么情况结束；
4. **高风险请求转人工**
   - 不要让“审查角色自己决定放不放行”成为唯一边界；
5. **把会话记录转成可复盘工件**
   - 否则只剩长聊天记录，难以治理。

## 8. 和 LangGraph / CrewAI / PydanticAI 做同一案例时的差异

| 框架 | 第一张图最像什么 | AutoGen 的不同 |
|---|---|---|
| LangGraph | 状态与边图 | AutoGen 更像角色消息网络 |
| CrewAI | 角色+任务+流程图 | AutoGen 更像会话和协议驱动的协作系统 |
| OpenAI Agents SDK | triage/specialist/runtime 原语图 | AutoGen 更偏多角色对话范式 |
| PydanticAI | typed service / deps / output 图 | AutoGen 更偏协作过程，而非接口边界 |

一句话：课程助教在 AutoGen 里最像一场被协议约束的多角色协作，而不是一个服务或状态机。

## 9. 动手活动：写课程助教的 AutoGen 架构说明

> [!example] 动手活动：输出 `course-ta-autogen-architecture.md`
>
> **目标**：为课程助教写一份以角色、消息和 topic 为中心的架构说明。
>
> **步骤**：
> 1. 列角色与职责；
> 2. 列消息类型与订阅关系；
> 3. 列高风险路径如何转人工；
> 4. 写停止条件与审计要求；
> 5. 写一段“为什么这里用 AutoGen 会自然，又为什么风险高”的结论。
>
> **完成标准**：另一个工程师看完后，能既看到协作直觉，也看到治理难点。

## 10. 边界与排错

- **误区一：课程助教适合多角色，所以 AutoGen 就最优。** 角色自然不等于治理容易；
- **误区二：消息用自然语言就够了。** 高风险系统应尽量显式化语义；
- **误区三：Review Agent 就等于护栏。** 它只是协作角色，不是全部安全边界；
- **误区四：有 UserProxy 就代表 ownership 清楚。** 停止条件和权限仍需显式设计；
- **误区五：会话记录可追溯。** 原始聊天历史往往并不等于可审计结构化记录。

## 11. 总结

| 关键问题 | 一句话 |
|---|---|
| 课程助教在 AutoGen 里像什么 | 一个以角色和消息为中心的协作系统 |
| 真正的架构关键是什么 | 消息类型、topic、订阅关系、停止条件 |
| 自然之处 | 研究/写作/审查分工很直观 |
| 危险之处 | 控制流、权限、恢复与审计容易埋进会话 |
| 适合它做什么 | 教学、实验、展示协作范式 |
| 最需要补什么 | 协议显式化与治理边界 |

**思考题**：为什么课程助教这种看似“天然适合多角色协作”的系统，一旦真的涉及成绩、隐私、人工审批和上线治理，就会暴露 AutoGen 的许多弱点？这说明框架的“直观性”与“可治理性”之间是什么关系？

> [!note] 参考答案
> 因为多角色协作的直观性主要解决“怎么把任务分给几个人做”，但成绩、隐私、审批和上线治理要求解决的是“谁有权做、何时停、如何恢复、如何追责”。这些问题如果继续藏在会话中，就会把系统推入治理困难。也就是说，直观性很适合入门和演示，但并不自动等于可治理性；框架越强调协作直觉，越需要额外补上显式边界。

## 引用

- [7] https://microsoft.github.io/autogen/stable — AutoGen stable docs
- [8] https://raw.githubusercontent.com/microsoft/autogen/main/docs/design/01%20-%20Programming%20Model.md — AutoGen programming model
- [37] https://github.com/microsoft/autogen/blob/main/python/packages/autogen-core/src/autogen_core/_routed_agent.py — AutoGen routed agent source
- [38] https://github.com/microsoft/autogen/tree/main/python/packages/autogen-agentchat/src/autogen_agentchat — AutoGen AgentChat source tree
- [40] https://raw.githubusercontent.com/microsoft/autogen/main/docs/design/05%20-%20Services.md — AutoGen services design

上一篇：[04 Agent Worker、Services 与分布式运行时](/ai/03-frameworks/01/15/)——runtime 图景讲完后，本篇把它们装回课程助教这个真实系统。

下一篇：[06 AutoGen 与 LangGraph、CrewAI、OpenAI Agents SDK、PydanticAI 的深度对比](/ai/03-frameworks/01/17/)——案例落地之后，再回头看 AutoGen 在整个框架版图中的独特位置。
