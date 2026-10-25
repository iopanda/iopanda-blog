---
title: "schedules、integrations、events 与 automation"
number: "03.06.33"
chapter: 3
chapterTitle: "Frameworks"
section: 6
sectionTitle: "Workflow Orchestration Frameworks"
group: "3.10.3.6.5 Kestra"
created: 2026-09-09 11:04
author: "iopanda"
tags: ["framework", "workflow", "orchestration", "kestra", "events", "automation"]
sourceId: "3.10.3.6 Workflow Orchestration Frameworks/3.10.3.6.5 Kestra/03 schedules、integrations、events 与 automation"
---
# schedules、integrations、events 与 automation

> 如果第 01、02 篇讲的是“Kestra 为什么要统一调度和事件驱动”，这一篇讲清楚具体怎么统一：schedule trigger 怎么按时间跑，webhook/polling/realtime trigger 怎么按事件跑，插件生态怎么把“集成”变成声明式的一部分，以及 Pause task 怎么把人也变成流程里的一个节点。[34][37][15]

**学习目标**：学完本章，你将能够——
1. 理解 schedule trigger 与三类事件驱动 trigger（webhook/polling/realtime）的差异；
2. 说出插件生态如何把跨系统集成变成声明式配置，而不是手写对接代码；
3. 理解 human-in-the-loop 审批（Pause/HumanTask）如何被正式建模进流程；
4. 判断一个自动化需求该用哪种 trigger 组合，是否需要人工审批节点；
5. 为系统写一张 kestra-automation card。

## 1. schedule trigger：按时间节奏跑

**Schedule trigger** 的定义很直接：「runs a flow on a cron schedule with optional calendar conditions」。[34] 用 `@hourly` 这类 cron 表达式即可，流程内可以通过 `{{ trigger.date }}` 拿到本次触发的时间，但这个值只在 Schedule trigger 真正触发执行时才会被填充。[34]

## 2. 三类事件驱动 trigger：webhook、polling、realtime

事件驱动 trigger 不按时钟跑，而是对外部发生的事情做反应：[34]
- **Webhook trigger**：「runs a flow in response to an inbound HTTP request」，外部系统通过一个安全 URL 触发执行，还能用 `when` 表达式过滤请求体（比如检查 `trigger.body`）；
- **Polling trigger**：「runs a flow when new data is detected in an external system」，比如 FTP 上出现新文件、数据库出现新行；
- **Realtime trigger**：「runs a flow with millisecond latency when an event arrives from a streaming source」，适合 Kafka、MQTT 这类流式系统；
- **插件类 trigger**（如 S3 trigger、SQS/Kafka 消息触发）：基于文件到达事件或消息队列的新消息触发。

一个很实用的细节：对这类事件驱动 trigger，Kestra 会「automatically downloads」相关文件或消息「to internal storage」，并通过 `{{ trigger.uri }}` 直接暴露出来，不需要额外写一个任务去下载。[34]

## 3. 插件生态：把“集成”本身变成声明式的一部分

README 强调 Kestra 有「rich ecosystem of plugins that empower you to run tasks anywhere and code in any language, including Python, Node.js, R, Go, Shell, and more」。[15] 结合上一篇讲的 `type` 字段机制——任务类型就是插件贡献的类名，触发器类型也是同样的插件机制。这意味着“接入一个新系统”这件事，往往不是写一段新的对接代码，而是在 YAML 里引用对应插件提供的 task/trigger 类型并填参数。

## 4. human-in-the-loop：Pause task 把审批变成正式的流程节点

Kestra 用 `Pause` 任务类型（`io.kestra.plugin.core.flow.Pause`）把人工审批做成一等流程节点：「Pause workflows for manual inspection before resuming」。[37] 围绕这一点，官方给出四个支柱：[37]
- **Pause/Resume**：暂停等待人工检查，再恢复；
- **Dynamic Inputs**：`onResume` 块定义审批人要填的结构化输入（布尔、字符串、下拉选项），而不是自由文本；
- **Approval Chains**：把审批路由给特定用户或团队；
- **Audit Logs**：记录谁在什么时候批准/拒绝了什么，以及理由。

持久性也很关键：「Kestra persists execution state (including PAUSED state) in the database, so a paused execution survives server restarts and stays PAUSED until you manually resume it」——一个审批可以挂几天甚至几周都不会丢。[37] 企业版的 `HumanTask` 还能在 `Pause` 之上加访问控制，把审批权限精确限定到指定用户或 RBAC 分组。[37]

审批之后的分支也是标准做法：用 `If` 任务检查 `onResume` 里捕获的决定（比如 `approved` 是否为真），走向不同的下游逻辑；配合 Slack/Teams/Email 通知，附上直达该次执行的链接，让对的人知道有审批在等着。[37]

## 5. 三者合起来是什么

- schedule 回答“按什么时间节奏自动跑”；
- webhook/polling/realtime 回答“外部系统发生了什么该立刻反应”；
- Pause/HumanTask 回答“流程走到这一步该不该先等人确认”。

三者叠加，才是 Kestra 意义上的“automation”——不是单纯的定时任务，也不是单纯的事件响应，而是把时间、外部事件、人工判断都收进同一份声明式流程里。

## 6. 动手活动

> [!example] 动手活动：输出 `kestra-automation-card.md`
>
> 列你的自动化需求里哪些该用 schedule、哪些该用 webhook/polling/realtime、哪些环节需要人工审批（以及审批人是谁）。写一句结论：你现在的“集成”和“审批”逻辑，是分散在多套工具里，还是已经收进同一份声明式流程。

## 7. 总结

| 关键问题 | 一句话 |
|---|---|
| schedule trigger 在解决什么 | 按 cron 节奏自动触发 |
| webhook/polling/realtime 在解决什么 | 对 HTTP 请求、外部数据变化、流式事件做出反应 |
| 插件生态在解决什么 | 把跨系统集成变成声明式引用，而不是手写对接代码 |
| Pause/HumanTask 在解决什么 | 把人工审批变成正式、可持久化、可审计的流程节点 |

## 引用

- [15] https://github.com/kestra-io/kestra — Kestra GitHub / README
- [34] https://kestra.io/docs/workflow-components/triggers — Kestra triggers concept doc
- [37] https://kestra.io/docs/use-cases/approval-processes — Kestra approval processes use case doc

上一篇：[02 flows、triggers、tasks 与 declarative workflow](/ai/03-frameworks/06/32/)

下一篇：[04 运营、扩展性与工程边界](/ai/03-frameworks/06/34/)
