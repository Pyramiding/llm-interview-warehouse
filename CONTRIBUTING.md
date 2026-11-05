# 如何补充与纠错

欢迎补充公开面经、论文、题解及复现经验。优先提交小而可核实的修改。

## 第一次贡献，从这里选

- **只想提供线索：** 使用[来源表单](https://github.com/Pyramiding/llm-interview-warehouse/issues/new?template=source.yml)。有原始链接和简短说明即可，不必先 fork 或修改 JSON。
- **指出错误或失效链接：** 使用[纠错表单](https://github.com/Pyramiding/llm-interview-warehouse/issues/new?template=correction.yml)。附题目 ID / 文件路径、问题现象，以及可用的原始依据或复现步骤。
- **直接提交修改：** 按下方规范编辑源文件，运行验证，再提交 PR。一次 PR 尽量解决一个问题；不确定的事实请明确标为未确认。

请勿提交未公开的面试材料、个人联系方式、账号信息或不必要的个人身份信息；分享本人经历时也请先去除这些内容。

## 补充面经

编辑`data/interviews.json`，使用新的`INT`编号，填写标题、原始URL、归组年份、可确定的发布日期/面试日、企业自述、岗位、两位专题编号、简短原创摘要、阅读建议、查阅日期、核验状态及备注。无法确认的日期用`null`，不要根据转载推测精确日期。

`domains`必须人工核对后填写，枚举为搜索、广告、推荐、用户增长、营销、风控、语音、客服；证据不足填`[]`。不能按公司主营业务、作者职业或“搜索片段”自动贴标签。公司/岗位明确但原文只在讨论候选人过往项目时，在备注中保留这一区别。

猎头转述、课程题单及解析放`data/resources.json`，可添加`companies`、`topics`、`domains`和可读版本`evidence_url`以进入交叉索引。只有发布者目录元数据时用`metadata_only`并填写依据URL；此状态不得进入自述面经表。未能核对正文的小红书二手短链仅记检索日志。

牛客只见月日时不要按查阅年份补日期。LeetCode的帖子短链、数值ID地址和评论入口需核对同源后合并；跨站镜像可作为`repost_reference`入口连接`related_interview_id`，不重复算面试。普通SWE允许使用AI写代码、传统MLE/推荐基础材料可列工程邻接资源，不据此称为LLM岗位亲历。

细分方向维护在`data/specialties.json`，通过已有面经/资源ID人工关联，生成细分索引及LLM Infra专页。技术分类与八个业务标签并存，不用公司名称或关键词自动推断；区分岗位、候选项目、场景题和反问中的业务说明。`interview_ids`只能引用公开自述表，`resource_ids`只能引用补充阅读表；暂缺亲历时保留空列表，不拿教程补计数。

## 补充题目或技术来源

题目放入对应专题，使用该专题未占用的ID，并含难度/岗位、答题要点、追问、误区。添加原始论文或官方文档链接，说明版本。文献元数据放到对应`data/sources-*.json`；额外汇编放`data/resources.json`。`data/sources.json`和导航页由脚本生成，不直接手改。

文字尽量直接写具体问题、考点和限制，少用口号或套话。通用收录规则集中放在来源说明里，付费截断、日期疑问和归属冲突仍写在对应条目。保留原帖标题，不编造个人面试经历。

## 验证

```sh
python3 tools/build_indexes.py
python3 tools/validate.py
python3 tools/check_examples.py
```

提交前阅读[来源规范](docs/methodology.md)，不要复制长篇原文或虚构企业归属。若修正公式，请补一个可复现反例或参考来源；若报告失效链接，请注明查阅日期及访问现象，区分删除、反爬、登录和网络失败。

## PR 提交前检查

- [ ] 修改范围清楚，说明改了什么、为什么改。
- [ ] 新增事实有公开原始链接；无法核实的日期、归属和访问范围已标明。
- [ ] 未把原创练习或二手汇编写成企业官方真题，未复制长篇原文。
- [ ] 修改源数据后已运行 `python3 tools/build_indexes.py`，并提交必要的生成文件。
- [ ] 已运行 `python3 tools/validate.py` 和 `python3 tools/check_examples.py`；不能运行时如实写明原因，不勾选通过。
