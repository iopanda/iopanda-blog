---
title: "Multi-Agent Systems"
number: "02.06.01"
chapter: 2
chapterTitle: "Agents"
section: 6
sectionTitle: "Multi-Agent Systems"
group: ""
created: 2026-09-02 23:52
author: "iopanda"
tags: []
sourceId: "3.10.2.6 Multi-Agent Systems/README"
---
# Multi-Agent Systems

> 模块定位：单 Agent 有上下文、规划、工具、记忆后，很多任务仍做不好——因为一个人干不了所有角色。本模块覆盖多 Agent 的协作模式（编排者-工作者、流水线、辩论等）、通信机制、框架对比，以及最重要的判断：什么时候根本不该用多 Agent。

**学习目标**：完成本模块后，你将能够——

1. 说清多 Agent 解决什么问题、引入什么新问题；
2. 设计编排者-工作者、流水线、辩论三种协作模式并比较取舍；
3. 解释 Agent 间通信机制（消息结构、共享状态、A2A 协议）；
4. 用 LangGraph 或 AutoGen 实现一个多 Agent Demo；
5. 判断给定任务是否需要多 Agent（默认答案是「不需要」）。

## 子主题清单（每章讲义要点）

### 01 为什么需要多 Agent
- 概念：多个角色化 Agent 分工协作，而非一个全能 Agent
- 为什么需要：单 Agent 上下文有限、角色冲突、长流程易失控
- 示例：软件团队（产品/架构/编码/测试各自 Agent，MetaGPT 思想）
- 新引入的问题：通信成本、级联错误、责任归属、成本爆炸

### 02 协作模式：编排者-工作者
- 概念：一个 orchestrator 拆任务派给 worker，汇总结果
- 为什么流行：结构清晰、可控制、每步可观测
- 设计要点：worker 职责单一、结果 schema 明确、编排者决定下一步
- 动手：课程助教拆成「检索员+计算员+回答员」三 worker 的编排 Demo

### 03 协作模式：流水线与辩论
- 概念：流水线（A→B→C 接力，如生成→批评→改写）；辩论（多 Agent 各执一词再裁决）
- 取舍对比表：编排者（灵活/贵）vs 流水线（快/僵）vs 辩论（质量/慢+贵）
- 为什么辩论能提升质量：不同视角暴露单 Agent 盲点（如 reviewer 找茬）
- 风险：共识可能只是互相附和；裁决者决定上限

### 04 Agent 间通信与协议
- 概念：Agent 之间传什么：消息文本、结构化结果、共享状态、工具调用权
- 通信设计：消息 schema、超时、失败传播、死锁
- 协议：A2A（Agent-to-Agent，Google 2025）与 MCP 的分工（MCP=接工具，A2A=Agent 互联）
- 动手：给两个 Agent 定义消息 schema，观察一次协作的完整轨迹

### 05 多 Agent 框架实践
- 概念：LangGraph（状态图，细粒度控制）vs AutoGen（会话式多 Agent）vs 自研
- 为什么用框架：状态管理、循环控制、检查点、人工介入都难自研
- 框架选型表：何时 LangGraph / 何时 AutoGen / 何时手写循环
- 动手：用 LangGraph 重写 02 的编排 Demo，比较自研 vs 框架的复杂度

### 06 多 Agent 的失败模式与「何时不用」
- 失败模式：级联错误放大、上下文互相污染、成本失控、调试困难
- 评测难度：单 Agent 的评测方法在多 Agent 上失效（02.07 展开）
- 决策清单：任务能拆吗？角色真不同吗？单 Agent 加工具搞不定吗？
- 结论：能用单 Agent + 好工具解决的，不要上多 Agent

## 交付物与验收标准

| 章 | 交付物 | 验收 |
|---|---|---|
| 02 | 编排者-工作者 Demo | 3 worker 协作完成「查+算+答」任务 |
| 04 | 消息 schema + 轨迹 | 通信可打印、失败能传播 |
| 05 | LangGraph 多 Agent | 与自研版功能等价、状态可检查 |
| 06 | 选型判断表 | 对 5 个给定任务给出用/不用多 Agent 的结论 |

## 衔接

- 上一篇：[Memory and Retrieval](/ai/02-agents/05/)——单 Agent 能力齐备后，看协作带来的质变与代价；
- 下一篇：[Evaluation and Observability](/ai/02-agents/07/)——多 Agent 越复杂越要测、越要看得见。
