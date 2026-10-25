---
title: "Unsloth 与 PEFT、TRL、LLaMA-Factory、Axolotl 的深度对比"
number: "03.03.15"
chapter: 3
chapterTitle: "Frameworks"
section: 3
sectionTitle: "Training and Fine-tuning Frameworks"
group: "02 Unsloth"
created: 2026-09-04 00:55
author: "iopanda"
tags: ["framework", "training", "fine-tuning", "unsloth", "comparison"]
sourceId: "3.10.3.3 Training and Fine-tuning Frameworks/02 Unsloth/06 Unsloth 与 PEFT、TRL、LLaMA-Factory、Axolotl 的深度对比"
---
# Unsloth 与 PEFT、TRL、LLaMA-Factory、Axolotl 的深度对比

> 到这里，Unsloth 的位置已经很清楚：它不是先解决训练统一性，不是先解决 alignment，也不是先解决 YAML 编排，而是先解决“资源门槛太高”这个现实问题。[18] 这一篇就是把它放回整个 training framework 版图里，讲清楚它为什么是一条独立路线。

**学习目标**：
1. 站在 Unsloth 视角解释它与 PEFT、TRL、LLaMA-Factory、Axolotl 的差异；
2. 理解为什么“提速和省显存”本身就是框架主线；
3. 判断什么时候该选 Unsloth，什么时候不该；
4. 写一段“为什么这里选 Unsloth”的架构说明；
5. 识别资源效率路线最常见的误用。

## 1. 与 PEFT 的差异

- PEFT 更像方法库；
- Unsloth 更像把方法跑快、跑省的实现路线。

## 2. 与 TRL 的差异

- TRL 更像 alignment 任务框架；
- Unsloth 更像资源效率优先路线。

## 3. 与 LLaMA-Factory 的差异

- LLaMA-Factory 更像统一训练工厂；
- Unsloth 更像单卡/低资源友好的加速路线。

## 4. 与 Axolotl 的差异

- Axolotl 更像配置编排器；
- Unsloth 更像提速器和低门槛训练入口。

## 5. 什么时候最适合 Unsloth

适合：
- 显存紧张
- 预算敏感
- 需要快速迭代
- 单卡为主

不那么适合：
- 训练平台统一性是主问题
- alignment 复杂度是主问题
- 多 recipe / 多模型编排是主问题

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| Unsloth 最像什么 | 一条以资源效率为中心的微调路线 |
| 它和 PEFT 的差异 | 一个是方法库，一个是资源效率实现路线 |
| 它和 TRL 的差异 | 一个先稳任务，一个先稳资源门槛 |
| 它和 LLaMA-Factory 的差异 | 一个先稳统一入口，一个先稳能跑起来 |
| 它和 Axolotl 的差异 | 一个先稳 recipe 编排，一个先稳训练成本 |

## 引用

- [18] https://github.com/unslothai/unsloth/blob/main/README.md — Unsloth README
- [77] https://github.com/huggingface/peft — PEFT GitHub
- [78] https://github.com/huggingface/trl — TRL GitHub
- [79] https://github.com/hiyouga/LLaMA-Factory — LLaMA-Factory GitHub
- [80] https://github.com/axolotl-ai-cloud/axolotl — Axolotl GitHub

上一篇：[05 课程助教 Agent 的 Unsloth 架构案例](/iopanda-blog/ai/03-frameworks/03/14/)

下一篇：回到 [06 Training Framework 选型矩阵](/iopanda-blog/ai/03-frameworks/03/37/)
