---
title: "课程助教 Agent 的 RAGFlow 架构案例"
number: "03.02.21"
chapter: 3
chapterTitle: "Frameworks"
section: 2
sectionTitle: "RAG and Retrieval Frameworks"
group: "03 RAGFlow"
created: 2026-09-03 22:00
author: "iopanda"
tags: ["framework", "rag", "retrieval", "ragflow", "case-study", "architecture"]
sourceId: "3.10.3.2 RAG and Retrieval Frameworks/03 RAGFlow/05 课程助教 Agent 的 RAGFlow 架构案例"
---
# 课程助教 Agent 的 RAGFlow 架构案例

> 把 RAGFlow 放回课程助教主线时，最自然的视角不是“怎么写代码对象”，也不是“怎么画组件图”，而是：**怎样把讲义、FAQ、课程规则、作业说明编译成一层可视、可测试、可共享、可追溯的知识平台，然后再接到上层 Chat / Search / Agent。** 这正是 RAGFlow 最擅长的部分。[62][65][66][67]

**学习目标**：
1. 用 RAGFlow 的平台语言重画课程助教知识层；
2. 判断哪些内容该建 dataset，哪些该单独治理 metadata 与权限；
3. 设计 retrieval testing、citation、policy filtering、team sharing；
4. 解释为什么课程助教在这里更像知识平台，而不是脚本或单体框架；
5. 画出一版可供运营和开发共同理解的架构草图。

## 1. 推荐的课程助教知识平台拆法

建议至少拆成：
- 课程讲义 dataset
- FAQ dataset
- 课程规则 dataset
- 作业说明 dataset

不要一上来混成一个库。原因是：
- 规则要更强权限和更严引用；
- FAQ 适合快速高命中；
- 讲义和作业说明的 chunk 模板可能不同。

## 2. parsing / chunking 在这个案例里为什么特别关键

课程讲义、PDF、PPT、规则表述常常格式复杂。RAGFlow 的 deep document understanding、template chunking、可视化 chunking 在这里非常顺手。[62]

## 3. retrieval testing 应怎么用

在课程助教里，检索测试至少应该覆盖：
- 典型概念问答
- FAQ 高频问题
- 规则边界问题
- 复杂复习问题

并且按文档建议先定位：
- parsing
- chunk
- metadata
- retrieval params
再去怪模型。[65]

## 4. metadata / permission 应怎么配

metadata 至少建议包含：
- source_type
- chapter
- course_id
- version
- visibility

权限上建议：
- 公开教学内容和 FAQ 可共享；
- 规则和某些敏感资料可受限；
- 教师/管理员拥有更大资源操作权限。[66][67]

## 5. 为什么这个案例最像 RAGFlow 平台

课程助教在 RAGFlow 下最像：
- 一个被持续维护的知识层；
- 一个有可视 chunking 和 retrieval testing 的运营对象；
- 一个可被上层 Chat / Search / Agent 消费的 context engine。

## 6. 动手活动

> [!example] 输出 `course-ta-ragflow-architecture.md`
>
> 以课程助教为例，列 dataset、chunk 模板、metadata、retrieval testing query、权限与共享范围。写一句结论：为什么这里更像平台化知识层，而不是只写几个 retriever。

## 7. 总结

| 关键问题 | 一句话 |
|---|---|
| 课程助教在这里像什么 | 一个被平台化治理的知识层 |
| 为什么分 dataset | 不同知识域有不同 chunk、测试、权限和运营需求 |
| 为什么先做 retrieval testing | 先把检索层验收，再接聊天和 agent |
| RAGFlow 的优势 | 知识编译、可视化、测试、共享、权限一体化 |

## 引用

- [62] https://github.com/infiniflow/ragflow/blob/main/README.md — RAGFlow README
- [65] https://github.com/infiniflow/ragflow/blob/main/docs/guides/dataset/retrieval_testing.md — RAGFlow retrieval testing guide
- [66] https://github.com/infiniflow/ragflow/blob/main/docs/guides/dataset/metadata_management.md — RAGFlow metadata management guide
- [67] https://github.com/infiniflow/ragflow/blob/main/docs/guides/team/permission_system_overview/index.md — RAGFlow permission overview

上一篇：[04 多用户、权限、平台化运营与评测](/iopanda-blog/ai/03-frameworks/02/20/)

下一篇：[06 RAGFlow 与 LlamaIndex、Haystack、LightRAG、Pathway 的深度对比](/iopanda-blog/ai/03-frameworks/02/22/)
