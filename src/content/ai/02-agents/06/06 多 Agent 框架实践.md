---
title: "多 Agent 框架实践"
number: "02.06.06"
chapter: 2
chapterTitle: "Agents"
section: 6
sectionTitle: "Multi-Agent Systems"
group: ""
created: 2026-09-03 05:20
author: "iopanda"
tags: ["course", "ai-agent", "multi-agent"]
sourceId: "3.10.2.6 Multi-Agent Systems/05 多 Agent 框架实践"
---
# 多 Agent 框架实践

> 04 章把通信层补齐后,课程助教团队该有的「设计零件」都齐了:角色、拓扑、消息 schema、超时与重试——全是你手写的。可零件越多,越会撞上「执行层」的工程问题:worker 的中间结果散落各处、循环与重试靠零散的 if/for、进程一断全部重来、想插一道人工闸门无处下手。本章是 02.06 Multi-Agent Systems 的第五课,回答:框架值不值得用、LangGraph 状态图 / AutoGen 会话式 / 自研循环三条路线差在哪、何时选谁;读完你会用 LangGraph 重写 02 章的编排 Demo,亲手比较框架版与自研版的复杂度差异。

**学习目标**:学完本章,你将能够——

1. 说出 LangGraph、AutoGen、自研三条路线的核心抽象(状态图/会话式/手写循环)与一句话哲学;
2. 解释为什么状态管理、循环控制、检查点、人工介入四件事让框架值得考虑;
3. 读懂并运行用 LangGraph 重写的「检索员+计算员+回答员」Demo,指出它与 02 章自研版的结构差异;
4. 用选型表判断一个具体需求该上 LangGraph、AutoGen 还是继续手写;
5. 说清框架不解决什么(拓扑设计、system prompt、工具、记忆、评测),避免「为框架而框架」。

## 1. 概念:三条路线

- **LangGraph(状态图)**:把多 Agent 流程显式画成一张图——节点是 worker 函数,边是数据与控制的流向,全部状态收进一张共享表 State;LangChain 团队开源,Python/JS 双实现。哲学:**控制流看得见、可编译、可回放**。
- **AutoGen(会话式)**:Agent 是「能对话的角色」,协作靠它们在会话里轮转发言;微软出品,2025-01 的 0.4 版重写为事件驱动架构,2025-10 起与 Semantic Kernel 合并为 Microsoft Agent Framework(2026-04 发布 1.0 GA),AutoGen 进入维护模式,经典会话式 API 由社区分支 AG2 延续。哲学:**协作就是对话,角色自由发挥**。
- **自研(手写循环)**:像 02/04 章那样,plan() + for 循环 + dict 传参,信道自己写。哲学:**零依赖,每一行都懂**。
- 一个关键澄清:**02~04 章的拓扑与协议是「设计」,本章的框架是「执行载体」**——同一个编排者-工作者设计,自研版和 LangGraph 版都能实现,区别在工程能力与维护成本,不在「能不能跑」。

| 维度 | LangGraph | AutoGen 系(含 Agent Framework) | 自研 |
|---|---|---|---|
| 核心抽象 | 状态图:节点+边+State | 会话:可对话的 Agent 轮流发言 | 函数调用链 + 你的循环 |
| 控制流表达 | 边与条件边,编译期可查 | 发言轮转规则(顺序/终止条件) | 代码里的 if/for |
| 状态管理 | 显式 State,每步快照 | 会话历史 + 显式 memory | 自己传的 dict(02 章 carried) |
| 循环/重试 | 条件边回环,天然支持 | 靠对话规则与工具回调 | 手写 while/for + 退避 |
| 断点续跑 | checkpointer 内置,按 thread 存取 | 会话持久化 | 无,重跑 = 从头 |
| 人工介入 | interrupt() 挂起/恢复 | 人可随时以 Agent 身份发言 | 自己开输入通道 |
| 生态/语言 | LangChain 生态,Python/JS | 微软系,.NET/Python | 无依赖 |
| 适合谁 | 生产级、流程细、要审计 | 开放式多角色讨论 | 学习、原型、几十行搞定 |

## 2. 为什么需要:自研到第几步会痛

| 自研要解决的问题 | 自研的真实成本 | 框架给什么 |
|---|---|---|
| 状态管理 | 中间产物散落在 N 次函数返回里;想「每步状态可查」得自己造日志 | 显式 State,一次 invoke 返回完整快照 |
| 循环控制 | 重试、条件跳转、并行 fan-out 全靠手写,调用关系只能靠注释 | 条件边回环、节点 fan-out,声明即得 |
| 检查点 | 进程崩了想从第 2 步续跑?没有 | 一个 checkpointer 参数 + thread_id |
| 人工介入 | 04 章「上报人工」只是业务消息;真挂起等回复再续跑要自己搭 | interrupt() 一行挂起,resume 续跑 |
| 可观测雏形 | 自己埋点(02.07 会系统化) | 每节点输入输出自带快照与重放 |

- 反方观点同样要听:Anthropic 在工程博客里总结,见过最成功的系统大多不是复杂框架堆出来的,而是**简单可组合的模式**;判断标准不是「用没用框架」,而是**框架省下的工程时间是否大于学习与排错它的时间**。

## 3. 作用:框架管什么、不管什么

```
┌────────────────────────────────────────────┐
│ 设计层(框架不管,01~04 章自己定)              │
│   协作拓扑(编排者/流水线/辩论)+ 消息 schema   │
├────────────────────────────────────────────┤
│ 执行层(本章框架接管)                         │
│   状态流转 | 循环与条件边 | 检查点 | 人工介入  │
├────────────────────────────────────────────┤
│ 能力层(02.01/2/4/5 已备,框架调用不重写)   │
│   模型 | 工具(MCP) | 记忆 | 评测(02.07)  │
└────────────────────────────────────────────┘
```

- 框架接管「怎么把设计跑稳」;**设计本身(拆几个角色、传什么 schema、何时收尾)依然是你的活**——换框架不会自动治好 02 章说的「拆错任务」。排错提醒:框架的抽象层会遮蔽实际发给模型的 prompt/响应,对框架内部机制的错误假设是常见事故源(Anthropic 提醒),用框架前先确认你理解它在底层做什么。

## 4. 详细介绍:三条路线怎么选

### 4.1 LangGraph:把流程画成图

- 五件套速记:**State**(共享状态表)→ **Node**(节点,一个 worker 函数,读 State、返回要更新的字段)→ **Edge**(数据边)→ **Conditional Edge**(条件边,按返回值决定走哪)→ **Checkpointer**(检查点,按 thread_id 存取)。在此基础上,节点内调 interrupt() 即得人工介入。
- 循环 = 条件边指回上游节点;并行 = 一个节点 fan-out 到多个下游;失败 = error 进 State 由条件边分流(本章 Demo 演示)。02 章编排者的 plan() 拆解,在图里体现为「入口路由 + 条件边」;worker 的专属 system prompt 仍是各节点内部那次模型调用的 prompt——**框架不替你写角色卡**。

### 4.2 AutoGen 与它的继承者

- 经典形态(v0.2,教程里最常见):ConversableAgent(如 user_proxy、assistant)+ GroupChat,多个 Agent 轮流发言直到满足终止条件;代码类任务里由执行方把工具结果喂回对话。适合头脑风暴式探索:「谁先接话、聊几轮」交给对话本身。
- 演进时间线(截至 2026-09):0.4 事件驱动重写 → 2025-10 微软宣布 AutoGen 与 Semantic Kernel 合并为 Microsoft Agent Framework → 2026-04 v1.0 GA(保留 AutoGen 的轻量 Agent 抽象,补 SK 的生产级能力:原生 MCP、遥测、状态会话);AutoGen 进入维护模式,社区分支 AG2 延续经典会话式 API。
- 代价:控制流藏在「发言轮转」里——「为什么轮到 B、几轮停」不如状态图直观;要精确控制步骤时反而要写不少轮转配置。

### 4.3 自研:什么时候它是对的

- 02/04 章你已经在自研,而且学得值:框架隐藏的实现(状态合并、重试语义、schema 校验)你亲手写过一遍,读框架文档才不会「知其然不知其所以然」。
- 自研依然合理:教学与 Demo、总代码量一两百行内、无断点续跑需求、团队不想引入依赖。**止损线**:当你开始写「通用调度器」「可配置 DAG」「checkpoint 持久化」时,停下来——你正在重造框架,而且大概率不如它全。

### 4.4 选型表

| 你的情况 | 推荐 | 理由 |
|---|---|---|
| 流程复杂,要精确控制步骤/重试/并行,要审计与断点续跑 | LangGraph | 状态图显式化控制流,checkpointer/interrupt 开箱即用 |
| 开放式多角色讨论、头脑风暴、探索型任务 | AutoGen 系(或 Agent Framework) | 会话轮转天然支持自由发言;生产化看继承者 MAF |
| 单 Agent 内部多轮反思/自评(03 章辩论的轻量版) | 都不上 | 一个循环里两次调用即可,框架是浪费 |
| 学习原理 / 原型验证 / 总代码量小 | 自研 | 零依赖全可控;越止损线再迁移 |
| 要跨框架互操作(A2A)与接 MCP 工具 | 先查框架协议支持状态 | 04 章分工:接工具用 MCP、互联用 A2A,支持度各家不同 |

## 5. 动手活动:用 LangGraph 重写 02 章编排 Demo

> [!example] 动手活动:ta_langgraph.py——框架版编排 Demo
>
> **目标**:安装 LangGraph 并运行 ta_langgraph.py,得到与 02 章 orchestrator_workers.py 等价的答案;对比两版在状态、失败处理上的差异。
> **步骤**:
> 1. 安装:`pip install langgraph`(自动带 checkpoint 依赖);网络受限则跳到步骤 5 的离线降级;
> 2. 保存 ta_langgraph.py 并运行 `python3 ta_langgraph.py`,对照输出回答:三个节点各做了什么,invoke 返回的 State 快照与 02 章局部 carried 有何不同;
> 3. 观察失败案例:查无此学员不再抛 RuntimeError 中断进程,而是 error 进状态、条件边把它导向 END;把 route_after_retrieve 的 `end` 分支改成回环到 `retrieve`(模拟重试一次),对比 04 章你手写的重试循环;
> 4. 给 build_graph() 去掉 checkpointer 再跑,观察报错;把 thread_id 换新值再跑,观察状态相互隔离;在节点里加一句 `from langgraph.types import interrupt`,看看文档里 interrupt 怎么挂起等人;
> 5. (离线降级)不装依赖:按 retrieve → compute → answer 顺序直接调用三个纯函数,把返回 update 进同一份 dict——行为与 02 章等价;在 reports/framework-notes.md 记录:框架版哪一处最能体现「状态显式」?
> **完成标准**:联网环境跑出与 02 章一致的答案与快照;能说出自研版与框架版在「失败处理」「状态可查」上的至少两处差异;离线环境用顺序调用完成等价 Demo 并写出对比笔记。

```python
# ta_langgraph.py —— 05 章动手:用 LangGraph 重写 02 章「检索员+计算员+回答员」编排 Demo
# 运行前提:pip install langgraph(联网,会一并装好 checkpoint 依赖)
# 离线降级:三个节点函数均为纯 Python,不装依赖时按 retrieve -> compute -> answer
#           顺序直接调用、把每次返回 update 进同一份 state dict,即得与 02 章等价的行为。
from typing import TypedDict

from langgraph.graph import END, START, StateGraph

try:  # 兼容 LangGraph 新旧版本:MemorySaver 在新版本里叫 InMemorySaver
    from langgraph.checkpoint.memory import MemorySaver as Saver
except ImportError:
    from langgraph.checkpoint.memory import InMemorySaver as Saver

CLASS_AVG = 86.0  # 第三章班级平均分(教学统计)
GRADES = {        # 学员档案:{学员: 第三章三次练习成绩}(02.05 长期记忆的 dict 模拟)
    "xiaoming": [85, 90, 78],
    "xiaohong": [92, 88, 95],
}
DISPLAY = {"xiaoming": "小明", "xiaohong": "小红"}


class WorkState(TypedDict, total=False):
    """全图共享的显式状态:02 章里链式传递的 carried dict,在框架版里收敛成一张表"""
    question: str    # 学员原问
    learner_id: str  # 问的是谁
    scores: list     # 检索员产物
    avg: float       # 计算员产物
    gap: float       # 计算员产物(与班级平均分之差)
    answer: str      # 回答员产物
    error: str       # 任一步失败原因:失败进状态,而不是抛穿进程


def retrieve(state: WorkState) -> dict:
    """检索员节点:只查不算;真实场景换成一次带检索员 system prompt 的模型调用"""
    learner = state.get("learner_id") or ("xiaoming" if "我" in state.get("question", "") else "xiaohong")
    scores = GRADES.get(learner)
    if scores is None:
        return {"learner_id": learner, "error": "档案查无此学员: %s" % learner}
    return {"learner_id": learner, "scores": scores}


def route_after_retrieve(state: WorkState) -> str:
    """条件边:有 error 走 end(错误留在状态里可查),否则走 compute"""
    return "end" if state.get("error") else "compute"


def compute(state: WorkState) -> dict:
    """计算员节点:只算不查;算平均分与班级差距"""
    scores = state["scores"]
    avg = sum(scores) / len(scores)
    return {"avg": round(avg, 1), "gap": round(avg - CLASS_AVG, 1)}


def answer(state: WorkState) -> dict:
    """回答员节点:只组织语言;真实场景此处调用 LLM 生成个性化评语"""
    name = DISPLAY[state["learner_id"]]
    avg, gap = state["avg"], state["gap"]
    trend = "高于" if gap >= 0 else "低于"
    return {"answer": "%s,你第三章三次练习的平均分是 %s 分,%s班级平均分(%s 分)。"
                      % (name, avg, trend, CLASS_AVG)}


def build_graph():
    """把 02 章 plan() + for 循环改写成「图」:节点 = worker,边 = 数据流向"""
    builder = StateGraph(WorkState)
    builder.add_node("retrieve", retrieve)
    builder.add_node("compute", compute)
    builder.add_node("answer", answer)
    builder.add_edge(START, "retrieve")
    builder.add_conditional_edges("retrieve", route_after_retrieve,
                                  {"compute": "compute", "end": END})
    builder.add_edge("compute", "answer")
    builder.add_edge("answer", END)
    # checkpointer:每个节点执行后落一次检查点(按 thread_id 存取),
    # 断点续跑与回放的底座;人工介入可在此基础上用 interrupt() 挂起等人。
    return builder.compile(checkpointer=Saver())


def run_case(question, thread_id, learner_id=None):
    app = build_graph()
    inputs = {"question": question}
    if learner_id:
        inputs["learner_id"] = learner_id
    result = app.invoke(inputs, config={"configurable": {"thread_id": thread_id}})
    if result.get("error"):
        print("[失败态] %s" % result["error"])
        return result
    print("学员提问: %s" % question)
    print("交付   : %s" % result["answer"])
    print("状态快照: learner=%s scores=%s avg=%s gap=%s" %
          (result["learner_id"], result["scores"], result["avg"], result["gap"]))
    return result


if __name__ == "__main__":
    run_case("老师,我第三章的三次练习各多少分?", "ta-001")
    print()
    run_case("老师,查一下这位学员的三次成绩", "ta-002", learner_id="nobody")
```

- 复杂度对比:02 章自研版用「plan() 返回固定任务列表 + for 循环 + carried 链式传参 + require() 抛错」约 90 行实现;本章框架版用「图 + State + 条件边」约 75 行实现。行数差距不大,真正的分水岭在功能:**状态快照、断点续跑、条件路由、人工介入**在自研版里每样都要再写几十行,而框架版是声明式白送;反过来说,只有 3 个线性 worker 的 Demo 根本不需要框架——**别拿 Demo 的复杂度决定生产架构**。

## 6. 边界与排错

| 症状 | 原因 | 处理 |
|---|---|---|
| invoke 报 thread_id 相关错误 | 配了 checkpointer 却没传 config | 每次 invoke 带 {"configurable": {"thread_id": ...}} |
| 节点返回的字段没生效 | 返回键没在 State 里声明 | 检查 TypedDict 声明与返回值键名一致 |
| 条件边路由到错误节点 | path 函数返回值不在 path_map 键里 | 对照 path_map 字典检查返回值与映射键 |
| 跑得比自研还慢 | 检查点序列化开销;或 LLM 调用次数根本没少 | 小任务不上框架(4.4);重活才值得 |
| 改一个 prompt 全线行为漂移 | 抽象层遮蔽了真实 messages | 开 debug/可视化看实际调用(02.07 可观测) |
| 照旧教程写却报 API 错 | LangGraph 演进快(1.x 有破坏性变更) | 以官方文档为准;锁定版本再升级 |

- 边界提醒:框架是执行载体,不是设计良药——02 章「拆错任务全队白跑」、04 章「schema 不齐假成功」,换了 LangGraph 一样坏,只是错误轨迹更容易看见。这正是 06 章的主题:多 Agent 怎么坏、以及何时根本不该用。

## 7. 总结

| 概念 | 一句话 |
|---|---|
| LangGraph | 状态图:节点+边+State+checkpointer,控制流显式可审计 |
| AutoGen 系 | 会话式:角色轮流发言;0.4 事件驱动;2025-10 起并入 Microsoft Agent Framework(2026-04 v1.0) |
| 自研 | 学习与原型首选;出现「重造调度器」冲动时止损 |
| 为什么用框架 | 状态管理、循环控制、检查点、人工介入四件套自研太贵 |
| 框架不管 | 拓扑设计、system prompt、工具、记忆、评测——06 章与 02.07 见 |

**思考题**:02 章的「拆错任务全队白跑」,换用 LangGraph 后会自动消失吗?为什么?AutoGen 式「自由发言」在什么任务上是优点、什么任务上是灾难?

> [!note] 参考答案
> 不会自动消失。LangGraph 只是把流程与状态显式化,拆解决策仍是编排者(节点内的模型调用)做出的——拆错方向,图照跑,只是错误轨迹更易看见、更易重放与修正,「发现得早」不等于「不会错」。自由发言的优点在开放式探索(头脑风暴、辩论激发出单视角没有的观点);灾难场景是要求精确顺序与固定格式的任务(表单流程、财务计算):无人约束时容易跑题且没有终止条件,必须靠轮转规则与终止条件强约束——而这正是状态图天生擅长的。所以选型口诀:开放任务用会话,精确流程用图。

## 引用

- [LangGraph 官方文档(Graph API:StateGraph / compile / checkpointer)](https://docs.langchain.com/oss/python/langgraph/graph-api)
- [Microsoft Agent Framework 官方博客(AutoGen 与 Semantic Kernel 合流,1.0 发布)](https://devblogs.microsoft.com/agent-framework/)
- [Anthropic:Building Effective Agents(对框架与复杂度的提醒)](https://www.anthropic.com/engineering/building-effective-agents)

上一篇:[Agent 间通信与协议](/ai/02-agents/06/05/)——04 章把消息、schema、超时做成你自己的信道;本章把「执行层」交给框架:状态、循环、检查点、人工介入,一行配置换十年重造。
下一篇:[多 Agent 的失败模式与选型](/ai/02-agents/06/07/)——框架跑通了不等于该跑:级联错误、上下文污染、成本失控……下一章讲多 Agent 怎么坏,以及什么时候根本不该用它。
