---
title: "Pi Coding Agent"
number: "02.09.16"
chapter: 2
chapterTitle: "Agents"
section: 9
sectionTitle: "Agent Implementations"
group: "05 Pi Coding Agent"
created: 2026-09-03
author: "iopanda"
tags: ["ai", "agents", "source-analysis", "pi"]
sourceId: "3.10.2.9 Agent Implementations/05 Pi Coding Agent/README"
---
# Pi Coding Agent

> 模块定位：解剖「内核最小化 + 扩展前置」的激进答案。Pi 由 libgdx 作者 Mario Zechner 创建（2025-08，MIT，TypeScript monorepo，10 万+ star），核心刻意不做 MCP/子代理/plan mode/权限弹窗，主张「需要什么功能就写扩展，或让 Pi 自己写」。读它之前先问：当别人内置的功能全变成扩展，主循环能小到什么程度？小代码库是否意味着更好懂、更好抄？

**学习目标**：完成本模块后，你将能够——

1. 说清 monorepo 四包（pi-ai / agent / coding-agent / tui）的分工边界，指出 coding-agent 主循环在哪个文件；
2. 复述默认四工具（read/write/edit/bash）与 TypeBox 参数校验，把主循环对应到 02.01 的 ReAct；
3. 解释树状会话（单 JSONL 文件 + `/tree` 分支续跑）与压缩/分支摘要如何控制上下文，对应 02.05；
4. 写一个最小 TypeScript extension（工具或命令），说清 extensions / skills / prompt templates / packages 的分工；
5. 就「小核外置 vs 全功能内置」给出 Pi 与 Claude Code / Codex / Hermes 的对比结论。

## 分析对象与可分析性（2026-09 核证）

- **对象**：Pi Coding Agent，github.com/earendil-works/pi，MIT 全开源；作者 Mario Zechner（badlogic，libgdx 作者），10 万+ star；npm 分发 `@earendil-works/pi-coding-agent`，官网 pi.dev。
- **定位**：官方自述 "minimal terminal coding harness"——默认给模型 4 个工具，刻意不内置 MCP、子代理、plan mode、权限弹窗、后台 bash（官方逐条给出替代路径：skills / tmux / 容器 / 扩展）。
- **可分析性**：全 TS、代码库小、包内自带 docs/（index、sdk、rpc、session-format、packages 等），适合 `git clone` 后完整通读；作者博客给出设计取舍的一手材料——六对象中「从零讲清每个 Why」的实现。

## 源码与文档入口（可 web 核证）

| 入口 | 地址 | 用途 |
|---|---|---|
| Monorepo | github.com/earendil-works/pi（README 列全部包） | 第 01 章主读对象 |
| coding-agent 包 | github.com/earendil-works/pi/tree/main/packages/coding-agent（src/ 分 cli、core、modes） | 主循环/会话/扩展源码 |
| 包内文档 | 同仓库 packages/coding-agent/docs/（index、sdk、rpc、session-format、packages…） | 各机制行为定义 |
| 官网/文档 | pi.dev；pi.dev/docs/latest | 特性演示与最新文档 |
| 作者博客 | mariozechner.at/posts/2025-11-30-pi-coding-agent/（另有 2025-11-02「Why not MCP」） | 设计哲学一手材料 |

## 章节规划（对齐 00 Learning Path 八维度）

### 01 最小核心通读【维度 1+2】
- 仓库布局与包边界：pi-ai（统一多供应商 LLM API、TypeBox 工具声明、跨供应商上下文交接）/ agent（循环运行时与状态）/ tui（差分渲染）/ coding-agent（CLI）；coding-agent/src 启动路径 cli.ts→main.ts→core。
- 主循环编码：默认四工具 read/write/edit/bash 如何注册与校验；工具结果「给模型的文本 vs 给 UI 的展示」分离设计；src/core/system-prompt.ts 为何刻意极简（对照 02.02）。
- 交付：主循环走读笔记，逐条验证 02.01 的循环失效点。

### 02 会话与压缩【维度 3+5】
- 树状会话：session 存为单 JSONL 文件、`/tree` 回溯任意节点分支续跑、书签与导出；migrations.ts 说明会话格式的版本演进（对照 02.05 会话记忆）。
- 上下文控制：compaction（临近上限自动摘要）与分支摘要的触发与可扩展性（主题式压缩、换模型摘要）；dynamic context——扩展可在每轮注入消息、过滤历史、实现 RAG 与长期记忆。
- 交付：会话文件结构图 + 压缩触发条件笔记。

### 03 扩展系统：Extensions / Skills / Templates / Packages【维度 6】
- 四层分工：TS extension（可钩 tools/commands/快捷键/events/整个 TUI，examples/extensions 50+ 示例：subagent、plan-mode、permission-gate、sandbox、MCP 接入均为示例）vs skills（CLI 工具 + README，渐进披露、不炸 prompt cache）vs 斜杠 prompt templates vs pi packages（npm/git 安装分发）。
- 自举扩展：self-modification——让 Pi 自己写扩展/命令，`/reload` 热载即用；与 Hermes「用中学技能」对照（衔接 03 子目录）。
- 交付：跑通一个 example extension + 扩展调用链路图。

### 04 设计哲学与取舍【维度 8 + 横切】
- 「不需要就不建」清单逐条评：不内置 MCP/子代理/plan mode/权限弹窗/后台 bash，官方替代路径（容器、tmux、TODO.md、扩展）——省了什么、把成本转嫁到哪里。
- 信任与安全：无内置权限系统 = 进程全权执行；安全依赖外部容器化 + 供应链硬化（依赖精确锁版、shrinkwrap、--ignore-scripts、npm audit CI、SECURITY.md），对照 02.04 与 01.07。
- 一手材料：作者博客「What I learned building an opinionated and minimal coding agent」——嫌 Claude Code 是「80% 功能用不上的飞船」、不用 MCP 的理由、token/成本统计为何只能 best-effort。
- 交付：取舍对照表（Pi 的答案 vs 其他 Agent 的答案 vs 我的判断）。

### 05 与大型实现对比【跨对象综合】
- 同一张八维表给 Pi 打分：最小内核 + 四工具 vs Codex 的 Rust 极简 CLI、Claude Code 闭源全功能、Hermes 记忆/技能运行时资产化——「小核外置」在可分析性、上手成本、安全默认、生态质量上的得失。
- 工程事实讨论：10 万+ star 却保持小代码库（完整通读可行）意味着什么；与 04 OpenCode 的 TS 插件生态对照扩展 API 风格（衔接 04 子目录）。
- 交付：六对象对比表增量 + 「可抄（极简 system prompt、树状会话、TypeBox 校验、扩展事件面）/ 要避（无默认权限护栏、功能全靠拼装的发现成本）」清单。

## 交付物与验收标准

| 章 | 交付物 | 验收 |
|---|---|---|
| 01 | 主循环走读笔记 | 能指出 Thought/Action/Observation 编码在哪个文件、四工具如何注册校验 |
| 02 | 会话文件结构图 | 能解释树状分支如何存进单 JSONL、压缩何时触发 |
| 03 | 自写最小 extension | `/reload` 后新工具可用，能讲清扩展钩在循环哪个环节 |
| 04 | 取舍对照表 | 能对任一「不内置功能」说出 Pi 的替代路径与代价 |
| 05 | 六对象对比表增量 | 能回答「小核外置 vs 全功能内置，10 万 star 说明了什么」 |

## 衔接

- 蓝图：[Learning Path](/iopanda-blog/ai/02-agents/09/01/)（八维度统一框架）；上一篇：[04 OpenCode](/iopanda-blog/ai/02-agents/09/15/)（同为 TS 全开源，插件生态路线对照）；下一篇：[06 GitHub Copilot](/iopanda-blog/ai/02-agents/09/22/)（闭源企业级对照）。
- 概念后盾：02.01 Foundations（循环）、02.02 Prompt and Context Engineering（system prompt/技能）、02.04 Tool Use and Protocols（权限/工具安全）、02.05 Memory and Retrieval（会话记忆/压缩）；每章产出「源码分析笔记」：贴代码 + 标 02 概念 + 一条「可抄/要避」结论，最终汇总进 00 八维对比表。
