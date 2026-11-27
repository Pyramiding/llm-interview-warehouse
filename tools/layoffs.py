"""Validate public layoff records against the recruiting companies."""
from __future__ import annotations

import json
import re
from collections import Counter
from datetime import date
from urllib.parse import urlencode

from recruiting import ROOT, SITE_URL, is_https, recruiting_url

STATUS_LABELS = {
    'confirmed': '正式披露',
    'reported': '媒体报道',
    'response': '公司回应',
}


def load_layoffs(jobs):
    data = json.loads((ROOT / 'data/layoffs.json').read_text())
    checked = date.fromisoformat(data['checked'])
    companies = {job['company_key'] for job in jobs}
    ids, urls = set(), set()
    for row in data['layoffs']:
        key, url = row['id'], row['url']
        assert re.fullmatch(r'LAY\d{3,4}', key) and key not in ids, f'Invalid or duplicate ID: {key}'
        assert row['company_key'] in companies and row['company_key'] != '公司未明确', f'Unknown employer: {key}'
        assert is_https(url) and url not in urls, f'Invalid or duplicate source link: {key}'
        assert row['status'] in STATUS_LABELS, f'Unknown disclosure status: {key}'
        assert date.fromisoformat(row['published']) <= checked, f'Future publication: {key}'
        assert all(row[field].strip() for field in ('platform', 'title', 'scope', 'summary', 'note')), f'Missing event text: {key}'
        if row.get('evidence_url'):
            assert is_https(row['evidence_url']) and row['evidence_label'].strip(), f'Invalid supporting link: {key}'
        ids.add(key)
        urls.add(url)
    return data


def layoff_url(**filters):
    return f'{SITE_URL}?{urlencode({"view": "layoffs", **filters})}#library'


def build_layoff_index(jobs):
    data = load_layoffs(jobs)
    rows = sorted(data['layoffs'], key=lambda row: (row['published'], row['id']), reverse=True)
    counts = Counter(row['company_key'] for row in rows)
    companies = sorted({job['company_key'] for job in jobs}, key=str.casefold)
    lines = [
        '# 裁员动态', '',
        f'[打开网页专题]({layoff_url()}) · [回到岗位索引](recruiting/README.md) · [公司清单](#employer-index)', '',
        f'截至 {data["checked"]}，已收录 {len(rows)} 条公开动态，涉及 {len(counts)} 家公司。按公告或报道日期倒序。', '',
        '- **正式披露**以公司公告、媒体引述的公司确认或监管文件为依据。',
        '- **媒体报道**按报道所述记录范围，保留人数和执行进度的不确定性。',
        '- **公司回应**收录对流传说法的澄清，离职人数、岗位减少和人员调动各按原文口径记录。', '',
        '公司清单沿用岗位库。页面上的「暂无收录」表示暂缺可查证的公开资料。', '',
        '## 时间线', '',
    ]
    for row in rows:
        company = row['company_key']
        links = [f'[原始来源]({row["url"]})', f'[看同公司岗位]({recruiting_url(company=company)})']
        if row.get('evidence_url'):
            links.insert(1, f'[{row["evidence_label"]}]({row["evidence_url"]})')
        facts = ' · '.join(filter(None, (row['scope'], row.get('impact'))))
        lines.extend([
            f'<a id="{row["id"].lower()}"></a>', '', f'### {row["title"]}', '',
            f'{row["published"]} · {company} · {STATUS_LABELS[row["status"]]} · {row["platform"]}', '',
            f'**涉及范围** {facts}', '', row['summary'], '', row['note'], '', ' · '.join(links), '',
        ])
    lines.extend(['<a id="employer-index"></a>', '', '## 公司清单', '',
                  '| 公司 | 裁员专题 | 岗位 |', '| --- | --- | --- |'])
    for company in companies:
        count = counts[company]
        label = f'{count} 条' if count else '暂无收录'
        lines.append(f'| {company} | [{label}]({layoff_url(company=company)}) | [看岗位]({recruiting_url(company=company)}) |')
    (ROOT / 'docs/layoffs.md').write_text('\n'.join(lines) + '\n')
