---
title: "SFT、DPO、PPO、Reward Modeling 的统一视角"
number: "03.03.25"
chapter: 3
chapterTitle: "Frameworks"
section: 3
sectionTitle: "Training and Fine-tuning Frameworks"
group: "04 TRL"
created: 2026-09-04 02:07
author: "iopanda"
tags: ["framework", "training", "fine-tuning", "trl", "sft", "dpo", "ppo", "reward-modeling"]
sourceId: "3.10.3.3 Training and Fine-tuning Frameworks/04 TRL/02 SFT、DPO、PPO、Reward Modeling 的统一视角"
---
# SFT、DPO、PPO、Reward Modeling 的统一视角

> TRL 最重要的贡献之一，是把原本很容易被拆成四个孤岛的方法——SFT、Reward Modeling、DPO、PPO/GRPO——重新放回一条连续演化链里。[19][20][21][22][23][24] 在它的视角里，这些不是“你今天学一个、明天学一个”的算法专题，而是同一个 post-training system 在不同阶段使用的不同手段。

**学习目标**：学完本章，你将能够——
1. 解释 SFT、Reward Modeling、DPO、PPO/GRPO 在同一体系里的位置；
2. 理解为什么 DPO 被看作 RLHF 的简化替代；
3. 理解 online 和 offline preference optimization 的区别；
4. 判断项目在什么阶段适合停留在 DPO，什么时候要进入 online RL；
5. 画出一张 alignment pipeline 图。

## 1. SFT：先让模型有基本行为

SFTTrainer 文档很清楚：SFT 是最常见、最基础的 post-training 起点。[20]
它解决的是：
- 模型会不会按指令答；
- 会不会按模板输出；
- 会不会进入目标任务分布。

所以 SFT 是行为底座，不是最终对齐终点。

## 2. Reward Modeling：把“更好/更差”显式建模

RewardTrainer 文档说明：reward model 学的是给 chosen response 更高分。[24]
它的重要性在于：
- 把偏好从文本标签变成可打分函数；
- 让后续 PPO 类方法有正式奖励信号；
- 把“质量判断”从人工口头标准变成训练对象。

## 3. DPO：不用显式 reward model 的偏好优化

DPOTrainer 文档明确指出：DPO 直接对 chosen / rejected 的 log-likelihood margin 做优化，相对参考模型拉开优劣差距，而不需要显式 reward model。[21]

这也是为什么 DPO 这么流行：
- 比 PPO/RLHF 简单；
- 比纯 SFT 更能表达偏好；
- 对大多数 offline preference 场景足够实用。

## 4. PPO / GRPO：进入 online policy optimization

PPOTrainer 和 GRPOTrainer 把系统带进另一个阶段：[22][23]
- 模型要自己生成；
- 再依据 reward 或 group-relative reward 更新；
- 训练环中显式出现 rollout、KL、entropy、clip ratio 等稳定性问题。

这意味着 online RL 的主问题，不再只是标签学习，而是策略学习。

## 5. 一条连续链，而不是四个算法孤岛

一个典型演化链往往是：
1. SFT：先训出可用回答；
2. Reward Modeling：建立好坏判断；
3. DPO：用离线偏好数据做稳定优化；
4. PPO/GRPO：当需要在线探索与策略更新时再进入 RL。

这就是 TRL 最值钱的地方之一：它把这四步放进一个共同话语体系。

## 6. 动手活动

> [!example] 输出 `trl-alignment-pipeline.md`
>
> 为你的模型写一条 post-training pipeline：现在哪一步已完成，下一步是 DPO 还是 Reward + PPO/GRPO，为什么。

## 7. 总结

| 方法 | 在 TRL 里的位置 |
|---|---|
| SFT | 行为底座 |
| Reward Modeling | 显式偏好打分器 |
| DPO | 离线偏好优化主力 |
| PPO / GRPO | 在线策略优化 |
| TRL 的价值 | 把它们组织成一条连续 post-training 链 |

## 引用

- [19] https://github.com/huggingface/trl/blob/main/docs/source/quickstart.md — TRL quickstart
- [20] https://github.com/huggingface/trl/blob/main/docs/source/sft_trainer.md — TRL SFTTrainer doc
- [21] https://github.com/huggingface/trl/blob/main/docs/source/dpo_trainer.md — TRL DPOTrainer doc
- [22] https://github.com/huggingface/trl/blob/main/docs/source/ppo_trainer.md — TRL PPOTrainer doc
- [23] https://github.com/huggingface/trl/blob/main/docs/source/grpo_trainer.md — TRL GRPOTrainer doc
- [24] https://github.com/huggingface/trl/blob/main/docs/source/reward_trainer.md — TRL RewardTrainer doc

上一篇：[01 Alignment framework 的设计哲学](/ai/03-frameworks/03/24/)

下一篇：[03 与 PEFT / Transformers / Accelerate 的组合方式](/ai/03-frameworks/03/26/)
