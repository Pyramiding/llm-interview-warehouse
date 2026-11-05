# 2026-11-05 增量更新：11月2日资料提交后的新面经

[返回首页](../README.md) · [按公司](interviews/by-company.md) · [按方向](interviews/by-topic.md) · [公司×业务](interviews/company-direction.md) · [检索与排除日志](../data/research-20261105-incremental.json)

本轮新增 **14篇公开自述面经、7个分级阅读入口、68条改写的重点问法**。累计 **142篇面经、86个补充入口、23个专题、440道原创题解与练习**。一篇多轮复盘按一条记录；同一作者分篇写的一二面分别保留，但不解释为不同候选人或独立求职样本。重点问法不计入原创题解数量。

## 本轮时间范围

- **起点：** 上次面经资料提交 [b41bf23](https://github.com/Pyramiding/llm-interview-warehouse/commit/b41bf234e2776ad009838930078b108df0c8e354)，即 **2026-11-02 11:05:47（Asia/Shanghai）**。
- **基线：** 从11月3日的 [02b0f66](https://github.com/Pyramiding/llm-interview-warehouse/commit/02b0f66350ed84ffaa76e34c70fa00f817fa0896) 继续，保留首页导航、贡献说明和纠错表单。该次只改使用入口，不改变资料采集起点。
- **终点：** 11月5日本轮查阅时，不表示已经覆盖当天后续发布的内容。
- **规则：** 原页首次发布时间必须晚于起点。编辑、搜索收录和评论更新不作为“新增”证据。

牛客公开页面中的`createTime`或`createdAt`用于确认首发，`editTime`另行保留；新记录均有带时区的时间及正文指纹。页面临时返回空壳时不根据标题补题，不读取登录或付费范围之外的内容。

**新发布不代表新面试。** 字节AI全栈复盘的技术面在10月26—27日；百度一面发生于11月1日；讯飞11月4日新发的是9月技术面与HR面复盘，VP面仍在等待。未明示实际面试日的条目留空。

## 按公司与业务浏览新增内容

| 公司/方向 | 本轮入口 | 可重点准备什么 |
|---|---|---|
| 快手 · OneRec / 推荐与广告 | [INT404：一二面](interviews/README.md#int404) | 生成式召回、SID层级简化、长序列、DPO/PPO/GRPO、广告指标与业务闭环。 |
| 字节 · 搜索 / 图片检索 / AI全栈 | [INT401：技术面与HR复盘](interviews/README.md#int401) | Embedding选型、向量存储、LangGraph、执行中追加指令、Harness防循环、搜索联想与树形组件。 |
| 字节 · 后端Agent / 营销 | [INT408：一面](interviews/README.md#int408) · [INT412：二面](interviews/README.md#int412) | 记忆、Skill装载、幻觉、RAG、检索聚类、TTL LRU；营销场景下Agent与Workflow的选择。 |
| 字节 · 基础模型算法 | [INT402：三面公开部分](interviews/README.md#int402) · [RES502：相关解析](interviews/resources.md#res502) | 复杂度、KV显存、位置外推、混合精度、收益归因；解析另涉及训练尖刺与后训练问题。 |
| 阿里 · 千问社招 | [INT403：Agent一面](interviews/README.md#int403) | Neo4j与执行图、本体建模、实体消歧、工具反馈、自恢复、结构化状态与Trace。 |
| 阿里 · Token Foundry / 千问海外测开 | [INT409：11月3日一面](interviews/README.md#int409) | 测试知识库、生成用例质量、自动评价、分布式压测与执行机掉线。 |
| 快手 · 可灵 / Harness | [INT405：一面回忆](interviews/README.md#int405) | 项目调研、模块职责、具体失败案例与AI协作；原文只记部分问题。 |
| 百度 · Agent与后端 | [INT406：项目与后端一面](interviews/README.md#int406) · [INT407：实习二面](interviews/README.md#int407) · [INT413：代码生成项目一面](interviews/README.md#int413) | MCP接口、Skill、评估、追加指令、知识片段反馈、补丁审批与版本、代码编译预览、协作失败恢复。 |
| 得物 · Agent自动评测 | [INT410：11月3日三面](interviews/README.md#int410) | 自进化系统评测数据、AI Native平台改造、自动评测及消息与缓存基础。 |
| 科大讯飞 · RAG与翻译工具 | [INT411：秋招复盘](interviews/README.md#int411) | 术语校对、混合检索、GraphRAG、模型网关、文档质量、项目收益及AI代码验收。 |
| 小红书 · 端侧推理 | [INT414：一面](interviews/README.md#int414) | 内存峰值、低比特硬件适配、功耗、端云协同、机型矩阵、per-channel量化。 |

营销标签依据字节二面反问中的明确团队工作说明，不能当成候选项目的已实现收益；推荐与广告标签依据OneRec原帖的具体问题。没有把优惠券后端题自动算作LLM增长应用，也没有因讯飞公司或推拉流工具自动贴语音标签。

## 补充入口与归属核查

| 条目 | 类型及阅读边界 |
|---|---|
| [RES501：字节Agent二面题单](interviews/resources.md#res501) | 作者明确写备考，规划、记忆与检索可用于练习，不认定已参加字节二面。 |
| [RES502：字节三面问答解析](interviews/resources.md#res502) | 与INT402为同一作者连续发布的三面文章，部分题重合、时长口径不同；未额外认定独立场次。原文数字与代码需另行验证。 |
| [RES503：RAG与知识库汇编](interviews/resources.md#res503) | 综合作者经历、其他面经和题库；缺少逐条样本原链，文中频次不作为仓库统计。 |
| [RES504：阿里国际AI应用题单](interviews/resources.md#res504) | 明确是个人备考，参考消息可靠性和RAG排障，不计亲历。 |
| [RES505：美团客服Agent题单](interviews/resources.md#res505) | 参考订单查询、改地址、权限确认与SFT/DPO评测；公司来自标题，正文未证明已面试。 |
| [RES506：拼多多Agent题单](interviews/resources.md#res506) | 参考检索故障、会议记忆、多Agent交接和LRU，正文为准备清单。 |
| [RES507：小红书PE AI与全栈题单](interviews/resources.md#res507) | 与同作者较早的[INT308网易云音乐二面](interviews/README.md#int308)的20项问题序列高度重合，但公司、日期与轮次不同；暂不增加独立亲历计数。 |

最后一组原帖差异已双向注明。现有证据不能区分复用题目、整理复用或归属有误，因此保留原作者的两种表述，不替作者改判公司。`related_interview_id`表示有关联，不能独自证明是同一场面试或同源转载。

## 平台覆盖与本轮缺口

本轮确认的新增原帖均来自**牛客**。面栈等汇编仅用作发现线索，已追溯到牛客原文，不把汇编和原帖重复计算。

同时检索了知乎、微信公众号、小红书平台、脉脉、LeetCode中文和国际站、其他GitHub仓库；本轮没有取得同时满足**窗口内首发、技术范围与正文可核对**的新面经。搜索命中的旧面经、招聘、新闻、准备题单均按实际性质处理。这个限制不代表其他平台没有新帖。

**小红书公司面经来自牛客，不等于补到了小红书平台原帖。** 本轮客服新增的是分级备考资料；语音、风控、用户增长没有足够新证据增补亲历，原有内容继续保留。

## 检查与维护

已刷新公司、方向、业务、平台、岗位、年份和公司×业务索引及去重来源目录；新面经展示首发/编辑时间与公开作者，便于后续去重。原有440道原创题解与练习不因摘录问法而增加。

检查包含记录结构、首发时间、重复URL/正文指纹、本地链接与锚点、数值示例，以及索引重复生成一致性。检查通过不等于已向企业核实面经真实性，也不表示原帖自带答案全部正确。
