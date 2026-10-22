"""Search the local curated question/source index; no network or dependencies."""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('keyword', nargs='?', default='')
parser.add_argument('--interviews', action='store_true')
parser.add_argument('--year', type=int)
parser.add_argument('--topic', help='two-digit topic id, e.g. 06')
args = parser.parse_args()
if (args.year is not None or args.topic is not None) and not args.interviews:
    parser.error('--year and --topic require --interviews')
files = ['interviews.json'] if args.interviews else ['questions.json', 'sources.json']
count = 0
for filename in files:
    path = ROOT/'data'/filename
    if not path.exists():
        parser.error('index missing; first run python3 tools/build_indexes.py')
    for item in json.loads(path.read_text()):
        if args.year is not None and item.get('year') != args.year:
            continue
        if args.topic and args.topic.zfill(2) not in item.get('topics', []):
            continue
        if args.keyword.casefold() not in json.dumps(item, ensure_ascii=False).casefold():
            continue
        target = item.get('url') or f"{item['path']}#{item['anchor']}"
        print(f"{item['id']}  {item['title']}\n  {target}")
        count += 1
print(f'{count} results')
