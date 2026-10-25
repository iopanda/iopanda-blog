---
title: "离线课程助教的 llama.cpp 架构案例"
number: "03.04.28"
chapter: 3
chapterTitle: "Frameworks"
section: 4
sectionTitle: "Inference and Serving Frameworks"
group: "3.10.3.4.4 llama.cpp"
created: 2026-09-04 05:23
author: "iopanda"
tags: ["framework", "inference", "serving", "llama-cpp", "case-study"]
sourceId: "3.10.3.4 Inference and Serving Frameworks/3.10.3.4.4 llama.cpp/05 离线课程助教的 llama.cpp 架构案例"
---
# 离线课程助教的 llama.cpp 架构案例

> 把 llama.cpp 放回课程助教主线时，它最自然的角色不是校园级公网大服务，而是：**一个真正可以离线部署在教师电脑、学生笔记本、实验室 Mac mini、边缘工作站上的课程助教。** 这时候最关键的问题不再是峰值吞吐，而是：模型能否被打包、量化、分发，并在现实机器上稳定运行。

**学习目标**：学完本章，你将能够——
1. 判断课程助教何时适合 llama.cpp；
2. 设计离线课程助教的 GGUF、量化和本地服务面；
3. 区分“离线单机助教”和“在线校园平台助教”的架构差异；
4. 识别这个案例里的关键风险：模型过大、量化过激、安全边界不足；
5. 写一张离线课程助教的 llama.cpp 适配卡。

## 1. 什么时候课程助教适合 llama.cpp

- 教师或学生本机离线使用；
- 校园网络受限，不能稳定依赖云端；
- 对隐私、本地数据控制有较高要求；
- 需要在 Mac / CPU / 边缘盒子上跑；
- 模型可接受 GGUF 与量化后的效果。

## 2. 推荐架构

- 模型工件：GGUF + 合适量化版本；
- 运行时：llama.cpp CLI 或 `llama serve`；
- 上层应用：桌面 UI / 本地 Web UI / 本机 agent；
- 可选能力：JSON schema 约束、embeddings、本地工具调用。

## 3. 为什么这里不优先选 vLLM

因为这里的主问题不是：
- 高并发在线调度；
而是：
- 模型能不能在用户机器上；
- 能不能离线；
- 能不能稳定安装、运行和分发。

## 4. 动手活动

> [!example] 输出 `offline-course-ta-llamacpp-card.md`
>
> 列你的目标设备、RAM/VRAM、模型大小、量化类型、是否离线、是否本地 API。写一句结论：你的课程助教主复杂度是在线 serving，还是本地交付。

## 5. 总结

| 关键问题 | 一句话 |
|---|---|
| 课程助教为什么适合 llama.cpp | 因为它要被真正带到用户机器上 |
| 最大价值 | 让离线、本地、轻量部署成为现实 |
| 不适合什么 | 高并发公网课程问答平台 |

## 引用

- [9] https://github.com/ggml-org/llama.cpp/blob/master/README.md — llama.cpp README
- [10] https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md — llama.cpp server README
- [11] https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md — llama.cpp quantize README

上一篇：[04 性能、模型规模与适用边界](/ai/03-frameworks/04/27/)

下一篇：[06 llama.cpp 与 vLLM、SGLang、TensorRT-LLM、Triton 的深度对比](/ai/03-frameworks/04/29/)
