# 临面复习：30个容易答错的结论

[返回首页](../../README.md) · [完整题解](../question-index.md)

以下是原创速查提纲。它们省略了完整推导，具体假设、引用与反例应回对应专题查看。

| 方向 | 结论一 | 结论二 |
|---|---|---|
| [01基础](../topics/01-transformer-and-math.md) | causal mask的不可见位置不能参与softmax；乘0与加负无穷不同 | LayerNorm/RMSNorm不保证样本服从正态分布 |
| [02预训练](../topics/02-pretraining-and-data.md) | 更多token不自动更好，质量、重复、配比与计算预算要共同考虑 | 测试集污染不仅是逐字重复，也可能来自解答、翻译和合成链路 |
| [03SFT](../topics/03-sft-and-peft.md) | prompt与padding是否计loss应与目标一致，不能只看训练loss下降 | LoRA减少可训练状态，不自动消除激活显存或灾难性遗忘 |
| [04对齐](../topics/04-alignment-and-rl.md) | PPO比率分母是行为策略old policy，不是reference policy | GRPO无需独立critic不等于无baseline；训练reward上涨不证明能力提升 |
| [05架构](../topics/05-architectures-moe-long-context.md) | MoE总参数、激活参数、实际FLOPs和延迟是不同量 | 长上下文可输入不等于能稳定利用，位置外推和检索能力需实测 |
| [06RAG](../topics/06-rag-and-retrieval.md) | 找到相关文档不等于检索到了充分证据，检索成功也不等于生成正确 | GraphRAG不是所有多跳题的默认最优方案，构建与更新成本要计入 |
| [07Agent](../topics/07-agents-and-tool-use.md) | 结构化工具调用提供接口形式，服务端仍须做授权和业务校验 | 多Agent可能增加协调成本与错误相关性，不保证比单Agent更好 |
| [08推理](../topics/08-inference-and-serving.md) | FlashAttention减少IO，不把密集attention变成线性时间 | 投机解码只有按目标分布正确接受/拒绝校正才保持分布 |
| [09并行](../topics/09-distributed-training.md) | 梯度累积改变有效batch和通信节奏，损失归约需保持目标一致 | ZeRO按阶段分片不同状态，不能直接等分整次训练峰值显存 |
| [10压缩](../topics/10-compression-and-distillation.md) | 4bit权重不等于端到端显存变成1/4，更不等于速度必然4倍 | 蒸馏既可能迁移能力也可能迁移错误，筛选与独立评测不能省 |
| [11推理能力](../topics/11-reasoning-and-test-time-compute.md) | 更长推理可能更贵且更错，应比较预算下的成功率 | pass@k与最终从k个候选里选出正确答案的能力不同 |
| [12多模态](../topics/12-multimodal.md) | 图文对齐、视觉grounding和端到端任务正确率不是同一指标 | 更高分辨率会增加token与成本，也可能受crop策略限制 |
| [13评测安全](../topics/13-evaluation-and-safety.md) | 强模型当裁判仍有位置、冗长、自偏好和指令干扰风险 | 拒答率不能单独衡量安全，误拒答、漏拒答和任务效用需联合评测 |
| [14代码具身](../topics/14-code-and-embodied-models.md) | 代码通过测试不等于语义与需求全部正确 | 语言或视频预测好不能直接推出可安全闭环控制机器人 |
| [15研究领域](../topics/15-domain-models-and-research.md) | 领域基准高分不能直接推出真实业务、临床或科学发现能力 | 消融要控制数据、计算和选择过程；最好的单次结果不能替代稳定证据 |

开口回答时给出限定条件，用具体例子说明，并解释你会怎样发现自己判断错了。
