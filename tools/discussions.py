"""Load curated community posts and render their GitHub index."""
from __future__ import annotations

import json
import re
from datetime import date
from urllib.parse import urlsplit

from recruiting import ROOT, SITE_URL, is_https

PLATFORM_HOSTS = {
    '脉脉': ('maimai.cn',),
    '大厂观察': ('innews.site',),
    '凤凰网科技': ('ifeng.com',),
    '澎湃新闻': ('thepaper.cn',),
    'IT之家': ('ithome.com',),
    '小红书': ('xiaohongshu.com', 'xhslink.com'),
    '牛客网': ('nowcoder.com',),
    '微信公众号': ('mp.weixin.qq.com',),
    'X': ('x.com', 'twitter.com'),
    'V2EX': ('v2ex.com',),
    'Hacker News': ('news.ycombinator.com',),
}
VERIFICATION_LABELS = {'opened': '已读原帖', 'excerpt': '已读公开摘录'}


def load_discussions():
    data = json.loads((ROOT / 'data/discussions.json').read_text())
    categories = data['categories']
    assert categories and all(re.fullmatch(r'[a-z]+', key) and label.strip() for key, label in categories.items())
    ids, urls = set(), set()
    for row in data['discussions']:
        key = row['id']
        url = row['url']
        assert re.fullmatch(r'DISC\d{3,4}', key) and key not in ids, f'Invalid or duplicate ID: {key}'
        assert is_https(url) and url not in urls, f'Invalid or duplicate original link: {key}'
        host = urlsplit(url).hostname
        assert any(host == domain or host.endswith('.' + domain)
                   for domain in PLATFORM_HOSTS[row['platform']]), f'Platform must match the original link: {key}'
        assert row['category'] in categories, f'Unknown discussion category: {key}'
        assert row['verification'] in VERIFICATION_LABELS, f'Unknown verification status: {key}'
        assert all(row[field].strip() for field in ('title', 'post_type', 'summary', 'angle')), f'Missing discussion text: {key}'
        checked = date.fromisoformat(row['accessed'])
        if row['published'] is not None:
            assert date.fromisoformat(row['published']) <= checked, f'Future publication: {key}'
        if row['verification'] == 'excerpt':
            assert row['note'].strip(), f'Missing note about partial access: {key}'
        if row.get('evidence_url'):
            assert is_https(row['evidence_url']) and row['evidence_label'].strip(), f'Invalid evidence link: {key}'
        ids.add(key)
        urls.add(url)
    return data


def build_discussion_index():
    data = load_discussions()
    rows = sorted(data['discussions'], key=lambda row: (row['published'] or '', row['id']), reverse=True)
    lines = [
        '# 算法圈话题', '', f'[打开网页话题区]({SITE_URL}?view=discussions#library) · [返回仓库首页](../README.md)', '',
        '收录算法和大模型相关的大厂动态、职场讨论、公开观点与实测。标题为整理稿，正文和评论见原帖。',
        '大厂动态收录日报、人事报道和社区观点。有对应的公司回应、公告或报道时，附在条目下方。',
        '日期为原帖发布时间。部分页面需登录或在 App 里继续阅读，已知限制见各条备注。', '',
        f'共 {len(rows)} 条，按话题分组，组内按发帖日期倒序。', '',
    ]
    for category, label in data['categories'].items():
        selected = [row for row in rows if row['category'] == category]
        if not selected:
            continue
        lines.extend([f'## {label}', ''])
        for row in selected:
            published = row['published'] or '日期未确认'
            verification = VERIFICATION_LABELS[row['verification']]
            links = [f'[看原帖]({row["url"]})']
            if row.get('evidence_url'):
                links.append(f'[{row["evidence_label"]}]({row["evidence_url"]})')
            lines.extend([
                f'<a id="{row["id"].lower()}"></a>', '', f'### {row["title"]}', '',
                f'{row["platform"]} · {row["post_type"]} · {published} · {verification}', '', row['summary'], '',
                f'**讨论焦点** {row["angle"]}', '',
            ])
            if row.get('note'):
                lines.extend([row['note'], ''])
            lines.extend([f'查阅于 {row["accessed"]} · ' + ' · '.join(links), ''])
    (ROOT / 'docs/discussions.md').write_text('\n'.join(lines).rstrip() + '\n')
