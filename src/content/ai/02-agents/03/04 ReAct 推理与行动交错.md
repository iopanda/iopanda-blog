---
title: "ReAct 推理与行动交错"
number: "02.03.04"
chapter: 2
chapterTitle: "Agents"
section: 3
sectionTitle: "Planning and Reasoning"
group: ""
created: 2026-09-03 04:10
author: "iopanda"
tags: ["course", "ai-agent", "planning-reasoning", "react"]
sourceId: "3.10.2.3 Planning and Reasoning/03 ReAct 推理与行动交错"
---
# ReAct 推理与行动交错

> 02 章的 CoT 让课程助教「先想后答」,但它的推理全程发生在一次生成之内:缺成绩数据时,想得再细也只能编。本章把「想」与「做」接起来——推理(Reason)推进到需要外部信息的一步,就行动(Act)调用工具,把真实观察(Observation)喂回下一步再想,如此交错循环,这就是 ReAct(Yao et al., 2022,引用 1)。你已在 02.01 的 05 章亲手写过它的最小版本,本章给它补上「规划感」,并对照 CoT 说清它为什么更不容易幻觉。读完你会跑通一个多步「查→算→答」的课程助教任务,并理解它与 function calling 是同一循环的两种动作编码。

**学习目标**:学完本章,你将能够——

1. 说出 ReAct 循环的三要素(Thought → Action → Observation)与 CoT「一次生成」的本质区别;
2. 复述 Yao et al. 2022 的核心思想(推理与行动交错、观察纠正推理)及其抑制幻觉的实验结论;
3. 解释 Observation 为什么必须由代码注入而不能让模型自述(呼应 02.01 的护栏原则);
4. 说清「文本协议」与 function calling 两种动作编码的关系与取舍(预告 02.04);
5. 在 02.01 的最小 ReAct 基础上实现并读懂一条 5 步内完成的多步「查→算→答」轨迹。

## 1. 概念:ReAct 是什么

- **ReAct = Reason + Act**:让模型交替输出**推理轨迹**(Thought,含子目标、行动理由、对 Observation 的分析)与**行动指令**(Action,调用哪个工具、传什么参数);工具执行结果作为 **Observation** 回到上下文,驱动下一轮 Thought。这个循环就是「感知—规划—行动—观察」的最朴素落地(呼应 02.01 的 03 章运行循环)。
- 看一个课程助教的完整轨迹——学员问:「张三两次小测 86、92,平均分到优秀线 85 了吗?」:

```
Thought 1: 我需要先拿到成绩数据,才能核对张三的两次小测分数。
Action 1:  read_scores["data/scores.json"]
Observation 1: 张三:小测一 86 分,小测二 92 分;李四:小测一 74 分……
Thought 2: 已确认张三两次为 86 与 92。下一步算平均,再与 85 比较。
Action 2:  calc["(86 + 92) / 2"]
Observation 2: 89.0
Thought 3: 89.0 大于 85,达到优秀线。任务完成。
Final Answer: 张三平均分 89 分,超过 85 分的优秀线。
```

- 与 CoT 对照(02 章):CoT 的「想」全部挤在一次生成里,是**纯脑内推演**;ReAct 把「想」切成多轮,每轮想完可以**动手查证**,再带着新证据继续想——一句话:**想一步、做一步、看一步**。

## 2. 为什么需要:CoT 想得到,却够不着

- **CoT 的两个病灶(02 章)**:① 无外部观察——「查一下本学期缺勤最多的学员」这类任务,推理链再完整也是无源之水;② 链上幻觉与错误传播——中间某步编造一个「显然」的事实,后续步骤会整齐地建立在错误之上,而且因为自洽而更难发现。
- **ReAct 的药方**:Thought 决定「查什么」,Action 把推理**接地**(grounding)到真实世界,Observation 再回头**纠正** Thought——编错了,查一次就知道。论文原话:推理轨迹帮助模型诱导、跟踪、更新行动计划并处理异常,行动让模型接上外部知识库与环境(引用 1)。
- 论文证据(引用 1):在 HotpotQA 与 Fever 上,ReAct 通过调用一个简单的 Wikipedia API,克服了 CoT 的幻觉与错误传播;在两个交互决策基准 ALFWorld 与 WebShop 上,仅靠一两条上下文示例,就以绝对成功率超过模仿学习与强化学习方法(分别高 34% 与 10%)。注意它**没有换模型、没有微调**,只换了「怎么用」——行为差异来自上下文工程(呼应 02.02)。
- 与 02.01 的呼应:05 章的最小 ReAct 证明了「循环能转」;本章要补的是**规划感**——每个 Thought 不只写「我要调 X」,还写清「我处在任务的哪一步、这一步要验证什么、接下来还差什么」,把 01 章「目标→子目标→步骤」的结构搬进模型的每轮思考。

## 3. 作用:ReAct 在规划谱系中的位置

| 形态 | 推理位置 | 多次生成 | 调工具 | 观察外部 | 成本形态 |
|---|---|---|---|---|---|
| 直接回答 | 不可见 | 否 | 否 | 否 | 1 次调用 |
| CoT(02 章) | 一次生成内可见 | 否 | 否 | 否 | 1 次调用、输出长 |
| **ReAct(本章)** | 每轮 Thought,与 Action 交错 | 是 | 是 | 是 | 每步 1 次调用 |
| Plan-and-Execute(04 章) | 计划与执行分家 | 是 | 是 | 执行阶段是 | 计划 1 次 + 执行若干次 |

- **动作的两种编码**:同一套循环,「Action」可以两种方式发给执行层——① **文本协议**(02.01 05 章):模型输出一行 `Action: 工具名["参数"]`,代码用正则解析;任何 OpenAI 兼容端点都能跑,但解析脆弱。② **function calling**(预告 02.04):模型直接输出结构化 `tool_calls` 声明(工具名 + JSON 参数),由执行层校验并回填 `tool` 消息。两种编码下循环逻辑一模一样,区别只在「动作以什么格式声明」;Yao et al. 2022 用的是文本协议,今天的产品大多用 function calling,思想不变。

## 4. 详细介绍:多步「查→算→答」

### 4.1 循环骨架与终止条件

- 三件套沿用 02.01 05 章:**系统提示**(协议 + 工具表)、**工具表**(工具名 → 函数)、**循环**(调模型 → 解析 → 执行 → 注入 Observation)。终止条件三条:出现 `Final Answer:`、步数达上限、Action 解析失败。
- 与最小版的差别在**提示词与任务**多了一步:系统提示要求 Thought 写清「已完成什么 / 这一步为什么 / 接下来打算」,让每一步的意图可检查——这正是 06 章「无效步」指标的雏形。

### 4.2 参考代码(react_multi.py)

```python
"""react_multi.py —— 课程助教多步 ReAct:查成绩文件 → 计算 → 判定,5 步内完成。"""
import json
import re
from openai import OpenAI

client = OpenAI()            # 默认读 OPENAI_API_KEY;自建端点加 base_url=...
MODEL = "gpt-4o-mini"        # 换成你 01 部署的模型名

SYSTEM = """你是课程助教 Agent,按 ReAct 格式工作,每轮只输出:
Thought: 你的思考(说明:已完成什么 / 这一步为什么 / 接下来做什么)
Action: 工具名["参数"]
任务完成时输出:Final Answer: 最终回答
可用工具:read_scores["路径"]、calc["算式"]。Observation 由系统注入,不得编造。"""

def read_scores(path: str) -> str:
    """工具 1:读成绩 JSON,返回限长 1200 字符的文本。"""
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    lines = [f"{name}:小测一 {v['quiz1']} 分,小测二 {v['quiz2']} 分"
             for name, v in data.items()]
    text = "\n".join(lines)
    return text[:1200] + ("\n...(过长已截断)" if len(text) > 1200 else "")

def calc(expr: str) -> str:
    """工具 2:受限计算器,白名单之外字符一律拒绝。"""
    if not re.fullmatch(r"[\d+\-*/().\s]+", expr):
        return "错误:算式含非法字符"
    try:
        return str(eval(expr, {"__builtins__": {}}, {}))
    except Exception as exc:
        return f"错误:{exc}"

TOOLS = {"read_scores": read_scores, "calc": calc}

def run(task: str, max_steps: int = 5) -> str:
    """ReAct 循环:每步 Thought 带计划感,Observation 由代码注入。"""
    messages = [{"role": "system", "content": SYSTEM},
                {"role": "user", "content": task}]
    for step in range(1, max_steps + 1):
        reply = client.chat.completions.create(
            model=MODEL, messages=messages, temperature=0)
        text = reply.choices[0].message.content or ""
        print(f"\n===== 第 {step} 步 =====\n{text}")
        if "Final Answer:" in text:
            return text.split("Final Answer:", 1)[1].strip()
        m = re.search(r'Action:\s*(\w+)\[(?:["\']([^"\']+)["\']\]', text)
        if not m:
            return "失败:无法解析 Action,已按协议终止"
        name, arg = m.group(1), m.group(2)
        try:
            obs = TOOLS[name](arg)          # Observation 由代码注入,
        except Exception as exc:            # 不经过模型的嘴(护栏)
            obs = f"工具执行失败:{exc}"
        print(f"---- Observation: {obs[:200]}")
        messages += [{"role": "assistant", "content": text},
                     {"role": "user", "content": f"Observation: {obs}"}]
    return "达到最大步数仍未完成,已终止。"

if __name__ == "__main__":
    task = ("读取 data/scores.json,计算张三两次小测的平均分,"
            "再判断是否达到 85 分的优秀线,并说明依据。")
    print(run(task))
```

### 4.3 怎么读一条真实轨迹

- 运行时你会看到类似第 1 节的打印:第 1 步 Thought 只决定「读文件」;Observation 1 返回全班分数,**模型必须自己从中挑出张三**——这就是「观察修正推理」:若凭印象编,可能拿李四的分数算;第 2 步 Thought 引用 Observation 1 里的 86 与 92 发起 calc;第 3 步比较 89.0 与 85 后收尾。
- 三步各只做一件事,任何一步错了,都能从打印定位是「取数错、算错还是比错」——推理可见性(02 章)在跨轮场景依然成立,还多了一层:每步的 Thought 同时是**下一轮 Action 的辩护词**。

## 5. 动手活动:给课程助教加「规划感」

> [!example] 动手活动:多步工具调用(查→算→答)
>
> **目标**:产出 `react_multi.py`、成绩数据与一条 5 步内的完整轨迹,并逐条写清每个 Thought 的「为什么」。
>
> **步骤**:
> 1. 创建 `data/scores.json`,含至少 4 名学员、每人两次小测成绩(用你自己课程的实名或化名);
> 2. 把 4.2 代码存为 `react_multi.py`(模型名与端点换成 01 可用的),先跑通默认任务;
> 3. 换 3 个新任务,每个都含「查→算→答」,如:谁两次平均分最高?两次都低于 60 分的有几人?全班平均分比上次(假设 81.5)高了多少?
> 4. 把轨迹存进 `reports/react-traces.md`,逐条标注:每个 Action 前模型的意图是否明确、哪一步差点凭记忆编数据;
> 5. 故意把任务里的文件名写成不存在的 `data/missing.json`,观察模型是「承认拿不到并换法」还是「编一个 Observation」。
>
> **完成标准**:① 每个任务都在 5 步内以 Final Answer 收尾;② 报告里能指出至少一处「若不调工具就会编错」的具体数字;③ 能用一句话解释 Observation 为什么不能由模型自己转述。

## 6. 边界与排错

| 症状 | 原因 | 处理 |
|---|---|---|
| 每步一次 LLM 调用,长任务又慢又贵 | ReAct 天然串行:想与做交替,无法跳过推理 | 换 Plan-and-Execute(04 章);独立查询交给 LLMCompiler 式并行调度 |
| 轨迹越滚越大,中后期「忘」了任务 | 每步全文进上下文(呼应 02.02) | 截断 Observation(本代码已限长);压缩历史(02.05) |
| 反复调用同一工具、原地打转 | 模型陷入循环,Thought 没有新信息 | 步数硬上限(已内置)+ 重复动作检测(05 章展开) |
| Thought 很漂亮,Action 却答非所问 | Thought 只是文本,不保证行动质量 | 检查工具描述与参数示例;补 few-shot 轨迹示例(02 章方法) |
| Observation 内容被模型「补全」 | 模型自述观察,违背护栏 | 观察一律代码注入;system prompt 明令禁止编造 |
| 输出格式漂移,Action 解析失败 | 长对话稀释了协议 | 解析失败即终止,不硬猜;或换 function calling(02.04) |

## 7. 总结

| 概念 | 一句话 |
|---|---|
| ReAct | 推理与行动交错:Thought → Action → Observation 循环 |
| 为什么有效 | 行动接地、观察纠正推理,抑制 CoT 的幻觉与错误传播(Yao et al., 2022) |
| 与 CoT 的关系 | CoT 是纯脑内版;ReAct = CoT + 可查证的外部行动 |
| 两种动作编码 | 文本协议(零依赖、解析脆弱)vs function calling(结构化、平台校验) |
| 主要代价 | 每步一次推理、串行、轨迹占上下文 → 04 章 Plan-and-Execute 应运而生 |

**思考题**:同样是「查平均分」,为什么 ReAct 比让模型一次性生成答案可靠?如果要把全班 40 人的成绩都查出来再做两两比较,ReAct 的串行循环会暴露什么成本问题?

> [!note] 参考答案
> 可靠来自接地:Action 调工具拿到真实 Observation,Thought 每一步都建立在可核对的事实上,编错会被下一次观察戳穿;而一次生成没有查证机会,只能靠模型记忆里的「印象分数」硬算。40 人逐个查证意味着至少 40 次工具调用、每次附一轮全量推理,串行且昂贵——若这些查询彼此独立(查张三不影响查李四),理想做法是先整体计划、再并行执行,这正是 04 章 Plan-and-Execute 与 LLMCompiler 的动机。

## 引用

- [Yao et al., 2022:ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)
- [ReAct 项目主页(轨迹示例与代码)](https://react-lm.github.io/)
- [OpenAI:Function calling 指南(结构化动作声明的现状形态)](https://platform.openai.com/docs/guides/function-calling)

上一篇:[Chain-of-Thought 与单步推理](/iopanda-blog/ai/02-agents/03/03/)——CoT 证明了「想」的价值,本章让「想」与「做」交错,补上外部观察。

下一篇:[Plan-and-Execute 与任务分解](/iopanda-blog/ai/02-agents/03/05/)——ReAct 每步都付一次推理费,04 章把「想」集中成一次计划,再逐项执行。
