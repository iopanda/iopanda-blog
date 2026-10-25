---
title: "Axolotl"
number: "03.03.30"
chapter: 3
chapterTitle: "Frameworks"
section: 3
sectionTitle: "Training and Fine-tuning Frameworks"
group: "05 Axolotl"
created: 2026-09-03 23:45
author: "iopanda"
tags: ["framework", "training", "fine-tuning", "axolotl"]
sourceId: "3.10.3.3 Training and Fine-tuning Frameworks/05 Axolotl/README"
---
# Axolotl

> 模块定位：从“配置驱动训练编排”这条路线理解 fine-tuning framework。Axolotl 适合回答：如果你希望用 YAML / recipe 驱动复杂训练任务，让微调方法、模型、数据、分布式后端、导出方式都通过配置管理，该怎样组织训练系统？[80]

**本目录计划关注**：
1. Axolotl 为什么以配置和 recipe 作为核心语言；
2. 数据、模板、模型、训练后端、导出链如何被 YAML 化；
3. 与 Hugging Face、PEFT、TRL、DeepSpeed 等底层能力的关系；
4. 课程助教 / 领域助手案例；
5. 与 LLaMA-Factory、Unsloth、PEFT、TRL 的对比。

**建议后续拆分**：
- 01 配置即训练 recipe 的设计哲学
- 02 Dataset、Template、YAML 与实验管理
- 03 LoRA、QLoRA、DPO 与多后端训练编排
- 04 分布式、导出、调参与工程边界
- 05 课程助教 Agent 的 Axolotl 架构案例
- 06 Axolotl 与 LLaMA-Factory、Unsloth、PEFT、TRL 的深度对比

## 本目录笔记导航

1. [01 配置即训练 recipe 的设计哲学](/iopanda-blog/ai/03-frameworks/03/31/)
2. [02 Dataset、Template、YAML 与实验管理](/iopanda-blog/ai/03-frameworks/03/32/)
3. [03 LoRA、QLoRA、DPO 与多后端训练编排](/iopanda-blog/ai/03-frameworks/03/33/)
4. [04 分布式、导出、调参与工程边界](/iopanda-blog/ai/03-frameworks/03/34/)
5. [05 课程助教 Agent 的 Axolotl 架构案例](/iopanda-blog/ai/03-frameworks/03/35/)
6. [06 Axolotl 与 LLaMA-Factory、Unsloth、PEFT、TRL 的深度对比](/iopanda-blog/ai/03-frameworks/03/36/)

上一篇：[04 TRL](/iopanda-blog/ai/03-frameworks/03/23/)

下一篇：[01 配置即训练 recipe 的设计哲学](/iopanda-blog/ai/03-frameworks/03/31/)
