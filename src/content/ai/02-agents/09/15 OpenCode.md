---
title: "OpenCode"
number: "02.09.15"
chapter: 2
chapterTitle: "Agents"
section: 9
sectionTitle: "Agent Implementations"
group: "04 OpenCode"
created: 2026-09-03
author: "iopanda"
tags: ["ai", "agents", "source-analysis"]
sourceId: "3.10.2.9 Agent Implementations/04 OpenCode/README"
---
# OpenCode

> 模块定位：六对象中 star 最高（20 万+）的**全开源 TS 实现**，也是与 01 Claude Code 血缘最近的同赛道竞品。读它之前先问：一群 Neovim 用户做出来的 Agent，凭什么与 Claude Code 正面竞争？答案在它的三个设计签名——**开箱 LSP、build/plan 双 agent 模式、client/server 架构**。

**分析对象（2026-09 web 核证）**：SST 社区 **OpenCode**（2025 年被 Anomaly 收购，仓库迁至 github.com/anomalyco/opencode，原 sst/opencode），**MIT 全开源**，实测约 20.3 万 star / 2.6 万 fork，2025-04-30 建仓，主分支 `dev` 1.5 万+ 提交。官网 opencode.ai，文档 opencode.ai/docs（agents/config/providers 各节即导航图），npm 包 `opencode-ai`。

## 源码入口与仓库结构

- 单仓即 bun + Turborepo + SST + Nix flake 的 **TS monorepo**；顶层 `packages/`（核心与各客户端）、`infra/`（SST 云设施）、`nix/`、`specs/`、`perf/`（性能基准）、`sdks/vscode/`（IDE 扩展）等；
- 入口路径建议：`packages/opencode/src/index.ts`（CLI 启动）→ 同包 `src/server/`（client/server 核心与 HTTP API）→ TUI/客户端，避免先陷进 `infra/` 与细节工具；
- 自举证据：仓库根自带 `AGENTS.md`、`CONTEXT.md`、`.opencode/`——团队用 OpenCode 自己维护自己（dogfooding），是「AGENTS.md 即项目记忆」的活样本（呼应 02 Codex 的 AGENTS.md 机制）；
- 本地跑通：`bun install && bun run packages/opencode/src/index.ts`。

## 章节规划与统一框架映射

| 章 | 主题 | 主覆盖维度 |
|---|---|---|
| 01 | monorepo 架构与源码入口 | 1 |
| 02 | 主循环与 agent 模式（build/plan/@general） | 2、3 |
| 03 | 工具系统与 LSP | 4、6 |
| 04 | 权限模型与安全设计 | 4、8 |
| 05 | 横向对比与可抄/要避 | 7、8 |

## 各章分析要点（讲义以 `0X 章名.md` 存放）

### 01 monorepo 架构与源码入口（维度 1）
- 盘点 `packages/` 各包职责（core/server、TUI、client SDK、config…）画出依赖分层；与 02 Codex 的 Cargo 工作区、03 Hermes 的 Python 布局三方对照；
- 入口追踪：index.ts → server 启动 → session/agent 装配，记录「启动→配置→循环」调用链；配置体系 opencode.json / `opencode config` 的分层；
- 交付：仓库地图 + 入口调用链笔记。

### 02 主循环与 agent 模式（维度 2/3）
- 读 `packages/opencode/src/agent/`：Thought/Action/Observation 如何编码？工具结果回灌、步数上限、终止条件（对应 02.03）；
- 双 agent 模式：Tab 切换的 build（默认全权限）vs plan（只读、拒绝文件编辑、bash 先问）——同一循环换权限上下文还是换 prompt 策略？在代码里找差异点；
- `@general` 子 agent 委派：复杂检索/多步任务如何拆给子 agent、结果如何回收（02.06 多 agent 雏形）；
- 上下文构建：AGENTS.md 分层注入、`@file` 模糊引用、会话历史管理（对应 02.02）；
- 交付：主循环伪代码 + agent 模式对比表。

### 03 工具系统与 LSP（维度 4/6）
- 内置工具注册与分发：文件读写、bash、apply_patch、检索、图片等如何定义、校验、回灌（对应 02.04）；
- **开箱 LSP 是设计签名**：如何用语言服务器取符号/定义/引用/诊断喂给模型，对比 grep/正则式「伪理解」，评估精度收益与 token 代价；
- MCP 接入与 provider-agnostic 哲学如何延伸到工具生态（对应 02.04）；
- 交付：LSP 工具链路图 + 工具注册代码片段。

### 04 权限模型与安全设计（维度 4/8）
- 权限交互模型：工具级 permission 提示（yes/no/always）、plan 模式只读限制，权限状态机在哪个文件；
- 数据与凭据安全：`~/.local/share/opencode` 落盘内容、provider API key/登录凭据的存取；
- 提示注入面：bash 输出与文件内容回流前的处理，对照 01.07 治理要求；
- 交付：权限状态机图 + 一次高危命令审批实验记录。

### 05 横向对比与可抄/要避（维度 7/8）
- 蓝图八维逐项对照：01 Claude Code（同赛道闭源）/ 02 Codex（Rust+三态沙箱）/ 03 Hermes（Python 学习环）；
- 设计签名：全 TS 单语言栈、TUI 体验、LSP 开箱、client/server 解耦（远程驱动、多客户端）、社区运营（23+ 语言 README、trademark policy）；
- 可抄清单：LSP 增强上下文、build/plan 双模式、AGENTS.md 自举、provider 抽象层；
- 要避清单：TS 大仓体积与启动成本、permission「always」滥用风险、LSP 在超大仓库的延迟；
- 交付：「可抄/要避」清单，每条附源码或 docs 出处。

## 交付物与验收标准

| 章 | 交付物 | 验收 |
|---|---|---|
| 01 | 仓库地图与入口调用链 | 能指出主循环所在 package 与启动路径 |
| 02 | 主循环伪代码 + agent 模式表 | 能解释 build/plan 差异的代码实现 |
| 03 | LSP 链路图 | 能说清 LSP 如何取代 grep 式理解 |
| 04 | 权限状态机 + 审批实验记录 | 能复述 permission 决策点与凭据存储位置 |
| 05 | 可抄/要避清单 | 每条有源码或 docs 出处 |

## 衔接

- 上一篇：[03 Hermes Agent](/iopanda-blog/ai/02-agents/09/09/)（同为全开源：TS 大仓 vs Python 全栈的工程路线对照）；
- 下一篇：[05 Pi Coding Agent](/iopanda-blog/ai/02-agents/09/16/)（极简 TS 实现，与本文「大而全」对照读）；
- 概念后盾：02.02 上下文、02.03 规划、02.04 工具/MCP、01.07 治理；每章按蓝图要求产出「源码分析笔记」：贴代码 + 标 02 概念 + 一条「我可以抄 / 我要避」结论，最终汇入 00 Learning Path 的八维横向对比表。
