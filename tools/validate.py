"""Offline structural validation; does not certify external availability or factual truth."""
from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import unquote, urlsplit
from build_indexes import AS_OF, DOMAIN_RULES, TOPICS, canonical_url

ROOT = Path(__file__).resolve().parents[1]
errors = []
required = {'id', 'title', 'url', 'source_type', 'published', 'topics', 'accessed', 'verification', 'note'}
source_ids = []
for file in [ROOT/'data/interviews.json', ROOT/'data/resources.json'] + sorted((ROOT/'data').glob('sources-*.json')):
    try:
        rows = json.loads(file.read_text())
    except (ValueError, OSError) as exc:
        errors.append(f'{file.name}: {exc}')
        continue
    for row in rows:
        missing = required - row.keys()
        if missing:
            errors.append(f'{file.name}/{row.get("id")}: missing {sorted(missing)}')
        source_ids.append(row.get('id'))
        if urlsplit(row.get('url', '')).scheme not in {'https', 'http'}:
            errors.append(f'{file.name}/{row.get("id")}: invalid URL')
        if row.get('verification') not in {'opened', 'search_excerpt', 'metadata_only'}:
            errors.append(f'{file.name}/{row.get("id")}: invalid verification')
        published = row.get('published')
        if published and re.fullmatch(r'\d{4}-\d{2}-\d{2}', published) and published > AS_OF:
            errors.append(f'{file.name}/{row.get("id")}: future publication')
        if file.name in {'interviews.json', 'resources.json'}:
            domains = row.get('domains')
            if not isinstance(domains,list) or any(not isinstance(x,str) for x in domains):
                errors.append(f'{file.name}/{row.get("id")}: domains must be a reviewed list')
            elif not set(domains) <= {name for name,_ in DOMAIN_RULES}:
                errors.append(f'{file.name}/{row.get("id")}: unknown business domain')
for id, count in Counter(source_ids).items():
    if count > 1:
        errors.append(f'duplicate source id: {id}')

questions = json.loads((ROOT/'data/questions.json').read_text())
for id, count in Counter(q['id'] for q in questions).items():
    if count > 1:
        errors.append(f'duplicate question id: {id}')
for question in questions:
    path = ROOT/question['path']
    content = path.read_text()
    if f'<a id="{question["anchor"]}"></a>' not in content:
        errors.append(f'{question["id"]}: missing explicit anchor')
    if question['kind'] == 'topic':
        block = re.split(rf'^### {question["id"]}[.．、]', content, flags=re.M)[-1].split('\n### ')[0]
        for label in ['难度', '岗位', '作答要点', '深入追问', '常见误区']:
            if label not in block:
                errors.append(f'{question["id"]}: missing {label}')

link_count = 0
for file in ROOT.rglob('*.md'):
    content = file.read_text()
    if '统计生成中' in content:
        errors.append(f'{file.relative_to(ROOT)}: unfinished statistics')
    for target in re.findall(r'\[[^\]\n]*\]\(([^\s)]+)\)', content):
        if target.startswith(('https://', 'http://', 'mailto:', 'data:')):
            continue
        parts = urlsplit(target)
        path = (file.parent/unquote(parts.path)).resolve() if parts.path else file
        link_count += 1
        if not path.exists():
            errors.append(f'{file.relative_to(ROOT)}: missing link {target}')
            continue
        if parts.fragment and path.suffix == '.md':
            dest = path.read_text()
            explicit = set(re.findall(r'<a id="([^"]+)">', dest))
            if unquote(parts.fragment) not in explicit:
                errors.append(f'{file.relative_to(ROOT)}: missing explicit anchor {target}')

stats = json.loads((ROOT/'data/stats.json').read_text())
if stats['total_questions'] != len(questions):
    errors.append('question statistics mismatch')
if {p.name for p in (ROOT/'docs/topics').glob('*.md')} != {t[2] for t in TOPICS}:
    errors.append('topic files differ from TOPICS registry')
interviews = json.loads((ROOT/'data/interviews.json').read_text())
resources = json.loads((ROOT/'data/resources.json').read_text())
research = [x for p in (ROOT/'data').glob('sources-*.json') for x in json.loads(p.read_text())]
sources = json.loads((ROOT/'data/sources.json').read_text())
checks = {'interview_records': len(interviews), 'reading_resources': len(resources), 'topics': len(TOPICS),
          'topic_questions': sum(q['kind']=='topic' for q in questions),
          'practice_questions': sum(q['kind']=='practice' for q in questions),
          'normalized_source_urls': len({canonical_url(x['url']) for x in interviews+resources+research}),
          'research_source_urls': len({canonical_url(x['url']) for x in research})}
for key,value in checks.items():
    if stats[key] != value: errors.append(f'{key}: stale statistics')
if len(sources) != checks['normalized_source_urls']: errors.append('source catalog mismatch')
for row in interviews:
    if row.get('verification') == 'metadata_only': errors.append(f'{row["id"]}: metadata alone cannot establish an interview self-report')
    for field in ('year','event_date','companies','role','summary','reading_tip'):
        if field not in row: errors.append(f'{row["id"]}: missing interview field {field}')
    if row.get('year') is not None and row['year'] not in range(2023,2027):
        errors.append(f'{row["id"]}: year outside curation range')
    if not set(row.get('topics',[])) <= {t[0] for t in TOPICS}: errors.append(f'{row["id"]}: unknown topic')
for name in ('interviews','resources'):
    rows = interviews if name=='interviews' else resources
    keys = [canonical_url(x['url']) for x in rows]
    if len(keys) != len(set(keys)): errors.append(f'{name}: duplicated canonical URLs')
for code,title,filename,desc in TOPICS:
    if int(code)>=16:
        chapter_questions = [q for q in questions if q['path']==f'docs/topics/{filename}']
        if not 18 <= len(chapter_questions) <= 25: errors.append(f'{filename}: expected 18–25 questions')
        chapter = (ROOT/'docs/topics'/filename).read_text()
        catalog_urls = {canonical_url(x['url']) for x in sources}
        for url in re.findall(r'\]\((https?://[^ )]+)\)', chapter):
            if canonical_url(url) not in catalog_urls: errors.append(f'{filename}: uncataloged source {url}')
        for question in chapter_questions:
            block = re.split(rf'^### {question["id"]}[.．、]', chapter, flags=re.M)[-1].split('\n### ')[0]
            if 'https://' not in block: errors.append(f'{question["id"]}: no source link')
if errors:
    print('\n'.join(errors))
    sys.exit(1)
print(f'Passed: {len(source_ids)} source records, {len(questions)} questions, {link_count} local links/anchors.')
print('External URL access and scientific claims require separate source review.')
