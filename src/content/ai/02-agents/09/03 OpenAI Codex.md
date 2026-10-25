---
title: "OpenAI Codex"
number: "02.09.03"
chapter: 2
chapterTitle: "Agents"
section: 9
sectionTitle: "Agent Implementations"
group: "02 OpenAI Codex"
created: 2026-09-03 11:11
author: "iopanda"
tags: []
sourceId: "3.10.2.9 Agent Implementations/02 OpenAI Codex/README"
---
# OpenAI Codex

> 模块定位：按 02.09 蓝图（00 Learning Path）的统一八维框架，对 **OpenAI Codex CLI** 做源码级解剖。它是六个分析对象中唯一的「Rust 核心 + TS 外壳」双栈大仓，也是把 02 的循环/上下文/工具/权限概念对照真实工程代码的最佳样本。

**分析对象（2026-09 web 核证）**：github.com/openai/codex——Apache-2.0 全开源；GitHub 实测约 12.1 万 star / 1.85 万 fork；2025-04 建仓，主分支 1 万+ 提交。仓库顶层 = `codex-rs/`（Rust Cargo 工作区，80+ crates，Agent 核心与 CLI）、`codex-cli/`（TypeScript CLI）、`sdk/`（Python/TS SDK）、`docs/`。

**学习目标**：完成本子单元后，你将能够——

1. 说清仓库布局与「Rust 核心 + TS CLI」双栈分工，指出主循环所在的 crate；
2. 从源码复述 turn/iteration 循环、done 终止条件与工具分发路径；
3. 解释 `SandboxPolicy` 三态如何映射到 macOS Seatbelt 与 Linux Landlock+seccomp；
4. 说清 config.toml 配置分层与审批模式演进；
5. 产出「可抄/要避」清单，供 02.09 横向对比复用。

## 章节规划与每章分析要点（讲义以 `0X 章名.md` 存放）

### 01 仓库布局与 Rust 核心（对应框架维度 1）
- 顶层盘点：codex-rs（Cargo 工作区 80+ crates）/ codex-cli（TS）/ sdk / docs；构建体系（cargo + bazel + justfile + nix/flake）。
- 入口追踪：`codex-rs/cli/src/main.rs` → 子命令分发（exec/app/mcp/debug）→ 装载配置与 tracing → 进入 harness；对照 02.01 的「模型+循环+工具」骨架认结构。
- 核心 crate 地图：core（循环/harness）、prompts、config、tools、execpolicy、linux-sandbox、skills、mcp-server 等，画出依赖分层。
- 读法建议：`git clone` 后从 `codex-rs/core` 与 `codex-rs/cli` 入手，先跑通 `cargo test`，记录「入口→配置→循环」调用链。

### 02 主循环与工具系统（维度 2/3/4）
- turn 与 iteration：一次用户回合 = 多轮「模型推理 + 工具执行」，模型发 done 事件才终止；看 Responses API SSE 事件流如何驱动循环。
- 工具分发：shell/exec（沙箱内执行，`core/src/exec.rs`）、apply_patch、file-system 读写等内置工具的定义与注册方式。
- 上下文组装：system prompt（prompts crate）、AGENTS.md 自动发现与沿路径拼接（`core/src/agents_md.rs`：项目根标记向上探测）、会话历史截断/压缩策略。
- 工具失败与恢复：错误如何回灌给模型、审批在何处插入（exec_policy.rs）——对应 02.03/02.04 概念。

### 03 沙箱与执行模型（维度 4/8）
- 策略层：`SandboxPolicy { ReadOnly, WorkspaceWrite, DangerFullAccess }` 与 `--sandbox`/sandbox_mode 的对应。
- 平台实现：macOS Seatbelt（sandbox-exec + .sbpl 策略文件）vs Linux Landlock + seccomp-BPF（codex-linux-sandbox 辅助进程）vs Windows 受限令牌 + DACL。
- 执行管线：命令规格 → 平台包装 → 拒绝检测（stderr 关键字/SIGSYS/退出码启发式）→ 升级审批（escalation）→ 放宽策略重试。
- 安全不变量：.git/.codex 始终只读、环境变量白名单重建、macOS 网络策略 binary（已知 issue #10390）；对照 01.07 治理。

### 04 配置与审批模式（维度 4/8）
- 配置分层：`~/.codex/config.toml` 全局配置 + 项目级覆盖 + 环境变量；config-schema crate 的 schema 校验。
- 审批演进：早期 approval_policy（ReadOnly/AutoEdit/MostlyAuto/FullAuto）→ 交互式审批作用域（单次/会话/始终）；`--full-auto` 与 `--dangerously-bypass-approvals-and-sandbox` 的边界。
- 扩展面：mcp_servers 接入（TOML 风格 vs 其他工具 JSON）、skills 机制、hooks、AGENTS.md 作为项目记忆的定位。
- 动手：写最小 config.toml（只读沙箱 + 逐次审批），观察审批提示与作用域选项。

### 05 横向对比与「可抄/要避」清单
- 用蓝图八维框架逐维对照：与 01 Claude Code（闭源+SDK）、03 Hermes（MIT Python 全栈）等对比定位。
- Codex 设计签名：Rust 重写换来单二进制分发与低延迟；三态沙箱策略「简单够用」；深度绑定 Responses API 与 ChatGPT 登录，同时保留 API key 通道。
- 可抄清单：策略-平台分离的沙箱架构、AGENTS.md 分层拼接、审批插入点设计。
- 要避清单：macOS 网络放行坑（issue #10390）、容器内 Landlock 不可用时的降级、拒绝检测的启发式误判。

## 交付物与验收标准

| 章 | 交付物 | 验收 |
|---|---|---|
| 01 | 仓库地图与入口调用链笔记 | 能指出主循环所在 crate 与启动路径 |
| 02 | 一次 turn 的事件序列图 | 每步能标注 Thought/Action/Observation |
| 03 | 沙箱策略-平台映射表 | 能解释同一策略在三平台的落地差异 |
| 04 | 最小 config.toml + 审批实验记录 | 能复述审批作用域与 bypass 边界 |
| 05 | 「可抄/要避」清单 | 每条结论有源码或 issue 出处 |

## 衔接

- 前置：02 全系列概念 + 本模块 00 Learning Path 蓝图；
- 横向：本章结论供 02.09 横向对比复用；下一篇子单元 03 Hermes Agent（MIT Python 全栈）可对照「Rust vs Python」两条工程路线。
