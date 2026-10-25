---
title: "Hermes Agent"
number: "02.09.09"
chapter: 2
chapterTitle: "Agents"
section: 9
sectionTitle: "Agent Implementations"
group: "03 Hermes Agent"
created: 2026-09-03
author: "iopanda"
tags: ["ai", "agents", "source-analysis"]
sourceId: "3.10.2.9 Agent Implementations/03 Hermes Agent/README"
---
# Hermes Agent

> 模块定位：六对象中唯一主打「自我进化」的实现。它把技能、记忆、用户画像都当作**运行时可变资产**——用着用着学会新技能、沉淀记忆、摸清你的偏好。读它之前先问：Agent 的能力上限到底是模型给的，还是**循环积累**给的？

**分析对象（2026-09 核证）**：Nous Research **Hermes Agent**，github.com/NousResearch/hermes-agent，**MIT 全开源**，Python 主实现（~240k star，2025-07 创建）。官网/文档：hermes-agent.nousresearch.com/docs（developer-guide/architecture 一节官方给出项目结构、agent loop 与关键类，是最佳导航图）。

## 源码入口与仓库结构

- 顶层目录即架构地图：`agent/`（主循环与核心类）、`gateway/` + `tui_gateway/`（多平台网关与终端 UI）、`skills/` + `optional-skills/`（技能库）、`plugins/` + `optional-mcps/` + `mcp-research-data/`（插件与 MCP）、`cron/`（定时任务）、`native/fts5_cjk/`（会话全文检索，含 CJK 扩展）、`providers/`（模型供应商）、`tools/`（内置工具）、`hermes_cli/`（CLI 入口）、`evals/` + `tests/`（评测与测试）、`docs/`（文档即源码一部分）；
- 入口路径建议：`hermes_cli` → `agent` 主循环 → 按需进 `skills/plugins/cron/gateway`，避免一上来陷入 `tools/` 细节；
- 先行核证：MIT LICENSE 全文、README 宣称的 learning loop 特性、`AGENTS.md` 与 CONTRIBUTING（仓库自己就是被 Agent 维护的活例子）。

## 章节规划与统一框架映射

| 章 | 主题 | 主覆盖维度 |
|---|---|---|
| 01 | 架构总览与主循环 | 1、2、8 |
| 02 | 技能系统 | 3、6 |
| 03 | 记忆系统 | 5、3 |
| 04 | 平台网关与 MCP | 4、6 |
| 05 | 自我进化设计 | 7、8 |

## 各章分析要点

### 01 架构总览与主循环
- 对照官方 Architecture 文档读 `agent/`：启动路径、关键类（会话/消息/循环驱动器）、配置系统（`hermes config`）；
- 主循环如何编码 Thought/Action/Observation：是 function calling 驱动还是自由文本 ReAct？工具结果如何回流、多步状态存哪；
- 上下文构建：system prompt 组装、会话历史管理与截断/压缩策略（对应 02.02/02.03）；
- 安全基线：提示注入防护、工具权限开关（`hermes tools`）、审计日志与轨迹记录；
- 交付：架构图 + 主循环伪代码 + 断点走读笔记。

### 02 技能系统
- `skills/` 与 `optional-skills/` 的组织：SKILL.md 结构、frontmatter、instructions 与示例（对齐 agentskills.io 开放标准）；
- 技能如何被**加载、匹配、触发**：何时注入上下文、按任务自动挑选还是显式调用；
- 技能生命周期：创建（从经验生成）→ 使用 → 改进 → 沉淀/废弃，代码里哪个函数负责「学会」；
- 对照 02.02：技能本质是一种「可复用上下文包」，比 system prompt 工程更进一步；
- 交付：拆解 1~2 个真实技能文件 + 技能调用链路图。

### 03 记忆系统
- 记忆分层：会话记忆 vs 长期记忆 vs 用户画像（Honcho user modeling），对应 02.05 概念；
- 检索实现：FTS5 会话全文搜索（`native/fts5_cjk/`）+ LLM 摘要压缩——为什么用关键词检索而非纯向量？CJK 扩展解决什么问题；
- 记忆写入触发器：谁在什么时机「nudge」自己把知识写进记忆？代码找 persist/remember 路径；
- 交付：记忆读写时序图 + 「记忆该存什么、不该存什么」的工程判断笔记。

### 04 平台网关与 MCP
- `gateway/`：单进程多平台（Telegram/Discord/Slack/WhatsApp/Signal/CLI）如何复用同一 agent 核心？跨平台会话如何连续；
- 多后端执行：local/Docker/SSH/Modal 等 7 种 terminal backend 的抽象层——代码沙箱与权限模型（对应 02.04/01.07）；
- MCP 集成：`optional-mcps/` 与「连接任意 MCP server」的实现方式；内置工具与 MCP 工具如何统一注册、校验、调用；
- 交付：网关进程架构图 + MCP 工具注册/调用链路代码片段。

### 05 自我进化设计（本对象灵魂）
- 闭合学习环全链路：用中学技能 → 沉淀记忆 → 画像变深 → 行为改善，找出闭环的**每个触发点**在代码中的位置；
- 自动化：`cron/` 调度器 + 跨平台投递（自然语言定时任务如何编译成计划）；
- 协作与扩展：子 Agent 委派（isolated subagents）、Python RPC 调用工具、与 `NousResearch/hermes-agent-self-evolution` 姊妹仓库的关系（若有必要可外延对比）；
- 评测与反思：`evals/` 内置评测、轨迹生成/压缩（为训练 tool-calling 模型产数据）；
- 总结章：「我可以抄」清单（learning loop、nudge 机制、网关复用核心）与「我要避」清单（记忆膨胀、技能失控、自主写记忆的安全风险）。

## 交付物与验收标准

| 章 | 交付物 | 验收 |
|---|---|---|
| 01 | 架构图 + 主循环走读 | 能指出 ReAct/function calling 循环在哪个文件哪几行 |
| 02 | 技能拆解笔记 | 能画出「技能文件 → 上下文注入 → 执行」链路 |
| 03 | 记忆读写时序图 | 能说清 FTS5 检索为何够用、nudge 何时触发 |
| 04 | 网关与 MCP 链路图 | 能解释平台无关的 agent 核心如何被多端复用 |
| 05 | 进化闭环触发点清单 | 能列出闭环每个环节的代码位置 + 抄/避结论 |

## 衔接

- 上一篇：[02 OpenAI Codex](/iopanda-blog/ai/02-agents/09/03/)（Rust 极简 CLI 之美 → Python 全架构之繁的对照）；
- 下一篇：[04 OpenCode](/iopanda-blog/ai/02-agents/09/15/)（另一个 TS 全开源，可横向对比插件生态设计）；
- 概念后盾：02.05 Memory and Retrieval、02.04 Tool Use and Protocols、02.07 Evaluation and Observability；每章按蓝图要求产出「源码分析笔记」：贴代码 + 标 02 概念 + 一条「我可以抄 / 我要避」结论，最终在 00 Learning Path 的八维表上横向对比六对象。
