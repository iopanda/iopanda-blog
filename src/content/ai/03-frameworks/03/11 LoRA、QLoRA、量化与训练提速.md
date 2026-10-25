---
title: "LoRA、QLoRA、量化与训练提速"
number: "03.03.11"
chapter: 3
chapterTitle: "Frameworks"
section: 3
sectionTitle: "Training and Fine-tuning Frameworks"
group: "02 Unsloth"
created: 2026-09-04 00:47
author: "iopanda"
tags: ["framework", "training", "fine-tuning", "unsloth", "lora", "qlora", "quantization"]
sourceId: "3.10.3.3 Training and Fine-tuning Frameworks/02 Unsloth/02 LoRA、QLoRA、量化与训练提速"
---
# LoRA、QLoRA、量化与训练提速

> Unsloth 的核心吸引力不是“也支持 LoRA/QLoRA”，而是它把这些方法和提速、省显存绑定成同一条路线。[18] README 里反复强调 2x faster、70% less VRAM，并把 GGUF、FP8、GRPO、embedding fine-tuning、MoE 加速等一起摆出来。这说明它并不把 LoRA 看成单独算法，而是把它放进“资源效率工程”里统一处理。

**学习目标**：学完本章，你将能够——

1. 解释为什么 Unsloth 会把 LoRA/QLoRA 和提速、省显存绑在一起讲；
2. 理解量化训练、GGUF 导出和后续部署衔接为什么在这条路线里很重要；
3. 判断什么时候该把问题先定义成资源效率问题，而不是训练抽象问题；
4. 识别 Unsloth 路线在工程上的收益与边界；
5. 为一个资源受限项目设计微调方案。

## 1. LoRA 在这里不是方法名，而是资源策略

在 Unsloth 的叙述里，LoRA/QLoRA 的意义不只是：
- 改少量参数；
而是：
- 降显存；
- 降训练门槛；
- 提高迭代速度；
- 让 consumer GPU 也能做原本做不了的任务。[18]

## 2. 为什么 GGUF / 本地部署会被放在一起讲

README 里把训练和部署放得很近：
- 训练
- 导出 GGUF
- 本地模型
- OpenAI compatible API
- MLX / GGUF / local UI。[18]

这说明 Unsloth 的路线不是“训完再说”，而是非常强调：
- 训练结果要尽快可运行；
- 本地部署是资源受限团队的重要现实；
- 微调和推理格式的衔接必须被考虑。

## 3. 什么问题最适合先用这条路线解决

- 显存太小
- 训练太慢
- QLoRA 是现实首选
- 想快速验证一版模型
- 想尽快转到本地推理或 GGUF 生态

## 4. 总结

| 关键问题 | 一句话 |
|---|---|
| LoRA/QLoRA 在 Unsloth 里像什么 | 一套资源效率策略 |
| 为什么会强调 GGUF/导出 | 因为“训完能跑”也是主目标 |
| 这条路线最大的价值 | 把资源门槛压到更多团队能承受的范围 |

## 引用

- [18] https://github.com/unslothai/unsloth/blob/main/README.md — Unsloth README

上一篇：[01 速度、显存与“先跑起来”路线的设计哲学](/iopanda-blog/ai/03-frameworks/03/10/)

下一篇：[03 数据模板、导出、推理衔接与工程边界](/iopanda-blog/ai/03-frameworks/03/12/)
