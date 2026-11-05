const VIEWS = new Set(['interviews', 'questions', 'resources']);
const COLLECTIONS = new Set(['', 'infra', 'rag', 'agent', 'search', 'speech']);
const SORTS = new Set(['recent', 'published', 'title']);
const KEYS = ['view', 'q', 'company', 'topic', 'specialty', 'domain', 'year', 'platform', 'collection', 'sort', 'saved', 'page', 'record'];
export const PAGE_SIZE = 12;
export const DEFAULT_STATE = Object.freeze({view: 'interviews', q: '', company: '', topic: '', specialty: '', domain: '', year: '', platform: '', collection: '', sort: 'recent', saved: false, page: 1, record: ''});

export function readState(search = '') {
  const params = new URLSearchParams(search);
  const state = {...DEFAULT_STATE};
  for (const key of KEYS) if (params.has(key)) state[key] = params.get(key).slice(0, 200);
  if (!VIEWS.has(state.view)) state.view = 'interviews';
  if (!COLLECTIONS.has(state.collection)) state.collection = '';
  if (!SORTS.has(state.sort)) state.sort = 'recent';
  state.saved = params.get('saved') === '1';
  state.page = Math.min(10000, Math.max(1, Number.parseInt(state.page, 10) || 1));
  if (!/^[A-Z]{1,4}\d{2,4}$/.test(state.record)) state.record = '';
  return state;
}

export function stateQuery(state) {
  const params = new URLSearchParams();
  for (const key of KEYS) {
    const value = state[key];
    if (key === 'saved') { if (value) params.set(key, '1'); }
    else if (value !== '' && value !== undefined && value !== DEFAULT_STATE[key]) params.set(key, String(value));
  }
  return params.toString();
}

export function normalize(value) {
  return String(value ?? '').normalize('NFKC').toLocaleLowerCase().trim();
}

export function searchableText(record) {
  return normalize([record.id, record.title, record.role, record.summary, record.reading_tip, record.note, record.body, record.chapter, record.platform,
    ...(record.companies || []), ...(record.company_keys || []), ...(record.topic_names || []), ...(record.specialty_names || []),
    ...(record.domains || []), ...(record.question_prompts || [])].filter(Boolean).join(' '));
}

function dateValue(record) {
  const date = record.published_at || record.published;
  if (date && /^\d{4}-\d{2}-\d{2}/.test(date)) return date.slice(0, 19).padEnd(19, '0');
  return record.year ? String(record.year) : '';
}

export function filterRecords(records, state, saved = new Set()) {
  const terms = normalize(state.q).split(/[\s、，,]+/u).filter(Boolean);
  const isQuestion = state.view === 'questions';
  const selected = records.filter(record => {
    if (state.saved && !saved.has(record.id)) return false;
    if (state.topic && !(record.topic_ids || []).includes(state.topic)) return false;
    if (state.collection && !(record.collections || []).includes(state.collection)) return false;
    if (!isQuestion) {
      if (state.company && !(record.company_keys || []).includes(state.company)) return false;
      if (state.year && (record.year ? String(record.year) : 'unknown') !== state.year) return false;
      if (state.platform && record.platform !== state.platform) return false;
      if (state.domain && !(record.domains || []).includes(state.domain)) return false;
      if (state.specialty.startsWith('group:')) {
        if (!(record.specialty_groups || []).includes(state.specialty.slice(6))) return false;
      } else if (state.specialty && !(record.specialty_ids || []).includes(state.specialty)) return false;
    }
    const text = record.search_text || searchableText(record);
    return terms.every(term => text.includes(term));
  });
  return selected.sort((a, b) => {
    if (state.sort === 'title') return a.title.localeCompare(b.title, 'zh-CN');
    if (state.sort === 'published' && !isQuestion) return dateValue(b).localeCompare(dateValue(a)) || b.order - a.order;
    return isQuestion ? a.order - b.order : b.order - a.order;
  });
}

export function paginate(records, requestedPage, size = PAGE_SIZE) {
  const pages = Math.max(1, Math.ceil(records.length / size));
  const page = Math.min(pages, Math.max(1, Number.parseInt(requestedPage, 10) || 1));
  return {items: records.slice((page - 1) * size, page * size), page, pages, total: records.length};
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
}

export function safeUrl(value, base = 'https://github.com/Pyramiding/llm-interview-warehouse/') {
  if (typeof value !== 'string' || !value.trim()) return '';
  try {
    const url = new URL(String(value), base);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}

export function renderInline(value, base) {
  const text = String(value ?? '');
  const tokens = /(`[^`\n]+`|\[[^\]\n]+\]\([^\s)]+\)|\*\*[^*\n]+\*\*)/g;
  let output = '', cursor = 0;
  for (const match of text.matchAll(tokens)) {
    output += escapeHtml(text.slice(cursor, match.index));
    const token = match[0];
    if (token.startsWith('`')) output += '<code>' + escapeHtml(token.slice(1, -1)) + '</code>';
    else if (token.startsWith('**')) output += '<strong>' + escapeHtml(token.slice(2, -2)) + '</strong>';
    else {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      const href = safeUrl(link[2], base);
      output += href ? '<a href="' + escapeHtml(href) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(link[1]) + '</a>' : escapeHtml(link[1]);
    }
    cursor = match.index + token.length;
  }
  return output + escapeHtml(text.slice(cursor));
}

function tableCells(line) {
  return line.trim().replace(/^\||\|$/g, '').replace(/\\\|/g, '\u0000').split('|').map(cell => cell.trim().replace(/\u0000/g, '|'));
}

// This renderer supports the repository's small Markdown subset. Raw HTML is escaped.
export function renderMarkdown(markdown, base) {
  const lines = String(markdown || '').replace(/\r/g, '').split('\n');
  let output = '', list = '', paragraph = [];
  function flushParagraph() { if (paragraph.length) { output += '<p>' + paragraph.map(line => renderInline(line, base)).join('<br>') + '</p>'; paragraph = []; } }
  function closeList() { if (list) { output += '</' + list + '>'; list = ''; } }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) { flushParagraph(); closeList(); continue; }
    if (/^\s*```/.test(line)) {
      flushParagraph(); closeList(); const code = [];
      while (++i < lines.length && !/^\s*```/.test(lines[i])) code.push(lines[i]);
      output += '<pre><code>' + escapeHtml(code.join('\n')) + '</code></pre>'; continue;
    }
    if (line.trim().startsWith('|') && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      flushParagraph(); closeList();
      output += '<div class="table-scroll"><table><thead><tr>' + tableCells(line).map(cell => '<th>' + renderInline(cell, base) + '</th>').join('') + '</tr></thead><tbody>';
      i++;
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith('|')) output += '<tr>' + tableCells(lines[++i]).map(cell => '<td>' + renderInline(cell, base) + '</td>').join('') + '</tr>';
      output += '</tbody></table></div>'; continue;
    }
    const bullet = /^\s*([-*]|\d+[.)])\s+(.+)$/.exec(line);
    if (bullet) {
      flushParagraph(); const tag = /^\d/.test(bullet[1]) ? 'ol' : 'ul';
      if (list !== tag) { closeList(); output += '<' + tag + '>'; list = tag; }
      output += '<li>' + renderInline(bullet[2], base) + '</li>'; continue;
    }
    closeList();
    const heading = /^#{1,6}\s+(.+)$/.exec(line);
    if (heading) { flushParagraph(); output += '<h3>' + renderInline(heading[1], base) + '</h3>'; continue; }
    if (/^>\s?/.test(line)) { flushParagraph(); output += '<blockquote>' + renderInline(line.replace(/^>\s?/, ''), base) + '</blockquote>'; continue; }
    if (/^\s*---+\s*$/.test(line)) { flushParagraph(); output += '<hr>'; continue; }
    paragraph.push(line);
  }
  flushParagraph(); closeList(); return output;
}
