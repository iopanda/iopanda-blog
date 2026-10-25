---
title: "真实组织案例：RLDatix、Finom、Humach、Cybozu、INTEC"
number: "04.02.25"
chapter: 4
chapterTitle: "Tooling"
section: 2
sectionTitle: "Observability and Evaluation"
group: "04 DeepEval"
created: 2026-09-03 21:20
author: "iopanda"
tags: ["course", "ai-tooling", "observability-and-evaluation", "deepeval", "case-studies"]
sourceId: "3.10.4.2 Observability and Evaluation/04 DeepEval/05 真实组织案例：RLDatix、Finom、Humach、Cybozu、INTEC"
---
# 真实组织案例：RLDatix、Finom、Humach、Cybozu、INTEC

> 本章聚焦公开可验证的组织采用案例。需要先说明一个现实边界：DeepEval 作为开源评测框架，本身公开披露的命名客户故事不如 Langfuse 那样集中；更多组织案例分散在两类资料中：一类是 Confident AI 官方 case study，明确说明其平台建立在 DeepEval 之上；另一类是公司工程博客中对 DeepEval 的真实 PoC 与导入实践。[1][2][3][4][5][6][7][8]

**学习目标**：学完本章，你将能够——

1. 从真实组织案例理解 DeepEval 的产品落点；
2. 区分“DeepEval 开源框架采用”和“DeepEval/Confident AI 生态平台采用”；
3. 从背景、痛点、集成、成本收益、结果五个维度分析案例；
4. 理解哪些组织最容易被 DeepEval 吸引；
5. 明确 DeepEval 在企业中的真实角色往往是“评测引擎”而不是“前台平台”。

> [!note] 说明
> 以下案例全部采用公开可验证资料。RLDatix、Finom、Humach 来自 Confident AI 官方 case study，其中明确提到平台以 DeepEval 为开源评测基础；Cybozu 与 INTEC 则来自公司工程博客，体现 DeepEval 在真实团队中的 PoC 与技术采用实践。[6][7][8][4][5]

## 案例 1：RLDatix

**背景**
Confident AI 官网与独立 case study 明确写到，RLDatix 将 Confident AI 作为全公司统一的 evaluation、observability 与 red teaming 平台；案例中还明确指出 Confident AI “built on DeepEval”。[3][6]

**痛点**
RLDatix 的 AI 场景属于高风险医疗软件：
- 产品覆盖 NHS 与全球医疗机构；
- AI 功能不仅影响体验，还可能影响患者护理与合规流程；
- 多个团队并行做 AI，原先各自维护 eval stack，缺少统一标准。[6]

**集成方法**
RLDatix 选择将 Confident AI/DeepEval 作为平台层基础设施，而不是让每个产品团队各自拼测试体系。工程团队通过 SDK/CI 工作流接入，产品经理和领域专家则通过统一平台参与评测与标注。[6]

**成本收益分析**
- 成本：需要组织级标准化与平台化 adoption；
- 收益：每个 AI 产品不再从零搭建评测流程，安全、信任和质量标准获得统一；
- 产品意义：这说明 DeepEval 的价值在大组织中，不只是写几个测试，而是成为统一质量标准的开源基础层。

**结果**
公开材料明确给出几个结果：
- RLDatix 用它统一 enterprise-wide evals；
- “With Confident AI” time to production 为 3 weeks，相比 “Without Confident AI” 的 3 months；
- 组织把 AI quality、trust、safety 从团队级做法升级为 shared infrastructure。[3][6]

## 案例 2：Finom

**背景**
Confident AI case study 明确写到，Finom 使用该平台来支撑其 agentic financial workflows，而平台给工程师的一面明确是 DeepEval：clean SDK、pytest、CI pipelines。[7]

**痛点**
Finom 的 AI agents 能执行真实金融动作，如发卡、设限额、会计相关操作，因此测试不能停留在 vibe checks；同时，prompt/dataset/eval 的改进过度依赖工程师，导致改进周期非常长。[7]

**集成方法**
Finom 通过 Confident AI + DeepEval，把 product managers、data scientists、engineers 拉进同一条评测链：
- 工程师使用 DeepEval SDK/pytest/CI；
- 产品侧在平台中直接管理 evals、datasets 和多轮仿真。[7]

**成本收益分析**
- 成本：需要建立跨产品、跨角色的一套评测标准；
- 收益：降低工程师在 prompt improvement cycle 上的阻塞；
- 产品意义：这说明 DeepEval 不只是本地测试库，也可以成为 AI product iteration loop 的底层引擎。

**结果**
公开数据很强：
- 改进周期从 10 天缩短到 3 小时；
- 27x faster iteration cycles；
- 预计节省 €250K+；
- 60+ 小时/周被节省。[7]

## 案例 3：Humach

**背景**
Confident AI 官方 case study 写到，Humach 采用其平台来评估企业级 voice AI agents，而平台能力同样建立在 DeepEval / DeepTeam 生态之上。[8]

**痛点**
Humach 需要服务像 McDonald’s、Visa、Amazon 这样的企业客户，其 voice AI 代理面临：
- 多轮对话复杂度；
- 企业级合规与治理要求；
- 评测过程涉及工程、QA、AI Whisperers、PM 等多角色协作。[8]

**集成方法**
Humach 使用该平台统一 annotation、evaluation 和 multi-turn simulations。DeepEval 的价值在这里体现为：工程团队拥有标准化 eval engine，非技术团队也能围绕同一质量标准协作。[8]

**成本收益分析**
- 成本：需要把原本分散的评测数据、CSV、人工流程迁移到统一体系；
- 收益：多轮 voice AI 测试和治理不再依赖 ad-hoc 工具链；
- 产品意义：这说明 DeepEval 生态对语音 AI 与高合规对话代理也成立，而不只是文本问答。

**结果**
公开结果包括：
- speed to market 提升 200%；
- 节省 $100K+ engineering costs；
- 20+ annotators enabled；
- 3+ workflows centralized。[8]

## 案例 4：Cybozu（工程团队 PoC）

**背景**
Zenn 上由作者发表于 `CYBOZU SUMMER BLOG FES '25` 的文章明确写到：其团队在开发生成式 AI 功能过程中，使用 DeepEval 对 LLM-as-a-Judge 进行 PoC，并且 PoC 仍在持续中。[4]

**痛点**
文章明确描述了几个很典型的企业产品问题：
- prompt tuning 很难验证是否真的提升质量；
- 新模型导入有精度退化风险；
- 新 AI 功能上线前需要更稳定的质量判断；
- 团队还希望未来让更多开发团队都能接手 AI 功能开发，而不只是少数专家。[4]

**集成方法**
Cybozu 的做法是把 DeepEval 用作 LLM-as-a-Judge 的评估框架，通过 PoC 重点验证：
- 分数是否可信；
- 指标是否能对质量变化保持敏感；
- 学习成本和开发效率是否可接受。[4]

**成本收益分析**
- 成本：要投入时间做指标设计和信度验证；
- 收益：把 prompt 调优和模型切换从人工反复验证，转成更可系统化的评测流程；
- 产品意义：这类 PoC 非常典型，说明企业在真正大规模推广前，会先验证 DeepEval 是否能成为组织内通用评测基线。

**结果**
Cybozu 文中公开结论是：在 PoC 水平上，DeepEval 在信赖性、妥当性和感度方面没有发现“大问题”，并且在 Python/pytest 工作流下具备较低导入门槛。[4]

## 案例 5：INTEC

**背景**
Qiita 上由 `株式会社インテック` 署名的文章明确介绍了 DeepEval 与 G-Eval，并从企业工程视角整理 LLM evaluation metrics 的意义和用法。[5]

**痛点**
文章聚焦的问题非常典型：
- LLM 输出难以用传统字符串一致性方法评估；
- 需要更贴近语义的评价指标；
- 团队需要找到“更像人类判断”的质量度量方式。[5]

**集成方法**
INTEC 通过 DeepEval 尝试 G-Eval，并梳理了 metrics、score、reason、threshold 等核心概念，说明其团队已将 DeepEval 作为评估方法研究和实践的一部分。[5]

**成本收益分析**
- 成本：需要引入 judge 模型调用成本，并学习新型评估方法；
- 收益：从传统统计指标转向更贴近业务质量的 LLM-based evaluation；
- 产品意义：这说明 DeepEval 对数据/AI 工程团队的吸引力，很大程度来自它能把“评价标准”工程化。

**结果**
公开结果不是商业 ROI，而是方法论结论：INTEC 认为 DeepEval/G-Eval 是值得尝试的 LLM 评测路线，并对其基础架构与适用边界做了系统整理。[5]

## 6. 这些案例共同说明了什么

这 5 个组织覆盖了：
- 医疗/GRC 企业平台；
- 金融科技 agent 产品；
- 企业语音 AI 服务商；
- 企业软件工程团队；
- 数据/AI 技术团队。

共同点非常一致：

1. 它们都不是只在做“提示词小实验”，而是在把 AI 纳入真实产品或企业流程；
2. 它们采用 DeepEval/Confident AI 生态时，首先看重的是“评测能不能真正进入工程流”；
3. DeepEval 最常见的角色不是单独的前台平台，而是 repo、CI、平台标准里的评测引擎；
4. 在高风险、高协作、高变更频率场景下，这类评测引擎的价值会显著放大。

## 7. 总结

| 组织 | DeepEval 扮演的角色 |
|---|---|
| RLDatix | 企业级 AI 质量标准的开源基础层 |
| Finom | 金融 agent 系统的 eval engine |
| Humach | 企业语音 AI 治理与多轮评测底座 |
| Cybozu | 企业 AI 功能评测 PoC 基线 |
| INTEC | 语义评测方法工程化工具 |

**思考题**：为什么 DeepEval 在这些组织里，往往不是“主平台”的名字，却依然很关键？

> [!note] 参考答案
> 因为 DeepEval 最核心的价值不是充当前台工作台，而是把“AI 质量怎样被定义和验证”这件事嵌进工程体系。前台可能是 Confident AI，也可能是企业自己的产品或平台，但底层评测引擎如果不可靠，整个质量流程就很难成立。

## 引用

- [1] https://raw.githubusercontent.com/confident-ai/deepeval/main/README.md — DeepEval README
- [3] https://www.confident-ai.com/pricing — Confident AI pricing
- [4] https://zenn.dev/takamin55/articles/3c7c4e1fedfd4f — Cybozu Summer Blog FES DeepEval PoC article
- [5] https://qiita.com/ayoyo/items/50a64d47802d927142da — INTEC article on DeepEval metrics
- [6] https://www.confident-ai.com/case-study/rldatix — RLDatix case study
- [7] https://www.confident-ai.com/case-study/finom — Finom case study
- [8] https://www.confident-ai.com/case-study/humach — Humach case study

上一篇：[04 与 Promptfoo、Phoenix、Langfuse 的竞品对比](/ai/04-tooling/02/24/)——看清竞品差异后，再看真实组织为什么会采用 DeepEval。

下一篇：[05 Ragas](/ai/04-tooling/02/26/)——下一个产品切到更聚焦 RAG 评测的路线。
