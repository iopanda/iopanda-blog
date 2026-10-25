---
title: "QLoRA 量化微调"
number: "01.03.06"
chapter: 1
chapterTitle: "Models"
section: 3
sectionTitle: "Fine-tuning and Alignment"
group: ""
created: 2026-09-02 21:47
author: "iopanda"
tags: ["course", "model-fine-tuning", "qlora"]
sourceId: "3.10.1.3 Fine-tuning and Alignment/3.6 QLoRA 量化微调"
---
![](/iopanda-blog/ai/images/Pasted%20image%2020260929010827.png)

> 本章把上一章的 LoRA 升级为 QLoRA(量化微调):在支持 CUDA 的环境中,把冻结的基座权重以 4-bit 量化「压」进显存,同时仍然只训练少量 LoRA adapter。先弄清楚量化到底改变了什么、QLoRA 与 LoRA 是什么关系、为什么不是所有设备都能用,再动手比较两者的资源与质量账。

**学习目标**:学完本章,你将能够——

1. 解释量化在改变什么:精度换显存,近似误差从哪里来;
2. 说出 NF4 与 double quant 分别解决什么问题;
3. 说清 QLoRA 与 LoRA 的关系:同一种学习,不同的权重存放方式;
4. 先验证硬件前提,遇到不兼容时正确记录「不适用」而非强行绕过;
5. 在 SFT 脚本上做最小替换,运行 4-bit 量化训练;
6. 在相同数据与配置下比较 LoRA 与 QLoRA,写清「节省了什么、牺牲了什么」。

## 0. 本章为什么存在

上一章 LoRA 把**可训练参数**从全量权重降到很小(0.5B 模型只训练约 1M 参数),但基座模型本身仍要完整加载进显存:0.5B 参数用 16-bit 约占 1 GB,7B 模型则要约 14 GB。显存不够时训练根本启动不了(`CUDA out of memory`)——这不是调参能解决的,再多 adapter 也救不回来。

QLoRA(Quantized LoRA)的思路是:冻结的基座权重在训练中只参与前向计算、不再更新,那就不必用高精度存放它们,而是用 4-bit 量化把「存放成本」降下来;LoRA adapter 仍以较高精度学习增量。**不这样做会怎样**:模型放不进单卡,要么换更小的模型,要么租更大的 GPU;QLoRA 提供的是第三条路——在相同显存里塞进更大的模型。注意它**不会**提高数据质量,也**不是**所有设备都能运行。

## 1. 概念:量化在改变什么

- 普通权重常用 32 位(float32)或 16 位(float16/bfloat16)浮点数表示:位数越多,能表达的数值越精确,占的显存也越多。**量化(Quantization)**就是用更少的位(8-bit、4-bit)去近似表示同一个权重,把显存占用降下来——代价是引入近似误差:两个本来不同的权重,量化后可能变成同一个数,反量化回来也只是近似值。
- 关键一点:**QLoRA 的 4-bit 只是基座权重的加载与存放策略,不是整个训练都在 4-bit 下进行**。训练中真正更新的 LoRA adapter 通常仍用较高精度(bfloat16/float16)计算,反向传播的梯度只流向 adapter,不流向被量化的权重。

### 1.1 精度每降一半,显存大约省一半

| 权重精度 | 每参数位数 | 7B 模型约需 | 典型用途 |
|---|---|---|---|
| float32 | 32 bit | 约 28 GB | 预训练 |
| float16/bfloat16 | 16 bit | 约 14 GB | 上一章 LoRA 的加载方式 |
| 8-bit | 8 bit | 约 7 GB | bitsandbytes 量化 |
| 4-bit | 4 bit | 约 3.5 GB | QLoRA 的加载方式 |

### 1.2 NF4 与 double quant:两个具体的存储技巧

- **NF4(NormalFloat4)**:bitsandbytes 的一种 4-bit 存储格式,并非简单「四舍五入到 4 位」。它按分位数安排量化级别,使量化误差集中在正态分布权重中很少出现的位置,对语言模型权重(近似正态分布)误差更小。
- **Double Quantization(double quant)**:量化需要一组「缩放因子」记录每个块如何被反量化回近似值,这些因子本身用 32-bit 存也占显存;double quant 把这组缩放因子**再量化一次**(如降到 8-bit),进一步省显存。
- **compute_dtype(计算精度)**:反量化后实际参与矩阵乘法的精度,通常设为 `bfloat16`;GPU 不支持时才退回 `float16`。
- 对初学者,记住它们都是「如何把 4-bit 存得更省、误差更小」的工程选择即可,不必背内部细节——验证的标准永远是「能否运行、省多少显存、结果是否仍满足验收」。

### 1.3 QLoRA 与 LoRA:同一种学习,不同的存放

| | LoRA(上一章) | QLoRA(本章) |
|---|---|---|
| 基座权重 | 16-bit 完整加载 | 4-bit 量化存放 |
| 可训练参数 | 低秩 adapter(ΔW ≈ BA) | 低秩 adapter(相同) |
| 学习目标 | 学行为增量 | 学行为增量(相同) |
| 主要收益 | 省可训练参数与梯度显存 | 再省基座权重的存放显存 |
| 额外代价 | adapter 依赖基座,不能单独发布 | 基座权重引入量化误差 |

- QLoRA 论文的关键实验结论:**4-bit 量化后的微调质量与 16-bit 全精度 LoRA 相当**——因为被量化的是「冻结、不再更新」的权重,真正学习新行为的 adapter 仍保持高精度。这正是「值得做」的核心理由,也是比较实验要验证的假设。
- 放到「全参数微调 vs 高效参数(PEFT)」的光谱上看,三者的差别只在「哪些权重动、以什么精度存放」:

| 方案 | 基座权重 | 可训练参数 | 显存需求 | 何时选择 |
|---|---|---|---|---|
| 全参数微调 | 16-bit | 全部权重 | 最高 | 数据充足、硬件够大、要改整体行为 |
| LoRA(PEFT) | 16-bit | 低秩 adapter | 中 | 单卡能装下模型时的稳妥选择 |
| QLoRA(PEFT) | 4-bit | 低秩 adapter | 最低 | 模型装不进单卡,或想换更大的基座 |

## 2. 为什么不是所有设备可用

bitsandbytes 的量化与反量化发生在前向传播中,依赖 NVIDIA CUDA 生态的 GPU 内核;**macOS(MPS)、纯 CPU 与部分 Windows/驱动组合可能不可用**。QLoRA 不是「任何电脑上都更快」的开关——设备不支持时,问题不在数据或超参数,而在算子本身跑不起来。

遇到不兼容时,正确的三条路:

1. 记录「不适用」作为本章结论,不要安装来历不明的二进制包绕过兼容性(可能破坏环境并引入安全风险);
2. 模型放得下就继续用上一章的 16-bit LoRA,或换更小的模型;
3. 需要量化能力时,改用受控云 GPU 环境。

判断顺序:先看 `torch.cuda.is_available()` 与 GPU 型号(第 3 节),再看显卡是否支持 bfloat16(Ampere 架构及更新通常支持)。

## 3. 动手:先确认环境,不兼容就停止

```bash
python -c "import torch; print(torch.cuda.is_available(), torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'NO CUDA')"
pip install bitsandbytes
```

输出 `NO CUDA` 时,本章的正确结果是记录「不适用」,继续使用上一章 LoRA 或选择受控云 GPU;不要安装来历不明的二进制包绕过兼容性。

## 4. 动手:在 SFT 脚本中做最小替换

复制 `train_sft.py` 为 `train_qlora.py`。替换模型加载段,并在创建 trainer 前调用 `prepare_model_for_kbit_training`:

```python
import torch
from peft import LoraConfig, prepare_model_for_kbit_training
from transformers import BitsAndBytesConfig, AutoModelForCausalLM

quant = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4",
    bnb_4bit_use_double_quant=True, bnb_4bit_compute_dtype=torch.bfloat16)
model = AutoModelForCausalLM.from_pretrained(model_id, quantization_config=quant,
    device_map="auto")
model = prepare_model_for_kbit_training(model)
peft = LoraConfig(r=8, lora_alpha=16, lora_dropout=0.05,
    target_modules=["q_proj", "v_proj"], task_type="CAUSAL_LM")
```

将 `output_dir` 改为 `finetune/runs/qlora-v1`,先跑 5 step。若 GPU 不支持 bfloat16,将 `torch.bfloat16` 改为 `torch.float16`,并在报告中记录这一变化;不要同时修改数据、rank 和学习率。

> [!example] 动手活动:比较 LoRA 与 QLoRA
> **目标**:`reports/qlora.md`。**步骤**:记录 GPU、驱动/PyTorch、最大显存(可用 `nvidia-smi`)、运行时间、valid loss 与固定问题输出;只在相同数据与配置下比较。**完成标准**:结论同时说明节省了什么、牺牲了什么和该配置是否可在你的硬件复现。

## 5. 资源 vs 质量:如何读比较结果

- **预期**:valid loss 与固定问题输出应接近 LoRA(量化误差小、adapter 仍是高精度);若差距明显,先怀疑配置(是否真的以 4-bit 加载、`compute_dtype` 是否被回退)或硬件差异,而不是直接否定量化。
- **资源账要看峰值显存**:用 `nvidia-smi` 记录训练中的显存峰值,回答「同一张卡上,QLoRA 是否让我从『跑不动』变成『能跑』,或让我换用更大的基座」。
- **质量账要固定变量**:与 LoRA 比较时,数据、rank、学习率、步数必须完全一致,否则差异无法归因——这正是上一章基线纪律的延续。
- **何时不必用**:单卡装得下、且已有 LoRA 基线结果时,不要为用而用——每引入一个新变量(量化配置、`compute_dtype`)都增加排错面。QLoRA 解决的是「装不下」,不是「训不好」;训不好应先回到数据与超参数。
- **结论模板**:QLoRA 省下了 X GB 峰值显存、质量损失在可接受范围(或不可接受);该配置在本机可/不可复现,原因是……。

## 6. 总结

| 关键判断 | 一句话 |
|---|---|
| 量化在改变什么 | 用更少的位存放权重,省显存、引入近似误差 |
| NF4 / double quant | 让 4-bit「存得更省、误差更小」的具体格式与技巧 |
| QLoRA 与 LoRA 的关系 | 学习方式相同,只是基座权重改为 4-bit 存放 |
| 为什么不是所有设备可用 | 量化算子依赖 CUDA;MPS/CPU 可能不可用,应记录「不适用」 |
| 资源 vs 质量 | 省显存、能跑更大模型;代价是量化误差与配置复杂度 |

**思考题**:为什么说 4-bit 量化节省的是「存放」而不是「学习」?设备不支持时,为什么正确做法是记录「不适用」而不是安装来路不明的包?

> [!note] 参考答案
> 训练中更新的是高精度 LoRA adapter,量化只影响冻结基座权重的存放与反量化,因此论文实验显示其质量与 16-bit LoRA 相当;「学习」的质量仍由数据、rank 与评测决定。设备不支持时,量化算子本身无法运行,来路不明的包可能破坏环境或引入安全风险,记录「不适用」才是可复现、可审查的结论。

## 引用

- [Transformers:bitsandbytes 量化](https://huggingface.co/docs/transformers/main/en/quantization/bitsandbytes)
- [QLoRA 论文](https://arxiv.org/abs/2305.14314)

上一篇:[LoRA 低秩适配](/iopanda-blog/ai/01-models/03/05/)——LoRA 先降「可训练参数」;本章再把「冻结的基座权重」压到 4-bit。

下一篇:[偏好优化与对齐](/iopanda-blog/ai/01-models/03/07/)——在可靠的 SFT 之后,学习如何用偏好对改变回答选择。
