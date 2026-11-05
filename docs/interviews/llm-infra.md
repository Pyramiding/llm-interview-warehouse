# LLM Infra面经与准备入口

[返回首页](../../README.md) · [按公司](by-company.md) · [研究专题](by-topic.md) · [细分方向](by-specialty.md) · [LLM Infra专页](llm-infra.md)

查阅截止：**2026-11-05**。本页9个细分方向关联 **16篇去重公开自述、9个去重补充入口**；含历史回补与年份未知项。不是9个方向计数相加，也不表示所有材料均属纯LLM岗位。

先按岗位职责区分训练系统、推理引擎、算子/编译器、平台工程和RL Infra。通用后端、数据库、使用AI写代码的经历，不能仅凭Infra标题就等同于模型基础设施。

| 细分方向 | 查什么 | 面经 | 补充 |
|---|---|---:|---:|
| [分布式训练与显存管理](by-specialty.md#infra-training) | 并行切分、ZeRO/FSDP、训练状态、重计算与训练系统排障。 | 4 | 4 |
| [RL Infra与Rollout系统](by-specialty.md#infra-rl) | 采样环境、训练执行链路、AgentLoop与多轮RL评测；仅讨论算法差异的面经不自动标为RL Infra。 | 1 | 3 |
| [CUDA、Triton与算子优化](by-specialty.md#infra-kernel) | GEMM、Attention、归约、访存、确定性、手写kernel与数值验证。 | 8 | 6 |
| [图执行与AI编译](by-specialty.md#infra-compiler) | CUDA Graph、动态shape、计算路径与编译栈。现有原帖主要支持图执行问题，专门编译器岗位的亲历仍不足。 | 1 | 2 |
| [NCCL、互联与多卡通信](by-specialty.md#infra-communication) | 集合通信、拓扑、同步、跨节点KV传输与通信瓶颈；不把普通消息队列题归为GPU通信。 | 4 | 4 |
| [LLM推理引擎与Serving](by-specialty.md#infra-serving) | vLLM/SGLang、KV管理、批处理、PD分离、投机解码、吞吐与延迟。 | 9 | 7 |
| [GPU调度与云原生平台](by-specialty.md#infra-platform) | GPU池化、隔离、弹性伸缩、Kubernetes训练推理工作负载与平台观测；亲历样本少于教程覆盖。 | 1 | 5 |
| [性能分析与Benchmark](by-specialty.md#infra-profiling) | Roofline、时间线、Nsight、负载条件、显存账本与端到端优化证据。 | 4 | 6 |
| [异构硬件、国产卡与端侧](by-specialty.md#infra-hardware) | CUDA/HIP等生态迁移、模型与算子适配、量化、设备内存和能耗。 | 6 | 4 |

## 按岗位挑阅读顺序

| 目标岗位 | 建议顺序 | 准备时必须能说明 |
|---|---|---|
| 推理引擎/Serving | [字节Data](README.md#int504) → [阿里二面](README.md#int502) → [原有推理专题](../topics/08-inference-and-serving.md) | 负载、KV与调度、数值/质量、吞吐和延迟、优化证据 |
| CUDA/Triton/算子 | [CUDA GEMM与MLA](README.md#int503) → [硬件生态迁移](README.md#int501) → [多公司复盘](README.md#int219) | 形状与dtype、正确性基线、访存/计算/同步、回归与回退 |
| 分布式训练/RL Infra | [训练向NLP实习](README.md#int042) → [Agentic RL](README.md#int218) → [分布式专题](../topics/09-distributed-training.md) | 状态与显存、并行边界、通信、采样环境、恢复与评测 |
| GPU平台/云原生 | [讯飞推理工程](README.md#int306) → [云原生路线](resources.md#res605) → [Infra指南](resources.md#res604) | GPU池化、配额与隔离、弹性、观测、故障与成本 |

上述顺序是仓库的准备建议，不能反推这些公司共同采用相同流程或题目。

## 原帖与二次材料的区别

- [阿里AI Infra二面](README.md#int502)可核对原帖；[混元Infra解析](resources.md#res610)当前只取得汇编，未作为亲历增加。
- [AIInfraGuide](resources.md#res601)包含公司汇编及传统数据库/OS邻接内容，目录篇数没有计入本库面经数。
- [快手题单解析](resources.md#res609)把量化答成金融策略，已标注语境错配；不采作技术答案。
- 专门AI编译器、纯通信网络、生产RL Infra、超大集群容错的亲历仍偏少；资料入口多不代表岗位样本充分。

## 本地筛选

```sh
python3 tools/search.py --interviews --specialty infra-kernel
python3 tools/search.py --interviews --specialty infra-serving --company 阿里
python3 tools/search.py --interviews --specialty infra-profiling
```
