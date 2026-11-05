# 2026-11-05：应用与LLM Infra补充

[返回首页](../README.md) · [按公司](interviews/by-company.md) · [细分方向](interviews/by-specialty.md) · [LLM Infra](interviews/llm-infra.md) · [检索记录](../data/research-20261105-applications-infra.json)

这次回补了19篇面经、10份参考资料，并从原帖整理了75条问题摘录。仓库现有161篇面经、96份参考资料、23个题解专题和29个细分方向。题解与练习仍为440道，问题摘录另计。

本批按方向补历史资料，并非都发布于上次上传之后；[当天较早的14篇增量更新](incremental-2026-11-05.md)另有记录。19篇中，18篇读到了公开正文，1篇仅有搜索摘要；15篇取得首发时间，4篇首发年份未确认。

## LLM Infra

新增[Infra专页](interviews/llm-infra.md)，把已有资料一起按方向整理，共16篇面经、9份参考资料。

| 方向 | 可以先读 | 主要问题 |
|---|---|---|
| 训练系统与显存 | [多公司复盘](interviews/README.md#int219)、[暑期实习](interviews/README.md#int511) | 并行、训练流程、状态显存与部署 |
| RL Infra与Rollout | [阿里Agentic RL](interviews/README.md#int218) | 模拟环境、轨迹、奖励和多轮评测 |
| CUDA/Triton与算子 | [字节GEMM/MLA](interviews/README.md#int503)、[综合回顾](interviews/README.md#int505) | 手写、访存、归约、正确性和优化 |
| 图执行与AI编译 | [阿里二面](interviews/README.md#int502) | CUDA Graph、动态shape、确定性和回退 |
| NCCL与通信 | [阿里二面](interviews/README.md#int502)、[阿里云](interviews/README.md#int220) | 拓扑、缓冲区同步、互联建模和KV传输 |
| 推理引擎与Serving | [字节Data](interviews/README.md#int504)、[讯飞](interviews/README.md#int306) | KV、框架、调度、时延和吞吐 |
| GPU调度与平台 | [讯飞](interviews/README.md#int306)、[云原生资料](interviews/resources.md#res605) | 池化、隔离、扩缩容和监控 |
| Profiling与Benchmark | [字节Data](interviews/README.md#int504)、[拼多多](interviews/README.md#int312) | 硬件计数器、时间线和瓶颈定位 |
| 异构硬件与端侧 | [阿里云](interviews/README.md#int501)、[第四范式](interviews/README.md#int515)、[端侧项目](interviews/README.md#int414) | 算子迁移、框架兼容、量化和设备内存 |

GitHub资料新增[AIInfraGuide](interviews/resources.md#res601)、[求职路线](interviews/resources.md#res602)、[核心题清单](interviews/resources.md#res603)、[AgentGuide](interviews/resources.md#res604)和[云原生景观](interviews/resources.md#res605)。其中有教程和计划项目，阅读时按岗位挑选。

## 应用与模型工程

| 方向 | 新增或相关面经 | 主要内容与备注 |
|---|---|---|
| 医疗后训练 | [百川](interviews/README.md#int507)、[医疗项目/客服](interviews/README.md#int216) | 医疗Skill、HIS、长程RL和SFT/DPO；后者含候选人项目 |
| 智能问数与BI | [小红书](interviews/README.md#int508)、[滴滴](interviews/README.md#int519)、[信雅达解析](interviews/resources.md#res608) | NL2SQL、字段映射和问数误差；滴滴仅读到搜索摘要，信雅达为二次解析 |
| 客服、外呼 | [成都多公司复盘](interviews/README.md#int509) | 公司未公开，问题和业务按原文分段阅读 |
| 语音与会议 | [豆包测开](interviews/README.md#int513)、[TikTok](interviews/README.md#int518) | 语音测试、转写、错漏字、隐私和弱网；偏测试与应用，非ASR/TTS训练岗 |
| 教育Agent | [教育公司应用开发](interviews/README.md#int514) | 正文主要问RAG、权限、多租户和断连恢复 |
| 法律与合同 | [第四范式](interviews/README.md#int515) | 候选项目是合同审查，团队业务反问偏国产卡适配 |
| 电商与知识库 | [抖音电商](interviews/README.md#int512) | 知识图谱、更新、记忆和评估 |
| AI前端与全栈 | [Soul](interviews/README.md#int516) | 多Agent交互、端侧WebLLM、体验和国际化 |
| 风控与办公助手 | [腾讯](interviews/README.md#int517) | 风控岗位，项目为语义搜索和行政HR助手；分别评测答案与工具动作 |
| 合成数据与后训练 | [MiniMax](interviews/README.md#int520) | 只整理付费墙前的导语与公开问题，约60%的隐藏内容未读到 |
| 企业RAG与部署 | [中兴](interviews/README.md#int510)、[多公司暑期实习](interviews/README.md#int511) | 项目、量化和部署；作者过往医疗实习及量化公司背景不作团队业务标签 |

## 分类和资料备注

29个细分方向包括9个LLM Infra、6个Agent/模型工程和14个应用场景。一篇涉及多个方向时会出现在多处，总数只计一次。具身/世界模型暂时只有参考资料；增长、营销、数字人、生产RL集群和编译器专岗的面经仍需继续补。

- 阿里Agentic RL已收录为INT218，这次只补分类，没有重复新增。
- [混元Infra解析](interviews/resources.md#res610)的牛客原帖暂时读不到，先保留汇编。PDF/NL2SQL和信雅达资料同样未找到可核对的原帖，放在参考资料中。
- [实时语音系统设计](interviews/resources.md#res606)明确是模拟面试，页面里的“美团”不作为企业真题归属。
- [快手Infra解析](interviews/resources.md#res609)把模型量化答成金融交易策略，这段有明显错误，不宜作为答案参考。
- 本批新增面经原帖来自牛客，另有GitHub等参考资料。知乎和公众号本轮没有找到可新增的面经原帖。

提交前检查了日期、去重、分类引用、链接与锚点、索引生成，以及原有计算示例。
