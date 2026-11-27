import {test, expect} from '@playwright/test';

// Exercise the built site through real browser events. Never contact third-party
// sources or the production analytics service from CI.
test.beforeEach(async ({context, baseURL}) => {
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    return url.origin === baseURL ? route.continue() : route.abort();
  });
});

async function ready(page, path = '/') {
  await page.goto(path);
  await expect(page.locator('#results')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('.record-card').first()).toBeVisible();
}

async function filters(page) {
  if (await page.locator('#filter-toggle').isVisible()) {
    await page.locator('#filter-toggle').click();
  }
}

async function withoutEmbeddedData(page, ids) {
  await page.route('**/', async route => {
    const response = await route.fetch();
    let html = await response.text();
    for (const id of ids) {
      html = html.replace(new RegExp(`<script id="${id}"[\\s\\S]*?</script>`), '');
    }
    await route.fulfill({response, body: html});
  });
}

test('combined filters, URL reload, empty results and reset', async ({page}) => {
  await ready(page);
  await filters(page);
  await page.locator('#company-filter').selectOption('阿里');
  await page.getByRole('button', {name: 'LLM Infra', exact: true}).click();
  await page.getByRole('searchbox', {name: '搜索资料'}).fill('CUDA');
  await expect(page).toHaveURL(/q=CUDA/);
  await expect(page.locator('[data-record="INT502"]')).toBeVisible();
  await expect(page.locator('[data-record="INT501"]')).toBeVisible();
  await expect(page.locator('[data-record="INT503"]')).toHaveCount(0);
  const ids = await page.locator('.record-card').evaluateAll(cards => cards.map(card => card.dataset.record));
  await page.reload();
  await expect(page.locator('#search-input')).toHaveValue('CUDA');
  await expect(page.locator('.record-card')).toHaveCount(ids.length);
  expect(await page.locator('.record-card').evaluateAll(cards => cards.map(card => card.dataset.record))).toEqual(ids);
  await page.locator('#search-input').fill('no-record-matches-this-123456');
  await expect(page.getByRole('heading', {name: '没有找到匹配的资料'})).toBeVisible();
  await page.getByRole('button', {name: '查看全部面经', exact: true}).click();
  await expect(page.locator('#search-input')).toHaveValue('');
  await expect(page.locator('.record-card')).toHaveCount(12);
  await expect(page).toHaveURL(/\/$/);
});

test('pagination and browser Back/Forward restore the visible page', async ({page}) => {
  await ready(page);
  const firstIds = await page.locator('.record-card').evaluateAll(cards => cards.map(card => card.dataset.record));
  await page.getByRole('button', {name: '下一页', exact: true}).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByRole('button', {name: '第2页', exact: true})).toHaveAttribute('aria-current', 'page');
  const secondIds = await page.locator('.record-card').evaluateAll(cards => cards.map(card => card.dataset.record));
  expect(secondIds.some(id => firstIds.includes(id))).toBe(false);
  await page.goBack();
  await expect(page.locator('.record-card').first()).toHaveAttribute('data-record', firstIds[0]);
  await page.goForward();
  await expect(page.locator('.record-card').first()).toHaveAttribute('data-record', secondIds[0]);
});

test('details, shareable deep links, dismissal and history stay consistent', async ({page, context}) => {
  await ready(page, '/?q=INT502');
  await page.locator('.record-title').click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/record=INT502/);
  await expect(dialog.getByRole('heading', {name: '问题摘录', exact: true})).toBeVisible();
  await expect(dialog.getByRole('link', {name: '阅读原帖'})).toHaveAttribute('href', /^https:\/\//);
  const shared = await context.newPage();
  await ready(shared, page.url());
  await expect(shared.getByRole('dialog')).toBeVisible();
  await shared.getByRole('button', {name: '关闭详情', exact: true}).click();
  await expect(shared.getByRole('dialog')).not.toBeVisible();
  await expect(shared).not.toHaveURL(/record=/);
  await shared.reload();
  await expect(shared.getByRole('dialog')).not.toBeVisible();
  await shared.close();
  await page.goBack();
  await expect(dialog).not.toBeVisible();
  await page.goForward();
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(page).not.toHaveURL(/record=/);
  await page.locator('.record-title').click();
  await expect(dialog).toBeVisible();
  await dialog.locator('[data-topic]').first().click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole('tab', {name: /专题题解/})).toHaveAttribute('aria-selected', 'true');
  await expect(page).not.toHaveURL(/record=/);
  await expect(page.locator('.record-card').first()).toBeVisible();
});

test('bookmarks persist across reloads and synchronize between tabs', async ({page, context}) => {
  await ready(page, '/?q=INT502');
  const other = await context.newPage();
  await ready(other, '/?q=INT502');
  await page.locator('[data-save="INT502"]').click();
  await expect(page.locator('#saved-count')).toHaveText('1');
  await expect(other.locator('[data-save="INT502"]')).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.locator('[data-save="INT502"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#saved-toggle').click();
  await expect(page.locator('.record-card')).toHaveCount(1);
  await page.locator('.record-title').click();
  await page.locator('#detail-bookmark').click();
  await expect(page.locator('#detail-bookmark')).toHaveAttribute('aria-pressed', 'false');
  await page.locator('#close-detail').click();
  await expect(page.getByRole('heading', {name: '这里还没有匹配的收藏'})).toBeVisible();
  await expect(other.locator('[data-save="INT502"]')).toHaveAttribute('aria-pressed', 'false');
  await other.close();
});

test('question search renders the answer and resources remain distinct', async ({page}) => {
  await ready(page);
  await page.getByRole('tab', {name: /专题题解/}).click();
  await page.locator('#search-input').fill('RRF');
  await expect(page).toHaveURL(/q=RRF/);
  await page.locator('[data-record="R05"] .record-title').click();
  await expect(page.locator('#detail-content .markdown')).toContainText('作答要点');
  await expect(page.locator('#detail-content .markdown')).toContainText('RRF');
  await page.locator('#close-detail').click();
  await page.getByRole('tab', {name: /参考资料/}).click();
  await expect(page.getByRole('tab', {name: /参考资料/})).toHaveAttribute('aria-selected', 'true');
  await page.locator('#search-input').fill('');
  await expect(page).not.toHaveURL(/q=/);
  await expect(page.locator('.record-card').first()).toBeVisible();
  await page.locator('.record-title').first().click();
  await expect(page.locator('#detail-kicker')).toContainText('参考资料');
  await expect(page.getByRole('dialog').getByRole('link', {name: '打开资料'})).toBeVisible();
});

test('recruiting filters and a shareable JD survive reload', async ({page}) => {
  await ready(page, '/?view=jobs');
  await expect(page.getByRole('tab', {name: /找岗位/})).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('heading', {name: '大模型与算法岗位', exact: true})).toBeVisible();
  await page.getByRole('button', {name: '只看官网可投'}).click();
  await expect(page).toHaveURL(/job_status=apply_link/);
  await expect(page.getByRole('button', {name: '只看官网可投'})).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.job-card .job-status:not([data-status="apply_link"])')).toHaveCount(0);
  await page.getByRole('button', {name: '只看官网可投'}).click();
  await expect(page).not.toHaveURL(/job_status=/);
  await page.getByLabel('排序方式').selectOption('published');
  await expect(page).toHaveURL(/sort=published/);
  await page.getByText('查看招聘渠道', {exact: true}).click();
  await expect(page.locator('#job-channels').getByRole('link', {name: '微信公众号'})).toBeVisible();
  await page.getByText('查看招聘渠道', {exact: true}).click();
  await filters(page);
  await page.getByLabel('公司', {exact: true}).selectOption('上海人工智能实验室');
  await page.getByLabel('平台', {exact: true}).selectOption('招聘官网');
  await page.getByLabel('岗位方向').selectOption('posttraining');
  await page.getByLabel('城市', {exact: true}).selectOption('上海');
  await page.getByLabel('招聘类型').selectOption('社招');
  await page.getByLabel('投递状态').selectOption('apply_link');
  await expect(page.locator('.record-card')).toHaveCount(2);
  await page.locator('[data-record="JOB001"] .record-title').click();
  const jd = page.getByRole('dialog');
  await expect(jd.getByRole('heading', {name: '主要职责'})).toBeVisible();
  await expect(jd.getByRole('heading', {name: '任职要求'})).toBeVisible();
  await expect(jd.getByRole('link', {name: '查看招聘原页'})).toHaveAttribute('href', /7687960297156315435/);
  await expect(page).toHaveURL(/record=JOB001/);
  await page.reload();
  await expect(jd.getByRole('heading', {name: '大模型强化学习青年研究员'})).toBeVisible();
  await jd.getByRole('button', {name: '关闭详情'}).click();
  await expect(page.locator('.record-card')).toHaveCount(2);
  await page.locator('#tab-interviews').click();
  await expect(page.locator('#job-filters')).toBeHidden();
  await expect(page.getByRole('heading', {name: '面经原帖', exact: true})).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
});

test('layoffs share recruiting companies and preserve event links', async ({page}) => {
  await ready(page, '/?view=jobs');
  await filters(page);
  const company = page.getByLabel('公司', {exact: true});
  const companies = await company.locator('option').evaluateAll(options => options.map(option => option.value));
  const tab = page.getByRole('tab', {name: /裁员动态/});
  await tab.click();
  await expect(tab).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('heading', {name: '裁员动态', exact: true})).toBeVisible();
  expect(await company.locator('option').evaluateAll(options => options.map(option => option.value))).toEqual(companies);

  await company.selectOption('Amazon');
  await page.getByLabel('公开状态').selectOption('confirmed');
  await expect(page).toHaveURL(/layoff_status=confirmed/);
  await page.getByRole('searchbox', {name: '搜索资料'}).fill('LAY017');
  await page.locator('[data-record="LAY017"] .record-title').click();
  await expect(page).toHaveURL(/record=LAY017/);
  await page.reload();
  const reader = page.getByRole('dialog');
  await expect(reader.getByRole('heading', {name: '事件摘要'})).toBeVisible();
  await expect(reader.getByRole('link', {name: '查看原始来源'})).toHaveAttribute('href', /aboutamazon\.com/);
  const jobsLink = reader.getByRole('link', {name: '查看同公司岗位'});
  await jobsLink.click();
  await expect(page).toHaveURL(/view=jobs&company=Amazon/);
  await expect(page.getByRole('heading', {name: '大模型与算法岗位'})).toBeVisible();

  await tab.click();
  await page.getByRole('searchbox', {name: '搜索资料'}).fill('');
  await filters(page);
  await company.selectOption('公司未明确');
  await expect(page.getByRole('heading', {name: '该公司暂无收录'})).toBeVisible();
});

test('global search finds archived JDs and links to company interviews', async ({page}) => {
  await ready(page);
  await page.keyboard.press('ControlOrMeta+k');
  await page.getByRole('combobox', {name: '全站搜索'}).fill('JOB023');
  await page.getByRole('option', {name: /JOB023/}).click();
  const jd = page.getByRole('dialog');
  await expect(page).toHaveURL(/view=jobs&record=JOB023/);
  await expect(jd).toContainText('已结束');
  await jd.getByRole('button', {name: '查看字节跳动面经'}).click();
  await expect(jd).toBeHidden();
  await expect(page.locator('#tab-interviews')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#company-filter')).toHaveValue('字节');
});

test('discussion board filters, bookmarks and restores a shared thread', async ({page}) => {
  await ready(page);
  await page.getByRole('link', {name: '逛话题'}).click();
  await expect(page.getByRole('tab', {name: /话题区/})).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('heading', {name: '算法圈话题'})).toBeVisible();
  await page.getByLabel('话题分类').selectOption('infra');
  await page.getByLabel('平台', {exact: true}).selectOption('V2EX');
  await page.getByRole('searchbox', {name: '搜索资料'}).fill('DSpine');
  const discussion = page.locator('.discussion-card');
  await expect(discussion).toHaveCount(1);
  await expect(discussion.getByRole('link', {name: '看原帖'})).toHaveAttribute('href', 'https://www.v2ex.com/t/1255433');
  await discussion.getByRole('button', {name: /^收藏/}).click();
  await page.getByRole('button', {name: /^只看我的收藏/}).click();
  await discussion.getByRole('button', {name: '讨论焦点'}).click();
  const reader = page.getByRole('dialog');
  await expect(reader.getByRole('heading', {name: '讨论焦点'})).toBeVisible();
  await expect(page).toHaveURL(/record=DISC005/);
  await page.reload();
  await expect(reader.getByRole('link', {name: '阅读原帖'})).toHaveAttribute('href', /v2ex\.com\/t\/1255433/);
  await expect(page.getByLabel('话题分类')).toHaveValue('infra');
  await expect(page.getByLabel('平台', {exact: true})).toHaveValue('V2EX');
  await reader.getByRole('button', {name: '关闭详情'}).click();
  await page.getByRole('button', {name: '打开全站搜索'}).click();
  await page.getByRole('combobox', {name: '全站搜索'}).fill('DISC002');
  await page.getByRole('option', {name: /DISC002/}).click();
  await expect(reader.getByRole('heading', {name: /Gemini 4 Neon 写代码/})).toBeVisible();
});

test('embedded data works when all data-file requests fail', async ({page}) => {
  let dataRequests = 0;
  await page.route('**/data/*.json*', route => { dataRequests++; return route.abort(); });
  await ready(page);
  await page.getByRole('tab', {name: /专题题解/}).click();
  await expect(page.locator('.record-card')).toHaveCount(12);
  await page.locator('.record-title').first().click();
  await expect(page.locator('#detail-content .markdown')).toBeVisible();
  expect(dataRequests).toBe(0);
});

test('missing embedded catalog shows an actionable error then recovers on retry', async ({page}) => {
  await withoutEmbeddedData(page, ['initial-catalog']);
  let attempts = 0;
  await page.route('**/data/catalog.json*', route => {
    attempts++;
    return attempts <= 3 ? route.fulfill({status: 503, body: 'Unavailable'}) : route.continue();
  });
  await page.goto('/');
  await expect(page.getByRole('heading', {name: '资料暂时没加载出来'})).toBeVisible();
  expect(attempts).toBe(3);
  await page.getByRole('button', {name: '重新载入', exact: true}).click();
  await expect(page.locator('.record-card')).toHaveCount(12);
  await expect(page.locator('#results')).toHaveAttribute('aria-busy', 'false');
  expect(attempts).toBe(4);
});

test('a delayed question request cannot replace a newer resource navigation', async ({page}) => {
  await withoutEmbeddedData(page, ['initial-questions']);
  let release;
  const held = new Promise(resolve => { release = resolve; });
  await page.route('**/data/questions.json*', async route => { await held; await route.continue(); });
  await ready(page);
  const requested = page.waitForRequest('**/data/questions.json*');
  await page.getByRole('tab', {name: /专题题解/}).click();
  await requested;
  await page.getByRole('tab', {name: /参考资料/}).click();
  await expect(page.locator('#results')).toHaveAttribute('aria-labelledby', 'tab-resources');
  const response = page.waitForResponse('**/data/questions.json*');
  release();
  await response;
  await expect(page.locator('#results-status')).toContainText('份参考资料');
  await expect(page.locator('.record-card').first().locator('.read-source')).toHaveText('打开资料');
  await expect(page).toHaveURL(/view=resources/);
});

test('changing a filter preserves search input before its debounce fires', async ({page}) => {
  await ready(page);
  await filters(page);
  await page.locator('#search-input').evaluate(input => {
    input.value = 'CUDA';
    input.dispatchEvent(new Event('input', {bubbles: true}));
    const company = document.querySelector('#company-filter');
    company.value = '阿里';
    company.dispatchEvent(new Event('change', {bubbles: true}));
  });
  await page.waitForTimeout(250); // Verify the cancelled timer cannot undo the combined state.
  await expect(page.locator('#search-input')).toHaveValue('CUDA');
  await expect(page).toHaveURL(/q=CUDA/);
  await expect(page.locator('#company-filter')).toHaveValue('阿里');
  await expect(page.locator('[data-record="INT502"]')).toBeVisible();
  await expect(page.locator('[data-record="INT503"]')).toHaveCount(0);
});

test('reset cancels an in-flight search debounce instead of reviving it', async ({page}) => {
  await ready(page);
  await filters(page);
  await page.locator('#search-input').fill('CUDA');
  // Dispatch reset in the same browser turn as input, before the 150 ms debounce.
  // This reproduces fast users and programmatic assistive input deterministically.
  await page.locator('#search-input').evaluate(input => {
    input.value = 'stale-search-that-must-not-return';
    input.dispatchEvent(new Event('input', {bubbles: true}));
    document.querySelector('#reset-filters').click();
  });
  await page.waitForTimeout(250); // Must cross the pending debounce deadline.
  await expect(page.locator('#search-input')).toHaveValue('');
  await expect(page).not.toHaveURL(/q=/);
  await expect(page.locator('.record-card')).toHaveCount(12);
});

test('theme and mobile filter controls work without horizontal overflow', async ({page, isMobile}) => {
  await ready(page);
  await page.locator('#theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  if (isMobile) {
    await expect(page.locator('#company-filter')).not.toBeVisible();
    await page.locator('#filter-toggle').click();
    await expect(page.locator('#filter-toggle')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#company-filter')).toBeVisible();
    await page.locator('#filter-toggle').click();
    await expect(page.locator('#company-filter')).not.toBeVisible();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  await expect(page.locator('#analytics-state')).toHaveText('本地预览不计入访问统计');
});

test('company shortcuts and direction cards lead to the correct collection', async ({page}) => {
  await ready(page);
  await page.locator('#quick-companies').click();
  await page.locator('#company-quick [data-company="阿里"]').click();
  await expect(page.locator('#company-filter')).toHaveValue('阿里');
  await expect(page.locator('#company-quick [data-company="阿里"]')).toHaveAttribute('aria-pressed', 'true');
  const ids = await page.locator('.record-card').evaluateAll(cards => cards.map(card => card.dataset.record));
  await page.locator('.record-title').first().click();
  await expect(page.locator('#reader-prev')).toBeDisabled();
  await expect(page.locator('#reader-position')).toHaveText(/^1 \/ \d+$/);
  await page.locator('#reader-next').click();
  await expect(page.locator('#detail-dialog')).toHaveAttribute('data-record', ids[1]);
  await expect(page).toHaveURL(new RegExp('record=' + ids[1]));
  await page.locator('#reader-prev').click();
  await expect(page.locator('#detail-dialog')).toHaveAttribute('data-record', ids[0]);
  await page.locator('#close-detail').click();
  await page.locator('[data-explore="rag"]').click();
  await expect(page).toHaveURL(/collection=rag/);
  await expect(page.locator('#company-filter')).toHaveValue('');
  await expect(page.locator('.record-card').first()).toBeVisible();
});

test('global keyboard search crosses content types and opens a shareable answer', async ({page}) => {
  await ready(page);
  await page.keyboard.press('ControlOrMeta+k');
  await expect(page.locator('#command-dialog')).toBeVisible();
  const search = page.getByRole('combobox', {name: '全站搜索', exact: true});
  await search.fill('R05');
  await expect(page.locator('.command-hit').first()).toHaveAttribute('data-command-record', 'R05');
  await search.press('Enter');
  await expect(page.locator('#command-dialog')).not.toBeVisible();
  await expect(page.locator('#detail-dialog')).toHaveAttribute('data-record', 'R05');
  await expect(page.locator('#detail-content .markdown')).toContainText('RRF');
  await expect(page).toHaveURL(/view=questions/);
  await expect(page).toHaveURL(/record=R05/);
  await page.locator('#close-detail').click();
  await page.locator('#command-open').click();
  await search.fill('INT502');
  await search.press('ArrowDown');
  await search.press('Enter');
  await expect(page.locator('#detail-dialog')).toHaveAttribute('data-record', 'INT502');
  await expect(page.locator('#detail-kicker')).toContainText('面经');
});

test('compact reading preferences persist and empty global search can be dismissed', async ({page}) => {
  await ready(page);
  await page.locator('#layout-compact').click();
  await page.reload();
  await expect(page.locator('#results')).toHaveAttribute('data-layout', 'compact');
  await expect(page.locator('#layout-compact')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.record-card')).toHaveCount(12);
  await page.locator('#command-open').click();
  const search = page.getByRole('combobox', {name: '全站搜索', exact: true});
  await search.fill('no-record-matches-this-123456');
  await expect(page.locator('.command-empty')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  await search.press('Escape');
  await expect(page.locator('#command-dialog')).not.toBeVisible();
  await expect(page.locator('.record-card')).toHaveCount(12);
});
