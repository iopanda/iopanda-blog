---
title: "Training and Fine-tuning Frameworks"
number: "03.03.01"
chapter: 3
chapterTitle: "Frameworks"
section: 3
sectionTitle: "Training and Fine-tuning Frameworks"
group: ""
created: 2026-09-03 23:45
author: "iopanda"
tags: ["ai", "frameworks", "training", "fine-tuning", "learning-path"]
sourceId: "3.10.3.3 Training and Fine-tuning Frameworks/README"
---
# Training and Fine-tuning Frameworks

> `01 Models` 已经把预训练、微调、对齐、评测、推理和治理的基本能力讲清楚了；`03.01 Agent Frameworks` 讨论了 Agent 系统如何承载；`03.02 RAG and Retrieval Frameworks` 又把检索增强从技巧提升为系统。接下来的 `03.03 Training and Fine-tuning Frameworks` 要回答的是另一类非常工程化的问题：**当你真的要训练、继续预训练、监督微调、偏好优化、QLoRA、对齐或指令工厂化时，应该拿什么框架承载训练流水线、配置、分布式、数据、模板和实验纪律？** 这一章不把 fine-tuning 看成“跑一条脚本”，而是把它视为数据—配置—训练器—分布式—评测—导出的完整工程链路。[77][78][79][80][81]

**学习目标**：完成本模块后，你将能够——

1. 区分五条主流 training / fine-tuning framework 路线：统一微调工厂、极致提速路线、参数高效微调库、对齐/RLHF 框架、脚本化训练编排框架；
2. 解释为什么同样是做 SFT/LoRA/QLoRA/DPO，不同框架的设计中心完全不同；
3. 用模型规模、显存约束、训练任务类型、分布式复杂度、团队工程偏好，为真实项目选框架；
4. 判断什么时候你需要的是“完整训练工厂”，什么时候只需要“在现有栈里补一个库”；
5. 为一个课程助教或领域助手写出 fine-tuning framework 选型卡。

## 1. 为什么 03 还要单开一个 Training Framework 模块

- 很多团队第一次做微调，会误以为它只是：准备数据 → 写 YAML / CLI 参数 → 跑 trainer。
- 但一旦任务从 demo 变成工程，就会出现：
  - 数据模板和聊天格式怎么统一；
  - LoRA/QLoRA、全参、DPO、PPO、GRPO 到底由谁承载；
  - 分布式、混精度、梯度检查点、FSDP/DeepSpeed 这些由谁管理；
  - 导出成 Hugging Face / GGUF / 推理可用格式时谁兜底；
  - 如何在速度、显存、质量、代码透明度之间做取舍；
  - 哪些是训练框架问题，哪些其实是底层 infra 问题。
- 所以 training framework 的真正价值，不在“少敲命令”，而在：**把训练链路中最容易失控的复杂度收进一种稳定语言。**

## 2. 2026-09 我建议这一模块先聚焦的 top 5

> [!note] 现实边界
> 这里的 top 5 不是“训练生态唯一正确榜单”，而是按 2026-09 的工程代表性和教学价值筛出来的五条路线：统一训练工厂、极致加速微调、参数高效微调库、对齐/RLHF 框架、配置驱动训练编排。[77][78][79][80][81]

| 框架 | 一句话定位 | 设计中心 | 更像什么 | 更适合谁 |
|---|---|---|---|---|
| [LLaMA-Factory](/iopanda-blog/ai/03-frameworks/03/02/) | 统一高效微调工厂 | SFT、DPO、RLHF、VLM、模板、导出一体化 | 训练平台 / 统一工厂 | 想快速覆盖多模型多任务微调的团队 |
| [Unsloth](/iopanda-blog/ai/03-frameworks/03/09/) | 极致显存/速度优化的微调路线 | 快速 LoRA/QLoRA、低显存、易上手 | 加速器 / 微调提速框架 | 资源紧张、希望迅速把微调跑起来的团队 |
| [PEFT](/iopanda-blog/ai/03-frameworks/03/16/) | 参数高效微调库 | LoRA/IA3/AdaLoRA 等方法抽象 | 训练能力库 | 已有 Hugging Face 训练栈、只想补 PEFT 能力的团队 |
| [TRL](/iopanda-blog/ai/03-frameworks/03/23/) | 对齐与偏好优化训练框架 | SFT、DPO、PPO、奖励建模、RLHF | 对齐训练框架 | 重点做 alignment / preference optimization 的团队 |
| [Axolotl](/iopanda-blog/ai/03-frameworks/03/30/) | 配置驱动的 LLM 微调编排框架 | YAML 驱动、多后端、多训练 recipe | 训练编排框架 | 想用配置管理复杂训练 recipe 的团队 |

## 3. 为什么先不把 DeepSpeed / Transformers / Accelerate 放进这组 top 5 主角

- `Transformers` / `Accelerate` 极其重要，但更像这一章所有路线的共同底层训练栈，而不是“fine-tuning framework 的风格代表”；
- `DeepSpeed` 极其重要，但更像 distributed training / optimization infrastructure，而不是这组“微调框架语言”的主角；
- `OpenRLHF` 也值得讲，但如果这一章第一批主角只留 5 个，`TRL` 更像当代更通用的 alignment 入口，而 `OpenRLHF` 更适合后续在 RLHF / large-scale alignment / Ray-based infra 子话题中展开。

换句话说，这一章先讲“你用什么语言组织 training / fine-tuning complexity”，而不是先讲底层加速 infra 怎么选。

## 4. 这一模块建议怎么读

1. 先看 [03 PEFT](/iopanda-blog/ai/03-frameworks/03/16/)：先把参数高效微调抽象钉牢；
2. 再看 [04 TRL](/iopanda-blog/ai/03-frameworks/03/23/)：理解对齐/偏好优化为什么是另一层训练问题；
3. 再看 [01 LLaMA-Factory](/iopanda-blog/ai/03-frameworks/03/02/)：理解“统一训练工厂”路线；
4. 再看 [05 Axolotl](/iopanda-blog/ai/03-frameworks/03/30/)：理解“配置即训练 recipe”路线；
5. 最后看 [02 Unsloth](/iopanda-blog/ai/03-frameworks/03/09/)：理解“提速和省显存”为什么会成为框架主卖点。

## 4.1 按读者身份的推荐阅读路径

| 你是谁 | 建议先读什么 | 为什么 |
|---|---|---|
| 已有 Hugging Face 训练经验的人 | [PEFT](/iopanda-blog/ai/03-frameworks/03/16/) → [TRL](/iopanda-blog/ai/03-frameworks/03/23/) | 先在熟悉训练栈上叠加 PEFT 与 alignment 能力 |
| 资源受限 / 单卡开发者 | [Unsloth](/iopanda-blog/ai/03-frameworks/03/09/) → [PEFT](/iopanda-blog/ai/03-frameworks/03/16/) | 先解决“跑得起来”，再理解抽象 |
| 想快速跑多模型、多任务微调的人 | [LLaMA-Factory](/iopanda-blog/ai/03-frameworks/03/02/) | 统一工厂路线最直接 |
| 喜欢配置驱动和 recipe 管理的人 | [Axolotl](/iopanda-blog/ai/03-frameworks/03/30/) | 训练编排语言清晰 |
| 重点做偏好优化 / alignment 的人 | [TRL](/iopanda-blog/ai/03-frameworks/03/23/) | 对齐训练是第一主线 |

## 4.2 按系统主矛盾的速查表

| 你的系统最先会死在哪 | 优先想到 |
|---|---|
| 训练方法多、模型多、模板多，统一管理困难 | [LLaMA-Factory](/iopanda-blog/ai/03-frameworks/03/02/) |
| 显存不够、训练太慢、单卡想把 QLoRA 跑起来 | [Unsloth](/iopanda-blog/ai/03-frameworks/03/09/) |
| 已有训练栈稳定，只缺参数高效微调抽象 | [PEFT](/iopanda-blog/ai/03-frameworks/03/16/) |
| 重点是 DPO / PPO / reward modeling / RLHF | [TRL](/iopanda-blog/ai/03-frameworks/03/23/) |
| 训练 recipe 多、配置复杂、希望 YAML 驱动实验 | [Axolotl](/iopanda-blog/ai/03-frameworks/03/30/) |

## 4.3 这章最容易读偏的三个误区

- **误区一：把 fine-tuning framework 当成“命令行皮肤”。** 真正差异在训练复杂度如何被组织；
- **误区二：把 distributed infra 和 fine-tuning framework 混成一回事。** DeepSpeed/FSDP 更像底层能力，不完全等于上层框架路线；
- **误区三：只看谁支持的训练方法多。** 真正要看的是：你的任务、显存、模板、配置、评测、导出复杂度，谁才是主矛盾。

## 4.4 如果你时间不够，只读哪三篇

如果你现在不是在系统建课，而是在真实项目里要尽快做判断，我建议优先读这三篇：

1. [03 PEFT](/iopanda-blog/ai/03-frameworks/03/16/)
   - 因为它先把“参数高效微调到底在抽象什么”钉牢；
2. [04 TRL](/iopanda-blog/ai/03-frameworks/03/23/)
   - 因为它告诉你“普通 SFT”与“alignment / preference optimization”不是一回事；
3. [06 Training Framework 选型矩阵](/iopanda-blog/ai/03-frameworks/03/37/)
   - 因为最后真正落地时，你要做的是架构判断，而不是框架背诵。

如果读完这三篇你仍然觉得：
- 训练入口太散，再回去看 [01 LLaMA-Factory](/iopanda-blog/ai/03-frameworks/03/02/)；
- 机器根本训不动，再回去看 [02 Unsloth](/iopanda-blog/ai/03-frameworks/03/09/)；
- recipe 和长期治理最痛，再回去看 [05 Axolotl](/iopanda-blog/ai/03-frameworks/03/30/)。

## 5. 我建议本模块的内容结构

1. 总览 README
2. 每个 framework 一个总 README
3. 每个 framework 至少拆成 4~6 篇：
   - 设计哲学 / 核心抽象
   - 数据/模板/配置/训练器 架构
   - 分布式/显存/导出/评测 等差异化能力
   - 课程助教或领域助手案例
   - 与其他框架的深度对比
4. 最后收口一篇：[06 Training Framework 选型矩阵](/iopanda-blog/ai/03-frameworks/03/37/)

## 6. 本模块的推荐交付物

| 交付物 | 说明 | 验收标准 |
|---|---|---|
| finetune-stack-card.md | 某个项目的训练栈结构卡 | 能回答“为什么这套栈能支撑数据、训练、导出和评测” |
| finetune-eval-plan.md | 微调后评测计划 | 能区分训练损失、离线质量、上线风险 |
| framework-selection-card.md | 训练框架选型卡 | 能解释“为什么选 A，不选 B” |

## 6.1 建议配套产物

如果要把这一章学成“可进设计评审的训练能力”，建议至少同时产出四样东西：

1. `dataset-and-template-card.md`
   - 列数据格式、chat template、system prompt 约定；
2. `finetune-stack-card.md`
   - 列训练器、微调方法、分布式后端、导出链；
3. `finetune-eval-plan.md`
   - 列 SFT/DPO/RLHF 对应的评测口径；
4. `training-framework-selection-card.md`
   - 写清为什么选某个训练框架，不选其他路线。

## 6.2 我更推荐的最小闭环产物

如果你不想一上来写很多文档，最小也要交出下面三样东西：

| 最小交付物 | 为什么不能省 |
|---|---|
| `dataset-and-template-card.md` | 没有它，训练/推理协议最容易静默错配 |
| `finetune-stack-card.md` | 没有它，团队很快说不清训练器、adapter、分布式、导出谁负责什么 |
| `training-framework-selection-card.md` | 没有它，框架选择就只能退化成“谁更火” |

这三个东西加起来，才构成一个最小可审计训练方案：
- 数据怎么进来；
- 训练链怎么组织；
- 为什么是这套框架，而不是别的。

## 6.3 这章学完之后，你应该真的会什么

学完这一章，理想状态不是“我知道 5 个框架名字”，而是你真的能完成下面三件事：

1. 看到一个项目，就能先判断它最痛的是资源、方法、对齐、工厂，还是 recipe 治理；
2. 能写出一页纸说明：为什么这里选 PEFT / TRL / Unsloth / LLaMA-Factory / Axolotl；
3. 能在设计评审里把“训练系统”讲成一个可交付架构，而不是一串命令。

## 7. 本模块笔记导航

1. [01 LLaMA-Factory](/iopanda-blog/ai/03-frameworks/03/02/)
2. [02 Unsloth](/iopanda-blog/ai/03-frameworks/03/09/)
3. [03 PEFT](/iopanda-blog/ai/03-frameworks/03/16/)
4. [04 TRL](/iopanda-blog/ai/03-frameworks/03/23/)
5. [05 Axolotl](/iopanda-blog/ai/03-frameworks/03/30/)
6. [06 Training Framework 选型矩阵](/iopanda-blog/ai/03-frameworks/03/37/)

## 8. 总结

| 关键问题 | 一句话 |
|---|---|
| 这一模块讲什么 | 不是“怎么跑训练脚本”，而是“如何组织 fine-tuning system” |
| 为什么单开 | 训练复杂度来自数据、模板、方法、显存、分布式、导出、评测的组合 |
| top 5 是谁 | LLaMA-Factory / Unsloth / PEFT / TRL / Axolotl |
| 五条路线分别代表什么 | 统一训练工厂 / 极致提速 / PEFT 能力库 / 对齐框架 / 配置驱动编排 |
| 学习重点 | 学会判断 training complexity 的主矛盾，而不是背命令 |

## 引用

- [77] https://github.com/huggingface/peft — PEFT GitHub
- [78] https://github.com/huggingface/trl — TRL GitHub
- [79] https://github.com/hiyouga/LLaMA-Factory — LLaMA-Factory GitHub
- [80] https://github.com/axolotl-ai-cloud/axolotl — Axolotl GitHub
- [81] https://github.com/unslothai/unsloth — Unsloth GitHub
- [82] https://github.com/microsoft/DeepSpeed — DeepSpeed GitHub
- [83] https://github.com/huggingface/transformers — Transformers GitHub
- [84] https://github.com/huggingface/accelerate — Accelerate GitHub
- [85] https://github.com/OpenRLHF/OpenRLHF — OpenRLHF GitHub

上一篇：[03.02 RAG and Retrieval Frameworks](/iopanda-blog/ai/03-frameworks/02/37/)——检索增强层已经讲完；下一模块开始处理“训练系统如何被框架化”这个更靠近模型改造本身的问题。

下一篇：[01 LLaMA-Factory](/iopanda-blog/ai/03-frameworks/03/02/)——先从统一微调工厂路线开始。
