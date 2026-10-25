---
title: "LLaMA-Factory 与 PEFT、TRL、Unsloth、Axolotl 的深度对比"
number: "03.03.08"
chapter: 3
chapterTitle: "Frameworks"
section: 3
sectionTitle: "Training and Fine-tuning Frameworks"
group: "01 LLaMA-Factory"
created: 2026-09-04 00:20
author: "iopanda"
tags: ["framework", "training", "fine-tuning", "llama-factory", "comparison"]
sourceId: "3.10.3.3 Training and Fine-tuning Frameworks/01 LLaMA-Factory/06 LLaMA-Factory 与 PEFT、TRL、Unsloth、Axolotl 的深度对比"
---
# LLaMA-Factory 与 PEFT、TRL、Unsloth、Axolotl 的深度对比

> 到这里，LLaMA-Factory 的位置已经比较清楚了：它不像 PEFT 那样主要解决方法抽象，不像 TRL 那样主要解决 alignment，不像 Unsloth 那样主要解决速度和显存，也不像 Axolotl 那样主要解决 YAML recipe 编排。它最独特的地方是：**把训练系统做成统一工厂。**[79][86]

**学习目标**：学完本章，你将能够——

1. 站在 LLaMA-Factory 视角，解释它与 PEFT、TRL、Unsloth、Axolotl 的差异；
2. 理解为什么“统一工厂”是一条独立路线；
3. 判断什么时候该选工厂，而不是选库或加速器；
4. 写出一段“为什么这里选 LLaMA-Factory”的架构说明；
5. 识别工厂路线最常见的误用。

## 1. 与 PEFT 的差异

- PEFT 更像参数高效微调能力库；
- LLaMA-Factory 把 PEFT 当成大工厂里的一个工序。

## 2. 与 TRL 的差异

- TRL 更像 alignment 专用训练框架；
- LLaMA-Factory 更像统一训练工厂，对齐只是其中一类任务。

## 3. 与 Unsloth 的差异

- Unsloth 更像提速器；
- LLaMA-Factory 更像生产线。

## 4. 与 Axolotl 的差异

- Axolotl 更像配置驱动编排语言；
- LLaMA-Factory 更像多模型多任务统一入口。

## 5. 什么时候它最自然

适合：
- 多模型
- 多训练任务
- 多导出目标
- 团队想统一操作和训练入口

## 6. 什么时候不那么适合

不那么适合：
- 你只需要在现有 HF 栈里补 LoRA
- 你只做 alignment
- 你最痛的是单卡速度而不是系统统一性

## 7. 总结

| 关键问题 | 一句话 |
|---|---|
| LLaMA-Factory 最像什么 | 一个统一训练工厂 |
| 它和 PEFT 的差异 | 一个是能力库，一个是工厂 |
| 它和 TRL 的差异 | 一个是对齐框架，一个是多任务训练工厂 |
| 它和 Unsloth 的差异 | 一个是提速路线，一个是统一入口路线 |
| 它和 Axolotl 的差异 | 一个偏 recipe 编排，一个偏训练工厂化 |

## 引用

- [79] https://github.com/hiyouga/LLaMA-Factory — LLaMA-Factory GitHub
- [86] https://github.com/hiyouga/LLaMA-Factory/blob/main/README.md — LLaMA-Factory README
- [77] https://github.com/huggingface/peft — PEFT GitHub
- [78] https://github.com/huggingface/trl — TRL GitHub
- [80] https://github.com/axolotl-ai-cloud/axolotl — Axolotl GitHub
- [81] https://github.com/unslothai/unsloth — Unsloth GitHub

上一篇：[05 课程助教 Agent 的 LLaMA-Factory 架构案例](/iopanda-blog/ai/03-frameworks/03/07/)

下一篇：回到 [06 Training Framework 选型矩阵](/iopanda-blog/ai/03-frameworks/03/37/)
