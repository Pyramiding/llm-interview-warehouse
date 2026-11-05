"""Search the local curated question/source index; no network or dependencies."""
import argparse
import json
from pathlib import Path
from build_indexes import facets, COMPANY_ALIASES

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('keyword', nargs='?', default='')
parser.add_argument('--interviews', action='store_true')
parser.add_argument('--year', type=int)
parser.add_argument('--topic', help='two-digit topic id, e.g. 06')
parser.add_argument('--platform', help='source platform, e.g. 知乎')
parser.add_argument('--company', help='company alias, e.g. 字节跳动')
parser.add_argument('--role', help='substring of source-reported role')
parser.add_argument('--domain', help='explicit business-domain label, e.g. 搜索')
parser.add_argument('--specialty', help='reviewed specialty id or name, e.g. infra-kernel')
args = parser.parse_args()
if (any(x is not None for x in (args.year, args.topic, args.platform, args.company, args.role, args.domain, args.specialty))) and not args.interviews:
    parser.error('interview filters require --interviews')
specialty_ids = None
if args.specialty:
    choices = json.loads((ROOT/'data/specialties.json').read_text())
    matching = [x for x in choices if args.specialty == x['id'] or args.specialty in x['name']]
    if not matching:
        parser.error('unknown specialty; see docs/interviews/by-specialty.md')
    specialty_ids = {id for x in matching for id in x['interview_ids']}
files = ['interviews.json'] if args.interviews else ['questions.json', 'sources.json']
count = 0
for filename in files:
    path = ROOT/'data'/filename
    if not path.exists():
        parser.error('index missing; first run python3 tools/build_indexes.py')
    for item in json.loads(path.read_text()):
        if specialty_ids is not None and item['id'] not in specialty_ids:
            continue
        if args.year is not None and item.get('year') != args.year:
            continue
        if args.topic and args.topic.zfill(2) not in item.get('topics', []):
            continue
        if args.platform and args.platform not in facets(item, 'platform'):
            continue
        if args.domain and args.domain not in facets(item, 'domain'):
            continue
        if args.role and args.role.casefold() not in item.get('role','').casefold():
            continue
        if args.company and COMPANY_ALIASES.get(args.company,args.company) not in [COMPANY_ALIASES.get(c,c) for c in item.get('companies',[])]:
            continue
        if args.keyword.casefold() not in json.dumps(item, ensure_ascii=False).casefold():
            continue
        target = item.get('url') or f"{item['path']}#{item['anchor']}"
        print(f"{item['id']}  {item['title']}\n  {target}")
        count += 1
print(f'{count} results')
