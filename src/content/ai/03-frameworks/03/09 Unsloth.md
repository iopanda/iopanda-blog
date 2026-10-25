---
title: "Unsloth"
number: "03.03.09"
chapter: 3
chapterTitle: "Frameworks"
section: 3
sectionTitle: "Training and Fine-tuning Frameworks"
group: "02 Unsloth"
created: 2026-09-03 23:45
author: "iopanda"
tags: ["framework", "training", "fine-tuning", "unsloth"]
sourceId: "3.10.3.3 Training and Fine-tuning Frameworks/02 Unsloth/README"
---
# Unsloth

> 模块定位：从“极致提速与省显存”这条路线理解 fine-tuning framework。Unsloth 适合回答：如果你最先痛的是显存不够、训练太慢、想快速把 LoRA/QLoRA 跑起来，系统该怎么组织？[81]

**本目录计划关注**：
1. Unsloth 为什么以速度和显存效率作为第一卖点；
2. 它如何改写 LoRA / QLoRA 的上手门槛；
3. 与标准 Hugging Face 训练栈相比，哪些能力是加速器，哪些是工程边界；
4. 课程助教 / 小团队单卡场景案例；
5. 与 PEFT、TRL、LLaMA-Factory、Axolotl 的对比。

**建议后续拆分**：
- 01 速度、显存与“先跑起来”路线的设计哲学
- 02 LoRA、QLoRA、量化与训练提速
- 03 数据模板、导出、推理衔接与工程边界
- 04 单卡/小团队场景的适用边界
- 05 课程助教 Agent 的 Unsloth 架构案例
- 06 Unsloth 与 PEFT、TRL、LLaMA-Factory、Axolotl 的深度对比

## 本目录笔记导航

1. [01 速度、显存与“先跑起来”路线的设计哲学](/iopanda-blog/ai/03-frameworks/03/10/)
2. [02 LoRA、QLoRA、量化与训练提速](/iopanda-blog/ai/03-frameworks/03/11/)
3. [03 数据模板、导出、推理衔接与工程边界](/iopanda-blog/ai/03-frameworks/03/12/)
4. [04 单卡/小团队场景的适用边界](/iopanda-blog/ai/03-frameworks/03/13/)
5. [05 课程助教 Agent 的 Unsloth 架构案例](/iopanda-blog/ai/03-frameworks/03/14/)
6. [06 Unsloth 与 PEFT、TRL、LLaMA-Factory、Axolotl 的深度对比](/iopanda-blog/ai/03-frameworks/03/15/)

上一篇：[01 LLaMA-Factory](/iopanda-blog/ai/03-frameworks/03/02/)

下一篇：[01 速度、显存与“先跑起来”路线的设计哲学](/iopanda-blog/ai/03-frameworks/03/10/)
