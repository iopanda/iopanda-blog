---
title: "课程助教 Agent 的 LLaMA-Factory 架构案例"
number: "03.03.07"
chapter: 3
chapterTitle: "Frameworks"
section: 3
sectionTitle: "Training and Fine-tuning Frameworks"
group: "01 LLaMA-Factory"
created: 2026-09-04 00:18
author: "iopanda"
tags: ["framework", "training", "fine-tuning", "llama-factory", "case-study"]
sourceId: "3.10.3.3 Training and Fine-tuning Frameworks/01 LLaMA-Factory/05 课程助教 Agent 的 LLaMA-Factory 架构案例"
---
# 课程助教 Agent 的 LLaMA-Factory 架构案例

> 把 LLaMA-Factory 放回课程助教主线时，它最自然的角色不是“训练算法创新器”，而是**统一训练入口**：当课程助教既要支持 SFT、后续可能做 DPO、可能加入 tool-use tuning、甚至未来接多模态课件理解时，如何让训练、模板、数据、导出链保持一致？这正是 LLaMA-Factory 擅长的地方。[86][90][91][92]

**学习目标**：学完本章，你将能够——

1. 用 LLaMA-Factory 的语言为课程助教设计数据、模板、recipe 与导出链；
2. 判断课程助教何时只需要 SFT，何时开始值得接 DPO；
3. 设计课程助教的标准数据格式和模板一致性策略；
4. 解释为什么这个案例在 LLaMA-Factory 里首先像“训练装配线”；
5. 写出一张可执行的训练配方卡。

## 1. 推荐的课程助教训练路线

第一阶段：
- sharegpt 或 alpaca 格式 SFT
- LoRA / QLoRA 起步
- 固定 template
- 先导出到 chat 或 API 评测

第二阶段：
- 加偏好数据
- 做 DPO / ORPO 等对齐训练
- 用同一 template 和导出链继续迭代

第三阶段：
- 若加入截图、课件图像，再升级到多模态 recipe。

## 2. 课程助教为什么适合这种工厂路线

因为它通常会经历：
- 任务增加
- 模型更换
- 数据格式扩展
- 训练方法升级
- 推理后端变化

若没有统一工厂，团队会非常快地分裂成多套脚本。

## 3. 动手活动

> [!example] 输出 `course-ta-llamafactory-stack.md`
>
> 以课程助教为例，列：数据格式、template、训练 recipe、导出目标、评测方式。写一句结论：为什么这是一条训练装配线，而不是单次训练命令。

## 4. 总结

| 关键问题 | 一句话 |
|---|---|
| 课程助教为什么适合 LLaMA-Factory | 因为它训练任务会逐步长大，但又希望入口始终统一 |
| 第一阶段最自然做什么 | LoRA/QLoRA SFT |
| 第二阶段最自然做什么 | 偏好优化与对齐训练 |
| 最大价值 | 把迭代中的训练链保持一致，而不是每次重造脚手架 |

## 引用

- [86] https://github.com/hiyouga/LLaMA-Factory/blob/main/README.md — LLaMA-Factory README
- [90] https://github.com/hiyouga/LLaMA-Factory/blob/main/docs/zh/getting-started.md — LLaMA-Factory getting started zh
- [91] https://github.com/hiyouga/LLaMA-Factory/blob/main/data/README.md — LLaMA-Factory data README
- [92] https://github.com/hiyouga/LLaMA-Factory/blob/main/examples/README.md — LLaMA-Factory examples README

上一篇：[04 显存、分布式、评测与工程边界](/ai/03-frameworks/03/06/)

下一篇：[06 LLaMA-Factory 与 PEFT、TRL、Unsloth、Axolotl 的深度对比](/ai/03-frameworks/03/08/)
