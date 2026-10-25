---
title: "model repository、backend、batching 与 ensemble"
number: "03.04.32"
chapter: 3
chapterTitle: "Frameworks"
section: 4
sectionTitle: "Inference and Serving Frameworks"
group: "3.10.3.4.5 Triton Inference Server"
created: 2026-09-04 05:47
author: "iopanda"
tags: ["framework", "inference", "serving", "triton", "repository", "batching", "ensemble"]
sourceId: "3.10.3.4 Inference and Serving Frameworks/3.10.3.4.5 Triton Inference Server/02 model repository、backend、batching 与 ensemble"
---
# model repository、backend、batching 与 ensemble

> Triton 最工程化、也最像平台语言的部分，是它把 model repository、backend、batching、ensemble 全部收编成一套显式配置世界。[7][8][9][10] 这意味着在 Triton 里，推理不只是“有个模型文件”，而是：模型如何被组织、由谁执行、如何批处理、如何串成管线，都是平台正式对象。

**学习目标**：学完本章，你将能够——
1. 理解为什么 model repository 是 Triton 的核心资产；
2. 说出 backend、dynamic batching、sequence batching、ensemble 各自解决什么；
3. 理解 Triton 怎样把单模型推理升级成 pipeline execution；
4. 判断什么时候该用 ensemble/BLS，而不是把流程全堆到应用层；
5. 为系统写一张 repository-to-pipeline card。

## 1. model repository 为什么是平台主语

model_repository 文档说明得非常清楚：[8]
- Triton 从一个或多个 model repository 提供服务；
- 每个模型有标准目录布局；
- 每个版本有明确 version 子目录；
- 仓库可来自本地或云存储。

这说明平台不是围绕“进程里加载了哪个模型”，而是围绕“仓库里治理着哪些模型工件”。

## 2. backend 在做什么

Triton 把 TensorRT、PyTorch、ONNX、OpenVINO、Python 等执行引擎统一叫做 backends。[7][8]

这意味着 Triton 的世界观不是：
- 只有一种运行时；
而是：
- 平台层统一，执行层可插拔。

## 3. batching 为什么是平台能力，不是模型私活

batcher 文档强调：[9]
- dynamic batching 适合 stateless models；
- sequence batching 适合 stateful models；
- iterative sequences 能做 inflight/continuous batching。

这说明 batching 在 Triton 里不是某个模型自行处理，而是平台级调度能力。

## 4. ensemble 为什么重要

ensemble_models 文档展示得很清楚：
- preprocessing
- inference
- postprocessing
可以被编成一个 ensemble model；
- 上游下游张量映射明确；
- 从外部看又像一个单模型。[10]

这意味着 Triton 不是只管模型，也在管 model pipeline。

## 5. 动手活动

> [!example] 输出 `triton-repository-pipeline-card.md`
>
> 列你的系统有哪些模型、版本、后端、batching 策略、是否需要 ensemble。写一句结论：你的主复杂度是单模型执行，还是模型资产和推理管线治理。

## 6. 总结

| 关键问题 | 一句话 |
|---|---|
| model repository 在做什么 | 让模型成为可版本化、可治理的平台工件 |
| backend 在做什么 | 把执行引擎变成平台可插拔层 |
| batching 在做什么 | 把吞吐优化提升成平台调度能力 |
| ensemble 在做什么 | 把多模型流程升级成正式推理管线 |

## 引用

- [7] https://github.com/triton-inference-server/server/blob/main/README.md — Triton README
- [8] https://github.com/triton-inference-server/server/blob/main/docs/user_guide/model_repository.md — Triton model repository doc
- [9] https://github.com/triton-inference-server/server/blob/main/docs/user_guide/batcher.md — Triton batcher doc
- [10] https://github.com/triton-inference-server/server/blob/main/docs/user_guide/ensemble_models.md — Triton ensemble models doc

上一篇：[01 通用 inference platform 的设计哲学](/iopanda-blog/ai/03-frameworks/04/31/)

下一篇：[03 与 TensorRT-LLM、vLLM、KServe 的集成方式](/iopanda-blog/ai/03-frameworks/04/33/)
