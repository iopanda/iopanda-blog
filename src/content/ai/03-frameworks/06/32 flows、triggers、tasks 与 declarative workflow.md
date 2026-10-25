---
title: "flows、triggers、tasks 与 declarative workflow"
number: "03.06.32"
chapter: 3
chapterTitle: "Frameworks"
section: 6
sectionTitle: "Workflow Orchestration Frameworks"
group: "3.10.3.6.5 Kestra"
created: 2026-09-09 11:02
author: "iopanda"
tags: ["framework", "workflow", "orchestration", "kestra", "declarative"]
sourceId: "3.10.3.6 Workflow Orchestration Frameworks/3.10.3.6.5 Kestra/02 flows、triggers、tasks 与 declarative workflow"
---
# flows、triggers、tasks 与 declarative workflow

> Kestra 的独特性，不在于“也有 flow/task/trigger 这几个词”，而在于它把三者统一收进一份声明式 YAML，并且这份 YAML 可以被代码编辑器、无代码编辑器、AI Copilot 同时编辑而保持同步。[15][33] 在 Kestra 里，flow 不是隐藏在某个框架 API 背后的对象，而是一份可读、可版本化、可被非工程师理解的配置文件。

**学习目标**：学完本章，你将能够——
1. 理解 flow 的必需结构（id、namespace、tasks）与可选组件；
2. 说出 flowable task 与 runnable task 的分工；
3. 理解 trigger 的通用机制：并发控制、`when` 条件、trigger 上下文；
4. 判断一个自动化需求该用哪种 trigger、哪种 task；
5. 为系统写一张 kestra-declarative-workflow card。

## 1. flow 是任务与编排逻辑的容器

Kestra 文档把 flow 定义得很直接：「a flow is a container for tasks and their orchestration logic」，它决定「**what** tasks run, **when** they run, and **how** they interact (sequentially, in parallel, or conditionally)」。[33] 每个 flow 必须包含三部分：`id`（标识）、`namespace`（逻辑分组）、`tasks`（步骤列表）；此外还可以选配 inputs、outputs、variables、triggers、labels、错误处理、重试、SLA、并发限制等。[33]

一个值得注意的细节是版本管理：「every change to a flow creates a new revision」，草稿版本（draft）不会被执行，只有发布后才生效。[33] 这说明 flow 本身自带类似 Git 的版本追溯能力，而不需要额外接一套外部版本控制才能审计“这个流程什么时候被改过”。

## 2. task 分两类：flowable 负责编排，runnable 负责干活

任务的核心属性是 `id`（唯一标识）和 `type`（一个完整的 Java 类名）。[35] Kestra 把任务分成两大类：[35]
- **flowable tasks**：不做重计算，只负责编排行为，比如 `Parallel`（并行执行）、`Switch`（条件分支）、`Loop`（循环）——「these tasks do not perform heavy computation. Instead, they control orchestration behavior」；
- **runnable tasks**：真正执行工作，比如跑 Python 脚本、发 HTTP 请求、调用 Slack 通知——「unlike Flowable tasks, Runnable tasks perform the actual work — such as file system operations, API calls, or database queries」。

`type` 字段用完整类名这件事本身就是插件机制：每个插件贡献自己的一批任务类型（Python、HTTP、Slack 等），flow 只需要按名字引用。[35][15]

## 3. trigger 的通用机制：不管哪种类型，行为都一致

不管是定时触发还是事件触发，Kestra 给所有 trigger 提供了一套统一的行为规则：[34]
- **并发控制**：默认「each trigger allows only one active execution at a time」，后续触发会排队，除非显式设置 `allowConcurrent: true`；
- **条件过滤**：每个 trigger 都支持 `when` 属性，是一个在触发时求值的 Pebble 表达式，为假就不触发；
- **来源识别**：一个 flow 挂多个 trigger 时，`{{ trigger._context.type }}`、`{{ trigger._context.id }}` 能告诉下游任务这次执行是被哪个 trigger 触发的；
- **失败处理**：trigger 失败默认不产生任何执行（避免过度触发），设置 `failOnTriggerError: true` 才会生成一次带完整日志的失败执行。

这套统一机制意味着：无论你后面加多少种 trigger 类型，运维和调试的心智模型都不需要跟着变。

## 4. 声明式 + 多编辑方式，为什么能同时服务工程师和业务方

因为 flow 的定义始终是同一份 YAML，YAML 编辑器、无代码编辑器、AI Copilot 编辑的是同一个对象并保持同步。[15] 这意味着：工程师可以直接写/审查 YAML 保证严谨性，业务方可以在无代码界面里调整 schedule 或参数而不需要理解底层实现——这是 Kestra 声明式设计相对纯代码框架（比如 Prefect 的装饰器模式）最大的不同：**flow 本身就是可以被多种角色共同拥有的对象，不是只暴露给写代码的人。**

## 5. 动手活动

> [!example] 动手活动：输出 `kestra-declarative-workflow-card.md`
>
> 列你要实现的一个自动化流程：它的 `id`/`namespace`/`tasks` 分别是什么；哪些步骤该用 flowable task（并行/分支/循环），哪些该用 runnable task（脚本/API/通知）；这个流程需不需要非工程角色参与调整。写一句结论：这份声明式定义是否足够让一个不写代码的人也看懂流程结构。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| flow 在做什么 | 声明任务、编排逻辑，并自动追踪修订版本 |
| flowable task 在做什么 | 承接并行/分支/循环这类编排行为 |
| runnable task 在做什么 | 承接真正的执行工作，可跨语言、跨插件 |
| trigger 的通用机制 | 并发控制、条件过滤、来源识别、失败处理，跨类型统一 |

## 引用

- [15] https://github.com/kestra-io/kestra — Kestra GitHub / README
- [33] https://kestra.io/docs/workflow-components/flow — Kestra flow concept doc
- [34] https://kestra.io/docs/workflow-components/triggers — Kestra triggers concept doc
- [35] https://kestra.io/docs/workflow-components/tasks — Kestra tasks concept doc

上一篇：[01 event-driven orchestration 的设计哲学](/iopanda-blog/ai/03-frameworks/06/31/)

下一篇：[03 schedules、integrations、events 与 automation](/iopanda-blog/ai/03-frameworks/06/33/)
