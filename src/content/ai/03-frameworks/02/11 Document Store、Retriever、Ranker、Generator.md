---
title: "Document Store、Retriever、Ranker、Generator"
number: "03.02.11"
chapter: 3
chapterTitle: "Frameworks"
section: 2
sectionTitle: "RAG and Retrieval Frameworks"
group: "02 Haystack"
created: 2026-09-03 21:50
author: "iopanda"
tags: ["framework", "rag", "retrieval", "haystack", "document-store", "retriever", "ranker", "generator"]
sourceId: "3.10.3.2 RAG and Retrieval Frameworks/02 Haystack/02 Document Store、Retriever、Ranker、Generator"
---
# Document Store、Retriever、Ranker、Generator

> Haystack 的 pipeline 语言如果没有组件家族支撑，只会变成漂亮流程图。真正让它成立的，是一组职责边界很清楚的组件：document store、retriever、ranker、generator，以及把它们串起来的 builder/routers/writers。源码里 `InMemoryDocumentStore`、`InMemoryBM25Retriever`、`InMemoryEmbeddingRetriever`、`LLMRanker` 这些对象非常能说明它的设计习惯：每个组件职责明确、输入输出明确、可序列化、可插入 pipeline。[56][57][58][60]

**学习目标**：学完本章，你将能够——

1. 说出 document store、retriever、ranker、generator 在 Haystack 中的职责边界；
2. 理解为什么 BM25、embedding retrieval、LLM rerank 会被拆成不同组件；
3. 解释 document store 在 Haystack 里为什么不仅是存储，而是检索行为的一部分；
4. 比较 Haystack 的组件家族与 LlamaIndex 的对象家族差异；
5. 为一个 RAG 系统设计检索核心组件栈。

## 1. Document Store：为什么它是行为边界，不只是数据库句柄

`InMemoryDocumentStore` 的实现里能直接看到：
- BM25 tokenization
- embedding similarity function
- shared/local storage
- async executor
- filtering
- score scaling。[56]

这说明在 Haystack 里，document store 并不是“纯存储接口”，而是已经承担了一部分 retrieval semantics：
- 文档如何被 tokenized；
- BM25 算法如何算；
- embedding 相似度怎样比较；
- filters 如何应用。

所以 document store 在这里更像“检索后端对象”，而不只是数据库连接器。

## 2. BM25Retriever：为什么 keyword retrieval 仍然是一等组件

`InMemoryBM25Retriever` 很清楚地说明：
- 它是 component；
- 输入是 query、filters、top_k；
- 输出是 documents；
- filter policy 可 REPLACE 或 MERGE。[57]

这说明 Haystack 并没有把 keyword retrieval 当成“落后技术”，而是把它保留成现代 RAG 里的正式一层。原因很简单：
- 稀疏检索对关键词、术语、专有名词仍然非常有效；
- 很多规则、编号、课程章节名比 embedding 更适合 BM25；
- hybrid retrieval 本来就需要它。

## 3. EmbeddingRetriever：为什么稠密检索也被明确拆出来

`InMemoryEmbeddingRetriever` 的设计与 BM25Retriever 非常平行，只是输入变成 query_embedding。[58]

这暴露了 Haystack 的一个很成熟的工程习惯：
- 不把“检索”混成一个黑箱；
- 而是让不同 retrieval semantics 用不同 component 表达。

这样做的好处是：
- 稀疏和稠密检索可以独立调参；
- 可以组合 hybrid retrieval；
- 可以在 pipeline 里清楚知道哪一步做了什么。

## 4. Ranker：为什么重排在 Haystack 里是单独的一层

`LLMRanker` 的源码非常具有代表性：
- 有独立 prompt template；
- 要求返回结构化 JSON 排名；
- 明确 top_k；
- 明确 failure fallback 行为。[60]

这说明 Haystack 的态度是：
- rerank 不是 retriever 的小尾巴；
- rerank 是正式 component；
- rerank 失败也需要明确定义系统怎么退化。

这非常工程化。因为很多团队会把 rerank 当“小修饰”，而实际上它常常是回答质量能否真正落地的关键层。

## 5. Generator：为什么它在 Haystack 里通常是链路后段，而不是全部主角

Haystack 当然支持很多 generator，但从整个框架表达上看，generator 更像 pipeline 后段的一环，而不是全部系统的中心。[54]

这说明它的价值观是：
- generator 很重要；
- 但 generator 之前的 retrieval / ranking / routing / filtering 一样重要；
- production RAG 不该由模型单独吃下全部复杂度。

这和许多“把 prompt 和模型当绝对主角”的做法不同。

## 6. filter policy：为什么它说明检索不是只看相似度

BM25Retriever 和 EmbeddingRetriever 都支持 filters 和 filter_policy。[57][58]

这很关键，因为真实系统的 retrieval 不只是“谁最像”，还包括：
- 哪些文档合法；
- 哪些文档属于本租户；
- 哪些文档在这个场景下才应进入召回集；
- runtime filters 和 default filters 应怎样合并。

这说明 Haystack 从组件层就把“治理”和“检索”绑在一起看，而不是后面再补。

## 7. 为什么这套组件家族特别适合架构化思考

因为每一层都能被单独问责：
- document store 是否存对了、算对了；
- retriever 是否召回对了；
- ranker 是否排序对了；
- generator 是否表达对了。

这和一条黑箱“query in, answer out”差别非常大。它使评测也能分层：
- recall
- ranking
- answer quality
而不是只看最终回答好不好。

## 8. 和 LlamaIndex 的最大差异：组件职责 vs 对象家族

| 维度 | Haystack | LlamaIndex |
|---|---|---|
| 首先怎么拆系统 | component families | object families |
| retriever/engine 表达 | pipeline 组件 | query object |
| document/store 表达 | 检索后端组件 | 文档/节点/索引对象 |
| 更适合谁 | 想按处理阶段显式拆链路的团队 | 想按知识对象显式拆系统的团队 |

一句话：
- Haystack 更像“处理工位”；
- LlamaIndex 更像“知识对象层级”。

## 9. 动手活动：给课程助教设计一套 Haystack 组件栈

> [!example] 动手活动：输出 `haystack-component-stack.md`
>
> **目标**：把课程助教的 retrieval stack 拆成显式组件，而不是一句“我们做了 RAG”。
>
> **步骤**：
> 1. 选 document store；
> 2. 选 BM25 / embedding retriever；
> 3. 判断是否需要 ranker；
> 4. 指定 generator 在链路中的位置；
> 5. 写一段说明：每层失败时你最先查哪。
>
> **完成标准**：你能清楚说明“系统是召回错了、排序错了，还是生成错了”。

## 10. 边界与排错

- **误区一：document store 只是数据库。** 在 Haystack 里它已经包含部分检索语义；
- **误区二：BM25 过时，不必管。** 很多规则和术语问题它非常重要；
- **误区三：rerank 可以后面再说。** 往往真正可用性卡在这里；
- **误区四：generator 足够强，前面都不重要。** 这和 Haystack 的价值观相反；
- **误区五：filters 只是小功能。** 它们经常决定系统是否合法可用。

## 11. 总结

| 关键问题 | 一句话 |
|---|---|
| Document Store 在这里是什么 | 带检索语义的后端对象 |
| BM25Retriever 的意义 | 稀疏检索仍是正式一层 |
| EmbeddingRetriever 的意义 | 稠密检索必须被显式表达 |
| LLMRanker 的意义 | 重排不是附件，而是单独质量层 |
| Generator 的位置 | 后段关键组件，而不是全部主角 |
| Haystack 的优势 | 让 retrieval stack 每层都可替换、可评测、可问责 |

**思考题**：为什么一个系统如果把 document store、retriever、rerank、generator 全都揉在一起，很快就会失去可调试性和可评测性？Haystack 这种显式组件拆分，真正帮团队保住了哪种能力？

> [!note] 参考答案
> 因为一旦揉在一起，任何失败最后都只表现为“答案不好”，团队很难判断是存储问题、召回问题、排序问题还是生成问题。Haystack 的显式组件拆分，真正保住的是分层诊断和分层演进能力：你可以单独换 retriever、单独调 ranker、单独测 generator，而不用把整个系统当黑箱重试。

## 引用

- [54] https://github.com/deepset-ai/haystack/blob/main/README.md — Haystack README
- [56] https://github.com/deepset-ai/haystack/blob/main/haystack/document_stores/in_memory/document_store.py — Haystack in-memory document store source
- [57] https://github.com/deepset-ai/haystack/blob/main/haystack/components/retrievers/in_memory/bm25_retriever.py — Haystack BM25 retriever source
- [58] https://github.com/deepset-ai/haystack/blob/main/haystack/components/retrievers/in_memory/embedding_retriever.py — Haystack embedding retriever source
- [60] https://github.com/deepset-ai/haystack/blob/main/haystack/components/rankers/llm_ranker.py — Haystack LLM ranker source

上一篇：[01 Pipeline 思维与 Component 设计哲学](/iopanda-blog/ai/03-frameworks/02/10/)——pipeline 语言立住后，本篇继续拆这条链的核心组件家族。

下一篇：[03 Hybrid Retrieval、Evaluation 与 Production RAG](/iopanda-blog/ai/03-frameworks/02/12/)——组件栈立住后，下一篇继续看混合检索、评测和生产运行纪律。
