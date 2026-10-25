---
title: "Observability and Evaluation"
number: "04.02.01"
chapter: 4
chapterTitle: "Tooling"
section: 2
sectionTitle: "Observability and Evaluation"
group: ""
created: 2026-09-03 18:29
author: "iopanda"
tags: ["course", "ai-tooling", "observability-evaluation"]
sourceId: "3.10.4.2 Observability and Evaluation/README"
---
# Observability and Evaluation

> `02.07 Evaluation and Observability` 已经把 Agent 的评测方法、轨迹指标与 tracing 思维讲清楚了；但真正落地时，你往往不会只靠手写 JSONL 日志。`04.02` 要讲的是：**有哪些开源工具，能把 tracing、dataset、在线评估、回归测试、人工标注与看板做成系统能力？** 这一章的重点不是“哪个平台最全”，而是理解不同工具把“观测”和“评测”分别当成什么问题来解决。

**学习目标**：完成本模块后，你将能够——

1. 区分 tracing、observability、evaluation、dataset、judge、regression 各自解决的问题；
2. 解释 Langfuse、Phoenix、Promptfoo、DeepEval、Ragas 的设计中心差异；
3. 知道什么时候你需要在线 tracing，什么时候更需要离线评测与 CI 门禁；
4. 为课程助教 Agent 设计一条从 trace 到 eval report 的质量闭环；
5. 避免把“好看的 dashboard”误当成“真的评测体系”。

## 1. 为什么这一组工具要单独讲

- LLM 系统最常见的错觉是：看见几次正确回答，就以为系统稳定；
- 没有观测，你不知道失败发生在哪一步；没有评测，你不知道这次改动到底是优化还是污染；
- 工具的分化很明显：有的先讲 trace，有的先讲 eval，有的先讲 CI 与 red team，有的先讲 retrieval metrics；
- 学这组工具的目标不是挑一个“万能平台”，而是理解质量证据在系统里怎样流动。

## 2. 2026-09 我建议先聚焦的开源产品

| 产品 | 一句话定位 | 设计中心 | 更适合谁 |
|---|---|---|---|
| [Langfuse](/iopanda-blog/ai/04-tooling/02/02/) | 面向 LLM 工程平台的 observability + eval + prompt + dataset 组合 | tracing、datasets、online metrics、prompt 管理 | 想把开发/调试/评测放进统一工作台的团队 |
| [Phoenix](/iopanda-blog/ai/04-tooling/02/08/) | 偏 observability 与诊断分析的 AI 质量平台 | trace inspection、span 分析、eval 视角 | 想先把失败看清楚再扩展评测的团队 |
| [Promptfoo](/iopanda-blog/ai/04-tooling/02/14/) | 声明式 prompt / agent / RAG 测试与红队工具 | YAML 测试、CI、对比、red teaming | 需要把评测接进仓库与流水线的团队 |
| [DeepEval](/iopanda-blog/ai/04-tooling/02/20/) | 代码优先的 LLM 评测框架 | pytest 风格、指标、judge、回归评测 | 工程师主导、希望评测与代码同仓的团队 |
| [Ragas](/iopanda-blog/ai/04-tooling/02/26/) | 面向 RAG 质量的评测框架 | retrieval relevance、faithfulness、answer quality | 以知识问答和 RAG 应用为核心的团队 |

## 3. 这一模块建议怎么读

1. 先看 [01 Langfuse](/iopanda-blog/ai/04-tooling/02/02/)：理解“平台化 AI 工程”如何把 trace、eval、prompt、dataset 放在一起；
2. 再看 [02 Phoenix](/iopanda-blog/ai/04-tooling/02/08/)：理解诊断式 observability 为什么先看 span 与 failure mode；
3. 然后看 [03 Promptfoo](/iopanda-blog/ai/04-tooling/02/14/) 与 [04 DeepEval](/iopanda-blog/ai/04-tooling/02/20/)：把评测正式接进 CI 与代码工作流；
4. 最后看 [05 Ragas](/iopanda-blog/ai/04-tooling/02/26/)：补上 RAG 应用最关心的检索质量视角。

## 4. 我建议本模块的内容结构

这一模块可以复用你已经稳定下来的写法：

1. 本组总览 README；
2. 每个产品一个文件夹与 `README.md`；
3. 每个产品至少拆成 4~6 篇：
   - 它为什么存在 / 解决什么首要复杂度；
   - 核心抽象、架构与部署形态；
   - 与同类产品相比的设计中心；
   - 在课程助教或企业内部知识系统中的落点；
   - 适用边界、排错与迁移成本；
4. 最终再补一篇本组的选型矩阵：回答“为什么选 A，不选 B”。

## 5. 本模块的推荐交付物

| 交付物 | 说明 | 验收标准 |
|---|---|---|
| trace-to-eval-loop.md | 画出 trace、dataset、judge、人工抽检、CI 的闭环 | 能说明“出问题时先看哪里、修完后怎么验证” |
| eval-stack-selection-card.md | 按应用类型选择 observability / eval 组合 | 能解释“为什么这个项目先上 A，再补 B” |
| agent-quality-dashboard-spec.md | 定义团队真正需要的质量指标 | 指标不只好看，而且能驱动改进 |

## 6. 本模块笔记导航

1. [01 Langfuse](/iopanda-blog/ai/04-tooling/02/02/)
2. [02 Phoenix](/iopanda-blog/ai/04-tooling/02/08/)
3. [03 Promptfoo](/iopanda-blog/ai/04-tooling/02/14/)
4. [04 DeepEval](/iopanda-blog/ai/04-tooling/02/20/)
5. [05 Ragas](/iopanda-blog/ai/04-tooling/02/26/)

## 7. 这一模块该怎么学，才不会学成“产品说明书”

- 不要先记安装命令，先问它把哪类复杂度当作一等公民；
- 不要只看 happy path，重点看治理、排错、迁移、协作与上线证据；
- 不要问“谁最强”，要问“谁最匹配当前系统的首要矛盾”；
- 不要把开源工具当成银弹，工具只是把某类工程纪律做成现成组件。

## 8. 总结

| 关键问题 | 一句话 |
|---|---|
| 这一模块讲什么 | 把 tracing、eval、dataset、回归测试做成持续质量体系 |
| 为什么重要 | 没有证据的优化常常只是感觉更好 |
| 代表产品 | Langfuse / Phoenix / Promptfoo / DeepEval / Ragas |
| 学习重点 | 区分“看见系统”与“证明系统变好” |

## 引用

- [111] https://github.com/langfuse/langfuse — Langfuse GitHub
- [112] https://github.com/Arize-ai/phoenix — Phoenix GitHub
- [113] https://github.com/promptfoo/promptfoo — Promptfoo GitHub
- [114] https://github.com/confident-ai/deepeval — DeepEval GitHub
- [115] https://github.com/vibrantlabsai/ragas — Ragas GitHub

上一篇：[04.01 Model Gateways and Routing](/iopanda-blog/ai/04-tooling/01/01/)——入口统一以后，下一步是给系统装上显微镜与体检表。

下一篇：[04.03 Application Platforms and Workflows](/iopanda-blog/ai/04-tooling/03/01/)——看完诊断与评测，再看有哪些平台把这些能力和工作流一起封装起来。
