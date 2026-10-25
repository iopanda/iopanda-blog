---
title: "Dataset、Template、YAML 与实验管理"
number: "03.03.32"
chapter: 3
chapterTitle: "Frameworks"
section: 3
sectionTitle: "Training and Fine-tuning Frameworks"
group: "05 Axolotl"
created: 2026-09-04 02:42
author: "iopanda"
tags: ["framework", "training", "fine-tuning", "axolotl", "dataset", "template", "yaml"]
sourceId: "3.10.3.3 Training and Fine-tuning Frameworks/05 Axolotl/02 Dataset、Template、YAML 与实验管理"
---
# Dataset、Template、YAML 与实验管理

> Axolotl 的 SFT agent 文档给出了一个非常清楚的架构：YAML config 负责 model、dataset、adapter、hyperparameters，然后通过 `prompt_strategies` 把不同数据格式接入训练流程。[15] AGENTS.md 也明确说，每个 `type:` 都会映射到 `prompt_strategies/` 下的实现。[14] 这意味着在 Axolotl 里，数据格式、chat template、label masking、sample packing，并不是零散选项，而是 recipe 的正式组成部分。

**学习目标**：学完本章，你将能够——
1. 理解 dataset、template、masking 为什么在 Axolotl 里被 YAML 化；
2. 说出 `type:` 与 `prompt_strategies/` 的关系；
3. 解释为什么数据和模板是训练 recipe 的协议层；
4. 判断实验管理为什么不能只靠命令行参数；
5. 为项目写一张 dataset-template card。

## 1. 数据不是“读进来就行”，而是要被 prompt strategy 解释

SFT agent 文档直接给出了数据决策树：[15]
- `chat_template`
- `alpaca`
- `input_output`
- `completion`

这说明 Axolotl 不是默认一种统一数据格式，而是承认真实世界有多种格式，然后用 prompt strategy 把它们收编。

## 2. `type:` 为什么是关键字段

AGENTS.md 说得很直接：每个 `type:` value 都映射到 `src/axolotl/prompt_strategies/` 中的实现。[14]
这意味着 `type:` 不是简单标签，而是：
- 决定如何构造 prompt；
- 决定如何 tokenization；
- 决定 label masking 如何工作；
- 决定 chosen/rejected、chat messages、input/output 的解释方式。

## 3. YAML 管理数据和模板的好处

如果这些信息不进 YAML，往往会散落在：
- notebook 预处理代码；
- shell 参数；
- tokenizer patch；
- 临时脚本。

一旦散落，最容易发生的就是：
- 训练和推理 template 不一致；
- 某次实验多开了 packing 或 wrong masking；
- 同一个数据集被不同人解释成不同格式。

Axolotl 用 YAML 把这些协议层显式化。

## 4. Qwen3 例子为什么很有代表性

Qwen3 示例 README 特别提醒：如果 assistant prompt masking 偏了几 token，要在 yaml 里显式写 `chat_template: qwen3`。[18]
这很能说明 Axolotl 的工程观：
- 模板不是装饰；
- 模板错误会直接影响 label masking；
- 因此它必须进 recipe，而不是靠“大家默认知道”。

## 5. 动手活动

> [!example] 输出 `axolotl-dataset-template-card.md`
>
> 为你的数据写清楚：`type:`、chat template、是否 train_on_inputs、是否 sample_packing、字段映射。写一句结论：为什么这些不是预处理细节，而是训练协议。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| `type:` 在做什么 | 把数据格式映射到 prompt strategy |
| template 为什么重要 | 它决定消息如何被编码和 mask |
| YAML 化的意义 | 把协议层复杂度显式收编进 recipe |
| 实验管理真正管什么 | 不是参数列表，而是训练协议本身 |

## 引用

- [14] https://github.com/axolotl-ai-cloud/axolotl/blob/main/AGENTS.md — Axolotl AGENTS overview
- [15] https://github.com/axolotl-ai-cloud/axolotl/blob/main/docs/agents/sft.md — Axolotl SFT agent doc
- [18] https://github.com/axolotl-ai-cloud/axolotl/blob/main/examples/qwen3/README.md — Axolotl Qwen3 example doc

上一篇：[01 配置即训练 recipe 的设计哲学](/ai/03-frameworks/03/31/)

下一篇：[03 LoRA、QLoRA、DPO 与多后端训练编排](/ai/03-frameworks/03/33/)
