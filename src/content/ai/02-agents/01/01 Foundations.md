---
title: "Foundations"
number: "02.01.01"
chapter: 2
chapterTitle: "Agents"
section: 1
sectionTitle: "Foundations"
group: ""
created: 2026-09-02 23:51
author: "iopanda"
tags: []
sourceId: "3.10.2.1 Foundations/README"
---
# Foundations

> 模块定位：从「模型会回答」跨到「模型会行动」的认知桥。本模块不写框架，先手动实现一个最小 Agent 循环，把「Agent = 模型 + 循环 + 工具 + 记忆」的骨架钉进脑中。

**学习目标**：完成本模块后，你将能够——

1. 用一句话定义 AI Agent，并区分 Agent 与聊天机器人；
2. 画出 Agent 运行循环（感知-规划-行动-观察），指出每一步的失效点；
3. 说清为什么 Agent 在 2023 年后才爆发（LLM 能力、上下文、工具协议）；
4. 解释模型能力边界（幻觉、上下文窗口、不确定性）如何限制 Agent；
5. 手动实现一个最小 ReAct Agent，打印并理解每一步轨迹。

## 子主题清单（每章讲义要点）

### 01 Agent 的定义与组成
- 概念：Agent = 能自主规划并采取行动的 AI 系统；对比 Chatbot（只对话不行动）
- 组成五要素：模型（大脑）/ 上下文（工作台）/ 规划（拆任务）/ 工具（手）/ 记忆（便签）
- 为什么需要：单轮问答无法完成「查资料→写报告→发邮件」这类多步任务
- 容易混淆：Copilot（人主导）vs Agent（机器主导）的光谱

### 02 Agent 为什么现在才热
- 历史脉络：经典 Agent(SOAR/Belief-Desire-Intention) → 强化学习 Agent → LLM Agent
- 三个催化剂：LLM 的通用推理、function calling 协议、上下文窗口增长
- LLM Agent 与经典 Agent 的本质差异：无需手写状态机，用自然语言规划
- 参考：AI Agent 架构综述（arXiv:2404.11584）

### 03 Agent 运行循环：感知-规划-行动-观察
- ReAct 思想：Thought（想）→ Action（做）→ Observation（看）循环
- 为什么循环而非一次生成：多步任务需要根据中间结果调整
- 循环终止条件：任务完成 / 达到最大步数 / 检测到死循环
- 动手：打印每一步轨迹，理解「模型决策可观测」

### 04 模型能力边界如何限制 Agent
- 幻觉对 Agent 的危害：编造工具结果、编造执行成功
- 上下文窗口：能「记住」多少、何时截断
- 不确定性：模型没有内置「我做不到」开关 → Agent 需要外部护栏
- 结论：Agent 的能力上限 = 模型上限 + 工程补偿；呼应 01.07 治理

### 05 最小 ReAct Agent 实战
- 动手：不依赖框架，用 LLM API + Python 手写一个 50 行内的 ReAct 循环
- 给它一个工具（如本地文件读取 / 计算器函数），观察 Thought-Action-Observation
- 完成标准：能完成「查文件→总结」两步骤任务，轨迹可打印
- 常见错误：上下文越滚越长、工具结果不截断、循环不终止

### 06 Agent 类型与生态全景
- 按自主度分：单步工具调用 → 工作流 → 自主 Agent → 多 Agent
- 按用途分：代码 Agent、数据分析 Agent、浏览器 Agent、客服 Agent
- 框架生态预告：LangGraph / AutoGen / 自研（02.06、03 展开）
- 协议预告：function calling、MCP（02.04 展开）

## 交付物与验收标准

| 章 | 交付物 | 验收 |
|---|---|---|
| 03 | agent-loop 轨迹打印 | 能解释每一步是 Thought/Action/Observation |
| 05 | 最小 ReAct Agent 代码 | 给定两步骤任务能完成，轨迹完整可读 |
| 06 | Agent 类型对比表 | 能判断给定任务适合哪种自主度 |

## 衔接

- 上一篇：`01 Models` 系列完成后的第一个 Agent 模块（衔接 [风险评审与发布](/ai/01-models/07/05/) 的能力）；
- 下一篇：[Prompt and Context Engineering](/ai/02-agents/02/)——学会循环后，先精修决定行为的第一层：上下文。
