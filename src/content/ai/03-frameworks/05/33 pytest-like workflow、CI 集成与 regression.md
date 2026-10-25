---
title: "pytest-like workflow、CI 集成与 regression"
number: "03.05.33"
chapter: 3
chapterTitle: "Frameworks"
section: 5
sectionTitle: "Evaluation and Observability Frameworks"
group: "3.10.3.5.5 DeepEval"
created: 2026-09-04 08:59
author: "iopanda"
tags: ["framework", "evaluation", "observability", "deepeval", "pytest", "ci"]
sourceId: "3.10.3.5 Evaluation and Observability Frameworks/3.10.3.5.5 DeepEval/03 pytest-like workflow、CI 集成与 regression"
---
# pytest-like workflow、CI 集成与 regression

> DeepEval 的一大特征，是它明确把自己类比成 Pytest / Vitest，并且把测试运行器、matchers、dataset iteration、CI integration 放到同一条开发者工作流里。[10][12][13] 这意味着它在解决的问题不是“平台上怎么展示结果”，而是“开发者怎样像写测试一样持续写、跑、回归这些 eval”。

**学习目标**：学完本章，你将能够——
1. 理解为什么 DeepEval 特别适合已有测试文化的团队；
2. 说出 `assert_test` / `toPass()` / `deepeval test run` 在工作流中的位置；
3. 理解它和 declarative CI harness 的差异；
4. 判断什么时候该用 code-first regression，而不是 purely config-first；
5. 为系统写一张 eval-ci-workflow card。

## 1. pytest-like 的真正价值

它最值钱的不是“长得像 pytest”，而是：
- 开发者不需要切换到另一个完全陌生的心智；
- eval 可以与现有测试、fixtures、CI、代码审查自然放在一起；
- 失败结果可以像普通测试一样被解释和修复。

这对 adoption 很重要。

## 2. Python 和 TypeScript 两条路径说明了什么

DeepEval 明确给出了两种 code-first 入口：[10][12]
- Python: `assert_test(...)`
- TypeScript/Vitest: `expect(testCase).toPass([...])`

这说明它真正想提供的是“测试语言”，而不是只提供一个网页面板。

## 3. regression 在这里怎么发生

有了 test cases、datasets、metrics、thresholds：
- 你每次改 prompt / model / agent 逻辑；
- 都可以重跑同一批用例；
- 然后看 pass/fail 与原因。

这就是 code-first regression 的价值：变化被立即反映为测试结果，而不是靠主观比较。

## 4. 与 promptfoo 的差异

两者都能进 CI，但工作方式不同：
- promptfoo 更偏 declarative config + CLI + matrix testing；
- DeepEval 更偏代码内 authoring + metric objects + test runner 心智。

所以 DeepEval 更适合“开发者把 eval 视作代码的一部分”的文化。

## 5. 动手活动

> [!example] 输出 `deepeval-ci-workflow-card.md`
>
> 列你的系统当前是否已有 pytest/vitest、哪些 eval 要进 CI、哪些 metrics 有 threshold。写一句结论：你的 regression 更适合 code-first 还是 config-first。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| pytest-like workflow 在做什么 | 把 LLM eval 纳入现有开发者测试文化 |
| `assert_test` / `toPass()` 在做什么 | 把质量要求写成可执行断言 |
| regression 在做什么 | 让 prompt/model/agent 改动可被持续比较 |
| 最大价值 | 让 eval 成为代码工作流的一部分 |

## 引用

- [10] https://github.com/confident-ai/deepeval/blob/main/README.md — DeepEval README
- [12] https://github.com/confident-ai/deepeval/blob/main/typescript/README.md — DeepEval TypeScript README
- [13] https://github.com/confident-ai/deepeval/blob/main/typescript/src/evaluate/test-run/README.md — DeepEval test run README

上一篇：[02 metrics、test cases 与 dataset-driven testing](/iopanda-blog/ai/03-frameworks/05/32/)

下一篇：[04 judge 可靠性、成本与工程边界](/iopanda-blog/ai/03-frameworks/05/34/)
