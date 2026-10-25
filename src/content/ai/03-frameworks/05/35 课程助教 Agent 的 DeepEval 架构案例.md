---
title: "课程助教 Agent 的 DeepEval 架构案例"
number: "03.05.35"
chapter: 3
chapterTitle: "Frameworks"
section: 5
sectionTitle: "Evaluation and Observability Frameworks"
group: "3.10.3.5.5 DeepEval"
created: 2026-09-04 09:03
author: "iopanda"
tags: ["framework", "evaluation", "observability", "deepeval", "case-study"]
sourceId: "3.10.3.5 Evaluation and Observability Frameworks/3.10.3.5.5 DeepEval/05 课程助教 Agent 的 DeepEval 架构案例"
---
# 课程助教 Agent 的 DeepEval 架构案例

> 把 DeepEval 放回课程助教主线时，它最自然的角色不是“产品化平台”，而是：**课程助教的关键质量要求需要被开发者像写测试一样，直接写成代码里的 metrics、test cases、datasets 和 thresholds。** 这时候主语不是平台协作，而是可执行质量断言。

**学习目标**：学完本章，你将能够——
1. 判断课程助教何时适合 DeepEval；
2. 设计课程助教的 answer relevancy、faithfulness、tool correctness、role adherence 等测试；
3. 说明为什么这里最重要的是 code-first quality assertions；
4. 设计课程助教的本地/CI 评估工作流；
5. 写一张课程助教的 DeepEval 适配卡。

## 1. 什么时候课程助教适合 DeepEval

- 开发者希望直接在代码里写 eval；
- 已有 pytest/vitest 工作流；
- 课程助教需要 end-to-end、trajectory、component-level 指标共存；
- 想把 prompt / retrieval / tool 使用质量做成可执行断言；
- 平台闭环还不是第一主语。

## 2. 推荐架构

- test case 层：课程问答、规则问答、引用问答、多轮对话样本
- metric 层：correctness、faithfulness、answer relevancy、role adherence、tool correctness
- dataset 层：goldens / synthetic datasets / regression cases
- runner 层：pytest / deepeval test run / vitest
- CI 层：对关键 metrics 设置阈值并做 PR gate

## 3. 为什么这里不优先选 promptfoo

不是因为 promptfoo 不强，
而是这里的主问题更偏：
- 开发者直接 author metrics/test cases；
- 质量要求写进代码；
- trajectory 和 component eval 融入既有测试文化。

## 4. 动手活动

> [!example] 输出 `course-ta-deepeval-card.md`
>
> 为课程助教列：5 个关键 metrics、对应 test cases、阈值和是否进入 CI。写一句结论：你的助教质量要求现在是文档说明，还是已经变成可执行断言。

## 5. 总结

| 关键问题 | 一句话 |
|---|---|
| 课程助教为什么适合 DeepEval | 因为它需要 code-first 的质量断言 |
| 最大价值 | 把助教质量要求直接写进测试代码 |
| 不适合什么 | 主要需求是产品化 observability 或平台治理的场景 |

## 引用

- [10] https://github.com/confident-ai/deepeval/blob/main/README.md — DeepEval README
- [11] https://github.com/confident-ai/deepeval/blob/main/deepeval/metrics/README.md — DeepEval metrics README
- [12] https://github.com/confident-ai/deepeval/blob/main/typescript/README.md — DeepEval TypeScript README

上一篇：[04 judge 可靠性、成本与工程边界](/ai/03-frameworks/05/34/)

下一篇：[06 DeepEval 与 Langfuse、Phoenix、MLflow、promptfoo 的深度对比](/ai/03-frameworks/05/36/)
