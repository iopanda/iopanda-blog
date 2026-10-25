---
title: "Claude Code"
number: "02.09.02"
chapter: 2
chapterTitle: "Agents"
section: 9
sectionTitle: "Agent Implementations"
group: "01 Claude Code"
created: 2026-09-03 06:30
author: "iopanda"
tags: ["ai", "agents", "source-analysis", "claude-code"]
sourceId: "3.10.2.9 Agent Implementations/01 Claude Code/README"
---
# Claude Code

> 模块定位:解剖「闭源核心 + 开源外围」的范本。Claude Code 本体闭源(© Anthropic PBC),但 Claude Agent SDK(TypeScript/Python,MIT)开源、SKILL.md 是跨厂商接受的开放标准(agentskills.io)。本目录以「SDK 源码 + 官方文档 + 行为实验」为源码,回答:这个被数百万开发者使用的终端 Agent,其主循环、权限闸门、扩展机制到底怎么设计?哪些能抄、哪些是坑?

**学习目标**:完成本模块后,你将能够——

1. 说清 Claude Code 的工程分层:闭源 CLI 核心(智能循环)与开源 SDK 外壳(子进程管理/消息帧解析)的边界;
2. 用 SDK 的 `query()` 与消息帧(assistant/tool_use/result)复现 Agent 主循环,对应 02.01 的 ReAct 理论;
3. 解释 permissionMode + 三级 settings 如何构成权限闸门,并对照 02.04 的权限边界理论;
4. 写出自有 SKILL.md 与一条 PreToolUse hook,说清二者各拦在循环的哪个环节;
5. 把 Claude Code 与 Codex/OpenCode/Hermes 的架构决策拉成对比表(衔接 02~05 子目录)。

## 分析对象与可分析性(2026-09 核证)

- **对象**:Claude Code,Anthropic 终端编码 Agent,经 npm `@anthropic-ai/claude-code` 分发;2026-09 版本线 v2.1.x,SDK 每次发布与 CLI 版本逐版对齐(parity)。
- **闭源核心**:真正的模型循环、工具执行器在闭源 CLI 二进制内,官方仓库仅公开插件示例/变更日志/文档——无法 `git clone` 通读主循环。
- **开源外围**:Claude Agent SDK(TS+Python,MIT)把 CLI 包成可编程 Agent:spawn CLI 子进程→解析其 JSON 消息流→以 System/Assistant/User/ResultMessage 帧暴露循环;SKILL.md 由 anthropics/skills 仓库 spec/ 开放(Agent Skills 标准)。
- **本目录的「源码」=SDK 源码(可 clone)+ hooks/skills 机制(可本地实验)+ 官方文档 + 行为观测(会话转录、--debug)**。

## 源码与文档入口(可 web 核证)

| 入口 | 地址 | 用途 |
|---|---|---|
| SDK TypeScript | github.com/anthropics/claude-agent-sdk-typescript | 第 01 章主读对象 |
| SDK Python | github.com/anthropics/claude-agent-sdk-python | 对照传输层/错误模型/选项树 |
| Claude Code 仓库 | github.com/anthropics/claude-code | 版本线、变更日志、插件示例 |
| Skills 仓库/标准 | github.com/anthropics/skills;agentskills.io | SKILL.md 规范与范例集 |
| 官方文档 | code.claude.com/docs(/en/hooks、/en/permissions、/en/agent-sdk/*、/en/settings) | 权限/hooks/settings 的行为定义 |

## 章节规划(对齐 00 Learning Path 八维度)

### 01 SDK 架构与主循环【维度 1+2】
- 要点:仓库布局(src/examples/e2e-tests)与启动路径;`query()`/`ClaudeSDKClient` 如何 spawn CLI 并读写 stdio JSONL;消息帧与流式事件如何编码 Thought→Action→Observation;`ClaudeAgentOptions` 暴露哪些循环旋钮。
- 边界声明:内层提示词组装/工具选择在闭源侧,用行为实验(transcript、auto-compact 时机、--debug)反推;对照 02.01 循环失效点逐条验证。

### 02 权限模型【维度 4+8】
- 要点:permissionMode 语义(default/acceptEdits/plan/bypassPermissions/dontAsk/auto);settings 三级作用域(user/project/local)+ allow/deny 规则与工具类别;权限请求→授权→"always allow"记忆的状态流转;hooks 如何介入授权(衔接第 04 章)。
- 结论导向:对照 02.04「权限边界与工具安全」,评默认最小权限是否成立、auto 模式模型分类器的风险面。

### 03 Skills 与扩展机制【维度 6】
- 要点:SKILL.md 的 frontmatter(name/description)+ 正文结构;skills 目录发现规则与按需加载(description 何时把 skill 拉进上下文,对照 02.02);skills/commands/subagents/plugins 四件套分工;MCP 接入;Agent Skills 跨实现采用度(Codex/Gemini CLI 等,呼应第 05 章)。
- 动手:clone anthropics/skills 精读 3 个示例 + spec/,自写一个 SKILL.md 并验证触发。

### 04 hooks:循环上的可编程闸门【维度 8 + 工程扩展】
- 要点:hooks 事件面(PreToolUse/PostToolUse/PostToolUseFailure/PermissionRequest/UserPromptSubmit/Stop/SubagentStop/PreCompact);matcher + handler(命令/HTTP/LLM prompt)三层配置;JSON 输入输出与 decision(block/deny/allow/ask)如何改判工具调用。
- 两面性:hook 既是安全闸门(拦危险 Bash)也是新攻击面(读取/篡改工具输入);写一条 PreToolUse 拦截实验 + 一条 PostToolUse 自动格式化实验。

### 05 与生态对比:SDK 化闭源 Agent【跨对象综合】
- 要点:与 02 Codex(Apache-2.0 全开源)对照「闭源核心+开源外壳」vs「全开源」两种发行策略对可分析性/扩展性/信任的影响;与 06 Copilot 对照产品分层;SKILL.md/hooks 是否构成事实标准(OpenCode/Hermes 的 skills 借鉴,衔接 03/04 子目录)。
- 结论:用统一框架八维度给 Claude Code 打分,提炼强项与盲区,产出「可抄(分层/闸门/事件面)/要避(黑盒、订阅锁定、数据回传)」清单。

## 交付物与验收标准

| 章 | 交付物 | 验收 |
|---|---|---|
| 01 | SDK 架构图 + 消息流笔记 | 能画 CLI/SDK 分层,用消息帧讲一遍主循环 |
| 02 | 权限模型表 | 能说清 6 种模式差异与三层 settings 优先级 |
| 03 | 自写 SKILL.md | 本地触发成功,能解释何时进上下文 |
| 04 | hooks 拦截实验 | 危险命令被 block 且理由可读 |
| 05 | 六对象对比表(横跨 02.09) | 能回答「闭源核心能否被 SDK 化解剖」 |

## 衔接

- 蓝图:[Learning Path](/ai/02-agents/09/01/)(八维度统一框架);概念基础:[权限边界与工具安全](/ai/02-agents/04/07/);下一篇:02 OpenAI Codex(见其 README)。
- 阅读方法:先 docs 后 SDK 源码,边读边本地跑 `claude` 复现;每章笔记 = 关键代码/文档片段 + 对应 02 概念 + 一条「可抄/要避」结论。
