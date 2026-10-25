---
title: "PEFT 与 Unsloth、LLaMA-Factory、TRL、Axolotl 的深度对比"
number: "03.03.22"
chapter: 3
chapterTitle: "Frameworks"
section: 3
sectionTitle: "Training and Fine-tuning Frameworks"
group: "03 PEFT"
created: 2026-09-04 01:20
author: "iopanda"
tags: ["framework", "training", "fine-tuning", "peft", "comparison"]
sourceId: "3.10.3.3 Training and Fine-tuning Frameworks/03 PEFT/06 PEFT 与 Unsloth、LLaMA-Factory、TRL、Axolotl 的深度对比"
---
# PEFT 与 Unsloth、LLaMA-Factory、TRL、Axolotl 的深度对比

> 到这里，PEFT 的位置已经清楚：它不是统一训练工厂，不是 alignment 专用框架，不是极致提速器，也不是 YAML recipe 编排器；它首先是一层 parameter-efficient adaptation abstraction。[17][18] 这一篇就是把它放回整个 training framework 版图中。

**学习目标**：学完本章，你将能够——

1. 站在 PEFT 视角解释它与 Unsloth、LLaMA-Factory、TRL、Axolotl 的差异；
2. 理解为什么“方法层能力库”是一条独立路线；
3. 判断什么时候 PEFT 是最自然的入口，什么时候不是；
4. 写出一段“为什么这里选 PEFT”的架构说明；
5. 识别 PEFT 路线最常见的误用。

## 1. 与 Unsloth 的差异

- Unsloth 更先解决资源门槛；
- PEFT 更先解决方法抽象与 adapter 统一语义。

## 2. 与 LLaMA-Factory 的差异

- LLaMA-Factory 更像训练工厂；
- PEFT 更像工厂里最核心的参数高效微调能力层。

## 3. 与 TRL 的差异

- TRL 更像对齐训练框架；
- PEFT 更像对齐训练也能调用的方法层。

## 4. 与 Axolotl 的差异

- Axolotl 更像 recipe 编排器；
- PEFT 更像底层方法抽象层。

## 5. 什么时候最适合 PEFT

适合：
- 已有稳定 HF 训练栈；
- 只想补参数高效微调能力；
- 想一个 base model 管多个 adapter；
- 需要更灵活的方法层实验。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| PEFT 最像什么 | 参数高效微调能力库 |
| 与 Unsloth 的差异 | 一个先稳方法抽象，一个先稳资源效率 |
| 与 LLaMA-Factory 的差异 | 一个是能力层，一个是工厂层 |
| 与 TRL 的差异 | 一个是方法层，一个是对齐任务层 |
| 与 Axolotl 的差异 | 一个是方法抽象，一个是训练编排 |

## 引用

- [17] https://github.com/huggingface/peft/blob/main/README.md — PEFT README
- [18] https://github.com/huggingface/peft/blob/main/docs/source/quicktour.md — PEFT quicktour
- [77] https://github.com/huggingface/peft — PEFT GitHub
- [78] https://github.com/huggingface/trl — TRL GitHub
- [79] https://github.com/hiyouga/LLaMA-Factory — LLaMA-Factory GitHub
- [80] https://github.com/axolotl-ai-cloud/axolotl — Axolotl GitHub
- [81] https://github.com/unslothai/unsloth — Unsloth GitHub

上一篇：[05 课程助教 Agent 的 PEFT 架构案例](/ai/03-frameworks/03/21/)

下一篇：回到 [06 Training Framework 选型矩阵](/ai/03-frameworks/03/37/)
