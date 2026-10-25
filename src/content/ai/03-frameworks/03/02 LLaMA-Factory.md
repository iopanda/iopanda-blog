---
title: "LLaMA-Factory"
number: "03.03.02"
chapter: 3
chapterTitle: "Frameworks"
section: 3
sectionTitle: "Training and Fine-tuning Frameworks"
group: "01 LLaMA-Factory"
created: 2026-09-03 23:45
author: "iopanda"
tags: ["framework", "training", "fine-tuning", "llama-factory"]
sourceId: "3.10.3.3 Training and Fine-tuning Frameworks/01 LLaMA-Factory/README"
---
# LLaMA-Factory

> 模块定位：从“统一微调工厂”这条路线理解 training framework。LLaMA-Factory 适合回答：如果你想用一个统一框架覆盖多模型、多模板、多训练任务（SFT / DPO / VLM / RLHF 的相当大一部分），系统该怎么组织？[79]

**本目录计划关注**：
1. LLaMA-Factory 为什么像训练工厂，而不只是 CLI 脚手架；
2. chat template、dataset schema、训练 recipe、导出链之间的统一抽象；
3. SFT / DPO / VLM / efficient tuning 的整合路线；
4. 课程助教 / 领域助手案例；
5. 与 PEFT、TRL、Unsloth、Axolotl 的对比。

**建议后续拆分**：
- 01 统一训练工厂的设计哲学
- 02 Dataset、Template、Recipe 与 Export
- 03 SFT、DPO、VLM 与多任务统一抽象
- 04 显存、分布式、评测与工程边界
- 05 课程助教 Agent 的 LLaMA-Factory 架构案例
- 06 LLaMA-Factory 与 PEFT、TRL、Unsloth、Axolotl 的深度对比

## 本目录笔记导航

1. [01 统一训练工厂的设计哲学](/ai/03-frameworks/03/03/)
2. [02 Dataset、Template、Recipe 与 Export](/ai/03-frameworks/03/04/)
3. [03 SFT、DPO、VLM 与多任务统一抽象](/ai/03-frameworks/03/05/)
4. [04 显存、分布式、评测与工程边界](/ai/03-frameworks/03/06/)
5. [05 课程助教 Agent 的 LLaMA-Factory 架构案例](/ai/03-frameworks/03/07/)
6. [06 LLaMA-Factory 与 PEFT、TRL、Unsloth、Axolotl 的深度对比](/ai/03-frameworks/03/08/)

上一篇：[03.03 Training and Fine-tuning Frameworks](/ai/03-frameworks/03/01/)

下一篇：[01 统一训练工厂的设计哲学](/ai/03-frameworks/03/03/)
