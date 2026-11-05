# llm-interview-warehouse

整理近几年的大模型面经，按公司、技术方向和应用场景查找。以2023—2026年的中文资料为主，附专题题解、手写题和项目练习。

**[打开网页版 →](https://pyramiding.github.io/llm-interview-warehouse/)** · 搜索、按公司与方向筛选、收藏、阅读题解。

<!-- STATS:START -->
161篇面经 · 23个专题 · 29个细分方向

另有96份参考资料、414道专题题解和26道项目/手写练习。论文、文档和原帖共440个去重链接，见[来源目录](docs/source-catalog.md)。
<!-- STATS:END -->

## 找面经

| 查找方式 | 内容 |
|---|---|
| [按公司](docs/interviews/by-company.md) | 字节、阿里、腾讯、美团、百度等公司的面经，也有多公司求职复盘 |
| [按技术方向](docs/interviews/by-topic.md) | 预训练、微调、对齐、RAG、Agent、推理、多模态等 |
| [LLM Infra](docs/interviews/llm-infra.md) | 训练系统、推理引擎、CUDA/Triton、通信、GPU平台等 |
| [按细分方向](docs/interviews/by-specialty.md) | 29个方向，包括模型工程、搜广推、增长、风控、语音、客服等 |
| [按公司和业务](docs/interviews/company-direction.md) | 先选业务，再看各公司的相关面经 |
| [全部面经](docs/interviews/README.md) | 按年份浏览，每篇附原帖、摘要、问题摘录和备注 |

还可以按[平台](docs/interviews/by-platform.md)、[岗位](docs/interviews/by-role.md)、[年份](docs/interviews/by-year.md)和[业务领域](docs/interviews/by-domain.md)查找。常用平台：[牛客](docs/interviews/by-platform.md#platform-nowcoder)、[LeetCode中文站](docs/interviews/by-platform.md#platform-leetcode-cn)、[LeetCode国际站](docs/interviews/by-platform.md#platform-leetcode-global)。题库、教程和二次汇编放在[参考资料](docs/interviews/resources.md)。

## 复习题目

按岗位选题可以看[准备路线](docs/preparation/learning-paths.md)。临近面试时，查[30个易错点](docs/preparation/quick-reference.md)，练[项目深挖与系统设计](docs/preparation/projects-and-system-design.md)、[手写与估算](docs/preparation/coding-and-estimation.md)。

下面23个专题按知识点整理，每题附作答要点、追问、常见误区和参考链接。这些是另行编写的练习；想看面试中具体问了什么，请看上面的面经原帖。[全部题目索引](docs/question-index.md)

| # | 方向 | 重点内容 |
|---|---|---|
| 01 | [Transformer与数学基础](docs/topics/01-transformer-and-math.md) | 注意力、mask、归一化、优化、概率、参数和计算量 |
| 02 | [预训练与数据工程](docs/topics/02-pretraining-and-data.md) | tokenizer、清洗去重、配比、合成数据、Scaling Law |
| 03 | [SFT与参数高效微调](docs/topics/03-sft-and-peft.md) | 指令格式、label mask、LoRA/QLoRA、遗忘、训练诊断 |
| 04 | [偏好对齐与强化学习](docs/topics/04-alignment-and-rl.md) | RLHF、奖励模型、PPO、DPO、GRPO、RLVR与奖励漏洞 |
| 05 | [架构、MoE与长上下文](docs/topics/05-architectures-moe-long-context.md) | GQA/MLA、路由、专家负载、位置外推与混合架构 |
| 06 | [RAG与检索](docs/topics/06-rag-and-retrieval.md) | 切分、混合召回、重排、GraphRAG、多跳与评测 |
| 07 | [Agent与工具调用](docs/topics/07-agents-and-tool-use.md) | 规划、记忆、MCP、工具协议、多Agent、状态与权限 |
| 08 | [推理优化与在线服务](docs/topics/08-inference-and-serving.md) | KV cache、FlashAttention、分页、调度、投机解码与SLO |
| 09 | [分布式训练与AI Infra](docs/topics/09-distributed-training.md) | DP/TP/PP、ZeRO/FSDP、通信、重计算、性能与故障 |
| 10 | [量化、压缩与蒸馏](docs/topics/10-compression-and-distillation.md) | PTQ/QAT、GPTQ/AWQ、低比特、蒸馏、剪枝与端侧 |
| 11 | [推理能力与测试时计算](docs/topics/11-reasoning-and-test-time-compute.md) | CoT、验证器、搜索、计算分配、长度偏差与公平对比 |
| 12 | [多模态理解与生成](docs/topics/12-multimodal.md) | CLIP/BLIP/LLaVA、图像、视频、语音、扩散与模态融合 |
| 13 | [评测与安全](docs/topics/13-evaluation-and-safety.md) | 污染、统计、LLM裁判、幻觉、对齐安全、隐私与鲁棒性 |
| 14 | [代码模型与具身智能](docs/topics/14-code-and-embodied-models.md) | Coding Agent、软件基准、VLA、动作表示与世界模型 |
| 15 | [领域模型与研究设计](docs/topics/15-domain-models-and-research.md) | 搜索推荐、医疗金融、AI4Science、消融与研究选题 |
| 16 | [大模型与搜索](docs/topics/16-llm-search.md) | query理解、改写、生成式检索、排序与答案 |
| 17 | [大模型与广告](docs/topics/17-llm-ads.md) | 定向、召回排序、创意、出价与增量 |
| 18 | [大模型与推荐](docs/topics/18-llm-recommendation.md) | 生成式召回、用户序列、冷启与反馈 |
| 19 | [大模型与增长](docs/topics/19-llm-growth.md) | 因果、uplift、LTV、实验与策略 |
| 20 | [大模型与营销](docs/topics/20-llm-marketing.md) | 受众、内容、触达、归因与合规 |
| 21 | [大模型与风控](docs/topics/21-llm-risk.md) | 欺诈、审核、代价阈值、漂移与人审 |
| 22 | [大模型与语音](docs/topics/22-llm-speech.md) | ASR、TTS、实时交互与打断 |
| 23 | [大模型与客服](docs/topics/23-llm-service.md) | 知识、多轮状态、工具执行、转人工与质检 |

## 最近更新

**2026-11-05：** [应用与LLM Infra扩充](docs/expansion-applications-infra-2026-11-05.md)，回补19篇面经、10份参考资料，增加细分方向索引；[当天较早的增量更新](docs/incremental-2026-11-05.md)另收录14篇。

此前更新：[11月2日](docs/incremental-2026-11-02.md) · [牛客与LeetCode](docs/nowcoder-leetcode-2026-10-23.md) · [其他平台](docs/platform-expansion-2026-10-23.md)。各方向的[收录情况](docs/coverage.md)单列一页，欢迎补缺。

## 来源

面经来自求职者公开发帖，公司、岗位和面试过程沿用原作者描述。只摘录少量问题并附链接，完整内容请看原帖。日期疑问、付费截断、仅搜索摘要可见等情况会在条目中注明。收录规则见[来源说明](docs/methodology.md)，论文和文档见[来源目录](docs/source-catalog.md)。

## 本地检索与验证

可以直接在GitHub阅读。需要本地检索时，`data/`中有JSON数据，`tools/`提供Python脚本，只用到标准库。

```sh
# 按关键词搜索题目或来源
python3 tools/search.py GRPO
python3 tools/search.py --interviews --year 2024
python3 tools/search.py --interviews --topic 06
python3 tools/search.py --interviews --company 字节跳动
python3 tools/search.py --interviews --platform 知乎
python3 tools/search.py --interviews --domain 搜索
python3 tools/search.py --interviews --specialty infra-kernel
python3 tools/search.py --interviews --specialty app-bi

# 更新导航和检查内容结构
python3 tools/build_indexes.py
python3 tools/validate.py
python3 tools/check_examples.py

# 运行显存、LoRA、DPO等小型计算示例
python3 tools/interview_math.py
```

## 补充与纠错

- 找到面经：[提交链接](https://github.com/Pyramiding/llm-interview-warehouse/issues/new?template=source.yml)，附上日期和岗位即可。
- 发现错误：[提交纠错](https://github.com/Pyramiding/llm-interview-warehouse/issues/new?template=correction.yml)，写明题目编号或页面位置。
- 直接修改：看[贡献说明](CONTRIBUTING.md)，更新源文件后生成索引并运行检查。

原创文字采用 CC BY 4.0，工具代码采用 MIT；第三方内容保留原许可与权利，详见[LICENSE.md](LICENSE.md)。
