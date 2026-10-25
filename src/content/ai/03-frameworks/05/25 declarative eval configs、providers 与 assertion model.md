---
title: "declarative eval configs、providers 与 assertion model"
number: "03.05.25"
chapter: 3
chapterTitle: "Frameworks"
section: 5
sectionTitle: "Evaluation and Observability Frameworks"
group: "3.10.3.5.4 promptfoo"
created: 2026-09-04 08:32
author: "iopanda"
tags: ["framework", "evaluation", "observability", "promptfoo", "assertions", "config"]
sourceId: "3.10.3.5 Evaluation and Observability Frameworks/3.10.3.5.4 promptfoo/02 declarative eval configs、providers 与 assertion model"
---
# declarative eval configs、providers 与 assertion model

> promptfoo 的一个核心特征，是它把 eval 流程收敛成声明式配置，而不是要求你先写一套自定义测试 harness。CLI 文档清楚展示了：prompts、providers、tests、assertions、filters、tags、outputs 都能通过统一配置和参数组织。[11] 这说明在 promptfoo 里，评估的第一语言不是 Python 测试代码，而是 declarative eval spec。

**学习目标**：学完本章，你将能够——
1. 理解为什么声明式配置会成为 promptfoo 的主语言；
2. 说出 providers、prompts、tests、assertions 在同一 eval spec 里的关系；
3. 理解这种 declarative 路线与 code-first 路线的差异；
4. 判断什么时候团队更适合 declarative harness；
5. 为系统写一张 eval-spec card。

## 1. 配置在这里不是附属，而是测试契约

CLI 文档里最关键的不是某个命令，而是整个 eval 的组织方式：[11]
- prompts
- providers
- tests
- assertions
- filters
- output formats
- tags

这说明 promptfoo 的 eval 不是“跑一段代码”，而是“执行一份测试契约”。

## 2. providers 为什么重要

promptfoo 的比较能力来自 providers 被正式化：
- 同样测试集可以跑多个 provider；
- 同一个 prompt 可以在多个模型上比较；
- regression 可以跨版本、跨目标复用。

这和手写脚本的最大差异，就是比较逻辑被提升成框架正式对象。

## 3. assertion model 为什么值钱

有了 assertions，AI 输出不再只是“看上去像对”，而是：
- 可以被规则判断；
- 可以被模型 judge；
- 可以进入 pass/fail 语义；
- 可以成为 CI 门禁条件。

这正是 promptfoo 把 eval 测试工程化的关键一步。

## 4. declarative 的代价与好处

好处：
- 更容易共享；
- 更容易进 CI；
- 更容易做大规模矩阵比较。

代价：
- 对非常复杂的自定义逻辑，灵活度不如纯代码；
- 某些高级工作流可能仍然需要扩展或脚本补足。

## 5. 动手活动

> [!example] 输出 `promptfoo-eval-spec-card.md`
>
> 列你的系统 eval 需要哪些字段：prompts、providers、tests、assertions、filters、outputs。写一句结论：你现在的 eval 是脚本拼接，还是已经有正式测试契约。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| declarative config 在做什么 | 把 eval 变成可共享、可执行的测试契约 |
| providers 在做什么 | 把模型/目标比较正式化 |
| assertions 在做什么 | 把输出质量转成 pass/fail 与指标 |
| 最大价值 | 让 eval 能够进入工程自动化流 |

## 引用

- [11] https://github.com/promptfoo/promptfoo/blob/main/site/docs/usage/command-line.md — promptfoo command line docs

上一篇：[01 AI testing framework 的设计哲学](/ai/03-frameworks/05/24/)

下一篇：[03 regression、red teaming、security scanning 与 CI/CD](/ai/03-frameworks/05/26/)
