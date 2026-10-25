---
title: "Plan-and-Execute 与任务分解"
number: "02.03.05"
chapter: 2
chapterTitle: "Agents"
section: 3
sectionTitle: "Planning and Reasoning"
group: ""
created: 2026-09-03 04:15
author: "iopanda"
tags: ["course", "ai-agent", "planning-reasoning", "plan-execute"]
sourceId: "3.10.2.3 Planning and Reasoning/04 Plan-and-Execute 与任务分解"
---
# Plan-and-Execute 与任务分解

> 03 章的 ReAct 每走一步都要大模型想一轮:灵活,但也贵——查 40 人的成绩要付 40 次全量推理费,而且它只看得到眼前一步,容易绕路。可很多任务(备课、写调研报告、期末总结)的步骤事前就能枚举:先搜集、再大纲、后撰写、终校对,顺序几乎固定。本章的 Plan-and-Execute(先计划后执行)把「想」从「做」里抽出来:**先让模型产出一份完整计划,再逐项执行,必要时修订**——它把 01 章「目标→子目标→步骤」从设计稿变成运行时的一等公民。读完你会跑通一个最小实现,并用对比表看清它与 ReAct 各自该为哪类任务买单。

**学习目标**:学完本章,你将能够——

1. 说出 Plan-and-Execute 的两段式结构(planner 产计划、executor 逐项执行)与 ReAct 边想边做的区别;
2. 用「任务可否预分解」判据判断:何时计划先行、何时边想边做、何时不需要规划;
3. 复述 P&E 相对 ReAct 的收益(省 token、全局视野、可审计)与代价(僵化、计划过期、首跳延迟);
4. 说清三种变体——计划修订、子任务嵌套、并行子任务(LLMCompiler 思路),并引用其性能数据;
5. 跑通一个最小 P&E,产出同一任务在 ReAct 与 P&E 下的步数/调用次数对比表(3 次统计实验留给 06 章)。

## 1. 概念:Plan-and-Execute 是什么

- **Plan-and-Execute(P&E)**:先让**规划器**(planner)把任务分解为显式的步骤清单(plan),再由**执行器**(executor)逐项执行;步骤结果回传规划器,决定继续、修订或收尾(LangChain 2023 提出该工程范式,引用 1)。与 ReAct 的本质区别在**决策时机**:ReAct 每步临时想,计划散落在各轮 Thought 里;P&E 把「想」集中成一次可检查的计划,「做」只认领其中一步。
- **任务分解**:把「目标」翻译成「有序步骤」并暴露步骤间依赖。课程助教任务「出一份期末 SQL 复习计划」,规划器可能产出:`① 读章节地图 → ② 统计薄弱知识点 → ③ 生成复习卡 → ④ 汇总成文档并给时间建议`。

- 呼应 01 章:目标→子目标→步骤在 P&E 里被**显式生成并逐条执行**,规划成为可展示、可修订、可评测的产物;灵感源头是 Plan-and-Solve 提示与 BabyAGI 工程(均见引用 1、2)。

## 2. 为什么需要:什么时候计划先行

- **ReAct 的两笔隐性账单**(03 章实测):① 每个工具动作都要一次完整 LLM 推理,动作越多越贵;② 每轮只计划「一个子问题」,看不到全局,容易走出次优轨迹(先查 A 发现要 B,查了 B 又发现该先查 C)。这两个批评正是 P&E 的出发点(引用 1)。
- **P&E 的三条收益**:① 一次想全局——让规划器想清楚整条任务链,本身就能减少遗漏(呼应 02 章 CoT 思路);② 执行可降配——executor 步骤职责单一,可换更小更便宜的模型,大模型只在计划与收尾时出场;③ 计划可审计——学员能看到「你打算怎么做」,错误可精确到「第 2 步计划错了」还是「执行错了」。
- **判据清单**(答案不是「哪个更好」,而是「哪类任务」):

| 判据 | 倾向 ReAct | 倾向 P&E |
|---|---|---|
| 任务能否预分解 | 不能:结果未知、边探边定(修未复现的 bug) | 能:步骤可事前枚举(报告 = 搜集+大纲+撰写+校对) |
| 步骤依赖事前是否可知 | 依赖在执行中才暴露 | 依赖基本固定,只有局部不确定 |
| 中途转向频率 | 高:世界变化快(实时行情、开放问答) | 低:信息源稳定(课程资料、本地文件) |
| 步骤数量与单价 | 少(1~3 步):计划本身是浪费 | 多(≥5 步):计划成本被摊薄 |

## 3. 作用:ReAct vs Plan-and-Execute

| 维度 | ReAct(03 章) | Plan-and-Execute(本章) |
|---|---|---|
| 决策时机 | 边想边做,每步临时决定 | 先整体计划,再逐项执行 |
| 全局视野 | 弱:只计划眼前一步,易绕路 | 强:计划覆盖全任务,遗漏更少 |
| 单步成本 | 每动作一次全量推理,贵 | 执行可复用上下文、可换轻模型,省 |
| 灵活性 | 高:观察随时改变下一步 | 低:中途新信息可能被计划「无视」 |
| 计划过期风险 | 低:计划从未固化 | 高:世界变了计划没变 → 需修订 |
| 可审计性 | 轨迹可见,但意图散 | 计划即蓝图,错误定位到步骤 |
| 一句话 | 灵活 / 贵 / 易漂移 | 省 / 僵 / 会过期 |

- 两模式**不是互斥**而是可组合:经典做法是「P&E 的 executor 内部再跑 ReAct」——计划定骨架,执行留机动,计划外情况由内层 ReAct 兜底;反之,ReAct 长任务也可周期性「抬头」生成阶段计划。本章参考代码就演示了前者。

## 4. 详细介绍:最小实现与三种变体

### 4.1 最小 P&E 流程

```
1. plan(task):规划器一次 LLM 调用,输出编号步骤清单;
2. 循环 steps:把「当前步骤 + 已完成上下文」交给 executor;
3. executor 内嵌 ReAct(≤3 个动作)完成该步,返回步骤结果;
4. 任一步失败 → 失败原因回传规划器,修订计划重跑;全部完成 → solver 汇总生成最终回答。
```

### 4.2 参考代码(plan_execute_demo.py)

```python
"""plan_execute_demo.py —— 最小 Plan-and-Execute:计划 → 逐项执行 → 失败修订。
复用 03 章 react_multi.py 的工具表(read_scores / calc),先把该文件放同目录。"""
import re
from openai import OpenAI
from react_multi import TOOLS        # 03 章的工具注册表,import 不会触发其 main

client = OpenAI()                    # 默认读 OPENAI_API_KEY;自建端点加 base_url=...
MODEL = "gpt-4o-mini"                # 换成你 01 部署的模型名

PLANNER_SYSTEM = "你是规划器。把用户任务分解为 3~5 步,每行一步,只输出编号列表,不要输出其他内容。"
EXEC_SYSTEM = """你是执行器,为完成当前这一步按 ReAct 格式工作:
Thought: 思考
Action: read_scores["路径"] 或 calc["算式"]
步骤完成时输出:Done: 步骤结果
Observation 由系统注入,不得编造。"""

def complete(messages: list) -> str:
    """一次 OpenAI 兼容调用,返回文本。"""
    reply = client.chat.completions.create(
        model=MODEL, temperature=0, messages=messages)
    return reply.choices[0].message.content or ""

def plan(task: str) -> list:
    """规划器:一次调用产出编号计划,正则解析成步骤列表。"""
    text = complete([{"role": "system", "content": PLANNER_SYSTEM},
                     {"role": "user", "content": task}])
    return re.findall(r"^\d+\.\s*(.+)$", text, re.M)

def run_step(step: str, max_actions: int = 3) -> str:
    """执行器:步骤内嵌迷你 ReAct(03 章循环的简化版)。"""
    messages = [{"role": "system", "content": EXEC_SYSTEM},
                {"role": "user", "content": step}]
    for _ in range(max_actions):
        text = complete(messages)
        if "Done:" in text:
            return text.split("Done:", 1)[1].strip()
        m = re.search(r'Action:\s*(\w+)\[(?:["\']([^"\']+)["\']\]', text)
        if not m:
            return "失败:无法解析 Action"
        try:
            obs = TOOLS[m.group(1)](m.group(2))
        except Exception as exc:     # 工具报错、文件缺失都算步骤失败
            obs = f"失败:工具执行出错:{exc}"
        messages += [{"role": "assistant", "content": text},
                     {"role": "user", "content": f"Observation: {obs}"}]
    return "失败:该步骤动作数超限"

def main():
    task = ("读取 data/scores.json,找出两次小测都低于 60 分的学员名单,"
            "并计算他们两次的平均分。")
    results, note = [], ""
    for attempt in range(2):         # 至多两轮:任一步失败 → 修订计划再跑
        steps = plan(task + note)
        print("== 计划 ==\n" + "\n".join(steps))
        for idx, step in enumerate(steps, 1):
            print(f"== 执行第 {idx} 步: {step}")
            out = run_step(step)
            print(f"结果: {out[:200]}")
            if out.startswith("失败"):
                note = f"\n提示:第 {idx} 步失败({out}),请修订计划完成剩余目标。"
                break
            results.append(out)
        else:                        # 本轮全部成功,收尾
            break
    final = complete([{"role": "system", "content": "你是课程助教,汇总分步结果成最终回答。"},
                      {"role": "user", "content": "\n".join(f"{i}. {r}"
                                                     for i, r in enumerate(results, 1))}])
    print(f"\n== 最终回答 ==\n{final}")

if __name__ == "__main__":
    main()
```

### 4.3 三种变体:让计划活起来

| 变体 | 做法 | 解决什么 | 代表 |
|---|---|---|---|
| ① 计划修订 | 每步(或每几步)执行后把结果交回规划器,决定继续/修订/收尾 | 计划过期、执行与假设不符 | LangGraph 版 P&E:每步后都问 planner(引用 2) |
| ② 子任务嵌套 | 步骤内部再分解或内嵌 ReAct/P&E(分层规划) | 单步仍太粗,需要机动 | 本章代码:executor 内嵌迷你 ReAct |
| ③ 并行子任务 | 规划器输出带依赖的 DAG,调度器按依赖并行派发 | ReAct 串行慢、独立查询被排队 | LLMCompiler(ICML 2024,引用 3) |

- **LLMCompiler 细节**(引用 3):规划器一次生成任务图(DAG:节点 = 工具调用,边 = 依赖),Task Fetching Unit 在依赖满足后立即并行派发,Executor 并行执行,Joiner 汇总或触发再规划;论文报告相对 ReAct 延迟最高加速 3.7×、成本最多省 6.7×、准确率提升约 9%,代价是规划阶段本身不可并行。同族还有 ReWOO:计划里用 `#E1` 变量引用前序输出,省掉中间 Observation 全量回填(引用 2)。
- 共同规律:**计划是「一次性投资」,步骤越多、依赖越清晰,回报越高**;步骤少或依赖混沌时,ReAct 的直接反而更稳。

## 5. 动手活动:ReAct vs Plan-and-Execute 对比

> [!example] 动手活动:同一任务跑两种模式
>
> **目标**:产出 `plan_execute_demo.py` 与 `reports/pe-vs-react.md`,用同一任务对比两种模式的步数与调用次数。
>
> **步骤**:
> 1. 确认 03 章产物就位:`react_multi.py` 与 `data/scores.json` 在练习目录;
> 2. 把 4.2 代码存为 `plan_execute_demo.py` 并跑通(模型名与端点换成 01 可用的);
> 3. 用同一任务(建议 4~5 步型:「统计全班两次小测平均分,列出两次都低于 60 分的学员并给补强建议」)分别跑 `react_multi.py`(ReAct 基线)与本文件;
> 4. 记录 LLM 调用次数、工具调用数、计划是否被修订、最终是否完成,填入 `reports/pe-vs-react.md` 对比表;
> 5. 制造一次计划过期:临时把数据文件改名再跑,观察 executor 失败 → 修订计划的重排过程,并把结论写进报告(「哪种模式该用在哪类任务」,正式 3 次统计实验留到 06 章);
>
> **完成标准**:① 对比表含两种模式的调用次数/工具数/是否修订/完成情况;② 能指出 P&E 省在哪几次调用、ReAct 多付了什么;③ 有一次计划过期的实测记录与修订轨迹。

## 6. 边界与排错

| 症状 | 原因 | 处理 |
|---|---|---|
| 计划引用不存在的文件,执行必败 | 计划幻觉:规划器「想象」了资源 | executor 校验工具与参数;失败信息回传规划器触发修订(4.2 已演示) |
| 执行与计划脱节:世界变了或冒出新信息 | 计划过期 / 僵化:executor 只认步骤文本 | 每步校验关键假设;步骤内嵌 ReAct 兜底;「意外情况上报」写进提示;周期性 re-plan |
| 分解粒度不当:过细则计划又长又僵,过粗则每步仍是完整任务 | 粒度没对准「可交付结果」 | 目标 3~8 步;每步对应一个可交付结果,而非单个动作 |
| 简单任务也要先等完整计划 | 首跳延迟 | 步骤 ≤3 或不可预分解的任务直接 ReAct(第 2 节判据) |
| 长计划撑爆上下文 | 计划与轨迹都在窗口里 | 计划落盘/向量库,只把当前步骤带进上下文(02.05 预告) |

## 7. 总结

| 概念 | 一句话 |
|---|---|
| Plan-and-Execute | 先让规划器产出显式步骤清单,executor 逐项执行,必要时修订 |
| 为什么需要 | ReAct 每动作一次推理且只看局部;可预分解任务计划先行:全局视野、省 token、可审计,错误能定位到步骤 |
| 代价 | 僵化、计划过期、首跳延迟 → 修订机制是标配 |
| 三种变体 | 计划修订 / 子任务嵌套 / 并行子任务(LLMCompiler:3.7× 延迟、6.7× 成本) |
| 选型 | 可预分解选 P&E,探索型选 ReAct,单步什么都不选 |

**思考题**:同一个 10 步任务,ReAct 大致要多少次 LLM 调用,P&E 呢?P&E 最怕遇到什么类型的任务,为什么修订机制救不了它?

> [!note] 参考答案
> ReAct 约 10 次以上(每动作一次推理,还可能绕路加步);P&E 约「1 次计划 + 每步 1~2 次执行 + 1 次汇总」,且执行步可用轻模型,总 token 通常更省。P&E 最怕「步骤无法事前枚举」的探索型任务,比如修一个未复现的 bug:计划写得再全,执行中发现的新信息会不断推翻后续步骤,修订一次只补一步,频繁重计划反而比 ReAct 更贵更慢;这类任务该用 ReAct,或「计划只做粗骨架、执行内嵌 ReAct」的混合形态。

## 引用

- [LangChain:Plan-and-Execute Agents(2023 原始介绍:Action Agents 的账单与两段式设计)](https://www.langchain.com/blog/plan-and-execute-agents)
- [LangChain Blog:Plan-and-Execute Agents(2024 LangGraph 版,含 ReWOO 与 LLMCompiler 对比)](https://www.langchain.com/blog/planning-agents)
- [Kim et al., ICML 2024:An LLM Compiler for Parallel Function Calling(LLMCompiler)](https://arxiv.org/abs/2312.04511)

上一篇:[ReAct 推理与行动交错](/ai/02-agents/03/04/)——本章把它的「每步临时想」升级成「先计划后执行」,各付各的账。

下一篇:[失败处理与自我修正](/ai/02-agents/03/06/)——无论 ReAct 还是 P&E 都会失败:工具报错、结果不符、计划过期,05 章教 Agent 怎么优雅地错下去。
