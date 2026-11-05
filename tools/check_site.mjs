import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DEFAULT_STATE, readState, stateQuery, filterRecords, paginate, PAGE_SIZE, safeUrl, escapeHtml, renderInline, renderMarkdown} from '../site/core.mjs';

const catalog = JSON.parse(await readFile(new URL('../_site/data/catalog.json', import.meta.url), 'utf8'));
const questions = JSON.parse(await readFile(new URL('../_site/data/questions.json', import.meta.url), 'utf8'));
const state = patch => ({...DEFAULT_STATE, ...patch});
let checks = 0;
function check(name, run) { run(); checks++; console.log('Passed: ' + name); }

check('Company aliases and combined company/technical search', () => {
  const result = filterRecords(catalog.interviews, state({company: '阿里', collection: 'infra', q: 'CUDA'}));
  assert(result.some(item => item.id === 'INT502'));
  assert(result.some(item => item.id === 'INT501'));
  assert(result.every(item => item.company_keys.includes('阿里')));
  assert(!result.some(item => item.id === 'INT503'));
  assert(filterRecords(catalog.interviews, state({q: '字节 CUDA'})).some(item => item.id === 'INT503'));
  assert(filterRecords(catalog.interviews, state({q: '字节、cuda'})).some(item => item.id === 'INT503'));
});
check('Infra and specialty filters follow the curated references', () => {
  const ids = new Set(catalog.specialties.filter(item => item.group === 'LLM Infra').flatMap(item => item.interview_ids));
  const result = filterRecords(catalog.interviews, state({collection: 'infra'}));
  assert.deepEqual(new Set(result.map(item => item.id)), ids);
  const kernel = catalog.specialties.find(item => item.id === 'infra-kernel');
  assert.deepEqual(new Set(filterRecords(catalog.interviews, state({specialty: 'infra-kernel'})).map(item => item.id)), new Set(kernel.interview_ids));
});
check('Unknown years, original platforms and browser-local saved filters', () => {
  const unknown = filterRecords(catalog.interviews, state({year: 'unknown'}));
  assert(unknown.length > 0 && unknown.every(item => !item.year));
  const zhihu = filterRecords(catalog.interviews, state({platform: '知乎'}));
  assert(zhihu.length > 0 && zhihu.every(item => item.platform === '知乎'));
  assert.deepEqual(filterRecords(catalog.interviews, state({saved: true}), new Set(['INT503'])).map(item => item.id), ['INT503']);
  assert.equal(filterRecords(catalog.interviews, state({saved: true})).length, 0);
});
check('Question search and practice chapters remain available', () => {
  const result = filterRecords(questions, state({view: 'questions', q: 'RRF'}));
  assert(result.some(item => item.id === 'R05'));
  const code = filterRecords(questions, state({view: 'questions', topic: 'practice-code'}));
  assert.equal(code.length, catalog.topics.find(topic => topic.id === 'practice-code').count);
  assert(code.some(item => item.id === 'H01'));
  const infra = filterRecords(questions, state({view: 'questions', collection: 'infra', company: '阿里'}));
  assert.equal(infra.length, catalog.topics.filter(topic => ['08', '09', '10'].includes(topic.id)).reduce((sum, topic) => sum + topic.count, 0));
  assert(infra.every(item => ['08', '09', '10'].includes(item.topic_ids[0])));
});
check('Shareable filters, record links and invalid URLs', () => {
  const value = state({view: 'interviews', company: '阿里', q: 'CUDA Graph', collection: 'infra', record: 'INT502', page: 2, saved: true});
  assert.deepEqual(readState('?' + stateQuery(value)), value);
  assert.equal(readState('?view=invalid&page=-3&record=<script>').view, 'interviews');
  assert.equal(readState('?view=invalid&page=-3&record=<script>').page, 1);
  assert.equal(readState('?record=<script>').record, '');
  assert.equal(readState('?saved=false').saved, false);
  assert.equal(readState('?q=' + 'x'.repeat(400)).q.length, 200);
});
check('Pagination does not skip or duplicate records', () => {
  const records = filterRecords(catalog.interviews, state({}));
  const pages = Math.ceil(records.length / PAGE_SIZE);
  const all = Array.from({length: pages}, (_, index) => paginate(records, index + 1).items).flat();
  assert.deepEqual(all.map(item => item.id), records.map(item => item.id));
  assert.equal(paginate(records, 100000).page, pages);
  assert.equal(paginate([], 8).page, 1);
});
check('Raw HTML and unsafe links cannot become executable markup', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,test', 'vbscript:msgbox(1)', '', undefined]) assert.equal(safeUrl(url), '');
  assert.equal(safeUrl('06-rag-and-retrieval.md', 'https://github.com/Pyramiding/llm-interview-warehouse/blob/main/docs/topics/01-transformer-and-math.md'), 'https://github.com/Pyramiding/llm-interview-warehouse/blob/main/docs/topics/06-rag-and-retrieval.md');
  const html = renderMarkdown('<img src=x onerror=alert(1)>\n\n[bad](javascript:alert)\n\n<script>alert(1)</script>');
  assert(!html.includes('<script>'));
  assert(!html.includes('<img'));
  assert(!html.includes('href="javascript:'));
  assert(html.includes('&lt;script&gt;'));
  assert.equal(escapeHtml('\"<>&'), '&quot;&lt;&gt;&amp;');
  assert(renderInline('[official](https://example.com/?q=a&x=b)').includes('rel="noopener noreferrer"'));
});
check('Code, Unicode formulas, lists and tables remain readable', () => {
  const html = renderMarkdown('**作答要点：** `p_i∝exp(z_i/τ)`\n\n```python\nx = "<tag>"\n```\n\n| 方法 | 成本 |\n|---|---|\n| A | 1 |\n\n- **追问：** 为什么？');
  assert(html.includes('<strong>作答要点：</strong>'));
  assert(html.includes('<code>p_i∝exp(z_i/τ)</code>'));
  assert(html.includes('&lt;tag&gt;'));
  assert(html.includes('<table>'));
  assert(html.includes('<li><strong>追问：</strong>'));
});
console.log(`Browser data and interaction checks: ${checks} groups passed.`);
