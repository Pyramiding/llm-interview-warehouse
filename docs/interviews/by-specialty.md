# 按细分技术与应用方向查面经

[返回首页](../../README.md) · [按公司](by-company.md) · [研究专题](by-topic.md) · [细分方向](by-specialty.md) · [LLM Infra专页](llm-infra.md)

本页在23个研究专题之外提供人工审核的细分标签。标签表示可见内容涉及该方向，可能来自岗位、候选项目或场景题；不代表招聘团队主营业务，也不是企业统一考纲。

同一记录可跨方向出现，数量不能相加当作独立面试数。公开自述与汇编/备考分开列示；尚无亲历的方向保留缺口，不用教程充数。

| 方向 | 公开自述 | 补充阅读 |
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

并行切分、ZeRO/FSDP、训练状态、重计算与训练系统排障。

**公开自述面经：**

- [INT042 · 本科生24暑期实习NLP（Infra & LLM）算法工程师面经](README.md#int042)（search_excerpt）
- [INT219 · 2025春招实习面经汇总（已接阿里offer）](README.md#int219)（opened）
- [INT502 · 阿里AI Infra 二面 面经](README.md#int502)（opened）
- [INT511 · 暑期第二周面试情况](README.md#int511)（opened）

**汇编与备考（不计亲历）：**

- [RES601 · AIInfraGuide：训练、推理、CUDA与公司面经汇编](resources.md#res601)（opened）
- [RES602 · AI Infra工程师求职路线图](resources.md#res602)（准备/邻接阅读）（opened）
- [RES604 · AgentGuide：AI Infra面试指南](resources.md#res604)（准备/邻接阅读）（opened）
- [RES605 · AI-Infra Landscape与云原生学习路线](resources.md#res605)（准备/邻接阅读）（opened）
<a id="infra-rl"></a>

### RL Infra与Rollout系统

采样环境、训练执行链路、AgentLoop与多轮RL评测；仅讨论算法差异的面经不自动标为RL Infra。

**公开自述面经：**

- [INT218 · 阿里云 AI Infer 一面](README.md#int218)（opened）

**汇编与备考（不计亲历）：**

- [RES601 · AIInfraGuide：训练、推理、CUDA与公司面经汇编](resources.md#res601)（opened）
- [RES604 · AgentGuide：AI Infra面试指南](resources.md#res604)（准备/邻接阅读）（opened）
- [RES605 · AI-Infra Landscape与云原生学习路线](resources.md#res605)（准备/邻接阅读）（opened）
<a id="infra-kernel"></a>

### CUDA、Triton与算子优化

GEMM、Attention、归约、访存、确定性、手写kernel与数值验证。

**公开自述面经：**

- [INT219 · 2025春招实习面经汇总（已接阿里offer）](README.md#int219)（opened）
- [INT309 · 10月面试退展](README.md#int309)（opened）
- [INT312 · pdd 提前批 AI Infra一面 凉经（一个月前）](README.md#int312)（opened）
- [INT501 · 0914 阿里云一面（AI Infra）](README.md#int501)（opened）
- [INT502 · 阿里AI Infra 二面 面经](README.md#int502)（opened）
- [INT503 · 字节AI infra校招一面面经 1h](README.md#int503)（opened）
- [INT505 · AI Infra面经 攒人品版](README.md#int505)（opened）
- [INT511 · 暑期第二周面试情况](README.md#int511)（opened）

**汇编与备考（不计亲历）：**

- [RES215 · 回忆 LLM 推理优化实习招聘：面试官视角与 CUTLASS 问答（编目标题）](resources.md#res215)（准备/邻接阅读）（search_excerpt）
- [RES601 · AIInfraGuide：训练、推理、CUDA与公司面经汇编](resources.md#res601)（opened）
- [RES603 · AI Infra核心题清单与练习入口](resources.md#res603)（准备/邻接阅读）（opened）
- [RES604 · AgentGuide：AI Infra面试指南](resources.md#res604)（准备/邻接阅读）（opened）
- [RES609 · 快手AI Infra题单解析（含明显歧义）](resources.md#res609)（opened）
- [RES610 · 腾讯混元Infra二面二次解析：GPU、KV与算子](resources.md#res610)（opened）
<a id="infra-compiler"></a>

### 图执行与AI编译

CUDA Graph、动态shape、计算路径与编译栈。现有原帖主要支持图执行问题，专门编译器岗位的亲历仍不足。

**公开自述面经：**

- [INT502 · 阿里AI Infra 二面 面经](README.md#int502)（opened）

**汇编与备考（不计亲历）：**

- [RES601 · AIInfraGuide：训练、推理、CUDA与公司面经汇编](resources.md#res601)（opened）
- [RES604 · AgentGuide：AI Infra面试指南](resources.md#res604)（准备/邻接阅读）（opened）
<a id="infra-communication"></a>

### NCCL、互联与多卡通信

集合通信、拓扑、同步、跨节点KV传输与通信瓶颈；不把普通消息队列题归为GPU通信。

**公开自述面经：**

- [INT219 · 2025春招实习面经汇总（已接阿里offer）](README.md#int219)（opened）
- [INT220 · ai infra实习 阿里云面经](README.md#int220)（opened）
- [INT502 · 阿里AI Infra 二面 面经](README.md#int502)（opened）
- [INT511 · 暑期第二周面试情况](README.md#int511)（opened）

**汇编与备考（不计亲历）：**

- [RES601 · AIInfraGuide：训练、推理、CUDA与公司面经汇编](resources.md#res601)（opened）
- [RES602 · AI Infra工程师求职路线图](resources.md#res602)（准备/邻接阅读）（opened）
- [RES603 · AI Infra核心题清单与练习入口](resources.md#res603)（准备/邻接阅读）（opened）
- [RES604 · AgentGuide：AI Infra面试指南](resources.md#res604)（准备/邻接阅读）（opened）
<a id="infra-serving"></a>

### LLM推理引擎与Serving

vLLM/SGLang、KV管理、批处理、PD分离、投机解码、吞吐与延迟。

**公开自述面经：**

- [INT219 · 2025春招实习面经汇总（已接阿里offer）](README.md#int219)（opened）
- [INT220 · ai infra实习 阿里云面经](README.md#int220)（opened）
- [INT306 · 10.26 科大讯飞 推理工程部 AI Infra 一面](README.md#int306)（opened）
- [INT309 · 10月面试退展](README.md#int309)（opened）
- [INT501 · 0914 阿里云一面（AI Infra）](README.md#int501)（opened）
- [INT502 · 阿里AI Infra 二面 面经](README.md#int502)（opened）
- [INT503 · 字节AI infra校招一面面经 1h](README.md#int503)（opened）
- [INT504 · 字节data AI infra实习一面](README.md#int504)（opened）
- [INT505 · AI Infra面经 攒人品版](README.md#int505)（opened）

**汇编与备考（不计亲历）：**

- [RES220 · 近三月 AI Infra 面经雷达 · AI Infra Field Notes](resources.md#res220)（opened）
- [RES601 · AIInfraGuide：训练、推理、CUDA与公司面经汇编](resources.md#res601)（opened）
- [RES602 · AI Infra工程师求职路线图](resources.md#res602)（准备/邻接阅读）（opened）
- [RES603 · AI Infra核心题清单与练习入口](resources.md#res603)（准备/邻接阅读）（opened）
- [RES604 · AgentGuide：AI Infra面试指南](resources.md#res604)（准备/邻接阅读）（opened）
- [RES605 · AI-Infra Landscape与云原生学习路线](resources.md#res605)（准备/邻接阅读）（opened）
- [RES610 · 腾讯混元Infra二面二次解析：GPU、KV与算子](resources.md#res610)（opened）
<a id="infra-platform"></a>

### GPU调度与云原生平台

GPU池化、隔离、弹性伸缩、Kubernetes训练推理工作负载与平台观测；亲历样本少于教程覆盖。

**公开自述面经：**

- [INT306 · 10.26 科大讯飞 推理工程部 AI Infra 一面](README.md#int306)（opened）

**汇编与备考（不计亲历）：**

- [RES601 · AIInfraGuide：训练、推理、CUDA与公司面经汇编](resources.md#res601)（opened）
- [RES602 · AI Infra工程师求职路线图](resources.md#res602)（准备/邻接阅读）（opened）
- [RES603 · AI Infra核心题清单与练习入口](resources.md#res603)（准备/邻接阅读）（opened）
- [RES604 · AgentGuide：AI Infra面试指南](resources.md#res604)（准备/邻接阅读）（opened）
- [RES605 · AI-Infra Landscape与云原生学习路线](resources.md#res605)（准备/邻接阅读）（opened）
<a id="infra-profiling"></a>

### 性能分析与Benchmark

Roofline、时间线、Nsight、负载条件、显存账本与端到端优化证据。

**公开自述面经：**

- [INT219 · 2025春招实习面经汇总（已接阿里offer）](README.md#int219)（opened）
- [INT309 · 10月面试退展](README.md#int309)（opened）
- [INT312 · pdd 提前批 AI Infra一面 凉经（一个月前）](README.md#int312)（opened）
- [INT504 · 字节data AI infra实习一面](README.md#int504)（opened）

**汇编与备考（不计亲历）：**

- [RES215 · 回忆 LLM 推理优化实习招聘：面试官视角与 CUTLASS 问答（编目标题）](resources.md#res215)（准备/邻接阅读）（search_excerpt）
- [RES220 · 近三月 AI Infra 面经雷达 · AI Infra Field Notes](resources.md#res220)（opened）
- [RES601 · AIInfraGuide：训练、推理、CUDA与公司面经汇编](resources.md#res601)（opened）
- [RES603 · AI Infra核心题清单与练习入口](resources.md#res603)（准备/邻接阅读）（opened）
- [RES604 · AgentGuide：AI Infra面试指南](resources.md#res604)（准备/邻接阅读）（opened）
- [RES609 · 快手AI Infra题单解析（含明显歧义）](resources.md#res609)（opened）
<a id="infra-hardware"></a>

### 异构硬件、国产卡与端侧

CUDA/HIP等生态迁移、模型与算子适配、量化、设备内存和能耗。

**公开自述面经：**

- [INT022 · 得物-算法平台-AI算法工程实习生 面经](README.md#int022)（search_excerpt）
- [INT219 · 2025春招实习面经汇总（已接阿里offer）](README.md#int219)（opened）
- [INT306 · 10.26 科大讯飞 推理工程部 AI Infra 一面](README.md#int306)（opened）
- [INT414 · 小红书端侧推理一面：手机只有 6G 内存，你的模型凭什么上去](README.md#int414)（opened）
- [INT501 · 0914 阿里云一面（AI Infra）](README.md#int501)（opened）
- [INT515 · 第四范式一面](README.md#int515)（opened）

**汇编与备考（不计亲历）：**

- [RES601 · AIInfraGuide：训练、推理、CUDA与公司面经汇编](resources.md#res601)（opened）
- [RES602 · AI Infra工程师求职路线图](resources.md#res602)（准备/邻接阅读）（opened）
- [RES604 · AgentGuide：AI Infra面试指南](resources.md#res604)（准备/邻接阅读）（opened）
- [RES610 · 腾讯混元Infra二面二次解析：GPU、KV与算子](resources.md#res610)（opened）

## Agent与模型工程

<a id="eng-runtime"></a>

### Agent Runtime与Harness

任务状态、工具执行、停止条件、执行中追加要求、恢复与权限。

**公开自述面经：**

- [INT401 · 字节业务中台AI全栈凉经](README.md#int401)（opened）
- [INT403 · 千问agent社招一面面经](README.md#int403)（opened）
- [INT405 · 快手 可灵专项 Agent Harness 一面面经（回忆版）](README.md#int405)（opened）
- [INT407 · 百度后端实习二面面经](README.md#int407)（opened）
- [INT413 · 百度agent一面](README.md#int413)（opened）
- [INT514 · 某教育agent开发面经](README.md#int514)（opened）

**汇编与备考（不计亲历）：**

- [RES604 · AgentGuide：AI Infra面试指南](resources.md#res604)（准备/邻接阅读）（opened）
<a id="eng-memory"></a>

### 上下文工程与长期记忆

状态与聊天记录的区别、记忆压缩、偏好变化与跨轮信息保留。

**公开自述面经：**

- [INT317 · 百度后端（agent）](README.md#int317)（opened）
- [INT403 · 千问agent社招一面面经](README.md#int403)（opened）
- [INT408 · 字节跳动 后端 Agent 一面 面经](README.md#int408)（opened）
- [INT511 · 暑期第二周面试情况](README.md#int511)（opened）
- [INT512 · 抖音电商Agent全栈开发工程师一面](README.md#int512)（opened）

**汇编与备考（不计亲历）：**

- [RES501 · 字节 Agent 开发二面](resources.md#res501)（准备/邻接阅读）（opened）
- [RES506 · 拼多多 AI Agent 岗一、二面](resources.md#res506)（准备/邻接阅读）（opened）
- [RES604 · AgentGuide：AI Infra面试指南](resources.md#res604)（准备/邻接阅读）（opened）
<a id="eng-code-agent"></a>

### Coding Agent与代码生成

补丁审批、版本绑定、编译预览、代码验收和生成平台；普通使用AI写代码不自动归入。

**公开自述面经：**

- [INT407 · 百度后端实习二面面经](README.md#int407)（opened）
- [INT413 · 百度agent一面](README.md#int413)（opened）

**汇编与备考（不计亲历）：**

- [RB001 · AI-Interview-Code](resources.md#rb001)（search_excerpt）
- [RB008 · Awesome LLM System Design](resources.md#rb008)（opened）
<a id="eng-evaluation"></a>

### 评测工程与可观测性

测试集、任务与工具过程评测、自动化、数据质量、回归及失败归因。

**公开自述面经：**

- [INT105 · 快手 推荐大模型 三面 面经](README.md#int105)（opened）
- [INT216 · 美团Keeta Agent开发（智能客服方向）一面面经](README.md#int216)（opened）
- [INT319 · 10.30 得物 MLOPS和Agent实习](README.md#int319)（opened）
- [INT409 · 11.3 阿里token foundry 测开 1.5小时](README.md#int409)（opened）
- [INT410 · 得物三面 11.3](README.md#int410)（opened）
- [INT411 · 科大讯飞后端 timeline&面经](README.md#int411)（opened）
- [INT517 · 腾讯 260824 一面面经](README.md#int517)（opened）

**汇编与备考（不计亲历）：**

- [RES503 · 1小时秒杀agent八股  ——RAG与知识库](resources.md#res503)（opened）
- [RES603 · AI Infra核心题清单与练习入口](resources.md#res603)（准备/邻接阅读）（opened）
- [RES604 · AgentGuide：AI Infra面试指南](resources.md#res604)（准备/邻接阅读）（opened）
<a id="eng-data"></a>

### 合成数据与数据闭环

合成、外购、清洗过滤、训练数据与任务评测；仅出现数据一词不算领域证据。

**公开自述面经：**

- [INT105 · 快手 推荐大模型 三面 面经](README.md#int105)（opened）
- [INT519 · 滴滴大模型算法岗一面面经](README.md#int519)（search_excerpt）
- [INT520 · MiniMax - 大模型算法岗（后训练 / SFT / RL 方向，独角兽）](README.md#int520)（opened）

**汇编与备考（不计亲历）：**

- [RES503 · 1小时秒杀agent八股  ——RAG与知识库](resources.md#res503)（opened）
<a id="eng-safety"></a>

### 模型与Agent运行安全

工具写操作、审批、权限、隔离、隐私与执行过程；业务反欺诈另列应用风控。

**公开自述面经：**

- [INT214 · 字节跳动风控算法一面](README.md#int214)（opened）
- [INT407 · 百度后端实习二面面经](README.md#int407)（opened）
- [INT508 · 小红书暑期实习 AI全栈开发 二面](README.md#int508)（opened）
- [INT514 · 某教育agent开发面经](README.md#int514)（opened）
- [INT517 · 腾讯 260824 一面面经](README.md#int517)（opened）
- [INT518 · 字节AI Agent开发秋招一面面经](README.md#int518)（opened）

**汇编与备考（不计亲历）：**

- [RES505 · 美团 Agent 开发一面](resources.md#res505)（准备/邻接阅读）（opened）
- [RES604 · AgentGuide：AI Infra面试指南](resources.md#res604)（准备/邻接阅读）（opened）

## 应用场景

<a id="app-growth-marketing"></a>

### 用户增长与营销

因果与uplift、触达、画像、营销Agent和增量效果；项目题与团队业务说明分别见记录。

**公开自述面经：**

- [INT040 · 硕五算法面经-增长方向](README.md#int040)（search_excerpt）
- [INT210 · 美团 机器学习/数据挖掘算法工程师 一二面面经（又已回人才库版）](README.md#int210)（opened）
- [INT412 · 字节跳动 后端 Agent 二面 面经](README.md#int412)（opened）
<a id="app-service"></a>

### 客服、外呼与业务执行

知识咨询、业务动作、流式交互、转人工和客服质量；不能把只读问答等同订单执行。

**公开自述面经：**

- [INT104 · OC了，分享一下美团智能客服面经](README.md#int104)（search_excerpt）
- [INT216 · 美团Keeta Agent开发（智能客服方向）一面面经](README.md#int216)（opened）
- [INT217 · 腾讯客服-一、二、三、四、五与六面面经（录用评估中）](README.md#int217)（opened）
- [INT509 · 成都agent 面试](README.md#int509)（opened）

**汇编与备考（不计亲历）：**

- [RES219 · 搞定日处理 500 万语音通话，我的 AI 项目面试全攻略（上）](resources.md#res219)（准备/邻接阅读）（search_excerpt）
- [RES505 · 美团 Agent 开发一面](resources.md#res505)（准备/邻接阅读）（opened）
- [RES606 · 实时语音Agent系统设计：延迟、轮次与打断](resources.md#res606)（准备/邻接阅读）（search_excerpt）
<a id="app-speech"></a>

### 实时语音与会议转写

ASR、TTS、语音质量、弱网兼容、转写隐私、流式打断与恢复。

**公开自述面经：**

- [INT111 · 算法岗-日常实习-面经](README.md#int111)（opened）
- [INT224 · 有赞面经](README.md#int224)（opened）
- [INT513 · 豆包手机测开面经](README.md#int513)（opened）
- [INT518 · 字节AI Agent开发秋招一面面经](README.md#int518)（opened）

**汇编与备考（不计亲历）：**

- [RES219 · 搞定日处理 500 万语音通话，我的 AI 项目面试全攻略（上）](resources.md#res219)（准备/邻接阅读）（search_excerpt）
- [RES606 · 实时语音Agent系统设计：延迟、轮次与打断](resources.md#res606)（准备/邻接阅读）（search_excerpt）
<a id="app-commerce"></a>

### 电商与商家Agent

电商岗位/项目线索与商品场景。现有记录含岗位描述及知识库项目，不代表均已问导购、交易或商家经营全流程。

**公开自述面经：**

- [INT109 · 拼多多多模态大模型算法工程师面试（编目标题）](README.md#int109)（opened）
- [INT512 · 抖音电商Agent全栈开发工程师一面](README.md#int512)（opened）
<a id="app-bi"></a>

### 智能问数、NL2SQL与BI

数据与业务语义、字段消歧、查询链路和评估；智能问数不必然等于SQL生成。

**公开自述面经：**

- [INT001 · 理想+ 大模型面经](README.md#int001)（opened）
- [INT508 · 小红书暑期实习 AI全栈开发 二面](README.md#int508)（opened）
- [INT511 · 暑期第二周面试情况](README.md#int511)（opened）
- [INT519 · 滴滴大模型算法岗一面面经](README.md#int519)（search_excerpt）

**汇编与备考（不计亲历）：**

- [RES607 · 智能体应用二次解析：PDF、JSON输出与NL2SQL](resources.md#res607)（opened）
- [RES608 · 信雅达Java一面二次解析：NL2SQL项目](resources.md#res608)（opened）
<a id="app-office"></a>

### 办公助手与文档智能

行政HR助手、企业任务与知识使用；该方向并非所有企业知识库记录的默认标签。

**公开自述面经：**

- [INT411 · 科大讯飞后端 timeline&面经](README.md#int411)（opened）
- [INT517 · 腾讯 260824 一面面经](README.md#int517)（opened）

**汇编与备考（不计亲历）：**

- [RES506 · 拼多多 AI Agent 岗一、二面](resources.md#res506)（准备/邻接阅读）（opened）
- [RES607 · 智能体应用二次解析：PDF、JSON输出与NL2SQL](resources.md#res607)（opened）
<a id="app-creative"></a>

### 内容生成、视频与数字人

营销生图/生视频及生成模型系统。现有亲历主要是团队场景说明，数字人专项亲历仍不足。

**公开自述面经：**

- [INT412 · 字节跳动 后端 Agent 二面 面经](README.md#int412)（opened）
- [INT505 · AI Infra面经 攒人品版](README.md#int505)（opened）
<a id="app-medical"></a>

### 医疗模型与医疗Agent

医疗后训练、Skill/HIS、医疗SFT/DPO项目与评估。包含候选项目，不等于招聘方就是医疗团队。

**公开自述面经：**

- [INT216 · 美团Keeta Agent开发（智能客服方向）一面面经](README.md#int216)（opened）
- [INT507 · 百川智能医疗大模型后训练面经](README.md#int507)（opened）
<a id="app-education"></a>

### 教育与教学Agent

数学教育研究及教育公司应用开发；通用工程题不扩写为作业批改或教学效果题。

**公开自述面经：**

- [INT013 · 达摩院 暑期实习 决策智能实验室 大模型算法](README.md#int013)（search_excerpt）
- [INT514 · 某教育agent开发面经](README.md#int514)（opened）
<a id="app-legal"></a>

### 法律、合同与文档审查

合同检索证据、法律条文微调与RAG取舍；当前证据主要来自候选项目。

**公开自述面经：**

- [INT515 · 第四范式一面](README.md#int515)（opened）
<a id="app-frontend"></a>

### AI前端、全栈与交互

Agent状态展示、递归组件、流式体验、端侧WebLLM与国际化。

**公开自述面经：**

- [INT401 · 字节业务中台AI全栈凉经](README.md#int401)（opened）
- [INT516 · Ai Agent实习面经-Soul](README.md#int516)（opened）
<a id="app-personalization"></a>

### 个性化助手与用户画像

用户画像、偏好写入与衰减、变更确认。情感陪伴专项面经尚不足，不因社交公司名称自动归类。

**公开自述面经：**

- [INT207 · 字节懂车帝大模型日常实习面经（已oc版](README.md#int207)（opened）
- [INT317 · 百度后端（agent）](README.md#int317)（opened）
<a id="app-risk"></a>

### 风控、审核与反欺诈

按明确岗位或设计场景收录，区分内容/欺诈风险与通用Agent权限控制。

**公开自述面经：**

- [INT214 · 字节跳动风控算法一面](README.md#int214)（opened）
- [INT215 · 字节风控算法面经](README.md#int215)（opened）
- [INT517 · 腾讯 260824 一面面经](README.md#int517)（opened）
<a id="app-embodied"></a>

### 具身智能与世界模型

作为待补亲历方向保留；现有指南和研究延伸不能冒充机器人或世界模型岗位面经。

**公开自述面经：**

当前尚无足够证据收录的专项亲历记录。

**汇编与备考（不计亲历）：**

- [RB009 · AIMLInterviews](resources.md#rb009)（opened）
