---
title: "Agent 间通信与协议"
number: "02.06.05"
chapter: 2
chapterTitle: "Agents"
section: 6
sectionTitle: "Multi-Agent Systems"
group: ""
created: 2026-09-03 05:15
author: "iopanda"
tags: ["course", "ai-agent", "multi-agent"]
sourceId: "3.10.2.6 Multi-Agent Systems/04 Agent 间通信与协议"
---
# Agent 间通信与协议

> 前三章把「谁跟谁协作」讲完了:编排者派活、流水线接力、辩论对撞。可无论哪种拓扑,协作都发生在**消息传递**上——编排者怎么把子任务递给 worker?worker 的结果以什么形状返回?对方没回应、回了个乱格式、或两个 Agent 互相等对方,怎么办?本章是 02.06 的第四课,回答多 Agent 系统的血管问题:Agent 之间**传什么**(消息文本、结构化结果、共享状态、工具调用权)、通信设计四要素(schema、超时、失败传播、死锁),以及行业标准分工——**MCP 让 Agent 接工具,A2A 让 Agent 找 Agent**。读完你会给自己的两个 Agent 定义消息 schema,并跑出一条可审计、可排错的协作轨迹。

**学习目标**:学完本章,你将能够——

1. 说出 Agent 间传递的四种内容(文本/结构化结果/共享状态/工具调用权)及各自适用;
2. 为一次协作定义消息 schema,用代码在源头拦截缺字段的非法消息;
3. 解释超时、失败传播、死锁三类通信问题的机理与对策;
4. 说清 A2A 与 MCP 的分工互补:A2A(Google 2025 发布,已捐 Linux Foundation)互联 Agent,MCP 接入工具;
5. 运行两 Agent 协作 Demo,打印完整轨迹并演示「失败→同 task_id 重试」与「超时→上报人工」。

## 1. 概念:Agent 之间到底传什么

| 传什么 | 形态 | 课程助教例子 | 优点 | 代价/风险 |
|---|---|---|---|---|
| 自由文本消息 | 自然语言段落 | 辩论发言、会话式闲聊 | 灵活,无需预定义结构 | 下游要解析,易跑题、易被注入(02.02/06 章) |
| 结构化结果 | schema 化 JSON/dict | 02 章 worker 返回的 `{"ok": true, "scores": [85, 90, 78]}` | 可校验、可版本化,失败源头暴露 | 要预先设计 schema 并维护版本 |
| 共享状态 | 同一份黑板/存储 | 03 章辩论的公共论据板;02 章编排者的 `carried` | 全体可见,不必逐条转发 | 可见性难控,并发写会冲突 |
| 工具调用权 | 授权对方调自己的工具 | 编排者把「查档案」委托给检索员 | 能力复用,不必复制实现 | 权限边界风险(02.04/06 章) |

## 2. 为什么需要:没有通信设计的多 Agent 是一群哑巴

- 02/03 章的拓扑决定「谁跟谁说」,通信设计决定「说了对方懂不懂、收没收到、坏了怎么办」。缺任何一环协作都会断:

| 缺什么 | 表现 | 例子 |
|---|---|---|
| 消息 schema | 下游靠猜:把散文当结果解析 | worker 返回一段人话,编排者还要再调一次模型去理解 |
| 超时 | 一个 Agent 卡死,全队无限挂起 | 检索工具没响应,编排者等一辈子 |
| 失败传播 | 错误被「美化」成成功继续流 | 查询失败,worker 编个数字交差——比直接报错更糟 |
| 死锁规避 | A 等 B、B 等 A,互相等待永不返回 | 两个 Agent 同步互要对方结果 |

- 跨团队现实:02/03 章的 Agent 都在一个进程里,函数随手调用;生产环境的 Agent 由不同团队、不同框架开发、部署在不同服务上,没有**共同协议**就没有互操作——这正是 A2A(2025-04 Google 发布,2025-06 捐赠 Linux Foundation)出现的背景。一句话:**拓扑决定对不对口,通信协议决定通不通**;先定 schema 再谈传输,别让消息在「都懂但都没定义」的默契里裸奔。

## 3. 作用:通信层的位置与 A2A/MCP 分工

- MCP 不在 Agent 之间传话,它解决「单个 Agent 用什么统一方式调用工具」。两者放一起看,分工立即清晰:

| 维度 | MCP(Model Context Protocol) | A2A(Agent2Agent Protocol) |
|---|---|---|
| 解决什么 | Agent ↔ 工具/数据 | Agent ↔ Agent(跨框架互联) |
| 角色模型 | host(客户端)连 server(工具端) | client agent 委托 remote agent |
| 发现机制 | server 声明工具列表 | Agent Card:暴露于 `/.well-known/agent.json` |
| 消息格式 | JSON-RPC 2.0(initialize/tools/call) | JSON-RPC 2.0 over HTTP + SSE 流式 |
| 任务模型 | 一次工具调用即返回 | 任务生命周期:submitted→working→completed/failed |
| 治理 | Anthropic 2024 年开源 | Google 2025-04 发布,2025-06 捐 Linux Foundation |
| 关系 | A2A 里的 Agent 内部仍用 MCP 接自己的工具 | 正交互补:接工具用 MCP,找 Agent 用 A2A |

- A2A 的三个标准动作:**发现**(读对方 Agent Card)→ **委托**(发 task)→ **跟踪**(轮询或 SSE 等任务到终态)。Agent Card 就是 Agent 的「名片 + 说明书」:没有它,两个 Agent 连「你会干什么、怎么找你」都无从谈起。

## 4. 详细介绍:通信设计四要素

### 4.1 消息 schema:先定形状再开口
- 一条消息至少携带:msg_id(全局唯一,去重与追踪)、type(request/response/event)、sender、receiver、task_id(关联到哪个任务)、payload(业务载荷);加 timestamp 便于审计(02.07):

```json
{"msg_id": "m-7f3a9c", "type": "request", "sender": "planner", "receiver": "grader", "task_id": "t-102", "payload": {"answer": "..."}}
```

- 与 02 章 `require()` 一脉相承:缺字段在源头抛错,坏消息不进信道。schema 要**版本化**:改字段带版本号,旧方至少「忽略未知字段」而非崩掉。实现工具随意:JSON Schema、pydantic、proto 都行,本章用字段表最直观。

### 4.2 超时与重试
- 每次请求都带 deadline——「等多久算失败」是协议的一部分。超时后怎么动取决于任务**是否幂等**:纯查询可放心重试;有副作用的重试前必须先确认上次未生效,否则会重复扣款式 bug。重试要退避(0.5s→1s→2s)且封顶(如 3 次),**重试沿用同一 task_id** 供接收方去重——正是 Demo 场景 2 演示的。

### 4.3 失败传播
- 错误必须**向上传、带原因**,禁止就地美化。失败响应至少带:status=error、code(机器可判)、message(人可读)、retryable(能否重试)、from_task(溯源链);由编排者(02 章)决定重试 / 换策略 / 整体失败并上报。最危险的不是失败,是**假成功**:worker 没查到数据却编个数字交差,错误绕过所有闸门直达学员。Demo 里你会看到失败如何沿轨迹传播、重试如何带着同一个 task_id 回来。

### 4.4 死锁与活锁
- **死锁**:同步调用成环——A 等 B 的结果,B 在等 A 的结果,谁都等不到。对策三条:拓扑**禁环**(消息总经编排者中转,保持 02 章树状)、**同步改异步**(发出请求即返回,结果到达再回调)、**全局超时兜底**(任何等待都有上限,超时必有人退出)。
- **活锁**:双方都在重试却永远错过(同时退避又同时重试)——退避加随机抖动(jitter)可破。共享状态并发写用「版本号 + 最后写入胜出」,防止双 Agent 同时改一份学员档案。

## 5. 动手活动:两 Agent 消息 schema 与协作轨迹

> [!example] 动手活动:agent_channel.py——schema、超时、失败重试一次看全
>
> **目标**:运行 `agent_channel.py`,让「规划师(请求方)」与「批改员(应答方)」经带 schema 校验的信道完成一次批改,打印完整轨迹;再把批改员改成「首次必失败」与「慢响应」,观察同 task_id 重试与超时上报。
> **步骤**:
> 1. 保存并运行 `agent_channel.py`(纯 Python 3 标准库,离线可跑;Agent 内部用规则函数模拟模型调用,真实场景换成 01.04 的 LLM 循环);
> 2. 对照输出,把每条消息(msg_id/task_id/status)画成时序图,标注收发双方;
> 3. 把场景 3 的 `latency=0.5` 改回 `0.01`,对比超时消失;把 `timeout=0.2` 改小,观察更敏感的超时;
> 4. 删掉请求 payload 的一个字段再跑,观察 Channel 在源头抛 ValueError 拦截;
> 5. 在 `reports/channel-notes.md` 记录:批改员若发布成 A2A 服务,Agent Card 至少要声明哪几项;若走 MCP,它应暴露成什么工具。
> **完成标准**:正常场景看到一对 request/completed 入轨;失败场景看到 error 响应 + 同 task_id 重试后 completed;超时场景看到 pending-human 决策与迟到响应留痕;非法消息被 schema 拦截。

```python
# agent_channel.py —— 04 章动手:两 Agent 消息 schema 与协作轨迹(纯 Python 3 标准库)
import queue
import threading
import time
import uuid

# 消息 schema:「必须携带」字段,缺一个 = 非法消息;result 是可选载荷(error 响应没有它)
SCHEMA = {
    "request":  ("msg_id", "type", "sender", "receiver", "task_id", "payload"),
    "response": ("msg_id", "type", "sender", "receiver", "task_id", "status"),
}

def new_id():
    return uuid.uuid4().hex[:8]

def validate(msg, kind):
    """返回缺失字段列表,空 = 合法(呼应 02 章 require())"""
    return [f for f in SCHEMA[kind] if f not in msg]
class Channel:
    """消息信道:中转、校验并归档一切消息——轨迹(trace)的唯一真相源"""
    def __init__(self):
        self.trace = []        # 完整协作轨迹(02.07 可观测性雏形)
        self.boxes = {}        # receiver -> 消息队列
        self.lock = threading.Lock()

    def post(self, msg, kind):
        missing = validate(msg, kind)
        if missing:
            raise ValueError("[schema 拦截] %s 缺字段: %s" % (kind, missing))
        self.trace.append(msg)
        with self.lock:
            print("[%s] %-8s -> %-7s task=%s status=%s" % (
                kind, msg["sender"], msg["receiver"], msg["task_id"],
                msg.get("status", "send")))
        self.boxes.setdefault(msg["receiver"], queue.Queue()).put(msg)

    def receive(self, name, timeout):
        """收信:超时返回 None,由调用方决定 重试/降级/上报人工"""
        try:
            return self.boxes.setdefault(name, queue.Queue()).get(timeout=timeout)
        except queue.Empty:
            return None

class GraderAgent:
    """应答方(批改员):批改第三章主观题;latency 模拟耗时,fail_times 模拟前 N 次必失败"""
    def __init__(self, name="grader", latency=0.01, fail_times=0):
        self.name, self.latency, self.fail_times = name, latency, fail_times

    def grade(self, payload):
        text = payload.get("answer", "")
        if "索引" in text and "写操作" in text:
            return {"score": 9, "comment": "要点完整,例证恰当"}
        return {"score": 6, "comment": "缺索引代价(写操作)的讨论"}

    def handle(self, request):
        """构造信封字段齐全的完整响应;在独立线程中执行,模拟远端服务"""
        time.sleep(self.latency)
        resp = {"msg_id": new_id(), "type": "response", "sender": self.name,
                "receiver": request["sender"], "task_id": request["task_id"]}
        if self.fail_times > 0:
            self.fail_times -= 1
            resp.update({"status": "error", "code": "E_SERVICE_BUSY",
                         "message": "批改服务瞬时不可用", "retryable": True})
        else:
            resp.update({"status": "completed", "result": self.grade(request["payload"])})
        return resp

class PlannerAgent:
    """请求方(规划师):发出批改请求,处理 超时上报 / 失败同 task_id 重试"""
    def __init__(self, name="planner", timeout=0.2, max_retry=2):
        self.name, self.timeout, self.max_retry = name, timeout, max_retry

    def ask(self, channel, responder, payload):
        task_id = new_id()     # 一个任务一个 ID:重试沿用,接收方据此去重
        for attempt in range(self.max_retry + 1):
            request = {"msg_id": new_id(), "type": "request", "sender": self.name,
                       "receiver": responder.name, "task_id": task_id,
                       "payload": payload}
            channel.post(request, "request")
            threading.Thread(
                target=lambda: channel.post(responder.handle(request), "response"),
                daemon=True).start()
            resp = channel.receive(self.name, self.timeout)
            if resp is None:
                print("    -> %s: 等 %.2fs 超时,上报人工(task=%s)" % (self.name, self.timeout, task_id))
                return {"final": "pending-human", "task_id": task_id}
            if resp["status"] == "error":
                if resp.get("retryable") and attempt < self.max_retry:
                    print("    -> %s: 失败(%s),同 task_id 重试第 %d 次" % (self.name, resp["code"], attempt + 1))
                    continue
                print("    -> %s: 不可重试,终止上报: %s" % (self.name, resp["message"]))
                return {"final": "failed", "task_id": task_id}
            print("    -> %s: 完成,评分=%s" % (self.name, resp["result"]["score"]))
            return {"final": "completed", "result": resp["result"], "task_id": task_id}

if __name__ == "__main__":
    bus, planner = Channel(), PlannerAgent(timeout=0.2)
    payload = {"answer": "索引相当于目录,能少读数据块;但插入、更新要维护索引,写操作时反而慢",
               "learner": "xiaoming"}

    def demo(title, grader):
        print("== %s ==" % title)
        out = planner.ask(bus, grader, payload)
        print("决策: %s\n" % out["final"])

    demo("场景 1:正常协作(轨迹见上)", GraderAgent(latency=0.01))
    demo("场景 2:首次失败 -> 同 task_id 重试成功", GraderAgent(latency=0.01, fail_times=1))
    demo("场景 3:响应太慢 -> 超时上报人工", GraderAgent(latency=0.5))
    time.sleep(0.7)  # 等迟到的响应打印完,展示超时后到达的消息仍入轨

    print("== 场景 4:schema 拦截非法消息 ==")
    bad = {"msg_id": new_id(), "type": "request", "sender": "planner",
           "receiver": "grader", "task_id": new_id()}   # 故意缺 payload
    try:
        bus.post(bad, "request")
    except ValueError as err:
        print("被拦截: %s" % err)
    print("\n本次会话共 %d 条消息入轨(非法消息 0 条)" % len(bus.trace))
```

## 6. 边界与排错

| 症状 | 原因 | 处理 |
|---|---|---|
| 下游拿到消息却解析失败 | 没定 schema 或版本不一致 | 统一 schema + 版本号;非法消息源头拦截(本节 Channel) |
| 一个 Agent 卡住,全队不动 | 无超时或超时太长 | 每个请求带 deadline;按幂等性决定重试或上报 |
| 重试后任务重复执行 | 重试没用同一 task_id / 接收方没去重 | 重试沿用 task_id;接收方按任务 ID 幂等去重 |
| 两个 Agent 互相等死 | 同步调用成环(死锁) | 拓扑禁环;同步改异步;全局超时兜底 |
| worker 失败,下游却拿到「成功」 | 失败被就地美化(假成功) | error 响应带 code/message/retryable,错误向上传 |

- 边界提醒:本章协议是「你进程内的约定」,够课程助教用;一旦 Agent 跨团队、跨服务部署,就把约定升级成 A2A 的 Agent Card + 任务生命周期、工具接入统一到 MCP——**先私有协议跑通,再谈标准协议互操作**,别为一天的 Demo 引入整套 A2A 栈。

## 7. 总结

| 概念 | 一句话 |
|---|---|
| 传什么 | 文本(松)/结构化结果(可校验)/共享状态(黑板)/工具调用权(最强也最险) |
| schema | 先定形状再开口;缺字段源头拦截;版本化演进 |
| 超时与重试 | deadline 是协议一部分;幂等才重试,重试沿用 task_id |
| 失败传播 | 错误向上传、带原因,禁止假成功 |
| 死锁 | 禁环 + 异步 + 全局超时;活锁靠退避加抖动 |
| 行业协议 | MCP 接工具(Agent↔工具),A2A 互联(Agent↔Agent),正交互补 |

**思考题**:为什么「重试」必须配合「幂等」,否则比不重试更危险?批改员评分 schema 若从「0~10 整数」改成「A/B/C 等级」,已上线的规划师该如何平滑过渡,而不是一夜之间全部解析失败?

> [!note] 参考答案
> 不幂等的操作(已发通知、已扣课时)重试会执行两次,重复副作用比一次失败更糟;所以重试前要么确认上次未生效,要么接收方按 task_id 去重——「同一任务只生效一次」就是幂等的代码表达。schema 升级要兼容过渡:新字段可选、旧字段保留,接收方按版本号分支解析(未知字段忽略),先让新老消息共存,待旧格式占比归零再下线旧版——与 02.05 给档案表加列不删旧列同理:演进不革命。

## 引用

- [A2A Protocol 官方规范(Agent2Agent,Linux Foundation 治理)](https://a2a-protocol.org/latest/)
- [Google Developers Blog:Announcing the Agent2Agent Protocol(2025-04)](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/)
- [Model Context Protocol(MCP)官方文档](https://modelcontextprotocol.io/)
- [GitHub:a2aproject/A2A(协议实现与 SDK)](https://github.com/a2aproject/A2A)

上一篇:[协作模式流水线与辩论](/ai/02-agents/06/04/)——03 章定了协作形状(接力/对撞),本章补上血管:schema、超时、失败传播与死锁;同进程的约定跑通后,下一章看框架怎么替你管状态、循环与检查点。

下一篇:[多 Agent 框架实践](/ai/02-agents/06/06/)——LangGraph 的状态图、AutoGen 的会话式、还是自研循环?下一章用框架重写 02 的编排 Demo,比较复杂度的真实差异。
