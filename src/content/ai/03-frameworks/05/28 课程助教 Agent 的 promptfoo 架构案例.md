---
title: "课程助教 Agent 的 promptfoo 架构案例"
number: "03.05.28"
chapter: 3
chapterTitle: "Frameworks"
section: 5
sectionTitle: "Evaluation and Observability Frameworks"
group: "3.10.3.5.4 promptfoo"
created: 2026-09-04 08:38
author: "iopanda"
tags: ["framework", "evaluation", "observability", "promptfoo", "case-study"]
sourceId: "3.10.3.5 Evaluation and Observability Frameworks/3.10.3.5.4 promptfoo/05 课程助教 Agent 的 promptfoo 架构案例"
---
# 课程助教 Agent 的 promptfoo 架构案例

> 把 promptfoo 放回课程助教主线时，它最自然的角色不是“产品化观测平台”，而是：**课程助教的 prompts、RAG、agents、tool use、拒答策略和安全边界需要在每次改动后被重新验证，并最好自动接进 CI/CD。** 这时候 promptfoo 的价值不在 traces，而在 regression gate。

**学习目标**：学完本章，你将能够——
1. 判断课程助教何时适合 promptfoo；
2. 设计课程助教的 functional assertions、retrieval assertions、安全扫描和 regression 基线；
3. 说明为什么这里最重要的是门禁，而不是单次诊断；
4. 设计课程助教的上线前 eval/红队流程；
5. 写一张课程助教的 promptfoo 适配卡。

## 1. 什么时候课程助教适合 promptfoo

- prompt 和 provider 经常改；
- RAG 答案、引用、拒答策略要做回归；
- 上线前要自动检查质量门槛；
- 想对提示注入、越权请求、政策绕过做 red team；
- 团队需要 PR / release gate。

## 2. 推荐架构

- eval 层：prompts + providers + tests + assertions
- regression 层：固定基线数据集和 pass thresholds
- security 层：red-team plugins / strategies
- automation 层：CI/CD 触发 eval 与 report
- 协作层：view/share/export 供评审和复盘使用

## 3. 为什么这里不优先选 Langfuse

不是因为 Langfuse 不强，
而是这里最先要解决的不是平台闭环，
而是：
- 每次改动能不能自动被拦；
- 功能和安全是否一起进入测试门禁；
- 回归能否快速比较。

## 4. 动手活动

> [!example] 输出 `course-ta-promptfoo-card.md`
>
> 为课程助教列：基础问答断言、引用准确性断言、拒答断言、注入防护 red-team plugins、CI fail 阈值。写一句结论：你的课程助教现在有没有正式上线门禁。

## 5. 总结

| 关键问题 | 一句话 |
|---|---|
| 课程助教为什么适合 promptfoo | 因为它需要发布前 regression 和 security gate |
| 最大价值 | 把课程助教的质量和安全检查自动化 |
| 不适合什么 | 主要需求是产品化 observability 平台的场景 |

## 引用

- [10] https://github.com/promptfoo/promptfoo/blob/main/README.md — promptfoo README
- [11] https://github.com/promptfoo/promptfoo/blob/main/site/docs/usage/command-line.md — promptfoo command line docs
- [12] https://github.com/promptfoo/promptfoo/blob/main/site/docs/red-team/quickstart.md — promptfoo red team quickstart

上一篇：[04 团队协作、基线管理与工程边界](/iopanda-blog/ai/03-frameworks/05/27/)

下一篇：[06 promptfoo 与 Langfuse、Phoenix、MLflow、DeepEval 的深度对比](/iopanda-blog/ai/03-frameworks/05/29/)
