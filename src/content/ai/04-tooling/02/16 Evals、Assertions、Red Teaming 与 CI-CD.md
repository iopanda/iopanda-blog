---
title: "Evals、Assertions、Red Teaming 与 CI-CD"
number: "04.02.16"
chapter: 4
chapterTitle: "Tooling"
section: 2
sectionTitle: "Observability and Evaluation"
group: "03 Promptfoo"
created: 2026-09-03 20:08
author: "iopanda"
tags: ["course", "ai-tooling", "observability-and-evaluation", "promptfoo", "capabilities"]
sourceId: "3.10.4.2 Observability and Evaluation/03 Promptfoo/02 Evals、Assertions、Red Teaming 与 CI-CD"
---
# Evals、Assertions、Red Teaming 与 CI-CD

> Promptfoo 的产品价值，不在“能运行测试”这句话本身，而在于它把配置、assertions、providers、red team、reports、CI/CD 很自然地接成一条线。Configuration 文档明确说：YAML 配置会把 prompts 跑过一组 test cases，并用 assertions 检查是否满足要求；red team quickstart 则进一步把安全扫描也拉进了同一工具链。[1][2][3]

**学习目标**：学完本章，你将能够——

1. 看懂 Promptfoo 的能力为什么天然适合工程流水线；
2. 区分 eval、assertion、red team、code scanning、CI/CD 各自扮演的角色；
3. 理解为什么 Promptfoo 不是 observability 平台，但依然很关键；
4. 判断哪些能力最先带来 ROI；
5. 避免把 Promptfoo 用成“只是在本地试一试模型”。

## 1. YAML 配置：Promptfoo 的第一语言

Configuration 文档明确写到：YAML 配置格式会把每个 prompt 结合 example inputs（test cases）运行，并用 requirements（assertions）验证输出。[2]

这件事非常关键，因为它说明 Promptfoo 的核心抽象不是 trace，而是：

- prompt / provider；
- test case；
- assertion；
- result matrix。

从产品视角看，这让 AI 评测变得更像普通工程配置，而不是某个临时 notebook。

## 2. Assertions：把“感觉不错”变成“满足条件”

Promptfoo 的 assertions 机制本质上是把质量标准显式化。[2]

你不再只是说“这个回答看起来行”，而是能写成：

- 是否包含 JSON；
- 是否满足某个 rubric；
- 是否触发某类指标；
- 是否通过自定义校验。

这对团队协作很重要，因为它把个人经验变成可执行规则。

## 3. Evals：比较 prompt、model、provider

README 和 intro 文档都强调 side-by-side model comparison 和 matrix view。[1][3]

这意味着 Promptfoo 很适合回答：

- 同一 prompt 在 GPT、Claude、Gemini 上谁更稳；
- 同一模型在不同 prompt 版本下谁更好；
- 不同 provider 切换后，会不会破坏关键指标。

从 PM 角度，这种对比的直接价值是让模型选型和 prompt 优化变成有证据的决策，而不是凭主观印象。

## 4. Red Teaming：从测试走向安全

Red team quickstart 明确说 Promptfoo 是 red teaming gen AI applications 的工具，可自动扫描 50+ vulnerability types，并支持本地攻击任何从本机/网络可访问的 endpoint。[5]

这说明 Promptfoo 的安全能力不是附属品，而是主线之一。它特别适合扫描：

- jailbreak / prompt injection；
- PII exposure；
- excessive agency；
- 其他合规和安全风险。[6]

## 5. Code Scanning：把 AI 风险前移到 PR 层

Code scanning 文档明确说，它使用 AI agents 查找代码里的 LLM-related vulnerabilities，并能自动在 pull requests 中发 review comments，还可发布到 GitHub Code Scanning / Security tab。[6]

这对产品团队很关键，因为它让 AI 风险不再只在运行后暴露，而是在代码合并前就开始暴露。

## 6. CI/CD：为什么它是 Promptfoo 的主舞台

CI/CD 文档写得非常明确：Promptfoo 可自动评估 prompts、测试安全漏洞，并在部署前作为门禁使用，支持 GitHub Actions、GitLab CI 等现代流水线。[4]

这是 Promptfoo 和很多“评测平台”最大的差别之一：它不一定给你最豪华的工作台，但它很擅长在真实工程系统里卡住门。

## 7. Langfuse 集成：它也可以不是孤岛

Promptfoo 还有 Langfuse integration，允许用 `langfuse://` 引用 Langfuse 管理的 prompts。[7]

这说明 Promptfoo 的定位很清楚：

- 它不一定要自己包办所有资产管理；
- 它可以做测试执行和门禁层；
- 上游 prompt 资产可以放在别的系统里。

这是一个很成熟的产品边界。

## 8. 哪些能力最先见效

通常顺序是：

1. 先用 eval + assertions 建最小回归集；
2. 再把它接进 CI；
3. 再加 red teaming；
4. 最后加 code scanning 与团队协作能力。

这也是为什么 Promptfoo 很适合作为“质量工程起点工具”。

## 9. 总结

| 能力 | 它回答的问题 |
|---|---|
| YAML config | 测试怎样被声明式管理 [2] |
| Assertions | 输出怎样算通过 |
| Evals | prompt/model/provider 谁更好 [1][3] |
| Red Teaming | 应用存在哪些安全漏洞 [5] |
| Code Scanning | 代码改动有没有引入 AI 风险 [6] |
| CI/CD | 怎样把这些门禁接进发布流程 [4] |
| Langfuse integration | 怎样与资产管理层协同 [7] |

**思考题**：为什么 Promptfoo 虽然不以 tracing 为核心，但仍然可能是很多团队最先真正落地的 AI 质量工具？

> [!note] 参考答案
> 因为它直接解决的是发布门禁和回归测试问题，而这是很多团队最容易感知到 ROI 的地方。相比完整 observability 平台，Promptfoo 更快进入现有 CI/CD 和代码工作流，因此更容易先落地。

## 引用

- [1] https://raw.githubusercontent.com/promptfoo/promptfoo/main/README.md — Promptfoo README
- [2] https://www.promptfoo.dev/docs/configuration/guide/ — Promptfoo config guide
- [3] https://www.promptfoo.dev/docs/intro/ — Promptfoo intro docs
- [4] https://www.promptfoo.dev/docs/integrations/ci-cd/ — Promptfoo CI/CD
- [5] https://www.promptfoo.dev/docs/red-team/quickstart/ — Promptfoo red team quickstart
- [6] https://www.promptfoo.dev/docs/code-scanning/ — Promptfoo code scanning
- [7] https://www.promptfoo.dev/docs/integrations/langfuse/ — Promptfoo Langfuse integration

上一篇：[01 产品定位、配置驱动与适用场景](/ai/04-tooling/02/15/)——先理解定位，再看它的能力为什么适合工程团队。

下一篇：[03 质量、社区、价格与商业化边界](/ai/04-tooling/02/17/)——能力之后，再回头判断它是否成熟、贵不贵、企业边界在哪里。
