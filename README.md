# llm-interview--warehouse

**按研究方向分类的中文大模型面经与题解仓库。** 从公开面经找问法，从一手论文和官方文档校正答案，再用项目、手写和估算练习验证理解。

资料查阅截止：**2026-10-22**。面经重点覆盖**2023—2026年**，必要基础文献追溯到更早年份。

<!-- STATS:START -->
**30篇公开面经 · 15个专题 · 270道专题题解 + 26道项目/手写练习 · 198个去重来源链接**

另附10个补充阅读入口；研究来源包含158个规范化链接。题目数不含追问；来源数按链接归一化，并非独立论文或企业真题数量。
<!-- STATS:END -->

## 从这里开始

- **先看实际问法：** [公开面经索引](docs/interviews/README.md) · [按研究方向找面经](docs/interviews/by-topic.md) · [按公司找面经](docs/interviews/by-company.md)
- **系统查漏补缺：** [全部题目与稳定ID](docs/question-index.md) · [来源目录](docs/source-catalog.md) · [覆盖范围与缺口](docs/coverage.md)
- **开始练习：** [岗位路线与7/30天计划](docs/preparation/learning-paths.md) · [项目深挖与系统设计](docs/preparation/projects-and-system-design.md) · [手写题与定量估算](docs/preparation/coding-and-estimation.md)
- **临面复习：** [30个易错结论](docs/preparation/quick-reference.md) · [收集与核验方法](docs/methodology.md)

## 15个研究与工程方向

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

## 面经怎么读

每条记录包含原始链接、日期、作者自述的企业/岗位、方向、短摘要、阅读建议、核验状态与限制。推荐先读以下不同类型的样本，再进入专题：

| 类型 | 入口 | 适合观察什么 |
|---|---|---|
| 2023应用项目 | [理想+大模型面经](docs/interviews/README.md#int001) | 数据、模型、指标、推理、上线如何串成一条链 |
| 2024多公司算法 | [NLP与大模型春招记录](docs/interviews/README.md#int006) | 架构、PEFT、显存、并行和手写题交叉追问 |
| 2024对齐与评测 | [滴滴大模型一面](docs/interviews/README.md#int014) | 奖励模型、DPO、benchmark和推理能力 |
| 2025平台工程 | [阿里云AI平台研发](docs/interviews/README.md#int016) | RAG与搜索、后端、数据规模及系统选型 |
| 2025多模态 | [字节/腾讯/小红书复盘](docs/interviews/README.md#int017) | 论文、项目、视觉语言连接和场景设计 |
| 2025应用社招 | [大模型应用开发（5年经验）](docs/interviews/README.md#int021) | Agent框架、工具协议、项目效果与工程基础 |
| 2026Agent评测 | [字节260901一面](docs/interviews/README.md#int026) | 回归、线上反馈、长程轨迹与框架选型 |

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

# 更新导航和检查内容结构
python3 tools/build_indexes.py
python3 tools/validate.py
python3 tools/check_examples.py

# 运行显存、LoRA、DPO等小型计算示例
python3 tools/interview_math.py
```

## 贡献与授权

欢迎带原始链接补充面经、纠正公式或提交可复现实验，步骤见[CONTRIBUTING.md](CONTRIBUTING.md)。原创文字采用CC BY 4.0，工具代码采用MIT；第三方内容保留原许可与权利，详见[LICENSE.md](LICENSE.md)。
