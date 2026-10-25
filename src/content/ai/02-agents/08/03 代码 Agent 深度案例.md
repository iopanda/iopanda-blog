---
title: "代码 Agent 深度案例"
number: "02.08.03"
chapter: 2
chapterTitle: "Agents"
section: 8
sectionTitle: "Applications and Case Studies"
group: ""
created: 2026-09-03 05:05
author: "iopanda"
tags: ["course", "ai-agent", "agent-applications"]
sourceId: "3.10.2.8 Applications and Case Studies/02 代码 Agent 深度案例"
---
# 代码 Agent 深度案例

> 01 章全景图里,代码 Agent 站在最险也最值的一格:别的形态读数据、答问题,它直接读写文件、执行命令,改动真实地落在磁盘与进程里——它是提效最狠的形态,也是翻车最快的形态。本章拆开它的三层架构:代码检索、沙箱执行、测试反馈闭环(呼应 02.04 的沙箱与 02.07 的回归),再用 Claude Code 与 Copilot 两类真实产品核证一条铁律:**自主必须藏在护栏后面**。对课程助教同样直接:批改学员编程作业,正是这个闭环的最小版本。

**学习目标**:学完本章,你将能够——

1. 说清代码 Agent 与「聊天生成代码」的本质区别:它交付的是被测试验证过的仓库改动;
2. 画出「代码检索→沙箱执行→测试反馈」闭环,并说明每个环节的职责;
3. 列出代码 Agent 的四大风险(执行即高权限、超时死循环、依赖隔离、提示注入)与对应护栏;
4. 对比 Claude Code 与 Copilot 类产品的权限与沙箱设计,解释「自主度来自护栏而非模型」;
5. 运行一个最小代码 Agent,让它在沙箱里迭代修好两个 bug,并说清每一轮的决策依据。

## 1. 概念:代码 Agent 是什么

- **代码 Agent(code agent)**:在仓库上下文中自主完成「定位→修改→验证→再定位」循环的 Agent。它不只是写代码,而是把一段代码改动从「生成」一路推到「被测试证明可用」。
- 与相邻工具的边界,关键看「谁搬运、谁验证」:

| 工具 | 产出 | 谁搬运/验证 |
|---|---|---|
| 代码补全 | 光标处的几行 | 人 |
| 聊天生成代码 | 一段代码文本 | 人复制、人编译 |
| CI/测试机器人 | 检查报告 | 人改代码 |
| 代码 Agent(本章) | 仓库状态的可验证改动 | Agent 自己闭环,人审 diff |

- 核心判断:**代码 Agent 的交付物不是文本,而是副作用**——文件改动与进程执行。文本错了可以撤回,副作用错了可能已污染仓库,风险随能力而来。

## 2. 为什么需要:一次性生成代码为什么不够

- 三个失败模式:① 幻觉结构与 API(生成即交付,没人编译过);② 改错位置(大仓库里不知道动哪个文件);③ 没有反馈(一次生成无法自证正确)。
- 测试是代码世界最可靠的 ground truth:能跑、断言过,就是「对」;跑不过,报错文本就是最精确的失败信号。代码 Agent 把「人肉编译—人肉跑测试—人肉读报错」的循环自动化,人从搬代码升级为审代码。
- 与 02.07 的衔接:这个闭环每一步都可记录、可重放,恰好是轨迹评测与回归要的素材——代码 Agent 是所有形态里「最容易被客观评测」的一档。

## 3. 作用:闭环架构与它在全景里的位置

```text
┌───────────── 人:目标 + 验收标准(测试)─────────────┐
│  ┌──────────── Agent 循环(最多 N 轮)────────────┐  │
│  │ ① 代码检索:搜/读文件,定位改动点             │  │
│  │ ② 生成 diff →(高风险时)请求人确认            │  │
│  │ ③ 沙箱执行:测试与构建,超时即断               │  │
│  │ ④ 读反馈:失败回 ②;通过则输出改动供人审阅     │  │
│  └──────────────────────────────────────────────┘  │
│  护栏带:权限最小化|超时与预算|依赖隔离|审计日志      │
└────────────────────────────────────────────────────┘
```

- 三件套职责与出处:代码检索解决「改哪里」(呼应 02.05 的 04 章语义检索与 02.02 的 02 章窗口预算);沙箱执行解决「敢不敢让它跑」(呼应 02.04 的 04 章代码执行风险);测试反馈闭环解决「对不对」(呼应 02.07 的回归评测)。
- 在 01 章坐标系里,代码 Agent 默认落在**任务型 + 自动闸门**:测试当自动验收,合入前 diff 给人审;危险命令回退到辅助档逐条确认。

## 4. 详细介绍:三件套、真实产品与风险清单

### 4.1 三件套要点

- **代码检索**:关键词(ripgrep 式搜索、符号引用)+ 语义检索把「要改哪里」喂进有限上下文;原则是按需取文件,绝不整仓灌入——仓库常比上下文窗口大几个数量级。
- **沙箱执行**(呼应 02.04/04):隔离强度从硬到软——容器/虚拟机 > OS 沙箱(文件系统白名单 + 网络代理域名白名单)> 临时目录 + 超时。最小纪律三条:超时必设、网络默认关、依赖隔离重建。
- **测试反馈闭环**:红→改→绿,直到通过或触达上限;反馈必须结构化(哪条用例、什么断言、哪行回溯),否则模型读不懂;绿了也不直接合入,改动先给人审。

### 4.2 真实产品形态拆解(web 核证,2025 年形态)

| 维度 | Claude Code(本地 CLI) | Copilot 系列(IDE 内 / 云端) |
|---|---|---|
| 运行位置 | 终端 CLI,跑在开发者机器或容器/VM 里 | VS Code「Agent 模式」在 IDE 内结对;云端 Coding Agent 挂 GitHub Actions 异步干活 |
| 工具面 | 读/编辑/搜索、Bash、WebFetch、MCP(呼应 02.04/05) | 文件编辑、内置终端命令、测试输出监视;同样可扩展 MCP |
| 权限模型 | 权限模式:plan(只读规划)/accept edits(改前确认)/auto(分类器审动作);另有 allow/deny/ask 规则 | Agent 模式自动编辑并跑命令,命令先展示、人可改;云端 Agent 不能 push,以 PR 收口 |
| 沙箱 | Bash 沙箱:只写工作目录等白名单路径,网络经代理按域名白名单放行;无人值守再加容器/VM | IDE 终端沿用本地权限;云端在隔离的 Actions 环境运行 |
| 迭代闭环 | 报错回填→再改→再跑直到测试绿;checkpoint 可回退 | 监视终端与测试输出自动纠错循环;命令支持超时指定 |
| 人的闸门 | 高危命令与新域名要确认;跳过权限的旗标只在隔离环境建议使用 | 人审命令、人审 PR 合入门禁 |

- 读表要点:两家都把「自主」藏在护栏后——Claude Code 靠「沙箱 + 分类器 + 权限模式」,Copilot 靠「IDE 内人审命令 + 云端隔离环境 + PR 门禁」。没有一家提供「裸奔的自主」;自主度提升的每一档,都由更硬的护栏买单(呼应 01 章选型框架)。

### 4.3 风险清单与护栏

| 风险 | 后果 | 护栏 |
|---|---|---|
| 提示注入(README/Issue 文本藏指令) | Agent 执行攻击者命令 | 沙箱兜底 + 高敏工具按来源授权(呼应 01.07) |
| 死循环(改→错→改不停) | 烧钱、改坏仓库 | 迭代上限 + 预算上限 + 命令超时 |
| 依赖投毒 | 装包时执行恶意脚本 | 网络白名单 / 内网源 / 依赖锁定 |
| 破坏性操作 | 删文件、误 push | deny 规则 + 受保护路径 + 人工确认 |
| 上下文膨胀 | 窗口被整仓灌爆 | 检索式取文件,按需入窗 |

- 生成代码可执行 = 高权限:同一个模型,答个问题最多说错话,写代码却可能删库——所以 01 章把它排在「工具权限最高」档,护栏带也最厚。

### 4.4 课程助教的批改闭环(呼应主线)

- 场景:学员交 `geometry.py` 与可见测试;助教 Agent 在沙箱副本里跑测试→定位失败行→生成批注与修改建议,不改学员仓库,批注与评分给人审。权限设计:学员仓库只读、批注文件可写——这正是 01 章「任务型 + 自动闸门」的一个实例,也是 5. 动手活动的原型。

## 5. 动手活动:最小代码 Agent 的沙箱闭环

> [!example] 动手活动:code_agent_demo.py——修 bug 的闭环与沙箱
>
> **目标**:实现「跑测试→读报错→打补丁→再跑」的闭环;让 Agent 在沙箱副本里 3 轮内修好 `geometry.py` 的两个 bug,并观察超时截断与转人工两条退路。真实系统里「读报错出补丁」由 LLM 完成,本 demo 用规则替身,便于离线运行。
>
> **步骤**:
> 1. 保存为 `code_agent_demo.py` 并运行(纯 Python 3 + 标准库 `unittest`,无需装包);
> 2. 观察输出:第 1、2 轮失败并各打一个补丁,第 3 轮全部通过——数清每轮 Agent 是「凭什么」决定改哪里的;
> 3. 给 `TESTS` 加一条 `import time; time.sleep(20)` 的用例再跑,看第 1 轮被超时截断(`run_tests` 的 `timeout=10`);
> 4. 把 `GEOMETRY_BUGGY` 里的 `width + height` 改成 `width / height`(规则匹配不到),观察「转人工」退出码 3——模型不该无限试下去。
>
> ```python
> # code_agent_demo.py —— 最小代码 Agent:沙箱执行 + 测试反馈闭环(纯 Python 3,零依赖)
> import os
> import subprocess
> import tempfile
> from pathlib import Path
>
> GEOMETRY_BUGGY = """\
> def area_of_rect(width, height):
>     return width + height
>
> def perimeter_of_rect(width, height):
>     return width * height
> """
>
> TESTS = """\
> import unittest
> from geometry import area_of_rect, perimeter_of_rect
>
> class GeometryTest(unittest.TestCase):
>     def test_area(self):
>         self.assertEqual(area_of_rect(3, 4), 12)
>
>     def test_perimeter(self):
>         self.assertEqual(perimeter_of_rect(3, 4), 14)
>
> if __name__ == "__main__":
>     unittest.main()
> """
>
> # 模型替身规则:失败标记 -> 旧片段 -> 新片段(真实系统由 LLM 决策)
> FIX_RULES = [
>     ("FAIL: test_perimeter",
>      "def perimeter_of_rect(width, height):\n    return width * height",
>      "def perimeter_of_rect(width, height):\n    return 2 * (width + height)"),
>     ("FAIL: test_area", "return width + height", "return width * height"),
> ]
>
> def make_workspace():
>     """造沙箱工作区:把学员仓库复制进系统临时目录,随便折腾不心疼。"""
>     workdir = Path(tempfile.mkdtemp(prefix="agent_sandbox_"))
>     (workdir / "geometry.py").write_text(GEOMETRY_BUGGY, encoding="utf-8")
>     (workdir / "test_geometry.py").write_text(TESTS, encoding="utf-8")
>     return workdir
>
> def run_tests(workdir, timeout=10):
>     """沙箱执行:超时即断;真实系统换成容器/OS 沙箱并加网络白名单。"""
>     env = dict(os.environ, PYTHONDONTWRITEBYTECODE="1")  # 禁字节码缓存:防同秒内改完仍跑旧代码
>     try:
>         proc = subprocess.run(
>             ["python3", "-m", "unittest", "-v", "test_geometry"],
>             cwd=str(workdir), capture_output=True, text=True, timeout=timeout,
>             env=env)
>         return {"ok": proc.returncode == 0, "timed_out": False,
>                 "output": proc.stdout + proc.stderr}
>     except subprocess.TimeoutExpired as exc:
>         return {"ok": False, "timed_out": True, "output": str(exc)}
>
> def decide_fix(test_output):
>     """读报错出补丁:按失败标记挑规则;真实系统这一步是 LLM 的 Thought。"""
>     for trigger, old, new in FIX_RULES:
>         if trigger in test_output:
>             return old, new
>     return None, None
>
> def apply_patch(workdir, old, new):
>     """把补丁落进沙箱副本;真实系统先产出 diff 供人审。"""
>     path = workdir / "geometry.py"
>     source = path.read_text(encoding="utf-8")
>     if old not in source:
>         return False
>     path.write_text(source.replace(old, new, 1), encoding="utf-8")
>     return True
>
> def main():
>     workdir = make_workspace()
>     max_attempts = 5
>     print("沙箱工作区: %s" % workdir)
>     for attempt in range(1, max_attempts + 1):
>         result = run_tests(workdir, timeout=10)
>         if result["timed_out"]:
>             print("第 %d 轮:测试超时被截断,终止本轮(真实系统按预算计费并告警)" % attempt)
>             return 2
>         if result["ok"]:
>             print("第 %d 轮:全部测试通过——闭环收敛,输出改动供人审阅后合入" % attempt)
>             return 0
>         print("第 %d 轮:测试失败,读报错定位……" % attempt)
>         old, new = decide_fix(result["output"])
>         if old is None or not apply_patch(workdir, old, new):
>             print("没有可用修复策略,转人工——模型不该无限试下去")
>             return 3
>         print("  替换 %r 为 %r" % (old.splitlines()[-1].strip(), new.splitlines()[-1].strip()))
>     print("超过 %d 轮仍未通过,挂起转人工" % max_attempts)
>     return 1
>
> if __name__ == "__main__":
>     raise SystemExit(main())
> ```
>
> **完成标准**:脚本按 4.1 的闭环收敛——第 3 轮输出「全部测试通过」,且你能指着输出说明每轮决策依据(哪条用例失败、规则怎么选、补丁落在哪);加慢用例后第 1 轮被超时截断;改坏修复规则后以退出码 3 转人工。若临时目录残留看不顺眼,`rm -rf` 掉打印出的路径即可(沙箱副本本就可随手丢弃)。

## 6. 边界与排错

| 症状 | 原因 | 处理 |
|---|---|---|
| Agent 反复改同一处还失败 | 反馈不结构化,模型没读到真断言 | 检查测试输出是否含用例名与断言值;必要时截断超长输出 |
| 沙箱里全绿,宿主机崩 | 依赖/环境不一致 | 依赖锁定 + 与 CI 同构的镜像;别信「我机器上能跑」 |
| 改坏了文件 | 编辑越界或上下文读错 | 只读默认 + diff 审阅 + git 回退(checkpoint) |
| 一跑就超时 | 测试里有死循环或网络等待 | 命令超时 + 网络白名单;长任务改异步 |
| 仓库里有恶意指令文本 | 提示注入(内容与指令同通道) | 沙箱兜底 + 高敏工具禁止自动授权 |

- 边界提醒:闭环质量的上限是**测试覆盖**——测试漏了的行为,Agent 和你一样看不见(呼应 02.07 的黄金任务集思想);跨几十个文件的大重构超出单 Agent 上下文时,该交给规划分解(02.03)或多 Agent 协作(02.06),而不是硬塞一个超长循环。

## 7. 总结

| 概念 | 一句话 |
|---|---|
| 代码 Agent | 在仓库里「定位→修改→验证」循环,交付被测试证明的改动 |
| 为什么需要 | 一次生成无反馈;测试闭环把验证成本压到可反复迭代 |
| 三件套 | 代码检索(找对地方)+ 沙箱执行(敢跑)+ 测试反馈(知道对错) |
| 真实形态 | Claude Code:权限模式+沙箱;Copilot:人审命令+隔离环境+PR 门禁 |
| 风险主线 | 可执行=高权限;每提一档自主度,就要付一档更硬的护栏 |

**思考题**:代码 Agent 的「测试反馈闭环」和 02.07 的「回归评测」是什么关系?为什么 Claude Code 与 Copilot 都不敢提供「无护栏的完全自主」?

> [!note] 参考答案
> 同一思想的两处落地:闭环里每次跑测试是「单次任务的自动验收」,回归评测是把一组 golden 任务长期反复跑,防「修好一个坏十个」——前者保证这一次改对,后者保证一直改对。不敢裸奔是因为代码 Agent 的动作有真实副作用(文件、进程、网络),一旦被注入或误判,损失不可逆;所以产品把自主度每一档都配了硬护栏:沙箱限制能碰到什么,权限规则/分类器决定要不要问人,PR/审计记录做了什么——自主越大,越要靠护栏把错误代价压回 01 章决策表的「低代价」区间。

## 引用

- [Claude Code 文档:权限模式与沙箱(plan/accept edits/auto 与 Bash 沙箱)](https://code.claude.com/docs/en/permission-modes)
- [Anthropic Engineering:Making Claude Code more secure and autonomous with sandboxing](https://www.anthropic.com/engineering/claude-code-sandboxing)
- [VS Code Blog:Introducing GitHub Copilot agent mode(2025-02-24)](https://code.visualstudio.com/blogs/2025/02/24/introducing-copilot-agent-mode)
- [GitHub Docs:About GitHub Copilot coding agent(云端异步形态)](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent)

上一篇:[Agent 应用形态全景](/iopanda-blog/ai/02-agents/08/02/)——01 章把代码 Agent 排在「工具权限最高、护栏最厚」一格,本章用闭环架构与真实产品把这一格填实。

下一篇:[数据分析与浏览器 Agent 案例](/iopanda-blog/ai/02-agents/08/04/)——代码 Agent 的闭环是「改代码→跑测试」;下一章的两位主角换成「查数据→出图」与「看网页→点按钮」,失败模式也跟着换。
