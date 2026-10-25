---
title: "SFT、DPO、VLM 与多任务统一抽象"
number: "03.03.05"
chapter: 3
chapterTitle: "Frameworks"
section: 3
sectionTitle: "Training and Fine-tuning Frameworks"
group: "01 LLaMA-Factory"
created: 2026-09-04 00:14
author: "iopanda"
tags: ["framework", "training", "fine-tuning", "llama-factory", "sft", "dpo", "vlm"]
sourceId: "3.10.3.3 Training and Fine-tuning Frameworks/01 LLaMA-Factory/03 SFT、DPO、VLM 与多任务统一抽象"
---
# SFT、DPO、VLM 与多任务统一抽象

> LLaMA-Factory 在 README 里最有野心的一点，不是支持 100+ 模型，而是支持很多训练方法同时进入同一个框架：pre-training、SFT、reward modeling、PPO、DPO、KTO、ORPO、SimPO，以及多模态训练。[86] 这意味着它不把这些任务看成互不相干的专项脚本，而是在尝试给它们建立统一训练语言。

**学习目标**：学完本章，你将能够——

1. 解释为什么 SFT、DPO、reward modeling、VLM 在工程上值得被统一管理；
2. 理解 LLaMA-Factory 为什么适合承接“训练任务谱系”而不是单一任务；
3. 说出多任务统一抽象带来的收益和代价；
4. 比较它与 TRL 在对齐任务上的侧重点差异；
5. 为一个从 SFT 长向 DPO 的项目设计演化路径。

## 1. 为什么训练任务会自然长成谱系

真实项目常常不是只停在一条任务线上：
- 先做 SFT 打基线；
- 再做 preference learning 提质量；
- 可能再做 reward modeling 或 PPO；
- 若模型变多模态，又要支持图像/视频/音频理解。

如果每次任务变化都换一套完全不同脚手架，团队会很快失去统一性。

## 2. README 暴露出的统一思路

README 明确列出：
- pre-training
- supervised fine-tuning
- reward modeling
- PPO
- DPO
- KTO
- ORPO
- SimPO
- 多模态任务。[86]

这说明它在试图回答一个更大的问题：**一个团队如何用同一套框架语言管理训练任务的演化。**

## 3. 为什么这对课程助教也重要

课程助教一开始可能只做 SFT；
但后面很可能会出现：
- 偏好对齐（更礼貌、更稳定、更守边界）
- tool-use tuning
- VLM 版本（课件截图、作业图像）

如果框架一开始就支持任务演化，迁移成本会低很多。

## 4. 和 TRL 的差异

TRL 更纯粹地站在 alignment 任务上：SFT、DPO、PPO、reward modeling 是它的主舞台。

LLaMA-Factory 则更像：
- alignment 只是训练工厂里的一部分；
- 它更强调统一入口，而不是把 alignment 本身讲到最深。

## 5. 动手活动

> [!example] 输出 `llamafactory-task-evolution.md`
>
> 列一个模型项目从 SFT → DPO → VLM/agent tuning 的演化路线。写一句结论：为什么这类演化适合统一框架而不是不断换脚手架。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| 为什么任务值得统一 | 因为真实项目训练需求会沿时间演化 |
| LLaMA-Factory 的价值 | 用统一语言承接任务谱系 |
| 和 TRL 的差异 | 一个更像训练工厂，一个更像 alignment 专用框架 |

## 引用

- [86] https://github.com/hiyouga/LLaMA-Factory/blob/main/README.md — LLaMA-Factory README
- [92] https://github.com/hiyouga/LLaMA-Factory/blob/main/examples/README.md — LLaMA-Factory examples README

上一篇：[02 Dataset、Template、Recipe 与 Export](/iopanda-blog/ai/03-frameworks/03/04/)

下一篇：[04 显存、分布式、评测与工程边界](/iopanda-blog/ai/03-frameworks/03/06/)
