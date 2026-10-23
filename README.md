# llm-interview-warehouse

**按研究方向分类的中文大模型面经与题解仓库。** 从公开面经找问法，从一手论文和官方文档校正答案，再用项目、手写和估算练习验证理解。

最近增补：**2026-10-23**。面经重点覆盖**2023—2026年**，必要基础文献追溯到更早年份；各来源实际查阅日逐条保留。

<!-- STATS:START -->
**106篇公开面经 · 23个专题 · 414道专题题解 + 26道项目/手写练习 · 362个去重来源链接**

另附73个补充阅读入口（含仅元数据项）；研究来源包含183个规范化链接。题目数不含追问；来源数按链接归一化，并非独立论文或企业真题数量。
<!-- STATS:END -->

## 从这里开始

- **按目标公司准备：** [按公司查面经（跨公司导航）](docs/interviews/by-company.md)
- **按公司与业务交叉查：** [公司×搜广推、增长、营销、风控、语音、客服](docs/interviews/company-direction.md)
- **按资料范围筛选：** [来源平台](docs/interviews/by-platform.md) · [岗位](docs/interviews/by-role.md) · [年份](docs/interviews/by-year.md) · [业务领域](docs/interviews/by-domain.md)
- **牛客与 LeetCode：** [牛客面经](docs/interviews/by-platform.md#platform-nowcoder) · [LeetCode中文站](docs/interviews/by-platform.md#platform-leetcode-cn) · [LeetCode国际站](docs/interviews/by-platform.md#platform-leetcode-global)
- **先看实际问法：** [公开面经索引](docs/interviews/README.md) · [按研究方向找面经](docs/interviews/by-topic.md) · [按公司找面经](docs/interviews/by-company.md)
- **补充汇编与解析：** [分级阅读入口](docs/interviews/resources.md)（含公众号原链与仅元数据项，不计亲历）
- **本轮更新：** [牛客与LeetCode增补记录](docs/nowcoder-leetcode-2026-10-23.md) · [知乎/微信/小红书/脉脉增补记录](docs/platform-expansion-2026-10-23.md) · [前一轮扩充记录](docs/cloud-expansion-report.md)
- **系统查漏补缺：** [全部题目与稳定ID](docs/question-index.md) · [来源目录](docs/source-catalog.md) · [覆盖范围与缺口](docs/coverage.md)
- **开始练习：** [岗位路线与7/30天计划](docs/preparation/learning-paths.md) · [项目深挖与系统设计](docs/preparation/projects-and-system-design.md) · [手写题与定量估算](docs/preparation/coding-and-estimation.md)
- **临面复习：** [30个易错结论](docs/preparation/quick-reference.md) · [收集与核验方法](docs/methodology.md)

## 研究、工程与应用专题

专题题解均为**原创研究延伸题**，每题包含难度/岗位、作答要点、追问与误区。它们与具体企业之间没有未经证实的“真题”对应关系。

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

## 面经怎么读

以下入口都汇总多家公司的面经，可按年份、研究方向或公司查找：

| 入口 | 页面包含什么 | 适合怎么查 |
|---|---|---|
| [全部公开面经合集（跨公司，重点2023—2026）](docs/interviews/README.md) | 按资料年份整理的完整索引，包含字节、阿里、腾讯、美团、滴滴等多家公司及多公司求职复盘 | 按年份浏览，再进入具体记录或原帖 |
| [按研究方向查面经（研究与应用，跨公司）](docs/interviews/by-topic.md) | 按预训练、微调、对齐、RAG、Agent、推理、多模态等方向汇总各公司的相关记录 | 围绕目标岗位或技术方向准备 |
| [按公司查面经（多公司导航）](docs/interviews/by-company.md) | 汇总全部记录中的公司名称及对应面经，一篇涉及多家公司的复盘保留为同一条记录 | 先选目标公司，再查看相关年份、岗位与考点 |

进入索引后，每条记录都提供原始链接、日期、作者自述的企业/岗位、方向、短摘要、阅读建议、核验状态与限制。点击记录标题可继续阅读面经原文。

**来源边界：** 面经是求职者公开自述，未向企业独立核实；本仓库不声称拥有企业官方题库。`opened`表示已获取相关页面内容；`search_excerpt`表示仅核对搜索可见片段。付费/登录限制、推广和日期冲突在条目中注明。完整说明见[来源规范](docs/methodology.md)。

## 如何组织一段面试回答

先给结论与适用条件，再解释机制或公式，接着给实现/实验与量化证据，最后说失败条件和替代方案。例如显存题应先区分推理或训练、模型架构、精度、batch、长度、并行方式，再计算权重、状态、KV、激活和额外开销。

不要把“用过某框架”当成方案原理；不要只报最好的一次分数；不要把训练reward、检索相似度或LLM裁判分数直接当业务成功率。答不确定的点时说明假设，并给出可验证办法。

## 本地检索与验证

纯Markdown可直接在GitHub阅读，不需要API密钥或GPU。`data/`提供JSON，方便筛选岗位、年份和主题；`tools/`只依赖Python标准库。

```sh
# 按关键词搜索题目或来源
python3 tools/search.py GRPO
python3 tools/search.py --interviews --year 2024
python3 tools/search.py --interviews --topic 06
python3 tools/search.py --interviews --company 字节跳动
python3 tools/search.py --interviews --platform 知乎
python3 tools/search.py --interviews --domain 搜索

# 更新导航和检查内容结构
python3 tools/build_indexes.py
python3 tools/validate.py
python3 tools/check_examples.py

# 运行显存、LoRA、DPO等小型计算示例
python3 tools/interview_math.py
```

## 贡献与授权

欢迎带原始链接补充面经、纠正公式或提交可复现实验，步骤见[CONTRIBUTING.md](CONTRIBUTING.md)。原创文字采用CC BY 4.0，工具代码采用MIT；第三方内容保留原许可与权利，详见[LICENSE.md](LICENSE.md)。
