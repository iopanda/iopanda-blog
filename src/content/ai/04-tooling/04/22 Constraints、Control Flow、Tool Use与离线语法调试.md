---
title: "Constraints、Control Flow、Tool Use与离线语法调试"
number: "04.04.22"
chapter: 4
chapterTitle: "Tooling"
section: 4
sectionTitle: "Prompt Management"
group: "04 Guidance"
created: 2026-09-04 10:07
author: "iopanda"
tags: ["course", "ai-tooling", "prompt-management", "guidance", "capabilities"]
sourceId: "3.10.4.4 Prompt Management/04 Guidance/02 Constraints、Control Flow、Tool Use与离线语法调试"
---
# Constraints、Control Flow、Tool Use与离线语法调试

> Guidance 的能力主线非常清楚：regex constraints、CFG、`select()`、conditionals、loops、tool use、token healing，以及用 Mock model 做离线 grammar 调试。[2][4] 这不是一堆零碎功能，而是一整套“如何让模型在边界内生成”的执行层工具箱。

**学习目标**：学完本章，你将能够——

1. 看懂 Guidance 的核心能力为什么围绕执行控制组织；
2. 区分约束、控制流、工具调用和离线调试各自的角色；
3. 理解它为什么比单纯 prompt 文案更稳定，但也更工程化；
4. 判断哪些能力最先带来 ROI；
5. 避免把 Guidance 误解成“只是 prompt 模板语法糖”。

## 1. Regex 与 CFG：把输出边界显式化

Guidance README 明确给出了两类关键约束：
- regex constraints；
- context free grammar 约束。[2]

这意味着：
- 数字、枚举、结构片段可以直接限制；
- 输出不再完全依赖自然语言提示理解；
- 复杂结构可由 grammar 约束保证。

## 2. `select()`：有限选择比开放生成更可靠

README 里的 `select(["A", "B", "C", "D"])` 示例非常典型。[2]

它的产品意义在于：
- 当答案空间已知时，不应该再让模型自由生成；
- 可以把“请只回答 ABCD 之一”变成硬约束；
- 在分类、路由、工具选择等场景中尤其重要。

## 3. Control Flow：条件、循环与隐藏复杂度

Guidance 的一大特色是把 conditionals、loops 和 generation 无缝交织。[2][4]

这带来的价值是：
- 多步交互不必拆成松散脚本；
- 控制逻辑和 prompt 处在同一个执行流里；
- 更适合复杂问答、agent 子流程和多轮生成。

## 4. Tool Use：把外部能力放进同一生成程序

官方文档明确包含 “Getting language models to use external tools” 的主题。[4]

这说明 Guidance 不只约束输出，也支持：
- 在生成流程中接外部工具；
- 将工具调用纳入同一控制逻辑；
- 让 prompt、tool、branching 形成一个整体程序。

## 5. 离线 Grammar 调试：降低高约束场景的试错成本

README 提供了很有价值的能力：
- 可直接验证 candidate strings 是否匹配 grammar；
- 可用 Mock model 本地测试完整约束流；
- 不必每次都消耗真实模型调用。[2]

这对高约束输出场景非常关键，因为很多错误其实发生在 grammar 设计阶段，而不是模型推理阶段。

## 6. Token Healing 与 Acceleration：执行层的工程细节

文档中还单列了 token healing 和 guidance acceleration。[4]

这说明 Guidance 不只关心“能不能约束”，还关心：
- token 边界问题；
- 约束执行效率；
- 真实工程里的时延与成本。

## 7. 哪些能力最先见效

通常顺序是：
1. 先在关键输出上加 regex 或 `select()`；
2. 再把复杂结构升级成 grammar；
3. 再把工具调用和控制流接入；
4. 最后再做 token healing 与 acceleration 优化。

## 8. 总结

| 能力 | 它回答的问题 |
|---|---|
| Regex / CFG | 输出边界如何被硬约束 [2] |
| `select()` | 有限候选如何稳定选择 |
| Conditionals / Loops | 多步逻辑如何与生成合并 [2][4] |
| Tool Use | 外部能力如何并入同一程序 [4] |
| Mock / Grammar Debug | 高约束流程如何低成本调试 [2] |
| Token Healing / Acceleration | 约束执行如何更稳更快 [4] |

**思考题**：为什么高可靠生成系统往往需要“硬约束 + 控制流”，而不是只写更长的 prompt？

> [!note] 参考答案
> 因为长 prompt 仍然主要依赖模型自行遵守要求，而硬约束和控制流会把规则直接前移到执行层，显著降低格式漂移、越界输出和流程失控的概率。

## 引用

- [2] https://raw.githubusercontent.com/guidance-ai/guidance/main/README.md — Guidance README
- [4] https://guidance.readthedocs.io/en/latest/ — Guidance docs

上一篇：[01 产品定位、受控生成心智与适用场景](/iopanda-blog/ai/04-tooling/04/21/)——先理解定位，再看它如何把约束与控制流放进执行层。

下一篇：[03 质量、社区、价格与采用边界](/iopanda-blog/ai/04-tooling/04/23/)——能力之后，再回头判断它是否成熟、适用边界如何。
