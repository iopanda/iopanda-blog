---
title: "Tool Use and Protocols"
number: "02.04.01"
chapter: 2
chapterTitle: "Agents"
section: 4
sectionTitle: "Tool Use and Protocols"
group: ""
created: 2026-09-02 23:51
author: "iopanda"
tags: []
sourceId: "3.10.2.4 Tool Use and Protocols/README"
---
# Tool Use and Protocols

> 模块定位：Agent 从「会想」到「会做」的桥梁是工具调用。本模块覆盖：模型怎么声明要调用工具（function calling）、工具怎么定义与校验、怎么用标准协议（MCP）接入外部世界，以及最容易被忽略的权限边界。

**学习目标**：完成本模块后，你将能够——

1. 解释 function calling 的工作原理（模型输出结构化调用，而非直接执行）；
2. 定义带 JSON schema 的工具，处理参数校验与调用结果回填；
3. 说出常见工具类型（检索/计算/代码执行/HTTP/DB）各自的信任边界；
4. 用 MCP 接入一个外部工具，理解 client-server 架构；
5. 施加权限边界：最小权限、白名单、高风险动作人工确认。

## 子主题清单（每章讲义要点）

### 01 Function Calling 原理
- 概念：模型不「执行」工具，而是输出「我要调用函数 X，参数是 Y」
- 为什么这样设计：模型是文本生成器，执行权在应用代码（安全与可控）
- 流程：工具 schema → 模型决策 → 应用执行 → 结果回填上下文
- 与 ReAct 文本协议的对比：function calling 是结构化的 ReAct Action

### 02 工具定义与校验
- 概念：每个工具 = 名字 + 描述 + JSON schema 参数
- 为什么描述重要：模型靠描述选工具，烂描述=选错工具
- 参数校验：应用侧必须校验模型给的参数（类型/范围/枚举），不能盲信
- 动手：定义 3 个课程助教工具（查课程、算分、查资料），打印模型的选择过程

### 03 常见工具类型与信任边界
- 工具谱系：只读检索（低风险）、计算器（无副作用）、HTTP（中风险）、代码执行（高风险）、DB 写操作（高风险）
- 为什么区分：工具权限 = Agent 的能力半径；高风险工具必须额外闸门
- 示例对比表：每个工具能做什么、若被滥用会怎样、需要什么防护
- 呼应 01.04：工具返回要像处理用户输入一样对待（不可信）

### 04 代码执行型工具的风险
- 概念：让模型写代码并执行（Python REPL / 沙箱）——能力最强也最危险
- 为什么需要沙箱：模型生成的代码可能删文件、访问网络、耗尽资源
- 缓解：隔离容器、超时、禁止网络、输出截断、人工确认
- 案例：数据分析 Agent 里「模型生成的 pandas 代码」如何安全执行

### 05 MCP：工具接入的标准协议
- 概念：MCP = 模型上下文协议，把工具/数据源封装成标准 server（Anthropic 2024）
- 为什么需要：避免每个应用为每个工具写一遍胶水代码（N×M 集成问题）
- 架构：MCP host / client / server；resources、tools、prompts 三类原语
- 对比：function calling（单模型约定）vs MCP（跨模型跨应用标准）；A2A 用于 Agent 间（02.06）
- 动手：用 MCP 跑通一个 server（如文件系统/搜索），从 Agent 中调用它

### 06 权限边界与工具安全
- 概念：最小权限 = 只给任务必需的工具与范围；呼应 01.07 的 OWASP LLM03 过度自主权
- 设计：白名单工具、参数范围收窄、敏感操作确认、审计日志
- 攻击视角：工具被注入利用（间接注入 → 越权调用）的链路
- 动手：给课程助教工具加上权限层，演示「无权限 vs 有权限」的差异

## 交付物与验收标准

| 章 | 交付物 | 验收 |
|---|---|---|
| 02 | 工具 schema 定义 | 模型能选对工具、参数经校验 |
| 05 | MCP 工具接入 Demo | Agent 经 MCP 调用真实工具成功 |
| 06 | 权限边界 Demo | 越权调用被拦截并有日志 |

## 衔接

- 上一篇：[Planning and Reasoning](/iopanda-blog/ai/02-agents/03/)——计划要执行，执行靠本章的工具；
- 下一篇：[Memory and Retrieval](/iopanda-blog/ai/02-agents/05/)——工具访问外部世界，记忆让 Agent 跨会话记住世界状态。
