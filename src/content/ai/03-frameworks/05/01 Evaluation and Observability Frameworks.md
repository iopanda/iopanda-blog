---
title: "Evaluation and Observability Frameworks"
number: "03.05.01"
chapter: 3
chapterTitle: "Frameworks"
section: 5
sectionTitle: "Evaluation and Observability Frameworks"
group: ""
created: 2026-09-04 06:25
author: "iopanda"
tags: ["ai", "frameworks", "evaluation", "observability", "learning-path"]
sourceId: "3.10.3.5 Evaluation and Observability Frameworks/README"
---
# Evaluation and Observability Frameworks

> `03.04 Inference and Serving Frameworks` 已经把模型如何被交付成服务讲清楚了；接下来的 `03.05 Evaluation and Observability Frameworks` 要回答的是另一类更容易被低估的问题：**当你的 Agent、RAG、fine-tuned model、serving system 已经跑起来以后，你拿什么框架去验证它、追踪它、比较它、监控它，并把质量问题变成可回归的工程对象？** 这一章不把 eval 看成几道样题，也不把 observability 看成“看个日志”，而是把它视为 traces、datasets、judges、CI regression、online monitoring、feedback loops 和 risk evidence 的组合系统。[18][19][20][21][22]

**学习目标**：完成本模块后，你将能够——
1. 区分五条主流 evaluation / observability framework 路线：AI 工程观测平台、open-source observability/eval、通用 AI experiment platform、CI-style eval testing、code-first LLM eval framework；
2. 解释为什么同样是“评估 LLM 系统”，Langfuse、Phoenix、MLflow、promptfoo、DeepEval 的设计中心完全不同；
3. 用 trace、dataset、judge、CI、online monitoring、组织协作方式来做 evaluation framework 选型；
4. 判断什么时候你需要的是 tracing/observability platform，什么时候更需要 regression harness 或 code-first eval 库；
5. 为一个课程助教、RAG 系统或企业 AI 产品写 evaluation framework 选型卡。

## 1. 为什么单开这一章

- 很多团队把 eval 理解成“跑几个 benchmark”，把 observability 理解成“看一下调用日志”；
- 但一旦进入真实工程，就会出现：
  - traces、spans、tool calls 和 retrieval 链路怎么被追踪；
  - datasets、annotations、judge scores 和人工反馈怎么保存；
  - prompt / model / agent 改动如何做回归；
  - 线上问题如何和离线 eval、线上指标连起来；
  - 哪些是测试框架问题，哪些是 tracing 平台问题，哪些又是 experiment 管理问题。
- 所以 evaluation framework 的真正价值，不在“能打个分”，而在：**把质量、风险和回归证据收进一种稳定语言。**

## 2. 2026-09 我建议这一模块先聚焦的 top 5

> [!note] 现实边界
> 这里的 top 5 不是“评估生态唯一正确榜单”，而是按 2026-09 的工程代表性和教学价值筛出来的五条路线：AI engineering observability、open-source eval observability、通用 AI experiment 平台、CI-style eval testing、code-first LLM eval。[18][19][20][21][22]

| 框架 | 一句话定位 | 设计中心 | 更像什么 | 更适合谁 |
|---|---|---|---|---|
| [Langfuse](/ai/03-frameworks/05/02/) | 面向 LLM / Agent / RAG 的开源 AI engineering platform | traces + evals + prompt + datasets + feedback | AI 工程观测平台 | 想把 tracing、eval 和产品反馈放进同一平台的团队 |
| [Phoenix](/ai/03-frameworks/05/09/) | 开源 AI observability & evaluation | OTEL-first traces + dataset eval + diagnosis | observability/eval 工作台 | 需要开放 tracing、诊断和 eval 组合的团队 |
| [MLflow](/ai/03-frameworks/05/16/) | 通用 AI engineering platform | experiments + traces + evals + governance | 通用 AI 实验与追踪平台 | 已有 MLOps/MLflow 体系，想把 GenAI 纳入同一治理面的团队 |
| [promptfoo](/ai/03-frameworks/05/23/) | prompt / agent / RAG 的 CI-style 测试与红队框架 | declarative eval config + regression + security testing | AI 测试框架 | 想把 eval 纳入 CI/CD、回归和安全扫描的人 |
| [DeepEval](/ai/03-frameworks/05/30/) | code-first LLM evaluation framework | pytest-like eval + metrics + test authoring | 代码化 eval 库 | 想在 Python/代码环境里直接写 LLM 测试和指标的人 |

## 3. 为什么先不把 Helicone / LangWatch 放进这一组主角

- `Helicone` 很值得讲，尤其在 proxy-style observability 上有代表性，但第一轮只留 5 个时，`Langfuse` 和 `Phoenix` 的路线辨识度更高；[23]
- `LangWatch` 也值得讲，尤其更偏 agent testing，但在首批教学路线里，`promptfoo` 和 `DeepEval` 的 CI/test authoring 轮廓更清楚；[24]
- 这一章先讲“你用什么语言组织 evaluation complexity”，不先追求把所有平台列全。

## 4. 这一模块建议怎么读

1. 先看 [03.05 Langfuse](/ai/03-frameworks/05/02/)：先把 AI engineering observability 平台的核心心智钉牢；
2. 再看 [03.05 Phoenix](/ai/03-frameworks/05/09/)：理解 open-source tracing/eval workbench 路线；
3. 再看 [03.05 promptfoo](/ai/03-frameworks/05/23/)：理解 regression / red-team / CI eval 为什么是独立路线；
4. 再看 [03.05 DeepEval](/ai/03-frameworks/05/30/)：理解 code-first eval authoring 路线；
5. 最后看 [03.05 MLflow](/ai/03-frameworks/05/16/)：理解 eval/trace 如何进入更广义 AI engineering platform。

## 4.1 按读者身份的推荐阅读路径

| 你是谁 | 建议先读什么 | 为什么 |
|---|---|---|
| 做线上 LLM / Agent 产品的人 | [Langfuse](/ai/03-frameworks/05/02/) → [Evaluation Framework 选型矩阵](/ai/03-frameworks/05/37/) | 先把产品化质量闭环的主语钉牢，再做判断 |
| 做 traces / diagnosis / root cause analysis 的人 | [Phoenix](/ai/03-frameworks/05/09/) → [Evaluation Framework 选型矩阵](/ai/03-frameworks/05/37/) | 先理解开放 diagnosis workbench，再判断是否需要更强平台闭环 |
| 已有 MLOps / MLflow 体系的人 | [MLflow](/ai/03-frameworks/05/16/) | 先看统一 AI governance 是否就是你的主问题 |
| 想把 eval 接进 PR / CI / release gate 的人 | [promptfoo](/ai/03-frameworks/05/23/) | 先把 testing / regression / red-team 路线看清楚 |
| 喜欢在 pytest/vitest 里直接写评估的开发者 | [DeepEval](/ai/03-frameworks/05/30/) | 先把 code-first eval 语言看清楚 |

## 4.2 按系统主矛盾的速查表

| 你的系统最先会死在哪 | 优先想到 |
|---|---|
| traces、prompts、datasets、feedback、evals 分裂 | [Langfuse](/ai/03-frameworks/05/02/) |
| span 级别根因分析、开放 traces、实验分析能力不足 | [Phoenix](/ai/03-frameworks/05/09/) |
| 传统 ML 与 GenAI 平台治理分裂 | [MLflow](/ai/03-frameworks/05/16/) |
| 每次改动缺 regression、red-team、CI gate | [promptfoo](/ai/03-frameworks/05/23/) |
| 开发者缺 code-first 的 metrics/test cases/dataset 测试语言 | [DeepEval](/ai/03-frameworks/05/30/) |

## 4.3 这章最容易读偏的三个误区

- **误区一：把 evaluation framework 简化成“谁能打分”。** 真正差异在结果进入哪种工作流；
- **误区二：把 observability、testing、governance 混成一回事。** 它们经常是不同层次的质量系统；
- **误区三：只看 LLM-as-a-judge。** judge 只是技术手段，不等于你的团队已经有可持续质量体系。

## 4.4 如果你时间不够，只读哪三篇

如果你现在不是在系统建课，而是在真实项目里要尽快做判断，我建议优先读这三篇：

1. [03.05 Langfuse](/ai/03-frameworks/05/02/)
   - 因为它先把产品化质量闭环的主语钉牢；
2. [03.05 promptfoo](/ai/03-frameworks/05/23/)
   - 因为它告诉你“评估平台”和“测试门禁”不是一回事；
3. [03.05 Evaluation Framework 选型矩阵](/ai/03-frameworks/05/37/)
   - 因为最后真正落地时，你要做的是架构判断，而不是框架背诵。

如果读完这三篇你仍然觉得：
- traces 和根因分析最痛，再回去看 [03.05 Phoenix](/ai/03-frameworks/05/09/)；
- 组织级 AI 平台治理最痛，再回去看 [03.05 MLflow](/ai/03-frameworks/05/16/)；
- 开发者最需要在代码里直接写测试，再回去看 [03.05 DeepEval](/ai/03-frameworks/05/30/)。

## 5. 本模块的推荐交付物

| 交付物 | 说明 | 验收标准 |
|---|---|---|
| eval-plan-card.md | 某个项目的评估计划卡 | 能回答“评什么、怎么评、谁来判、在哪评” |
| quality-regression-card.md | 回归与发布门禁卡 | 能回答“哪类退化会阻止上线” |
| observability-loop-card.md | traces / feedback / datasets 闭环卡 | 能回答“线上坏结果如何回流成改进资产” |
| evaluation-framework-selection-card.md | 评估框架选型卡 | 能解释“为什么选 A，不选 B” |

## 5.1 我更推荐的最小闭环产物

如果你不想一上来写很多文档，最小也要交出下面三样东西：

| 最小交付物 | 为什么不能省 |
|---|---|
| `golden-dataset-card.md` | 没有它，团队很难知道现在到底在拿什么样本衡量质量 |
| `quality-regression-card.md` | 没有它，每次改动都只能靠感觉判断有没有退化 |
| `evaluation-framework-selection-card.md` | 没有它，工具选择就只能退化成“谁看起来功能更多” |

这三个东西加起来，才构成一个最小可审计 eval 方案：
- 用什么样本；
- 怎样判定好坏；
- 为什么是这套工具链，而不是别的。

## 5.2 这章学完之后，你应该真的会什么

学完这一章，理想状态不是“我知道 5 个 eval 框架名字”，而是你真的能完成下面三件事：

1. 看到一个项目，就能先判断它最痛的是平台闭环、开放 diagnosis、统一治理、CI gate，还是 code-first eval；
2. 能写出一页纸说明：为什么这里选 Langfuse / Phoenix / MLflow / promptfoo / DeepEval；
3. 能在设计评审里把“质量系统”讲成一个可交付架构，而不是一句“我们也做评估”。

## 6. 本模块笔记导航

1. [03.05 Langfuse](/ai/03-frameworks/05/02/)
2. [03.05 Phoenix](/ai/03-frameworks/05/09/)
3. [03.05 MLflow](/ai/03-frameworks/05/16/)
4. [03.05 promptfoo](/ai/03-frameworks/05/23/)
5. [03.05 DeepEval](/ai/03-frameworks/05/30/)
6. [03.05 Evaluation Framework 选型矩阵](/ai/03-frameworks/05/37/)

## 7. 总结

| 关键问题 | 一句话 |
|---|---|
| 这一模块讲什么 | 不是“怎么打个分”，而是“如何组织 eval + observability system” |
| top 5 是谁 | Langfuse / Phoenix / MLflow / promptfoo / DeepEval |
| 五条路线分别代表什么 | 平台观测 / 开放工作台 / 通用 AI 平台 / CI 测试 / code-first eval |
| 学习重点 | 学会判断 quality complexity 的主矛盾，而不是只看谁能出分数 |

## 引用

- [18] https://github.com/langfuse/langfuse — Langfuse GitHub
- [19] https://github.com/Arize-ai/phoenix — Phoenix GitHub
- [20] https://github.com/mlflow/mlflow — MLflow GitHub
- [21] https://github.com/promptfoo/promptfoo — promptfoo GitHub
- [22] https://github.com/confident-ai/deepeval — DeepEval GitHub
- [23] https://github.com/helicone/helicone — Helicone GitHub
- [24] https://github.com/langwatch/langwatch — LangWatch GitHub

上一篇：[03.04 Inference and Serving Frameworks](/ai/03-frameworks/04/01/)——推理系统已经讲完；下一模块开始处理“这些系统如何被验证、被追踪、被证明可用”。

下一篇：[03.05 Langfuse](/ai/03-frameworks/05/02/)——先从最典型的 AI engineering observability 平台路线开始。
