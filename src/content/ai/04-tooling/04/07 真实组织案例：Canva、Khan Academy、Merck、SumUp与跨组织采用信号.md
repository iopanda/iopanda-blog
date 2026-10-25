---
title: "真实组织案例：Canva、Khan Academy、Merck、SumUp与跨组织采用信号"
number: "04.04.07"
chapter: 4
chapterTitle: "Tooling"
section: 4
sectionTitle: "Prompt Management"
group: "01 Langfuse Prompts"
created: 2026-09-03 22:20
author: "iopanda"
tags: ["course", "ai-tooling", "prompt-management", "langfuse-prompts", "case-studies"]
sourceId: "3.10.4.4 Prompt Management/01 Langfuse Prompts/05 真实组织案例：Canva、Khan Academy、Merck、SumUp与跨组织采用信号"
---
# 真实组织案例：Canva、Khan Academy、Merck、SumUp与跨组织采用信号

> 本章聚焦公开可验证的组织采用案例，重点看“prompt 管理”而不是泛泛的 Langfuse 平台采用。Langfuse 的客户案例里，Canva、Merck、SumUp 对 prompt versioning、release management、非技术角色参与等内容有更明确披露；Khan Academy 则更多体现平台采用与开放 API 路线。除此之外，pricing 页面还给出了 50,000+ companies using Langfuse 的跨组织采用信号。[4][5][6][7][8][9]

**学习目标**：学完本章，你将能够——

1. 从真实组织案例理解 Langfuse Prompts 的落点；
2. 识别哪些组织最容易被 prompt 资产化能力吸引；
3. 从背景、痛点、采用方式、成本收益、结果五个维度分析案例；
4. 区分 prompt 管理专项价值与 Langfuse 平台整体价值；
5. 理解 prompt 管理何时会从“工程便利”变成“组织能力”。

> [!note] 说明
> 以下案例只使用公开可验证信息。若某个组织案例对 prompt management 的披露不充分，文中会明确区分“平台采用事实”与“prompt 管理专项信号”，不补写未披露的流程细节。[4][5][6][7][8][9]

## 案例 1：Canva

**背景**
Canva 的客户案例是 Langfuse Prompts 最强的公开案例之一。案例明确写到，Canva 的 Help Assistant 与 OmniAgent 都在使用 Langfuse Prompt Management，且该系统支持产品经理、QA、内容设计与领域专家共同参与 prompt 相关工作流。[6]

**痛点**
Canva 面对的是一个典型的大规模支持系统：
- 多代理、多工具、多知识源；
- Java 与 Python 双栈；
- 不仅工程师，非技术角色也必须参与 tone、质量和业务表达的迭代。

**采用方式**
Canva 明确使用：
- Prompt Management 做版本管理；
- production promote / rollback；
- Playground 做 replay testing；
- 让非技术角色独立修改和验证 prompt。[6]

**成本收益分析**
- 成本：需要把 prompt 管理纳入正式流程，并对接多角色协作；
- 收益：prompt 不再成为工程排期瓶颈，非技术领域专家可直接参与；
- 产品意义：这说明 Langfuse Prompts 最强的场景之一，就是“prompt 需要跨角色共同维护”的组织。

**结果**
公开材料里最关键的结果信号不是单点 ROI，而是：Canva 明确把 Prompt Management 视为 key enabler，并指出 versioning 与 promote / rollback 大幅提高了 prompt 迭代速度和角色协作效率。[6]

## 案例 2：Merck

**背景**
Merck 的客户案例强调 Langfuse 在全球范围内支撑 80+ AI project teams，且下一阶段要建设 enterprise-wide benchmark dataset 和更 elaborate systems for evaluation/datasets。[8]

**痛点**
Merck 作为全球制药和化工集团，其问题不是写几个 prompt，而是：
- 数十个团队同时做 GenAI；
- 不同业务单元都需要可追踪、可对比、可治理的内容配置；
- 高敏感行业要求 prompt、response、cost、latency 都可审计。

**采用方式**
虽然案例更强调 observability，但其平台使用逻辑已经明显延伸到 prompt 管理：
- API-first provisioning；
- model side-by-side comparison；
- evaluation criteria 定义；
- 与 datasets 配合的 enterprise-wide quality layer。[8]

**成本收益分析**
- 成本：企业级平台治理和流程自动化很重；
- 收益：提示逻辑不再零散分布在各团队内部，而能逐步进入统一平台治理；
- 产品意义：说明在大型企业里，prompt 管理会很自然与 observability 和 evaluation 一起平台化。

**结果**
公开可确认的是：Merck 已把 Langfuse 作为大规模 GenAI use case 的统一平台，并计划将 datasets/evaluation 系统进一步企业化，这为 prompt 资产治理提供了强组织语境。[8]

## 案例 3：SumUp

**背景**
SumUp 的客户案例明确提到，Prompt Management 与 Playground 让 business teams 和 engineers 可以快速迭代 prompt changes in production，并且能复现精确的 production configs、variables 和 tool integrations。[9]

**痛点**
SumUp 的 AI support 系统服务 4 million merchants 和 35+ markets，面临：
- 多市场、多语言、多流程差异；
- 客服和内部团队都需要持续迭代提示逻辑；
- 非技术团队此前难以直接参与 prompt 改进。

**采用方式**
SumUp 使用 Langfuse：
- 做 prompt 管理；
- 用 Playground 复现实验环境；
- 把 prompt 迭代纳入跨 Engineering、Support Operations、Content、Q&A 的协作流程。[9]

**成本收益分析**
- 成本：需要将 prompt、评估器与多团队协作流程绑定；
- 收益：非技术团队终于能在接近真实生产环境中推进 prompt 优化；
- 产品意义：这说明 Langfuse Prompts 对客服和运营驱动型团队很有价值。

**结果**
公开结果除业务分流成效外，更关键的专项信号是：Prompt management 让 business teams 和 engineers 都能快速改 prompt，Playground 则让精确复现生产环境成为可能。[9]

## 案例 4：Khan Academy

**背景**
Khan Academy 的案例并不以 prompt management 为主角，但它明确说明 Langfuse 已成为跨 7 个产品团队与 4 个基础设施团队的共同平台，且其开放 API 支持 Go 技术栈接入。[7]

**痛点**
教育产品中的 prompt 通常需要：
- 连续优化教学语气与内容质量；
- 与已有技术栈兼容；
- 让平台 adoption 真正跨团队展开。

**采用方式**
公开材料能确认的是：Khan Academy 使用 Langfuse 作为统一平台，快速获得反馈并避免自建 tracing infrastructure。虽然未单独展开 prompt management 细节，但这为 prompt 资产层 adoption 提供了强平台基础。[7]

**成本收益分析**
- 成本：需要在 Go 体系中完成接入；
- 收益：一旦平台被跨团队接受，prompt 管理这类上层能力就更容易落地；
- 产品意义：说明 prompt 管理的 adoption 往往依赖底层平台 adoption 先发生。

**结果**
公开能确认的结果是：Khan Academy 把 Langfuse 作为跨团队基础平台使用，这为 prompt 管理能力进入真实教育产品提供了组织条件。[7]

## 案例 5：跨组织采用信号

**背景**
Langfuse pricing 页面公开写出 50,000+ companies using Langfuse，并将 Prompt Management、Prompt Versioning、Prompt Fetching、Prompt Release Management、Prompt Composability、Prompt Caching、Playground、Prompt Experiments 列为正式产品能力。[5]

**痛点**
这说明 prompt 管理已不是边缘高级功能，而是大量组织在采用 Langfuse 时会接触到的正式能力层。

**采用方式**
虽然 pricing 页不提供每家公司的详细实践，但它给出了两类强信号：
- prompt management 已产品化；
- adoption 覆盖面已经远超单一小圈层。

**成本收益分析**
- 成本：它不能替代具名案例；
- 收益：能证明 prompt 管理不是小众需求，而是平台级正式产品面；
- 产品意义：这是判断“市场是否真的需要 prompt 资产化”的重要旁证。

**结果**
公开可确认的是：Langfuse 已将 Prompt Management 放入正式产品层，并在大规模采用语境中对外呈现。[5]

## 6. 这些案例共同说明了什么

这些案例共同说明：

1. Langfuse Prompts 最容易被哪些组织采用？
   - prompt 改动频繁；
   - 非技术角色必须参与；
   - trace / eval / prompt 需要打通；
   - 已进入生产治理阶段。
2. 它最常扮演什么角色？
   - 不是独立 prompt 工具；
   - 而是 AI engineering 平台里的 prompt 资产层。
3. 为什么这类能力会越来越重要？
   - 因为 prompt 一旦进入生产，就必须被版本化、可回滚、可审计、可协作。

## 7. 总结

| 组织/信号 | Langfuse Prompts 扮演的角色 |
|---|---|
| Canva | 多角色协作 prompt 管理层 |
| Merck | 大型企业平台中的 prompt 治理基础层 |
| SumUp | 运营/客服团队可直接参与的 prompt 管理层 |
| Khan Academy | 跨团队平台 adoption 的上层 prompt 基础 |
| 50,000+ companies using Langfuse | prompt 管理已进入平台级采用语境 |

**思考题**：为什么 prompt 管理真正成熟的标志，不是“能存多少模板”，而是“有多少非技术角色可以安全地参与修改和发布”？

> [!note] 参考答案
> 因为 prompt 管理的真正难点从来不是保存文本，而是把领域知识、安全发布、线上验证和团队协作结合起来。只有当非技术角色也能在明确流程下参与时，prompt 才真正从个人技巧变成组织资产。

## 引用

- [5] https://langfuse.com/pricing — Langfuse pricing
- [6] https://langfuse.com/customers/canva — Langfuse Canva 客户案例
- [7] https://langfuse.com/customers/khan-academy — Langfuse Khan Academy 客户案例
- [8] https://langfuse.com/users/merckgroup — Langfuse Merck 客户案例
- [9] https://langfuse.com/customers/sumup — Langfuse SumUp 客户案例

上一篇：[04 与 Promptfoo、DSPy、Guidance、Outlines 的竞品对比](/ai/04-tooling/04/06/)——看清竞品差异后，再看真实组织为什么会把 prompt 管理做成正式能力。

下一篇：[02 Promptfoo](/ai/04-tooling/04/08/)——下一个产品切到测试与门禁导向的 prompt 管理路线。
