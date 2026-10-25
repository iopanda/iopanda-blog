---
title: "Application Platforms and Workflows"
number: "04.03.01"
chapter: 4
chapterTitle: "Tooling"
section: 3
sectionTitle: "Application Platforms and Workflows"
group: ""
created: 2026-09-03 18:29
author: "iopanda"
tags: ["course", "ai-tooling", "app-platform-workflows"]
sourceId: "3.10.4.3 Application Platforms and Workflows/README"
---
# Application Platforms and Workflows

> 前两章分别解决了模型入口与质量证据；这一章再向上走一层：**如果团队并不想从 Python 代码开始组装全部 Agent/RAG 系统，而是更希望用可视化平台、低代码工作流、协作控制台、自托管应用外壳快速落地，那么有哪些开源平台值得认识？** `04.03` 关心的不是某个工具能不能拖出一条流程图，而是这些平台各自把“应用搭建”理解成什么问题。

**学习目标**：完成本模块后，你将能够——

1. 区分平台、工作流编排器、聊天工作台、团队应用壳之间的边界；
2. 比较 Dify、n8n、Langflow、Open WebUI、AnythingLLM 的设计中心；
3. 解释为什么有的平台先讲 workflow，有的平台先讲 workspace，有的平台先讲 UI/serving；
4. 为课程助教或企业知识助手选择“先平台后代码”还是“先代码后平台”的路线；
5. 避免把演示友好误当成生产友好。

## 1. 为什么这一组工具要单独讲

- 不是所有团队都该从 SDK 起步；很多团队真正需要的是协作界面、权限、发布、数据接入与工作流可视化；
- 平台工具能显著缩短原型时间，但也会引入平台约束、抽象锁定与迁移成本；
- 真正的学习重点不是“哪个界面更漂亮”，而是它把应用的哪个层做成了一等公民；
- 这一组工具最适合用来训练产品/架构判断：什么时候该快，什么时候该深。

## 2. 2026-09 我建议先聚焦的开源产品

| 产品 | 一句话定位 | 设计中心 | 更适合谁 |
|---|---|---|---|
| [Dify](/ai/04-tooling/03/02/) | 从应用发布与团队协作视角出发的 LLM / Agent 平台 | app studio、workflow、知识库、发布 | 想快速自托管业务应用与团队协作的平台型团队 |
| [n8n](/ai/04-tooling/03/08/) | 通用自动化工作流平台延展出 AI 能力 | workflow automation、integrations、AI nodes | 已有大量 SaaS / API 集成需求的团队 |
| [Langflow](/ai/04-tooling/03/14/) | 偏面向开发者的可视化 AI agent / workflow 工具 | visual flow、component graph、快速实验 | 想用可视化方式理解和组装组件流的团队 |
| [Open WebUI](/ai/04-tooling/03/20/) | 以统一聊天工作台与模型访问前台为中心的开源界面 | multi-model UI、workspace、local + API access | 需要先把模型能力开放给团队使用的组织 |
| [AnythingLLM](/ai/04-tooling/03/26/) | local-first 的知识与 agent 工作台 | workspace、document ingestion、local agent experience | 强调私有化、桌面化与快速知识问答的团队 |

## 3. 这一模块建议怎么读

1. 先看 [01 Dify](/ai/04-tooling/03/02/)：理解“从应用发布往下看”的平台视角；
2. 再看 [02 n8n](/ai/04-tooling/03/08/)：理解传统自动化工作流如何吸收 AI 能力；
3. 然后看 [03 Langflow](/ai/04-tooling/03/14/)：理解可视化 component flow 的教学与实验价值；
4. 最后看 [04 Open WebUI](/ai/04-tooling/03/20/) 与 [05 AnythingLLM](/ai/04-tooling/03/26/)：理解 workspace / chat shell / local-first 这条路。

## 4. 我建议本模块的内容结构

这一模块可以复用你已经稳定下来的写法：

1. 本组总览 README；
2. 每个产品一个文件夹与 `README.md`；
3. 每个产品至少拆成 4~6 篇：
   - 它为什么存在 / 解决什么首要复杂度；
   - 核心抽象、架构与部署形态；
   - 与同类产品相比的设计中心；
   - 在课程助教或企业内部知识系统中的落点；
   - 适用边界、排错与迁移成本；
4. 最终再补一篇本组的选型矩阵：回答“为什么选 A，不选 B”。

## 5. 本模块的推荐交付物

| 交付物 | 说明 | 验收标准 |
|---|---|---|
| platform-vs-code-decision.md | 比较“平台优先”与“代码优先”两条落地路线 | 能解释速度、灵活性、治理、迁移四类取舍 |
| course-assistant-platform-map.md | 画出课程助教在平台中的构成 | 说明知识库、工作流、模型入口、权限、发布分别落在哪层 |
| workflow-boundary-checklist.md | 判断哪些流程适合可视化编排，哪些要回到代码 | 能避免过度平台化 |

## 6. 本模块笔记导航

1. [01 Dify](/ai/04-tooling/03/02/)
2. [02 n8n](/ai/04-tooling/03/08/)
3. [03 Langflow](/ai/04-tooling/03/14/)
4. [04 Open WebUI](/ai/04-tooling/03/20/)
5. [05 AnythingLLM](/ai/04-tooling/03/26/)

## 7. 这一模块该怎么学，才不会学成“产品说明书”

- 不要先记安装命令，先问它把哪类复杂度当作一等公民；
- 不要只看 happy path，重点看治理、排错、迁移、协作与上线证据；
- 不要问“谁最强”，要问“谁最匹配当前系统的首要矛盾”；
- 不要把开源工具当成银弹，工具只是把某类工程纪律做成现成组件。

## 8. 总结

| 关键问题 | 一句话 |
|---|---|
| 这一模块讲什么 | 用平台和工作流快速承载 AI 应用 |
| 为什么重要 | 很多团队的首要需求不是“会写 SDK”，而是“先交付业务应用” |
| 代表产品 | Dify / n8n / Langflow / Open WebUI / AnythingLLM |
| 学习重点 | 看平台把哪一层做成第一语言 |

## 引用

- [121] https://github.com/langgenius/dify — Dify GitHub
- [122] https://github.com/n8n-io/n8n — n8n GitHub
- [123] https://github.com/langflow-ai/langflow — Langflow GitHub
- [124] https://github.com/open-webui/open-webui — Open WebUI GitHub
- [125] https://github.com/Mintplex-Labs/anything-llm — AnythingLLM GitHub

上一篇：[04.02 Observability and Evaluation](/ai/04-tooling/02/01/)——质量证据有了，下一步看“整套应用如何被更快地搭起来”。

下一篇：[04.04 Prompt Management](/ai/04-tooling/04/01/)——平台承载应用之后，还要回答 prompt 本身怎么成为可管理资产。
