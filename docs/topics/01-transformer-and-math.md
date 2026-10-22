# Transformer、概率与训练数学

> 18 道原创延伸题；基于公开论文和官方文档设计，不代表任何公司的真实面试记录。核验截止：2026-10-22。难度分为基础 / 进阶 / 研究；公式、算例和排障步骤为本仓库独立整理。论文结果仅在原设定内成立。

## 使用建议

先用 2 分钟解释目标、张量形状和假设，再写公式；最后说明复杂度与验证方法。本节中的 `B,T,d,h,d_k` 依次为 batch、序列长度、隐藏维度、头数、单头维度；除特殊说明，省略 bias、dropout 和 batch 维。经典基础与 2023 年以来的实践衔接，近期结构详见 [架构、MoE 与长上下文](05-architectures-moe-long-context.md)。

<a id="f01"></a>

### F01. 从张量形状写出一次自注意力，为什么要除以平方根？

**难度 / 岗位：** 基础；算法、训练、推理。

**作答要点：** `X∈R^{T×d}`，投影得 `Q,K∈R^{T×d_k}`、`V∈R^{T×d_v}`；`S=QKᵀ/√d_k+M`，`O=softmax(S)V`，softmax 沿 key 位置归一化。若 q、k 分量近似独立、零均值、方差为 1，则内积方差为 `d_k`；缩放控制 logits 量级，避免初始 softmax 过于尖锐。这是有假设的方差分析，训练后不保证分量独立。原结构见 [Transformer](https://arxiv.org/abs/1706.03762)。

**深入追问：** `d_k=64` 时缩放系数是多少？答 `1/8`。Q、K 若已归一化，如何重新考虑温度？

**常见误区：** 把分母写成 `√T`；把 attention 权重当输出；遗漏 softmax 的轴。

<a id="f02"></a>

### F02. 自回归训练能并行，为何生成仍需逐 token？

**难度 / 岗位：** 基础；算法、应用。

**作答要点：** 联合概率分解为 `p(x₁:T)=∏ₜp(xₜ|x<t)`。训练使用已知真值前缀，所有位置的条件概率可在一次前向中计算；causal mask 阻止位置 t 访问未来。生成时下一个输入依赖刚采样的输出，形成序列依赖。KV cache 复用历史投影但没有解除该依赖。训练/推理前缀分布不同，是 exposure bias 的来源之一；它不等于“模型训练时偷看答案”。结构背景见 [Transformer](https://arxiv.org/abs/1706.03762)。

**深入追问：** 并行采样多个候选和并行生成一个候选的多个 token 有何区别？投机解码如何保持目标分布？

**常见误区：** 认为 causal mask 让训练也只能循环 T 次；认为 cache 保存的是最终答案。

<a id="f03"></a>

### F03. 多头注意力与一个宽头有什么区别？参数量怎样估算？

**难度 / 岗位：** 基础；算法、训练。

**作答要点：** 多头分别在子空间计算不同的归一化权重，再拼接并输出投影；它改变了计算结构，而非仅把矩阵切块。标准 MHA 在 `hd_k=d` 且 Q/K/V 同宽时，四个投影约有 `4d²` 参数，与头数无直接线性关系。增加 h、固定 d 会减小单头维度，不能推出表达能力必然提高。GQA 缩小 K/V 投影和缓存，改变了这个估算。参见 [Transformer](https://arxiv.org/abs/1706.03762)、[GQA](https://arxiv.org/abs/2305.13245)。

**深入追问：** `d=4096` 时四个无偏投影参数约 6711 万。哪些中间张量随 h 增长？

**常见误区：** 在固定 d 时把 MHA 参数量写成 `4hd²`；声称每个头必然学习某一种人类语言现象。

<a id="f04"></a>

### F04. 完整 attention 的时间、显存复杂度应如何拆分？

**难度 / 岗位：** 进阶；训练、推理、系统。

**作答要点：** 投影约 `O(Td²)`，QKᵀ 与 AV 约 `O(T²d)`；朴素实现显式保存的分数/概率约 `O(hT²)`。实际峰值还含激活、反向保存、模型和优化器状态。FlashAttention 通过分块与在线 softmax 减少 HBM 读写，不需把完整概率矩阵写入显存；精确 dense attention 的二次算术量仍然存在。见 [FlashAttention](https://arxiv.org/abs/2205.14135)。

**深入追问：** T 翻倍时只看 attention 矩阵内存增长 4 倍；为什么整个模型耗时可能不到 4 倍？

**常见误区：** 把 attention 的复杂度等同整层复杂度；把省内存说成把精确注意力计算变为线性。

<a id="f05"></a>

### F05. 手推稳定 softmax，以及 FlashAttention 的分块合并公式。

**难度 / 岗位：** 研究；算法、kernel、训练系统。

**作答要点：** 对一行 logits，减最大值不改变结果：`p_i=exp(s_i-m)/∑exp(s_j-m)`。处理两块时，已知各自 `m_a,l_a,u_a=∑exp(s_i-m_a)v_i` 与 `m_b,l_b,u_b`，令 `m=max(m_a,m_b)`，则 `l=e^(m_a-m)l_a+e^(m_b-m)l_b`，`u=e^(m_a-m)u_a+e^(m_b-m)u_b`，最终 `o=u/l`。该恒等式说明可以流式累积，反向再配合重算。参见 [FlashAttention](https://arxiv.org/abs/2205.14135)。

**深入追问：** 全行都被 mask 成负无穷时如何处理？混合精度下累积量用什么精度？

**常见误区：** 对每个块独立 softmax 后直接平均；认为浮点实现必须与朴素版本逐 bit 一致。

<a id="f06"></a>

### F06. LayerNorm、RMSNorm 和 BatchNorm 各沿哪个维度归一化？

**难度 / 岗位：** 基础；算法、训练。

**作答要点：** 对一个 token 的隐藏向量，LN 为 `(x-μ)/√(σ²+ε)·γ+β`；RMSNorm 为 `x/√(mean(x²)+ε)·γ`，通常不做均值中心化。BatchNorm 则按其布局对 batch 等轴统计。LN/RMSNorm 不依赖同 batch 中其他样本，适合长度变化与自回归推理。不能用“RMSNorm 等于不带 bias 的 LN”替代推导：二者连中心化也不同。见 [RMSNorm](https://arxiv.org/abs/1910.07467)、[BatchNorm](https://arxiv.org/abs/1502.03167)。

**深入追问：** 对 `[1,2,3]` 分别计算均值、RMS；将所有分量加常数后，哪种输出具有平移不变性？

**常见误区：** 把 LN 的统计轴当作序列长度；以为 RMSNorm 强制输出均值为 0。

<a id="f07"></a>

### F07. Pre-LN 和 Post-LN 的残差路径为何影响训练稳定性？

**难度 / 岗位：** 进阶；训练、研究。

**作答要点：** 简化写法为 Pre-LN：`y=x+F(LN(x))`；Post-LN：`y=LN(x+F(x))`。Pre-LN 的梯度包含一条显式恒等路径；Post-LN 的残差主路径仍经过归一化 Jacobian。初始化、深度和学习率会改变二者的稳定性与最终效果。公开分析支持在其设定中 Pre-LN 初始化梯度更良性，但不能推出所有 Pre-LN 模型都无需 warmup。见 [On Layer Normalization](https://arxiv.org/abs/2002.04745)。

**深入追问：** 最后一层是否再做归一化？若训练突然 NaN，如何分辨归一化、优化器和数据异常？

**常见误区：** 只背“前者稳定、后者效果好”，不给适用条件；把 residual 当成无条件避免梯度爆炸。

<a id="f08"></a>

### F08. SwiGLU 为什么有三个矩阵，隐藏宽度为什么常不同于普通 FFN？

**难度 / 岗位：** 进阶；算法、训练。

**作答要点：** 以行向量记，`FFN(x)=[SiLU(xW_g)⊙(xW_u)]W_d`，`SiLU(z)=zσ(z)`。其参数约 `3dm`；普通双矩阵 FFN 为 `2dm₀`。若普通宽度 `m₀=4d`，等参数的门控宽度约 `m=8d/3`，实际会按硬件与模型设计取整。门控是逐元素乘法，不是 sigmoid attention。参见 [GLU Variants](https://arxiv.org/abs/2002.05202)。

**深入追问：** 哪部分负责跨 token 信息交换？为什么实际宽度可能是 256 的倍数？

**常见误区：** 沿用 `4d` 宽度却声称三矩阵和二矩阵参数量一致；把 SiLU 与 GELU 视为同一函数。

<a id="f09"></a>

### F09. RoPE 如何把绝对位置转成相对位置信息？

**难度 / 岗位：** 进阶；算法、长上下文研究。

**作答要点：** 将 q、k 的通道按二维组旋转，位置 m 的旋转为 `R(m)`。利用旋转矩阵性质，`(R(m)q)ᵀ(R(n)k)=qᵀR(n-m)k`，点积显式依赖位置差。不同通道使用不同角频率。它通常作用于 Q/K，并不要求给 V 做相同旋转。数学上可计算更大位置，不等于模型对训练范围外位置仍保持质量。参见 [RoFormer](https://arxiv.org/abs/2104.09864)。

**深入追问：** 改变 RoPE base 与统一缩小位置索引有何不同？推理时重用 cache 为什么必须保持位置约定一致？

**常见误区：** 说 RoPE 完全不包含绝对位置；把相对位置性质当成无限长度泛化证明。

<a id="f10"></a>

### F10. 交叉熵的梯度如何推导？为什么不能先 softmax 再传给 CrossEntropyLoss？

**难度 / 岗位：** 基础；算法、训练。

**作答要点：** 单样本 `L=-z_y+log∑exp(z_j)`，故 `∂L/∂z_j=p_j-1[j=y]`。该梯度同时提高目标 logit、压低非目标 logit。常用框架的交叉熵直接接收未归一化 logits，内部实现稳定 log-softmax；先 softmax 会把概率再次当 logits，改变目标。详见 [PyTorch CrossEntropyLoss](https://docs.pytorch.org/docs/2.14/generated/torch.nn.CrossEntropyLoss.html)。

**深入追问：** logits `[0,0]`、标签 0 时，损失 `ln2`，梯度 `[-0.5,0.5]`。ignore_index 会影响哪些位置？

**常见误区：** 对 target 类别编号做求导；认为交叉熵只有目标位置有梯度。

<a id="f11"></a>

### F11. 困惑度如何计算？能否用它比较不同 tokenizer？

**难度 / 岗位：** 基础；预训练、评测。

**作答要点：** 同一 token 化和评估协议下，`PPL=exp((1/N)∑ₜ−log p(xₜ|x<t))`。若平均 NLL 为 `ln4`，PPL 为 4。不同 tokenizer 会改变单位、序列长度与条件分解，token 级 PPL 不可直接横比；可补充每字节负对数似然、下游任务和相同文本上的总似然。padding、窗口切分、是否计入首 token 都应写清。损失定义见 [CrossEntropyLoss](https://docs.pytorch.org/docs/2.14/generated/torch.nn.CrossEntropyLoss.html)。

**深入追问：** 文本 A 有 100 个 token、平均 NLL=1，文本 B 有 900 个 token、平均 NLL=3，总体平均 NLL 为 2.8、PPL 约 16.44；不能平均两个 PPL。

**常见误区：** 将不同 tokenizer 的 PPL 直接排序；把低 PPL 等同于更会遵循指令。

<a id="f12"></a>

### F12. KL 散度的两个方向分别偏好什么？

**难度 / 岗位：** 进阶；对齐、蒸馏。

**作答要点：** `KL(p||q)=E_p[log p−log q]`，离散分布下非负但不对称。若教师是 p、学生是 q，前向 KL 对教师概率覆盖区域漏掉质量惩罚大；反向 KL 在多峰设定下可能偏向集中某一模式。这是常见优化倾向，不是所有参数化模型的保证。RLHF 中通常对当前策略到参考策略加 KL，回答时须写明分布和采样测度。背景见 [InstructGPT](https://arxiv.org/abs/2203.02155)。

**深入追问：** 为什么 token 上的 `logπ−logπ_ref` 单次值可为负，而期望 KL 非负？何时用精确词表 KL？

**常见误区：** 把一个采样 log-ratio 当作永远非负；把 KL 当距离度量。

<a id="f13"></a>

### F13. 温度、top-k、top-p 怎样改变采样分布？

**难度 / 岗位：** 基础；算法、应用、推理。

**作答要点：** 温度 `τ>0` 下 `p_i∝exp(z_i/τ)`；减小温度使分布尖锐，但并不自动提高事实正确率。top-k 保留固定数量候选；top-p 保留按概率降序累积质量达到阈值的集合，随后重归一化。变换顺序影响结果，应记录框架实现。`τ→0` 的极限与 greedy 相关，实际接口对 `temperature=0` 的处理另查实现。模型采样设定实例可参考 [Llama 2](https://arxiv.org/abs/2307.09288)。

**深入追问：** 概率 `[0.6,0.25,0.15]`、top-p=0.8 保留哪些项？答前两项并归一化为约 `[0.706,0.294]`。

**常见误区：** 以为 top-p=0.9 固定保留 90% 的词；将随机种子一致当作跨硬件逐 bit 可复现保证。

<a id="f14"></a>

### F14. AdamW 与 Adam 加 L2 正则有什么区别？

**难度 / 岗位：** 进阶；训练。

**作答要点：** Adam 对一、二阶梯度矩做自适应缩放；把 L2 项加入梯度会让惩罚也参与矩估计与逐维缩放。AdamW 将 weight decay 与该过程解耦，简化写作 `θ←(1−ηλ)θ−ηm̂/(√v̂+ε)`。bias/归一化参数是否 decay 属于配方选择；不能把所有参数统一处理后声称是理论要求。官方定义见 [PyTorch AdamW](https://docs.pytorch.org/docs/2.14/generated/torch.optim.AdamW.html)。

**深入追问：** 为什么梯度裁剪一般在反向后、更新前？梯度累计时应按什么时机裁剪？

**常见误区：** 认为自适应优化器下 L2 与 weight decay 总等价；忘记混合精度 unscale 后再裁剪。

<a id="f15"></a>

### F15. 梯度累计与大 batch 何时等价，何时不等价？

**难度 / 岗位：** 进阶；训练、系统。

**作答要点：** 若模型无跨 microbatch 统计，样本损失权重一致，期间不更新参数，则累计梯度可与一次大 batch 的梯度对应。不同长度的语言样本应按有效 target token 总数归一化，简单平均各 microbatch 的 mean loss 会过度放大短 batch。dropout、浮点加法次序和动态 loss scaling 会造成差异；每个 microstep 更新优化器则已不是同一过程。归一化语义参见 [CrossEntropyLoss](https://docs.pytorch.org/docs/2.14/generated/torch.nn.CrossEntropyLoss.html)。

**深入追问：** 两批分别有 10、90 个有效 token，如何加权？答各 loss sum 相加后除以 100。

**常见误区：** 只按样本个数算 batch；累计 k 步却没有处理 loss 的缩放。

<a id="f16"></a>

### F16. BF16、FP16 的差别会如何影响数值稳定性？

**难度 / 岗位：** 进阶；训练、推理。

**作答要点：** 两者均占 16 位并有 1 个符号位；BF16 为 8 位指数、7 位显式尾数，动态范围接近 FP32；FP16 为 5 位指数、10 位显式尾数，范围较小。权重、激活、矩阵累加、归一化和优化器状态不必同精度。排查 NaN 时检查输入、attention mask、softmax、梯度范数和优化器状态；降低学习率之前先定位第一个非有限张量。低精度训练案例参见 [DeepSeek-V3](https://arxiv.org/abs/2412.19437)。

**深入追问：** loss scaling 为什么主要缓解 FP16 小梯度下溢，不能修复无效的全 mask softmax？

**常见误区：** 把 BF16 说成比 FP16 所有数都更精确；认为用 FP8 训练就代表优化器状态也都是 8 位。

<a id="f17"></a>

### F17. 给定配置，怎样估算 dense decoder 参数量？

**难度 / 岗位：** 进阶；算法、训练、系统。

**作答要点：** 忽略 norm/bias，对 L 层 MHA+普通宽度 `m=4d` FFN，每层约 `4d²+8d²=12d²`；embedding 约 `Vd`。若输出头不共享再加 `Vd`；GQA、门控 FFN 或 MoE 需另算。例 `L=32,d=4096,V=32000` 且共享 embedding，约 `32×12×4096²+32000×4096≈6.574B`。这是所设玩具结构估算，不是任一真实 7B 模型的精确计数。真实架构对照见 [Llama 3](https://arxiv.org/abs/2407.21783)。

**深入追问：** 输入/输出权重共享在参数、梯度和存储上怎样体现？为什么换 tokenizer 会改变参数量？

**常见误区：** 看到“7B”就认为所有模型具有相同层数和宽度；忘记 vocab embedding。

<a id="f18"></a>

### F18. 如何证明一个 attention 实现是正确的？

**难度 / 岗位：** 进阶；算法、kernel、训练系统。

**作答要点：** 先构造小尺寸 FP64/FP32 参考，实现无 mask、causal、padding、变长等情形；核对输出与 Q/K/V 梯度，并设置与 dtype 相符的容差。单独测试全 mask 行、极大 logits、非连续张量和 GQA 的头映射。再做因果性测试：改动未来 token，过去位置输出不应改变。最后才测吞吐、显存和长序列；性能正确不能替代数值正确。精确 attention 与计算重排背景见 [FlashAttention](https://arxiv.org/abs/2205.14135)。

**深入追问：** 为什么 dropout 打开时必须控制随机数语义才能比较？前向接近是否能保证反向正确？

**常见误区：** 只用随机样本看 loss 会下降；要求不同融合 kernel 逐 bit 相同。

## 一手来源索引

日期为论文首次提交日期；官方文档未标发布日期时记为未知。均在 2026-10-22 打开核验。

| 来源 | 日期 | 用途 |
|---|---|---|
| [Attention Is All You Need](https://arxiv.org/abs/1706.03762) | 2017-06-12 | 注意力与 Transformer 起点 |
| [On Layer Normalization](https://arxiv.org/abs/2002.04745) | 2020-02-12 | 归一化位置 |
| [RMSNorm](https://arxiv.org/abs/1910.07467) | 2019-10-16 | 均方根归一化 |
| [Batch Normalization](https://arxiv.org/abs/1502.03167) | 2015-02-11 | 统计轴对照 |
| [GLU Variants](https://arxiv.org/abs/2002.05202) | 2020-02-12 | 门控 FFN |
| [RoFormer](https://arxiv.org/abs/2104.09864) | 2021-04-20 | 旋转位置编码 |
| [FlashAttention](https://arxiv.org/abs/2205.14135) | 2022-05-27 | IO 与精确注意力 |
| [GQA](https://arxiv.org/abs/2305.13245) | 2023-05-22 | 共享 KV 头 |
| [InstructGPT](https://arxiv.org/abs/2203.02155) | 2022-03-04 | KL 正则应用背景 |
| [Llama 2](https://arxiv.org/abs/2307.09288) | 2023-07-18 | 解码与训练实例 |
| [Llama 3](https://arxiv.org/abs/2407.21783) | 2024-07-31 | 实际架构对照 |
| [DeepSeek-V3](https://arxiv.org/abs/2412.19437) | 2024-12-27 | 低精度训练实例 |
| [CrossEntropyLoss](https://docs.pytorch.org/docs/2.14/generated/torch.nn.CrossEntropyLoss.html) | 未知 | 损失与归一化语义 |
| [AdamW](https://docs.pytorch.org/docs/2.14/generated/torch.optim.AdamW.html) | 未知 | 优化器定义 |
