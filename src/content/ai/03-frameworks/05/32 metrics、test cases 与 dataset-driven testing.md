---
title: "metrics、test cases 与 dataset-driven testing"
number: "03.05.32"
chapter: 3
chapterTitle: "Frameworks"
section: 5
sectionTitle: "Evaluation and Observability Frameworks"
group: "3.10.3.5.5 DeepEval"
created: 2026-09-04 08:57
author: "iopanda"
tags: ["framework", "evaluation", "observability", "deepeval", "metrics", "dataset"]
sourceId: "3.10.3.5 Evaluation and Observability Frameworks/3.10.3.5.5 DeepEval/02 metrics、test cases 与 dataset-driven testing"
---
# metrics、test cases 与 dataset-driven testing

> DeepEval README 和 metrics README 最能说明它路线的一点，就是它把 metrics、test cases、datasets 组织成一套正式测试语言。[10][11] 这意味着在 DeepEval 里，metric 不是一个随手跑的评分函数，而是测试断言的一部分；dataset 也不是零散样本，而是被直接纳入测试执行路径。

**学习目标**：学完本章，你将能够——
1. 理解为什么 metrics、test case、dataset 在 DeepEval 里是一个系统；
2. 说出 agentic metrics、RAG metrics、multi-turn metrics、safety metrics 的结构差异；
3. 理解 dataset-driven testing 为什么比单次 prompt 对比更工程化；
4. 判断什么时候该围绕 test cases 组织 eval；
5. 为系统写一张 metric-dataset card。

## 1. metric 在这里不是“出个分数”

在 DeepEval 世界里，一个 metric 往往意味着：
- 有明确的评估标准；
- 有阈值；
- 能输出分数和原因；
- 能作为测试通过/失败的依据。[10][12]

这说明 metric 在这里就是 testing primitive。

## 2. 为什么 metric 家族这么重要

README 里直接列了多类指标：[10]
- custom / all-purpose
- agentic
- RAG
- multi-turn
- MCP
- multimodal
- safety / correctness / deterministic

这说明 DeepEval 不只是“对最终回答评分”，而是试图给不同系统形态一套可编排的评价语言。

## 3. dataset-driven testing 的意义

DeepEval 不只是测一个 test case，也强调：
- synthetic datasets
- benchmark datasets
- `evals_iterator()`
- 多轮 goldens

这意味着它把评估从单次示例推进到批量、结构化、可重复的测试集合。[10][12][13]

## 4. trajectory 和 component-level eval 为什么重要

DeepEval 明确支持：
- LLM apps end-to-end
- complete agent trajectories
- individual agent steps。[10]

这说明它不是只看最终文本，而是承认复杂系统需要：
- 看整体结果；
- 看路径；
- 看具体步骤和子组件。

## 5. 动手活动

> [!example] 动手活动：输出 `deepeval-metric-dataset-card.md`
>
> 列你的系统最需要的 5 个 metrics、对应的 test cases 和 dataset 来源。写一句结论：你现在的 eval 是零散样本，还是已经形成 dataset-driven testing。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| metric 在 DeepEval 里像什么 | test primitive |
| dataset 在做什么 | 把 eval 变成批量、可重复测试流 |
| trajectory eval 为什么重要 | 复杂 agent 系统不能只看最终答案 |
| 最大价值 | 让质量维度可以被结构化编排成测试集合 |

## 引用

- [10] https://github.com/confident-ai/deepeval/blob/main/README.md — DeepEval README
- [11] https://github.com/confident-ai/deepeval/blob/main/deepeval/metrics/README.md — DeepEval metrics README
- [12] https://github.com/confident-ai/deepeval/blob/main/typescript/README.md — DeepEval TypeScript README
- [13] https://github.com/confident-ai/deepeval/blob/main/typescript/src/evaluate/test-run/README.md — DeepEval test run README

上一篇：[01 code-first LLM eval 的设计哲学](/ai/03-frameworks/05/31/)

下一篇：[03 pytest-like workflow、CI 集成与 regression](/ai/03-frameworks/05/33/)
