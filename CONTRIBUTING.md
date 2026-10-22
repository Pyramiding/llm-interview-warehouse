# 如何补充与纠错

欢迎补充公开面经、论文、题解及复现经验。优先提交小而可核实的修改。

## 补充面经

编辑`data/interviews.json`，使用新的`INT`编号，填写标题、原始URL、归组年份、可确定的发布日期/面试日、企业自述、岗位、两位专题编号、简短原创摘要、阅读建议、查阅日期、核验状态及备注。无法确认的日期用`null`，不要根据转载推测精确日期。

## 补充题目或技术来源

题目放入对应专题，使用该专题未占用的ID，并含难度/岗位、答题要点、追问、误区。添加原始论文或官方文档链接，说明版本。文献元数据放到对应`data/sources-*.json`；额外汇编放`data/resources.json`。`data/sources.json`和导航页由脚本生成，不直接手改。

## 验证

```sh
python3 tools/build_indexes.py
python3 tools/validate.py
python3 tools/check_examples.py
```

提交前阅读[来源规范](docs/methodology.md)，不要复制长篇原文或虚构企业归属。若修正公式，请补一个可复现反例或参考来源；若报告失效链接，请注明查阅日期及访问现象，区分删除、反爬、登录和网络失败。
