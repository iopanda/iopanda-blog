---
title: "LoRA 低秩适配"
number: "01.03.05"
chapter: 1
chapterTitle: "Models"
section: 3
sectionTitle: "Fine-tuning and Alignment"
group: ""
created: 2026-09-02 22:00
author: "iopanda"
tags: ["course", "model-fine-tuning", "lora"]
sourceId: "3.10.1.3 Fine-tuning and Alignment/3.5 LoRA 低秩适配"
---
![](/iopanda-blog/ai/images/Pasted%20image%2020260929010813.png)

> 上一章你用 LoRA 跑通了第一个 SFT,但那份配置是照抄的。本章不再只是再跑一次训练,而是弄清**为什么不全量微调**、**低秩近似为什么可行**,再有依据地选择注入层与 rank,并验证 adapter 可单独加载。读完你就能解释「r=8、alpha=16」里每个数字在控制什么,而不是把配置名当成咒语。

**学习目标**:学完本章,你将能够——

1. 从显存、存储、多版本三个角度说出为什么不全量微调;
2. 用低秩近似的直觉解释「为什么 ΔW 可以写成两个小矩阵的乘积」;
3. 解释 r、alpha、dropout、target_modules 各自在控制什么;
4. 在模型结构中核对候选层,有依据地选择 `target_modules`;
5. 统计并解释可训练参数比例;
6. 保存/加载 LoRA adapter,并解释为什么 adapter 依赖基座模型。

## 1. 概念:为什么不全量微调

第 4 章证明了「用示例改变参数」有效,但参数怎么改还有讲究。上一章冻结基座、只训练 adapter 不是偷懒——全量微调(Full Fine-tuning)在消费级设备上常常做不到,即便做得到也不划算:

- **显存**:一个 0.5B 模型约有五亿个参数。全量微调时,每个参数除了权重本身,还要保存梯度和优化器状态(Adam 对每个参数维护两个动量),训练态占用常达权重的数倍;0.5B 都吃力,更大的模型更不用提。冻结基座后,显存里只有权重加一小块 adapter,差距可达一个数量级。
- **存储**:全量微调一次产出一份完整权重副本,动辄十几 GB;LoRA adapter 通常只有几十 MB,一个目录能放下十几个版本。
- **多版本**:为「数据库助教」「Python 助教」「写作助手」各存一份完整模型不现实;共享一个冻结基座、各挂一个小 adapter,切换只需换加载路径。
- **风险**:改动全部参数也更容易把训练样本背下来(过拟合),甚至冲掉已有能力(灾难性遗忘)。

### 1.1 全参数 vs 高效参数(PEFT)对照

| 对比项 | 全参数微调(Full FT) | 高效参数微调(PEFT,如 LoRA) |
|---|---|---|
| 更新范围 | 全部模型权重 | 只更新少量新增低秩矩阵(adapter) |
| 显存/存储 | 梯度与优化器状态庞大,每份副本一套完整权重 | 基座冻结,只需保存几十 MB 的 adapter |
| 多版本并存 | 每领域一份完整副本,成本高 | 同一基座挂多个 adapter,切换即换版本 |
| 适用场景 | 数据量大、算力足、需要大幅改变行为 | 消费级设备、快速实验、多版本并存 |
| 主要风险 | 易过拟合、易灾难性遗忘 | 容量小,复杂行为可能学不动 |

注意:这不是「免费的午餐」——LoRA 把可训练参数量压到极小,代价是表达能力受限。它适合在已有能力之上微调输出倾向,不适合从零教会基座完全没有的能力。

## 2. 概念:低秩近似的直觉

LoRA 为什么敢只学两个小矩阵?关键在于它对微调过程的一个观察:

- 微调不是重学语言,而是在预训练得到的权重上做**小幅修正**。LoRA 论文(Hu et al., 2021)指出:全量微调学到的增量 ΔW 往往「内在秩(intrinsic rank)」很低——它虽是一个大矩阵,但有效的独立变化方向很少。
- 数学上,若增量 ΔW 的秩不超过 r,它就能写成两个瘦矩阵的乘积:`ΔW = B×A`,其中 B 是 d×r、A 是 r×d——参数量从 d×d 降到 2×d×r。r 远小于 d 时,节省是平方级的。
- 直觉类比:**修订页**。全量微调等于重印整本书;LoRA 等于在书边贴小纸条,只记录「这几处要这么改」。纸条必须贴在某一版书上,换了版(换了基座)纸条就对不上——这正是 adapter 依赖基座的根源。

前向计算变为 `h = Wx + (alpha/r)·BAx`:原路径 `Wx` 原封不动,新增路径 `BAx` 提供一个小的修正项。初始化时 B 置零,增量从零开始学,插入 adapter 不会让模型行为跳变。

### 2.1 为什么 adapter 依赖基座

- adapter 存的是 ΔW 的分解,不是完整权重;`model = W + adapter` 才是可用模型,因此**单独的 adapter 文件不是完整模型**,必须与同一基座(相同架构、相同分词器)配对。
- 换基座或换分词器,输出都可能异常;报告里必须同时记录基座模型 ID 与 adapter 路径——只给 adapter 链接、不给基座,别人无法复现你的结果。

## 3. 概念:r、alpha、dropout、target_modules 在控制什么

| 参数 | 控制什么 | 直觉 | 本章取值 |
|---|---|---|---|
| `r` | 低秩分解的中间维度,即 ΔW 的秩上限 | 修订容量:r 大可表达的变化更多,也更耗显存;r 小更省但可能学不动 | 4 与 16 对比 |
| `lora_alpha` | 修正项的缩放系数,实际生效的是 `alpha / r` | 把 B×A 的数值放大/缩小;与 r 同倍调整可只改容量、不改步长 | 8 与 32 |
| `lora_dropout` | 训练时把进入 adapter 的激活随机置零的比例 | 防 adapter 过拟合的正则;推理时关闭,不影响输出 | 0.05 |
| `target_modules` | 把 LoRA 注入哪些层(如注意力里的 `q_proj`、`v_proj`) | 决定「修订哪些章节」;不同架构层名不同,必须核对 | `["q_proj","v_proj"]` |

- **r 与 alpha 的关系**:真正乘到增量上的因子是 `alpha / r`,不是 alpha 本身。r=4/alpha=8 与 r=16/alpha=32 的缩放因子都是 2——保持这个比值不变,r 就成了唯一变量,这正是第 5 节「只改变一个变量」能成立的原因。
- **dropout 只在训练时生效**:它随机丢弃部分进入 adapter 的激活,防止 adapter 把训练样本背下来;推理时自动关闭,配合 `do_sample=False`,同一份配置的输出是确定的。
- **target_modules 决定可训练参数有多少**:注入层越多、r 越大,可训练参数越多。上一章 `train_sft.py` 里的 `q_proj`、`v_proj` 不是拍脑袋——注意力投影是行为修正最敏感的位置之一;但不同架构命名不同(如 GPT-NeoX 的合并层 `query_key_value`),盲抄会报「找不到模块」或注入到错误位置。

## 4. 动手:核对模型里真实存在的层

先在模型结构中核对候选层,而非凭名称猜测:

```bash
python -c "from transformers import AutoModelForCausalLM as A; m=A.from_pretrained('Qwen/Qwen2.5-0.5B-Instruct'); print([n for n,_ in m.named_modules() if n.endswith('q_proj') or n.endswith('v_proj')][:8])"
```

把输出与 LoraConfig 的 `target_modules` 对照:名字对不上就改配置,而不是改模型。核对通过后,复制上一章 `train_sft.py` 为 `train_lora_compare.py`。

## 5. 动手:做一个只改变一个变量的比较

保持数据、seed、步数、学习率和评测问题不变,只运行以下两套配置:

```python
small = LoraConfig(r=4, lora_alpha=8, lora_dropout=0.05,
    target_modules=["q_proj", "v_proj"], task_type="CAUSAL_LM")
large = LoraConfig(r=16, lora_alpha=32, lora_dropout=0.05,
    target_modules=["q_proj", "v_proj"], task_type="CAUSAL_LM")
```

创建 adapter 后立刻打印比例:

```python
trainable = sum(p.numel() for p in trainer.model.parameters() if p.requires_grad)
total = sum(p.numel() for p in trainer.model.parameters())
print(f"trainable={trainable:,}/{total:,} ({100*trainable/total:.3f}%)")
```

预期:可训练参数只占极小比例(通常远低于 1%),且 r=16 的比例约为 r=4 的 4 倍——这串数字就是「LoRA 省了什么」的直接证据。用 `r=4` 输出到 `runs/lora-r4`,用 `r=16` 输出到 `runs/lora-r16`,绝不可共用 output 目录。训练后以相同的 valid loss 和固定 10 问比较,选择规则在训练前写进报告。

## 6. 动手:独立加载验收

创建 `finetune/src/load_adapter.py`:

```python
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer
base = AutoModelForCausalLM.from_pretrained("Qwen/Qwen2.5-0.5B-Instruct")
model = PeftModel.from_pretrained(base, "finetune/runs/lora-r4/best-adapter")
tokenizer = AutoTokenizer.from_pretrained("finetune/runs/lora-r4/best-adapter")
print(model.peft_config, len(tokenizer))
```

运行 `python -m finetune.src.load_adapter`,无报错才证明保存路径完整。这段代码同时演示了 2.1 节的结论:先加载基座,再把 adapter 叠上去。`adapter_config.json` 缺失通常表示保存了 trainer checkpoint 而非最终 adapter;回到上一章调用 `save_model`。

## 7. 动手活动:选择 LoRA 配置

> [!example] 动手活动:选择 LoRA 配置
> **目标**:`reports/lora-comparison.md`。**步骤**:运行两组 r;记录参数比例、显存/运行时、valid loss 与 10 问结果;标注失败案例。**完成标准**:结论明确说明选哪组和依据,不能因 r 大就默认胜出。

## 8. 常见错误与结论

| 现象 | 处理 | 原因 |
|---|---|---|
| `adapter_config.json` 缺失 | 回到上一章调用 `save_model` 重新保存 | 存的是 trainer checkpoint,不是最终 adapter |
| 可训练参数比例异常(过高或为零) | 核对 `target_modules` 名称与模型实际层名 | 注入层配置与架构不匹配 |
| 显存不足 | 转第 6 章 QLoRA,用低比特加载基座 | adapter 省的是可训练参数,基座权重仍占显存 |

一句话结论:**r 决定容量、alpha/r 决定步长、dropout 防过拟合、target_modules 决定改哪里**;r 更大不代表更好,是否胜出要由同一基线上的 valid loss 与固定问题说了算。

## 9. 总结

| 关键问题 | 一句话 |
|---|---|
| 为什么不全量微调 | 显存(梯度与优化器状态)、存储(完整副本)、多版本(每领域一份)三重成本 |
| 低秩近似为什么可行 | 微调增量 ΔW 内在秩低,可写成 B×A 两个小矩阵,参数量从 d² 降到 2dr |
| r 在控制什么 | 修订容量(ΔW 的秩上限),r 大表达力强但更耗显存 |
| alpha 在控制什么 | 经 alpha/r 缩放修正项;与 r 同倍调可保持步长不变 |
| dropout 在控制什么 | 训练时对 adapter 输入的正则,推理时关闭 |
| target_modules 在控制什么 | 注入哪些层;必须与架构实际层名核对 |
| 为什么 adapter 依赖基座 | adapter 只是 ΔW 的分解,叠回同一基座才是完整模型 |

**思考题**:为什么说「r 越大越好」是错的?换一个不同架构的基座,`target_modules=["q_proj","v_proj"]` 还能直接用吗?为什么单独发一个 adapter 文件给同事往往无法复现?

> [!note] 参考答案
> r 只决定容量上限,是否更好要看同一基线下的 valid loss 与固定问题;r 翻倍参数只多几个 MB,但显存与过拟合风险同步上升。不同架构的层名不同(如合并的 `query_key_value`),必须先核对再改配置。adapter 必须与同一基座配对,同事没有基座 ID 与相同分词器,就无法加载出可用模型。

## 引用

- [PEFT:LoRA 方法](https://huggingface.co/docs/peft/main/en/task_guides/lora_based_methods)
- [LoRA 原始论文](https://arxiv.org/abs/2106.09685)

上一篇:[监督微调 SFT](/iopanda-blog/ai/01-models/03/04/)——第一次真实训练已完成,adapter 的机制与每个参数的含义在本章展开。

下一篇:[QLoRA 量化微调](/iopanda-blog/ai/01-models/03/06/)——显存仍不足时,结合低比特加载基座完成同一任务。
