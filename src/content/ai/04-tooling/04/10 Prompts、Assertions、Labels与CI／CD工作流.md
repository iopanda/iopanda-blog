---
title: "Prompts、Assertions、Labels与CI/CD工作流"
number: "04.04.10"
chapter: 4
chapterTitle: "Tooling"
section: 4
sectionTitle: "Prompt Management"
group: "02 Promptfoo"
created: 2026-09-03 22:32
author: "iopanda"
tags: ["course", "ai-tooling", "prompt-management", "promptfoo", "capabilities"]
sourceId: "3.10.4.4 Prompt Management/02 Promptfoo/02 Prompts、Assertions、Labels与CI/CD工作流"
---
# Prompts、Assertions、Labels与CI/CD工作流

> Promptfoo 的能力主线非常清楚：prompts、test cases、assertions、matrix compare、Langfuse labels、CI/CD。Configuration 文档说明每个 prompt 会和一组 test cases 运行，再用 assertions 判定输出是否满足要求；Langfuse integration 文档则显示它还能直接引用 `langfuse://prompt@production` 这类标签化版本。[2][5][6]

**学习目标**：学完本章，你将能够——

1. 看懂 Promptfoo 如何把 prompt 放入系统化测试流程；
2. 区分 prompts、assertions、labels、matrix compare、CI/CD 各自的角色；
3. 理解它为什么可以与 Langfuse Prompts 形成上下游协作；
4. 判断哪些能力最先带来 ROI；
5. 避免把 Promptfoo 用成“只是本地试试 prompt 的脚本”。

## 1. Prompts：Promptfoo 把 prompt 当输入对象

Configuration 文档里最核心的概念是：用 prompts + test cases + providers 跑出结果矩阵。[5]

这意味着 Promptfoo 并不把 prompt 当静态文案，而把它当作：
- 可比较对象；
- 可回归测试对象；
- 可在不同模型下执行的实验对象。

## 2. Assertions：把“更好”翻译成判断条件

Promptfoo 的 assertions 是它最大的产品抓手之一。[5]

因为 prompt 的问题常常不是“完全错”，而是：
- 不符合 JSON；
- 不符合格式；
- 没覆盖业务规则；
- 没达到预期质量门槛。

Assertions 让这些标准变成可执行规则。

## 3. Labels：为什么它和 Langfuse Prompts 可以协作

Langfuse integration 文档说明，Promptfoo 可以直接引用：
- `langfuse://prompt-name:version`
- `langfuse://prompt-name@production`
- `langfuse://prompt-name@staging`[6]

这说明 Promptfoo 并不要求自己承担 prompt 资产管理，而是能直接消费上游版本和标签。

从产品角度看，这很成熟：
- Langfuse Prompts 管资产；
- Promptfoo 管验证；
- 两者之间用 version / label 对齐。

## 4. Matrix Compare：为什么它特别适合 prompt 迭代

Promptfoo 的 intro 文档反复强调 side-by-side comparisons 和 structured results。[2]

这意味着：
- 同一 prompt 可在多个模型上比较；
- 同一模型可比较多个 prompt 版本；
- 团队可以直观看出改动的副作用和收益。

## 5. CI/CD：把 prompt 变更前移到合并前

README 和 docs 都把 CI/CD 当核心能力。[2][7]

这使 Promptfoo 真正从“分析工具”变成“门禁工具”：
- prompt 改动进 PR 前就能跑；
- 回归失败直接阻断；
- 团队能把 prompt 质量像代码质量一样治理。

## 6. Red Teaming 的关联价值

虽然本章聚焦 prompt management，但 Promptfoo 的 red teaming 路线意味着 prompt 不只是要“有效”，还要“安全”。[2][7]

这让 prompt 管理不再只是内容运营问题，而是发布风险问题。

## 7. 哪些能力最先见效

通常顺序是：
1. 先为关键 prompt 建 prompts + test cases；
2. 再加 assertions；
3. 再把结果接进 CI/CD；
4. 最后再和 Langfuse labels / production versions 对齐。

## 8. 总结

| 能力 | 它回答的问题 |
|---|---|
| Prompts | 要评什么 |
| Assertions | 怎样算通过 [5] |
| Labels / Versions | 测的是哪一版 [6] |
| Matrix Compare | 哪个 prompt / model 组合更好 [2] |
| CI/CD | 怎样把坏改动挡在发布前 [2][7] |
| Red Teaming 关联 | prompt 是否也带来安全风险 |

**思考题**：为什么对很多团队来说，把 prompt 和 version label 对齐，比单独做一次 prompt 测试更重要？

> [!note] 参考答案
> 因为团队真正要回答的问题不是“某个 prompt 测过没”，而是“生产上的哪一版 prompt 是否真的通过了验证”。没有版本和标签对齐，测试结果很快就会失去可信度。

## 引用

- [2] https://raw.githubusercontent.com/promptfoo/promptfoo/main/README.md — Promptfoo README
- [5] https://www.promptfoo.dev/docs/configuration/guide/ — Promptfoo config guide
- [6] https://www.promptfoo.dev/docs/integrations/langfuse/ — Promptfoo Langfuse integration
- [7] https://www.promptfoo.dev/pricing/ — Promptfoo pricing

上一篇：[01 产品定位、测试驱动Prompt管理与适用场景](/ai/04-tooling/04/09/)——先理解定位，再看它如何把 prompt 放进系统化验证流程。

下一篇：[03 质量、价格与采用边界](/ai/04-tooling/04/11/)——能力之后，再回头判断它是否成熟、怎么收费、采用边界如何。
