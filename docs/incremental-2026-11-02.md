# 2026-11-02 增量更新：上次资料提交之后的新面经

[返回首页](../README.md) · [按公司](interviews/by-company.md) · [按方向](interviews/by-topic.md) · [公司×业务](interviews/company-direction.md) · [采集与排除日志](../data/research-20261102-incremental.json)

本轮新增 **22篇公开面经、6个分级阅读入口、106条改写的重点问法**。仓库累计 **128篇面经、79个补充入口、23个专题、440道原创题解与练习**。重点问法用于观察原帖的提问方式，不混入原创题解计数。

## 时间窗口与“新增”的口径

- **起点：** 上次资料提交 [d05e6ab](https://github.com/Pyramiding/llm-interview-warehouse/commit/d05e6ab01ac7726b535ee2ae791e3d739b3e784b)，即 **2026-10-23 10:50:38（Asia/Shanghai）**。
- **终点：** 2026-11-02本轮查阅时。不是承诺覆盖这一天尚未发生的后续发布。
- **纳入条件：** 可以核对首次发布晚于起点，且有相关技术面经内容。页面编辑、搜索收录或评论变新，不能替代首次发布时间。
- **配置提交：** 本轮从仓库最新提交`4602e68`继续，保留11月2日新增的运行检查配置；配置提交不改变面经采集起点。

牛客原帖的公开HTML提供了帖子`createTime`、动态`createdAt`及`editTime`。本轮分别保存为`published_at`和`updated_at`，带时区；没有用帖子ID或推荐列表日期反推首发时间。普通页面偶尔只返回空壳时，只采用已经取得的可读范围，不绕过登录或付费限制。

**新发布不等于刚面完。** 例如网易一面发生于10月16日、10月26日才发布；字节Seed/飞书复盘包含10月19日与28日两轮；拼多多Infra只说“一个月前”，精确面试日期留空。这些都在各条记录中说明。

## 新增面经入口

| 公司/岗位 | 新条目 | 本轮值得观察的问题 |
|---|---|---|
| 字节：搜广推/广告/推荐大模型 | [生成式召回](interviews/README.md#int310) · [广告算法](interviews/README.md#int318) · [推荐大模型一二面](interviews/README.md#int322) | SID与RQ-VAE、负样本与AUC、DPO、MoE路由/负载均衡、消融与在线收益。 |
| 快手：广告算法 | [一二面复盘](interviews/README.md#int304) | 广告精排中的语义ID、排序损失、SFT/GRPO和AI Coding。 |
| 字节：应用与后端 | [AI全栈](interviews/README.md#int311) · [算法实习](interviews/README.md#int313) · [Seed/飞书](interviews/README.md#int315) · [RAG项目面](interviews/README.md#int320) | 指标口径、AI代码回归、后训练、限流器排错、RAG和模型接口。 |
| 腾讯WXG | [后端日常实习](interviews/README.md#int321) | 模型调用成功但未入库、租约与防重、会话恢复、Coding Agent压缩和记忆。 |
| 网易云音乐 | [Agent全栈一面](interviews/README.md#int305) · [项目深挖二面](interviews/README.md#int308) | Agent运行链路、Harness/Hook/MCP、高召回噪声、循环边界、SDD与AI效率。 |
| 视源股份/CVTE | [应用开发一面](interviews/README.md#int302) · [数据处理Agent](interviews/README.md#int303) | 模型升级回归、多工具并行、LangGraph状态与子图、持久化和恢复。 |
| 水滴 | [AI全栈一二面](interviews/README.md#int301) | 后端并发、幂等、流式会话恢复、热点知识更新、Agent结果评估。 |
| 蚂蚁集团 | [智能体一面](interviews/README.md#int314) | MCP Client/Server发现过程、Skill上下文、少量数据是否需要向量库、图谱与RAG。 |
| 百度 | [后端Agent](interviews/README.md#int317) | 长期记忆写入、衰减、画像偏好变化与用户确认成本。 |
| 拼多多 | [AI Infra](interviews/README.md#int312) · [Agent/模型网关项目面](interviews/README.md#int316) | Bank Conflict、性能排查、SSE、多实例鉴权、降级、工具越权。 |
| 得物 | [MLOps与Agent](interviews/README.md#int319) | JSON结构化输出、有效数据、模型判定与脚本验证、LLM代码Review上线风险。 |
| 科大讯飞 | [星火推理工程部](interviews/README.md#int306) | 异构算力、推理瓶颈、vLLM/SGLang、GPU池化和扩缩容。 |
| 长鑫存储 | [Agent开发一面](interviews/README.md#int307) | 单多Agent、记忆、ReAct、MCP/Skill、Query Rewrite与RAG时延。 |
| 后摩/腾讯/地平线/字节/阿里 | [同一候选人的五场复盘](interviews/README.md#int309) | 量化数值格式、在线Softmax、CUDA执行、分级存储与参数服务器；逐题归属以原帖分段为准。 |

每条新面经均有原链、作者、首发日、独立的面试时间、岗位、方向、摘要、阅读建议及少量问题改写。公司和业务标签依据原文；不把过去实习公司当招聘方，不因音乐/保险等公司业务自动贴语音或风控标签。

## 同源合并与资料分级

本轮保存了 **6个同源入口关联**，没有把它们算成6篇新面经：

- 快手广告、字节广告、字节推荐大模型分别出现两个账号近同时发布的同文，按内容比对合并；不推定账号背后是否同一个人。
- 字节生成式召回与强化学习题单各有近同文入口，合并记录。
- 讯飞Infra同一作者相隔4分钟发布短版和扩写版，按一场记录处理。

已知入口放入主记录`alternate_urls`，用于后续更新去重；正文只保存指纹，不整篇复制。不同平台、不同作者的真实性仍未向企业独立核实。

另外6个入口放在[补充阅读](interviews/resources.md)，分别是[快手客户端邻接阅读](interviews/resources.md#res401)、[百度多轮解析](interviews/resources.md#res402)、[阿里一面问答](interviews/resources.md#res403)、[阿里二面问答](interviews/resources.md#res404)、[字节备考题单](interviews/resources.md#res405)和[腾讯备考清单](interviews/resources.md#res406)。解析或准备材料不计为已发生的独立面试；可读内容截断的位置不补写。

## 平台覆盖与本轮缺口

本轮新纳入的可确认来源均来自牛客。也检索了知乎、微信公众号、小红书、脉脉、LeetCode中文和国际站，但未取得同时满足**窗口内首发、正文可核对、技术面经范围**的新原帖；命中的旧面经、招聘信息、机器人主持的行为面和普通后端材料没有拿来充数。

这表示本轮检索和可访问范围的限制，不表示其他平台没有新面经。语音、客服、风控、用户增长和营销等领域也没有足够新证据，原有专题与资料继续保留，不为每个方向强行补一条。

## 检查与维护

同步更新公司、技术方向、业务、平台、岗位和年份导航。新增首发时间、同源入口、内容指纹与问题摘录的结构校验；原有440道原创题解和练习保持原计数。

11月2日新增的通用运行配置原先在`pytest`步骤因“没有收集到测试”退出5。保留工作流并改为仓库已有的结构/链接校验、数值示例检查和索引生成一致性检查，避免空测试导致失败。

外部访问状态、可读范围与作者自述的边界仍逐条保留。结构校验通过不等于面经真实性或所有附带技术答案均已获证实。
