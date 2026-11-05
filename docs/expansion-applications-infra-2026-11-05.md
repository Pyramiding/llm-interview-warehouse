# 2026-11-05 应用方向与LLM Infra扩展

[返回首页](../README.md) · [按公司](interviews/by-company.md) · [29个细分方向](interviews/by-specialty.md) · [LLM Infra专页](interviews/llm-infra.md) · [核查日志](../data/research-20261105-applications-infra.json)

本轮新增 **19篇公开自述、10个补充入口、75条依据原帖改写的重点问法**。累计 **161篇面经、96个补充入口、23个原创题解专题和29个细分方向**；原创题解与练习仍为440道，未把摘录问法算入。

## 范围：按方向回补历史资料

从 [1ea8fba](https://github.com/Pyramiding/llm-interview-warehouse/commit/1ea8fbacf8985df4062ede3ea18d47fe907d1a31) 继续。本轮补齐研究、系统工程与应用方向，**不限定为上次上传后刚发布**；因此不能称这19篇是当天新发面经。此前14篇的增量窗口见[同日较早更新](incremental-2026-11-05.md)。提交前同步保留了远端[d9a3070](https://github.com/Pyramiding/llm-interview-warehouse/commit/d9a30706f69bd5a216dd8201d772c7f33187a90a)新增的RRF数值与排序示例检查。

优先2023—2026年资料。新记录中15篇取得原页首发元数据，4篇首发年份仍未知，单列未知年份。新增自述18篇取得公开相关正文，1篇只核对搜索可见片段。面试日、首发日、编辑日和查阅日分开记录。

## LLM Infra单独查

新增[专页](interviews/llm-infra.md)关联 **16篇去重公开自述与9个补充入口**，包含旧记录重新分类，不能把它们全部算成本轮新增。

| 细分方向 | 代表入口 | 采集和准备重点 |
|---|---|---|
| 训练系统与显存 | [原有多公司复盘INT219](interviews/README.md#int219)、[暑期实习INT511](interviews/README.md#int511) | 并行、训练流程、状态显存与部署；多公司题目按原帖分段看。 |
| RL Infra与Rollout | [原有Agentic RL面经INT218](interviews/README.md#int218) | 模拟环境、轨迹、奖励与多轮评测；重复发现后关联原记录，没有再收一次。 |
| CUDA/Triton与算子 | [字节GEMM/MLA INT503](interviews/README.md#int503)、[综合回顾INT505](interviews/README.md#int505) | 手写、访存、归约、正确性与优化验证。 |
| 图执行与AI编译 | [阿里二面INT502](interviews/README.md#int502) | CUDA Graph、动态shape、确定性与回退；专门编译器岗位样本仍不足。 |
| NCCL与通信 | [阿里二面INT502](interviews/README.md#int502)、[原有阿里云INT220](interviews/README.md#int220) | 通信拓扑、缓冲区同步、互联建模与KV传输。 |
| 推理引擎与Serving | [字节Data INT504](interviews/README.md#int504)、[原有讯飞INT306](interviews/README.md#int306) | KV、框架、调度、时延、吞吐与可测量收益。 |
| GPU调度与平台 | [原有讯飞INT306](interviews/README.md#int306)、[云原生资料RES605](interviews/resources.md#res605) | 池化、隔离、扩缩容与观测；区分亲历与学习路线。 |
| Profiling与Benchmark | [字节Data INT504](interviews/README.md#int504)、[原有拼多多INT312](interviews/README.md#int312) | 硬件计数器、时间线与瓶颈定位，不能只报GPU利用率。 |
| 异构硬件与端侧 | [阿里云INT501](interviews/README.md#int501)、[第四范式INT515](interviews/README.md#int515)、[原有端侧INT414](interviews/README.md#int414) | 算子迁移、框架兼容、量化、内存与设备约束。 |

GitHub新增[AIInfraGuide](interviews/resources.md#res601)、[个人求职路线](interviews/resources.md#res602)、[核心题清单](interviews/resources.md#res603)、[AgentGuide](interviews/resources.md#res604)和[云原生景观](interviews/resources.md#res605)。它们提供阅读入口，仓库宣称的场次数、计划项目和目录日期都没有直接计作本库亲历证据。

## 应用与工程方向

| 方向 | 新增/关联入口 | 证据边界 |
|---|---|---|
| 医疗后训练 | [百川INT507](interviews/README.md#int507)、[原有医疗项目/客服INT216](interviews/README.md#int216) | 医疗Skill、HIS、长程RL与SFT/DPO；区分领域训练与业务执行。 |
| 智能问数与BI | [小红书INT508](interviews/README.md#int508)、[滴滴INT519](interviews/README.md#int519)、[信雅达解析RES608](interviews/resources.md#res608) | 区分NL2SQL、字段映射与一般问数误差；滴滴仅片段核验，信雅达为二次解析。 |
| 客服、外呼 | [成都多公司INT509](interviews/README.md#int509) | 公司未公开，按原文分段；不能把不同公司的技术问题与业务混配。 |
| 语音与会议 | [豆包测开INT513](interviews/README.md#int513)、[TikTok INT518](interviews/README.md#int518) | 商业语音测试、ASR转写、错漏字、隐私和弱网；不等同ASR/TTS算法训练岗。 |
| 教育Agent | [INT514](interviews/README.md#int514) | 教育由标题支持，正文主要是RAG、权限、多租户与断连恢复，不补造教学效果题。 |
| 法律与合同 | [第四范式INT515](interviews/README.md#int515) | 合同审查是候选项目；团队反问偏国产卡适配，不能改称法律产品岗。 |
| 电商与知识库 | [抖音电商INT512](interviews/README.md#int512) | 岗位属电商，实际问题重心是图谱、更新、记忆和评估，没有编造交易题。 |
| AI前端与全栈 | [Soul INT516](interviews/README.md#int516) | 多Agent交互、端侧WebLLM、体验与国际化；不因公司品牌自动贴情感陪伴。 |
| 风控与办公助手 | [腾讯INT517](interviews/README.md#int517) | 岗位是风控，项目为语义搜索和行政HR助手；最终答案与工具动作分别评测。 |
| 合成数据与后训练 | [MiniMax INT520](interviews/README.md#int520) | 只采用付费墙前的导语及公开问题，隐藏约60%内容未获取。 |
| 企业RAG与模型部署 | [中兴INT510](interviews/README.md#int510)、[多公司INT511](interviews/README.md#int511) | 过往医疗科技实习不等于中兴业务，量化公司背景不等于金融大模型岗。 |

## 29个细分方向怎样使用

在现有23个专题之外，增加9个LLM Infra、6个Agent/模型工程及14个应用方向。按公司、年份、业务等原索引继续保留。细分标签是人工审核的交叉阅读入口，一篇可以涉及多方向，不能把方向计数相加。

具身/世界模型保留为缺口，现有指南不冒充亲历。增长、营销、数字人、生产RL集群与专门编译器面经仍需继续补；本轮没有为每个方向强行填一条。

## 来源与质量处理

- **同源去重：** 阿里Agentic RL原帖已是INT218，本轮只关联；同一候选人的多公司复盘仍按整篇一条。
- **二次材料分级：** 混元Infra牛客原页未读到，仅把已读汇编列为[RES610](interviews/resources.md#res610)；PDF/NL2SQL与信雅达汇编未定位到可核对原链，也不计亲历。
- **模拟题声明：** [实时语音系统设计RES606](interviews/resources.md#res606)明确写模拟面试，不因为页面有“美团”字样就标为该公司真题。
- **答案错配：** [快手Infra解析RES609](interviews/resources.md#res609)把量化回答为金融交易策略，已标注，未采为技术答案。
- **平台边界：** 新增亲历原链来自牛客，另加GitHub等补充资料；知乎/公众号检索没有取得可新增的直接原帖，不声称新增了其亲历覆盖。

同步检查来源结构、细分ID及引用、日期、去重、本地链接与锚点、筛选功能、原有数值示例及生成一致性。上述检查不等于企业独立认证或所有外部答案正确。
