---
title: "Promptfoo"
number: "04.04.08"
chapter: 4
chapterTitle: "Tooling"
section: 4
sectionTitle: "Prompt Management"
group: "02 Promptfoo"
created: 2026-09-03 22:32
author: "iopanda"
tags: ["course", "ai-tooling", "prompt-management", "promptfoo"]
sourceId: "3.10.4.4 Prompt Management/02 Promptfoo/README"
---
# Promptfoo

> 模块定位：从「把 prompt 当作可测试、可回归、可进入 CI/CD 的工件」这条路线理解 Prompt Management。和 Langfuse Prompts 这种更偏资产管理层、DSPy 这种更偏程序抽象层不同，Promptfoo 在本模块里最重要的角色是：**让 prompt 的修改可以被系统化验证，而不是靠人工试几次。**[2][4][5][6]

**本目录建议阅读顺序**：

1. [01 产品定位、测试驱动Prompt管理与适用场景](/iopanda-blog/ai/04-tooling/04/09/)
2. [02 Prompts、Assertions、Labels与CI/CD工作流](/iopanda-blog/ai/04-tooling/04/10/)
3. [03 质量、价格与采用边界](/iopanda-blog/ai/04-tooling/04/11/)
4. [04 与 Langfuse Prompts、DSPy、Guidance、Outlines 的竞品对比](/iopanda-blog/ai/04-tooling/04/12/)
5. [05 真实组织案例有限：OpenAI、Anthropic与公开采用信号](/iopanda-blog/ai/04-tooling/04/13/)

## 这一产品为什么值得单开

- 它把 prompt 管理的重点放在“验证”而不是“存储”；
- 它用 YAML、assertions、matrix compare 和 CI/CD 把 prompt 变成可回归工件；
- 它可以与 Langfuse 这类资产层协作，形成“资产管理 + 测试执行”分层；
- 对产品经理来说，它特别适合理解“提示词治理”里测试层与资产层的区别。[2][4][5][6]

## 本目录会回答什么问题

| 问题 | 对应章节 |
|---|---|
| Promptfoo 在 Prompt Management 里到底扮演什么角色 | 01 |
| 它怎样把 prompt 变更接进测试与 CI/CD | 02 |
| 它成熟吗，怎么收费，企业边界是什么 | 03 |
| 它和 Langfuse Prompts / DSPy / Guidance / Outlines 有何差异 | 04 |
| 公开资料里有哪些真实组织采用信号 | 05 |

## 建议阅读方法

- 如果你最关心 prompt 变更验证：先读 01、02；
- 如果你在做工具选型：先读 03、04；
- 如果你最关心组织采用信号：先读 05；
- 如果你想理解它为什么常与 Langfuse 配合：先读 02 和 04。

## 本目录笔记导航

1. [01 产品定位、测试驱动Prompt管理与适用场景](/iopanda-blog/ai/04-tooling/04/09/)
2. [02 Prompts、Assertions、Labels与CI/CD工作流](/iopanda-blog/ai/04-tooling/04/10/)
3. [03 质量、价格与采用边界](/iopanda-blog/ai/04-tooling/04/11/)
4. [04 与 Langfuse Prompts、DSPy、Guidance、Outlines 的竞品对比](/iopanda-blog/ai/04-tooling/04/12/)
5. [05 真实组织案例有限：OpenAI、Anthropic与公开采用信号](/iopanda-blog/ai/04-tooling/04/13/)

## 引用

- [1] https://github.com/promptfoo/promptfoo — Promptfoo GitHub
- [2] https://raw.githubusercontent.com/promptfoo/promptfoo/main/README.md — Promptfoo README
- [3] https://api.github.com/repos/promptfoo/promptfoo — Promptfoo GitHub API
- [4] https://www.promptfoo.dev/docs/intro/ — Promptfoo intro docs
- [5] https://www.promptfoo.dev/docs/configuration/guide/ — Promptfoo config guide
- [6] https://www.promptfoo.dev/docs/integrations/langfuse/ — Promptfoo Langfuse integration
- [7] https://www.promptfoo.dev/pricing/ — Promptfoo pricing
- [8] https://www.promptfoo.dev/blog/promptfoo-joining-openai/ — Promptfoo joining OpenAI

上一篇：[01 Langfuse Prompts](/iopanda-blog/ai/04-tooling/04/02/)——上一产品代表 prompt 资产管理层；这一篇切到 prompt 测试与门禁层。

下一篇：[01 产品定位、测试驱动Prompt管理与适用场景](/iopanda-blog/ai/04-tooling/04/09/)——先从产品定位与适用边界开始。
