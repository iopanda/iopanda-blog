---
title: "PEFT"
number: "03.03.16"
chapter: 3
chapterTitle: "Frameworks"
section: 3
sectionTitle: "Training and Fine-tuning Frameworks"
group: "03 PEFT"
created: 2026-09-03 23:45
author: "iopanda"
tags: ["framework", "training", "fine-tuning", "peft"]
sourceId: "3.10.3.3 Training and Fine-tuning Frameworks/03 PEFT/README"
---
# PEFT

> 模块定位：从“参数高效微调能力库”这条路线理解 fine-tuning framework。PEFT 适合回答：如果你已经在 Hugging Face 训练栈里，但想把 LoRA、IA3、AdaLoRA 等 PEFT 方法作为正式能力接进训练系统，而不是自己拼 patch，该怎么做？[77]

**本目录计划关注**：
1. PEFT 为什么更像能力库，而不是整机框架；
2. 参数高效微调方法的统一抽象；
3. 它与 Transformers / Accelerate / TRL 的协作关系；
4. 课程助教 / 领域助手案例；
5. 与 Unsloth、LLaMA-Factory、Axolotl 的对比。

**建议后续拆分**：
- 01 参数高效微调的设计哲学
- 02 LoRA、IA3、AdaLoRA 与统一抽象
- 03 与 Transformers / Accelerate / TRL 的组合方式
- 04 显存、导出、合并权重与工程边界
- 05 课程助教 Agent 的 PEFT 架构案例
- 06 PEFT 与 Unsloth、LLaMA-Factory、TRL、Axolotl 的深度对比

## 本目录笔记导航

1. [01 参数高效微调的设计哲学](/ai/03-frameworks/03/17/)
2. [02 LoRA、IA3、AdaLoRA 与统一抽象](/ai/03-frameworks/03/18/)
3. [03 与 Transformers / Accelerate / TRL 的组合方式](/ai/03-frameworks/03/19/)
4. [04 显存、导出、合并权重与工程边界](/ai/03-frameworks/03/20/)
5. [05 课程助教 Agent 的 PEFT 架构案例](/ai/03-frameworks/03/21/)
6. [06 PEFT 与 Unsloth、LLaMA-Factory、TRL、Axolotl 的深度对比](/ai/03-frameworks/03/22/)

上一篇：[02 Unsloth](/ai/03-frameworks/03/09/)

下一篇：[01 参数高效微调的设计哲学](/ai/03-frameworks/03/17/)
