import {DEFAULT_STATE, PAGE_SIZE, readState, stateQuery, filterRecords, paginate, searchableText, escapeHtml as esc, safeUrl, renderMarkdown} from './core.mjs?v=__SITE_VERSION__';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const icon = name => '<svg class="icon" aria-hidden="true"><use href="#i-' + name + '"></use></svg>';
const VIEW_NAMES = {interviews: '面经', questions: '题解与练习', resources: '参考资料'};
const COLLECTION_NAMES = {infra: 'LLM Infra', rag: 'RAG', agent: 'Agent', search: '搜广推', speech: '语音与客服'};
const STORE_KEY = 'llm-interview-warehouse:saved:v1';
const THEME_KEY = 'llm-interview-warehouse:theme';
const version = $('meta[name="site-version"]').content;
let state = readState(location.search);
let catalog, questions, questionsPromise, renderRevision = 0, currentRecord;
let toastTimer;
let saved = new Set();
try {
  const stored = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
  if (Array.isArray(stored)) saved = new Set(stored.filter(id => typeof id === 'string' && /^[A-Z]{1,4}\d{2,4}$/.test(id)).slice(0, 10000));
} catch { /* Reading remains available if browser storage is disabled. */ }

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $('#theme-toggle').setAttribute('aria-label', theme === 'dark' ? '切换浅色模式' : '切换深色模式');
  $('meta[name="theme-color"]').content = theme === 'dark' ? '#101716' : '#f5f6f0';
}
try { setTheme(localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'); } catch { setTheme('dark'); }
$('#theme-toggle').addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(theme);
  try { localStorage.setItem(THEME_KEY, theme); } catch { /* Theme still works for this visit. */ }
});

function toast(message) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2400);
}

function writeUrl(method = 'replace') {
  const query = stateQuery(state);
  const url = location.pathname + (query ? '?' + query : '');
  if (url !== location.pathname + location.search) history[method + 'State'](null, '', url);
}

function navigate(patch, {replace = false, scroll = false} = {}) {
  state = {...state, ...patch, page: patch.page || 1, record: ''};
  if ($('#detail-dialog').open) $('#detail-dialog').close();
  writeUrl(replace ? 'replace' : 'push');
  render({scroll});
}

function prepare(records) {
  return records.map(record => ({...record, search_text: searchableText(record)}));
}

async function fetchData(file) {
  const response = await fetch('./data/' + file + '?v=' + encodeURIComponent(version));
  if (!response.ok) throw new Error('Data request failed: ' + response.status);
  return response.json();
}

async function loadQuestions() {
  if (questions) return questions;
  if (!questionsPromise) {
    questionsPromise = fetchData('questions.json').then(data => { questions = prepare(data); return questions; }).catch(error => { questionsPromise = null; throw error; });
  }
  return questionsPromise;
}

function option(value, label) {
  return '<option value="' + esc(value) + '">' + esc(label) + '</option>';
}

function fillFilters() {
  const rows = state.view === 'resources' ? catalog.resources : catalog.interviews;
  const companies = new Map(), years = new Map(), platforms = new Map();
  for (const record of rows) {
    for (const company of record.company_keys) companies.set(company, (companies.get(company) || 0) + 1);
    const year = record.year ? String(record.year) : 'unknown';
    years.set(year, (years.get(year) || 0) + 1);
    platforms.set(record.platform, (platforms.get(record.platform) || 0) + 1);
  }
  const priority = ['字节', '阿里', '腾讯', '美团', '百度', '快手', '小红书', '蚂蚁集团'];
  const companyOrder = (a, b) => {
    const ai = priority.indexOf(a), bi = priority.indexOf(b);
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi) || a.localeCompare(b, 'zh-CN');
  };
  $('#company-filter').innerHTML = option('', '全部公司') + [...companies].sort((a, b) => companyOrder(a[0], b[0])).map(([name, count]) => option(name, name + ' · ' + count)).join('');
  $('#topic-filter').innerHTML = option('', '全部专题') + catalog.topics.filter(topic => state.view === 'questions' || !topic.id.startsWith('practice-')).map(topic => option(topic.id, (topic.id.startsWith('practice-') ? '' : topic.id + ' · ') + topic.name)).join('');
  let specialtyOptions = option('', '全部方向');
  for (const group of ['LLM Infra', 'Agent与模型工程', '应用场景']) {
    specialtyOptions += '<optgroup label="' + esc(group) + '">' + option('group:' + group, group + ' · 全部');
    specialtyOptions += catalog.specialties.filter(item => item.group === group).map(item => option(item.id, item.name)).join('') + '</optgroup>';
  }
  $('#specialty-filter').innerHTML = specialtyOptions;
  $('#domain-filter').innerHTML = option('', '全部领域') + ['搜索', '广告', '推荐', '用户增长', '营销', '风控', '语音', '客服'].map(name => option(name, name)).join('');
  $('#year-filter').innerHTML = option('', '全部年份') + [...years].sort((a, b) => a[0] === 'unknown' ? 1 : b[0] === 'unknown' ? -1 : b[0].localeCompare(a[0])).map(([year, count]) => option(year, (year === 'unknown' ? '年份未确认' : year) + ' · ' + count)).join('');
  $('#platform-filter').innerHTML = option('', '全部平台') + [...platforms].sort((a, b) => b[1] - a[1]).map(([name, count]) => option(name, name + ' · ' + count)).join('');
}

function filterLabel(key, value) {
  if (key === 'q') return '搜索：' + value;
  if (key === 'saved') return '我的收藏';
  if (key === 'collection') return COLLECTION_NAMES[value];
  if (key === 'topic') return catalog.topics.find(topic => topic.id === value)?.name || value;
  if (key === 'specialty') return value.startsWith('group:') ? value.slice(6) : catalog.specialties.find(item => item.id === value)?.name || value;
  if (key === 'year') return value === 'unknown' ? '年份未确认' : value + '年';
  return value;
}

function syncControls() {
  fillFilters();
  for (const tab of $$('.library-tab')) {
    const active = tab.dataset.view === state.view;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  }
  $$('.source-filter').forEach(field => { field.hidden = state.view === 'questions'; });
  for (const field of $$('[data-filter]')) field.value = state[field.dataset.filter];
  for (const chip of $$('[data-collection]')) {
    const active = chip.dataset.collection === state.collection;
    chip.classList.toggle('active', active);
    chip.setAttribute('aria-pressed', String(active));
  }
  if ($('#search-input').value !== state.q) $('#search-input').value = state.q;
  $('#search-input').placeholder = state.view === 'questions' ? '搜题目或作答要点，例如：KV cache、DPO、RRF' : '搜公司、技术词或项目，例如：字节、RAG、CUDA';
  $('#sort-select').innerHTML = state.view === 'questions' ? option('recent', '专题顺序') + option('title', '标题顺序') : option('recent', '最近收录') + option('published', '发布时间') + option('title', '标题顺序');
  if (state.view === 'questions' && state.sort === 'published') state.sort = 'recent';
  $('#sort-select').value = state.sort;
  $('#saved-toggle').setAttribute('aria-pressed', String(state.saved));
  $('#saved-toggle').setAttribute('aria-label', '只看我的收藏，共' + saved.size + '项');
  $('#saved-count').textContent = saved.size;
  $('.sidebar-note-title').textContent = state.view === 'questions' ? '按知识点复习' : '读面经，也看上下文';
  $('.sidebar-note p').textContent = state.view === 'questions' ? '题解按公开论文与文档编写，参考链接随题保留。具体企业问了什么，可以回面经原帖查看。' : '公司、岗位和过程沿用原作者描述。日期疑问、付费截断等情况见条目备注。';
  const filterKeys = state.view === 'questions' ? ['q', 'collection', 'topic', 'saved'] : ['q', 'collection', 'company', 'topic', 'specialty', 'domain', 'year', 'platform', 'saved'];
  const active = filterKeys.filter(key => state[key]);
  $('#active-filters').innerHTML = active.map(key => '<button class="filter-tag" data-remove="' + key + '" aria-label="移除条件：' + esc(filterLabel(key, state[key])) + '">' + esc(filterLabel(key, state[key])) + icon('close') + '</button>').join('');
  $('#mobile-filter-count').textContent = active.length ? '· ' + active.length : '';
  $('#results').setAttribute('aria-labelledby', 'tab-' + state.view);
}

function externalLink(url, label, className = '') {
  const href = safeUrl(url);
  return href ? '<a class="' + className + '" href="' + esc(href) + '" target="_blank" rel="noopener noreferrer">' + esc(label) + icon('arrow') + '</a>' : '';
}

function shortDate(record) {
  if (record.published_at) return record.published_at.slice(0, 10);
  if (record.published) return record.published;
  return record.year || (record.platform === 'GitHub' ? '持续更新' : '日期未确认');
}

function card(record) {
  const question = state.view === 'questions';
  const company = record.companies?.length ? record.companies.slice(0, 2).join(' / ') + (record.companies.length > 2 ? ' 等' : '') : (record.company_keys?.[0] || '通用资料');
  const tags = question ? [record.chapter, record.difficulty] : (record.topic_names.length ? record.topic_names.slice(0, 2) : [record.source_label]);
  if (!question && record.topic_names.length > 2) tags.push('+' + (record.topic_names.length - 2));
  const restricted = !question && record.verification !== 'opened' ? '<span class="restricted-tag">' + esc(record.access_label) + '</span>' : '';
  const excerpt = record.summary || record.note || record.role || '';
  return `<article class="record-card" data-record="${esc(record.id)}">
    <div class="record-eyebrow"><span class="record-id">${esc(record.id)}</span><span class="meta-dot">/</span><span class="record-company">${esc(question ? record.chapter : company)}</span><span class="meta-dot">·</span><span>${esc(question ? '复习题' : record.platform)}</span><span class="meta-dot">·</span><span>${esc(question ? record.difficulty : shortDate(record))}</span>${restricted}<button class="icon-button record-bookmark" data-save="${esc(record.id)}" aria-label="${saved.has(record.id) ? '取消收藏' : '收藏'}：${esc(record.title)}" aria-pressed="${saved.has(record.id)}" title="${saved.has(record.id) ? '取消收藏' : '收藏'}">${icon('bookmark')}</button></div>
    <h3><button class="record-title" data-open="${esc(record.id)}">${esc(record.title)}</button></h3>
    <p class="record-excerpt">${esc(excerpt)}</p>
    <div class="record-bottom"><div class="record-tags">${tags.filter(Boolean).map(tag => '<span class="record-tag">' + esc(tag) + '</span>').join('')}</div><div class="record-actions">${externalLink(record.url, question ? '看本专题' : state.view === 'resources' ? '打开资料' : '读原帖', 'read-source')}<button class="read-detail" data-open="${esc(record.id)}">${question ? '查看题解' : '查看摘要'}${icon('chevron')}</button></div></div>
  </article>`;
}

function emptyState() {
  return '<div class="empty-state">' + icon(state.saved ? 'bookmark' : 'search') + '<h3>' + (state.saved ? '这里还没有匹配的收藏' : '没有找到匹配的资料') + '</h3><p>' + (state.saved ? '点击资料右上角的书签收藏，也可以试试减少筛选条件。' : '试试减少筛选条件，或换个关键词。') + '</p><button class="primary-button" data-reset>查看全部' + esc(VIEW_NAMES[state.view]) + '</button></div>';
}

function renderPagination(page, pages) {
  if (pages <= 1) { $('#pagination').innerHTML = ''; return; }
  const numbers = [...new Set([1, pages, page - 1, page, page + 1])].filter(n => n >= 1 && n <= pages).sort((a, b) => a - b);
  let html = '<button class="page-button" data-page="' + (page - 1) + '" ' + (page === 1 ? 'disabled' : '') + ' aria-label="上一页">←</button>';
  numbers.forEach((n, index) => {
    if (index && n - numbers[index - 1] > 1) html += '<span class="page-gap">…</span>';
    html += '<button class="page-button ' + (n === page ? 'active' : '') + '" data-page="' + n + '" ' + (n === page ? 'aria-current="page"' : '') + ' aria-label="第' + n + '页">' + n + '</button>';
  });
  html += '<button class="page-button" data-page="' + (page + 1) + '" ' + (page === pages ? 'disabled' : '') + ' aria-label="下一页">→</button>';
  $('#pagination').innerHTML = html;
}

async function render({scroll = false} = {}) {
  if (!catalog) return;
  const revision = ++renderRevision;
  syncControls();
  $('#results').setAttribute('aria-busy', 'true');
  try {
    const records = state.view === 'questions' ? await loadQuestions() : catalog[state.view];
    if (revision !== renderRevision) return;
    const result = paginate(filterRecords(records, state, saved), state.page);
    state.page = result.page;
    writeUrl();
    $('#results-status').innerHTML = '<span class="result-total">' + result.total + '</span> ' + ({questions: '道', resources: '份', interviews: '篇'}[state.view]) + VIEW_NAMES[state.view] + (result.total ? '<span class="result-range"> · ' + ((result.page - 1) * PAGE_SIZE + 1) + '–' + Math.min(result.page * PAGE_SIZE, result.total) + '</span>' : '');
    $('#results').innerHTML = result.items.length ? result.items.map(card).join('') : emptyState();
    $('#results').setAttribute('aria-busy', 'false');
    renderPagination(result.page, result.pages);
    if (scroll) { $('#results').scrollIntoView({block: 'start'}); $('#results').focus({preventScroll: true}); }
    if (state.record) {
      const record = records.find(item => item.id === state.record);
      if (record) showRecord(record);
      else { state.record = ''; writeUrl(); if ($('#detail-dialog').open) $('#detail-dialog').close(); toast('未找到这条资料'); }
    } else if ($('#detail-dialog').open) $('#detail-dialog').close();
  } catch (error) {
    if (revision !== renderRevision) return;
    $('#results').setAttribute('aria-busy', 'false');
    $('#results-status').textContent = '资料未能载入';
    $('#results').innerHTML = '<div class="empty-state">' + icon('search') + '<h3>资料暂时没加载出来</h3><p>可以重试，或先在GitHub阅读。</p><button class="primary-button" data-retry>重新载入</button> ' + externalLink(catalog.repo_url, '去GitHub', 'secondary-button') + '</div>';
    $('#pagination').innerHTML = '';
    console.error(error);
  }
}

function metadataRow(label, value) {
  return value ? '<dt>' + esc(label) + '</dt><dd>' + esc(Array.isArray(value) ? value.join('、') : value) + '</dd>' : '';
}

function displayTime(value) {
  if (!value) return value;
  return value.replace(/^(\d{4}-\d{2}-\d{2})T/, '$1 ').replace(/\+08:00$/, '（北京时间）');
}

function section(title, content, extraClass = '') {
  return content ? '<section class="detail-section ' + extraClass + '"><h3>' + esc(title) + '</h3>' + content + '</section>' : '';
}

function showRecord(record) {
  const dialog = $('#detail-dialog');
  currentRecord = record;
  $('#detail-bookmark').setAttribute('aria-pressed', String(saved.has(record.id)));
  $('#detail-bookmark').setAttribute('aria-label', saved.has(record.id) ? '取消收藏本条资料' : '收藏本条资料');
  if (dialog.open && dialog.dataset.record === record.id) return;
  dialog.dataset.record = record.id;
  const question = record.kind === 'questions';
  $('#detail-kicker').textContent = question ? '专题题解 / ' + record.chapter : VIEW_NAMES[record.kind] + ' / ' + record.platform;
  let content = '<span class="detail-id">' + esc(record.id) + '</span><h2 id="detail-title" tabindex="-1">' + esc(record.title) + '</h2>';
  content += '<div class="detail-links">' + externalLink(record.url, question ? '在GitHub读本专题' : record.kind === 'resources' ? '打开资料' : '阅读原帖', 'primary-button');
  if (record.evidence_url) content += externalLink(record.evidence_url, '其他阅读入口', 'secondary-button');
  content += '</div>';
  if (question) content += '<div class="markdown">' + renderMarkdown(record.body, record.url) + '</div>';
  else {
    content += '<dl class="detail-metadata">' + metadataRow('公司', record.companies?.length ? record.companies : '未明确') + metadataRow('岗位 / 内容', record.role) + metadataRow('面试时间', record.event_date) + metadataRow(record.published_at ? '发布时间' : '页面日期', displayTime(record.published_at || record.published)) + metadataRow('编辑时间', record.updated_at !== record.published_at ? displayTime(record.updated_at) : '') + metadataRow('查阅日期', record.accessed) + metadataRow('作者', record.author) + metadataRow('阅读情况', record.access_label) + metadataRow('资料类型', record.source_label) + '</dl>';
    content += section('主要内容', record.summary ? '<p>' + esc(record.summary) + '</p>' : '');
    if (record.question_prompts?.length) content += section('问题摘录', '<ol>' + record.question_prompts.map(prompt => '<li>' + esc(prompt) + '</li>').join('') + '</ol>');
    content += section('准备时可以留意', record.reading_tip ? '<p>' + esc(record.reading_tip) + '</p>' : '');
    content += section('备注', record.note ? '<p>' + esc(record.note) + '</p>' : '', 'notes');
    if (record.alternate_urls?.length) content += section('同文链接', record.alternate_urls.map((url, i) => externalLink(url, '入口 ' + (i + 1), 'secondary-button')).join(' '));
    if (record.related_interview_id) content += section('相关面经', '<button class="topic-link" data-related="' + esc(record.related_interview_id) + '">' + esc(record.related_interview_id) + ' · 查看摘要</button>');
  }
  const topics = catalog.topics.filter(topic => record.topic_ids.includes(topic.id));
  if (!question && topics.length) content += section('相关题解', '<div class="topic-links">' + topics.map(topic => '<button class="topic-link" data-topic="' + esc(topic.id) + '">' + esc(topic.name) + ' ↗</button>').join('') + '</div>');
  $('#detail-content').innerHTML = content;
  $('#detail-content').scrollTop = 0;
  if (!dialog.open) dialog.showModal();
  $('#detail-title').focus({preventScroll: true});
}

async function openRecord(id) {
  const records = state.view === 'questions' ? await loadQuestions() : catalog[state.view];
  const record = records.find(item => item.id === id);
  if (!record) return;
  state.record = id;
  writeUrl('push');
  showRecord(record);
}

async function toggleSave(id) {
  const wasSaved = saved.has(id);
  if (wasSaved) saved.delete(id); else saved.add(id);
  let persisted = true;
  try { localStorage.setItem(STORE_KEY, JSON.stringify([...saved])); } catch { persisted = false; }
  toast(wasSaved ? '已取消收藏' : persisted ? '已收藏' : '本次已收藏，当前浏览器无法持久保存');
  const inDialog = $('#detail-dialog').open;
  await render();
  if (!inDialog) $('#results').querySelector('[data-save="' + id + '"]')?.focus({preventScroll: true});
}

function reset() { navigate({...DEFAULT_STATE, view: state.view}); }

function bindEvents() {
  for (const tab of $$('.library-tab')) tab.addEventListener('click', () => navigate({view: tab.dataset.view, sort: 'recent'}));
  $('.library-tabs').addEventListener('keydown', event => {
    const tabs = $$('.library-tab');
    const index = tabs.indexOf(document.activeElement);
    if (index < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    tabs[next].focus(); tabs[next].click();
  });
  for (const select of $$('[data-filter]')) select.addEventListener('change', () => navigate({[select.dataset.filter]: select.value}));
  for (const chip of $$('[data-collection]')) chip.addEventListener('click', () => navigate({collection: chip.dataset.collection, topic: '', specialty: '', domain: ''}));
  $('#sort-select').addEventListener('change', event => navigate({sort: event.target.value}));
  $('#search-form').addEventListener('submit', event => { event.preventDefault(); });
  let searchTimer;
  $('#search-input').addEventListener('input', event => {
    clearTimeout(searchTimer);
    const value = event.target.value;
    searchTimer = setTimeout(() => navigate({q: value}, {replace: true}), 150);
  });
  $('#saved-toggle').addEventListener('click', () => navigate({saved: !state.saved}));
  $('#reset-filters').addEventListener('click', reset);
  $('#active-filters').addEventListener('click', event => {
    const button = event.target.closest('[data-remove]');
    if (button) navigate({[button.dataset.remove]: button.dataset.remove === 'saved' ? false : ''});
  });
  $('#filter-toggle').addEventListener('click', () => {
    const expanded = $('#filter-toggle').getAttribute('aria-expanded') !== 'true';
    $('#filter-toggle').setAttribute('aria-expanded', String(expanded));
    $('#filters').classList.toggle('is-open', expanded);
  });
  $('#results').addEventListener('click', event => {
    const open = event.target.closest('[data-open]');
    const save = event.target.closest('[data-save]');
    if (open) openRecord(open.dataset.open);
    else if (save) toggleSave(save.dataset.save);
    else if (event.target.closest('[data-reset]')) reset();
    else if (event.target.closest('[data-retry]')) render();
  });
  $('#pagination').addEventListener('click', event => {
    const button = event.target.closest('[data-page]');
    if (button && !button.disabled) navigate({page: Number(button.dataset.page)}, {scroll: true});
  });
  $('#detail-content').addEventListener('click', event => {
    const topic = event.target.closest('[data-topic]');
    const related = event.target.closest('[data-related]');
    if (topic) navigate({...DEFAULT_STATE, view: 'questions', topic: topic.dataset.topic}, {scroll: true});
    if (related) {
      const record = catalog.interviews.find(item => item.id === related.dataset.related);
      if (record) { state = {...DEFAULT_STATE, view: 'interviews', record: record.id}; writeUrl('push'); render(); }
    }
  });
  $('#close-detail').addEventListener('click', () => $('#detail-dialog').close());
  $('#detail-dialog').addEventListener('close', () => { if (state.record) { state.record = ''; writeUrl(); } });
  $('#detail-dialog').addEventListener('click', event => {
    const rect = $('#detail-dialog').getBoundingClientRect();
    if (event.target === $('#detail-dialog') && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) $('#detail-dialog').close();
  });
  $('#detail-bookmark').addEventListener('click', () => { if (currentRecord) toggleSave(currentRecord.id); });
  $('#share-record').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(location.href); toast('已复制本条资料链接'); }
    catch { toast('可复制浏览器地址栏中的链接'); }
  });
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !$('#detail-dialog').open && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) && !document.activeElement?.isContentEditable) {
      event.preventDefault(); $('#search-input').focus();
    }
  });
  window.addEventListener('popstate', () => { state = readState(location.search); render(); });
  window.addEventListener('storage', event => {
    if (event.key !== STORE_KEY) return;
    try { const values = JSON.parse(event.newValue || '[]'); if (Array.isArray(values)) saved = new Set(values.filter(id => typeof id === 'string' && /^[A-Z]{1,4}\d{2,4}$/.test(id))); } catch { return; }
    render();
  });
}

async function initialize() {
  try {
    catalog = await fetchData('catalog.json');
    catalog.interviews = prepare(catalog.interviews);
    catalog.resources = prepare(catalog.resources);
    bindEvents();
    await render();
  } catch (error) {
    $('#results').setAttribute('aria-busy', 'false');
    $('#results-status').textContent = '资料未能载入';
    $('#results').innerHTML = '<div class="empty-state"><h3>资料暂时没加载出来</h3><p>可以刷新页面重试，或先去GitHub阅读。</p><a class="primary-button" href="https://github.com/Pyramiding/llm-interview-warehouse">在GitHub阅读</a></div>';
    console.error(error);
  }
}
initialize();
