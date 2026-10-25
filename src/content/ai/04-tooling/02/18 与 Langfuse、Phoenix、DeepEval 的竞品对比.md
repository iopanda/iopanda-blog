---
title: "与 Langfuse、Phoenix、DeepEval 的竞品对比"
number: "04.02.18"
chapter: 4
chapterTitle: "Tooling"
section: 2
sectionTitle: "Observability and Evaluation"
group: "03 Promptfoo"
created: 2026-09-03 20:08
author: "iopanda"
tags: ["course", "ai-tooling", "observability-and-evaluation", "promptfoo", "competitive-analysis"]
sourceId: "3.10.4.2 Observability and Evaluation/03 Promptfoo/04 与 Langfuse、Phoenix、DeepEval 的竞品对比"
---
# 与 Langfuse、Phoenix、DeepEval 的竞品对比

> Promptfoo 的竞品比较，关键不是“大家都能做 eval”，而是“谁把哪类工作当成第一主角”。Promptfoo 把测试、红队、CI 门禁放在中心；Langfuse 更像统一质量工作台；Phoenix 更像 tracing/diagnostics 平台；DeepEval 更像 Python 内嵌评测库。[1][2][3][4][5]

**学习目标**：学完本章，你将能够——

1. 把 Promptfoo 放进更准确的竞品坐标系；
2. 理解它与 Langfuse、Phoenix、DeepEval 的第一性差异；
3. 根据团队工作方式选择更合适的路线；
4. 避免把“有些功能重叠”误解成“产品完全同类”；
5. 做出更可信的选型建议。

## 1. 总览对比

| 维度 | Promptfoo | Langfuse | Phoenix | DeepEval |
|---|---|---|---|---|
| 第一主角 | eval + red team + CI [1][2] | 统一工作台 | tracing / diagnostics | Python 代码内评测 |
| 核心问题 | 怎样把 AI 测试和安全门禁接进开发流程 | 怎样把 trace、prompt、dataset、eval 串起来 | 怎样看清复杂链路怎么坏的 | 怎样在代码里定义和运行评测 |
| 最适合谁 | 发布门禁导向团队 | 多角色协作团队 | 工程化诊断导向团队 | Python 工程师主导团队 |
| 长处 | 声明式配置、红队、CI/CD、code scanning | 资产与工作台一体化 | tracing + OpenInference 生态 | 代码内测试心智直给 |
| 短板 | 不是完整 observability 平台 | 对纯门禁诉求可能偏重 | 对轻量测试门禁不如 Promptfoo 直接 | 非平台化、协作层较弱 |

## 2. Promptfoo vs Langfuse

这是一组“测试门禁工具”与“统一工作台”的对比。

- Promptfoo 擅长 eval、assertions、red team、CI/CD。[1][2][5]
- Langfuse 擅长 traces、prompt management、datasets、playground、workspace 协作。

所以：

- 如果团队先要上线门禁，Promptfoo 更快；
- 如果团队先要建立跨角色质量工作台，Langfuse 更完整。

## 3. Promptfoo vs Phoenix

这是一组“发布前测试/安全”与“运行时诊断”的对比。

- Phoenix 强 tracing、spans、OpenTelemetry/OpenInference；
- Promptfoo 强声明式测试、红队、本地扫描、PR 门禁。

如果问题是“系统上线前要不要放行”，Promptfoo 更直接；如果问题是“系统线上为什么坏”，Phoenix 更强。

## 4. Promptfoo vs DeepEval

这是一组“配置驱动工具”与“代码驱动库”的对比。

- DeepEval 更适合 Python 工程师在代码里写评测；
- Promptfoo 更适合通过 YAML、CLI 和 CI/CD 把质量工程推广给更广泛团队。

换句话说，DeepEval 更像开发者库，Promptfoo 更像工程工作流工具。

## 5. Promptfoo 的真正竞争优势

Promptfoo 最强的地方，不是它能做评测，而是：

1. 它把测试和安全都纳入同一工具链；
2. 它非常适合 PR 和 CI/CD 门禁；
3. 它对模型比较、断言、红队都很直接；
4. 它既能本地跑，又有企业版升级路径。[1][4][5][6]

## 6. 谁不该先选 Promptfoo

以下情况不一定先选 Promptfoo：

- 团队首要问题是 tracing / observability；
- 团队更需要完整 prompt/dataset/workspace 平台；
- 团队只想在 Python 代码里轻量写评测；
- 团队目前没有把测试接进 CI 的意愿。

## 7. 总结

| 关键问题 | 一句话 |
|---|---|
| 和 Langfuse 的差别 | 一个更像门禁工具，一个更像统一工作台 |
| 和 Phoenix 的差别 | 一个更偏发布前测试，一个更偏运行时诊断 |
| 和 DeepEval 的差别 | 一个偏配置驱动，一个偏代码驱动 |
| Promptfoo 的优势 | eval + red team + CI/CD + code scanning 一体化 |

**思考题**：为什么对 Promptfoo 来说，“能直接进入 PR 和 CI/CD”比“有更花哨的工作台”更重要？

> [!note] 参考答案
> 因为 Promptfoo 的主价值是改变发布流程，而不是只提供信息展示。真正能阻止坏改动进入生产的，不是漂亮页面，而是把测试和安全检查嵌进工程门禁本身。

## 引用

- [1] https://raw.githubusercontent.com/promptfoo/promptfoo/main/README.md — Promptfoo README
- [2] https://www.promptfoo.dev/docs/intro/ — Promptfoo intro docs
- [3] https://www.promptfoo.dev/docs/integrations/ci-cd/ — Promptfoo CI/CD
- [4] https://www.promptfoo.dev/pricing/ — Promptfoo pricing
- [5] https://www.promptfoo.dev/docs/red-team/quickstart/ — Promptfoo red team quickstart

上一篇：[03 质量、社区、价格与商业化边界](/iopanda-blog/ai/04-tooling/02/17/)——成熟度清楚之后，再把它放回竞品版图里。

下一篇：[05 真实组织案例：OpenAI、Anthropic与若干公开匿名企业客户](/iopanda-blog/ai/04-tooling/02/19/)——最后看真实组织为什么会采用 Promptfoo。
