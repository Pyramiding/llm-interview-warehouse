# 网页版

[打开网页](https://pyramiding.github.io/llm-interview-warehouse/) · [返回仓库](../README.md)

网页读取仓库现有资料，提供面经、题解、参考资料三个列表，支持搜索、筛选、收藏和单条链接分享。收藏保存在当前浏览器；换设备不会自动同步。访问次数显示在页尾，IP明细进入[受保护的统计后台](https://llm-interview-analytics.givingalder513.chatgpt.site/)查看，规则见[统计说明](../analytics/README.md)。仅搜索摘要、付费截断等说明仍在详情中保留。

## 本地预览

在仓库根目录运行，需要Python 3.10以上；脚本交互检查另外需要Node.js 18以上。网页本身无需前端依赖；真实浏览器测试需要Node.js 20以上和下方开发依赖。

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

检查包含源记录与日期保留、题目编号、生成一致性、组合筛选、分页、分享参数，以及正文HTML转义和链接协议限制。真实点击与浏览器状态另外由下方端到端测试检查。

## 真实浏览器端到端测试

```sh
npm ci
npx playwright install --with-deps chromium
npm run test:e2e
```

Playwright 会自动构建并在 `127.0.0.1:8876` 启动本地站点，运行桌面 Chromium 和移动视口 Chromium 两组测试。不要另占用该端口。如需使用本机已有的 Chromium，可设置 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 为其可执行文件绝对路径。

测试覆盖组合筛选与刷新、分页与前进/后退、详情深链接与关闭、收藏持久化与跨标签同步、题解正文、参考资料切换、内嵌数据降级、请求失败重试、异步加载期间改换页面、快速重置搜索、主题切换与移动布局。所有第三方请求均被拦截，测试不会写入生产访问统计。移动项目是触摸/视口模拟，不代表实机或 Safari 测试。

[浏览器测试工作流](../.github/workflows/browser-tests.yml)由 Pages 工作流在 main 推送和 PR 时调用。Pages 发布也以浏览器测试成功为前提。失败时保留截图、trace 和 HTML 报告，可从工作流产物下载定位；本地报告位于不提交的 `playwright-report/`。
