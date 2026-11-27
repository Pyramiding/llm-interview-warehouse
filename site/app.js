import {DEFAULT_STATE, PAGE_SIZE, readState, stateQuery, filterRecords, paginate, searchableText, normalize, escapeHtml as esc, safeUrl, renderMarkdown} from './core.mjs?v=__SITE_VERSION__';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const icon = name => '<svg class="icon" aria-hidden="true"><use href="#i-' + name + '"></use></svg>';
const VIEW_NAMES = {interviews: '面经', questions: '题解与练习', resources: '参考资料', jobs: '招聘岗位', discussions: '话题', layoffs: '裁员动态'};
const VIEW_HEADINGS = {interviews: '面经原帖', questions: '专题题解与练习', resources: '参考资料', jobs: '大模型与算法岗位', discussions: '算法圈话题', layoffs: '裁员动态'};
const VIEW_UNITS = {interviews: '篇', questions: '道', resources: '份', jobs: '个', discussions: '条', layoffs: '条'};
const VIEW_ICONS = {interviews: 'doc', questions: 'code', resources: 'layers', jobs: 'briefcase', discussions: 'chat', layoffs: 'list'};
const SEPARATE_VIEWS = new Set(['jobs', 'discussions', 'layoffs']);
const COLLECTION_NAMES = {infra: 'LLM Infra', rag: 'RAG', agent: 'Agent', search: '搜广推', speech: '语音与客服'};
const STORE_KEY = 'llm-interview-warehouse:saved:v1';
const THEME_KEY = 'llm-interview-warehouse:theme';
const version = $('meta[name="site-version"]').content;
let state = pageState();
let catalog, questions, questionsPromise, renderRevision = 0, currentRecord;
let toastTimer, searchTimer;
let readerRecords = [], commandHits = [], commandIndex = 0, commandQuestionsUnavailable = false;
const LAYOUT_KEY = 'llm-interview-warehouse:layout';
let saved = new Set();
try {
  const stored = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
  if (Array.isArray(stored)) saved = new Set(stored.filter(id => typeof id === 'string' && /^[A-Z]{1,4}\d{2,4}$/.test(id)).slice(0, 10000));
} catch { /* Reading remains available if browser storage is disabled. */ }

function pageState() {
  const requested = readState(location.search);
  return SEPARATE_VIEWS.has(requested.view) && !$('#tab-' + requested.view) ? {...DEFAULT_STATE} : requested;
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $('#theme-toggle').setAttribute('aria-label', theme === 'dark' ? '切换浅色模式' : '切换深色模式');
  $('meta[name="theme-color"]').content = theme === 'dark' ? '#070b1b' : '#f2f5ff';
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
  clearTimeout(searchTimer);
  const query = $('#search-input').value;
  const searchChanged = query !== state.q;
  state = {...state, q: query, ...patch, page: searchChanged ? 1 : patch.page || 1, record: ''};
  if ($('#detail-dialog').open) $('#detail-dialog').close();
  writeUrl(replace ? 'replace' : 'push');
  render({scroll});
}

function prepare(records) {
  return records.map(record => ({...record, search_text: searchableText(record)}));
}

async function fetchData(file) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch('./data/' + file + '?v=' + encodeURIComponent(version), {
        signal: controller.signal, cache: attempt ? 'reload' : 'default',
      });
      if (!response.ok) throw new Error('Data request failed: ' + response.status);
      return await response.json();
    } catch (error) {
      if (attempt === 2) throw error;
    } finally {
      clearTimeout(timeout);
    }
    await new Promise(resolve => setTimeout(resolve, 350 * (attempt + 1)));
  }
}

async function loadData(file, embeddedId) {
  const embedded = document.getElementById(embeddedId);
  if (embedded) {
    try { return JSON.parse(embedded.textContent); }
    catch (error) { console.warn('Embedded data unavailable; retrying the data file.', error); }
  }
  return fetchData(file);
}

async function loadQuestions() {
  if (questions) return questions;
  if (!questionsPromise) {
    questionsPromise = loadData('questions.json', 'initial-questions').then(data => { questions = prepare(data); return questions; }).catch(error => { questionsPromise = null; throw error; });
  }
  return questionsPromise;
}

function setLayout(layout, persist = true) {
  if (!$('#layout-cards') || !$('#layout-compact')) return;
  const value = layout === 'compact' ? 'compact' : 'cards';
  $('#results').dataset.layout = value;
  for (const name of ['cards', 'compact']) $('#layout-' + name).setAttribute('aria-pressed', String(name === value));
  if (persist) try { localStorage.setItem(LAYOUT_KEY, value); } catch { /* Optional preference. */ }
}

function setQuickMode(mode) {
  const companies = mode === 'companies';
  $('#quick-companies').setAttribute('aria-pressed', String(companies));
  $('#quick-directions').setAttribute('aria-pressed', String(!companies));
  $('#direction-quick').hidden = companies;
  $('#company-quick').hidden = !companies;
}

function renderDiscoveries() {
  if (!$('#company-quick')) return;
  for (const button of $$('[data-explore]')) {
    if (button.dataset.explore === 'questions') continue;
    const count = catalog.interviews.filter(record => record.collections.includes(button.dataset.explore)).length;
    button.querySelector('.explore-count').textContent = count + ' 篇';
  }
  const counts = new Map();
  for (const record of catalog.interviews) for (const company of record.company_keys) counts.set(company, (counts.get(company) || 0) + 1);
  const names = ['字节', '阿里', '腾讯', '美团', '百度', '快手', '小红书', '蚂蚁集团'].filter(name => counts.has(name));
  $('#company-quick').innerHTML = names.map(name => '<button class="company-chip" data-company="' + esc(name) + '" aria-pressed="false" aria-label="筛选' + esc(name) + '面经，' + counts.get(name) + '篇">' + esc(name) + '<span>' + counts.get(name) + '</span></button>').join('');
}

function syncReader(record) {
  if (!$('#reader-position')) return;
  const records = state.view === 'questions' ? questions || [] : catalog[state.view];
  readerRecords = filterRecords(records, state, saved);
  let index = readerRecords.findIndex(item => item.id === record.id);
  if (index < 0) { readerRecords = [record]; index = 0; }
  $('#reader-prev').disabled = index === 0;
  $('#reader-next').disabled = index === readerRecords.length - 1;
  $('#reader-position').textContent = (index + 1) + ' / ' + readerRecords.length;
  $('#reader-prev').title = readerRecords[index - 1]?.title || '已是第一条';
  $('#reader-next').title = readerRecords[index + 1]?.title || '已是最后一条';
}

function updateReaderProgress() {
  if (!$('#reader-progress')) return;
  const content = $('#detail-content');
  const maximum = content.scrollHeight - content.clientHeight;
  const progress = maximum > 0 ? Math.max(0, Math.min(100, content.scrollTop / maximum * 100)) : 100;
  $('#reader-progress').setAttribute('aria-valuenow', String(Math.round(progress)));
  $('#reader-progress span').style.transform = 'scaleX(' + progress / 100 + ')';
}

function stepReader(direction) {
  const index = readerRecords.findIndex(item => item.id === currentRecord?.id);
  const next = readerRecords[index + direction];
  if (next) openRecord(next.id);
}

function syncCommandSelection(scroll = false) {
  const options = $$('#command-results [role="option"]');
  options.forEach((option, index) => option.setAttribute('aria-selected', String(index === commandIndex)));
  const active = options[commandIndex];
  if (active) {
    $('#command-input').setAttribute('aria-activedescendant', active.id);
    if (scroll) active.scrollIntoView({block: 'nearest'});
  } else $('#command-input').removeAttribute('aria-activedescendant');
}

function renderCommand() {
  if (!catalog || !$('#command-dialog').open) return;
  const query = normalize($('#command-input').value);
  const terms = query.split(/[\s、，,]+/u).filter(Boolean);
  let matches;
  if (!terms.length) matches = [...catalog.interviews].sort((a, b) => b.order - a.order);
  else {
    const pool = [...catalog.interviews, ...(questions || []), ...catalog.resources];
    for (const view of SEPARATE_VIEWS) if ($('#tab-' + view)) pool.push(...catalog[view]);
    const rank = record => normalize(record.id) === query ? 0 : terms.every(term => normalize(record.title).includes(term)) ? 1 : 2;
    matches = pool.filter(record => terms.every(term => record.search_text.includes(term))).sort((a, b) => rank(a) - rank(b) || a.kind.localeCompare(b.kind) || a.order - b.order);
  }
  commandHits = matches.slice(0, 8);
  commandIndex = 0;
  $('#command-status').textContent = (terms.length ? '找到 ' + matches.length + ' 条资料' + (matches.length > 8 ? '，显示前8条' : '') : '最近收录 · 输入关键词搜索全部资料') + (commandQuestionsUnavailable && !questions ? '；题解暂未载入' : '');
  $('#command-results').innerHTML = commandHits.length ? commandHits.map((record, index) => '<button role="option" tabindex="-1" id="command-hit-' + index + '" class="command-hit" aria-selected="' + (index === 0) + '" data-command-index="' + index + '" data-command-record="' + esc(record.id) + '"><span class="command-kind kind-' + record.kind + '">' + icon(VIEW_ICONS[record.kind]) + '</span><span class="command-hit-copy"><strong>' + esc(record.title) + '</strong><small>' + esc(record.id + ' · ' + VIEW_NAMES[record.kind] + ' · ' + (record.chapter || record.companies?.slice(0, 2).join(' / ') || record.platform)) + '</small></span>' + icon('chevron') + '</button>').join('') : '<p class="command-empty">没有找到匹配的资料，试试公司名、编号或技术词。</p>';
  syncCommandSelection();
}

async function openCommand() {
  if (!catalog || !$('#command-dialog')) return;
  if ($('#detail-dialog').open) { state.record = ''; writeUrl(); $('#detail-dialog').close(); }
  if (!$('#command-dialog').open) $('#command-dialog').showModal();
  $('#command-input').value = '';
  $('#command-input').focus();
  renderCommand();
  try { await loadQuestions(); commandQuestionsUnavailable = false; }
  catch { commandQuestionsUnavailable = true; }
  renderCommand();
}

async function chooseCommand(index) {
  const record = commandHits[index];
  if (!record) return;
  clearTimeout(searchTimer);
  $('#command-dialog').close();
  state = {...DEFAULT_STATE, view: record.kind, record: record.id};
  writeUrl('push');
  await render({scroll: true});
}

function option(value, label) {
  return '<option value="' + esc(value) + '">' + esc(label) + '</option>';
}

function fillFilters() {
  const discussions = state.view === 'discussions';
  const layoffs = state.view === 'layoffs';
  const rows = state.view === 'questions' ? catalog.interviews : catalog[state.view];
  const companies = new Map(layoffs ? catalog.jobs.map(job => [job.company_key, 0]) : []);
  const years = new Map(), platforms = new Map();
  for (const record of rows) {
    for (const company of record.company_keys || []) companies.set(company, (companies.get(company) || 0) + 1);
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
  $('#platform-filter').innerHTML = option('', '全部平台') + [...platforms].sort((a, b) => b[1] - a[1]).map(([name, count]) => option(name, name + ' · ' + count)).join('');
  if (discussions) {
    $('#discussion-category-filter').innerHTML = option('', '全部话题') + Object.entries(catalog.discussion_categories || {}).map(([key, name]) => option(key, name)).join('');
  }
  if (layoffs) {
    $('#layoff-status-filter').innerHTML = option('', '全部状态') + Object.entries(catalog.layoff_status_labels || {}).map(([key, name]) => option(key, name)).join('');
  }
  if (SEPARATE_VIEWS.has(state.view)) return;
  $('#topic-filter').innerHTML = option('', '全部专题') + catalog.topics.filter(topic => state.view === 'questions' || !topic.id.startsWith('practice-')).map(topic => option(topic.id, (topic.id.startsWith('practice-') ? '' : topic.id + ' · ') + topic.name)).join('');
  let specialtyOptions = option('', '全部方向');
  for (const group of ['LLM Infra', 'Agent与模型工程', '应用场景']) {
    specialtyOptions += '<optgroup label="' + esc(group) + '">' + option('group:' + group, group + ' · 全部');
    specialtyOptions += catalog.specialties.filter(item => item.group === group).map(item => option(item.id, item.name)).join('') + '</optgroup>';
  }
  $('#specialty-filter').innerHTML = specialtyOptions;
  $('#domain-filter').innerHTML = option('', '全部领域') + ['搜索', '广告', '推荐', '用户增长', '营销', '风控', '语音', '客服'].map(name => option(name, name)).join('');
  $('#year-filter').innerHTML = option('', '全部年份') + [...years].sort((a, b) => a[0] === 'unknown' ? 1 : b[0] === 'unknown' ? -1 : b[0].localeCompare(a[0])).map(([year, count]) => option(year, (year === 'unknown' ? '年份未确认' : year) + ' · ' + count)).join('');
}

function setupJobModule() {
  if (!$('#job-filters')) return;
  const {jobs, job_directions = {}, job_status_labels = {}, job_channels = [], jobs_checked} = catalog;
  const options = [
    ['job-direction-filter', '全部方向', Object.entries(job_directions)],
    ['job-city-filter', '全部城市', [...new Set(jobs.flatMap(job => job.cities))].sort((a, b) => a.localeCompare(b, 'zh-CN')).map(city => [city, city])],
    ['job-type-filter', '全部类型', ['社招', '校招', '实习', '未说明'].filter(type => jobs.some(job => job.job_type === type)).map(type => [type, type])],
    ['job-status-filter', '全部状态', Object.entries(job_status_labels)],
  ];
  for (const [id, label, entries] of options) {
    $('#' + id).innerHTML = option('', label) + entries.map(([key, text]) => option(key, text)).join('');
  }
  const date = $('#jobs-checked');
  if (jobs_checked) {
    date.textContent = jobs_checked;
    date.dateTime = jobs_checked;
  } else date.parentElement.hidden = true;
  $('#job-channel-list').innerHTML = job_channels.map(channel =>
    '<li>' + externalLink(channel.url, channel.name) + '<p>' + esc(channel.guide) + '</p></li>').join('');
}

function filterLabel(key, value) {
  if (key === 'q') return '搜索：' + value;
  if (key === 'saved') return '我的收藏';
  if (key === 'collection') return COLLECTION_NAMES[value];
  if (key === 'topic') return catalog.topics.find(topic => topic.id === value)?.name || value;
  if (key === 'specialty') return value.startsWith('group:') ? value.slice(6) : catalog.specialties.find(item => item.id === value)?.name || value;
  if (key === 'year') return value === 'unknown' ? '年份未确认' : value + '年';
  if (key === 'direction') return catalog.job_directions?.[value] || value;
  if (key === 'job_status') return catalog.job_status_labels?.[value] || value;
  if (key === 'discussion_category') return catalog.discussion_categories?.[value] || value;
  if (key === 'layoff_status') return catalog.layoff_status_labels?.[value] || value;
  return value;
}

function syncControls() {
  const jobs = state.view === 'jobs';
  const discussions = state.view === 'discussions';
  const layoffs = state.view === 'layoffs';
  const question = state.view === 'questions';
  const separate = SEPARATE_VIEWS.has(state.view);
  const dated = discussions || layoffs;
  fillFilters();
  if ($('#library-title')) {
    $('#library-title').textContent = VIEW_HEADINGS[state.view];
    $('#library').dataset.view = state.view;
  }
  $('#official-open-toggle')?.setAttribute('aria-pressed', String(officialOpenSelected()));
  for (const tab of $$('.library-tab')) {
    const active = tab.dataset.view === state.view;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  }
  $$('.source-filter').forEach(field => { field.hidden = question; });
  $$('.study-filter').forEach(field => { field.hidden = separate || (question && field.classList.contains('source-filter')); });
  $('#company-filter').closest('.filter-field').hidden = question || discussions;
  for (const id of ['jobs-intro', 'job-filters']) if ($('#' + id)) $('#' + id).hidden = !jobs;
  for (const id of ['discussion-caption', 'discussion-filters']) if ($('#' + id)) $('#' + id).hidden = !discussions;
  for (const id of ['layoff-caption', 'layoff-filters']) if ($('#' + id)) $('#' + id).hidden = !layoffs;
  if ($('#discovery-rail')) $('#discovery-rail').hidden = separate;
  for (const link of $$('[data-library-view], .jobs-entry')) {
    if (state.view === (link.dataset.libraryView || 'jobs')) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  for (const field of $$('[data-filter]')) field.value = state[field.dataset.filter];
  for (const chip of $$('[data-collection]')) {
    const active = chip.dataset.collection === state.collection;
    chip.classList.toggle('active', active);
    chip.setAttribute('aria-pressed', String(active));
  }
  if ($('#search-input').value !== state.q) $('#search-input').value = state.q;
  $('#search-input').placeholder = layoffs ? '搜公司、业务或地区' : jobs ? '搜公司、岗位或技能' : discussions ? '搜模型、工具或讨论内容' : question ? '搜题目或作答要点' : '搜公司、技术词或项目';
  $('#sort-select').innerHTML = option('recent', layoffs ? '最新披露' : jobs ? '最近核验' : discussions ? '最新发帖' : question ? '专题顺序' : '最近收录') +
    (question || dated ? '' : option('published', '发布时间')) + option('title', jobs ? '岗位名称' : '标题顺序');
  if ((question || dated) && state.sort === 'published') state.sort = 'recent';
  $('#sort-select').value = state.sort;
  $('#saved-toggle').setAttribute('aria-pressed', String(state.saved));
  $('#saved-toggle').setAttribute('aria-label', '只看我的收藏，共' + saved.size + '项');
  $('#saved-count').textContent = saved.size;
  for (const chip of $$('#company-quick [data-company]')) chip.setAttribute('aria-pressed', String(state.view === 'interviews' && state.company === chip.dataset.company));
  $('.sidebar-note-title').textContent = layoffs ? '怎么看人数' : jobs ? '关于投递状态' : discussions ? '原帖与评论' : question ? '按知识点复习' : '读面经，也看上下文';
  $('.sidebar-note p').textContent = layoffs ? '人数按来源的业务、地区和时间口径记录。暂无收录的公司仍保留在筛选清单里。' : jobs ? '状态以条目所列核验日期为准。招聘方可随时关闭或调整岗位。' : discussions ? '原帖保留作者和上下文。部分平台在 App 里才能查看完整内容或评论。' : question ? '题解按公开论文与文档编写，参考链接随题保留。具体企业问了什么，可以回面经原帖查看。' : '公司、岗位和过程沿用原作者描述。日期疑问、付费截断等情况见条目备注。';
  if ($('.sidebar-note a')) {
    $('.sidebar-note a').href = catalog.repo_url + (layoffs ? '/blob/main/docs/layoffs.md' : jobs ? '/blob/main/docs/recruiting/README.md' : discussions ? '/blob/main/docs/discussions.md' : '/blob/main/docs/methodology.md');
    $('.sidebar-note a span')?.replaceChildren(layoffs ? '在 GitHub 读时间线' : discussions ? '在 GitHub 读话题' : '来源说明');
  }
  if ($('.contribute-link')) $('.contribute-link').hidden = separate;
  const filterKeys = jobs ? ['q', 'direction', 'company', 'city', 'job_type', 'job_status', 'platform', 'saved'] :
    layoffs ? ['q', 'company', 'layoff_status', 'platform', 'saved'] :
    discussions ? ['q', 'discussion_category', 'platform', 'saved'] : question ? ['q', 'collection', 'topic', 'saved'] : ['q', 'collection', 'company', 'topic', 'specialty', 'domain', 'year', 'platform', 'saved'];
  const active = filterKeys.filter(key => state[key]);
  $('#active-filters').innerHTML = active.map(key => '<button class="filter-tag" data-remove="' + key + '" aria-label="移除条件：' + esc(filterLabel(key, state[key])) + '">' + esc(filterLabel(key, state[key])) + icon('close') + '</button>').join('');
  $('#mobile-filter-count').textContent = active.length ? '· ' + active.length : '';
  $('#results').setAttribute('aria-labelledby', 'tab-' + state.view);
}

function officialOpenSelected() {
  return state.job_status === 'apply_link' && state.platform === '招聘官网';
}

function externalLink(url, label, className = '', context = '') {
  const href = safeUrl(url);
  const description = context ? '<span class="sr-only">：' + esc(context) + '</span>' : '';
  return href ? '<a class="' + className + '" href="' + esc(href) + '" target="_blank" rel="noopener noreferrer">' + esc(label) + description + icon('arrow') + '</a>' : '';
}

function companyPage(view, company) {
  return '?' + stateQuery({...DEFAULT_STATE, view, company}) + '#library';
}

function shortDate(record) {
  if (record.published_at) return record.published_at.slice(0, 10);
  if (record.published) return record.published;
  return record.year || (record.platform === 'GitHub' ? '持续更新' : '日期未确认');
}

function topicTone(id) {
  const tones = {'01':'blue','02':'cyan','03':'violet','04':'pink','05':'blue','06':'cyan','07':'violet','08':'blue','09':'violet','10':'amber','11':'violet','12':'pink','13':'cyan','14':'blue','15':'amber','16':'cyan','17':'amber','18':'violet','19':'pink','20':'pink','21':'amber','22':'blue','23':'cyan'};
  return tones[id] || 'blue';
}

function cardTone(record) {
  const colors = {infra:'blue',agent:'violet',rag:'cyan',search:'amber',speech:'pink'};
  const group = ['infra','agent','rag','search','speech'].find(key => record.collections?.includes(key));
  return group ? colors[group] : topicTone(record.topic_ids[0]);
}

function bookmarkButton(record) {
  const active = saved.has(record.id);
  const label = active ? '取消收藏' : '收藏';
  return `<button class="icon-button record-bookmark" data-save="${esc(record.id)}"
    aria-label="${label}：${esc(record.title)}" aria-pressed="${active}" title="${label}">${icon('bookmark')}</button>`;
}

function jobCard(record) {
  const tags = [record.direction_label, ...record.skills.slice(0, 2)];
  const sourceLabel = record.verification === 'reprint' ? '查看转载' : '招聘原页';
  const facts = [record.job_type, record.cities.join(' / ') || '地点待确认'];
  if (record.updated) facts.push(record.updated + ' 更新');
  else if (record.published) facts.push(record.published + (record.verification === 'reprint' ? ' 转载' : ' 发布'));
  return `<article class="record-card job-card" data-tone="${cardTone(record)}" data-record="${esc(record.id)}">
    <div class="record-eyebrow">
      <span class="record-company">${esc(record.company)}</span>
      <span class="meta-dot">·</span><span>${esc(record.platform)}</span>
      <span class="job-status" data-status="${esc(record.job_status)}">${esc(record.status_label)}</span>
      ${bookmarkButton(record)}
    </div>
    <h3><button class="record-title" data-open="${esc(record.id)}">${esc(record.title)}</button></h3>
    <p class="job-facts">${esc(facts.join(' · '))}</p>
    <p class="record-excerpt">${esc(record.summary)}</p>
    <div class="record-bottom">
      <div class="record-tags">${tags.map(tag => '<span class="record-tag">' + esc(tag) + '</span>').join('')}</div>
      <div class="record-actions">
        ${externalLink(record.url, sourceLabel, 'read-source')}
        <button class="read-detail" data-open="${esc(record.id)}">岗位详情${icon('chevron')}</button>
      </div>
    </div>
  </article>`;
}

function discussionCard(record) {
  const tones = {models: 'violet', agents: 'cyan', infra: 'blue', applications: 'pink', careers: 'amber', research: 'violet'};
  const date = record.published ? `<time datetime="${esc(record.published)}">${esc(record.published)}</time>` : '日期未确认';
  return `<article class="record-card discussion-card" data-tone="${tones[record.category] || 'blue'}" data-record="${esc(record.id)}">
    <header>
      <div class="record-eyebrow"><span class="discussion-platform">${esc(record.platform)}</span><span>${date}</span><span>${esc(record.post_type)}</span>${bookmarkButton(record)}</div>
      <h3><button type="button" class="record-title" data-open="${esc(record.id)}">${esc(record.title)}</button></h3>
    </header>
    <p class="record-excerpt">${esc(record.summary)}</p>
    <footer class="record-bottom">
      <div class="record-tags"><span class="record-tag">${esc(record.category_label)}</span>${record.verification === 'excerpt' ? '<span class="restricted-tag">公开摘录</span>' : ''}</div>
      <div class="record-actions">${externalLink(record.url, '看原帖', 'read-source', record.title)}<button type="button" class="read-detail" data-open="${esc(record.id)}">讨论焦点<span class="sr-only">：${esc(record.title)}</span>${icon('chevron')}</button></div>
    </footer>
  </article>`;
}

function layoffCard(record) {
  const tones = {confirmed: 'violet', reported: 'amber', response: 'cyan'};
  const facts = [record.scope, record.impact].filter(Boolean).join(' · ');
  return `<article class="record-card layoff-card" data-tone="${tones[record.status]}" data-record="${esc(record.id)}">
    <div class="record-eyebrow">
      <span class="record-company">${esc(record.company_key)}</span>
      <time datetime="${esc(record.published)}">${esc(record.published)}</time>
      <span>${esc(record.platform)}</span>
      ${bookmarkButton(record)}
    </div>
    <h3><button type="button" class="record-title" data-open="${esc(record.id)}">${esc(record.title)}</button></h3>
    <p class="job-facts">${esc(facts)}</p>
    <p class="record-excerpt">${esc(record.summary)}</p>
    <div class="record-bottom">
      <div class="record-tags"><span class="record-tag">${esc(record.status_label)}</span></div>
      <div class="record-actions">
        ${externalLink(record.url, '看来源', 'read-source', record.title)}
        <button type="button" class="read-detail" data-open="${esc(record.id)}">查看详情${icon('chevron')}</button>
      </div>
    </div>
  </article>`;
}

function card(record) {
  if (record.kind === 'jobs') return jobCard(record);
  if (record.kind === 'discussions') return discussionCard(record);
  if (record.kind === 'layoffs') return layoffCard(record);
  const question = state.view === 'questions';
  const company = record.companies?.length ? record.companies.slice(0, 2).join(' / ') + (record.companies.length > 2 ? ' 等' : '') : (record.company_keys?.[0] || '通用资料');
  const tags = question ? [record.chapter, record.difficulty] : (record.topic_names.length ? record.topic_names.slice(0, 2) : [record.source_label]);
  if (!question && record.topic_names.length > 2) tags.push('+' + (record.topic_names.length - 2));
  const restricted = !question && record.verification !== 'opened' ? '<span class="restricted-tag">' + esc(record.access_label) + '</span>' : '';
  const excerpt = record.summary || record.note || record.role || '';
  return `<article class="record-card" data-tone="${cardTone(record)}" data-record="${esc(record.id)}">
    <div class="record-eyebrow"><span class="record-id">${esc(record.id)}</span><span class="meta-dot">/</span><span class="record-company">${esc(question ? record.chapter : company)}</span><span class="meta-dot">·</span><span>${esc(question ? '复习题' : record.platform)}</span><span class="meta-dot">·</span><span>${esc(question ? record.difficulty : shortDate(record))}</span>${restricted}${bookmarkButton(record)}</div>
    <h3><button class="record-title" data-open="${esc(record.id)}">${esc(record.title)}</button></h3>
    <p class="record-excerpt">${esc(excerpt)}</p>
    <div class="record-bottom"><div class="record-tags">${tags.filter(Boolean).map(tag => { const topic = catalog.topics.find(item => item.name === tag); return '<span class="record-tag tag-' + (topic ? topicTone(topic.id) : 'neutral') + '">' + esc(tag) + '</span>'; }).join('')}</div><div class="record-actions">${externalLink(record.url, question ? '看本专题' : state.view === 'resources' ? '打开资料' : '读原帖', 'read-source')}<button class="read-detail" data-open="${esc(record.id)}">${question ? '查看题解' : '查看摘要'}${icon('chevron')}</button></div></div>
  </article>`;
}

function emptyState() {
  if (state.view === 'layoffs' && state.company && !catalog.layoffs.some(record => record.company_key === state.company)) {
    const jobsLink = state.company === '公司未明确' ? '' : ' <a class="secondary-button" href="' + esc(companyPage('jobs', state.company)) + '">查看同公司岗位</a>';
    return '<div class="empty-state">' + icon('search') + '<h3>该公司暂无收录</h3><p>这个专题暂缺可核验的公开记录。</p><button type="button" class="primary-button" data-reset>查看全部裁员动态</button>' + jobsLink + '</div>';
  }
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
    $('#results-status').innerHTML = '<span class="result-total">' + result.total + '</span> ' + VIEW_UNITS[state.view] + VIEW_NAMES[state.view] + (result.total ? '<span class="result-range"> · ' + ((result.page - 1) * PAGE_SIZE + 1) + '–' + Math.min(result.page * PAGE_SIZE, result.total) + '</span>' : '');
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

function jobDetails(record) {
  const list = (items = []) => items.length
    ? '<ul>' + items.map(item => '<li>' + esc(item) + '</li>').join('') + '</ul>' : '';
  const dateLabel = record.verification === 'reprint' ? '转载日期' : '发布日期';
  let content = '<dl class="detail-metadata">' + [
    ['公司 / 机构', record.company], ['团队 / 业务', record.team], ['工作地点', record.cities.length ? record.cities : '待确认'],
    ['招聘类型', record.job_type], ['岗位方向', record.direction_label], ['来源', record.platform + ' · ' + record.access_label],
    ['投递状态', record.status_label], ['核验日期', record.accessed], [dateLabel, record.published],
    ['官网更新', record.updated],
    ['投递截止', record.deadline],
  ].map(([label, value]) => metadataRow(label, value)).join('') + '</dl>';
  content += section('主要职责', list(record.responsibilities));
  content += section('任职要求', list(record.requirements) || '<p>公开资料中的任职门槛有待确认。</p>');
  content += section('优先条件', list(record.preferred));
  if (record.skills.length) content += section('技术关键词', '<p>' + esc(record.skills.join(' · ')) + '</p>');
  content += section('核验说明', '<p>' + esc(record.status_note) + '</p>', 'notes');
  const company = catalog.interviews.some(item => item.company_keys.includes(record.company_key));
  if (company) {
    content += section('同公司面经',
      '<button class="topic-link" data-company-interviews="' + esc(record.company_key) + '">查看' + esc(record.company) + '面经</button>');
  }
  if ($('#tab-layoffs') && record.company_key !== '公司未明确') {
    content += section('同公司裁员动态',
      '<a class="topic-link" href="' + esc(companyPage('layoffs', record.company_key)) + '">查看裁员动态</a>');
  }
  return content;
}

function discussionDetails(record) {
  const metadata = [
    ['话题', record.category_label], ['来源', record.platform + ' · ' + record.post_type],
    ['发帖日期', record.published || '未确认'], ['查阅日期', record.accessed], ['阅读情况', record.access_label],
  ];
  return '<dl class="detail-metadata">' + metadata.map(([label, value]) => metadataRow(label, value)).join('') + '</dl>' +
    section('原帖在聊什么', '<p>' + esc(record.summary) + '</p>') +
    section('讨论焦点', '<p>' + esc(record.angle) + '</p>') +
    section('来源备注', record.note ? '<p>' + esc(record.note) + '</p>' : '', 'notes');
}

function layoffDetails(record) {
  const metadata = [
    ['公司', record.company_key], ['公告或报道日期', record.published], ['公开状态', record.status_label],
    ['涉及范围', record.scope], ['人数口径', record.impact], ['来源', record.platform],
  ];
  return '<dl class="detail-metadata">' + metadata.map(([label, value]) => metadataRow(label, value)).join('') + '</dl>' +
    section('事件摘要', '<p>' + esc(record.summary) + '</p>') +
    section('来源说明', '<p>' + esc(record.note) + '</p>', 'notes') +
    section('同公司岗位',
      '<a class="topic-link" href="' + esc(companyPage('jobs', record.company_key)) + '">查看同公司岗位</a>');
}

function showRecord(record) {
  const dialog = $('#detail-dialog');
  currentRecord = record;
  syncReader(record);
  $('#detail-bookmark').setAttribute('aria-pressed', String(saved.has(record.id)));
  $('#detail-bookmark').setAttribute('aria-label', saved.has(record.id) ? '取消收藏本条资料' : '收藏本条资料');
  if (dialog.open && dialog.dataset.record === record.id) return;
  dialog.dataset.record = record.id;
  const question = record.kind === 'questions';
  const jobs = record.kind === 'jobs';
  const discussions = record.kind === 'discussions';
  const layoffs = record.kind === 'layoffs';
  $('#detail-kicker').textContent = question ? '专题题解 / ' + record.chapter : VIEW_NAMES[record.kind] + ' / ' + record.platform;
  let content = '<span class="detail-id">' + esc(record.id) + '</span><h2 id="detail-title" tabindex="-1">' + esc(record.title) + '</h2>';
  const sourceLabel = jobs ? (record.verification === 'reprint' ? '查看公开转载' : '查看招聘原页') :
    layoffs ? '查看原始来源' : question ? '在GitHub读本专题' : record.kind === 'resources' ? '打开资料' : '阅读原帖';
  content += '<div class="detail-links">' + externalLink(record.url, sourceLabel, 'primary-button');
  if (record.evidence_url) content += externalLink(record.evidence_url, record.evidence_label || (jobs ? '查看公开摘要' : '其他阅读入口'), 'secondary-button');
  content += '</div>';
  if (question) content += '<div class="markdown">' + renderMarkdown(record.body, record.url) + '</div>';
  else if (jobs) content += jobDetails(record);
  else if (discussions) content += discussionDetails(record);
  else if (layoffs) content += layoffDetails(record);
  else {
    content += '<dl class="detail-metadata">' + metadataRow('公司', record.companies?.length ? record.companies : '未明确') + metadataRow('岗位 / 内容', record.role) + metadataRow('面试时间', record.event_date) + metadataRow(record.published_at ? '发布时间' : '页面日期', displayTime(record.published_at || record.published)) + metadataRow('编辑时间', record.updated_at !== record.published_at ? displayTime(record.updated_at) : '') + metadataRow('查阅日期', record.accessed) + metadataRow('作者', record.author) + metadataRow('阅读情况', record.access_label) + metadataRow('资料类型', record.source_label) + '</dl>';
    content += section('主要内容', record.summary ? '<p>' + esc(record.summary) + '</p>' : '');
    if (record.question_prompts?.length) content += section('问题摘录', '<ol>' + record.question_prompts.map(prompt => '<li>' + esc(prompt) + '</li>').join('') + '</ol>');
    content += section('准备时可以留意', record.reading_tip ? '<p>' + esc(record.reading_tip) + '</p>' : '');
    content += section('备注', record.note ? '<p>' + esc(record.note) + '</p>' : '', 'notes');
    if (record.alternate_urls?.length) content += section('同文链接', record.alternate_urls.map((url, i) => externalLink(url, '入口 ' + (i + 1), 'secondary-button')).join(' '));
    if (record.related_interview_id) content += section('相关面经', '<button class="topic-link" data-related="' + esc(record.related_interview_id) + '">' + esc(record.related_interview_id) + ' · 查看摘要</button>');
  }
  const topics = catalog.topics.filter(topic => record.topic_ids?.includes(topic.id));
  if (!question && topics.length) content += section('相关题解', '<div class="topic-links">' + topics.map(topic => '<button class="topic-link" data-topic="' + esc(topic.id) + '">' + esc(topic.name) + ' ↗</button>').join('') + '</div>');
  $('#detail-content').innerHTML = content;
  $('#detail-content').scrollTop = 0;
  if (!dialog.open) dialog.showModal();
  $('#detail-title').focus({preventScroll: true});
  updateReaderProgress();
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

// A cached older HTML document can still use the core browser with newer assets.
function bindExperienceEvents() {
  if (!$('#command-dialog') || !$('#explore') || !$('#company-quick')) return;
  $('#start-browsing').addEventListener('click', event => {
    if (!catalog || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate({...DEFAULT_STATE, view: 'interviews'});
    $('#library').scrollIntoView({block: 'start'});
    $('#search-input').focus({preventScroll: true});
  });
  $('#nav-companies').addEventListener('click', () => {
    if (state.view !== 'interviews') navigate({...DEFAULT_STATE, view: 'interviews'});
    setQuickMode('companies');
    $('#library').scrollIntoView({block: 'start'});
    $('#company-quick button')?.focus({preventScroll: true});
  });
  $('#quick-directions').addEventListener('click', () => setQuickMode('directions'));
  $('#quick-companies').addEventListener('click', () => setQuickMode('companies'));
  $('#company-quick').addEventListener('click', event => { const chip = event.target.closest('[data-company]'); if (chip) navigate({...DEFAULT_STATE, view: 'interviews', company: chip.dataset.company}, {scroll: true}); });
  $('#explore').addEventListener('click', event => {
    const card = event.target.closest('[data-explore]');
    if (!card) return;
    setQuickMode('directions');
    const view = card.dataset.explore === 'questions' ? 'questions' : 'interviews';
    navigate({...DEFAULT_STATE, view, collection: view === 'interviews' ? card.dataset.explore : ''}, {scroll: true});
  });
  for (const layout of ['cards', 'compact']) $('#layout-' + layout).addEventListener('click', () => setLayout(layout));
  $('#reader-prev').addEventListener('click', () => stepReader(-1));
  $('#reader-next').addEventListener('click', () => stepReader(1));
  $('#detail-content').addEventListener('scroll', updateReaderProgress, {passive: true});
  $('#command-open').addEventListener('click', openCommand);
  $('#command-close').addEventListener('click', () => $('#command-dialog').close());
  $('#command-input').addEventListener('input', renderCommand);
  $('#command-input').addEventListener('keydown', event => {
    if (event.isComposing) return;
    if (event.key === 'Escape') { event.preventDefault(); $('#command-dialog').close(); return; }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!commandHits.length) return;
      commandIndex = (commandIndex + (event.key === 'ArrowDown' ? 1 : -1) + commandHits.length) % commandHits.length;
      syncCommandSelection(true);
    } else if (event.key === 'Enter') { event.preventDefault(); chooseCommand(commandIndex); }
  });
  $('#command-results').addEventListener('click', event => { const hit = event.target.closest('[data-command-index]'); if (hit) chooseCommand(Number(hit.dataset.commandIndex)); });
  $('#command-results').addEventListener('pointermove', event => { const hit = event.target.closest('[data-command-index]'); if (hit) { commandIndex = Number(hit.dataset.commandIndex); syncCommandSelection(); } }, {passive: true});
  $('.command-suggestions').addEventListener('click', event => { const suggestion = event.target.closest('[data-command-query]'); if (suggestion) { $('#command-input').value = suggestion.dataset.commandQuery; $('#command-input').focus(); renderCommand(); } });
  $('#command-dialog').addEventListener('click', event => {
    if (event.target !== $('#command-dialog')) return;
    const rect = $('#command-dialog').getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) $('#command-dialog').close();
  });
}

function bindEvents() {
  bindExperienceEvents();
  $('#official-open-toggle')?.addEventListener('click', () => {
    const selected = officialOpenSelected();
    navigate({job_status: selected ? '' : 'apply_link', platform: selected ? '' : '招聘官网'});
  });
  for (const link of $$('[data-library-view], .jobs-entry')) link.addEventListener('click', event => {
    if (!catalog || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate({...DEFAULT_STATE, view: link.dataset.libraryView || 'jobs'});
    $('#library').scrollIntoView({block: 'start'});
  });
  for (const tab of $$('.library-tab')) tab.addEventListener('click', () => {
    const view = tab.dataset.view;
    if (view !== state.view && (SEPARATE_VIEWS.has(view) || SEPARATE_VIEWS.has(state.view))) {
      navigate({...DEFAULT_STATE, view, q: $('#search-input').value, saved: state.saved});
    } else navigate({view, sort: 'recent'});
  });
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
    else if (event.target.closest('[data-retry]')) { if (catalog) render(); else initialize(); }
  });
  $('#pagination').addEventListener('click', event => {
    const button = event.target.closest('[data-page]');
    if (button && !button.disabled) navigate({page: Number(button.dataset.page)}, {scroll: true});
  });
  $('#detail-content').addEventListener('click', event => {
    const topic = event.target.closest('[data-topic]');
    const related = event.target.closest('[data-related]');
    const company = event.target.closest('[data-company-interviews]');
    if (company) navigate({...DEFAULT_STATE, view: 'interviews', company: company.dataset.companyInterviews}, {scroll: true});
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
    if ($('#command-dialog') && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if ($('#command-dialog').open) $('#command-dialog').close(); else openCommand();
      return;
    }
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !$('#detail-dialog').open && !$('#command-dialog')?.open && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) && !document.activeElement?.isContentEditable) {
      event.preventDefault(); $('#search-input').focus();
    }
  });
  window.addEventListener('popstate', () => {
    clearTimeout(searchTimer);
    state = pageState();
    render();
  });
  window.addEventListener('storage', event => {
    if (event.key !== STORE_KEY) return;
    try { const values = JSON.parse(event.newValue || '[]'); if (Array.isArray(values)) saved = new Set(values.filter(id => typeof id === 'string' && /^[A-Z]{1,4}\d{2,4}$/.test(id))); } catch { return; }
    render();
  });
}

async function initialize() {
  $('#results').setAttribute('aria-busy', 'true');
  $('#results-status').textContent = '正在载入资料…';
  const retry = $('#results [data-retry]');
  if (retry) { retry.disabled = true; retry.textContent = '正在载入…'; }
  try {
    catalog = await loadData('catalog.json', 'initial-catalog');
    catalog.interviews = prepare(catalog.interviews);
    catalog.resources = prepare(catalog.resources);
    catalog.jobs = prepare(catalog.jobs ?? []);
    catalog.discussions = prepare(catalog.discussions ?? []);
    catalog.layoffs = prepare(catalog.layoffs ?? []);
    setupJobModule();
    renderDiscoveries();
    const commandOpen = $('#command-open');
    if (commandOpen) commandOpen.disabled = false;
    await render();
  } catch (error) {
    catalog = undefined;
    $('#results').setAttribute('aria-busy', 'false');
    $('#results-status').textContent = '资料未能载入';
    $('#results').innerHTML = '<div class="empty-state"><h3>资料暂时没加载出来</h3><p>可以重新载入，或先去GitHub阅读。</p><button class="primary-button" data-retry>重新载入</button> <a class="secondary-button" href="https://github.com/Pyramiding/llm-interview-warehouse" target="_blank" rel="noopener noreferrer">在GitHub阅读</a></div>';
    console.error(error);
  }
}
try { setLayout(localStorage.getItem(LAYOUT_KEY), false); } catch { setLayout('cards', false); }
if ($('#command-shortcut')) $('#command-shortcut').textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K';
bindEvents();
initialize();
