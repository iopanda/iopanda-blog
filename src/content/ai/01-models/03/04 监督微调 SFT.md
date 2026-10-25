---
title: "监督微调 SFT"
number: "01.03.04"
chapter: 1
chapterTitle: "Models"
section: 3
sectionTitle: "Fine-tuning and Alignment"
group: ""
created: 2026-09-02 21:45
author: "iopanda"
tags: ["course", "model-fine-tuning", "sft"]
sourceId: "3.10.1.3 Fine-tuning and Alignment/3.4 监督微调 SFT"
---
![](/ai/images/Pasted%20image%2020260929010754.png)

> 本章完成 01.03 的第一次真实训练:数据(第 2 章)与训练栈(第 3 章)已经就绪,现在用监督微调(Supervised Fine-Tuning,SFT)让模型参数真正因为课程示例而改变。你会先弄清 SFT 在最小化哪个数字、`SFTTrainer` 替你隐藏了哪些环节,然后实际训练出第一个 adapter,并用验证集与第一章的固定基线判断:模型学到了「回答方式」,还是仅仅背下了训练题。

**学习目标**:学完本章,你将能够——

1. 说出 SFT 的 loss 在优化什么,解释 epoch、batch、梯度累积各自的角色;
2. 解释 `SFTTrainer` 替你完成了哪些步骤、哪些事它不会替你做;
3. 配置一个小规模、可恢复的 SFT run,并用 `SFTTrainer` 训练 chat 数据;
4. 保存 adapter、日志与配置;
5. 用 valid loss 与第一章固定基线,判断结果是「学到行为」还是「背题」。

## 1. 概念:SFT 在最小化什么

监督微调仍然是「预测下一个 token」的练习——这与 01.02 的预训练目标完全同构,区别只在数据:预训练学的是海量网页文本,而 SFT 的「教材」是第 2 章审核过的课程问答示例。模型读到序列的每个位置,会给「下一个 token 是谁」的每个候选打一个分数;**loss(损失)**衡量「示例里那个标准答案 token」的分数是否足够高。反向传播把误差送回可训练参数,优化器把参数向「让标准答案分数更高」的方向轻轻推一步。如此反复许多步之后,模型对课程类问题的输出倾向就改变了——这就是「微调改变参数」的微观机制。

### 1.1 loss 在哪些 token 上算

- 样本被拼成「system + 用户问题 + 标准回答」的 token 序列;训练时序列右移一位作为标签:每个位置的监督信号是「真实的下一 token」。
- 只有真实内容参与 loss;padding 位置用忽略索引(`-100`)排除,否则空位会被当成噪声标签。
- 是否把用户问题部分也计入 loss,是可选配置:TRL 提供 `assistant_only_loss=True`(对话格式)或 `completion_only_loss=True`(prompt-completion 格式)让 loss 只落在回答上;默认对整段非 padding token 计算。无论哪种,「标准答案」都来自审核过的示例——SFT 的实质是模仿示例中的续写方式,而不是给模型灌输新事实。

### 1.2 epoch、batch 与梯度累积:三个训练旋钮

| 概念 | 在控制什么 | 本章取值 |
|---|---|---|
| epoch | 把训练集完整过几遍 | 1 |
| batch size | 一次前向/反向同时处理的样本数 | 1 |
| 梯度累积(gradient accumulation) | 攒几个小 batch 的梯度后更新一次 | 8 |

- **一个 epoch** = 把训练集完整看一遍。小数据(几百条)上跑很多 epoch,模型很容易把「问题→答案」逐条背下来,所以监督学习基线只用 **1 epoch**。
- **batch size** 越大,每步梯度越稳,但显存占用越高。
- **梯度累积**是「以时间换显存」:连续算 8 个小 batch、把梯度加起来,再统一更新一次。batch size 1 + 累积 8,等效于「每 8 条样本更新一次」,峰值显存却只按 1 条算。
- **学习率**控制每一步把参数推多远:本章 LoRA 起步 `2e-4`;太大一步跨过头,太小一 epoch 挪不动。

### 1.3 valid loss:为什么它是「没只背题」的证据

- 训练 loss 下降只说明模型越来越会拟合练习册——拟合到极限就是逐字记住训练样本,那是「背题」而不是「学会」。
- **valid loss 在留出数据上计算**:第 2 章的 `valid.jsonl` 从未参与梯度更新。若模型只是背题,它在没见过的验证样本上不会变好,valid loss 会在训练后期不降反升。
- 因此本章设 `eval_strategy="steps"`、每 5 步在验证集上算一次 loss:训练 loss 与 valid loss **同步下降**,是「学到了可泛化的回答方式」的初步证据;train 降而 valid 不降或回升,就是过拟合信号。
- 局限要说清:valid loss 低只证明「回答方式与示例一致」,不证明内容事实正确——SFT 改变的是输出倾向,不是知识库,幻觉不会因此消失。

### 1.4 全参数 vs 高效参数(PEFT)对照

| 对比项 | 全参数微调(Full FT) | 高效参数微调(PEFT,如 LoRA) |
|---|---|---|
| 更新范围 | 全部模型权重 | 只更新少量新增低秩矩阵(adapter) |
| 显存/存储 | 优化器状态与梯度都很大,每份副本一套完整权重 | 基座冻结,只需保存几十 MB 的 adapter |
| 适用场景 | 数据量大、算力足、需要大幅改变行为 | 消费级设备、快速实验、多版本并存 |
| 主要风险 | 易过拟合、易灾难性遗忘 | 容量小,复杂行为可能学不动 |

本章用 LoRA 不是为省事,而是让「监督学习基线」能在消费级设备上跑通;adapter 的原理与每个参数的含义,下一章(05 LoRA 低秩适配)再展开。

## 2. `SFTTrainer` 隐藏了什么

`SFTTrainer` 是 TRL 在 Transformers `Trainer` 之上封装的监督微调入口。你只给它:模型、数据集、`TrainingArguments`、tokenizer 与 LoRA 配置,它替你做掉一整条训练管线:

- **数据序列化**:把 chat 样本套上 chat template、tokenize、截断到 `max_length=512`、组装批次——第 3 章手写的那些环节;
- **标签构造**:序列右移一位生成「预测下一个 token」的标签,padding 置 `-100` 不计 loss;是否只对回答部分算 loss 由开关控制;
- **训练循环**:前向、算交叉熵、反向、按 `gradient_accumulation_steps` 攒梯度、优化器更新、学习率调度;
- **验证与保存**:每 5 步在验证集算 valid loss,`load_best_model_at_end=True` 让训练结束时自动恢复 best checkpoint,`save_model` 把 adapter 存到 `best-adapter/`。

它**不会**替你做:判断答案事实是否正确(loss 只认「续写对不对得上示例」,不认真假)、挑选数据集与超参数、决定这轮结果要不要用——那是第 1 章基线与你的判断。

若不用 `SFTTrainer` 而手写循环,你必须自己实现上面每一步,还要处理断点恢复、日志、多卡等细节;工程上没有理由重复造轮子。想验证它「没骗你」,把训练日志的 loss 曲线与文档描述对照即可。

## 3. 动手:训练第一个 SFT run

### 3.1 起步配置

全参数微调 0.5B 模型也可能超出消费级显存(优化器状态与梯度都要占内存),因此本章的 SFT 使用 LoRA adapter(下一章才解释其原理)。配置的目的只是跑通**监督学习基线**:1 epoch、batch size 1、梯度累积 8、学习率 `2e-4`。小数据训练很多 epoch 常常只会记住问题答案,所以基线不贪多;`logging_steps=1` 让你看到每一步的 loss,`eval_steps=5` 让 valid loss 与训练 loss 同步出现,`seed=42` 保证可复现。

创建 `finetune/src/train_sft.py`:

```python
from datasets import load_dataset
from peft import LoraConfig
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
from trl import SFTTrainer

model_id = "Qwen/Qwen2.5-0.5B-Instruct"
data = load_dataset("json", data_files={"train":"finetune/data/train.jsonl", "validation":"finetune/data/valid.jsonl"})
tokenizer = AutoTokenizer.from_pretrained(model_id)
tokenizer.pad_token = tokenizer.eos_token
model = AutoModelForCausalLM.from_pretrained(model_id)

args = TrainingArguments(
    output_dir="finetune/runs/sft-v1", num_train_epochs=1,
    per_device_train_batch_size=1, per_device_eval_batch_size=1,
    gradient_accumulation_steps=8, learning_rate=2e-4,
    logging_steps=1, eval_strategy="steps", eval_steps=5,
    save_strategy="steps", save_steps=5, load_best_model_at_end=True,
    report_to="none", seed=42,
)
peft = LoraConfig(r=8, lora_alpha=16, lora_dropout=0.05,
                  target_modules=["q_proj", "v_proj"], task_type="CAUSAL_LM")
trainer = SFTTrainer(model=model, args=args, train_dataset=data["train"],
    eval_dataset=data["validation"], processing_class=tokenizer,
    peft_config=peft, max_length=512)
trainer.train()
trainer.save_model("finetune/runs/sft-v1/best-adapter")
tokenizer.save_pretrained("finetune/runs/sft-v1/best-adapter")
```

### 3.2 运行与核对

运行前先将模型卡列出的 target module 名称与 `q_proj`、`v_proj` 核对;不同架构不能盲抄。执行 `python -m finetune.src.train_sft`。

训练日志必须同时出现 train loss 与 eval loss;若只有 train loss、没有 eval,先检查 `valid.jsonl` 是否为空、路径是否写对。逐项确认:loss 在下降、valid loss 同步出现、`output_dir` 下按步生成 checkpoint、日志里记录了可训练参数数(只有 LoRA 那部分)。

## 4. 动手活动:保留 SFT 证据

> [!example] 动手活动:保留 SFT 证据
>
> **目标**:`finetune/runs/sft-v1/best-adapter/` 和 `finetune/reports/sft-v1.md`。
>
> **步骤**:首次只运行 5 step 验证流程,再恢复完整 1 epoch;记录训练/验证 loss、运行时间、设备和可训练参数数;用第一章 10 条固定问题生成回答,连同基线并排保存。
>
> **完成标准**:adapter 目录含配置和权重;验证样本未参与训练;报告说明哪些问题改善、哪些变差,不能只贴最好的一条输出。

## 5. 常见错误与结论

| 现象 | 处理 | 原因 |
|---|---|---|
| loss 降到极低,valid loss 不降反升 | 先怀疑过拟合;增加 epoch 不是第一反应 | 模型开始背训练题,没学到可泛化行为 |
| 显存不足 | 转到第六章 QLoRA,不要随意截断所有样本 | 全量参数或过大 batch 超出显存 |
| 日志没有 eval loss | 检查 `valid.jsonl` 是否为空、路径是否写对 | 验证集没被加载 |
| valid loss 低但回答仍错 | 回到数据与基线逐条比较,别指望 SFT 保证正确 | SFT 学的是回答方式,不消除幻觉 |

一句话结论:**loss 降到极低且 valid 变差是过拟合信号**;SFT 学的是示例中的回答方式,不能证明模型事实正确,也不能消除幻觉——这两条要在报告里写清楚。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| SFT 在最小化什么 | 示例序列上「下一个 token」的交叉熵(loss),经反向传播调整可训练参数 |
| epoch/batch/梯度累积 | 分别控制「看几遍」「一步看多少」「攒几步再更新」,共同决定显存与步数 |
| SFTTrainer 隐藏了什么 | 序列化、标签构造、训练循环、验证与保存;不替你判断事实 |
| valid loss 为什么重要 | 在留出集上计算,是「学到行为」还是「背题」的初步证据 |
| 为什么用 LoRA 起步 | 消费级显存跑得动监督基线;adapter 原理下一章展开 |

**思考题**:为什么「训练 loss 降得很低」不能作为微调成功的证据?valid loss 低又能证明什么、不能证明什么?

> [!note] 参考答案
> 训练 loss 只衡量对练习册的拟合度,拟合到极致就是背题;valid loss 在从未参与训练的留出集上计算,它与训练 loss 同步下降,才说明学到了可泛化的回答方式。但 valid loss 低只能证明「回答风格与示例一致」,不能证明事实正确或幻觉消除——那要靠第一章固定基线逐条比较与人工审核。

## 引用

- [TRL:SFTTrainer](https://huggingface.co/docs/trl/main/en/sft_trainer)
- [Transformers:训练](https://huggingface.co/docs/transformers/main/en/training)

上一篇:[Hugging Face 训练栈](/ai/01-models/03/03/)——训练数据与模板已通过检查,训练管线已接通。

下一篇:[LoRA 低秩适配](/ai/01-models/03/05/)——理解并可控地配置刚才使用的 adapter。
