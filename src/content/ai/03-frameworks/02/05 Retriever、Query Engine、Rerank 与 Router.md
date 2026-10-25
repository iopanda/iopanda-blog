---
title: "Retriever、Query Engine、Rerank 与 Router"
number: "03.02.05"
chapter: 3
chapterTitle: "Frameworks"
section: 2
sectionTitle: "RAG and Retrieval Frameworks"
group: "01 LlamaIndex"
created: 2026-09-03 20:56
author: "iopanda"
tags: ["framework", "rag", "retrieval", "llamaindex", "retriever", "query-engine", "router", "rerank"]
sourceId: "3.10.3.2 RAG and Retrieval Frameworks/01 LlamaIndex/03 Retriever、Query Engine、Rerank 与 Router"
---
# Retriever、Query Engine、Rerank 与 Router

> RAG 系统里最常见的误解之一，是把 retrieval 想成“top-k 检索一下”，把 generation 想成“模型回答一下”。LlamaIndex 的对象层恰恰反对这种扁平化理解。源码里 `RetrieverQueryEngine` 明确把 retriever、response_synthesizer、node_postprocessors 分开；`RouterQueryEngine` 明确把 selector、candidate query engines、summarizer 分开；`SubQuestionQueryEngine` 则进一步把复杂问题分解成 sub questions，再交给不同 query engine tools 处理。[50][51][52] 这说明在 LlamaIndex 的世界里，retrieval chain 不是一条直线，而是：**召回、后处理、路由、分解、合成** 多层协作的查询系统。

**学习目标**：学完本章，你将能够——

1. 解释 retriever、query engine、response synthesizer、node postprocessor 在 LlamaIndex 中的职责边界；
2. 理解为什么 rerank / postprocess / routing 在真实 RAG 系统里经常比 embedding 更决定效果；
3. 说出 RouterQueryEngine 与 SubQuestionQueryEngine 各自适合什么问题；
4. 比较 LlamaIndex 这条 query object 路线与 Haystack 的 pipeline route 路线差异；
5. 为一个知识问答系统设计“召回—筛选—路由—合成”的查询架构。

## 1. 概念：Retriever 不是 Query Engine，Query Engine 也不是“模型回答器”

从 `RetrieverQueryEngine` 的构造就能看出，LlamaIndex 在显式拆层：[50]
- retriever：负责取节点；
- node postprocessors：负责取回后再处理节点；
- response synthesizer：负责根据 query 和 nodes 合成最终输出。

这说明 LlamaIndex 在强行纠正一个常见误解：
- retrieval ≠ answer generation
- retrieve enough ≠ answer done

真正的系统链路是：
1. 取回什么；
2. 取回后怎样过滤/重排/压缩；
3. 最终怎样合成用户可读答案。

## 2. `RetrieverQueryEngine`：为什么它是最典型的“RAG 主干对象”

`RetrieverQueryEngine` 代码很有代表性：[50]
- 接一个 `BaseRetriever`；
- 接一个可选 `response_synthesizer`；
- 接一组 `node_postprocessors`；
- 最后暴露 `retrieve()` 和 `synthesize()` 组合成 `_query()`。

这背后的设计非常清楚：
- retriever 负责 recall；
- postprocessors 负责 refine；
- synthesizer 负责 answer composition。

所以一个真正好的 RAG 系统，不是“只换更强 embedding 模型”，而是要看这三层是否都合理。

## 3. rerank / postprocess：为什么很多系统其实败在这里

`RetrieverQueryEngine` 里 `_apply_node_postprocessors()` 的存在很重要。[50]

它说明 LlamaIndex 默认承认：
- 初始召回结果常常不够好；
- retrieval 出来的节点还需要后处理；
- 后处理本身是 query chain 的正式一层，而不是事后修补。

这层通常包括：
- rerank
- 过滤
- 去重
- 压缩
- 格式整理
- 引用增强

很多团队一味换 embedding，却忽略 postprocess，最后会得到“召回到差不多的东西，但排序和上下文质量仍然不行”的系统。

## 4. response synthesizer：为什么最终答案不是“把 top-k 拼给模型”这么简单

`RetrieverQueryEngine` 里 `get_response_synthesizer()` 的存在说明，LlamaIndex 对“生成答案”这件事也做了正式抽象。[50]

它不是把 query 和 nodes 直接塞给某个黑箱，而是允许：
- 不同 response mode
- 不同 prompt templates
- structured output class
- async / streaming / multimodal

这意味着在 LlamaIndex 里，retrieval quality 和 answer synthesis quality 是两层可分离优化的问题。对架构师来说，这一点非常值钱，因为它允许你明确回答：
- 问题出在召回层；
- 还是出在答案合成层。

## 5. `RouterQueryEngine`：为什么多索引/多知识域系统需要路由

`RouterQueryEngine` 的注释很直白：从若干候选 query engines 中选择一个来执行查询，基于 selector 和每个候选的 metadata。[51]

这说明它针对的是这样的问题：
- 不是所有查询都该打到同一索引；
- 不是所有知识域都该混在一个大向量库；
- 路由本身是 retrieval system 的正式能力。

在课程助教这种案例里就很自然：
- 课程内容问答 → 课程讲义 query engine
- 规则咨询 → 课程规则 query engine
- 成绩边界 → 敏感规则 / 审批链路

也就是说，LlamaIndex 很早就在对象层里承认：**多知识域系统不能靠一个统一 top-k 检索硬扛。**

## 6. `SubQuestionQueryEngine`：为什么复杂问题需要先拆，再取，再合成

`SubQuestionQueryEngine` 的定义更进一步：[52]
- 先生成 sub questions；
- 每个 sub question 绑定目标 query engine；
- 分别执行；
- 最后 response synthesizer 汇总结果。

这其实已经很接近 agentic retrieval 思维了，只不过它仍然被包在 query engine 对象世界里，而不是直接上 agent framework。

适合的典型问题：
- compare / contrast
- 多文档汇总
- 多知识域组合查询
- 需要按子问题分派给不同索引/引擎的复杂问答

这说明 LlamaIndex 的 query 层次并不浅：它不止支持“检索几段文本”，而是在支持复杂查询编排。

## 7. 为什么 Router 和 SubQuestion 非常能体现 LlamaIndex 的独特性

很多 RAG 框架也有 routing / pipeline / branching，但 LlamaIndex 的独特性在于：
- 它不是从 pipeline 开始讲这些；
- 而是把这些继续表达为 query object 家族的扩展。

这和 Haystack 的“显式 pipeline 编排”路线形成明显差异：
- Haystack 更像在设计流程图；
- LlamaIndex 更像在扩展查询对象系统。

一句话：同样是复杂 retrieval，Haystack 更像 pipeline world，LlamaIndex 更像 query object world。

## 8. 为什么这对开发者和架构师有价值

### 对开发者
- 更容易围绕 query interface 逐层调试；
- 可以单独替换 retriever / reranker / synthesizer；
- 更适合在对象层做扩展与复用。

### 对架构师
- 更容易做多索引拆分；
- 更容易把知识域路由显式化；
- 更容易区分“检索错了”与“答案拼错了”。

这使得 LlamaIndex 特别适合知识系统逐渐长大的场景：先单索引，再多索引，再多查询对象，再更复杂的 agentic retrieval。

## 9. 课程助教最适合哪种 query chain

课程助教这种系统，很自然会遇到三种问题：

1. **普通课程问答**
- 用 `RetrieverQueryEngine` 足够；

2. **规则 / 课程政策问答**
- 适合单独 query engine，再交给 `RouterQueryEngine` 路由；

3. **复杂组合问题**
- 如“比较第 3 章和第 5 章的学习重点，并给出期末复习优先级”
- 更接近 `SubQuestionQueryEngine` 的问题分解能力。

这说明课程助教一开始看似简单，后面其实很适合展示 LlamaIndex 查询对象体系的层层升级。

## 10. 动手活动：给课程助教设计 3 层 query chain

> [!example] 动手活动：输出 `llamaindex-query-chain.md`
>
> **目标**：不要只说“做 RAG”，而是给课程助教画出明确的 query chain 分层。
>
> **步骤**：
> 1. 列出普通问答、规则咨询、复杂比较题三类查询；
> 2. 判断每类该走 `RetrieverQueryEngine`、`RouterQueryEngine` 还是 `SubQuestionQueryEngine`；
> 3. 给每类写 node postprocessor / rerank 需求；
> 4. 写出 response synthesizer 需要控制的输出要求；
> 5. 写一句结论：为什么多知识域问题不能靠一个统一 top-k 检索硬扛。
>
> **完成标准**：你能清楚说明“哪个问题适合直接检索，哪个问题适合先路由，哪个问题适合先拆子问题”。

## 11. 边界与排错

- **误区一：retriever 就等于整个 RAG。** 真正系统至少还包括 postprocess 与 synthesis；
- **误区二：rerank 只是锦上添花。** 很多时候它决定实际可用性；
- **误区三：多知识域还用一个统一索引硬扛。** 路由需求迟早会回来；
- **误区四：复杂问题直接丢给生成模型总结。** 先拆子问题往往更稳；
- **误区五：query object 不如 pipeline 清晰。** 它们只是表达世界不同，不是孰高孰低。

## 12. 总结

| 关键问题 | 一句话 |
|---|---|
| Retriever 在做什么 | 负责召回节点 |
| QueryEngine 在做什么 | 组织召回、后处理与最终合成 |
| rerank / postprocess 的意义 | 让初始召回变成可用上下文 |
| RouterQueryEngine 的意义 | 多知识域系统需要正式路由 |
| SubQuestionQueryEngine 的意义 | 复杂问题应先拆再取再合成 |
| LlamaIndex 的独特性 | 用查询对象系统扩展复杂 retrieval，而不是先画 pipeline |

**思考题**：为什么一个系统如果只会“单 retriever + 单 top-k + 单 prompt 合成”，一开始可能够用，但一旦出现多知识域、复杂比较题、规则问答和权限边界，就会越来越吃力？LlamaIndex 的 query object 家族，本质上是在为哪类复杂度预留扩展位？

> [!note] 参考答案
> 因为这套最小结构默认所有问题都能靠同一种召回与合成方式解决，而真实系统很快会分化出不同知识域、不同回答模式、不同复杂度层级。LlamaIndex 的 query object 家族本质上是在为“查询形态复杂度”预留扩展位：你不必一上来就上完整 workflow，但当问题类型分化时，可以沿 retriever → router → sub-question 这条对象层路径自然升级。

## 引用

- [46] https://github.com/run-llama/llama_index/blob/main/README.md — LlamaIndex README
- [50] https://github.com/run-llama/llama_index/blob/main/llama-index-core/llama_index/core/query_engine/retriever_query_engine.py — LlamaIndex retriever query engine source
- [51] https://github.com/run-llama/llama_index/blob/main/llama-index-core/llama_index/core/query_engine/router_query_engine.py — LlamaIndex router query engine source
- [52] https://github.com/run-llama/llama_index/blob/main/llama-index-core/llama_index/core/query_engine/sub_question_query_engine.py — LlamaIndex sub question query engine source

上一篇：[02 Ingestion Pipeline、Chunking 与 Metadata](/iopanda-blog/ai/03-frameworks/02/04/)——数据进来了，下一步就该问：怎样真正把正确知识取出来并合成答案？

下一篇：[04 多索引、多数据源与 Agentic Retrieval](/iopanda-blog/ai/03-frameworks/02/06/)——查询对象立住后，下一篇继续看系统如何走向多索引、多数据源与更 agentic 的 retrieval。
