# LLM Infra面经

[返回首页](../../README.md) · [按公司](by-company.md) · [研究专题](by-topic.md) · [细分方向](by-specialty.md) · [LLM Infra专页](llm-infra.md)

更新于2026-11-05，共16篇面经、9份参考资料。同一篇跨方向收录时只计一次。

Infra岗位的差别很大：有的做训练框架，有的写算子，有的负责推理服务或GPU平台。先看目标团队做哪一层，再挑面经。

| 方向 | 主要内容 | 面经 | 参考资料 |
|---|---|---:|---:|
| [分布式训练与显存管理](by-specialty.md#infra-training) | 并行切分、ZeRO/FSDP、训练状态、重计算和训练故障排查。 | 4 | 4 |
| [RL Infra与Rollout系统](by-specialty.md#infra-rl) | 采样环境、Rollout、AgentLoop、训练与采样协同，以及多轮RL评测。 | 1 | 3 |
| [CUDA、Triton与算子优化](by-specialty.md#infra-kernel) | GEMM、Attention、归约、访存、确定性、手写kernel和数值校验。 | 8 | 6 |
| [图执行与AI编译](by-specialty.md#infra-compiler) | CUDA Graph、动态shape和编译执行。目前面经主要涉及图执行，编译器专岗还待补充。 | 1 | 2 |
| [NCCL、互联与多卡通信](by-specialty.md#infra-communication) | 集合通信、网络拓扑、同步、跨节点KV传输和通信瓶颈。 | 4 | 4 |
| [LLM推理引擎与Serving](by-specialty.md#infra-serving) | vLLM/SGLang、KV管理、批处理、PD分离、投机解码、吞吐和延迟。 | 9 | 7 |
| [GPU调度与云原生平台](by-specialty.md#infra-platform) | GPU池化、隔离、弹性伸缩和Kubernetes训练推理任务。现有资料以教程为主。 | 1 | 5 |
| [性能分析与Benchmark](by-specialty.md#infra-profiling) | Roofline、时间线、Nsight、显存分析，以及固定负载下的优化对比。 | 4 | 6 |
| [异构硬件、国产卡与端侧](by-specialty.md#infra-hardware) | CUDA/HIP生态迁移、模型与算子适配、量化、设备内存和能耗。 | 6 | 4 |

## 可以从这几篇开始

| 岗位 | 阅读顺序 | 复习重点 |
|---|---|---|
| 推理引擎/Serving | [字节Data](README.md#int504) → [阿里二面](README.md#int502) → [推理专题](../topics/08-inference-and-serving.md) | 负载、KV管理、调度、质量、吞吐和延迟 |
| CUDA/Triton/算子 | [CUDA GEMM与MLA](README.md#int503) → [硬件生态迁移](README.md#int501) → [多公司复盘](README.md#int219) | 形状与dtype、正确性基线、访存/计算/同步、回归与回退 |
| 分布式训练/RL Infra | [训练向NLP实习](README.md#int042) → [Agentic RL](README.md#int218) → [分布式专题](../topics/09-distributed-training.md) | 状态与显存、并行边界、通信、采样环境、恢复与评测 |
| GPU平台/云原生 | [讯飞推理工程](README.md#int306) → [云原生路线](resources.md#res605) → [Infra指南](resources.md#res604) | GPU池化、配额与隔离、弹性、观测、故障与成本 |

## 几份资料的备注

- [混元Infra解析](resources.md#res610)来自汇编，牛客原帖暂时读不到。
- [AIInfraGuide](resources.md#res601)内容比较多，也包括数据库和操作系统题，阅读时按岗位挑选。
- [快手题单解析](resources.md#res609)把模型量化答成了金融交易策略，这一段有明显问题。
- AI编译器、通信网络、生产RL系统和大集群容错的面经还比较少，欢迎补充。

## 本地筛选

```sh
python3 tools/search.py --interviews --specialty infra-kernel
python3 tools/search.py --interviews --specialty infra-serving --company 阿里
python3 tools/search.py --interviews --specialty infra-profiling
```
