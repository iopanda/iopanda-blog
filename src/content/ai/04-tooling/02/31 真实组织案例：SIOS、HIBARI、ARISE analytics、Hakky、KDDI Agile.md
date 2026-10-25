---
title: "真实组织案例：SIOS、HIBARI、ARISE analytics、Hakky、KDDI Agile"
number: "04.02.31"
chapter: 4
chapterTitle: "Tooling"
section: 2
sectionTitle: "Observability and Evaluation"
group: "05 Ragas"
created: 2026-09-03 20:35
author: "iopanda"
tags: ["course", "ai-tooling", "observability-and-evaluation", "ragas", "case-studies"]
sourceId: "3.10.4.2 Observability and Evaluation/05 Ragas/05 真实组织案例：SIOS、HIBARI、ARISE analytics、Hakky、KDDI Agile"
---
# 真实组织案例：SIOS、HIBARI、ARISE analytics、Hakky、KDDI Agile

> 这一章我按“公开可验证的组织采用案例”来写，而不再用 SDK/框架集成充当案例。Ragas 目前没有像 Langfuse 那样清晰的 customers 页面，但公开网上已经能查到多家组织/公司写过自己在真实工作中如何引入或评估 Ragas。这些材料更接近“工程落地实录”，对课程读者反而很有参考价值。[6][7][8][9][10]

**学习目标**：学完本章，你将能够——

1. 从真实组织案例理解 Ragas 的落点；
2. 识别哪些组织最容易被 Ragas 吸引；
3. 从背景、痛点、集成、成本收益、结果五个维度分析案例；
4. 理解 Ragas 为什么常在知识问答/RAG 项目里被采用；
5. 避免把“集成支持”误当成“真实采用”。

> [!note] 说明
> 以下案例以公开工程博客、技术文章和组织内容为依据。它们不一定都是标准化 vendor case study，但都明确体现了组织/公司在真实项目、PoC 或业务研发中使用或评估 Ragas。

## 案例 1：SIOS Technology

**背景**
SIOS Tech Lab 由 SIOS Technology, Inc. 发布了《RAG評価フレームワーク Ragasを必要最低限で使ってみる》，明确以 Ragas 作为 RAG 评估框架进行介绍和实践。[6]

**痛点**
文章一开始就点出典型问题：RAG 做出来了，但系统精度不知道好不好；想用 Ragas，又觉得资料复杂、上手门槛高。[6]

**集成方法**
SIOS 选择用最小化方式接入 Ragas，并结合 Azure OpenAI Service 进行评估，重点是先理解输入结构、指标含义与结果解读。[6]

**成本收益分析**
- 成本：需要准备评估输入和调用模型；
- 收益：团队可以从“完全凭感觉”转向最小可用的量化评估；
- 产品意义：说明 Ragas 很适合作为 RAG 团队的第一版质量基线工具。

**结果**
SIOS 的公开实践表明，Ragas 被用作“让 RAG 评估开始发生”的起步工具，而不是停留在概念层。[6]

## 案例 2：株式会社 HIBARI

**背景**
HIBARI 的工程文章明确写到，作者当前正在开发 RAG 系统，并在项目中实际使用过 Ragas，因此才会进一步怀疑“这个值真的可信吗”，并把 Ragas 与 LLM-as-a-judge 做对比验证。[7]

**痛点**
当团队已经在做 RAG 系统时，真正的问题不再是“要不要评估”，而是“Ragas 给出的分数够不够可信，是否能支撑实务决策”。[7]

**集成方法**
HIBARI 基于自造的多类别评估数据，把 Faithfulness、Answer Relevancy、Context Precision、Answer Correctness 等指标与另一套 judge 方法对照比较。[7]

**成本收益分析**
- 成本：需要构建更系统的对比数据集，且会遇到实现与验证成本；
- 收益：不仅能用 Ragas 打分，还能倒逼团队理解指标的可信边界；
- 产品意义：这说明更成熟的团队不会只满足于“有分数”，而会进一步验证分数是否能用于业务判断。

**结果**
HIBARI 的案例说明，Ragas 已经进入真实项目评估阶段，而不仅是学习用 demo；同时也提示读者：采用之后，下一步是验证指标解释力。[7]

## 案例 3：ARISE analytics

**背景**
ARISE analytics 的技术博客明确写到，作者在负责面向客户支持的 AI agent 开发，尤其负责 RAG 部分精度提升，并在项目中导入 Ragas 的经验基础上写下这篇文章。[8]

**痛点**
文章强调，RAG 即使引入了检索，也不代表天然高质量；检索到的信息若不合适，或模型处理不当，仍会导致不可靠回答，从而在实务上带来信任、法律和伦理风险。[8]

**集成方法**
ARISE analytics 将 Ragas 用于面向客服场景的 RAG 质量度量，并围绕 retrieval 与 generation 两大评价轴展开说明。[8]

**成本收益分析**
- 成本：需要把评估流程嵌入业务 agent/RAG 项目；
- 收益：能把“客服回答靠不靠谱”从主观感受转向更客观的技术评价；
- 产品意义：这很符合企业知识助手和客服 AI 场景对可解释质量的需求。

**结果**
这是一个很强的组织级信号：Ragas 已经被用于真实面向业务的客服 AI/RAG 优化工作流中。[8]

## 案例 4：Hakky

**背景**
Hakky Handbook 发布了《RAGの性能評価ツール Ragas入門 (実装例つき)》，并把它放在 RAG 构建/评价体系化内容中。[9]

**痛点**
文章明确指出：RAG 系统性能难以准确评估，需要专门工具把不同指标量化出来。[9]

**集成方法**
Hakky 用 Ragas 解释 Question、Context、Answer、Ground Truth 等输入结构，并系统梳理 retrieval/generation 两侧的指标与实现方式。[9]

**成本收益分析**
- 成本：需要建设标准化输入与评估数据；
- 收益：帮助团队把 RAG 精度改进纳入更系统的方法框架；
- 产品意义：说明咨询/交付型 AI 公司会把 Ragas 当成方法论工具，而不只是某个小库。

**结果**
Hakky 的采用信号说明，Ragas 已经进入“面向客户项目的方法库”语境，而不只是个人实验工具。[9]

## 案例 5：KDDI Agile Development Center

**背景**
Qiita 上由 KDDIアジャイル開発センター株式会社 署名的文章明确以 AWS Bedrock + Ragas 为主题，讨论如何让 RAG 从 PoC 走向本番运用。[10]

**痛点**
文章指出，PoC 之后最大的难题之一就是：RAG 生成结果是否真正达到用户需要的质量，且如何持续验证这种质量。[10]

**集成方法**
KDDI Agile 结合 Amazon Bedrock、LangChain 与 Ragas，构建实际的 RAG 评估管线，并强调 metrics-driven development、测试数据生成与运用中监视等能力。[10]

**成本收益分析**
- 成本：需要同时维护 RAG pipeline、评估数据与模型调用；
- 收益：让 RAG 质量验证成为从 PoC 走向生产的正式步骤；
- 产品意义：说明 Ragas 很适合帮助团队跨过“演示能跑”到“生产可信”的门槛。

**结果**
KDDI Agile 的公开实践说明，Ragas 已经被用于企业级技术团队探索从 PoC 迈向生产的质量方法链条。[10]

## 6. 这些案例共同说明了什么

这 5 个组织虽然类型不同：
- 产品研发公司；
- 咨询/数据服务公司；
- 企业技术团队；
- 工程媒体与知识平台；
- 正在做客服/知识型 AI 的组织。

但共同点很一致：

1. 它们都在做知识问答/RAG/客服型应用；
2. 它们都在从“能跑”迈向“可量化评估”；
3. 它们都把 Ragas 当作解决 retrieval/generation 质量判断的专项工具；
4. 它们采用后的下一个问题，往往都是“如何让评估更可靠、更持续”。

## 7. 总结

| 组织 | Ragas 扮演的角色 |
|---|---|
| SIOS Technology | 最小可用 RAG 评测起点 |
| 株式会社 HIBARI | 与 LLM-as-a-judge 对照验证的专项评测层 |
| ARISE analytics | 客服/业务 RAG 质量度量层 |
| Hakky | 面向客户项目的方法论工具 |
| KDDI Agile | 从 PoC 迈向生产的 RAG 质量验证层 |

**思考题**：为什么采用 Ragas 的组织，大多不是把它当“平台本身”，而是当“RAG 质量专项层”？

> [!note] 参考答案
> 因为它最核心的价值不是包办整个 LLMOps 平台，而是把 RAG 的关键质量问题拆开评估。很多团队会把它嵌入更大的工程、平台或业务体系中，专门负责 retrieval/generation 这条质量链。

## 引用

- [6] https://tech-lab.sios.jp/archives/41949 — SIOS Technology: minimal Ragas usage article
- [7] https://zenn.dev/hibari_inc/articles/rag_evaluation_article — 株式会社 HIBARI: RAGAS vs LLM-as-a-judge
- [8] https://www.ariseanalytics.com/tech-info/20260313 — ARISE analytics: Ragas intro from project experience
- [9] https://book.st-hakky.com/data-science/ragas-intro — Hakky Handbook: Ragas intro with implementation
- [10] https://qiita.com/minorun365/items/2f4e238f8bbc6e393ba5 — KDDI Agile Development Center: Ragas with AWS Bedrock

上一篇：[04 与 DeepEval、Langfuse、Phoenix 的竞品对比](/iopanda-blog/ai/04-tooling/02/30/)——看清竞品差异后，再看真实组织为什么会采用 Ragas。

下一篇：本产品是本组最后一项；后续可回到 [04.02 Observability and Evaluation](/iopanda-blog/ai/04-tooling/02/01/) 统览整组工具。
