---
title: "LoRA、QLoRA、DPO 与多后端训练编排"
number: "03.03.33"
chapter: 3
chapterTitle: "Frameworks"
section: 3
sectionTitle: "Training and Fine-tuning Frameworks"
group: "05 Axolotl"
created: 2026-09-04 02:44
author: "iopanda"
tags: ["framework", "training", "fine-tuning", "axolotl", "lora", "qlora", "dpo", "grpo"]
sourceId: "3.10.3.3 Training and Fine-tuning Frameworks/05 Axolotl/03 LoRA、QLoRA、DPO 与多后端训练编排"
---
# LoRA、QLoRA、DPO 与多后端训练编排

> Axolotl README 和 AGENTS.md 很能说明它的野心：同一框架里既支持 full fine-tuning、LoRA、QLoRA，也支持 DPO、IPO、KTO、ORPO、GRPO、Reward Modelling，甚至 EBFT。[13][14][16][17] 这意味着 Axolotl 的重点不是发明这些方法，而是把它们编排进同一套配置世界里。

**学习目标**：学完本章，你将能够——
1. 理解 Axolotl 为什么适合承接多种训练方法共存；
2. 说出 SFT、preference tuning、GRPO 在 config 层如何切换；
3. 理解 Axolotl 与 PEFT / TRL 的关系；
4. 判断什么时候该在单一 recipe 家族中演化，而不是迁移框架；
5. 画出一张 method-routing 图。

## 1. Axolotl 不把训练方法当作孤岛

AGENTS.md 的 method table 已经很直白：[14]
- SFT：默认
- DPO/IPO：`rl: dpo`
- KTO：`rl: kto`
- ORPO：`rl: orpo`
- GRPO：`rl: grpo`
- EBFT：`rl: ebft`

这说明它把方法切换收敛成 config-level routing，而不是要求你换项目结构。

## 2. 为什么这很重要

真实项目经常不是一条直线：
- 先 LoRA SFT；
- 再 DPO；
- 再看要不要 GRPO；
- 可能不同模型上还要切换 QLoRA、full FT、multi-node。

如果每次方法变化都意味着重写训练入口，团队的实验成本会非常高。Axolotl 的价值就在于：让方法变化尽量表现为 recipe 变化。

## 3. 它和 PEFT / TRL 的关系

从技术栈上看，Axolotl 并不遮掩自己建立在 HF / PEFT / TRL 之上。[14]
因此它的位置更像：
- PEFT 提供 adapter 能力；
- TRL 提供 alignment trainers；
- Axolotl 负责把它们编排成统一 config-driven workflow。

## 4. 为什么这比“只会跑 LoRA”重要得多

如果一个框架只会跑 LoRA，它只是单点工具；
但如果它能让 LoRA、QLoRA、DPO、GRPO、RM 处在同一配置语言里，它就开始像训练 orchestration framework。

## 5. 动手活动

> [!example] 输出 `axolotl-method-routing.md`
>
> 列一个项目的演化路线：SFT → DPO → GRPO。分别写出对应 config 的关键变化。最后写一句结论：为什么这里更像改 recipe，而不是换框架。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| Axolotl 在统一什么 | 多种训练方法的配置入口 |
| 与 PEFT 的关系 | 把 adapter 能力纳入 recipe |
| 与 TRL 的关系 | 把 alignment methods 纳入 recipe |
| 最大价值 | 让方法演化尽量表现为配置演化 |

## 引用

- [13] https://github.com/axolotl-ai-cloud/axolotl/blob/main/README.md — Axolotl README
- [14] https://github.com/axolotl-ai-cloud/axolotl/blob/main/AGENTS.md — Axolotl AGENTS overview
- [16] https://github.com/axolotl-ai-cloud/axolotl/blob/main/docs/agents/preference_tuning.md — Axolotl preference tuning agent doc
- [17] https://github.com/axolotl-ai-cloud/axolotl/blob/main/docs/agents/grpo.md — Axolotl GRPO agent doc

上一篇：[02 Dataset、Template、YAML 与实验管理](/ai/03-frameworks/03/32/)

下一篇：[04 分布式、导出、调参与工程边界](/ai/03-frameworks/03/34/)
