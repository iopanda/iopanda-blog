---
title: "Metrics、Traceability、Datasets 与 CI-CD"
number: "04.02.22"
chapter: 4
chapterTitle: "Tooling"
section: 2
sectionTitle: "Observability and Evaluation"
group: "04 DeepEval"
created: 2026-09-03 20:18
author: "iopanda"
tags: ["course", "ai-tooling", "observability-and-evaluation", "deepeval", "capabilities"]
sourceId: "3.10.4.2 Observability and Evaluation/04 DeepEval/02 Metrics、Traceability、Datasets 与 CI-CD"
---
# Metrics、Traceability、Datasets 与 CI-CD

> DeepEval 的能力虽然不断扩展，但组织方式仍然非常工程化：metrics 是尺子，test case 是样本，traceability 让评测不只看黑盒结果，datasets 让样本可复用，`deepeval test run` 则把一切拉进测试和 CI 流程。[1][2][3][4][5] 这是一套很典型的“评测就是测试工程”逻辑。

**学习目标**：学完本章，你将能够——

1. 看懂 DeepEval 的能力是怎样围绕测试闭环组织起来的；
2. 区分 metrics、test cases、traceability、datasets、CI 各自的角色；
3. 理解为什么 DeepEval 能同时支持 black-box 和 trajectory eval；
4. 判断哪些能力最先带来 ROI；
5. 避免把 DeepEval 用成“只跑一个 metric 的脚本”。

## 1. Metrics：DeepEval 的第一语言

Metrics intro 文档明确写到：metrics acts as the ruler，而 DeepEval 提供 50+ ready-to-use metrics。[3]

这意味着 DeepEval 的核心不是“有没有 dashboard”，而是“你的质量标准有没有被写出来”。

它覆盖的面非常广：
- G-Eval、DAG 这类通用 judge 型指标；
- agentic metrics；
- RAG metrics；
- multi-turn metrics；
- MCP metrics；
- multimodal metrics；
- hallucination、bias、toxicity、JSON correctness 等指标。[1][3]

## 2. Test case：把 AI 质量变成输入/输出样本

Getting started 用 `LLMTestCase` 展示了最经典的用法：
- input
- actual_output
- expected_output
- retrieval_context
- metrics
- assert_test(...)

这套模型的价值在于，它让 AI 质量变得像普通测试数据一样可管理。[2]

## 3. Traceability：不只评结果，也评过程

README 和各框架集成页现在非常强调 traceability：
- OpenAI integration 可为调用生成 LLM span；
- OpenAI Agents integration 可对完整 trace 和 component spans 分别评估；
- LangChain / LangGraph / CrewAI 集成都把 runs、nodes、tools、retrievers 变成 spans。[1][9][10][11][13][14]

这说明 DeepEval 不再只是“最终输出打分器”，而是在进入 agent era 后补齐了过程级评测能力。

## 4. Datasets：把 goldens 做成长期资产

DeepEval 在集成示例里反复出现 `EvaluationDataset`、`Golden`、`evals_iterator()` 这些对象。[9][10][13][14]

这很关键，因为它让团队不必每次临时写几条样本，而是能把：
- 线上问题；
- 人工精选样本；
- 任务级 goldens；
- agent trajectory 期望
逐步沉淀成长期回归集。

## 5. CI/CD：为什么 `deepeval test run` 是主舞台

Getting started 和各集成页都把 `deepeval test run` 当主入口，并明确支持在 terminal 或 CI pipeline 中以 pass/fail 形式运行。[2][9][10][13][14]

这意味着 DeepEval 最重要的价值之一，不是“让你知道分数”，而是“让失败的 metric 真正阻止坏改动进入生产”。

## 6. Red Teaming：为什么它是边界，不是全部

Metrics intro 文档明确提到：如果要 full-blown LLM red teaming orchestration framework，应看 DeepTeam，它是 deepeval 但 for red teaming specifically。[3][6]

这点很重要。DeepEval 的产品边界比较成熟：
- 标准 eval 在 DeepEval；
- red teaming 深入编排在 DeepTeam；
- 企业级 observability/monitoring/workspace 在 Confident AI。[1][6][7]

## 7. 哪些能力最先见效

通常顺序是：
1. 先用 test cases + metrics 建最小回归集；
2. 再把 `deepeval test run` 接进 CI；
3. 再根据框架集成补 traceability；
4. 再把 datasets 和 goldens 长期化；
5. 最后再考虑 DeepTeam / Confident AI 等扩展层。

## 8. 总结

| 能力 | 它回答的问题 |
|---|---|
| Metrics | 怎么衡量质量 [1][3] |
| Test cases | 评测样本怎样结构化 [2] |
| Traceability | 结果差是哪里导致的 [1][9][10] |
| Datasets | 样本怎样长期复用 [9][13] |
| CI/CD | 怎样把坏改动挡在发布前 [2][4] |
| DeepTeam/Confident AI | 当需求从标准 eval 扩展到红队/平台时怎么办 [1][6][7] |

**思考题**：为什么很多团队明明已经有 metrics，却仍然很难形成稳定的 AI 质量闭环？

> [!note] 参考答案
> 因为 metrics 本身只是尺子，不自动带来流程。若没有 test cases、datasets、traceability 和 CI 门禁，团队仍会停留在“偶尔跑一下分数”的状态，而不是形成持续回归和发布控制。

## 引用

- [1] https://raw.githubusercontent.com/confident-ai/deepeval/main/README.md — DeepEval README
- [2] https://deepeval.com/docs/getting-started — DeepEval getting started
- [3] https://deepeval.com/docs/metrics-introduction — DeepEval metrics intro
- [4] https://deepeval.com/docs/vibe-coder-quickstart — DeepEval vibe coder quickstart
- [5] https://www.confident-ai.com/pricing — Confident AI pricing
- [6] https://deepeval.com/docs/red-teaming-introduction — DeepEval red teaming intro
- [9] https://www.deepeval.com/integrations/frameworks/openai-agents — DeepEval OpenAI Agents integration
- [10] https://www.deepeval.com/integrations/frameworks/openai — DeepEval OpenAI integration
- [13] https://www.deepeval.com/integrations/frameworks/langchain — DeepEval LangChain integration
- [14] https://www.deepeval.com/integrations/frameworks/langgraph — DeepEval LangGraph integration

上一篇：[01 产品定位、pytest 心智与适用场景](/ai/04-tooling/02/21/)——先理解定位，再看能力如何形成工程闭环。

下一篇：[03 质量、社区、价格与商业化边界](/ai/04-tooling/02/23/)——能力之后，再回头判断它是否成熟、值不值得长期采用。
