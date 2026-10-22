"""Offline structural validation; does not certify external availability or factual truth."""
from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import unquote, urlsplit

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
        if row.get('verification') not in {'opened', 'search_excerpt'}:
            errors.append(f'{file.name}/{row.get("id")}: invalid verification')
        published = row.get('published')
        if published and re.fullmatch(r'\d{4}-\d{2}-\d{2}', published) and published > '2026-10-22':
            errors.append(f'{file.name}/{row.get("id")}: future publication')
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
if len(list((ROOT/'docs/topics').glob('*.md'))) != 15:
    errors.append('expected all 15 topic chapters')
if errors:
    print('\n'.join(errors))
    sys.exit(1)
print(f'Passed: {len(source_ids)} source records, {len(questions)} questions, {link_count} local links/anchors.')
print('External URL access and scientific claims require separate source review.')
