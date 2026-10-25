---
title: "LoRA、IA3、AdaLoRA 与统一抽象"
number: "03.03.18"
chapter: 3
chapterTitle: "Frameworks"
section: 3
sectionTitle: "Training and Fine-tuning Frameworks"
group: "03 PEFT"
created: 2026-09-04 01:12
author: "iopanda"
tags: ["framework", "training", "fine-tuning", "peft", "lora", "ia3", "adalora"]
sourceId: "3.10.3.3 Training and Fine-tuning Frameworks/03 PEFT/02 LoRA、IA3、AdaLoRA 与统一抽象"
---
# LoRA、IA3、AdaLoRA 与统一抽象

> PEFT 最有代表性的价值，不在“支持很多方法”，而在它能把这些方法放进同一套配置—包装—保存语言里。Quicktour 用 LoRA 讲最基本的 wrapper 思路，[18] IA3 文档强调它通过 learned vectors 获得极小 adapter 体积，[20] AdaLoRA 则进一步引入“按重要性自适应分配 rank 预算”的思路。[21] 三者看起来不同，但在 PEFT 里都被抽象成了 config + model wrapper + adapter artifact 这套统一语言。

**学习目标**：学完本章，你将能够——

1. 说出 LoRA、IA3、AdaLoRA 各自想优化什么；
2. 理解为什么它们可以在 PEFT 中被统一管理；
3. 判断什么时候该优先选 LoRA，什么时候 IA3 更合适，什么时候 AdaLoRA 值得尝试；
4. 理解“统一抽象”对团队和代码栈的意义；
5. 为项目写一张方法选择卡。

## 1. LoRA：默认起点

LoRA 文档明确指出：[19]
- 通过 low-rank matrices 表示增量更新；
- 大幅减少 trainable parameters；
- 性能接近全参；
- 还能 merge 到 base model 消除推理额外延迟。

所以 LoRA 成为 PEFT 世界里的默认起点，非常自然。

## 2. IA3：极小 adapter 路线

IA3 文档强调它的特点：[20]
- 不是训练矩阵，而是训练少量缩放向量；
- trainable parameter 比 LoRA 还少；
- 适合极度看重 adapter 体积与部署占用的场景。

这说明 PEFT 并不预设“所有参数高效微调都该是 low-rank matrix”。

## 3. AdaLoRA：把 rank 预算变成动态资源分配问题

AdaLoRA 文档的关键点是：[21]
- 不平均分配 rank；
- 更重要的模块拿更多预算；
- 不重要的模块被剪掉；
- 训练过程本身需要额外的 update_and_allocate 步骤。

这说明在 PEFT 世界里，方法不仅可以不同，连“参数预算如何分配”都可以成为方法的一部分。

## 4. 为什么统一抽象值钱

因为如果没有统一抽象，这几种方法对团队来说会变成：
- 完全不同代码路径；
- 完全不同保存/加载方式；
- 完全不同训练接入方式。

PEFT 通过 config + wrapper 把它们拉回同一层，使“换方法”不等于“重写系统”。

## 5. 什么时候怎么选

- **LoRA**：默认起点，生态最成熟；
- **IA3**：当你极端追求小 adapter；
- **AdaLoRA**：当你愿意为更精细预算分配付出更高训练复杂度。

## 6. 动手活动

> [!example] 输出 `peft-method-card.md`
>
> 为一个 7B/14B 模型项目比较 LoRA、IA3、AdaLoRA：训练参数量、适配复杂度、部署体积、是否易与现有 trainer 集成。写一句结论：为什么你选其中一个作为默认起点。

## 7. 总结

| 方法 | 一句话定位 |
|---|---|
| LoRA | 默认、成熟、性价比最高的起点 |
| IA3 | 更极致的小 adapter 路线 |
| AdaLoRA | 把参数预算变成动态分配问题 |
| PEFT 的价值 | 让这几种方法都能用统一语言进入系统 |

## 引用

- [18] https://github.com/huggingface/peft/blob/main/docs/source/quicktour.md — PEFT quicktour
- [19] https://github.com/huggingface/peft/blob/main/docs/source/package_reference/lora.md — PEFT LoRA doc
- [20] https://github.com/huggingface/peft/blob/main/docs/source/package_reference/ia3.md — PEFT IA3 doc
- [21] https://github.com/huggingface/peft/blob/main/docs/source/package_reference/adalora.md — PEFT AdaLoRA doc

上一篇：[01 参数高效微调的设计哲学](/iopanda-blog/ai/03-frameworks/03/17/)

下一篇：[03 与 Transformers / Accelerate / TRL 的组合方式](/iopanda-blog/ai/03-frameworks/03/19/)
