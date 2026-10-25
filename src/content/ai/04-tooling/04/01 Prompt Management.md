---
title: "Prompt Management"
number: "04.04.01"
chapter: 4
chapterTitle: "Tooling"
section: 4
sectionTitle: "Prompt Management"
group: ""
created: 2026-09-03 18:29
author: "iopanda"
tags: ["course", "ai-tooling", "prompt-management"]
sourceId: "3.10.4.4 Prompt Management/README"
---
# Prompt Management

> 如果说 `02.02 Prompt and Context Engineering` 讲的是提示词为什么重要，那么 `04.04` 讲的是：**当 prompt 已经不再是脚本里的一个长字符串，而是会被反复修改、多人协作、上线回滚、自动评测、结构化约束与程序化优化时，应该拿什么工具和方法来管理它？** 这一章不把 prompt management 只理解成“存模板”，而是把它看成版本控制、实验、结构约束、程序化搜索与可追踪演进的组合问题。

**学习目标**：完成本模块后，你将能够——

1. 区分提示模板、prompt versioning、prompt testing、programming with LM、structured outputs 几条路线；
2. 比较 Langfuse Prompts、Promptfoo、DSPy、Guidance、Outlines 的设计中心；
3. 解释为什么 prompt 管理不能只靠复制粘贴和聊天记录；
4. 为一个课程助教的 system prompt、few-shot、输出 schema 设计版本与验证流程；
5. 理解“programming, not prompting”与“structured outputs”为什么会改变提示词工程边界。

## 1. 为什么这一组工具要单独讲

- 当 prompt 进入多人协作和持续迭代阶段，最大的风险不是写不出来，而是改了以后不知道变好还是变坏；
- 提示词管理的难点常和代码不同：它同时涉及自然语言、结构约束、实验数据集与模型差异；
- 这一组工具并不都在做同一件事：有的把 prompt 当资产管理，有的把它当测试对象，有的干脆试图把“写 prompt”升级为“写程序”；
- 学习重点是理解不同抽象如何改变提示词工程，而不是背模板语法。

## 2. 2026-09 我建议先聚焦的开源产品

| 产品 | 一句话定位 | 设计中心 | 更适合谁 |
|---|---|---|---|
| [Langfuse Prompts](/ai/04-tooling/04/02/) | 把 prompt 放进版本化、可追踪的平台工作流 | prompt registry、版本、playground、online feedback | 已经采用 Langfuse 工作流的团队 |
| [Promptfoo](/ai/04-tooling/04/08/) | 把 prompt 当作可回归测试的工件 | fixtures、assertions、matrix compare、CI | 想用工程化方式验证 prompt 变更的团队 |
| [DSPy](/ai/04-tooling/04/14/) | 从“写 prompt”转向“写可优化的 LM 程序” | signatures、modules、optimizers、programming model | 愿意用程序抽象替代手调模板的团队 |
| [Guidance](/ai/04-tooling/04/20/) | 用受控生成语言编写更可约束的提示流程 | templating、control、constrained generation | 需要在生成过程里施加较强控制的团队 |
| [Outlines](/ai/04-tooling/04/26/) | 把结构化输出与约束生成做成默认能力 | JSON/schema/CFG style constraints | 首先关心结构稳定性的团队 |

## 3. 这一模块建议怎么读

1. 先看 [01 Langfuse Prompts](/ai/04-tooling/04/02/) 与 [02 Promptfoo](/ai/04-tooling/04/08/)：先稳住版本与测试；
2. 再看 [03 DSPy](/ai/04-tooling/04/14/)：理解为什么有人想摆脱手工 prompt 调参；
3. 然后看 [04 Guidance](/ai/04-tooling/04/20/) 与 [05 Outlines](/ai/04-tooling/04/26/)：理解受控生成与结构化约束怎样改变工程边界。

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
| prompt-registry-spec.md | 定义 prompt 名称、版本、回滚、实验与审批规则 | 能让团队知道“哪个 prompt 在生产上” |
| prompt-test-matrix.md | 给关键 prompt 建回归测试矩阵 | 每次改动都有可比结果 |
| structured-output-contract.md | 定义输出 schema、失败兜底与重试策略 | 避免“会说但不稳定” |

## 6. 本模块笔记导航

1. [01 Langfuse Prompts](/ai/04-tooling/04/02/)
2. [02 Promptfoo](/ai/04-tooling/04/08/)
3. [03 DSPy](/ai/04-tooling/04/14/)
4. [04 Guidance](/ai/04-tooling/04/20/)
5. [05 Outlines](/ai/04-tooling/04/26/)

## 7. 这一模块该怎么学，才不会学成“产品说明书”

- 不要先记安装命令，先问它把哪类复杂度当作一等公民；
- 不要只看 happy path，重点看治理、排错、迁移、协作与上线证据；
- 不要问“谁最强”，要问“谁最匹配当前系统的首要矛盾”；
- 不要把开源工具当成银弹，工具只是把某类工程纪律做成现成组件。

## 8. 总结

| 关键问题 | 一句话 |
|---|---|
| 这一模块讲什么 | 把 prompt 变成可版本化、可测试、可约束的工程资产 |
| 为什么重要 | prompt 改动频繁且影响巨大，不能只靠感觉回忆 |
| 代表产品 | Langfuse Prompts / Promptfoo / DSPy / Guidance / Outlines |
| 学习重点 | 版本、测试、程序抽象与结构约束四件事一起看 |

## 引用

- [131] https://github.com/langfuse/langfuse — Langfuse GitHub
- [132] https://github.com/promptfoo/promptfoo — Promptfoo GitHub
- [133] https://github.com/stanfordnlp/dspy — DSPy GitHub
- [134] https://github.com/guidance-ai/guidance — Guidance GitHub
- [135] https://github.com/dottxt-ai/outlines — Outlines GitHub

上一篇：[04.03 Application Platforms and Workflows](/ai/04-tooling/03/01/)——应用壳搭好了，下一步看 prompt 这个核心资产怎么管理。

下一篇：[04.05 Vector Databases and Retrieval](/ai/04-tooling/05/01/)——提示词之外，知识系统还离不开真正的 retrieval infrastructure。
