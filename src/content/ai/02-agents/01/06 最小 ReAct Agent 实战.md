---
title: "最小 ReAct Agent 实战"
number: "02.01.06"
chapter: 2
chapterTitle: "Agents"
section: 1
sectionTitle: "Foundations"
group: ""
created: 2026-09-03 02:30
author: "iopanda"
tags: ["course", "ai-agent", "react"]
sourceId: "3.10.2.1 Foundations/05 最小 ReAct Agent 实战"
---
# 最小 ReAct Agent 实战

> 前三章把 Agent 拆成了概念(01)、历史(02)、循环(03)与边界(04):循环是骨架,模型是动力,幻觉与窗口是天花板。本章不聊架构图,直接写代码——用 LLM API 加六十行左右 Python,零框架,手写一个能完成「读文件 → 算平均分 → 总结」两步任务的课程助教 ReAct Agent。读完你会明白:所有 Agent 框架的内核,不过是一个循环加一张工具表;而亲手写一遍,是你以后调试任何框架 Agent 的本钱。

**学习目标**:学完本章,你将能够——

1. 说出「最小 ReAct Agent」的三件套(系统提示/工具表/循环),并解释为什么不需要框架;
2. 用 OpenAI 兼容的 Chat Completions API 手写一个 60~80 行的 ReAct 循环,支持 1~2 个工具;
3. 解释工具结果为何必须由代码注入 Observation,而不能让模型自己转述;
4. 说出循环的三个终止条件(Final Answer/步数上限/解析失败),并演示轨迹打印;
5. 复述三个常见错误(上下文越滚越大/工具结果不截断/循环不终止)的现象与修法。

## 1. 概念:什么是「最小 ReAct Agent」

- **最小 ReAct Agent** = 一个能跑通 ReAct 循环的最短可运行程序:模型读入任务 → 输出 Thought 与 Action → 代码执行工具并注入 Observation → 循环,直到模型给出 Final Answer。
- 它由三件套组成,缺一不可:**系统提示**(规定协议,每轮只能输出 `Thought:` + `Action: 工具名["参数"]`,或完成时的 `Final Answer:`)、**工具表**(「工具名 → Python 函数」的字典,即五要素的「手」)、**循环**(for 块负责调模型、解析动作、执行工具、回填结果——即 03 章的「感知-规划-行动-观察」)。
- **不依赖框架的含义**:不用 LangGraph/AutoGen(06 章预告),甚至不依赖 function calling 的结构化协议——模型输出的文本本身就是「动作指令」,任何会 chat.completions 的 OpenAI 兼容端点都能跑。
- 「最小」指砍掉一切非本质:没有记忆库、没有重试策略、没有权限护栏,只保留循环本身——让你看清「Agent 的内核到底在转什么」。

## 2. 为什么需要:先手写一个,再谈框架

- **框架会替你藏起机制**:在 LangGraph 里点几个节点、连几条边,循环就「自动转起来了」——可一旦行为异常(重复调工具、突然失忆、停不下来),你面对的是黑盒,而你**真正要调试的正是那个被藏起来的循环**。
- **亲手写一遍,名词才变成代码**:模型(客户端调用)、上下文(messages 列表)、规划(Thought)、工具(TOOLS 表)、记忆(历史消息)各安其位;04 章「工具结果由 harness 注入」的护栏原则,也在这几十行里第一次落地。
- **得到一条可运行的基线**:以后换框架、换协议(06 章与 02.04),都用它对照——框架替你多做的那部分,正是它值得被选用的理由;这也呼应 02.01 的模块定位:先手动实现,把「Agent = 模型 + 循环 + 工具 + 记忆」的骨架钉进脑中,再上框架才不会「只会点按钮」。

## 3. 作用:几十行代码 = 整套 Agent 骨架

| 01 章要素 / 03 章环节 | 在本章的落点 |
|---|---|
| 模型(大脑) | `client.chat.completions.create(...)`,一个 OpenAI 兼容调用 |
| 上下文(工作台) | `messages` 列表:system + 任务 + 每轮轨迹与 Observation |
| 规划(拆解) | 模型每轮临场输出的 `Thought`,不预先写死步骤 |
| 工具(手) | `read_file`/`calc` 两个函数 + 注册表 `TOOLS` |
| 记忆(便签) | 就是 `messages` 历史——也正因如此会被窗口卡住(04 章) |
| Thought→Action→Observation | `run()` 里的 for 循环本体 |
| Observation 注入 | 代码 append 真实执行结果,不经模型转述(04 章护栏) |

## 4. 详细介绍:逐段读懂最小实现

### 4.1 完整代码 react_min.py(先 `pip install openai` 并设好 `OPENAI_API_KEY`;自建端点把 `MODEL` 换成 01 部署的模型名、给 `OpenAI()` 加 `base_url`;运行 `python react_min.py`)

- **两个工具与「文本协议」**:`read_file` 返回统一限长 1500 字符——Observation 是给模型「看」的,不是「存」的(04 章窗口意识落地);`calc` 用正则白名单放行数字与四则运算再做受限 `eval`(生产应换 AST 解析,02.04 展开);模型的工具动作就是一行 `Action: 工具名["参数"]`,由正则解析执行——不挑模型(不支持 function calling 的端点也能跑),但解析脆弱(见错误 ③),升级到原生 function calling 后 Observation 会变成独立 tool 消息(引用 2)。

```python
"""react_min.py —— 最小 ReAct Agent:零框架,LLM API + 约 60 行 Python。"""
import re
from openai import OpenAI

client = OpenAI()            # 默认读 OPENAI_API_KEY;自建端点加 base_url=...
MODEL = "gpt-4o-mini"        # 换成你 01 部署 / 可用的模型名

SYSTEM = """你是课程助教 Agent,按 ReAct 格式工作,每轮只输出:
Thought: 你的思考
Action: 工具名["参数"]
若任务已完成则输出:Final Answer: 最终回答
可用工具:read_file["路径"]、calc["算式"];Observation 由系统注入,不得编造。"""

def read_file(path: str) -> str:
    """工具 1:读文本文件,返回限长 1500 字符,防止撑爆上下文。"""
    with open(path, encoding="utf-8") as f:
        text = f.read()
    return text[:1500] + ("\n...(过长已截断)" if len(text) > 1500 else "")

def calc(expr: str) -> str:
    """工具 2:计算器,白名单之外的字符一律拒绝。"""
    if not re.fullmatch(r"[\d+\-*/().\s]+", expr):
        return "错误:算式含非法字符"
    try:
        return str(eval(expr, {"__builtins__": {}}, {}))
    except Exception as e:
        return f"错误:{e}"

TOOLS = {"read_file": read_file, "calc": calc}   # 工具表:注册即上岗

def run(task: str, max_steps: int = 8) -> str:
    """ReAct 循环:Thought → Action → Observation,直到 Final Answer。"""
    messages = [{"role": "system", "content": SYSTEM},
                {"role": "user", "content": task}]
    for step in range(1, max_steps + 1):      # 终止条件 ②:步数硬上限
        reply = client.chat.completions.create(
            model=MODEL, messages=messages, temperature=0)
        text = reply.choices[0].message.content or ""
        print(f"\n===== 第 {step} 步 =====")   # 轨迹打印:每步决策可见
        print(text)
        if "Final Answer:" in text:           # 终止条件 ①:任务完成
            return text.split("Final Answer:", 1)[1].strip()
        m = re.search(r'Action:\s*(\w+)\[(?:["\']([^"\']+)["\']\]', text)
        if not m:                             # 终止条件 ③:协议崩坏,停!
            return "失败:无法解析 Action,轨迹见上方打印"
        name, arg = m.group(1), m.group(2)
        try:                                  # Observation 由代码注入,
            obs = TOOLS[name](arg)            # 不经过模型的嘴(呼应 04 章)
        except Exception as e:
            obs = f"工具执行失败:{e}"
        print(f"---- Observation: {obs[:200]}")
        messages += [{"role": "assistant", "content": text},
                     {"role": "user", "content": f"Observation: {obs}"}]
    return "达到最大步数仍未完成,已终止。"

if __name__ == "__main__":
    task = "读取 homework/grades.txt,计算全班平均分,并指出最高分是谁。"
    print(run(task))
```

### 4.2 一次运行打印出的轨迹

```
===== 第 1 步 =====
Thought: 需要先读取成绩文件,才能计算平均分。
Action: read_file["homework/grades.txt"]
---- Observation: 张三 85 分,李四 90 分,王五 92 分(共 3 人)。
===== 第 2 步 =====
Thought: 已拿到成绩。先算平均分,再比较出最高分。
Action: calc["(85+90+92)/3"]
---- Observation: 89.0
===== 第 3 步 =====
Thought: 平均分 89.0;三名学员中 92 分最高,是王五。
Final Answer: 全班平均分 89.0 分,最高分是王五(92 分)。
```

- 注意两条规律:第 1 步模型**先想后做**——不凭印象报成绩,先 `read_file` 拿真实数据再动笔,正是 ReAct 论文「用推理驱动行动,用行动喂给推理」(引用 1);第 3 步改用 `Final Answer` 收尾——**何时收尾是模型在提示约束下自己做的决定**,代码只负责识别并放行。

### 4.3 循环的三个终止条件

| 终止条件 | 触发情形 | 兜底意义 |
|---|---|---|
| ① 模型输出 `Final Answer:` | 模型判定任务完成 | 正常出口,返回最终回答 |
| ② 步数达到 `max_steps` | 任务太难或模型反复横跳 | 防止无限转圈烧 token |
| ③ Action 解析失败 | 模型输出跑出协议 | 防止把坏文本当动作执行 |

- 三者共同点:**循环不会自己停,停必须是代码写死的规则**(呼应 04 章「模型没有自觉刹车」),终止条件因此缺一不可。

## 5. 动手活动:改造出你的第一个 Agent

> [!example] 动手活动:把最小 Agent 变成你自己的工具人
>
> **目标**:跑通 `react_min.py`,完成一次「读文件 → 加工 → 总结」的真实任务,并把轨迹保存为 `trace-05.log`。
>
> **步骤**:
> 1. 准备数据并原样运行:新建 `homework/grades.txt`,写入 3~5 名学员成绩(可换成知识点笔记),执行 `python react_min.py`,确认轨迹与第 4.2 节一致、平均分正确;
> 2. 加一个工具:仿照 `count_words` 写统计字数的函数并注册,循环代码零改动:
> ```python
> def count_words(path: str) -> str:      # 新工具:统计文件字数
>     with open(path, encoding="utf-8") as f:
>         return str(len(f.read()))
> TOOLS["count_words"] = count_words      # 一行注册,立即上岗
> ```
> 3. 把任务改成「读取文件并报告字数与平均分」,用 `python react_min.py | tee trace-05.log` 保存轨迹。
>
> **完成标准**:能指着日志向别人解释哪几行是 Thought、Action、Observation;再把 `max_steps` 改成 2,观察它如何「还没办完就被叫停」。

## 6. 常见错误:三个把 Agent 写崩的现场

- **错误 1:上下文越滚越大**——每轮把完整旧轨迹与工具结果无限期追加进 `messages`,几十步后请求体积翻倍增长,直至撞上窗口上限「失忆」(04 章)。**修法**:循环内检查长度,超限只保留 system 与最近若干轮(完整策略见 02.02):`if len(messages) > 20: messages = [messages[0]] + messages[-14:]`。
- **错误 2:工具结果不截断**——`read_file` 把 5 MB 讲义全文塞进 Observation,一轮就吃掉大半窗口,模型下一轮要么超限、要么注意力被稀释。**修法**:工具侧统一限长(4.1 节 `text[:1500]`),并显式标注「已截断」。
- **错误 3:循环不终止**——三种形态:忘了设 `max_steps`;模型反复调用同一个失败工具(文件不存在却一读再读);Action 与 Observation 来回兜圈。**修法**:硬上限之外再加重复动作检测(示意,插入 `run()` 循环内即编译可运行):
```python
seen = set()
for name, arg in [("read_file", "x.txt"), ("read_file", "x.txt")]:
    key = f"{name}[{arg}]"
    if key in seen:
        break                               # 同一动作重复 = 死循环,终止
    seen.add(key)
```
- **排查口诀**:先看轨迹最后几步——是模型反复做同一件事(错误 3)、Observation 太大(错误 2),还是根本没人叫停(max_steps)?4.1 节的轨迹打印就是为这一刻准备的。

## 7. 总结

| 概念 | 一句话 |
|---|---|
| 最小 ReAct Agent | 系统提示 + 工具表 + 循环,六十行左右 Python,零框架 |
| 文本协议 | 模型输出 `Action: 工具名["参数"]`,代码解析执行——不挑模型 |
| Observation 注入 | 工具结果由代码回填,不让模型转述(呼应 04 章护栏) |
| 终止条件 | Final Answer / max_steps / 解析失败,三者缺一不可 |
| 三个常见错误 | 上下文越滚越大、工具结果不截断、循环不终止 |
| 与框架的关系 | 框架 = 这套骨架的精装修;先有毛坯房,再谈装修 |

**思考题**:把 `SYSTEM` 改成「永远不要用工具,直接回答」后,这个程序还算 Agent 吗?为什么很多自称 Agent 的产品,轨迹看起来和这个循环一模一样?

> [!note] 参考答案
> 去掉工具后它退化成普通聊天机器人:模型只剩 Thought 与 Final Answer,没有 Action 与 Observation,循环不再「触碰世界」,任务只能靠模型记忆硬答——04 章的三条边界立刻全部裸露。而产品轨迹与本循环相似,恰恰说明 Agent 的内核就是这样一个循环,差异只在工程化程度(记忆、护栏、并发、协议),不在魔法——这正是先手写一遍的价值:看穿框架之后,它就不再神秘。

## 引用

- [arXiv:ReAct: Synergizing Reasoning and Acting in Language Models(Yao et al., 2022,ICLR 2023)](https://arxiv.org/abs/2210.03629)
- [OpenAI:Function calling 指南(从文本协议升级到结构化 tool 消息)](https://platform.openai.com/docs/guides/function-calling)
- [Anthropic:Building effective agents(何时用 Agent、如何控复杂度)](https://www.anthropic.com/engineering/building-effective-agents)

上一篇:[模型能力边界如何限制 Agent](/iopanda-blog/ai/02-agents/01/05/)——带着三条边界的认知,这一章把循环与护栏落成了可运行的代码。
下一篇:[Agent 类型与生态全景](/iopanda-blog/ai/02-agents/01/07/)——会写最小 Agent 之后,下一章看看它在生态里还有多少种形态。
