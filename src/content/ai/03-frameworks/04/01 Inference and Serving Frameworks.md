---
title: "Inference and Serving Frameworks"
number: "03.04.01"
chapter: 3
chapterTitle: "Frameworks"
section: 4
sectionTitle: "Inference and Serving Frameworks"
group: ""
created: 2026-09-04 03:25
author: "iopanda"
tags: ["ai", "frameworks", "inference", "serving", "learning-path"]
sourceId: "3.10.3.4 Inference and Serving Frameworks/README"
---
# Inference and Serving Frameworks

> `03.03 Training and Fine-tuning Frameworks` 已经把训练系统讲清楚了；接下来的 `03.04 Inference and Serving Frameworks` 要回答的是另一类同样工程化的问题：**当模型已经训好以后，你拿什么框架把它稳定、高吞吐、低延迟、可扩展、可观测地跑起来？** 这一章不把 inference 看成 `model.generate()`，而是把它视为 batching、KV cache、scheduler、parallelism、quantization、serving API、multi-tenant 和 deployment topology 的组合工程。[6][7][8][9][10]

**学习目标**：完成本模块后，你将能够——
1. 区分五条主流 inference / serving 路线：高吞吐在线服务、structured generation serving、NVIDIA 优化推理、边缘/本地推理、通用推理编排；
2. 解释为什么同样是“跑模型”，vLLM、SGLang、TensorRT-LLM、llama.cpp、Triton 的设计中心完全不同；
3. 用吞吐、延迟、硬件、部署环境、多租户和输出形态来做 serving framework 选型；
4. 判断什么时候你需要的是 LLM-native serving engine，什么时候更需要通用 inference platform；
5. 为一个课程助教或企业推理服务写 inference framework 选型卡。

## 1. 为什么单开这一章

- 很多团队把 serving 误解成“把训练后的模型挂个 API”；
- 但一旦进入真实交付，就会出现：
  - continuous batching 和 scheduler 由谁负责；
  - KV cache、prefix cache、speculative decoding、quantization 怎么组合；
  - OpenAI-compatible API 是否够用；
  - 多模型、多租户、多 LoRA、结构化输出、工具调用怎么承载；
  - GPU 集群、边缘设备、CPU 本地部署是否需要不同路线；
  - 哪些是 inference engine 问题，哪些是 serving platform 问题。
- 所以 inference framework 的真正价值，不在“能出 token”，而在：**把服务复杂度收进稳定运行时。**

## 2. 2026-09 我建议这一模块先聚焦的 top 5

> [!note] 现实边界
> 这里的 top 5 不是“推理生态唯一正确榜单”，而是按 2026-09 的工程代表性和教学价值筛出来的五条路线：高吞吐 LLM serving、structured serving / program execution、NVIDIA 优化推理、本地/边缘推理、通用 inference platform。[6][7][8][9][10]

| 框架 | 一句话定位 | 设计中心 | 更像什么 | 更适合谁 |
|---|---|---|---|---|
| [vLLM](/iopanda-blog/ai/03-frameworks/04/02/) | 高吞吐、内存高效的 LLM serving engine | continuous batching / paged attention / online serving | LLM-native inference engine | 想把大模型 API 服务跑得快、稳、便宜的团队 |
| [SGLang](/iopanda-blog/ai/03-frameworks/04/09/) | 面向 structured generation 与 agent/workflow 的 serving framework | serving + structured program execution | 程序化推理运行时 | 需要高性能生成同时重视结构化输出、agent 调度的团队 |
| [TensorRT-LLM](/iopanda-blog/ai/03-frameworks/04/16/) | 面向 NVIDIA GPU 的深度优化推理栈 | kernel / graph / quantization / throughput | 硬件优化推理后端 | NVIDIA 集群、高性能生产推理团队 |
| [llama.cpp](/iopanda-blog/ai/03-frameworks/04/23/) | C/C++ 本地与边缘 LLM 推理引擎 | portability / local inference / GGUF | 本地推理运行时 | Mac、CPU、边缘设备、本地 AI 产品 |
| [Triton Inference Server](/iopanda-blog/ai/03-frameworks/04/30/) | 通用多模型 inference platform | model serving orchestration | 通用推理平台 | 需要统一管理多模型、多后端、多协议的团队 |

## 3. 为什么先不把 TGI / LMDeploy 放进这一组主角

- `TGI` 历史影响很大，但当前 GitHub 状态已 archived，更适合在历史脉络或迁移话题里提；[11]
- `LMDeploy` 很值得讲，尤其在压缩、部署和 serving 一体化上有价值，但这章第一批主角只留 5 个时，`TensorRT-LLM` 和 `Triton` 在基础设施代表性上更强，`vLLM`/`SGLang`/`llama.cpp` 的路线辨识度也更清晰；[12]
- 这一章先讲“你用什么语言组织 inference complexity”，不先追求覆盖所有引擎。

## 4. 这一模块建议怎么读

1. 先看 [03.04 vLLM](/iopanda-blog/ai/03-frameworks/04/02/)：先把 LLM-native serving engine 的核心心智钉牢；
2. 再看 [03.04 SGLang](/iopanda-blog/ai/03-frameworks/04/09/)：理解“推理引擎 + 结构化生成运行时”为什么会独立成路线；
3. 再看 [03.04 TensorRT-LLM](/iopanda-blog/ai/03-frameworks/04/16/)：理解硬件优化 serving 栈；
4. 再看 [03.04 llama.cpp](/iopanda-blog/ai/03-frameworks/04/23/)：理解本地/边缘推理路线；
5. 最后看 [03.04 Triton Inference Server](/iopanda-blog/ai/03-frameworks/04/30/)：理解通用 platform 路线。

## 4.1 按读者身份的推荐阅读路径

| 你是谁 | 建议先读什么 | 为什么 |
|---|---|---|
| 在线 LLM API 的开发者 | [vLLM](/iopanda-blog/ai/03-frameworks/04/02/) → [Inference Framework 选型矩阵](/iopanda-blog/ai/03-frameworks/04/37/) | 先把高吞吐 serving 的主语钉牢，再做判断 |
| 做 agent / workflow / tool use 系统的人 | [SGLang](/iopanda-blog/ai/03-frameworks/04/09/) → [Inference Framework 选型矩阵](/iopanda-blog/ai/03-frameworks/04/37/) | 先理解受控生成 runtime，再决定是否需要更重平台 |
| 有明确 NVIDIA GPU 集群的人 | [TensorRT-LLM](/iopanda-blog/ai/03-frameworks/04/16/) | 先看执行路径优化是否就是你的主问题 |
| 做离线、本地、桌面、边缘产品的人 | [llama.cpp](/iopanda-blog/ai/03-frameworks/04/23/) | 先把设备侧运行时路线看清楚 |
| 做企业多模型平台的人 | [Triton Inference Server](/iopanda-blog/ai/03-frameworks/04/30/) | 先看平台治理逻辑，而不是先盯单模型 benchmark |

## 4.2 按系统主矛盾的速查表

| 你的系统最先会死在哪 | 优先想到 |
|---|---|
| 高频并发、KV cache 成本、TTFT / tail latency | [vLLM](/iopanda-blog/ai/03-frameworks/04/02/) |
| 结构化输出、tool parsing、workflow control、agent serving | [SGLang](/iopanda-blog/ai/03-frameworks/04/09/) |
| NVIDIA 硬件上的极限量化、并行、执行路径优化 | [TensorRT-LLM](/iopanda-blog/ai/03-frameworks/04/16/) |
| 模型必须跑在 Mac / CPU / 边缘盒子 / 用户机器上 | [llama.cpp](/iopanda-blog/ai/03-frameworks/04/23/) |
| 多模型、多后端、多协议、多环境统一治理 | [Triton Inference Server](/iopanda-blog/ai/03-frameworks/04/30/) |

## 4.3 这章最容易读偏的三个误区

- **误区一：把 inference framework 当成“谁更快”。** 真正差异在复杂度由哪一层承接；
- **误区二：把 serving engine、execution backend、platform 壳混成一回事。** 它们经常是上下层关系；
- **误区三：只看 OpenAI-compatible API。** 外部接口相似，不等于内部运行时主语相同。

## 4.4 如果你时间不够，只读哪三篇

如果你现在不是在系统建课，而是在真实项目里要尽快做判断，我建议优先读这三篇：

1. [03.04 vLLM](/iopanda-blog/ai/03-frameworks/04/02/)
   - 因为它先把在线 LLM serving 的核心心智钉牢；
2. [03.04 Triton Inference Server](/iopanda-blog/ai/03-frameworks/04/30/)
   - 因为它告诉你“单模型引擎”和“平台壳”不是一回事；
3. [03.04 Inference Framework 选型矩阵](/iopanda-blog/ai/03-frameworks/04/37/)
   - 因为最后真正落地时，你要做的是架构判断，而不是框架背诵。

如果读完这三篇你仍然觉得：
- 结构控制和 agent serving 最痛，再回去看 [03.04 SGLang](/iopanda-blog/ai/03-frameworks/04/09/)；
- NVIDIA 集群性能最痛，再回去看 [03.04 TensorRT-LLM](/iopanda-blog/ai/03-frameworks/04/16/)；
- 本地/边缘分发最痛，再回去看 [03.04 llama.cpp](/iopanda-blog/ai/03-frameworks/04/23/)。

## 5. 本模块的推荐交付物

| 交付物 | 说明 | 验收标准 |
|---|---|---|
| serving-stack-card.md | 某个项目的 serving 栈结构卡 | 能回答“为什么这套栈能支撑模型、接口、监控和部署” |
| serving-sla-card.md | 吞吐 / 延迟 / 资源预算卡 | 能区分 TTFT、TPOT、P95/P99、GPU 利用率 |
| inference-framework-selection-card.md | serving 框架选型卡 | 能解释“为什么选 A，不选 B” |

## 5.1 我更推荐的最小闭环产物

如果你不想一上来写很多文档，最小也要交出下面三样东西：

| 最小交付物 | 为什么不能省 |
|---|---|
| `model-artifact-and-runtime-card.md` | 没有它，模型工件、量化格式、运行时要求会一直混在一起 |
| `serving-stack-card.md` | 没有它，团队很快说不清引擎、平台、协议、监控谁负责什么 |
| `inference-framework-selection-card.md` | 没有它，框架选择就只能退化成“谁 benchmark 更好看” |

这三个东西加起来，才构成一个最小可审计 serving 方案：
- 模型以什么形态交付；
- 服务链怎么组织；
- 为什么是这套框架，而不是别的。

## 5.2 这章学完之后，你应该真的会什么

学完这一章，理想状态不是“我知道 5 个 serving 框架名字”，而是你真的能完成下面三件事：

1. 看到一个项目，就能先判断它最痛的是吞吐、控制、执行后端、本地交付，还是平台治理；
2. 能写出一页纸说明：为什么这里选 vLLM / SGLang / TensorRT-LLM / llama.cpp / Triton；
3. 能在设计评审里把“推理系统”讲成一个可交付架构，而不是一句“起个模型服务”。

## 6. 本模块笔记导航

1. [03.04 vLLM](/iopanda-blog/ai/03-frameworks/04/02/)
2. [03.04 SGLang](/iopanda-blog/ai/03-frameworks/04/09/)
3. [03.04 TensorRT-LLM](/iopanda-blog/ai/03-frameworks/04/16/)
4. [03.04 llama.cpp](/iopanda-blog/ai/03-frameworks/04/23/)
5. [03.04 Triton Inference Server](/iopanda-blog/ai/03-frameworks/04/30/)
6. [03.04 Inference Framework 选型矩阵](/iopanda-blog/ai/03-frameworks/04/37/)

## 7. 总结

| 关键问题 | 一句话 |
|---|---|
| 这一模块讲什么 | 不是“怎么调用模型”，而是“如何组织 inference system” |
| top 5 是谁 | vLLM / SGLang / TensorRT-LLM / llama.cpp / Triton |
| 五条路线分别代表什么 | 高吞吐 serving / 结构化生成 / NVIDIA 优化 / 本地推理 / 通用平台 |
| 学习重点 | 学会判断 serving complexity 的主矛盾，而不是只看 benchmark |

## 引用

- [6] https://github.com/vllm-project/vllm — vLLM GitHub
- [7] https://github.com/sgl-project/sglang — SGLang GitHub
- [8] https://github.com/NVIDIA/TensorRT-LLM — TensorRT-LLM GitHub
- [9] https://github.com/ggml-org/llama.cpp — llama.cpp GitHub
- [10] https://github.com/triton-inference-server/server — Triton Inference Server GitHub
- [11] https://github.com/huggingface/text-generation-inference — TGI GitHub (archived)
- [12] https://github.com/InternLM/lmdeploy — LMDeploy GitHub

上一篇：[03.03 Training and Fine-tuning Frameworks](/iopanda-blog/ai/03-frameworks/03/01/)——训练系统已经讲完；下一模块开始处理“训好的模型如何被高质量交付”为在线或本地服务。

下一篇：[03.04 vLLM](/iopanda-blog/ai/03-frameworks/04/02/)——先从最典型的 LLM-native serving engine 路线开始。
