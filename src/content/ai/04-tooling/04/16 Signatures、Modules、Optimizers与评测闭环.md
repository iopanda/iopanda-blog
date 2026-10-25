---
title: "Signatures、Modules、Optimizers与评测闭环"
number: "04.04.16"
chapter: 4
chapterTitle: "Tooling"
section: 4
sectionTitle: "Prompt Management"
group: "03 DSPy"
created: 2026-09-03 22:45
author: "iopanda"
tags: ["course", "ai-tooling", "prompt-management", "dspy", "capabilities"]
sourceId: "3.10.4.4 Prompt Management/03 DSPy/02 Signatures、Modules、Optimizers与评测闭环"
---
# Signatures、Modules、Optimizers与评测闭环

> DSPy 官网几乎把整个产品压缩在一组概念里：Signatures、Modules、Optimizers、Metrics and evaluation、Adapters。[4][5][6] 这说明 DSPy 的 prompt 管理，不是围绕版本号或模板库，而是围绕“程序结构如何被编译和优化”展开。

**学习目标**：学完本章，你将能够——

1. 看懂 DSPy 的能力为什么围绕程序抽象组织；
2. 区分 signatures、modules、optimizers、metrics 各自的角色；
3. 理解它为什么比手工 prompt 工程更系统，但也更重；
4. 判断哪些能力最先带来 ROI；
5. 避免把 DSPy 误解成“又一个 prompt 调参工具”。

## 1. Signatures：把提示意图显式化

DSPy 的 Signatures 是它最有辨识度的抽象之一。[4]

产品上可以把它理解为：
- 不直接写完整 prompt 文案；
- 先声明输入、输出和任务意图；
- 再让系统把这些声明转成更可优化的提示结构。

这一步把 prompt 从“文本技巧”提升成“任务接口”。

## 2. Modules：把 prompt 工程变成组合系统

Modules 是 DSPy 的第二根支柱。[4][6]

它的价值在于：
- 不再把所有逻辑挤在一个 prompt 里；
- 可以把检索、分类、生成、判断等拆成模块；
- 模块之间能组合成复杂系统。

这也是为什么 DSPy 很适合多步骤 agent、RAG、knowledge-intensive workflows。[2]

## 3. Optimizers：DSPy 最核心的差异化

DSPy 的关键不只是写模块，而是能优化它们。README 和优化文档都明确强调 optimizing prompts and weights。[2][5]

这意味着：
- 提示词不再主要靠人手调；
- 可以基于 evaluation 去搜索更好的指令、示例或程序配置；
- prompt 工程开始更像模型训练里的超参数优化。

这是 DSPy 和其他 prompt 管理工具最本质的分叉点。

## 4. Metrics and evaluation：没有评测就没有优化

DSPy 官网明确把 Metrics and evaluation 和 Optimizers 并列。[4]

这说明 DSPy 的优化并不是黑箱魔法，而是依赖：
- 有什么任务标准；
- 用什么 metric 衡量；
- 哪种程序结构更优。

所以 DSPy 虽然不主打“测试平台”外观，但本质上对评测依赖很强。

## 5. Adapters：Signatures 如何变成 Prompt

官网明确有一个 “Adapters: how signatures become prompts” 概念。[4]

这意味着 DSPy 并不是否定 prompt，而是把 prompt 下沉为编译后的表示。对产品经理来说，这很重要：
- 用户不是不写 prompt，而是不再直接围绕 prompt 本身做最低层优化；
- 他们优化的是更高阶的程序抽象。

## 6. 哪些能力最先见效

通常顺序是：
1. 先用 signatures 明确任务接口；
2. 再把常见步骤抽成 modules；
3. 再用 metrics 建立评价标准；
4. 最后让 optimizers 去做系统性改进。

如果一开始就跳到 optimizer，而没有稳定任务定义和评测，收益会很不稳定。

## 7. 总结

| 能力 | 它回答的问题 |
|---|---|
| Signatures | 任务接口怎样被显式定义 [4] |
| Modules | prompt 工程怎样变成组合系统 [6] |
| Optimizers | 如何系统优化 prompt 与权重 [2][5] |
| Metrics & Evaluation | 优化依据是什么 |
| Adapters | 声明式结构如何落回真实 prompt |

**思考题**：为什么 DSPy 的真正难点，不是学会一个 API，而是学会“先定义任务结构，再让系统优化”这套心智？

> [!note] 参考答案
> 因为这和传统 prompt 工程正好相反。传统方式先写 prompt 再微调；DSPy 要求先抽象任务、定义模块、建立评测，再交给系统优化。API 只是表层，心智切换才是 adoption 难点。

## 引用

- [2] https://raw.githubusercontent.com/stanfordnlp/dspy/main/README.md — DSPy README
- [4] https://dspy.ai/ — DSPy homepage
- [5] https://dspy.ai/learn/optimization/overview/ — DSPy optimization docs
- [6] https://dspy.ai/learn/programming/modules/ — DSPy modules docs

上一篇：[01 产品定位、程序化Prompt工程与适用场景](/ai/04-tooling/04/15/)——先理解定位，再看它如何把 prompt 工程做成程序系统。

下一篇：[03 质量、社区、价格与采用边界](/ai/04-tooling/04/17/)——能力之后，再回头判断它是否成熟、采用边界如何。
