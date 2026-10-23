# 2026-10-23 牛客与LeetCode面经增补

[返回首页](../README.md) · [牛客](interviews/by-platform.md#platform-nowcoder) · [LeetCode中文站](interviews/by-platform.md#platform-leetcode-cn) · [LeetCode国际站](interviews/by-platform.md#platform-leetcode-global) · [按公司](interviews/by-company.md) · [按方向](interviews/by-topic.md) · [公司×业务方向](interviews/company-direction.md)

本轮继续收集牛客与LeetCode中可核对的大模型技术面经，保留实际题型、岗位、公司和原始链接。企业/经历与结果仍属于作者自述；问题的前提和临场回答不自动成为正确技术结论。

本轮新增**32篇自述复盘和7个补充阅读入口**；仓库累计**106篇面经、73个补充入口、23个专题、440道题目与练习、362个规范化来源链接**。其中37个新增来源获取了相关页面内容，2个仅核对公开搜索片段；不把后者写成全文核验。

| 来源 | 新增自述复盘 | 新增补充入口 | 累计自述复盘 |
|---|---:|---:|---:|
| 牛客 | 22 | 0 | 59 |
| LeetCode中文站 | 2 | 3 | 2 |
| LeetCode国际站 | 8 | 4 | 8 |

统计按文章/入口计数，多轮、多公司和转载不拆成多份面试。LeetCode镜像追溯到牛客原帖后，主记录计入牛客。

## 业务与公司重点

| 方向 | 本轮新增证据 | 阅读边界 |
|---|---|---|
| 搜索/广告 | 京东零售大模型搜索算法、字节搜索广告后端、字节国际化广告生成 | 区分候选人Agent项目、招聘岗位和反问中的业务介绍。 |
| 推荐 | 腾讯PCG/WXG、美团推荐相关算法面试 | 传统召回/排序基础和明确的LLM标签生成、蒸馏、开放讨论分别记录，不补写原帖没有的生成式推荐方案。 |
| 用户增长/营销 | 美团用户增长两轮面试 | 原文反问明确提到营销Uplift和LLM对行为/query的特征挖掘；业务介绍不等于候选人被考过相应算法推导。 |
| 风控 | 字节风控算法两篇、多公司BAT复盘中的蚂蚁方向 | 风控业务由标题/正文支持，多公司复盘的风控不扩散归给字节和阿里云。 |
| 客服 | 美团Keeta Agent开发、腾讯客服后台六轮复盘 | 医疗问诊与知识图谱是候选项目；后台工程岗和模型算法岗分别保留。 |
| 语音 | 有赞技术面中的Qwen语音与WebSocket项目 | 只证明候选项目涉及语音，不能据此命名“有赞语音招聘组”。 |
| 训练/推理系统 | 阿里云Agentic RL、阿里云AI Infra、2025春招Infra多公司复盘 | 原帖标题/正文差异、具体硬件条件、未公开的定制编码题均注明，不能补造题面。 |
| 海外LLM应用 | LeetCode国际站的QnA/RAG、GenAI、LLM实习与Agent经历 | 依据原文区分实际面试问题、准备材料与普通工程邻接内容；日期未知留空。 |

完整条目可从[按公司](interviews/by-company.md)和[公司×业务方向](interviews/company-direction.md)进入。原帖虽多公司、多轮，仍按一篇记录；各题不自动分配给文章中所有公司。

## LeetCode覆盖与限制

中文站中，匿名多公司NLP复盘含LoRA、RAG、向量检索、LLM推荐与Agent；求职转型总结含代码Agent CLI准备路线。后者是个人求职经历与学习建议，不能写成逐轮技术题。目标企业以颜色/行业匿名时，不反向猜测阿里、京东或字节；“前鹅厂”也不等于面试腾讯。

英文站中，明确LLM/GenAI/RAG/Agent的个人经历进入自述索引。传统MLE、传统推荐系统设计、单纯允许AI编程的普通SWE材料放入[补充阅读](interviews/resources.md)，不能据此声称属于LLM岗位。求助帖、只给岗位要求的招聘帖和仅以大模型为题目背景的编程练习不计面经。

部分帖子直接打开失败，只能得到公开搜索索引；这些条目标记`search_excerpt`。年份未知保持`null`；不以查阅日、毕业届次、评论区日期或推荐区年份填入面试发生年。

## 同源与链接去重

1. LeetCode新地址`/discuss/post/数值ID/`的标题slug和评论后缀归为同一个来源。旧Discuss路由和短链只在实际跳转或正文比对支持时合并，不把不同路由中相同的数字当作同一帖。
2. eBay/字节数据科学复盘追到[葛小小的牛客原帖](https://www.nowcoder.com/discuss/674299026405171200)，[LeetCode匿名镜像](https://leetcode.cn/discuss/post/ffaIj1/)仅列转载阅读入口，不算第二份面试经历。小红书在该文只有未回应的投递，未列为面试公司。
3. 原有RES222脉脉猎头“爆料美团大模型算法面经”与本轮Aorni23牛客原帖的前九项顺序和措辞一致，改为`repost_reference`并关联主记录。脉脉没有注明原链，直接搬运路径仍是推断，可能经过其他中间来源。

规范化链接数仍是网址口径，转载入口不是独立候选人数；新收录原帖与已有转述建立关联后，面试主记录只计一次。

## 代表条目

- 牛客：[京东大模型搜索算法实习](interviews/README.md#int204)、[字节国际化广告算法](interviews/README.md#int206)、[腾讯PCG推荐算法](interviews/README.md#int208)、[美团用户增长与营销业务](interviews/README.md#int210)、[字节风控](interviews/README.md#int215)、[美团Keeta智能客服](interviews/README.md#int216)、[阿里云Agentic RL](interviews/README.md#int218)。
- LeetCode中文站：[匿名多公司NLP复盘](interviews/README.md#int201)、[转向Agent的求职与学习总结](interviews/README.md#int203)。
- LeetCode国际站：[Avaamo Senior MLE](interviews/README.md#int225)、[Google ML与RAG设计](interviews/README.md#int226)、[Amazon GenAI实习](interviews/README.md#int227)、[Google Gemini Applications](interviews/README.md#int231)、[Amazon Applied Data Scientist](interviews/README.md#int232)。

## 检查结果

结构、稳定ID、日期格式、来源类型和本地链接检查通过：380条来源记录、440道题目以及全部本地链接/锚点。数值示例与边界检查通过。外部页面的可访问性和作者自述真实性仍以各条核验说明为限。

## 可复核研究日志

- [牛客业务方向检索](../data/research-20261023-nowcoder-business.json)。
- [牛客风控/客服/语音/工程方向检索](../data/research-20261023-nowcoder-tech.json)。
- [LeetCode中文站与跨站原帖回溯](../data/research-20261023-leetcode-cn.json)。
- [LeetCode国际站检索](../data/research-20261023-leetcode-global.json)。

主表为[data/interviews.json](../data/interviews.json)和[data/resources.json](../data/resources.json)；日志保存查询、排除理由与合入ID，不重复保存主表计数。线上发布以[GitHub提交历史](https://github.com/Pyramiding/llm-interview-warehouse/commits/main/)为准。
