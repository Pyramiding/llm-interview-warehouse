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
