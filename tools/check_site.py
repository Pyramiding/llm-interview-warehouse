"""Check published data and reproducibility without external dependencies."""
from __future__ import annotations

import json
import re
import tempfile
from html.parser import HTMLParser
from pathlib import Path

from build_site import ROOT, STATIC_FILES, build, script_json


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.assets = []
        self.embedded = {}
        self.json_id = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'script' and attrs.get('src'):
            self.assets.append(attrs['src'])
        if tag == 'script' and attrs.get('type') == 'application/json':
            self.json_id = attrs['id']
            self.embedded[self.json_id] = ''
        if tag == 'link' and attrs.get('rel') in {'stylesheet', 'icon'}:
            self.assets.append(attrs['href'])

    def handle_data(self, data):
        if self.json_id:
            self.embedded[self.json_id] += data

    def handle_endtag(self, tag):
        if tag == 'script':
            self.json_id = None


def main():
    output = ROOT / '_site'
    catalog = json.loads((output / 'data/catalog.json').read_text())
    questions = json.loads((output / 'data/questions.json').read_text())
    stats = json.loads((ROOT / 'data/stats.json').read_text())
    assert catalog['stats'] == stats
    assert len(catalog['interviews']) == stats['interview_records']
    assert len(catalog['resources']) == stats['reading_resources']
    assert len(questions) == stats['total_questions']
    for name in ('interviews', 'resources'):
        source = json.loads((ROOT / f'data/{name}.json').read_text())
        assert [item['id'] for item in source] == [item['id'] for item in catalog[name]]
        assert [item['url'] for item in source] == [item['url'] for item in catalog[name]]
        for before, after in zip(source, catalog[name]):
            for field in ('verification', 'published', 'event_date', 'published_at', 'updated_at'):
                assert before.get(field) == after.get(field), (before['id'], field)
    index = json.loads((ROOT / 'data/questions.json').read_text())
    assert [item['id'] for item in index] == [item['id'] for item in questions]
    assert all(item['body'] and '<a id=' not in item['body'] for item in questions)
    page = (output / 'index.html').read_text()
    parser = PageParser()
    parser.feed(page)
    assert len(parser.ids) == len(set(parser.ids)), 'Duplicate HTML IDs'
    for name, expected in [('initial-catalog', catalog), ('initial-questions', questions)]:
        payload = parser.embedded[name]
        assert '<' not in payload, 'Embedded data can break out of its JSON element'
        assert json.loads(payload) == expected, 'Embedded and downloadable data do not match'
    hostile = {'body': '</script><script>alert(1)</script> & <tag>', 'title': '中文题解'}
    safe_payload = script_json(hostile)
    assert '<' not in safe_payload and json.loads(safe_payload) == hostile
    for asset in parser.assets:
        assert asset.startswith('./')
        assert (output / asset.split('?')[0]).is_file(), asset
    for name in ('index.html', 'app.js'):
        assert not re.search(r'__[A-Z_]+__', (output / name).read_text())
    assert 'localhost' not in page and '127.0.0.1' not in page
    assert all((output / name).is_file() for name in STATIC_FILES)
    with tempfile.TemporaryDirectory(prefix='llm-interview-site-') as temp:
        build(Path(temp))
        expected = {str(path.relative_to(temp)): path.read_bytes() for path in Path(temp).rglob('*') if path.is_file()}
        actual = {str(path.relative_to(output)): path.read_bytes() for path in output.rglob('*') if path.is_file()}
        assert actual == expected, 'Site build is not reproducible or has unexpected files'
    print('Site checks passed: source IDs, URLs, dates, question bodies, assets and reproducible output.')


if __name__ == '__main__':
    main()
