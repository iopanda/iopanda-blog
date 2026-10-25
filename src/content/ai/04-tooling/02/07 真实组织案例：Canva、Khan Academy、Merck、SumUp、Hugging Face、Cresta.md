---
title: "真实组织案例：Canva、Khan Academy、Merck、SumUp、Hugging Face、Cresta"
number: "04.02.07"
chapter: 4
chapterTitle: "Tooling"
section: 2
sectionTitle: "Observability and Evaluation"
group: "01 Langfuse"
created: 2026-09-03 20:52
author: "iopanda"
tags: ["course", "ai-tooling", "observability-and-evaluation", "langfuse", "case-studies"]
sourceId: "3.10.4.2 Observability and Evaluation/01 Langfuse/05 真实组织案例：Canva、Khan Academy、Merck、SumUp、Hugging Face、Cresta"
---
# 真实组织案例：Canva、Khan Academy、Merck、SumUp、Hugging Face、Cresta

> 本章聚焦公开可验证的组织采用案例，重点分析 Langfuse 在真实业务系统中的落点、采用动因与组织价值，而不是仅罗列生态集成能力。[1][2][3][4][5][6][7]

**学习目标**：学完本章，你将能够——

1. 从真实组织案例理解 Langfuse 的产品落点；
2. 识别哪些组织最容易被 Langfuse 吸引；
3. 从背景、痛点、集成、成本收益、结果五个维度分析案例；
4. 理解 Langfuse 为什么常作为“AI 质量工作台”被采用；
5. 避免把“能集成某 SDK”误写成“真实采用案例”。

> [!note] 说明
> 以下案例均来自 Langfuse 官方 customers 页面或对应 客户案例页面。它们有的给出了明确业务结果，有的给出了组织采用方式与关键收益；文中仅采用公开可验证的信息，不推断未披露的量化结果。[1][2][3][4][5][6][7]

## 案例 1：Canva

**背景**
Langfuse 官方 客户案例明确写到，Canva 用 Langfuse 构建和运营其 Agentic Support Experience。案例中介绍了 Canva 的 Help Assistant 与 OmniAgent 两套支持系统，并指出其月活用户规模超过 2.5 亿。[2]

**痛点**
Canva 面临的是一个典型的大规模多代理支持场景：
- 支持系统不是单一聊天机器人，而是多层、多工具、多子代理系统；
- 基础设施同时存在 Java 与 Python 两条技术栈；
- 除工程师外，产品、QA、内容设计和领域专家都需要参与质量改进。[2]

**集成方法**
Canva 在 Java 侧通过 OpenTelemetry 接入，在 Python ML worker 侧通过 Langfuse Python SDK 接入，把 Help Assistant 与 OmniAgent 放在同一套 Langfuse 平台里管理。同时，Canva 把 Prompt Management、Tracing、Playground、Evals 都实际用起来，并让非技术人员也能参与评估器配置。[2]

**成本收益分析**
- 成本：需要打通多语言栈、跨角色工作流和较复杂的 agent 系统；
- 收益：把 AI 支持系统从工程师专属工具，扩展成跨角色共享的质量工作台；
- 产品意义：这是 Langfuse 很典型的价值场景——不仅服务开发者，还服务产品、QA、内容和领域专家。

**结果**
Canva 的公开表述显示，Langfuse 帮它在 engineering requirements 与 non-technical domain expertise 之间找到“平衡点”，说明它不是只被用作 trace 面板，而是被真正当作多角色协同平台使用。[2]

## 案例 2：Khan Academy

**背景**
Langfuse 客户案例明确写到，Khan Academy 用 Langfuse 支撑 Khanmigo AI 的开发与改进，并指出 Khan Academy 拥有超过 1.5 亿注册学习者。[3]

**痛点**
Khan Academy 的特殊点在于它已经深度采用 Go 基础设施，而很多 AI tracing 工具更偏向特定 SDK/wrapper。这让它在接入 AI observability 时面临技术栈适配问题。[3]

**集成方法**
Khan Academy 选择利用 Langfuse 的 open API 自建 Golang client，而不是被迫重写服务或迁移技术栈。案例中还提到，自 2024 年 4 月部署后，Langfuse 在组织内扩展到 7 个产品团队与 4 个基础设施团队、100+ 用户共同使用。[3]

**成本收益分析**
- 成本：要基于 open API 做自定义 Go 集成；
- 收益：不用为了 observability 改变现有 Go 技术路线；
- 产品意义：这非常适合那些并不想为 LLMOps 工具重构主系统的成熟组织。

**结果**
Khan Academy 公开写出几个非常强的结果信号：
- Langfuse 成为开发者理解 AI 实现的基础工具；
- 避免了自建 tracing 基础设施开销；
- 组织层面避免了 observability 工具碎片化。[3]

## 案例 3：Merck

**背景**
Merck 的 Langfuse 客户案例直接写到：Merck 在全球范围内用 Langfuse 服务 80+ 个 AI 项目团队，并有 200+ 人定期使用 Langfuse，支持的 GenAI use case 总数超过 300 个。[4]

**痛点**
Merck 的问题非常典型地属于大型企业：
- 业务横跨 Healthcare、Life Science、Electronics；
- AI use case 分布在 R&D、制造、商业、安全等多个职能；
- 对安全、数据主权、可审计性要求极高；
- 平台团队需要用 API-first 的方式统一发放和管理能力。[4]

**集成方法**
Merck 通过自建 use case portal、自动化 pipeline 和 Langfuse 的 API-first 能力，把 Langfuse 纳入统一平台编排中。被批准的团队会被自动 provision 访问权限和相应资源。Langfuse 还被 self-host 以满足制药行业严格的数据主权与安全要求。[4]

**成本收益分析**
- 成本：平台编排、权限自动化和企业级自托管本身都不轻；
- 收益：同一平台可服务数十个项目团队，避免观测工具和方法分散；
- 产品意义：这是 Langfuse 从“团队工具”升级为“企业 AI 平台部件”的最好案例之一。

**结果**
公开材料给出的结果非常强：
- 约 80 个 use case 运行在 Langfuse 上；
- 200+ 人定期使用；
- Merck 认为 Langfuse 把黑箱模型变成可审计、可优化资产。[4]

## 案例 4：SumUp

**背景**
SumUp 的 客户案例明确写到，SumUp 用 Langfuse 支持其面向 4 million merchants、35+ markets 的 AI-powered first level support。[5]

**痛点**
这个场景的难度来自三层：
- 多市场、多语言、多地区规则；
- 金融服务场景下的数据隐私和安全要求；
- 客服对话涉及 follow-ups、clarifications 和多系统查询，交互链路非常复杂。[5]

**集成方法**
SumUp 在 PoC 早期先用 Langfuse Self-Hosting 快速起步，等系统接近生产并扩大 rollout 后，再切换到 Langfuse Cloud 承担运行可靠性。Langfuse 被用于跨 Engineering、Support Operations、Content、Q&A 等 25 位用户的持续开发与监控工作流中。[5]

**成本收益分析**
- 成本：早期需要自托管与后续迁移，并且要打通跨职能流程；
- 收益：既支持从 PoC 快速起步，又支持后期把运维负担转给云服务；
- 产品意义：说明 Langfuse 不只是“Cloud or self-host 二选一”，而是支持组织分阶段演进。

**结果**
SumUp 公开披露了很强的业务结果：
- 50% 对话被 AI 分流，不再进入人工；
- 每月减少约 300,000 次需要人工处理的 merchant requests；
- 在 18 个月内成功扩展到 35+ 市场。[5]

## 案例 5：Hugging Face

**背景**
Hugging Face 的 客户案例明确写到，Machine Learning Engineer Niels Rogge 使用 Langfuse 支撑一个 overnight agent，帮助发现未进入 Hugging Face Hub 的开源模型和数据集，并推动作者提交 issue / PR。[6]

**痛点**
Hugging Face 的问题不是普通聊天助手，而是一个全自动运行的 agent：
- 每天要处理 100 到 350 篇 arXiv 论文；
- 每篇论文涉及多步 LLM 调用；
- 如果没有可见性，就很难理解 agent 为什么做出某个分类和 outreach 决策。[6]

**集成方法**
Niels 直接把 Langfuse Python SDK 接进 agent 代码里，并用 arXiv ID 作为 session identifier，把“每篇论文的一次 run”组织成单独 trace，再把四个 LLM 步骤记录为 observations。[6]

**成本收益分析**
- 成本：需要把 agent 行为和业务对象（paper/arXiv ID）重新映射到 trace 结构；
- 收益：agent 决策终于能被逐步审查，不再是只看最终动作；
- 产品意义：说明 Langfuse 很适合那些非聊天式、异步自动 agent 系统。

**结果**
Hugging Face 公布了一个非常具体的结果：在两轮错误分析和修复后，这个 agent 在成千上万条 issue/PR 互动中只收到两条负面评论。[6]

## 案例 6：Cresta

**背景**
Cresta 的 客户案例写得非常清楚：Cresta 用 Langfuse 跟踪 multi-service AI agent pipelines，并解决数据主权与多租户隔离问题。[7]

**痛点**
Cresta 的 contact center agent 不是单次模型调用，而是包含 intent detection、knowledge retrieval、tool execution、safety validation 的多服务管线。对这类系统来说，“200 OK” 并不意味着系统真的健康。[7]

**集成方法**
Cresta 选择 self-host Langfuse，并且按 Kubernetes cluster 共置部署；同时以 per-customer organizations/projects 做 trace 隔离，再通过 gRPC metadata 传播 trace context，实现跨服务、跨语言的完整 trace 重建。[7]

**成本收益分析**
- 成本：自托管、多租户隔离和跨服务 trace 传播都不简单；
- 收益：获得完整的跨服务 agent pipeline 可观测性，并满足企业级数据主权要求；
- 产品意义：这说明 Langfuse 已经能够进入真正复杂、强合规、强多租户的企业 AI 平台场景。

**结果**
Cresta 明确表示，Langfuse 显著加快了其团队测试、学习、改进 LLM 行为与构建 AI agents 的速度，并且支撑了其跨客户数据隔离与 full data sovereignty 要求。[7]

## 7. 这些案例共同说明了什么

这 6 个组织覆盖了：
- 设计平台与用户支持；
- 教育 AI；
- 制药与全球企业平台；
- 金融科技客服；
- 开源模型生态；
- 联系中心企业 AI。

共同点非常一致：

1. 它们都不是单条 prompt demo，而是已经进入真实业务系统；
2. 它们都需要跨角色、跨系统或跨团队的 AI 质量协作；
3. 它们都把 Langfuse 当作 observability/evaluation/prompt 工作台，而不是单一日志工具；
4. 它们采用后的收益，常常体现在调试速度、跨团队协作、合规性和上线规模化上。

## 8. 总结

| 组织 | Langfuse 扮演的角色 |
|---|---|
| Canva | 多角色协同的 AI 支持工作台 |
| Khan Academy | Go 技术栈中的 AI observability 平台 |
| Merck | 企业级 GenAI 平台中的统一可观测与评测层 |
| SumUp | 从 PoC 到全球 rollout 的 AI 客服质量平台 |
| Hugging Face | 异步 agent 的可解释调试层 |
| Cresta | 多租户、多服务 AI agent 平台的 observability 后端 |

**思考题**：为什么这些组织采用 Langfuse 时，最看重的往往不是“有 trace 页面”，而是“能否把 AI 行为变成组织可治理的资产”？

> [!note] 参考答案
> 因为当 AI 应用进入真实业务后，团队真正关心的不只是看一眼调用记录，而是能否跨团队调试、跨角色协作、满足合规要求、持续优化，并把模型行为沉淀成可审计、可复盘、可改进的资产。Langfuse 在这些案例中的价值，恰恰来自这种组织级可治理性。

## 引用

- [1] https://langfuse.com/customers — Langfuse customers
- [2] https://langfuse.com/customers/canva — Canva 客户案例
- [3] https://langfuse.com/customers/khan-academy — Khan Academy 客户案例
- [4] https://langfuse.com/users/merckgroup — Merck 客户案例
- [5] https://langfuse.com/customers/sumup — SumUp 客户案例
- [6] https://langfuse.com/customers/hugging-face — Hugging Face 客户案例
- [7] https://langfuse.com/users/cresta — Cresta 客户案例

上一篇：[04 与 Phoenix、Promptfoo、DeepEval 的竞品对比](/iopanda-blog/ai/04-tooling/02/06/)——看清竞品差异后，再看真实组织为什么会采用 Langfuse。

下一篇：[02 Phoenix](/iopanda-blog/ai/04-tooling/02/08/)——下一个产品切到更偏 tracing/diagnostics 的路线。
