# 2026-10-23 平台面经增补与核验记录

[返回首页](../README.md) · [按公司](interviews/by-company.md) · [按研究方向](interviews/by-topic.md) · [公司×业务方向](interviews/company-direction.md) · [补充资源](interviews/resources.md)

## 本轮增量

新增 **15 条公开自述面经、27 个分级阅读入口**。主表累计 **74 条自述面经、66 个补充入口**；23 个专题及 440 道原创题/练习的数量不变。单篇多公司复盘只计一条，转发追到原帖后合并。

| 平台 | 新公开自述 | 新汇编/解析/准备资料 | 仅元数据 | 另外保留的待核线索 |
|---|---:|---:|---:|---:|
| 知乎 | 5 | 7 | 0 | 见检索日志 |
| 微信公众号 | 0 | 0 | 7 | 发布者目录/公开转载给出的微信原链 |
| 小红书 | 0 | 0 | 0 | 5 条具体短链，原帖正文未取得 |
| 脉脉 | 3 | 6 | 0 | 猎头转述与第一人称自述分级 |
| 牛客（补足业务与技术方向） | 7 | 5 | 0 | 片段、付费截断逐条说明 |
| 其他公开索引 | 0 | 2 | 0 | 聚合归属与原帖证据分开 |

新增42条主来源中，25条取得相关正文（部分仍有付费截断）、10条只核对搜索片段、7条仅核对目录元数据。`opened`不证明候选人经历真实，也不代表原帖全部公开；它可以是已明确说明的同站公开英文视图。每条的实际证据见主表。

## 互联网公司与业务方向入口

| 公司/范围 | 本轮代表记录 | 可观察的技术内容与边界 |
|---|---|---|
| 字节：广告/搜推 | [INT101](interviews/README.md#int101)、[INT103](interviews/README.md#int103) | LLM冷启动、AUC、长尾数据、对比学习；广告中台对稀疏行为链、归一化、KV cache与FlashAttention的追问。 |
| 京东：广告 | [INT102](interviews/README.md#int102) | 广告业务面与大模型密文检索项目；仅搜索片段，不补写密文检索实现。 |
| 快手：推荐 | [INT105](interviews/README.md#int105) | LLM结合召回/精排、合成数据、人工/自动评测、离线/线上指标；转发页已追到RZ_Q原帖。 |
| 阿里淘天：搜推多模态 | [INT106](interviews/README.md#int106) | CLIP/BLIP、连接器、Qwen-VL、LoRA与偏好对齐，按原文部门说明归类；不能推出阿里统一题库。 |
| 拼多多：搜推多模态 | [INT109](interviews/README.md#int109) | 多模态岗位面试包含视觉项目、CLIP/MoCo、优化与编码；附录岗位说明和实际被问内容分开。 |
| 美团：智能客服 | [INT104](interviews/README.md#int104) | T5、BART、Sentence-BERT、ChatGPT与PEFT；不是一份客服Agent全链路设计题库。 |
| 多公司：语音 | [INT111](interviews/README.md#int111) | Whisper、VITS、声纹、语音预处理及RAG；语音岗位明确涉及贝壳找房/标贝，题目未逐公司对应，不将同篇其余公司的岗位都标为语音。 |
| 字节：风控项目技术 | [RES217](interviews/resources.md#res217) | 可见首段明确“风控归因Agent”，只标候选项目领域；对话体/付费内容保守列资源，不认定抖音电商团队就是风控组。 |
| 增长/营销邻接参考 | [RES201](interviews/resources.md#res201)、[RES202](interviews/resources.md#res202)、[RES203](interviews/resources.md#res203) | 支付宝AI营销、美团增长目标的技术型产品问法，以及快手发券营销聚合；均不计为新增增长/营销算法亲历。既有增长算法自述见[INT040](interviews/README.md#int040)。 |
| 其他大模型技术岗 | [INT107](interviews/README.md#int107)、[INT108](interviews/README.md#int108)、[INT110](interviews/README.md#int110)、[INT112](interviews/README.md#int112) | 通义模型/对齐/系统、持续更新的算法日记、MiniMax HPC/MLSys、小红书公司Agentic全栈；日期与证据强弱逐条保留。 |
| 脉脉公开自述 | [INT113](interviews/README.md#int113)、[INT114](interviews/README.md#int114)、[INT115](interviews/README.md#int115) | 快手第三轮、字节RAG、网易模型项目；其余猎头转述列RES222—RES227，不充亲历数量。 |

风控、语音、客服的补充阅读还包括[VoiceNexus项目准备](interviews/resources.md#res219)，没有公司归属；标题规模/性能数据未核实，不当作线上工程证据。

## 平台核验边界

- **知乎：** 若中文页不可读，采用同文章ID、知乎自己公开的英文视图核对可见正文。英文页也未读到时仅标`search_excerpt`；回译或按正文编目的中文标题已注明。编辑时间留在备注，无法确认的首次发布时间与面试时间用`null`。
- **微信公众号：** 7个原始直链来自发布者目录或公开转载的出处标注；本轮未取得微信正文，统一`metadata_only`。目录存在课程推广，因此只保留导航与限制，不能用标题推断实际面试流程。原文发布日期不使用目录日或转载日代填。
- **小红书：** 保留5条已经发现的完整短链、二手索引和实际观察到的跳转目标，但未取得可核对的原帖内容，均不进面经主表，也不从二手题单复制题目。详见[小红书/脉脉检索记录](research-20261023-xhs-maimai.md)。小红书公司的牛客面经不是小红书平台覆盖。
- **脉脉：** 获得9条相关公开正文；3条标题/叙述为自述，6条猎头或他人整理。身份、offer结果与经历均未向企业核实，不据发帖者的职业推断应聘岗位。
- **领域缺口：** 新增长/营销算法亲历仍不足；语音材料有多公司题目未逐题归属，风控有候选项目而非招聘业务证据。检索失败不表示平台没有相应内容。

## 分类与导航修正

业务方向改为人工审核的`domains`字段，不再扫描普通文本自动推断。“公开搜索片段”不再生成Meta×搜索，“从推荐转NLP”不再生成百度×推荐。空数组表示归属证据不足。多公司条目在交叉表单列，避免把文章某一段领域归给全部公司。

[按公司](interviews/by-company.md)、[按研究方向](interviews/by-topic.md)和[按业务方向](interviews/by-domain.md)同时提供自述与分级资源入口；新增[公司×业务方向交叉表](interviews/company-direction.md)及[资源详情](interviews/resources.md)。资源的公司是资料自述的归属，和独立核实过的亲历不同。

## 可复核记录

- [知乎与技术面检索说明](research-20261023-zhihu-wechat-a.md)；[对应查询日志](../data/research-20261023-zhihu-wechat-a.json)。
- [语音、风控、客服及其他技术检索日志](../data/research-20261023-zhihu-wechat-b.json)。
- [小红书与脉脉说明](research-20261023-xhs-maimai.md)；[42组检索/排除日志](../data/research-20261023-xhs-maimai.json)。
- [公众号原链与业务补充日志](../data/research-20261023-root.json)。

主表为[data/interviews.json](../data/interviews.json)与[data/resources.json](../data/resources.json)；检索日志只保留已合入ID与过程，不重复计数。生成与验证使用仓库现有工具；远端实际发布记录见[GitHub提交历史](https://github.com/Pyramiding/llm-interview-warehouse/commits/main/)。
