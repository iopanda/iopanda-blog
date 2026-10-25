---
title: "课程助教 Agent 的 Axolotl 架构案例"
number: "03.03.35"
chapter: 3
chapterTitle: "Frameworks"
section: 3
sectionTitle: "Training and Fine-tuning Frameworks"
group: "05 Axolotl"
created: 2026-09-04 02:48
author: "iopanda"
tags: ["framework", "training", "fine-tuning", "axolotl", "case-study"]
sourceId: "3.10.3.3 Training and Fine-tuning Frameworks/05 Axolotl/05 课程助教 Agent 的 Axolotl 架构案例"
---
# 课程助教 Agent 的 Axolotl 架构案例

> 如果课程助教不是一次性模型实验，而是一个会不断经历数据扩充、模板迭代、SFT 到 DPO 演化、LoRA 到 QLoRA 切换、单卡到多卡迁移的训练系统，那么 Axolotl 的价值就会很自然地体现出来：它不是帮你发明新方法，而是帮你把这些变化收敛成一族 recipe。

**学习目标**：学完本章，你将能够——
1. 用 Axolotl 的语言为课程助教设计训练配方族；
2. 判断课程助教什么时候适合配置驱动路线；
3. 设计课程助教的数据、模板、方法、导出、服务链；
4. 解释为什么这里最重要的资产是 recipe，而不是单次 run；
5. 写出一张课程助教的 Axolotl 适配卡。

## 1. 推荐演化路线

- 第一阶段：LoRA/QLoRA SFT，先把课程问答和助教语气训起来；
- 第二阶段：加入 preference recipe，做 DPO/ORPO；
- 第三阶段：如果进入可验证推理或工具环境，再接 GRPO；
- 第四阶段：稳定后 merge、inference、serve 都绑定到同一套 config 家族。

## 2. 课程助教为什么适合 Axolotl

因为它往往具有这些特征：
- 数据格式会变化；
- chat template 会变化；
- 方法会变化；
- 硬件规模会变化；
- 交付形态会变化。

这不是单次训练任务，而是长期演化系统。

## 3. 最重要的交付物是什么

不是某一次 checkpoint，
而是一套：
- SFT recipe
- DPO recipe
- evaluation recipe
- merge / inference / serve recipe

也就是一族可追溯的训练工件。

## 4. 动手活动

> [!example] 输出 `course-ta-axolotl-recipes.md`
>
> 为课程助教列 4 份 recipe：SFT、preference tuning、merge、inference。写一句结论：为什么这比留下一串 shell 命令更像可交付系统。

## 5. 总结

| 关键问题 | 一句话 |
|---|---|
| 课程助教为什么适合 Axolotl | 因为它训练系统会长期演化 |
| Axolotl 最大价值 | 把演化收敛成 recipe 家族 |
| 最重要交付物 | 一组可复用、可审计的配置工件 |

## 引用

- [13] https://github.com/axolotl-ai-cloud/axolotl/blob/main/README.md — Axolotl README
- [14] https://github.com/axolotl-ai-cloud/axolotl/blob/main/AGENTS.md — Axolotl AGENTS overview
- [15] https://github.com/axolotl-ai-cloud/axolotl/blob/main/docs/agents/sft.md — Axolotl SFT agent doc
- [16] https://github.com/axolotl-ai-cloud/axolotl/blob/main/docs/agents/preference_tuning.md — Axolotl preference tuning agent doc
- [17] https://github.com/axolotl-ai-cloud/axolotl/blob/main/docs/agents/grpo.md — Axolotl GRPO agent doc

上一篇：[04 分布式、导出、调参与工程边界](/iopanda-blog/ai/03-frameworks/03/34/)

下一篇：[06 Axolotl 与 LLaMA-Factory、Unsloth、PEFT、TRL 的深度对比](/iopanda-blog/ai/03-frameworks/03/36/)
