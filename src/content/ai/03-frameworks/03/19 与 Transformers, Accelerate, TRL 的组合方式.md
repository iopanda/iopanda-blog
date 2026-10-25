---
title: "与 Transformers, Accelerate, TRL 的组合方式"
number: "03.03.19"
chapter: 3
chapterTitle: "Frameworks"
section: 3
sectionTitle: "Training and Fine-tuning Frameworks"
group: "03 PEFT"
created: 2026-09-04 01:14
author: "iopanda"
tags: ["framework", "training", "fine-tuning", "peft", "transformers", "accelerate", "trl"]
sourceId: "3.10.3.3 Training and Fine-tuning Frameworks/03 PEFT/03 与 Transformers, Accelerate, TRL 的组合方式"
---
# 与 Transformers, Accelerate, TRL 的组合方式

> PEFT README 明确说自己与 Transformers、Diffusers、Accelerate 深度集成，并且在 TRL 的 RLHF / DPO 工作流里也常作为 adapter 能力层出现。[17] 这说明 PEFT 的正确使用方式通常不是“单独立国”，而是：**作为现有训练栈中的一层方法抽象，接进 Trainer、Accelerate、TRL 或自定义 loop。**

**学习目标**：学完本章，你将能够——

1. 理解 PEFT 与 Transformers、Accelerate、TRL 的分工；
2. 说明为什么 PEFT 很少单独成为完整训练系统；
3. 判断什么时候该在现有栈上补 PEFT，而不是换整套框架；
4. 理解 PeftModel / AutoPeftModel / from_pretrained / add_adapter 的角色；
5. 为项目写出训练栈组合图。

## 1. Transformers：最常见的宿主

README 和 quicktour 都说明：
- 用 `get_peft_model` 包 base model；
- 然后用 Transformers Trainer 或自定义 loop 训练。[17][18]

这意味着 Transformers 是最常见宿主，PEFT 则是适配层。

## 2. Accelerate：分布式与大模型支持

README 里明确指出：PEFT 与 Accelerate 天然协同，用于 really big models 的 distributed training/inference。[17]

也就是说，PEFT 自己不负责把分布式抽象做完，而是把这部分交给更底层训练栈。

## 3. TRL：对齐训练里的方法层

README 也明确提到：PEFT 可以应用到 RLHF 相关组件，如 ranker 和 policy，并给出与 TRL 结合的示例和文章。[17]

这说明在对齐任务里，TRL 管任务语义，PEFT 管 adapter 语义。

## 4. PeftModel / AutoPeftModel 的意义

`peft_model.md` 说明了：
- `PeftModel` 是适配 base model 和 PEFT config 的核心模型类；
- `AutoPeftModel` 负责更方便地加载 adapter 模型；
- 不同任务有不同 `PeftModelFor...` 变体。[23]

这让 PEFT 能既用于训练，也用于推理和 adapter 切换。

## 5. 动手活动

> [!example] 输出 `peft-stack-integration.md`
>
> 画出一张组合图：Transformers 负责 base model / trainer，Accelerate 负责分布式，TRL 负责 alignment 任务，PEFT 负责 adapter abstraction。写一句结论：为什么 PEFT 更像能力层而不是整机系统。

## 6. 总结

| 组件 | 在组合里的职责 |
|---|---|
| Transformers | base model / trainer 宿主 |
| Accelerate | 分布式与大模型执行层 |
| TRL | alignment / RLHF 任务层 |
| PEFT | adapter abstraction 能力层 |

## 引用

- [17] https://github.com/huggingface/peft/blob/main/README.md — PEFT README
- [18] https://github.com/huggingface/peft/blob/main/docs/source/quicktour.md — PEFT quicktour
- [23] https://github.com/huggingface/peft/blob/main/docs/source/package_reference/peft_model.md — PEFT model doc

上一篇：[02 LoRA、IA3、AdaLoRA 与统一抽象](/ai/03-frameworks/03/18/)

下一篇：[04 显存、导出、合并权重与工程边界](/ai/03-frameworks/03/20/)
