---
title: "Learning Path"
number: "02.00.01"
chapter: 2
chapterTitle: "Agents"
section: 0
sectionTitle: "章导览"
group: ""
created: 2026-09-03 02:00
author: "iopanda"
tags: ["ai", "agents", "learning-path"]
sourceId: "00 Learning Path"
---
# Learning Path

本路径是 3.10 AI 系列中讨论 **AI Agent（智能体）** 的部分。承接 `01 Models`（从零训练、微调、评测、部署模型的能力），本单元把模型从「会回答」推进到「会行动」：让它能规划、调用工具、记住上下文、与其他智能体协作，并最终交付一个可评测、可治理的 Agent 应用。与 01 一样，本路径以「完成项目即获得能力」为标准：每一章都要产出可运行的 Agent 代码、可检查的轨迹或可审计的报告。

# 内容

## 最终能力边界

| 能力 | 完成标准 |
|---|---|
| 理解 Agent 架构 | 说清 Agent = 模型 + 上下文 + 规划 + 工具 + 记忆 + 循环，并解释为什么模型能力边界决定了 Agent 边界 |
| 上下文与提示工程 | 设计 system prompt、管理长上下文、产出结构化输出，识别提示注入风险 |
| 规划与推理 | 用 ReAct / Plan-and-Execute 把复杂任务拆解为可执行步骤，处理失败与重试 |
| 工具调用 | 用 function calling / MCP 协议接入真实工具，并施加权限边界 |
| 记忆与检索 | 区分短期/长期记忆，用向量检索和会话压缩让 Agent 记住该记的、忘掉该忘的 |
| 多 Agent 协作 | 设计编排者-工作者、流水线、辩论等协作模式，知道何时不该用多 Agent |
| 评测与可观测 | 用轨迹级与任务级指标评测 Agent，用 tracing 定位失败步 |
| 治理与发布 | 输出 Agent 的风险清单、护栏与发布评审，能明确回答「能否上线」 |

> [!warning] 现实边界
> Agent 是当前演进最快的领域之一。本路径教的是**可迁移的架构与工程纪律**：不同框架（LangGraph、AutoGen、自研循环）会更新换代，但「规划-行动-观察-记忆」的循环、权限最小化、评测驱动这些原则长期有效。动手代码以主流开源框架与标准协议（function calling、MCP）为准，并注明版本与验证方式。

## 学习顺序与阶段产出

| 阶段 | 目录 | 要完成的项目 | 获得的能力 |
|---|---|---|---|
| 1 | `02.01 Foundations` | 手动实现一个最小 ReAct Agent | Agent 认知与运行循环 |
| 2 | `02.02 Prompt and Context Engineering` | 可控、抗注入的上下文构建 | 提示与上下文工程 |
| 3 | `02.03 Planning and Reasoning` | 带规划与自我修正的 Agent | 任务分解与容错 |
| 4 | `02.04 Tool Use and Protocols` | 通过 function calling / MCP 接真实工具 | 工具接入与权限 |
| 5 | `02.05 Memory and Retrieval` | 带长期记忆的检索增强 Agent | 记忆系统设计 |
| 6 | `02.06 Multi-Agent Systems` | 多 Agent 协作 Demo 与选型判断 | 多智能体编排 |
| 7 | `02.07 Evaluation and Observability` | Agent 评测集 + 轨迹追踪 | 有证据地改进 Agent |
| 8 | `02.08 Applications and Case Studies` | 端到端 Agent 应用 + 复盘 | 综合交付与取舍 |

## 统一的动手主线（结业项目）

本单元各章共用一个贯穿项目：**「课程助教 Agent」的渐进增强**——

1. 基础版：ReAct 循环回答课程问题；
2. 加工具：检索课程资料、查询课时安排、计算示例；
3. 加记忆：记住学员进度与偏好；
4. 加护栏：注入检测、权限边界、人工确认；
5. 加评测：轨迹黄金集 + 失败复盘；
6. 收官：写成可服务、可监控、可回滚的交付物。

每个模块 README 列出该模块在这个主线上的具体交付物。模块目录本身保持英文名（与 01 一致）；将来填充内容时，每章讲义在模块内以 `01 中文标题.md` 形式存放。

## 统一技术栈（预计）

- Python 3.11+、uv 或 conda、Git、VS Code；
- 模型接入：OpenAI 兼容 API 或本地 vLLM/Ollama；
- Agent 层：先自研最小循环（理解原理），后引入 LangGraph 或 AutoGen（理解框架如何封装）；
- 协议：OpenAI function calling、Model Context Protocol（MCP）、（扩展）A2A；
- 记忆：SQLite + 向量检索（chromadb / FAISS），RAG 复用 01.04 的推理服务经验；
- 可观测：结构化 JSON 日志 + Langfuse 或自建 tracing；
- 评测：pytest + golden 轨迹 + LLM-as-judge（复用 01.06 的评测纪律）。

## 逐模块蓝图

每个模块 README.md 是权威大纲（含各章任务与交付物/验收标准）。此处列阶段顺序：

| 模块 | 一句话定位 |
|---|---|
| `02.01 Foundations` | Agent 是什么、为什么现在才热、运行循环怎么转 |
| `02.02 Prompt and Context Engineering` | 决定 Agent 行为的第一层：上下文怎么构建 |
| `02.03 Planning and Reasoning` | 复杂任务怎么拆、怎么退、怎么修正 |
| `02.04 Tool Use and Protocols` | Agent 的手：怎么安全地调用外部世界 |
| `02.05 Memory and Retrieval` | Agent 的脑外存储：短期/长期/检索 |
| `02.06 Multi-Agent Systems` | 一个 Agent 不够时：角色分工与协作 |
| `02.07 Evaluation and Observability` | Agent 怎么测、怎么看得见内部 |
| `02.08 Applications and Case Studies` | 真实形态与失败复盘，结业项目收官 |

## 前置

- 完成 `01 Models`（尤其 01.03 微调、01.04 推理服务、01.06 评测、01.07 安全治理），或具备等价能力；
- 熟悉 Python、HTTP API、JSON；
- 具备基本的提示词使用经验（会调用任意一个 LLM 的 API 即可）。
