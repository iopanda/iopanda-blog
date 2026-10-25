---
title: "Learning Path"
number: "02.09.01"
chapter: 2
chapterTitle: "Agents"
section: 9
sectionTitle: "Agent Implementations"
group: ""
created: 2026-09-03 06:00
author: "iopanda"
tags: ["ai", "agents", "source-analysis"]
sourceId: "3.10.2.9 Agent Implementations/00 Learning Path"
---
# Learning Path

02.09 是 01 Models 系列的**源码级分析单元**:不满足于「会调用 Agent」,而是**打开主流 Agent 实现(Claude Code、Codex、Hermes、OpenCode、Pi、GitHub Copilot)的源码**,理解它们各自如何实现 02 里讲过的循环、上下文、工具、记忆、权限与评测。读完本单元,你既能读懂真实工程代码,也能把 02 的概念框架映射到六个具体实现上,还能回答「如果我自己写 Agent,哪些设计值得抄、哪些坑必须避」。

# 内容

## 分析对象与可分析性(2026-09 核证)

| 子目录 | 实现 | 源码状态 | 可分析性说明 |
|---|---|---|---|
| 01 Claude Code | Anthropic 终端编码 Agent | 闭源(© Anthropic PBC),但 Claude Agent SDK(TypeScript/Python)开源发布、SKILL.md 开放标准 | SDK 源码 + 官方 docs + hooks/skills 机制 |
| 02 OpenAI Codex | OpenAI 终端编码 Agent | **Apache-2.0 全开源**,12 万+ star | Rust(core)+ TS(CLI)双栈,完全可读 |
| 03 Hermes Agent | Nous Research 自我进化 Agent | **MIT 全开源**,含 skills/plugins/memory 全架构 | Python 主实现 + 平台网关 + 记忆系统 |
| 04 OpenCode | SST 社区终端编码 Agent | **MIT 全开源**,20 万+ star | TypeScript monorepo(bun + sst) |
| 05 Pi Coding Agent | 极简可扩展终端编码 Agent | 开源(TypeScript) | 小代码库,适合完整通读 |
| 06 GitHub Copilot | GitHub/微软编码 Agent | 闭源;IDE 扩展部分开源 | 文档/行为/公开 SDK 为主 |

- **为什么选这六个**:同一件事(编码/通用 Agent)的六种工程答案——从全开源小代码库(Pi)到极简 CLI(Codex)到企业级生态(Claude Code/Copilot)到自我进化系统(Hermes)。
- **统一分析框架**(每个子目录按同一组问题解剖,便于横向对比):
  1. **源码结构与入口**:仓库布局、主循环在哪、启动路径;
  2. **Agent 循环实现**:Thought/Action/Observation 如何编码(ReAct?function calling?状态机?);
  3. **上下文构建**:system prompt 组装、会话历史、压缩/摘要策略;
  4. **工具系统**:工具定义、参数校验、代码执行沙箱、权限模型;
  5. **记忆系统**:短期/长期记忆、向量检索、会话存储;
  6. **协议与扩展**:MCP 集成、skills/plugins 机制、外部 SDK;
  7. **评测与质量**:内置测试、轨迹记录、评测集;
  8. **安全设计**:提示注入防护、权限最小化、审计日志。

## 学习方法

- **先概念后代码**:02 系列已建立概念框架(循环/上下文/工具/记忆/权限);本单元的任务是把概念**对着真实源码认出来**——看到 `for step in loop:` 时能说「这是 ReAct 循环」。
- **每个子目录 3~5 章**,每章聚焦统一框架中的一个维度(如「Claude Code 的权限模型」「Codex 的 Rust 核心循环」);
- 闭源对象(Claude Code/Copilot)以 SDK/文档/行为实验为「源码」;开源对象以真实代码为准,建议 `git clone` 后按章阅读;
- 每章交付「源码分析笔记」:贴关键代码片段 + 标注对应 02 概念 + 一条「我可以抄/我要避」结论。

## 前置

- 完成 02 Agents 全系列(或等价概念能力)——本单元大量引用其术语;
- 具备 Git、Python/TypeScript 任一阅读能力(六对象分别用到 Python/TS/Rust,读代码为主);
- 建议本地能跑 `codex` 或任一开源对象(便于边读边验证行为)。

## 本模块文件结构

- 每个子目录一个 README.md(分析对象与章节规划);
- 每章讲义(待填充):在子目录内以 `01 源码结构与主循环.md` 形式存放;
- 本文 00 Learning Path.md 是全模块蓝图(上方八个维度是统一解剖模板)。
