---
title: "Learning Path"
number: "01.00.01"
chapter: 1
chapterTitle: "Models"
section: 0
sectionTitle: "章导览"
group: ""
created: 2026-09-02 12:00
author: "iopanda"
tags: ["ai", "models", "learning-path"]
sourceId: "00 Learning Path"
---
# Learning Path

本路径不是 AI 概念导览，而是一套以“完成项目即获得能力”为标准的模型工程学习手册。完成 `01 Models` 后，学习者应能从零训练一个教学规模的基础语言模型，并在开源模型上完成数据准备、微调、评测、推理服务与迭代。

# 内容

## 最终能力边界

| 能力 | 完成标准 |
|---|---|
| 从零训练 | 用 PyTorch 实现并训练一个小型 GPT；自行实现 tokenizer、数据管道、训练循环、checkpoint 和生成采样 |
| 预训练工程 | 能为更大模型设计数据、训练配置、评测与分布式训练方案，并理解所需算力和成本 |
| 微调与对齐 | 用 Hugging Face + PEFT 完成 SFT、LoRA/QLoRA 微调，比较基线与微调结果 |
| 评测与调优 | 构建任务集，分析失败样本，调整数据、超参数或提示策略，记录可复现实验 |
| 推理与部署 | 量化或选择合适模型，提供本地/服务端推理接口，监测质量、延迟和成本 |

> [!warning] 现实边界
>
> “从零训练基础模型”分为两个层次。个人设备上可以完整复现**小型 GPT 的端到端预训练**，这才是本路径的必做项目；训练具有通用能力的 7B+ 基础模型需要海量数据、数百至数千张 GPU 和成熟集群。本路径会让你具备规划、执行和排查后者的工程能力，但不会承诺个人电脑可复现其成本规模。

## 学习顺序与阶段产出

| 阶段 | 目录 | 要完成的项目 | 获得的能力 |
|---|---|---|---|
| 1 | `01.01 Foundations` | 从零实现并训练 Mini GPT | Python、PyTorch、Transformer 与训练循环 |
| 2 | `01.02 Pretraining and Training` | 可恢复训练、数据混合、评测仪表盘 | 小模型预训练工程 |
| 3 | `01.03 Fine-tuning and Alignment` | 对开源模型做 LoRA/QLoRA 指令微调 | 领域模型调优 |
| 4 | `01.04 Inference and Deployment` | 部署可调用的推理服务 | 推理优化与交付 |
| 5 | `01.05 Multimodal Models` | 文本+图像任务原型 | 多模态建模基础 |
| 6 | `01.06 Evaluation and Benchmarks` | 可复用的评测集与报告 | 有证据地选模型、改模型 |
| 7 | `01.07 Safety and Governance` | 风险清单、数据与模型卡 | 可控、可审计地上线 |

## 每章的固定结构

每篇手册必须包含：本章完成后能做什么、所需前置、环境与数据、逐步操作、可运行代码、常见错误、验收任务、延伸阅读。只解释概念而不能产出可运行结果，不算完成。

## 统一技术栈

- Python 3.11+、uv 或 conda、Git、VS Code；
- PyTorch、NumPy、Jupyter；
- Hugging Face Transformers / Datasets / Tokenizers / PEFT；
- Weights & Biases 或 MLflow（记录实验）；
- 小项目先用 CPU 或单张消费级 GPU；涉及大训练时使用云端 GPU 并先估算成本。

## 结业项目

从一个公开文本数据集开始，完成“数据许可核查 → tokenizer → Mini GPT 预训练 → checkpoint 恢复 → 生成与评测 → LoRA 微调开源模型 → API 服务 → 模型卡”的完整仓库。提交物必须包括可复现环境、训练配置、实验记录、样例输出、失败案例和成本说明。

## 逐章任务蓝图

每章预算 45 分钟操作 + 15 分钟复盘。完成标准是提交物能运行或可检查，而不是“读过了”。现有 Foundations 笔记将按以下蓝图逐篇重写。

### 01.01 Foundations：进入可编程的模型世界（10 小时）

| 章节 | 本章动手任务与交付物 | 验收标准 |
|---|---|---|
| 01 Learning Roadmap and Prerequisites | 选择本地或云 GPU 路线，创建学习仓库和能力基线 | 写出硬件、预算、时间与结业项目范围 |
| 02 Development Environment | 安装 Python、uv、Git、PyTorch、Jupyter，运行 GPU 检查脚本 | 能在 notebook 中输出 PyTorch 版本、设备与张量 |
| 03 Python, NumPy, and Tensors | 用 NumPy 实现向量/矩阵计算，用 PyTorch 改写 | 能解释 shape、dtype、device 并消除维度报错 |
| 04 Linear Algebra for Deep Learning | 手算并编码矩阵乘法、向量相似度和线性层 | 写出一个不依赖框架的线性层前向计算 |
| 05 Calculus and Optimization | 用有限差分验证导数，用梯度下降拟合直线 | 绘制 loss 曲线并解释学习率失效的现象 |
| 06 Machine Learning Workflow | 完成一个分类任务的数据切分、训练、验证与测试 | 能区分过拟合、数据泄漏与泛化误差 |
| 07 PyTorch Fundamentals | 使用 Dataset、DataLoader、autograd、optimizer 写训练循环 | 一次训练可复现并保存模型权重 |
| 08 Neural Networks in Practice | 从 MLP 开始做分类，加入正则化和验证 | 能比较基线与改进模型，给出实验结论 |
| 09 Tokenization, Embeddings, and Attention | 实现字符级 tokenizer、embedding 查表和单头注意力 | 能打印 token、shape 与 attention 权重 |
| 10 Build a Mini GPT | 将前述模块组合成可生成文本的极小 GPT | 给定提示词能生成文本，并提交代码仓库 |

### 01.02 Pretraining and Training：从零预训练 Mini GPT（10 小时）

| 章节 | 本章动手任务与交付物 | 验收标准 |
|---|---|---|
| 01 Pretraining Goals and Constraints | 为 Mini GPT 写训练目标、规模、预算和成功指标 | 能区分教学复现与生产级基础模型训练 |
| 02 Data Sources and Licenses | 选择公开文本并记录来源、许可证和敏感数据风险 | 提交数据清单与许可判断，不使用来源不明语料 |
| 03 Data Cleaning and Deduplication | 清洗文本、去重、过滤异常样本并抽样检查 | 输出清洗前后统计和可人工检查的样本 |
| 04 Dataset Splits and Data Mixtures | 设计训练/验证/测试切分与数据混合比例 | 切分可复现，测试集不会参与训练决策 |
| 05 Train a Tokenizer | 用 Tokenizers 训练 BPE tokenizer 并评估压缩率 | 保存 tokenizer，能编码、解码并解释特殊 token |
| 06 Build a Data Pipeline | 将 token 流切为固定上下文窗口并构建 DataLoader | 一个 batch 的输入、标签和 mask 全部正确 |
| 07 Implement a Decoder-only Transformer | 实现位置编码、masked attention、MLP、残差和 layer norm | 单元级 shape 检查通过，参数量可计算 |
| 08 Train Loop and Checkpoints | 训练 Mini GPT，记录 loss，保存与恢复 checkpoint | 中断后可从 checkpoint 继续，验证 loss 下降 |
| 09 Sampling and Qualitative Evaluation | 实现 greedy、temperature、top-k/top-p 采样 | 比较不同采样结果，识别重复和乱码问题 |
| 10 Experiment Tracking and Reproducibility | 固化配置、随机种子、指标、环境和实验日志 | 他人可用同一命令复现一次训练与结果趋势 |

### 01.03 Fine-tuning and Alignment：让模型适应任务（8 小时）

| 章节 | 本章动手任务与交付物 | 验收标准 |
|---|---|---|
| 01 Fine-tuning Strategy and Baselines | 为一个领域任务确定提示、RAG、微调三种基线 | 能说明为什么选择微调而不是盲目训练 |
| 02 Instruction Dataset Design | 设计指令数据 schema，制作并审核小型训练集 | 每条样本有任务、输入、目标输出和质量规则 |
| 03 Hugging Face Training Stack | 加载开源模型、tokenizer、dataset 与 trainer | 能在小样本上跑通训练与推理 |
| 04 Supervised Fine-Tuning | 完成一次全参数小模型或受控 SFT 实验 | 与基线对比，确认不是只记住训练样本 |
| 05 LoRA | 配置 target modules、rank、alpha、dropout 训练 adapter | 保存/加载 adapter，报告可训练参数比例 |
| 06 QLoRA | 以量化基座模型完成显存受限微调 | 记录显存、速度和质量与 LoRA 的取舍 |
| 07 Preference Optimization and Alignment | 构造偏好对，理解并运行小规模 DPO 实验 | 能解释 SFT 与偏好优化解决的问题不同 |
| 08 Domain Adaptation Capstone | 完成一个领域助手的微调、评测和失败分析 | 提交数据卡、训练配置、基线对比与演示 |

### 01.04 Inference and Deployment：把模型变成服务（7 小时）

| 章节 | 本章动手任务与交付物 | 验收标准 |
|---|---|---|
| 01 Inference Fundamentals | 测量首 token 延迟、生成速度与显存 | 能解释 prefill、decode 和 KV cache |
| 02 Generation Controls | 为同一任务比较 temperature、top-p、stop 与 max tokens | 为不同业务选择有依据的生成配置 |
| 03 Quantization | 比较 FP16、INT8、4-bit 模型的显存、速度和质量 | 选择一套可运行且质量达标的量化配置 |
| 04 Local Inference with vLLM | 用 vLLM 或等价工具启动本地 OpenAI 兼容接口 | 能通过 curl 或 SDK 完成多轮调用 |
| 05 Build an Inference API | 用 FastAPI 增加输入 schema、错误处理和流式输出 | API 有健康检查、文档和最小集成测试 |
| 06 Performance Testing and Capacity Planning | 压测并发，记录吞吐、延迟和失败率 | 给出模型、并发与硬件的容量估算 |
| 07 Deployment and Operations | 容器化服务，设计日志、指标、版本和回滚方案 | 可部署一个可观测、可回滚的演示服务 |

### 01.05 Multimodal Models：理解并应用视觉语言模型（5 小时）

| 章节 | 本章动手任务与交付物 | 验收标准 |
|---|---|---|
| 01 Multimodal Foundations | 比较文本、图像 token 与跨模态任务 | 能描述输入编码、融合和生成的完整链路 |
| 02 Vision Encoders and Vision-Language Models | 加载 CLIP/VLM 并完成图文检索或问答 | 可复现实例并解释模型输出限制 |
| 03 Image-Text Data Preparation | 制作小型图文对数据集并检查许可、质量和泄漏 | 输出数据 schema、样本集和审计记录 |
| 04 Fine-tune a Vision-Language Model | 对小型 VLM 做 PEFT 微调 | 在留出集展示优于基线的具体样例 |
| 05 Multimodal Capstone | 完成文档/商品/图片问答原型 | 提交 demo、评测、失败案例与风险说明 |

### 01.06 Evaluation and Benchmarks：用证据改进模型（7 小时）

| 章节 | 本章动手任务与交付物 | 验收标准 |
|---|---|---|
| 01 Evaluation Design | 定义任务、指标、阈值与失败分类 | 评测目标可衡量，且与业务目标对应 |
| 02 Build a Golden Dataset | 收集、标注、切分黄金集并建立版本 | 样本覆盖常见、边界和高风险情况 |
| 03 Automated Metrics | 计算准确率、F1、ROUGE 或任务定制指标 | 能解释指标盲点，不只报告单一分数 |
| 04 LLM as a Judge | 构建带人工抽检的裁判提示与一致性检查 | 报告与人工判断的一致率和偏差 |
| 05 Error Analysis | 聚类失败样本，定位数据、提示、模型或工具原因 | 形成按优先级排序的改进 backlog |
| 06 Safety and Robustness Evaluation | 测试越权、提示注入、偏见和拒答边界 | 输出可复现攻击样例及缓解方案 |
| 07 Evaluation Report | 汇总基线、变更、指标、成本与上线建议 | 报告能支持明确的上线/不上线决策 |

### 01.07 Safety and Governance：安全地交付模型能力（5 小时）

| 章节 | 本章动手任务与交付物 | 验收标准 |
|---|---|---|
| 01 Data Governance and Privacy | 制定数据来源、PII、保留期与访问控制规则 | 能识别数据泄露和授权风险 |
| 02 Model Cards and Documentation | 为训练/微调模型编写模型卡 | 明确用途、限制、数据、评测与已知风险 |
| 03 Prompt Injection and Tool Safety | 对带工具的模型复现注入攻击并加权限边界 | 高风险动作需确认，敏感数据不可越权读取 |
| 04 Guardrails and Human Review | 设计输入、输出、工具和人工四层控制 | 有明确拦截规则、升级路径和审计记录 |
| 05 Risk Review and Release | 对结业项目执行发布评审与回滚演练 | 形成上线决定、监控指标和回滚步骤 |

# 引用

- [什么是 AI 模型](/ai/01-models/01/01/)
- [PyTorch Tutorials](https://pytorch.org/tutorials/)
- [Hugging Face Course](https://huggingface.co/learn)
