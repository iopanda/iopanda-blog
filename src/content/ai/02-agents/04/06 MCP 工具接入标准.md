---
title: "MCP 工具接入标准"
number: "02.04.06"
chapter: 2
chapterTitle: "Agents"
section: 4
sectionTitle: "Tool Use and Protocols"
group: ""
created: 2026-09-03 04:20
author: "iopanda"
tags: ["course", "ai-agent", "tool-use", "mcp"]
sourceId: "3.10.2.4 Tool Use and Protocols/05 MCP 工具接入标准"
---
# MCP 工具接入标准

> 04 章把 `run_python` 收进了沙箱,单机执行的风险有了着落。可工具一旦多起来,新的麻烦在集成层冒头:同样的 `search_course`,课程助教 CLI 写一遍、Web 答疑写一遍、自动批改流水线再写一遍——每个应用为每个工具各写一套胶水代码,改一次工具 schema 要同步改 N 处,这就是本章的主角:**N×M 集成问题**。Anthropic 在 2024 年 11 月开源的**模型上下文协议(Model Context Protocol,MCP)** 把工具与数据源封装成标准 server,让任何 AI 应用即插即用,如今 OpenAI、Google 都已采纳。读完你会用官方 Python SDK 把一个课程工具封装成 MCP server,并从客户端进程里把它调用起来。

**学习目标**:学完本章,你将能够——

1. 说出 MCP 要解决的 N×M 集成问题,画出 host / client / server 三层架构;
2. 解释 tools、resources、prompts 三类原语的区别与各自由谁触发;
3. 对比 function calling 与 MCP:一个管「模型怎么声明调用」,一个管「应用怎么获得并执行工具」;
4. 用官方 SDK 写一个暴露课程工具的 MCP server,从客户端经 `tools/list` 与 `tools/call` 调用它;
5. 指出 MCP 不解决信任问题:工具返回仍按不可信处理,权限闸门要落在应用侧(预告 06 章)。

## 1. 概念:MCP 是什么

- **定义**:MCP 是一个开放的、基于 JSON-RPC 2.0 的应用层协议,统一「AI 应用 ↔ 工具与数据源」之间的发现、调用与上下文交换。Anthropic 于 2024 年 11 月 25 日开源,目标是让模型连接「数据所在之处」,而不是为每个数据源写专属实现。
- **生态位**:常被比作「AI 世界的 USB-C」——插口标准化之后,任何一个支持 MCP 的应用都能接上任何一个 MCP server,不再关心对方是什么语言、跑在哪台机器。协议、官方 SDK 与参考 server 都托管在 GitHub 的 `modelcontextprotocol` 组织下;2025 年 OpenAI、Google 先后宣布原生支持,MCP 从「Anthropic 的标准」变成了「行业的事实标准」。
- **三层参与者**:① **host**——AI 应用本身(Claude Desktop、VS Code、课程助教 CLI),负责协调模型与工具;② **client**——host 内部与**一个** server 保持连接的组件,host 接几个 server 就有几个 client(一对一);③ **server**——「提供上下文与能力的程序」,本地或远程皆可。上一章说的「工具注册表」,在 MCP 世界里就是一个个 server。
- **三类原语**:server 用三种原语对外提供能力,区别在于「由谁发起」:

| 原语 | 触发方 | 干什么 | 方法 |
|---|---|---|---|
| tools | 模型(自主决定调用) | 执行动作:查询、计算、写操作 | `tools/list` → `tools/call` |
| resources | 应用(按需读取) | 提供上下文数据:文件、库表、API 响应 | `resources/list` → `resources/read` |
| prompts | 用户(手动选用) | 可复用交互模板:system prompt、few-shot 示例 | `prompts/list` → `prompts/get` |

- **传输层**:本地 server 走 **stdio**(client 把 server 当子进程拉起,消息走标准输入输出);远程 server 走 **Streamable HTTP**(2025-03 修订后取代早期的 HTTP+SSE),鉴权推荐 OAuth。两层共用同一套 JSON-RPC 2.0 消息格式。

## 2. 为什么需要:N×M 集成问题

- **问题的形状**:假设有 N 个应用、M 个工具。没有标准时,每个「应用 × 工具」对都要写一份适配代码:注册、schema、调用、错误处理各来一遍,总量是 **N×M** 份胶水;而且 schema 在每份胶水里各存一份,改一处忘三处,版本悄悄漂移。有了标准协议后,每个应用写一次 client 适配(N 份),每个工具写一次 server 实现(M 份),总量变成 **N+M**。
- 用课程助教算一笔账:

| 形态 | 实现量 | 改 `calculate_score` 的 schema 时要动 |
|---|---|---|
| 无标准(直接 import) | CLI、Web、批改流水线各抄一份调用代码(3×3=9 处) | 3 个应用 + 各自的工具文档,共 9 处 |
| 有 MCP | 1 个 server 实现 + 每个应用一次标准 client 适配 | 只改 server 一处,所有应用下次自动发现新 schema |

- **附加收益不止省代码**:① 工具 schema、描述、参数校验与实现同处一处,天然消除「描述与代码不一致」(呼应 02 章「烂描述=选错工具」);② 动态发现——client 先 `tools/list` 再调用,server 加了新工具,host 无需发版;③ 生态复用——官方参考仓库里有 filesystem、database、web 搜索等现成 server,课程助教想查外部资料不必自己造轮子;④ 高风险工具(如 04 章的代码执行)被封装成独立 server 后,隔离边界更清晰,权限仍由 host 侧把关(06 章展开)。
- 呼应 04 章:沙箱解决的是「单个高危工具怎么执行」,MCP 解决的是「一堆工具怎么接入」——两者正交,生产环境要同时用。

## 3. 作用:MCP 在调用链中的位置

```
┌────────────────── Host(应用进程)───────────────────┐
│  课程助教 CLI / Web 答疑 / 批改流水线                   │
│                                                     │
│   ┌───────────────┐   function calling(01 章)        │
│   │     LLM       │◄──── 工具 schema 拼进 tools 参数    │
│   └───────┬───────┘                                  │
│           │ 输出 tool_calls(只声明,不执行)              │
│   ┌───────▼───────┐                                  │
│   │  MCP Client   │─── 一对一连接 ─────┐              │
│   └───────────────┘                    │              │
└────────────────────────────────────────┼──────────────┘
                                         ▼
              ┌──────────────────────────────────────┐
              │ MCP Server(本地 stdio / 远程 HTTP)     │
              │  tools/list → tools/call              │
              │  resources / prompts 原语              │
              └──────────────────┬───────────────────┘
                                 ▼
                   资料库 / 评分服务 / 沙箱(04 章)
```

- **关键认知**:MCP 没有改变 01 章的那套 function calling 流程——模型与 host 之间依旧是「声明调用 → 回填结果」;MCP 替换的是 **host 代码里「工具从哪来、谁来执行」这一段**:从「`import` 本地函数」变成「问 server」。模型看到的工具名、描述、参数 schema 与从前别无二致,变化的只是它们的来源与执行地。
- function calling 与 MCP 的分工对比:

| 维度 | function calling | MCP |
|---|---|---|
| 解决的问题 | 模型如何结构化「声明一次调用」 | 应用如何标准化「获得并执行工具」 |
| 参与方 | 模型供应商 API ↔ 应用 | host / client ↔ server(与模型无关) |
| schema 声明处 | 应用每次请求时在 `tools` 参数里传 | server 在 `tools/list` 响应里声明 |
| 复用范围 | 单模型、单应用的约定 | 跨模型、跨应用、跨厂商的标准 |
| 类比 | 键盘上的「回车键」 | 键盘与电脑之间的「USB 接口」 |

- 顺带分清另一个协议:**A2A(Agent2Agent)** 解决「Agent 与 Agent 怎么协作」,MCP 解决「Agent 怎么用工具」,两者分层不冲突——Agent 间的协作协议在 02.06 Multi-Agent Systems 展开。

## 4. 详细介绍:跑通一个课程工具 MCP server

### 4.1 线上的一次会话长什么样

MCP 消息是 JSON-RPC 2.0 帧。client 先 `tools/list` 发现能力,再 `tools/call` 执行:

```json
{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}
{"jsonrpc": "2.0", "id": 1, "result": {"tools": [{"name": "search_course", "description": "...", "inputSchema": {"type": "object", "properties": {"module_id": {"type": "string"}}}}]}}
{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "search_course", "arguments": {"module_id": "31024"}}}
{"jsonrpc": "2.0", "id": 2, "result": {"content": [{"type": "text", "text": "Tool Use and Protocols: ..."}]}}
```

- 注意 `inputSchema` 就是 02 章写过的 JSON schema——它现在由 server 声明、经网络送达,而不是硬编码在应用里。这些帧由官方 SDK 代劳,下面直接用 SDK 写两端。

### 4.2 Server 端:把课程工具搬进 FastMCP

```python
# ta_mcp_server.py —— 课程助教工具的 MCP server(依赖官方 SDK:pip install "mcp")
from mcp.server.fastmcp import FastMCP

COURSE_DB = {   # 演示用静态课程表,生产可换成 02.05 的资料库或向量库
    "31021": "Agent 的定义与组成:模型、循环、工具、记忆",
    "31024": "Tool Use and Protocols:function calling、MCP 与权限边界",
}

mcp = FastMCP("ta-server")


@mcp.tool()
def search_course(module_id: str) -> str:
    """按模块 ID 返回课程模块的标题与一句话简介(只读)。"""
    return COURSE_DB.get(module_id, "未收录该模块")


@mcp.tool()
def calculate_score(score: float) -> str:
    """把 0~100 的分数换算成课程标准分并给出评语(纯计算,无副作用)。"""
    if not 0 <= score <= 100:
        return "参数错误:score 应在 0~100 之间"
    standard = round(score, 1)
    comment = "优秀" if standard >= 90 else ("合格" if standard >= 60 else "待加强")
    return "标准分:%s,评语:%s" % (standard, comment)


if __name__ == "__main__":
    mcp.run()   # 默认 stdio 传输:从 stdin 读请求、往 stdout 写响应
```

### 4.3 Client 端:把 server 当子进程拉起并调用

```python
# mcp_call.py —— MCP 客户端:发现工具并调用(运行:python3 mcp_call.py)
import asyncio

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


async def main():
    params = StdioServerParameters(command="python3", args=["ta_mcp_server.py"])
    async with stdio_client(params) as (read_stream, write_stream):
        async with ClientSession(read_stream, write_stream) as session:
            tools = await session.list_tools()
            print("server 暴露 %d 个工具:" % len(tools.tools))
            for item in tools.tools:
                print("  - %s:%s" % (item.name, item.description.splitlines()[0]))
            result = await session.call_tool("search_course", {"module_id": "31024"})
            print("search_course('31024') ->", result.content[0].text)
            result = await session.call_tool("calculate_score", {"score": 93})
            print("calculate_score(93) ->", result.content[0].text)


if __name__ == "__main__":
    asyncio.run(main())
```

- 这段代码里,`mcp_call.py` 是 host 进程,它内部创建的 `ClientSession` 就是 client,`ta_mcp_server.py` 是被拉起的 server——三层角色一一对应。执行后你会看到:先打印 server 自报的工具清单(动态发现),再打印两次 `tools/call` 的真实返回。
- 想接进 ReAct 循环(01 章的 `tool_loop`)只需多一步:把 `list_tools()` 返回的 schema 转成 `tools` 参数发给模型,模型声明 `tool_calls` 后,host 把调用路由到对应 server 执行、结果回填。工具的「获得方式」变了,「回填内容按不可信处理」的纪律不变(03 章)。

## 5. 动手活动:从零跑通一次 MCP 工具接入

> [!example] 动手活动:课程助教 MCP server + client
>
> **目标**:产出 `mcp/ta_mcp_server.py` 与 `mcp/mcp_call.py`,从客户端经 MCP 调用课程工具,并验证「换 server 不换 client」。若环境无法安装官方 SDK(如离线),可改为阅读 4.1 的帧示例,手写最小 `tools/list` 与 `tools/call` 的 JSON 收发脚本作为替代交付。
>
> **步骤**:
> 1. 安装官方 Python SDK:`pip install "mcp"`;
> 2. 把 4.2 的 server 代码存为 `mcp/ta_mcp_server.py`,4.3 的客户端存为 `mcp/mcp_call.py`;
> 3. 运行 `python3 mcp/mcp_call.py`,把 `tools/list` 输出与两次调用结果记进 `reports/mcp-demo-log.md`;
> 4. 改造观察:在 server 里新增第三个工具 `search_material(keyword: str, top_k: int)`(返回资料片段),**不改客户端任何代码**重跑——确认新工具自动出现在清单里并可调用;
> 5. 加分:把 `list_tools` 返回的 schema 转成 `tools` 参数发给 OpenAI 兼容端点(01.04 的服务或云端 API),让模型自己决定调用哪个 MCP 工具,打印完整轨迹;
> 6. 若把 `ta_mcp_server.py` 换成官方仓库里的 filesystem server(见引用),客户端调用方式是否变化?把结论写进报告。
>
> **完成标准**:客户端零改动就能「看见」并调用新增工具,证明动态发现生效;能用一句话说清 `mcp_call.py`、`ClientSession`、`ta_mcp_server.py` 各自扮演 host / client / server 中的哪个角色;加分项跑通时能看到模型经 MCP 完成一次真实工具调用。

## 6. 边界与排错

- **MCP 解决互联,不解决信任**:规范开篇就提醒,协议带来了「任意数据访问与代码执行路径」,安全与信任要由实现者负责。server 声明什么工具、以谁的凭据执行,host 必须自己把关——「能连上」不等于「可以放心调」,权限闸门落在应用侧,这正是 06 章的内容。
- **工具返回依旧不可信**:MCP 只是换了传输通道,不改变「结果来自外部世界」这一事实(呼应 03 章);检索片段里夹带的伪指令,经 MCP 回填后同样可能构成间接注入。
- **本地与远程是两个信任等级**:stdio server 与 host 同机同权限,等于把工具的代码搬进了你的进程(04 章的沙箱由此更要兜底);远程 server 要 TLS + OAuth 最小 scope + 出网白名单,像对待任何第三方 API 一样对待它。
- 常见排错:

| 症状 | 原因 | 处理 |
|---|---|---|
| 客户端报连接关闭 | server 路径/命令写错,或 server 侧 import 报错直接退出 | 先在终端直接运行 server,看报错输出 |
| `tools/list` 返回空 | server 没注册任何 `@mcp.tool()` | 检查装饰器与函数是否在同一文件顶层 |
| `tools/call` 抛参数校验错 | `arguments` 与 `inputSchema` 不匹配 | 打印 `item.inputSchema` 核对字段名与类型 |
| server 卡住不响应 | stdio server 必须由客户端拉起 | 不要用交互终端手动运行 server,一律经 client 启动 |
| 中文输出乱码 | 终端 locale 或文件编码不一致 | 文件统一 UTF-8,终端设 UTF-8 locale |

## 7. 总结

| 概念 | 一句话 |
|---|---|
| MCP | 工具与数据源的标准接入层:JSON-RPC 2.0,Anthropic 2024 开源 |
| N×M 问题 | N 应用 × M 工具要 N×M 份胶水;标准化后只写 N+M |
| 三层架构 | host 协调多个 client,每个 client 一对一连接一个 server |
| 三类原语 | tools(模型驱动)/ resources(应用驱动)/ prompts(用户驱动) |
| 传输 | 本地 stdio;远程 Streamable HTTP(推荐 OAuth) |
| 与 function calling | 互补:FC 管「声明调用」,MCP 管「工具从哪来、谁来执行」 |
| 不解决的事 | 信任与权限——返回仍不可信,闸门在应用侧(06 章) |

**思考题**:课程助教已有的 `search_course`、`calculate_score` 两个本地函数,直接 import 调用也能跑,为什么还要包成 MCP server?请从「复用方数量」与「schema 漂移」两个角度给出判断标准:什么情况下值得为一个工具引入 MCP?

> [!note] 参考答案
> 直接 import 在「单应用、单进程、工具少」时最省事;一旦工具要被多个应用(CLI、Web、批改流水线)或多个进程复用,每处都重复维护 schema 与调用代码,schema 一改就漂移——此时值得包成 server:实现与 schema 只维护一份,任何 host 经 `tools/list` 动态发现,加工具不加胶水(呼应动手活动第 4 步「客户端零改动、新工具自动可见」的观察)。粗略标准:复用方 ≥ 2 且工具 schema 会演进,或工具需要独立部署/独立权限边界(如 04 章的沙箱)时,上 MCP 的收益就超过成本。

## 引用

- [Anthropic:Introducing the Model Context Protocol(2024-11-25 开源公告)](https://www.anthropic.com/news/model-context-protocol)
- [MCP 官方文档:Architecture overview(host/client/server 与三类原语)](https://modelcontextprotocol.io/docs/learn/architecture)
- [modelcontextprotocol(GitHub 官方组织:规范、Python/TS SDK 与工具)](https://github.com/modelcontextprotocol)
- [modelcontextprotocol/servers:参考 server 实现(含 filesystem、database 等)](https://github.com/modelcontextprotocol/servers)

上一篇:[代码执行型工具的风险](/ai/02-agents/04/05/)——沙箱管住了「单个高危工具怎么执行」,本章回答工具多了之后「怎么标准化接入」:N×M 集成问题与 MCP 协议。

下一篇:[权限边界与工具安全](/ai/02-agents/04/07/)——MCP 把工具接入面从进程内函数扩大到任意 server,下一章回答接入之后的关键问题:每个工具、每次调用能碰什么。
