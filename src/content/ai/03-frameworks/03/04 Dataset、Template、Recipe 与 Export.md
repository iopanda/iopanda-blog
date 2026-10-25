---
title: "Dataset、Template、Recipe 与 Export"
number: "03.03.04"
chapter: 3
chapterTitle: "Frameworks"
section: 3
sectionTitle: "Training and Fine-tuning Frameworks"
group: "01 LLaMA-Factory"
created: 2026-09-04 00:12
author: "iopanda"
tags: ["framework", "training", "fine-tuning", "llama-factory", "dataset", "template", "export"]
sourceId: "3.10.3.3 Training and Fine-tuning Frameworks/01 LLaMA-Factory/02 Dataset、Template、Recipe 与 Export"
---
# Dataset、Template、Recipe 与 Export

> 统一训练工厂真正值钱的地方，不在于“支持很多模型”，而在于把训练链路中最容易分叉的几层统一起来：数据格式、chat template、训练 recipe、导出目标。LLaMA-Factory 的 README、数据文档和 examples 非常清楚地说明了这一点：数据通过 `dataset_info.json` 和格式描述管理；模板必须在训练与推理中保持一致；训练通过一组 YAML examples 驱动；导出又能走 merge、量化、API、vLLM、Ollama 等不同目标。[86][91][92]

**学习目标**：学完本章，你将能够——

1. 解释为什么 dataset / template / recipe / export 是训练工厂最核心的四层；
2. 说出 alpaca、sharegpt、openai format、preference 数据在 LLaMA-Factory 中如何被统一；
3. 理解“训练和推理必须使用同一 template”为什么是硬纪律；
4. 说明 examples 目录为什么本质上是一套 recipe 库；
5. 为一个领域助手设计数据—模板—训练—导出链。

## 1. dataset：为什么它不只是“加载 JSON”

数据 README 明确说明：
- 支持 alpaca / sharegpt 两大格式；
- 支持 json、jsonl、csv、parquet、arrow；
- 通过 `dataset_info.json` 描述 file_name、formatting、ranking、columns、tags 等信息。[91]

这意味着它并不是随手读数据，而是在强迫你回答：
- 这份数据是什么格式；
- 这列是什么角色；
- 这是不是 preference dataset；
- 这是不是 multimodal dataset；
- 系统该如何把它转进统一训练语义。

## 2. template：为什么它是训练成败的硬边界

README 里有一句特别关键：**Remember to use the SAME template in training and inference.** [86]

这不是小提醒，而是整个工厂纪律的核心。因为对于 chat/instruct 模型来说：
- template 决定了消息如何序列化；
- 决定 system / user / assistant / tool call 等角色如何被编码；
- 也决定训练分布是否与推理分布一致。

如果 template 错配，最常见的后果不是程序报错，而是：
- 模型答非所问；
- tool 格式错；
- 推理体验和训练完全不一致。

所以 template 在 LLaMA-Factory 里不是可选修饰，而是数据和模型之间的协议层。

## 3. recipe：为什么 examples 目录本质上就是训练 recipe 库

examples README 直接展示了大量训练 recipe：[92]
- LoRA SFT
- LoRA DPO
- reward modeling
- KTO
- QLoRA
- full-parameter fine-tuning
- DeepSpeed ZeRO-3
- Ray
- merge LoRA
- quantization
- API / webchat / vLLM inference

这说明 examples 目录不是单纯 demo，而是一套：
**可复制的训练配方库。**

对团队来说，这意味着：
- recipe 是组织经验的地方；
- 训练方法切换不必从零写脚本；
- 复杂度更多被压进 config，而不是散在 shell 命令和 notebook 里。

## 4. export：为什么训练结束不是终点，而是另一个系统边界

examples 里明确有：
- merge LoRA adapters
- quantizing model using AutoGPTQ
- save Ollama modelfile
- chat / webchat / OpenAI-style API / vLLM inference。[92]

这说明 LLaMA-Factory 从一开始就不把训练看成“跑完 checkpoint 就结束”，而是把训练结果视作要进入：
- 推理
- 部署
- API
- 量化
- 多种后端
的工件。

这很重要，因为训练系统最容易脱节的地方之一，就是：
- 训练能跑；
- 但导不出；
- 或导出后推理模板错；
- 或推理后端与训练权重形式不兼容。

## 5. DataEngine：为什么它说明“数据接入”本身就是框架子系统

中文 DataEngine 文档清楚描述了：
- 通过 `DataArguments` 接入数据源；
- 读取 dataset_info；
- load_dataset；
- build_data_index；
- converter plugins 做统一格式化；
- 支持 streaming 与非 streaming 模式。[91]

这意味着 LLaMA-Factory 并不是简单把 datasets.load_dataset 裸露给用户，而是在做一个统一 data engine。它的意义在于：
- 多数据源接入更统一；
- 数据格式转换更规范；
- 数据索引和采样策略更可控；
- streaming dataset 也有正式位置。

## 6. 为什么这四层一起看，才是训练工厂

把 dataset、template、recipe、export 放在一起看，你会发现：
- dataset 解决原材料；
- template 解决协议；
- recipe 解决工序；
- export 解决成品交付。

这正是“工厂”一词最准确的含义。LLaMA-Factory 的价值不只是会训，而是把训练链的主要分叉点都收进同一世界观。

## 7. 动手活动：为课程助教写一张训练配方卡

> [!example] 动手活动：输出 `llamafactory-recipe-card.md`
>
> **目标**：为课程助教写一张数据—模板—训练—导出配方卡。
>
> **步骤**：
> 1. 定数据格式：alpaca / sharegpt / preference；
> 2. 定 template：训练和推理必须一致；
> 3. 选 recipe：LoRA SFT / DPO / QLoRA；
> 4. 定导出目标：HF、vLLM、OpenAI-style API、Ollama；
> 5. 写一句结论：为什么这不是一条 shell 命令，而是一条完整配方链。
>
> **完成标准**：你能回答“为什么这份数据配这个 template、这套 recipe、这个导出目标”。

## 8. 边界与排错

- **误区一：dataset 能加载就行。** 格式、角色标签、ranking 属性都会影响训练语义；
- **误区二：template 可以训练时随便选，推理再改。** 这是最常见也最隐蔽的错；
- **误区三：examples 只是 demo。** 在 LLaMA-Factory 里，examples 更像 recipe catalogue；
- **误区四：训练结束就算完成。** 导出、推理、API 接口一致性同样是工程主线；
- **误区五：工厂化会掩盖细节。** 它只是把细节组织起来，不是让细节消失。

## 9. 总结

| 关键问题 | 一句话 |
|---|---|
| dataset 在做什么 | 统一原材料格式与元信息 |
| template 在做什么 | 定义训练和推理共享的消息协议 |
| recipe 在做什么 | 把训练方法变成可重复执行的配置配方 |
| export 在做什么 | 把 checkpoint 变成可部署工件 |
| 为什么四层一起重要 | 它们共同定义了一条完整训练装配线 |

**思考题**：为什么很多训练项目真正翻车的地方，不是学习率调得不对，而是数据格式、template、导出目标之间的隐式错配？LLaMA-Factory 在这方面真正帮团队收敛的是什么？

> [!note] 参考答案
> 因为学习率错误通常很快能在 loss 曲线上暴露，而数据格式、template、导出接口错配常常能“正常跑完”，却在推理阶段才全面翻车。LLaMA-Factory 真正帮团队收敛的，是训练链中这些最容易被忽视的协议层复杂度：数据如何解释、消息如何编码、权重如何导出、推理如何接上。

## 引用

- [86] https://github.com/hiyouga/LLaMA-Factory/blob/main/README.md — LLaMA-Factory README
- [91] https://github.com/hiyouga/LLaMA-Factory/blob/main/data/README.md — LLaMA-Factory data README
- [92] https://github.com/hiyouga/LLaMA-Factory/blob/main/examples/README.md — LLaMA-Factory examples README

上一篇：[01 统一训练工厂的设计哲学](/iopanda-blog/ai/03-frameworks/03/03/)——统一工厂路线立住后，本篇继续看数据、模板、recipe 和导出链如何被组织起来。

下一篇：[03 SFT、DPO、VLM 与多任务统一抽象](/iopanda-blog/ai/03-frameworks/03/05/)——四层配方立住后，下一篇继续看不同训练任务如何被统一收编。
