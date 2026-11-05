"""Build the GitHub Pages browser from the existing repository sources."""
from __future__ import annotations

import hashlib
import json
import re
from collections import Counter
from pathlib import Path
from xml.sax.saxutils import escape as xml_escape

from build_indexes import (ROOT, TOPICS, access_label, normalized_companies,
                           platform, read_json, source_label, source_note)

SITE_URL = 'https://pyramiding.github.io/llm-interview-warehouse/'
REPO_URL = 'https://github.com/Pyramiding/llm-interview-warehouse'
STATIC_FILES = ('index.html', 'styles.css', 'app.js', 'core.mjs', 'favicon.svg')


def encoded(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'))


def collections_for(record, question=False):
    groups = set()
    topics = set(record['topic_ids'])
    domains = set(record.get('domains', []))
    if ('LLM Infra' in record.get('specialty_groups', []) or
            (question and topics.intersection({'08', '09', '10'}))):
        groups.add('infra')
    if '06' in topics:
        groups.add('rag')
    if '07' in topics:
        groups.add('agent')
    if domains.intersection({'搜索', '广告', '推荐'}) or (question and topics.intersection({'16', '17', '18'})):
        groups.add('search')
    if domains.intersection({'语音', '客服'}) or (question and topics.intersection({'22', '23'})):
        groups.add('speech')
    return sorted(groups)


def source_records(rows, kind, specialties):
    records = []
    fields = ('id', 'title', 'url', 'year', 'published', 'event_date', 'published_at',
              'updated_at', 'author', 'accessed', 'companies', 'role', 'summary',
              'reading_tip', 'source_type', 'verification', 'domains', 'evidence_url',
              'alternate_urls', 'related_interview_id', 'question_prompts')
    for order, row in enumerate(rows):
        record = {key: row[key] for key in fields if key in row}
        if 'year' not in record:
            published_year = re.match(r'^(\d{4})(?:-|$)', record.get('published') or '')
            record['year'] = int(published_year[1]) if published_year else None
        matches = [item for item in specialties if row['id'] in item['interview_ids' if kind == 'interviews' else 'resource_ids']]
        record.update(kind=kind, order=order, note=source_note(row),
                      company_keys=normalized_companies(row), platform=platform(row),
                      access_label=access_label(row), source_label=source_label(row),
                      topic_ids=row.get('topics', []),
                      topic_names=[name for code, name, _, _ in TOPICS if code in row.get('topics', [])],
                      specialty_ids=[item['id'] for item in matches],
                      specialty_names=[item['name'] for item in matches],
                      specialty_groups=sorted({item['group'] for item in matches}))
        record['collections'] = collections_for(record)
        records.append(record)
    return records


def question_records(index):
    records = []
    chapters = {code: name for code, name, _, _ in TOPICS}
    contents = {}
    for order, row in enumerate(index):
        path = row['path']
        if path not in contents:
            text = (ROOT / path).read_text()
            matches = list(re.finditer(r'^###\s+([A-Z]+\d{2})[.．、]\s*(.+)$', text, re.M))
            blocks = {}
            for i, match in enumerate(matches):
                block = text[match.end():matches[i + 1].start() if i + 1 < len(matches) else len(text)]
                block = re.split(r'\n## ', block, maxsplit=1)[0]
                blocks[match[1]] = re.sub(r'^<a id="[^"]+"></a>\s*', '', block, flags=re.M).strip()
            contents[path] = blocks
        body = contents[path][row['id']]
        if row['kind'] == 'topic':
            topic = Path(path).name[:2]
            chapter = chapters[topic]
        else:
            topic = 'practice-code' if 'coding-' in path else 'practice-projects'
            chapter = '手写与估算' if topic == 'practice-code' else '项目深挖与系统设计'
        answer = next((line for line in body.splitlines() if '作答要点' in line), body.splitlines()[0])
        excerpt = re.sub(r'^\s*[-*]?\s*\*\*[^*]+\*\*\s*', '', answer)
        excerpt = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', excerpt).replace('`', '').replace('**', '')
        difficulty = re.search(r'难度[^*]*\*\*\s*([^\n]+)', body)
        record = dict(row, kind='questions', order=order, body=body, chapter=chapter,
                      topic_ids=[topic], topic_names=[chapter],
                      difficulty=difficulty[1].split('；')[0].strip(' :：') if difficulty else '练习',
                      summary=excerpt[:200] + ('…' if len(excerpt) > 200 else ''),
                      url=f'{REPO_URL}/blob/main/{path}#{row["anchor"]}')
        record['collections'] = collections_for(record, question=True)
        records.append(record)
    return records


def build(output=ROOT / '_site'):
    stats = read_json(ROOT / 'data/stats.json')
    specialties = read_json(ROOT / 'data/specialties.json')
    interviews = source_records(read_json(ROOT / 'data/interviews.json'), 'interviews', specialties)
    resources = source_records(read_json(ROOT / 'data/resources.json'), 'resources', specialties)
    questions = question_records(read_json(ROOT / 'data/questions.json'))
    counts = Counter(topic for item in questions for topic in item['topic_ids'])
    topics = [dict(id=code, name=name, description=description, path='docs/topics/' + filename, count=counts[code])
              for code, name, filename, description in TOPICS]
    topics += [dict(id='practice-code', name='手写与估算', count=counts['practice-code'], path='docs/preparation/coding-and-estimation.md'),
               dict(id='practice-projects', name='项目深挖与系统设计', count=counts['practice-projects'], path='docs/preparation/projects-and-system-design.md')]
    catalog = dict(repo_url=REPO_URL, site_url=SITE_URL, stats=stats, topics=topics,
                   specialties=specialties, interviews=interviews, resources=resources)
    assert len(interviews) == stats['interview_records']
    assert len(resources) == stats['reading_resources']
    assert len(questions) == stats['total_questions']
    assert len({item['id'] for item in interviews + resources + questions}) == len(interviews + resources + questions)
    assert all(item['body'] for item in questions)
    assets = {name: (ROOT / 'site' / name).read_bytes() for name in STATIC_FILES}
    digest = hashlib.sha256((encoded(catalog) + encoded(questions)).encode())
    for name, content in sorted(assets.items()):
        digest.update(name.encode() + content)
    version = digest.hexdigest()[:12]
    catalog['version'] = version
    replacements = {'SITE_VERSION': version, 'SITE_URL': SITE_URL, 'REPO_URL': REPO_URL,
                    'AS_OF': stats['as_of'], 'INTERVIEW_COUNT': str(len(interviews)),
                    'QUESTION_COUNT': str(len(questions)), 'SPECIALTY_COUNT': str(len(specialties)),
                    'RESOURCE_COUNT': str(len(resources))}
    output = Path(output)
    (output / 'data').mkdir(parents=True, exist_ok=True)
    for name, content in assets.items():
        if name in {'index.html', 'app.js'}:
            text = content.decode()
            for key, value in replacements.items():
                text = text.replace('__' + key + '__', value)
            assert not re.search(r'__[A-Z_]+__', text), 'Unresolved HTML placeholder'
            content = text.encode()
        (output / name).write_bytes(content)
    (output / 'data/catalog.json').write_text(encoded(catalog) + '\n')
    (output / 'data/questions.json').write_text(encoded(questions) + '\n')
    (output / '.nojekyll').write_text('')
    (output / 'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: ' + SITE_URL + 'sitemap.xml\n')
    (output / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>' + xml_escape(SITE_URL) + '</loc></url></urlset>\n')
    print(f'Built {output.name}: {len(interviews)} interviews, {len(questions)} questions, {len(resources)} resources; version {version}')
    return catalog, questions


if __name__ == '__main__':
    build()
