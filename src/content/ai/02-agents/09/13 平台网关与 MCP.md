---
title: "平台网关与 MCP"
number: "02.09.13"
chapter: 2
chapterTitle: "Agents"
section: 9
sectionTitle: "Agent Implementations"
group: "03 Hermes Agent"
created: 2026-09-03 07:15
author: "iopanda"
tags: ["course", "ai-agent", "hermes-source"]
sourceId: "3.10.2.9 Agent Implementations/03 Hermes Agent/04 平台网关与 MCP"
---
# 平台网关与 MCP

> 01~03 章看的是单个会话的内部器官,本章把镜头拉到进程边界:同一个 Hermes 进程可以同时挂着 Telegram、Discord、Slack、飞书等二十来个平台,每来一条消息都走同一颗 agent 核心——平台是插件,核心只有一个。绕着这颗核心还有三组「外延」:terminal backend 决定命令在哪跑、MCP 决定外部工具怎么进注册表、cron 让核心在无人值守时自己醒来干活。读完整章,你就能回答一个很工程的问题:一次对话核心,凭什么被这么多入口复用而不串台。

**学习目标**:学完本章,你将能够——

1. 画出 GatewayRunner 的单进程多平台架构:适配器插件 → MessageEvent 归一化 → 会话与 Agent 缓存 → AIAgent 复用,并给每层标出文件:行号;
2. 解释 session_key 由 SessionSource 的哪些维度推导、每会话 AIAgent 缓存为何是「LRU+空闲 TTL」,以及 Telegram 用户与飞书用户为何互不串台(呼应 03 章记忆);
3. 用 TerminalEnvironmentProvider 的分类属性(is_remote / is_container / skip_container_guards)说明沙箱后端与本地后端的权限差异;
4. 走通 MCP 注册与调用链:mcp__<server>__<tool> → 统一 ToolRegistry → handle_function_call → registry.dispatch,并解释 lazy 启动与 schema 缓存;
5. 说明 cron 调度 tick 的「文件锁单飞」,以及 cron agent 与聊天 agent 共享什么、刻意不共享什么。

## 1. 概念:一颗核心,一堆平台插件

| 层 | 载体 | 职责 |
|---|---|---|
| 平台接入 | plugins/platforms/ 下约 22 个平台插件 | Telegram/Discord/Slack/飞书…的原生日志进、统一事件出 |
| 归一化 | MessageEvent(gateway/platforms/base.py:2514) | 「所有适配器产出的统一表示」(docstring 原话) |
| 适配器契约 | BasePlatformAdapter(base.py:3120) | connect / send / set_message_handler 三件套 |
| 会话路由 | SessionSource(session.py:157)→ session_key(run.py:8593) | 消息属于哪个会话、回答送回哪里 |
| 会话存储 | SessionStore(session.py:1253) | SQLite+JSON 的会话历史与路由 |
| Agent 复用 | GatewayRunner._agent_cache(run.py:7789) | 每会话一个 AIAgent,LRU 上限 128 + 空闲 TTL 1h |
| 执行外延 | TerminalEnvironmentProvider / ToolRegistry / cron | 命令环境、外部工具、定时唤醒 |

- 平台=插件的直接证据:每个平台是一个插件目录,适配器继承统一基类——class TelegramAdapter(BasePlatformAdapter)(plugins/platforms/telegram/adapter.py:604),插件入口 def register 里 ctx.register_platform("telegram", …)(adapter.py:11359)。要加新平台就加一个目录,核心代码一行不改。
- 网关不区分「人发消息」与「定时任务」:cron job 到点后构造的也是一个 AIAgent(platform="cron"),结果再投递回平台聊天——两条入口在出口汇合。

## 2. 为什么这样设计

- **一次对话核心,多渠道触达**(呼应 02.08/01 的应用形态全景)。模型调用、记忆、技能、压缩(01~03 章)全部活在 AIAgent 里,是稳定面;平台 SDK 是易变面,长尾 20+。把平台做成适配器插件,核心对「平台」零感知。
- **消息是瞬时的,会话是连续的**:同一个人昨天说的话今天要接得上(03 章记忆、会话历史),所以「每消息新建 agent」不可行;但 AIAgent 很重——每个都持有 LLM clients、tool schemas、memory providers(gateway/run.py:74-77 注释),所以折中为「每会话一个 + 有界缓存」。
- **环境与工具决定权限形状**:同一份推理核心,命令在本地跑还是容器跑、工具是内置还是 MCP 远端,权限模型完全不同(02.04/06);因此 terminal 与 MCP 都必须抽象成可插拔接口。
- **cron 是「系统给自己发消息」**:多进程/多实例同时 tick 会重复执行 job,单飞靠文件锁;无人值守没有人在环,所以要显式关掉后台评审分叉。

## 3. 作用位置:网关进程内部

```text
GatewayRunner(gateway/run.py:7447)—— 单进程 asyncio,持有全部平台
├─ PlatformRegistry(gateway/platform_registry.py:233,懒加载 _deferred :259)
│    └─ 平台插件:TelegramAdapter(telegram/adapter.py:604)等约 22 个
│         connect()/send()/set_message_handler()(base.py:4288/:4313/:3937)
│         └─ 原生日志 → MessageEvent(base.py:2514)
├─ 消息处理链:_primary_message_handler(:17886)→ _handle_message(:18795)
│    ├─ 忙: _enqueue_fifo 按 session_key 排队(:9969)
│    └─ 闲: _handle_message_with_agent(:21231)
│         ├─ get_or_create_session(:21298)← SessionSource(session.py:157)
│         ├─ session_key = _session_key_for_source(:8593)
│         └─ AIAgent 命中/新建于 _agent_cache(:7789;128 个/TTL 1h :84-85)
│              └─ run_conversation(01 章主循环;run.py:31342 import AIAgent)
├─ 执行外延 A:TerminalEnvironmentProvider(agent/terminal_env_provider.py:72)
│    ├─ 内置 8 后端(terminal_env_registry.py:40)→ TERMINAL_ENV 选择(:1399)
│    └─ is_container → skip_container_guards 跳危险命令审批(:109-111)
├─ 执行外延 B:MCP → 统一 ToolRegistry → registry.dispatch(tools/registry.py:1165)
└─ 执行外延 C:cron/scheduler.py tick(:8137,flock 单飞 :8190)
     └─ run_job(:5740)→ AIAgent(platform="cron",:6739)
```

## 4. 详细介绍

### 4.1 适配器契约与 MessageEvent 归一化

BasePlatformAdapter 是每个平台必须实现的抽象基类(gateway/platforms/base.py:3120),三个核心接口:set_message_handler()(:3937)注册消息回调、connect()(:4288)建立长连接、send()(:4313)把回答送回平台。平台 SDK 重的适配器由 PlatformRegistry(gateway/platform_registry.py:233)管理懒加载——先注册加载器,首次真正使用才 import SDK(_deferred :259 与 _inflight :261 负责「只加载一次、并发不重复加载」),网关冷启动不必被二十个 SDK 的 import 拖慢。

适配器与核心之间唯一的信使是 MessageEvent(gateway/platforms/base.py:2513-2519):

```python
@dataclass
class MessageEvent:
    """
    Incoming message from a platform.

    Normalized representation that all adapters produce.
    """
```

「Normalized representation that all adapters produce」是设计核心:Telegram 的 update、Discord 的 event、飞书的回调,进核心前都被各自 adapter 翻译成同一结构(文本、消息类型、来源 source、作者),核心从此不需要知道平台差异。GatewayRunner 启动时把处理器接到适配器上(adapter.set_message_handler(self._primary_message_handler()),gateway/run.py:14314)。

### 4.2 session_key 与每会话 Agent 缓存

消息进来后第一件事是判定「这是哪个会话」。SessionSource(gateway/session.py:157)是描述消息出处的 dataclass,字段包括 platform、chat_id、chat_type("dm"/"group"/"channel"/"thread")、user_id、thread_id 与 scope_id(平台无关的服务器/工作区判别符);会话持久化由 SessionStore(gateway/session.py:1253)承担。GatewayRunner 用 _session_key_for_source()(gateway/run.py:8593)把 source 压成字符串 key——按 platform / guild / chat / thread / user 维度拼装:Telegram 群里的 A 与飞书私聊里的 A 得到不同 key,各自拿到独立会话与独立 AIAgent,03 章的记忆因此互不串台。key 随后经 get_or_create_session()(run.py:21298)取出会话记录。

真正跑模型的实例按会话缓存:_agent_cache 是 OrderedDict(gateway/run.py:7789,注释自述按 LRU 淘汰),模块级默认 _AGENT_CACHE_MAX_SIZE = 128、_AGENT_CACHE_IDLE_TTL_SECS = 3600.0(run.py:84-85);容量与空闲 TTL 由 _enforce_agent_cache_cap()(:30562)与 _sweep_agent_cache_under_pressure()(:30418)执行,config 的 agent.agent_cache.max_size / idle_ttl_secs 可覆盖(gateway/agent_cache_pressure.py:63-64)。同一会话的相邻消息命中缓存:记忆、技能、会话历史原样延续,只有超过 1 小时没说话才被逐出、下条消息冷启动一次。

处理链(含忙时排队):_handle_message()(:18795)发现该 session_key 已有回合在跑,就把新消息交给 _enqueue_fifo()(:9969)排队,先来先服务;空闲则进 _handle_message_with_agent()(:21231)→ _run_agent()(:31119,多 profile 时按 HERMES_HOME 解析各自的 config/skills/memory/credentials)→ _run_agent_inner()(:31298,内部 from run_agent import AIAgent :31342),最终跑的是 run_conversation——和 CLI 里按回车是同一条主循环(01 章),AIAgent 构造时按 source 注入 platform / user 等上下文,模型才「知道」自己在哪个平台跟谁说话。

### 4.3 Terminal backend:命令在哪跑,审批谁说了算

TerminalEnvironmentProvider 是「可插拔终端执行后端」的抽象基类(agent/terminal_env_provider.py:72-73);注册表保留 8 个内置名(agent/terminal_env_registry.py:40-43,含 managed_modal 内部别名),第三方后端必须换名——provider.name 的 docstring 写明与内置名碰撞会被拒绝(:85-87),插件经 register_provider()(:53)接入。工厂 create_environment()(:195)按 cwd/超时/镜像等参数返回环境对象,对象满足 tools/environments/base.py:611 BaseEnvironment 的鸭子接口(execute()/cleanup() 等);内置实现在 tools/environments/ 下:local.py、docker.py、ssh.py、modal.py、daytona.py、vercel_sandbox.py…。

权限模型的机关在几个声明式分类属性(agent/terminal_env_provider.py:104-111):

```python
is_remote: bool = True
is_container: bool = True

@property
def skip_container_guards(self) -> bool:
    """Whether dangerous-command approval prompts are skipped."""
    return self.is_container
```

语义:local 后端 is_container=False → skip_container_guards=False → 危险命令照常弹审批(02.04/06 权限边界);docker / daytona 等容器后端 is_container=True → 审批整体跳过——环境本身已是隔离沙箱,再逐条弹窗只会打断工作流。配套属性还有 cache_path_base(:114,缓存目录在沙箱内的映射)与 strip_env_keys(:119,从子进程剥离厂商 API 密钥)。运行时用 TERMINAL_ENV 选后端(env_type = _tenv("TERMINAL_ENV", "local"),tools/terminal_tool.py:1399;_tenv :1722 是作用域感知读取,多 profile 不串后端);容器类集合写死为 _CONTAINER_BACKENDS = frozenset({"docker", "singularity", "modal", "daytona", "vercel_sandbox"})(tools/terminal_tool.py:1660)。

### 4.4 MCP:外部工具打进统一注册表

MCP 工具与内置工具同池竞争模型注意力,靠命名与注册表统一。前缀常量 MCP_TOOL_NAME_PREFIX = "mcp__"(tools/mcp_tool.py:7397),工具全名由 mcp_prefixed_tool_name() 拼成 mcp__<sanitizedServer>__<sanitizedTool>(:7401-7408);:7390-7396 的注释交代了动机:双下划线定界 server/tool,且与 Claude Code、Codex、OpenCode 共用同一 wire 命名——模型训练数据里就认识这种名字。

启动注册入口 register_mcp_servers()(:8182)先滤掉可疑服务器(:8198),再对每个服务器调 _register_server_tools()(:7696),把每个远端工具做成候选并打进统一 ToolRegistry:

```python
registry.register(
    name=registry_name,
    toolset=toolset_name,
    schema=candidate["schema"],
    handler=candidate["handler"],
    check_fn=candidate["check_fn"],
    is_async=False,
    description=candidate["schema"]["description"],
    scope=_server_registry_scope(name),
)
```

(tools/mcp_tool.py:7895-7904;:7906-7908 注释说明 register() 是原子所有权闸门——多个服务器并发注册时由注册表裁决冲突。)随后 register_toolset_alias(name, toolset_name)(:7922)让 toolset 可用服务器名寻址,并把 schema 写穿到磁盘缓存(:7923-7925),下次启动可免连即注册。

懒启动的语义写在 :8252-8256 的注释里:带 lazy: true 且 config 指纹命中磁盘 schema 缓存的服务器,直接从缓存注册工具、不 spawn 子进程(_register_from_cache_sync() 定义于 :7974、被调于 :8275),第一次真正调用它的工具时才连服务器;缓存缺失或过期则退回 eager connect,并把结果写穿回缓存。连不上的服务器进入冷却(_connect_cooldown_active(),:8218-8224 注释 #50394 防「每个 worker 会话都重生一次」的重启风暴)。

模型侧的调用链全貌:tool_call → agent/tool_executor.py(并发/顺序/分段执行)→ model_tools.handle_function_call()(model_tools.py:1251,含别名与中间件)→ registry.dispatch()(tools/registry.py:1165)。dispatch 的 docstring 自述三个归一化承诺(tools/registry.py:1173-1180):async handler 经 _run_async() 自动桥接、结果统一成字符串或多模态信封、异常一律捕获为 {"error": "…"}——远端 MCP 服务器掉线,对模型表现为一次普通工具错误,而不是进程崩溃。注册表带单调递增的 generation 计数(tools/registry.py:501-506),MCP 动态刷新(register / deregister)会 bump 它,依赖它的工具定义缓存与 schema 缓存一并失效。

### 4.5 Cron:无人值守的 agent 会话

cron 让 agent「自己醒来干活」:job 是带 schedule 的记录(cron/jobs.py),到点由 tick()(cron/scheduler.py:8137)派发。多进程环境(多个 gateway 实例都启用 cron)最怕重复执行,解法是文件锁单飞:

```python
lock_fd = open(lock_file, "w", encoding="utf-8")
if fcntl:
    fcntl.flock(lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
```

(cron/scheduler.py:8188-8190)非阻塞拿锁失败,说明另一实例正在 tick,静默 return 0(:8194-8200);真正的 OSError(如 EMFILE 文件描述符耗尽)则大声失败、绝不伪装成「锁被占」——:8180-8185 的注释记录过那次假健康事故(#87644:锁错误被吞,调度器心跳一直正常却再没跑过任何 job)。ESTOP 哨兵(hermes pause)存在时整轮跳过(:8228-8231);若磁盘上已有更新代码的 gateway,旧进程主动让位(_should_yield_tick_to_fresh_gateway,:8172-8175)。

每次 job 由 run_job()(:5740)构建一个货真价实的 AIAgent(cron/scheduler.py:6704):

```python
skip_memory=False,
skip_background_review=True,  # Cron has no human-in-the-loop need for skill/memory review forks (~30K tok/event)
platform="cron",
```

(:6737-6739;enabled_toolsets=_resolve_cron_enabled_toolsets(job, _cfg) :6724,该函数定义于 :601,可按 job 合并 MCP 服务器)也就是说:cron agent 与聊天 agent 共用同一颗核心、同一份记忆读写(03 章 skip_memory=False 的注释明说 jobs benefit from the user's persistent memory),只是 quiet_mode 运行、无人在环时跳过技能/记忆后台评审分叉(约 3 万 token/事件)。非交互运行用 inactivity 超时兜底——默认 600 秒无活动即杀(:6744-6753 注释,HERMES_CRON_TIMEOUT 可调);job 结果经 _deliver_result()(:3166)或 _deliver_to_bot_chat()(:2629)投递回网关聊天。于是「定时任务」与「人发消息」在出口处汇合同一条路由。

## 5. 动手活动

> [!example] 动手活动:画网关进程架构图 + MCP 注册调用链路
>
> **目标**:把「平台消息 → 统一事件 → 会话/Agent 缓存 → 主循环」与「MCP 远端工具 → 统一注册表 → 调用链」画成一张带文件:行号的进程架构图。
>
> **步骤**:
> 1. 按上图(第 3 节)先画消息处理链,再打开 gateway/run.py:14314、:17886、:18795、:21231 与 :7789、:84-85,核对「busy 排队 / 空闲直跑」的分叉与缓存边界;
> 2. 打开 gateway/session.py:157 与 gateway/run.py:8593,为 session_key 补上推导维度,并标注它如何挡住跨平台串台;
> 3. 补 MCP 链路:读 tools/mcp_tool.py:7397、:7895、:8252-8256 与 model_tools.py:1251、tools/registry.py:1165-1180,在 dispatch 节点标注 async 桥接与错误归一;
> 4. 验证 cron 单飞:读 cron/scheduler.py:8188-8200,回答「两个进程同时 tick 会发生什么、什么错误不能吞」;
>
> ```text
> Telegram ─┐          ┌─ busy → _enqueue_fifo 排队(run.py:9969)
> Discord ──┤ MessageEvent      _handle_message(:18795)
> 飞书 ────┘ (base.py:2514)         └─ _handle_message_with_agent(:21231)
>    ▲ set_message_handler(:14314)       ├─ session_key(:8593) ← SessionSource(session.py:157)
>    └─ 各平台 adapter 翻译原生日志      └─ AIAgent ⇄ _agent_cache(:7789,LRU 128/TTL 1h :84-85)
>                                           └─ run_conversation(01 章主循环,:31342)
> MCP:tool_call → tool_executor → handle_function_call(model_tools.py:1251)
>     → registry.dispatch(tools/registry.py:1165) → entry.handler → MCP server call_tool
> cron:tick(:8137)→ flock(:8190)单飞 → run_job(:5740)→ AIAgent(platform="cron" :6739)
> ```
>
> **完成标准**:图中每条边都能指到文件:行号;能讲清同 session 的第二条消息在 agent 忙时去了哪里;能解释 lazy 的 MCP 服务器为何「第一次调用前不占进程」;能用一句话说出 cron agent 与聊天 agent 共享什么、刻意不共享什么(共享核心与记忆,不共享人肉评审分叉)。

## 6. 边界与坑

| 症状 | 原因 | 处理 |
|---|---|---|
| 两个进程都启 cron,任务重复执行 | tick 并发 | flock LOCK_EX\|LOCK_NB 单飞;真 OSError 别吞成「锁被占」(scheduler.py:8193-8221) |
| 心跳正常但 job 从不跑 | 锁错误被吞成假健康(#87644) | 只有锁竞争才静默跳过,fd 耗尽等真错误必须 raise |
| 某平台断连拖垮所有平台 | 冷启动连接占满超时预算 | 首连限时(Telegram 45 秒),失败进重连 watcher(run.py:91-97) |
| agent 缓存无限膨胀 | 长活网关每会话一个 AIAgent | LRU 128 + 空闲 TTL 1h + 内存压力清扫(:84-85、:30418) |
| MCP 改了 schema 不生效 | 磁盘 schema 缓存陈旧 | generation 计数失效缓存,手动 /mcp refresh 写穿刷新 |
| 容器后端危险命令还被审批卡住 | provider 分类属性没配对 | 沙箱后端 skip_container_guards=True 跳审批(terminal_env_provider.py:109-111) |
| local 后端危险命令审批被跳过 | 误把本地当沙箱 | 只有隔离环境才跳审批;local 的 is_container=False 必须保留审批 |
| cron 每跑一次多烧 3 万 token | 无人在环也跑评审分叉 | skip_background_review=True(scheduler.py:6738) |

- 边界提醒:本章的「平台」是广义入口——IM 平台、terminal 后端、MCP 服务器、cron 调度共享同一颗 AIAgent 核心;但共享不等于无隔离,会话与缓存按 session_key 隔离,命令按环境分类属性定权限,外部工具按注册表 scope 归属 profile,三层各守各的边界。

## 7. 总结

| 概念 | 一句话 |
|---|---|
| 单进程多平台 | GatewayRunner 一个进程持有全部平台适配器,平台=插件,核心只有一颗(run.py:7447) |
| MessageEvent 归一化 | 「所有适配器产出的统一表示」,平台差异在适配器层终结(base.py:2514) |
| session_key | SessionSource → platform/guild/chat/thread/user 推导,跨平台不串台(session.py:157、run.py:8593) |
| Agent 缓存 | 每会话一个 AIAgent:OrderedDict LRU 128 + 空闲 TTL 1h,记忆与技能热延续(run.py:7789、:84-85) |
| Terminal backend | TerminalEnvironmentProvider ABC + 8 内置后端;is_container → skip_container_guards 跳审批(terminal_env_provider.py:72) |
| MCP 注册 | mcp__<server>__<tool> 进统一 ToolRegistry;lazy 启动 + schema 缓存免 spawn(mcp_tool.py:7397、:7895) |
| 调用链归一 | tool_executor → handle_function_call(model_tools.py:1251)→ registry.dispatch(registry.py:1165),async 自动桥接、错误统一信封 |
| cron 单飞 | tick 文件锁 LOCK_EX\|LOCK_NB;cron agent = platform="cron" 的普通 agent,只是跳过人在环评审(scheduler.py:8190、:6738) |

**思考题**:agent 缓存为什么是「LRU 上限 + 空闲 TTL」两个维度,而不是「永不淘汰」或「每条消息新建」?cron 同时设 skip_background_review=True 与 skip_memory=False,这两行配置并存意味着什么?

> [!note] 参考答案
> ①永不淘汰:长活网关会按会话数无限持有 AIAgent,每个都带 LLM clients、tool schemas、memory providers(run.py:74-77),内存迟早耗尽;每条消息新建:会话连续性全丢,03 章记忆与 SessionStore 历史每次都要重新加载,冷启动成本每回合付一次。LRU 128 管「广度」(最近活跃的 128 个会话保持热),TTL 1h 管「时间」(说过一句话就消失的僵尸会话被逐出),缺一个都会退化成上一种极端。②skip_memory=False 表示 cron agent 照常读写 MEMORY.md/USER.md(03 章),无人值守也能「用中学」;skip_background_review=True 只关掉技能/记忆的 LLM 评审分叉——那种约 3 万 token/事件的后台 fork 需要人在环才划算。两者并存正是 05 章自我进化闭环的伏笔:沉淀照跑、评审留给人,cron 是学习的输入而不是失控的自动进化引擎。

## 引用

- [NousResearch/hermes-agent(源码仓库,MIT)](https://github.com/NousResearch/hermes-agent)
- [Hermes Agent 官方文档(developer-guide/architecture)](https://hermes-agent.nousresearch.com/docs)
- [Model Context Protocol 规范(工具发现、调用与懒连接语义)](https://modelcontextprotocol.io/)

上一篇:[记忆系统](/iopanda-blog/ai/02-agents/09/12/)——记忆与技能都挂在 AIAgent 实例上;本章回答:同一颗核心如何被多平台/多入口复用,而每个会话的记忆仍按 session_key 各归各家;cron 又怎样让核心无人值守地自己醒来。

下一篇:[自我进化设计](/iopanda-blog/ai/02-agents/09/14/)——cron 的 skip_memory=False 与回合尾的后台评审派发,把「用中学」从交互会话推广到无人值守会话;05 章把 02~04 章的全部触发点拼成自我进化闭环。
