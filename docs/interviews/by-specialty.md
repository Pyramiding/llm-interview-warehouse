# 按细分方向找面经

[返回首页](../../README.md) · [按公司](by-company.md) · [研究专题](by-topic.md) · [细分方向](by-specialty.md) · [LLM Infra专页](llm-infra.md)

按技术问题和应用场景整理。一篇面经可以出现在多个方向；具体是岗位要求、项目经历还是场景题，见原条目的备注。

| 方向 | 面经 | 参考资料 |
|---|---:|---:|
| [分布式训练与显存管理](#infra-training) | 4 | 4 |
| [RL Infra与Rollout系统](#infra-rl) | 1 | 3 |
| [CUDA、Triton与算子优化](#infra-kernel) | 8 | 6 |
| [图执行与AI编译](#infra-compiler) | 1 | 2 |
| [NCCL、互联与多卡通信](#infra-communication) | 4 | 4 |
| [LLM推理引擎与Serving](#infra-serving) | 9 | 7 |
| [GPU调度与云原生平台](#infra-platform) | 1 | 5 |
| [性能分析与Benchmark](#infra-profiling) | 4 | 6 |
| [异构硬件、国产卡与端侧](#infra-hardware) | 6 | 4 |
| [Agent Runtime与Harness](#eng-runtime) | 6 | 1 |
| [上下文工程与长期记忆](#eng-memory) | 5 | 3 |
| [Coding Agent与代码生成](#eng-code-agent) | 2 | 2 |
| [评测工程与可观测性](#eng-evaluation) | 7 | 3 |
| [合成数据与数据闭环](#eng-data) | 3 | 1 |
| [模型与Agent运行安全](#eng-safety) | 6 | 2 |
| [用户增长与营销](#app-growth-marketing) | 3 | 0 |
| [客服、外呼与业务执行](#app-service) | 4 | 3 |
| [实时语音与会议转写](#app-speech) | 4 | 2 |
| [电商与商家Agent](#app-commerce) | 2 | 0 |
| [智能问数、NL2SQL与BI](#app-bi) | 4 | 2 |
| [办公助手与文档智能](#app-office) | 2 | 2 |
| [内容生成、视频与数字人](#app-creative) | 2 | 0 |
| [医疗模型与医疗Agent](#app-medical) | 2 | 0 |
| [教育与教学Agent](#app-education) | 2 | 0 |
| [法律、合同与文档审查](#app-legal) | 1 | 0 |
| [AI前端、全栈与交互](#app-frontend) | 2 | 0 |
| [个性化助手与用户画像](#app-personalization) | 2 | 0 |
| [风控、审核与反欺诈](#app-risk) | 3 | 0 |
| [具身智能与世界模型](#app-embodied) | 0 | 1 |

## LLM Infra

<a id="infra-training"></a>

### 分布式训练与显存管理

并行切分、ZeRO/FSDP、训练状态、重计算和训练故障排查。

**面经：**

- [INT042 · 本科生24暑期实习NLP（Infra & LLM）算法工程师面经](README.md#int042)（仅搜索摘要）
- [INT219 · 2025春招实习面经汇总（已接阿里offer）](README.md#int219)（已读正文）
- [INT502 · 阿里AI Infra 二面 面经](README.md#int502)（已读正文）
- [INT511 · 暑期第二周面试情况](README.md#int511)（已读正文）

**参考资料：**

- [RES601 · AIInfraGuide：训练、推理、CUDA与公司面经汇编](resources.md#res601)（已读正文）
- [RES602 · AI Infra工程师求职路线图](resources.md#res602)（备考资料）（已读正文）
- [RES604 · AgentGuide：AI Infra面试指南](resources.md#res604)（备考资料）（已读正文）
- [RES605 · AI-Infra Landscape与云原生学习路线](resources.md#res605)（备考资料）（已读正文）
<a id="infra-rl"></a>

### RL Infra与Rollout系统

采样环境、Rollout、AgentLoop、训练与采样协同，以及多轮RL评测。

**面经：**

- [INT218 · 阿里云 AI Infer 一面](README.md#int218)（已读正文）

**参考资料：**

- [RES601 · AIInfraGuide：训练、推理、CUDA与公司面经汇编](resources.md#res601)（已读正文）
- [RES604 · AgentGuide：AI Infra面试指南](resources.md#res604)（备考资料）（已读正文）
- [RES605 · AI-Infra Landscape与云原生学习路线](resources.md#res605)（备考资料）（已读正文）
<a id="infra-kernel"></a>

### CUDA、Triton与算子优化

GEMM、Attention、归约、访存、确定性、手写kernel和数值校验。

**面经：**

- [INT219 · 2025春招实习面经汇总（已接阿里offer）](README.md#int219)（已读正文）
- [INT309 · 10月面试退展](README.md#int309)（已读正文）
- [INT312 · pdd 提前批 AI Infra一面 凉经（一个月前）](README.md#int312)（已读正文）
- [INT501 · 0914 阿里云一面（AI Infra）](README.md#int501)（已读正文）
- [INT502 · 阿里AI Infra 二面 面经](README.md#int502)（已读正文）
- [INT503 · 字节AI infra校招一面面经 1h](README.md#int503)（已读正文）
- [INT505 · AI Infra面经 攒人品版](README.md#int505)（已读正文）
- [INT511 · 暑期第二周面试情况](README.md#int511)（已读正文）

**参考资料：**

- [RES215 · 回忆 LLM 推理优化实习招聘：面试官视角与 CUTLASS 问答（编目标题）](resources.md#res215)（备考资料）（仅搜索摘要）
- [RES601 · AIInfraGuide：训练、推理、CUDA与公司面经汇编](resources.md#res601)（已读正文）
- [RES603 · AI Infra核心题清单与练习入口](resources.md#res603)（备考资料）（已读正文）
- [RES604 · AgentGuide：AI Infra面试指南](resources.md#res604)（备考资料）（已读正文）
- [RES609 · 快手AI Infra题单解析（含明显歧义）](resources.md#res609)（已读正文）
- [RES610 · 腾讯混元Infra二面二次解析：GPU、KV与算子](resources.md#res610)（已读正文）
<a id="infra-compiler"></a>

### 图执行与AI编译

CUDA Graph、动态shape和编译执行。目前面经主要涉及图执行，编译器专岗还待补充。

**面经：**

- [INT502 · 阿里AI Infra 二面 面经](README.md#int502)（已读正文）

**参考资料：**

- [RES601 · AIInfraGuide：训练、推理、CUDA与公司面经汇编](resources.md#res601)（已读正文）
- [RES604 · AgentGuide：AI Infra面试指南](resources.md#res604)（备考资料）（已读正文）
<a id="infra-communication"></a>

### NCCL、互联与多卡通信

集合通信、网络拓扑、同步、跨节点KV传输和通信瓶颈。

**面经：**

- [INT219 · 2025春招实习面经汇总（已接阿里offer）](README.md#int219)（已读正文）
- [INT220 · ai infra实习 阿里云面经](README.md#int220)（已读正文）
- [INT502 · 阿里AI Infra 二面 面经](README.md#int502)（已读正文）
- [INT511 · 暑期第二周面试情况](README.md#int511)（已读正文）

**参考资料：**

- [RES601 · AIInfraGuide：训练、推理、CUDA与公司面经汇编](resources.md#res601)（已读正文）
- [RES602 · AI Infra工程师求职路线图](resources.md#res602)（备考资料）（已读正文）
- [RES603 · AI Infra核心题清单与练习入口](resources.md#res603)（备考资料）（已读正文）
- [RES604 · AgentGuide：AI Infra面试指南](resources.md#res604)（备考资料）（已读正文）
<a id="infra-serving"></a>

### LLM推理引擎与Serving

vLLM/SGLang、KV管理、批处理、PD分离、投机解码、吞吐和延迟。

**面经：**

- [INT219 · 2025春招实习面经汇总（已接阿里offer）](README.md#int219)（已读正文）
- [INT220 · ai infra实习 阿里云面经](README.md#int220)（已读正文）
- [INT306 · 10.26 科大讯飞 推理工程部 AI Infra 一面](README.md#int306)（已读正文）
- [INT309 · 10月面试退展](README.md#int309)（已读正文）
- [INT501 · 0914 阿里云一面（AI Infra）](README.md#int501)（已读正文）
- [INT502 · 阿里AI Infra 二面 面经](README.md#int502)（已读正文）
- [INT503 · 字节AI infra校招一面面经 1h](README.md#int503)（已读正文）
- [INT504 · 字节data AI infra实习一面](README.md#int504)（已读正文）
- [INT505 · AI Infra面经 攒人品版](README.md#int505)（已读正文）

**参考资料：**

- [RES220 · 近三月 AI Infra 面经雷达 · AI Infra Field Notes](resources.md#res220)（已读正文）
- [RES601 · AIInfraGuide：训练、推理、CUDA与公司面经汇编](resources.md#res601)（已读正文）
- [RES602 · AI Infra工程师求职路线图](resources.md#res602)（备考资料）（已读正文）
- [RES603 · AI Infra核心题清单与练习入口](resources.md#res603)（备考资料）（已读正文）
- [RES604 · AgentGuide：AI Infra面试指南](resources.md#res604)（备考资料）（已读正文）
- [RES605 · AI-Infra Landscape与云原生学习路线](resources.md#res605)（备考资料）（已读正文）
- [RES610 · 腾讯混元Infra二面二次解析：GPU、KV与算子](resources.md#res610)（已读正文）
<a id="infra-platform"></a>

### GPU调度与云原生平台

GPU池化、隔离、弹性伸缩和Kubernetes训练推理任务。现有资料以教程为主。

**面经：**

- [INT306 · 10.26 科大讯飞 推理工程部 AI Infra 一面](README.md#int306)（已读正文）

**参考资料：**

- [RES601 · AIInfraGuide：训练、推理、CUDA与公司面经汇编](resources.md#res601)（已读正文）
- [RES602 · AI Infra工程师求职路线图](resources.md#res602)（备考资料）（已读正文）
- [RES603 · AI Infra核心题清单与练习入口](resources.md#res603)（备考资料）（已读正文）
- [RES604 · AgentGuide：AI Infra面试指南](resources.md#res604)（备考资料）（已读正文）
- [RES605 · AI-Infra Landscape与云原生学习路线](resources.md#res605)（备考资料）（已读正文）
<a id="infra-profiling"></a>

### 性能分析与Benchmark

Roofline、时间线、Nsight、显存分析，以及固定负载下的优化对比。

**面经：**

- [INT219 · 2025春招实习面经汇总（已接阿里offer）](README.md#int219)（已读正文）
- [INT309 · 10月面试退展](README.md#int309)（已读正文）
- [INT312 · pdd 提前批 AI Infra一面 凉经（一个月前）](README.md#int312)（已读正文）
- [INT504 · 字节data AI infra实习一面](README.md#int504)（已读正文）

**参考资料：**

- [RES215 · 回忆 LLM 推理优化实习招聘：面试官视角与 CUTLASS 问答（编目标题）](resources.md#res215)（备考资料）（仅搜索摘要）
- [RES220 · 近三月 AI Infra 面经雷达 · AI Infra Field Notes](resources.md#res220)（已读正文）
- [RES601 · AIInfraGuide：训练、推理、CUDA与公司面经汇编](resources.md#res601)（已读正文）
- [RES603 · AI Infra核心题清单与练习入口](resources.md#res603)（备考资料）（已读正文）
- [RES604 · AgentGuide：AI Infra面试指南](resources.md#res604)（备考资料）（已读正文）
- [RES609 · 快手AI Infra题单解析（含明显歧义）](resources.md#res609)（已读正文）
<a id="infra-hardware"></a>

### 异构硬件、国产卡与端侧

CUDA/HIP生态迁移、模型与算子适配、量化、设备内存和能耗。

**面经：**

- [INT022 · 得物-算法平台-AI算法工程实习生 面经](README.md#int022)（仅搜索摘要）
- [INT219 · 2025春招实习面经汇总（已接阿里offer）](README.md#int219)（已读正文）
- [INT306 · 10.26 科大讯飞 推理工程部 AI Infra 一面](README.md#int306)（已读正文）
- [INT414 · 小红书端侧推理一面：手机只有 6G 内存，你的模型凭什么上去](README.md#int414)（已读正文）
- [INT501 · 0914 阿里云一面（AI Infra）](README.md#int501)（已读正文）
- [INT515 · 第四范式一面](README.md#int515)（已读正文）

**参考资料：**

- [RES601 · AIInfraGuide：训练、推理、CUDA与公司面经汇编](resources.md#res601)（已读正文）
- [RES602 · AI Infra工程师求职路线图](resources.md#res602)（备考资料）（已读正文）
- [RES604 · AgentGuide：AI Infra面试指南](resources.md#res604)（备考资料）（已读正文）
- [RES610 · 腾讯混元Infra二面二次解析：GPU、KV与算子](resources.md#res610)（已读正文）

## Agent与模型工程

<a id="eng-runtime"></a>

### Agent Runtime与Harness

任务状态、工具执行、停止条件、执行中追加要求、恢复和权限。

**面经：**

- [INT401 · 字节业务中台AI全栈凉经](README.md#int401)（已读正文）
- [INT403 · 千问agent社招一面面经](README.md#int403)（已读正文）
- [INT405 · 快手 可灵专项 Agent Harness 一面面经（回忆版）](README.md#int405)（已读正文）
- [INT407 · 百度后端实习二面面经](README.md#int407)（已读正文）
- [INT413 · 百度agent一面](README.md#int413)（已读正文）
- [INT514 · 某教育agent开发面经](README.md#int514)（已读正文）

**参考资料：**

- [RES604 · AgentGuide：AI Infra面试指南](resources.md#res604)（备考资料）（已读正文）
<a id="eng-memory"></a>

### 上下文工程与长期记忆

状态管理、聊天记录、记忆压缩、偏好变化和跨轮信息保留。

**面经：**

- [INT317 · 百度后端（agent）](README.md#int317)（已读正文）
- [INT403 · 千问agent社招一面面经](README.md#int403)（已读正文）
- [INT408 · 字节跳动 后端 Agent 一面 面经](README.md#int408)（已读正文）
- [INT511 · 暑期第二周面试情况](README.md#int511)（已读正文）
- [INT512 · 抖音电商Agent全栈开发工程师一面](README.md#int512)（已读正文）

**参考资料：**

- [RES501 · 字节 Agent 开发二面](resources.md#res501)（备考资料）（已读正文）
- [RES506 · 拼多多 AI Agent 岗一、二面](resources.md#res506)（备考资料）（已读正文）
- [RES604 · AgentGuide：AI Infra面试指南](resources.md#res604)（备考资料）（已读正文）
<a id="eng-code-agent"></a>

### Coding Agent与代码生成

补丁审批、版本管理、编译预览、代码验收和代码生成平台。

**面经：**

- [INT407 · 百度后端实习二面面经](README.md#int407)（已读正文）
- [INT413 · 百度agent一面](README.md#int413)（已读正文）

**参考资料：**

- [RB001 · AI-Interview-Code](resources.md#rb001)（仅搜索摘要）
- [RB008 · Awesome LLM System Design](resources.md#rb008)（已读正文）
<a id="eng-evaluation"></a>

### 评测工程与可观测性

测试集、任务结果与工具过程评测、自动化、回归测试和失败分析。

**面经：**

- [INT105 · 快手 推荐大模型 三面 面经](README.md#int105)（已读正文）
- [INT216 · 美团Keeta Agent开发（智能客服方向）一面面经](README.md#int216)（已读正文）
- [INT319 · 10.30 得物 MLOPS和Agent实习](README.md#int319)（已读正文）
- [INT409 · 11.3 阿里token foundry 测开 1.5小时](README.md#int409)（已读正文）
- [INT410 · 得物三面 11.3](README.md#int410)（已读正文）
- [INT411 · 科大讯飞后端 timeline&面经](README.md#int411)（已读正文）
- [INT517 · 腾讯 260824 一面面经](README.md#int517)（已读正文）

**参考资料：**

- [RES503 · 1小时秒杀agent八股  ——RAG与知识库](resources.md#res503)（已读正文）
- [RES603 · AI Infra核心题清单与练习入口](resources.md#res603)（备考资料）（已读正文）
- [RES604 · AgentGuide：AI Infra面试指南](resources.md#res604)（备考资料）（已读正文）
<a id="eng-data"></a>

### 合成数据与数据闭环

数据合成与采购、清洗过滤、训练数据质量和任务评测。

**面经：**

- [INT105 · 快手 推荐大模型 三面 面经](README.md#int105)（已读正文）
- [INT519 · 滴滴大模型算法岗一面面经](README.md#int519)（仅搜索摘要）
- [INT520 · MiniMax - 大模型算法岗（后训练 / SFT / RL 方向，独角兽）](README.md#int520)（已读正文）

**参考资料：**

- [RES503 · 1小时秒杀agent八股  ——RAG与知识库](resources.md#res503)（已读正文）
<a id="eng-safety"></a>

### 模型与Agent运行安全

工具写操作、审批、权限、隔离、隐私和执行记录。业务反欺诈见风控方向。

**面经：**

- [INT214 · 字节跳动风控算法一面](README.md#int214)（已读正文）
- [INT407 · 百度后端实习二面面经](README.md#int407)（已读正文）
- [INT508 · 小红书暑期实习 AI全栈开发 二面](README.md#int508)（已读正文）
- [INT514 · 某教育agent开发面经](README.md#int514)（已读正文）
- [INT517 · 腾讯 260824 一面面经](README.md#int517)（已读正文）
- [INT518 · 字节AI Agent开发秋招一面面经](README.md#int518)（已读正文）

**参考资料：**

- [RES505 · 美团 Agent 开发一面](resources.md#res505)（备考资料）（已读正文）
- [RES604 · AgentGuide：AI Infra面试指南](resources.md#res604)（备考资料）（已读正文）

## 应用场景

<a id="app-growth-marketing"></a>

### 用户增长与营销

因果推断、uplift、触达、用户画像、营销Agent和增量实验。

**面经：**

- [INT040 · 硕五算法面经-增长方向](README.md#int040)（仅搜索摘要）
- [INT210 · 美团 机器学习/数据挖掘算法工程师 一二面面经（又已回人才库版）](README.md#int210)（已读正文）
- [INT412 · 字节跳动 后端 Agent 二面 面经](README.md#int412)（已读正文）
<a id="app-service"></a>

### 客服、外呼与业务执行

知识咨询、业务操作、流式交互、转人工和客服质量评测。

**面经：**

- [INT104 · OC了，分享一下美团智能客服面经](README.md#int104)（仅搜索摘要）
- [INT216 · 美团Keeta Agent开发（智能客服方向）一面面经](README.md#int216)（已读正文）
- [INT217 · 腾讯客服-一、二、三、四、五与六面面经（录用评估中）](README.md#int217)（已读正文）
- [INT509 · 成都agent 面试](README.md#int509)（已读正文）

**参考资料：**

- [RES219 · 搞定日处理 500 万语音通话，我的 AI 项目面试全攻略（上）](resources.md#res219)（备考资料）（仅搜索摘要）
- [RES505 · 美团 Agent 开发一面](resources.md#res505)（备考资料）（已读正文）
- [RES606 · 实时语音Agent系统设计：延迟、轮次与打断](resources.md#res606)（备考资料）（仅搜索摘要）
<a id="app-speech"></a>

### 实时语音与会议转写

ASR、TTS、语音质量、弱网、转写隐私、流式打断和恢复。

**面经：**

- [INT111 · 算法岗-日常实习-面经](README.md#int111)（已读正文）
- [INT224 · 有赞面经](README.md#int224)（已读正文）
- [INT513 · 豆包手机测开面经](README.md#int513)（已读正文）
- [INT518 · 字节AI Agent开发秋招一面面经](README.md#int518)（已读正文）

**参考资料：**

- [RES219 · 搞定日处理 500 万语音通话，我的 AI 项目面试全攻略（上）](resources.md#res219)（备考资料）（仅搜索摘要）
- [RES606 · 实时语音Agent系统设计：延迟、轮次与打断](resources.md#res606)（备考资料）（仅搜索摘要）
<a id="app-commerce"></a>

### 电商与商家Agent

电商岗位和商品场景。目前面经主要涉及知识库项目，导购与交易流程还待补充。

**面经：**

- [INT109 · 拼多多多模态大模型算法工程师面试（编目标题）](README.md#int109)（已读正文）
- [INT512 · 抖音电商Agent全栈开发工程师一面](README.md#int512)（已读正文）
<a id="app-bi"></a>

### 智能问数、NL2SQL与BI

业务术语、字段映射、NL2SQL、查询流程和问数评估。

**面经：**

- [INT001 · 理想+ 大模型面经](README.md#int001)（已读正文）
- [INT508 · 小红书暑期实习 AI全栈开发 二面](README.md#int508)（已读正文）
- [INT511 · 暑期第二周面试情况](README.md#int511)（已读正文）
- [INT519 · 滴滴大模型算法岗一面面经](README.md#int519)（仅搜索摘要）

**参考资料：**

- [RES607 · 智能体应用二次解析：PDF、JSON输出与NL2SQL](resources.md#res607)（已读正文）
- [RES608 · 信雅达Java一面二次解析：NL2SQL项目](resources.md#res608)（已读正文）
<a id="app-office"></a>

### 办公助手与文档智能

行政HR助手、企业任务和文档知识使用。

**面经：**

- [INT411 · 科大讯飞后端 timeline&面经](README.md#int411)（已读正文）
- [INT517 · 腾讯 260824 一面面经](README.md#int517)（已读正文）

**参考资料：**

- [RES506 · 拼多多 AI Agent 岗一、二面](resources.md#res506)（备考资料）（已读正文）
- [RES607 · 智能体应用二次解析：PDF、JSON输出与NL2SQL](resources.md#res607)（已读正文）
<a id="app-creative"></a>

### 内容生成、视频与数字人

营销生图、生视频和生成模型系统；数字人专项面经还比较少。

**面经：**

- [INT412 · 字节跳动 后端 Agent 二面 面经](README.md#int412)（已读正文）
- [INT505 · AI Infra面经 攒人品版](README.md#int505)（已读正文）
<a id="app-medical"></a>

### 医疗模型与医疗Agent

医疗后训练、Skill/HIS及医疗SFT/DPO项目。有些记录来自候选人的过往项目。

**面经：**

- [INT216 · 美团Keeta Agent开发（智能客服方向）一面面经](README.md#int216)（已读正文）
- [INT507 · 百川智能医疗大模型后训练面经](README.md#int507)（已读正文）
<a id="app-education"></a>

### 教育与教学Agent

数学教育研究和教育公司应用开发。目前应用面经主要问RAG及系统工程。

**面经：**

- [INT013 · 达摩院 暑期实习 决策智能实验室 大模型算法](README.md#int013)（仅搜索摘要）
- [INT514 · 某教育agent开发面经](README.md#int514)（已读正文）
<a id="app-legal"></a>

### 法律、合同与文档审查

合同审查项目、法律条文微调与RAG取舍，目前收录来自候选项目。

**面经：**

- [INT515 · 第四范式一面](README.md#int515)（已读正文）
<a id="app-frontend"></a>

### AI前端、全栈与交互

Agent状态展示、递归组件、流式交互、端侧WebLLM和国际化。

**面经：**

- [INT401 · 字节业务中台AI全栈凉经](README.md#int401)（已读正文）
- [INT516 · Ai Agent实习面经-Soul](README.md#int516)（已读正文）
<a id="app-personalization"></a>

### 个性化助手与用户画像

用户画像、偏好写入与衰减，以及偏好变更确认。情感陪伴专项还待补充。

**面经：**

- [INT207 · 字节懂车帝大模型日常实习面经（已oc版](README.md#int207)（已读正文）
- [INT317 · 百度后端（agent）](README.md#int317)（已读正文）
<a id="app-risk"></a>

### 风控、审核与反欺诈

风控岗位、内容审核和反欺诈场景，具体项目内容见条目备注。

**面经：**

- [INT214 · 字节跳动风控算法一面](README.md#int214)（已读正文）
- [INT215 · 字节风控算法面经](README.md#int215)（已读正文）
- [INT517 · 腾讯 260824 一面面经](README.md#int517)（已读正文）
<a id="app-embodied"></a>

### 具身智能与世界模型

机器人、VLA和世界模型。暂时只有参考指南，面经原帖待补充。

**面经：**

暂时还没收集到这一方向的面经。

**参考资料：**

- [RB009 · AIMLInterviews](resources.md#rb009)（已读正文）
