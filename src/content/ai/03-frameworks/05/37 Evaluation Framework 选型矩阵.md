---
title: "Evaluation Framework 选型矩阵"
number: "03.05.37"
chapter: 3
chapterTitle: "Frameworks"
section: 5
sectionTitle: "Evaluation and Observability Frameworks"
group: "3.10.3.5.6 Evaluation Framework 选型矩阵"
created: 2026-09-04 09:20
author: "iopanda"
tags: ["framework", "evaluation", "observability", "architecture", "selection"]
sourceId: "3.10.3.5 Evaluation and Observability Frameworks/3.10.3.5.6 Evaluation Framework 选型矩阵/README"
---
# Evaluation Framework 选型矩阵

> 到这里，[Langfuse](/iopanda-blog/ai/03-frameworks/05/02/)、[Phoenix](/iopanda-blog/ai/03-frameworks/05/09/)、[MLflow](/iopanda-blog/ai/03-frameworks/05/16/)、[promptfoo](/iopanda-blog/ai/03-frameworks/05/23/)、[DeepEval](/iopanda-blog/ai/03-frameworks/05/30/) 五条路线都已经拆开了。现在真正重要的，不再是“它们分别是什么”，而是：**当你的 AI system 开始需要质量证明、问题定位、回归门禁和线上反馈时，到底该选哪一条路线，为什么不是别的那一条。** 这一篇就是把 evaluation framework 从知识点压缩成架构判断。

**学习目标**：学完本章，你将能够——
1. 用系统主矛盾，而不是功能清单，来做 evaluation framework 选型；
2. 区分平台闭环、开放 diagnosis、通用治理、CI testing、code-first eval 这五条路线；
3. 判断一个项目为什么适合某框架，也为什么不适合另一些框架；
4. 为课程助教、RAG、Agent、企业 AI 产品写 evaluation framework 选型卡；
5. 建立一套可审计、可复盘的 eval/observability decision record。

## 1. 选型首先看：你的质量复杂度住在哪里

很多团队选 eval 工具的方式是：
- 谁文档多；
- 谁能出分；
- 谁和某家模型兼容；
- 谁 UI 看起来更完整。

这类选法很容易错，因为 evaluation framework 的差异不在“能不能评”，而在它优先承接哪一种质量复杂度。

| 框架 | 它首先解决什么复杂度 |
|---|---|
| [Langfuse](/iopanda-blog/ai/03-frameworks/05/02/) | traces、prompts、datasets、feedback、evals 的产品闭环复杂度 |
| [Phoenix](/iopanda-blog/ai/03-frameworks/05/09/) | trace-first diagnosis、开放 tracing、experiments 的分析复杂度 |
| [MLflow](/iopanda-blog/ai/03-frameworks/05/16/) | 传统 ML 与 GenAI 共存时的统一治理复杂度 |
| [promptfoo](/iopanda-blog/ai/03-frameworks/05/23/) | regression、red-team、CI gate、security scanning 的测试复杂度 |
| [DeepEval](/iopanda-blog/ai/03-frameworks/05/30/) | code-first metrics、test cases、dataset-driven testing 的开发复杂度 |

所以第一原则不是“谁最强”，而是：
**你的质量系统最贵的复杂度到底是什么。**

## 2. 五条路线的第一性差异

### 2.1 Langfuse：产品化质量闭环路线

如果你的问题是：
- traces 看得见，但 prompt、feedback、datasets、eval 不在一起；
- 团队需要围绕真实线上产品做持续改进；
- 平台要能从坏 trace 回跳到 playground、prompt 和数据集；

那么你缺的不是单点测试，而是 AI product engineering 闭环。

### 2.2 Phoenix：开放 diagnosis workbench 路线

如果你的问题是：
- 需要 OTEL/OpenInference traces；
- 需要围绕 spans 做 diagnosis；
- 想把 traces、evals、experiments 放在开放工作台里；
- 不想太早锁死在产品化平台工作流；

那么你缺的是 observability/eval workbench。

### 2.3 MLflow：统一 AI engineering 治理路线

如果你的问题是：
- 组织里同时有传统 ML 和 GenAI；
- registry、deployment、tracking、tracing、eval 都想统一治理；
- 不希望 ML 和 LLM 世界裂成两套平台；

那么你缺的不是 LLM-native 单点能力，而是统一平台底座。

### 2.4 promptfoo：AI testing / red-team / CI 路线

如果你的问题是：
- prompts、RAG、Agent 每次改动都需要回归；
- 上线前要做安全扫描；
- 评估必须能进 CI/CD；
- 想用 declarative config 做 matrix testing；

那么你缺的是 testing harness，而不是 observability platform。

### 2.5 DeepEval：code-first eval 路线

如果你的问题是：
- 开发者想像写 pytest/vitest 一样写 eval；
- metrics、test cases、datasets 希望直接进入代码；
- 需要 end-to-end、trajectory、component-level eval 共存；

那么你缺的是 eval authoring language。

## 3. 五个框架横向矩阵

| 维度 | Langfuse | Phoenix | MLflow | promptfoo | DeepEval |
|---|---|---|---|---|---|
| 第一主语 | 产品化 LLM engineering 闭环 | 开放 diagnosis workbench | 通用 AI engineering 平台 | AI testing / red-team harness | code-first eval 语言 |
| 最适合谁 | 已产品化的 LLM/Agent/RAG 团队 | 需要 trace-first diagnosis 的团队 | 传统 ML + GenAI 共存的组织 | 需要 CI gate 与 regression 的团队 | 喜欢在代码里写 eval 的团队 |
| 最强价值 | traces + prompts + datasets + feedback 一体化 | OTEL/OpenInference + traces/evals/experiments 组合 | experiments + registry + traces + evals 统一治理 | regression + security + CI/CD | metrics + test cases + runner 直接融入开发流程 |
| 最大优势 | 平台闭环强 | 开放且适合 troubleshooting | 平台边界最广 | 最像上线前测试门禁 | 最像开发者原生测试体验 |
| 最大代价 | 对轻量场景可能偏重 | 产品闭环感不如平台型工具 | 对 LLM-only 小团队可能偏重 | 不是完整 observability 平台 | 不是完整治理/observability 平台 |
| 不适合什么 | 只做一次性离线测试 | 只想要简单 CI regression | 只有单一 LLM 小工具 | 主要问题是线上观测闭环 | 主要问题是平台协作与产品观测 |

## 4. 用场景来选，而不是用框架来选

### 4.1 场景一：课程助教已经上线，要做线上质量闭环

系统主矛盾：
- traces、feedback、prompt、datasets、scores 分裂；
- 团队要持续迭代产品质量。

最自然：[Langfuse](/iopanda-blog/ai/03-frameworks/05/02/)

为什么不是别的：
- 不是 promptfoo：主问题不只是 gate；
- 不是 DeepEval：主问题不只是代码测试；
- 不是 Phoenix：这里更需要产品化闭环；
- 不是 MLflow：如果组织治理还没扩到传统 ML，MLflow 可能偏重。

### 4.2 场景二：Agent / RAG 系统问题很多，需要开放 traces 做根因分析

系统主矛盾：
- 想知道问题到底出在哪个 span；
- 想围绕 traces、experiments、datasets 做 diagnosis。

最自然：[Phoenix](/iopanda-blog/ai/03-frameworks/05/09/)

为什么不是别的：
- 不是 Langfuse：这里更强调开放 diagnosis 而非平台闭环；
- 不是 promptfoo：问题不是单纯 regression gate；
- 不是 DeepEval：问题不是单测 authoring；
- 不是 MLflow：平台治理不是第一主语。

### 4.3 场景三：组织里同时有传统 ML 和 GenAI，要统一 tracking/eval/registry

系统主矛盾：
- 平台分裂；
- 资产分裂；
- 审计和治理分裂。

最自然：[MLflow](/iopanda-blog/ai/03-frameworks/05/16/)

为什么不是别的：
- 不是 Langfuse：它更偏 LLM-native；
- 不是 Phoenix：更偏 diagnosis；
- 不是 promptfoo：更偏 testing harness；
- 不是 DeepEval：更偏 eval layer，而不是平台底座。

### 4.4 场景四：每次改 prompt / model / RAG pipeline 都想自动做回归和红队

系统主矛盾：
- 缺正式 gate；
- 缺 regression；
- 缺 security scanning。

最自然：[promptfoo](/iopanda-blog/ai/03-frameworks/05/23/)

为什么不是别的：
- 不是 Langfuse：平台闭环不等于测试门禁；
- 不是 Phoenix：开放 diagnosis 不等于 CI regression；
- 不是 MLflow：太广；
- 不是 DeepEval：如果你更希望 declarative config + CLI + red-team，promptfoo 更自然。

### 4.5 场景五：开发者要把 LLM 质量要求直接写进代码测试

系统主矛盾：
- 想像 pytest/vitest 一样写 eval；
- 想把 metrics、test cases、dataset 写成代码；
- 想让 PR/本地回归直接使用这些测试。

最自然：[DeepEval](/iopanda-blog/ai/03-frameworks/05/30/)

为什么不是别的：
- 不是 promptfoo：promptfoo 更偏 declarative harness；
- 不是 Langfuse：这里不先需要平台闭环；
- 不是 Phoenix：这里不先需要 diagnosis workbench；
- 不是 MLflow：这里不先需要平台治理。

## 5. 课程助教这个案例到底怎么选

如果把“课程助教 Agent”主线拿来做真实 evaluation 选型，最自然的结论仍然是分阶段的：

| 阶段 | 主问题 | 更自然的框架 |
|---|---|---|
| 第一阶段：先把助教质量要求写成可执行测试 | code-first eval | [DeepEval](/iopanda-blog/ai/03-frameworks/05/30/) |
| 第二阶段：每次改动都要做回归和安全门禁 | CI regression + red team | [promptfoo](/iopanda-blog/ai/03-frameworks/05/23/) |
| 第三阶段：上线后要看 traces、feedback、prompts、datasets 的闭环 | 产品化质量闭环 | [Langfuse](/iopanda-blog/ai/03-frameworks/05/02/) |
| 第四阶段：出现复杂路径问题，需要开放式根因分析 | trace-first diagnosis | [Phoenix](/iopanda-blog/ai/03-frameworks/05/09/) |
| 第五阶段：组织里传统 ML 与 GenAI 都要统一治理 | 平台统一 | [MLflow](/iopanda-blog/ai/03-frameworks/05/16/) |

这张表最重要的含义是：
**evaluation framework selection 也是阶段题，而不是一次性终局题。**

## 6. 四类常见错配

### 错配一：明明缺测试门禁，却先上大平台

结果：
- traces 有了；
- 但 PR 改动仍然没有被稳定拦截。

### 错配二：明明线上问题很多，却只做离线评分

结果：
- 分数看起来有；
- 但定位不到真实失败路径。

### 错配三：明明是组织级治理问题，却还在堆单点工具

结果：
- 局部都能用；
- 但 registry、traces、eval、deployment 永远在不同地方。

### 错配四：明明开发者就想在代码里写测试，却强推纯平台工作流

结果：
- adoption 很低；
- eval 依旧离开发者最近的工作流太远。

## 7. 动手活动：写一张 evaluation-framework-selection-card

> [!example] 动手活动：输出 `evaluation-framework-selection-card.md`
>
> **目标**：为你的项目做一张真正可复盘的 eval/observability 选型卡。
>
> **步骤**：
> 1. 写清楚当前主矛盾：平台闭环、开放 diagnosis、统一治理、CI gate、code-first eval，哪一个最痛；
> 2. 写清楚当前阶段：本地测试、发布前回归、线上观测、组织治理；
> 3. 选一个主框架；
> 4. 再写两个“不选其他框架”的反向理由；
> 5. 写预期交付物：datasets、trace views、eval reports、CI outputs、feedback links；
> 6. 写验证标准：怎么证明这次选型真的降低了复杂度，而不是新增复杂度。
>
> **完成标准**：你的结论不只是“我们用了 X”，而是“因为系统主复杂度在 Y，所以 X 最自然，而 A/B/C 不自然”。

## 8. 总结

| 关键问题 | 一句话 |
|---|---|
| 选 evaluation framework 的第一原则是什么 | 看 quality complexity 住在哪里 |
| 五条路线分别是什么 | 平台闭环 / 开放 diagnosis / 通用治理 / CI testing / code-first eval |
| 为什么不要只看谁能出分 | 因为不同框架在解决完全不同的问题 |
| 真正好的选型长什么样 | 能解释为什么选它，也能解释为什么不选别的 |
| 对课程助教最重要的启发 | eval/observability 选型通常也是阶段题 |

**思考题**：为什么 evaluation framework 的错配，往往不是“评不了”，而是“能评，但结果没有进入正确的工作流”？在你的系统里，当前真正最贵的是产品闭环、开放诊断、统一治理、CI 门禁，还是 code-first 测试？

> [!note] 参考答案
> 因为今天的大多数工具都能让你“做评估”，但它们承接复杂度的层次完全不同。错配时，系统不会立刻报错，而是会在几周后表现为：结果只停留在报表、线上问题无法回流、PR 没有门禁、开发者不用测试框架、或者平台治理持续分裂。真正好的选型，不是找“最全工具”，而是找“最能把当前主复杂度收进正确层次的框架”。

## 引用

- [18] https://github.com/langfuse/langfuse — Langfuse GitHub
- [19] https://github.com/Arize-ai/phoenix — Phoenix GitHub
- [20] https://github.com/mlflow/mlflow — MLflow GitHub
- [21] https://github.com/promptfoo/promptfoo — promptfoo GitHub
- [22] https://github.com/confident-ai/deepeval — DeepEval GitHub
- [31] https://github.com/mlflow/mlflow/blob/master/README.md — MLflow README
- [25] https://github.com/langfuse/langfuse/blob/main/README.md — Langfuse README
- [10] https://github.com/promptfoo/promptfoo/blob/main/README.md — promptfoo README
- [10] https://github.com/confident-ai/deepeval/blob/main/README.md — DeepEval README

上一篇：[03.05 DeepEval](/iopanda-blog/ai/03-frameworks/05/30/)——最后一条 code-first eval 路线立住后，本篇把五条质量路线压成可用的架构判断。

下一篇：回到 [03.05 Evaluation and Observability Frameworks](/iopanda-blog/ai/03-frameworks/05/01/)，从模块入口反向检查阅读顺序与选型逻辑是否顺滑。
