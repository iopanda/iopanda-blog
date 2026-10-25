---
title: "Checkpointer、thread_id 与持久化后端选型"
number: "03.01.07"
chapter: 3
chapterTitle: "Frameworks"
section: 1
sectionTitle: "Agent Frameworks"
group: "01 LangGraph"
created: 2026-09-03 15:35
author: "iopanda"
tags: ["course", "ai-agent", "framework", "langgraph", "checkpoint", "postgres", "sqlite"]
sourceId: "3.10.3.1 Agent Frameworks/01 LangGraph/04 Checkpointer、thread_id 与持久化后端选型"
---
# Checkpointer、thread_id 与持久化后端选型

> [前面我们已经反复说](/iopanda-blog/ai/03-frameworks/01/05/)：LangGraph 真正值钱的不是“图”，而是“图能活在生产里”。要让它活在生产里，checkpointer 就不是附属品，而是核心运行时。官方 `langgraph-checkpoint` README 直接把它定义为 LangGraph 的 persistence layer：在 every superstep 保存 graph state，从而支持 human-in-the-loop、memory between interactions、durable execution 等能力。[1][2] 更进一步，LangGraph 还单独提供 SQLite 和 Postgres 两类 checkpointer 实现，并且在 README 里把 `thread_id`、`checkpoint_id`、pending writes、serde 安全、数据库连接细节都写得很明确。[2][3][4] 这一章就专门讲这些“看起来像底层实现，其实会直接决定系统是否可靠”的问题。

**学习目标**：学完本章，你将能够——

1. 说出 checkpoint、thread_id、checkpoint_id、pending writes 在 LangGraph 里的不同职责；
2. 理解为什么持久化是运行时设计问题，不只是“选个数据库”；
3. 比较 InMemory / SQLite / Postgres 三类 checkpointer 的适用边界；
4. 解释 serde 安全、pending writes、delete_thread 为什么会直接影响生产系统；
5. 为一个多用户 Agent 系统做持久化后端选型。

## 1. 概念：checkpointer 是运行时账本，不是缓存层

`langgraph-checkpoint` README 对 checkpointer 的定义非常直接：
- 它是 LangGraph 的 persistence layer；
- 在 every superstep 保存 graph state；
- 支撑人审、跨交互记忆、durable execution。[2]

这意味着它不是“顺手落盘一下”，而是：
- 记录图每一步推进后的状态；
- 允许系统从某一步恢复；
- 允许不同会话、不同用户、不同线程彼此隔离；
- 允许未来做清理、审计和排障。

所以 checkpointer 更像运行时账本，而不像性能缓存。

## 2. thread_id / checkpoint_id：为什么 LangGraph 要显式建这个线程模型

官方 README 专门把 Thread 作为关键概念单列出来。[2]

含义是：
- `thread_id`：一串 checkpoints 属于哪个线程；
- `checkpoint_id`：线程中的某个具体快照点；
- graph invocation 时要在 config 的 configurable 段显式传入。

这个设计非常适合多用户、多会话、多轮任务系统：
- 同一张图可以服务很多线程；
- 每个线程维护自己的状态演化；
- 你可以恢复到线程中的某个历史点，而不是只能恢复最近一次。

工程上这非常重要。很多团队一开始只是想做聊天会话，最后才发现：
- 会话隔离
- 多租户状态
- 恢复历史点
- 清理某个用户数据
这些需求都会逼你重新发明一套线程模型。LangGraph 是直接把它做成框架契约。

## 3. pending writes：为什么它是最容易被忽略、却极其关键的概念

checkpoint README 对 pending writes 的解释非常关键：[2]

- 当某个 superstep 中有节点失败；
- 其他节点已经成功完成；
- LangGraph 会保存这些已成功节点的 pending checkpoint writes；
- 这样恢复时不必重跑那些已经成功的节点。

这解决的是一个很现实的问题：**部分成功怎么处理。**

没有 pending writes 时，系统通常只有两种很差的选择：
1. 全部回滚并重跑；
2. 业务代码里自己记哪些节点跑过。

前者浪费，后者混乱。pending writes 的存在，说明 LangGraph 在认真处理“同一步里局部成功、局部失败”的恢复语义。

对于高成本工具调用、慢速外部接口、带副作用节点，这一点尤其值钱。

## 4. serde 安全：为什么 checkpoint 反而可能变成攻击面

checkpoint README 和 SQLite/Postgres README 都反复提醒：
- 默认 serializer 允许任意 Python type 反序列化；
- 新应用建议设置 `LANGGRAPH_STRICT_MSGPACK=true` 或显式限制 `allowed_msgpack_modules`。[2][3][4]

这非常重要，因为很多团队会以为：
- checkpoint 只是内部数据；
- 数据库安全了就行。

但框架明确指出：如果 checkpoint 数据被污染，反序列化本身都可能成为代码执行风险。这不是 LangGraph 独有问题，而是任何带对象反序列化的系统都该警惕的问题。LangGraph 值得肯定的地方，是它在 README 里公开把这件事说清楚了。

对架构师来说，这意味着：持久化层不只是可用性问题，还是安全边界问题。

## 5. InMemory / SQLite / Postgres：三种后端本质上服务三种阶段

### 5.1 InMemorySaver

适合：
- 本地实验
- 单进程调试
- 单元测试

优点：简单、零部署。

缺点：
- 进程结束即丢；
- 不适合真实 durability；
- 多进程/多实例不可共享。

### 5.2 SQLite

README 明确说：适合 local development、testing、lightweight deployments，并支持 sync/async。[3]

适合：
- 单机部署
- 本地原型
- 中小规模内部工具
- 较轻量的演示服务

优点：
- 部署简单；
- 相比内存版已经有真实持久化；
- 支持异步实现。

缺点：
- 并发与扩展能力有限；
- 不是典型多实例生产主后端。

### 5.3 Postgres

README 明确定位：用于 durable, long-running workflows and agents。[4]

适合：
- 多用户生产服务
- 长流程与审计要求高的系统
- 多实例部署
- 真正需要 durability 的 Agent 平台

优点：
- 更适合生产持久化；
- 多租户、多线程、多实例更自然；
- 能更稳地承接恢复、审计和历史查询。

代价：
- 运维成本更高；
- 首次使用需要 `.setup()`；
- 连接参数、行工厂等细节要正确处理。

## 6. 为什么 Postgres README 连连接参数都要管

Postgres README 特别强调：
- 首次要 `.setup()` 建表；
- 手动连接时要 `autocommit=True`；
- 要 `row_factory=dict_row`；
- 否则会出现表未持久、读取行时报 `TypeError` 等问题。[4]

这看起来像实现细节，其实很能说明一个框架是否真的关心生产使用。很多项目文档只说“支持 Postgres”；LangGraph 则把最容易踩坑的运维细节直接写进 README。对开发者与架构师，这种细节比营销文案重要得多。

## 7. `delete_thread()`：为什么清理能力和保存能力一样重要

checkpoint 接口要求实现 `.delete_thread()`。[2] 这件事常被忽略，但非常关键：
- 多用户系统需要删除某个会话/某个用户的历史；
- 调试和测试环境需要清理脏状态；
- 合规要求可能要求删除某些运行痕迹。

如果一个系统只会存不会删，所谓“记忆能力”最后很可能会变成治理风险。这一点和 [数据治理与隐私](/iopanda-blog/ai/01-models/07/01/) 的结论完全一致：**可删除性是能力，不是善后。**

## 8. 给开发者和架构师的后端选型建议

| 场景 | 建议后端 | 理由 |
|---|---|---|
| 本地实验 / 教学 demo | InMemory | 快速、零配置 |
| 本机长期运行的小工具 | SQLite | 轻量、有真实持久化 |
| 单机内网服务 | SQLite 或 Postgres | 看并发与治理要求 |
| 多用户生产 Agent | Postgres | 线程隔离、历史管理、durability 更稳 |
| 高审计/高恢复要求 | Postgres | 更适合作为正式运行账本 |

一句话：**先问你在解决“调试方便”还是“运行可靠”，再决定后端。**

## 9. 动手活动：为课程助教 Agent 选 checkpointer

> [!example] 动手活动：输出 `langgraph-checkpointer-selection.md`
>
> **目标**：为课程助教 Agent 选一套 checkpoint 后端，并解释为什么。
>
> **步骤**：
> 1. 列场景：本地开发、单机测试、内网试运行、正式多用户；
> 2. 对每个场景写出 thread_id 该如何设计；
> 3. 判断是否需要从某个历史 checkpoint 恢复；
> 4. 判断是否需要 delete_thread 以满足数据清理；
> 5. 给出 InMemory / SQLite / Postgres 的阶段性选择。
>
> **完成标准**：你能清楚说明“为什么今天用 SQLite，什么时候必须升 Postgres”，而不是只说“哪个好”。

## 10. 边界与排错

- **误区一：checkpoint 就是缓存。** 不对，它是运行时账本和恢复语义的一部分；
- **误区二：只存最近状态就够了。** 历史 checkpoint 对恢复、排障、回放都很重要；
- **误区三：不重视 pending writes。** 局部成功恢复会因此变得昂贵而混乱；
- **误区四：反序列化默认安全。** checkpoint 数据层也可能是攻击面；
- **误区五：SQLite 跑通了就代表可生产。** 跑通和多用户耐用是两回事；
- **误区六：会存就行，不需要删。** 不会删的持久化最终会变成治理负债。

## 11. 总结

| 关键问题 | 一句话 |
|---|---|
| checkpointer 是什么 | LangGraph 的 persistence layer，在每个 superstep 保存图状态 |
| thread_id / checkpoint_id 是什么 | 线程隔离与历史恢复点的显式模型 |
| pending writes 解决什么 | 同一步局部成功时，恢复不必重跑已成功节点 |
| serde 安全为什么重要 | checkpoint 数据污染可能转化为反序列化风险 |
| SQLite 适合什么 | 本地开发、测试、轻量部署 |
| Postgres 适合什么 | 生产级、长流程、多用户、强 durability 场景 |

**思考题**：为什么一个 Agent 系统即使今天只有单用户、低并发，也不能只从“现在够不够用”去选 checkpointer？哪些未来需求会让“当初图省事”的后端选择变成昂贵迁移？

> [!note] 参考答案
> 因为 checkpointer 不只是性能组件，而是运行时模型的一部分：它决定线程隔离、恢复点、删除策略、局部成功处理和安全边界。今天单用户不代表未来不会出现多会话、人工审批、长时任务、历史回放、合规删除和多实例部署。一旦这些需求出现，原本为了省事选的后端就可能把迁移成本抬得很高。更好的做法是按阶段选型，但从第一天就按 thread、delete、恢复和安全语义去设计。

## 引用

- [1] https://github.com/langchain-ai/langgraph — LangGraph GitHub
- [2] https://github.com/langchain-ai/langgraph/tree/main/libs/checkpoint — LangGraph checkpoint README
- [3] https://github.com/langchain-ai/langgraph/tree/main/libs/checkpoint-sqlite — LangGraph checkpoint sqlite README
- [4] https://github.com/langchain-ai/langgraph/tree/main/libs/checkpoint-postgres — LangGraph checkpoint postgres README

上一篇：[03 MessagesState、ToolNode 与 create_react_agent](/iopanda-blog/ai/03-frameworks/01/06/)——高层预构件解决了常见模式的起步问题；本篇下钻到生产里最关键的持久化语义。

下一篇：[05 Channels、Command、子图与高级控制流](/iopanda-blog/ai/03-frameworks/01/08/)——持久化只是开始，下一篇继续下钻 LangGraph 更像系统运行时的高级控制流语义。
