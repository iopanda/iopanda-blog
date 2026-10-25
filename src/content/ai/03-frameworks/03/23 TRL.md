---
title: "TRL"
number: "03.03.23"
chapter: 3
chapterTitle: "Frameworks"
section: 3
sectionTitle: "Training and Fine-tuning Frameworks"
group: "04 TRL"
created: 2026-09-03 23:45
author: "iopanda"
tags: ["framework", "training", "fine-tuning", "trl"]
sourceId: "3.10.3.3 Training and Fine-tuning Frameworks/04 TRL/README"
---
# TRL

> 模块定位：从“对齐与偏好优化框架”这条路线理解 fine-tuning framework。TRL 适合回答：当任务从 SFT 走向 DPO、PPO、reward modeling、RLHF 时，训练系统该如何统一？[78]

**本目录计划关注**：
1. TRL 为什么首先是 alignment framework；
2. SFT、DPO、PPO、奖励建模之间的训练关系；
3. 与 PEFT / Transformers / Accelerate 的协作方式；
4. 课程助教 / 安全助手 / 偏好对齐案例；
5. 与 LLaMA-Factory、Axolotl、Unsloth 的对比。

**建议后续拆分**：
- 01 Alignment framework 的设计哲学
- 02 SFT、DPO、PPO、Reward Modeling 的统一视角
- 03 与 PEFT / Transformers / Accelerate 的组合方式
- 04 训练稳定性、评测与工程边界
- 05 课程助教 Agent 的 TRL 架构案例
- 06 TRL 与 PEFT、LLaMA-Factory、Unsloth、Axolotl 的深度对比

## 本目录笔记导航

1. [01 Alignment framework 的设计哲学](/ai/03-frameworks/03/24/)
2. [02 SFT、DPO、PPO、Reward Modeling 的统一视角](/ai/03-frameworks/03/25/)
3. [03 与 PEFT / Transformers / Accelerate 的组合方式](/ai/03-frameworks/03/26/)
4. [04 训练稳定性、评测与工程边界](/ai/03-frameworks/03/27/)
5. [05 课程助教 Agent 的 TRL 架构案例](/ai/03-frameworks/03/28/)
6. [06 TRL 与 PEFT、LLaMA-Factory、Unsloth、Axolotl 的深度对比](/ai/03-frameworks/03/29/)

上一篇：[03 PEFT](/ai/03-frameworks/03/16/)

下一篇：[01 Alignment framework 的设计哲学](/ai/03-frameworks/03/24/)
