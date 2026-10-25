---
title: "regression、red teaming、security scanning 与 CICD"
number: "03.05.26"
chapter: 3
chapterTitle: "Frameworks"
section: 5
sectionTitle: "Evaluation and Observability Frameworks"
group: "3.10.3.5.4 promptfoo"
created: 2026-09-04 08:34
author: "iopanda"
tags: ["framework", "evaluation", "observability", "promptfoo", "redteam", "ci"]
sourceId: "3.10.3.5 Evaluation and Observability Frameworks/3.10.3.5.4 promptfoo/03 regression、red teaming、security scanning 与 CICD"
---
# regression、red teaming、security scanning 与 CICD

> promptfoo 最独特的地方之一，不是“也能测 prompts”，而是它把 regression、red teaming、security scanning、CI/CD 明确摆成同一条工程主线。[10][11][12][15] 这说明在 promptfoo 的世界里，AI 质量问题和 AI 安全问题都不是上线前临时手工检查，而应该成为自动化测试流的一部分。

**学习目标**：学完本章，你将能够——
1. 理解为什么 promptfoo 会把 regression 与 red team 放在同一工具链里；
2. 说出红队插件、策略、策略生成、CI gate 之间的关系；
3. 理解 policy evals 为什么说明它甚至会测试自己的攻击生成器；
4. 判断什么时候系统需要把安全与质量一起进测试门禁；
5. 为系统写一张 ai-quality-security gate card。

## 1. regression 在这里不是只看分数漂不漂

promptfoo 的 regression 主语包括：
- prompt 改了有没有退化；
- 模型换了有没有退化；
- provider 改了有没有退化；
- 断言有没有更多失败；
- 安全与合规有没有倒退。

这意味着它的 regression 语义比普通 benchmark 更贴近上线门禁。

## 2. red teaming 为什么会自然进入同一框架

red-team quickstart 明确说明：[12]
- 自动扫描 50+ vulnerability types；
- 生成 dynamic attack probes；
- 可以攻击 API、浏览器、模型或自定义 target；
- 可接 CI/CD。

这说明在 promptfoo 里，安全不是旁路工作，而是 testing workflow 的一部分。

## 3. providers / plugins / strategies 的关系

redteam providers README 说明：
- 既有迭代式攻击器；
- 也有树搜索式攻击器；
- 还有 image-based red team；
- 并且支持 unblock 等更真实的对抗流程。[14]

这意味着 promptfoo 的红队不是简单 prompt 列表，而是在做 attack generation runtime。

## 4. policy evals 为什么特别说明问题

policy evals README 很关键：它在用 Promptfoo 自己去评估 `PolicyPlugin` 测试生成器本身。[15]
这说明 promptfoo 连自己的攻击生成路径都试图纳入真实 eval 流，而不是只相信“它应该有效”。

## 5. 动手活动

> [!example] 输出 `promptfoo-quality-security-gate-card.md`
>
> 列你的系统需要哪些门禁：functional assertions、provider regression、red-team plugins、security scanning、CI fail threshold。写一句结论：你的上线前检查是手工流程，还是正式测试流。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| regression 在 promptfoo 里像什么 | 上线前 AI 质量门禁 |
| red teaming 在做什么 | 把安全风险纳入自动化测试流 |
| providers/plugins/strategies 在做什么 | 让攻击生成与验证系统化 |
| 最大价值 | 让质量与安全一起进入 CI/CD |

## 引用

- [10] https://github.com/promptfoo/promptfoo/blob/main/README.md — promptfoo README
- [11] https://github.com/promptfoo/promptfoo/blob/main/site/docs/usage/command-line.md — promptfoo command line docs
- [12] https://github.com/promptfoo/promptfoo/blob/main/site/docs/red-team/quickstart.md — promptfoo red team quickstart
- [14] https://github.com/promptfoo/promptfoo/blob/main/src/redteam/providers/README.md — promptfoo red team providers README
- [15] https://github.com/promptfoo/promptfoo/blob/main/src/redteam/plugins/policy/evals/README.md — promptfoo policy evals README

上一篇：[02 declarative eval configs、providers 与 assertion model](/iopanda-blog/ai/03-frameworks/05/25/)

下一篇：[04 团队协作、基线管理与工程边界](/iopanda-blog/ai/03-frameworks/05/27/)
