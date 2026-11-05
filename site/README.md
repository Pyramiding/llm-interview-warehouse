# 网页版

[打开网页](https://pyramiding.github.io/llm-interview-warehouse/) · [返回仓库](../README.md)

网页读取仓库现有资料，提供面经、题解、参考资料三个列表，支持搜索、筛选、收藏和单条链接分享。收藏保存在当前浏览器；换设备不会自动同步。访问次数显示在页尾，IP明细进入[受保护的统计后台](https://llm-interview-analytics.givingalder513.chatgpt.site/)查看，规则见[统计说明](../analytics/README.md)。仅搜索摘要、付费截断等说明仍在详情中保留。

## 本地预览

在仓库根目录运行，需要Python 3.10以上；交互检查另外需要Node.js 18以上，无需安装前端依赖。

```sh
python3 tools/build_site.py
python3 -m http.server 8876 --directory _site
```

浏览器打开 `http://localhost:8876/`。`_site/`为生成目录，不提交Git。

## 更新与发布

- 面经、资源和细分方向仍在`data/`中维护，题解仍编辑`docs/topics/`与`docs/preparation/`。
- 网页源码为本目录中的HTML、CSS和JavaScript；`tools/build_site.py`生成展示数据，题解正文直接取自Markdown。
- 提交到`main`后，[Pages工作流](../.github/workflows/pages.yml)检查资料并发布。PR只构建检查，不发布。
- 发布设置采用GitHub Actions，见[GitHub Pages说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。迁移仓库时，需调整构建脚本中的`SITE_URL`和`REPO_URL`以及首页链接。

提交前检查：

```sh
python3 tools/build_site.py
python3 tools/check_site.py
node --check _site/app.js
node tools/check_site.mjs
```

检查包含源记录与日期保留、题目编号、生成一致性、组合筛选、分页、分享参数，以及正文HTML转义和链接协议限制。布局与真实点击另在浏览器中检查。
