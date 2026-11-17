"""Shared source and Markdown rendering for the recruiting module."""
from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from urllib.parse import urlencode, urlsplit

ROOT = Path(__file__).resolve().parents[1]
SITE_URL = 'https://pyramiding.github.io/llm-interview-warehouse/'
STATUS_LABELS = {'apply_link': '有投递入口', 'needs_check': '投递待确认', 'closed': '已结束'}
VERIFICATION_LABELS = {
    'opened': '已读公开 JD', 'excerpt': '公开摘要', 'community': '社区招聘帖', 'reprint': '公众号公开转载',
}
EMPLOYER_PAGES = {
    '字节': ('字节跳动', 'bytedance', 'https://jobs.bytedance.com/campus/position?type=2',
           'https://jobs.bytedance.com/experienced/position'),
    '阿里': ('阿里巴巴集团', 'alibaba', 'https://campus-talent.alibaba.com/campus/position',
           'https://talent-holding.alibaba.com/off-campus/position-list'),
    '腾讯': ('腾讯', 'tencent', 'https://join.qq.com/post.html',
           'https://careers.tencent.com/jobopportunity.html'),
    '京东': ('京东集团', 'jd', 'https://campus.jd.com/#/jobs',
           'https://zhaopin.jd.com/web/job/job_info_list/3'),
}


def recruiting_url(**filters):
    query = urlencode({'view': 'jobs', **filters})
    anchor = '' if 'record' in filters else '#library'
    return f'{SITE_URL}?{query}{anchor}'


def is_https(url):
    if not isinstance(url, str) or any(char.isspace() for char in url):
        return False
    parsed = urlsplit(url)
    return parsed.scheme == 'https' and bool(parsed.hostname) and parsed.username is None


def load_recruiting(known_topics):
    data = json.loads((ROOT / 'data/jobs.json').read_text())
    directions = data['directions']
    channels = data['channels']
    jobs = data['jobs']
    channel_names = {channel['name'] for channel in channels}
    assert len(channel_names) == len(channels), 'Duplicate recruiting channel'
    assert all(channel['guide'] and is_https(channel['url']) for channel in channels)
    assert jobs, 'Recruiting data is empty'
    ids, urls = set(), set()
    for job in jobs:
        job_id = job['id']
        assert re.fullmatch(r'JOB\d{3,4}', job_id) and job_id not in ids, f'Invalid or duplicate ID: {job_id}'
        ids.add(job_id)
        assert is_https(job['url']) and job['url'] not in urls, f'Invalid or duplicate source: {job_id}'
        urls.add(job['url'])
        if job.get('evidence_url'):
            assert is_https(job['evidence_url']), f'Invalid evidence URL: {job_id}'
        assert job['platform'] in channel_names and job['direction'] in directions, job_id
        assert job['job_type'] in {'社招', '校招', '实习', '未说明'}, job_id
        assert job['job_status'] in STATUS_LABELS and job['verification'] in VERIFICATION_LABELS, job_id
        if job['job_status'] == 'apply_link':
            assert job['verification'] == 'opened', job_id
        for key in ('title', 'company', 'company_key', 'status_note'):
            assert isinstance(job[key], str) and job[key].strip(), f'Missing {key}: {job_id}'
        for key in ('cities', 'topics', 'skills', 'responsibilities', 'requirements', 'preferred'):
            values = job.get(key, [])
            assert isinstance(values, list) and all(isinstance(v, str) and v.strip() for v in values), (job_id, key)
            assert len(values) == len(set(values)), f'Duplicate {key}: {job_id}'
        assert job['responsibilities'] and job['topics'] and set(job['topics']) <= known_topics, job_id
        assert job['requirements'] or job['verification'] != 'opened', f'Missing requirements: {job_id}'
        accessed = date.fromisoformat(job['accessed'])
        for key in ('published', 'deadline'):
            if job.get(key):
                parsed = date.fromisoformat(job[key])
                if key == 'published':
                    assert parsed <= accessed, f'Publication later than check: {job_id}'
                elif parsed < accessed:
                    assert job['job_status'] == 'closed', f'Expired posting must be archived: {job_id}'
    return data


def build_recruiting_index(known_topics):
    data = load_recruiting(known_topics)
    jobs = data['jobs']
    directions = data['directions']
    last_checked = max(job['accessed'] for job in jobs)
    by_direction, by_company = defaultdict(list), defaultdict(list)
    for job in jobs:
        by_direction[job['direction']].append(job)
        by_company[job['company']].append(job)
    platforms = Counter(job['platform'] for job in jobs)
    official_jobs = [job for job in jobs if job['platform'] == '招聘官网']
    official_by_type = Counter(job['job_type'] for job in official_jobs)
    official_with_application = Counter(
        job['job_type'] for job in official_jobs if job['job_status'] == 'apply_link'
    )
    official_by_employer = Counter((job['company_key'], job['job_type']) for job in official_jobs)
    company_pages = {key: 'companies/' + spec[1] + '.md' for key, spec in EMPLOYER_PAGES.items()}

    def entry(job, include_company=False):
        label = f'{job["company"]} · {job["title"]}' if include_company else job['title']
        label = label.replace('[', '［').replace(']', '］')
        return f'  - [{label}]({company_pages.get(job["company_key"], "")}#{job["id"].lower()})'

    lines = [
        '# 大模型与算法岗招聘 / JD', '',
        f'[打开招聘网页]({recruiting_url()}) · [返回面经仓库](../../README.md)', '',
        f'{last_checked} 更新，共收录 {len(jobs)} 条岗位与 JD。每条链接指向具体岗位，附职责和要求摘要、核验日期与投递状态。',
        '“有投递入口”表示核验时确认了官网申请入口。“投递待确认”包括官网列表仅展示部分 JD 等情况，详情保留核验依据。', '',
        '## 官网校招与社招', '',
        '| 招聘类型 | 官网岗位 | 有投递入口 | 网页入口 |',
        '|---|---:|---:|---|',
    ]
    for kind in ('校招', '社招'):
        filtered_url = recruiting_url(platform='招聘官网', job_type=kind)
        lines.append(f'| {kind} | {official_by_type[kind]} | {official_with_application[kind]} | [查看{kind}]({filtered_url}) |')
    lines += [
        '', '<a id="major-employers"></a>', '', '## 重点公司官网', '',
        '| 公司 | 校招 | 社招 | GitHub JD | 企业官网 |',
        '|---|---:|---:|---|---|',
    ]
    for key, (name, _, campus, social) in EMPLOYER_PAGES.items():
        school_url = recruiting_url(company=key, platform='招聘官网', job_type='校招')
        experienced_url = recruiting_url(company=key, platform='招聘官网', job_type='社招')
        school_count = official_by_employer[key, '校招']
        experienced_count = official_by_employer[key, '社招']
        lines.append(f'| {name} | [{school_count} 条]({school_url}) | [{experienced_count} 条]({experienced_url}) | '
                     f'[查看 JD]({company_pages[key]}) | [校招]({campus}) · [社招]({social}) |')
    lines += ['', '## 按方向', '']
    for key, title in directions.items():
        if by_direction[key]:
            lines.append(f'- **{title}**（{len(by_direction[key])}）')
            lines.extend(entry(job, include_company=True) for job in by_direction[key])
    lines += ['', '## 按公司', '']
    for company, postings in sorted(by_company.items()):
        path = company_pages.get(postings[0]['company_key'])
        if path:
            lines.append(f'- **{company}**（{len(postings)}） [查看公司 JD]({path})')
            for job in postings:
                anchor = job['id'].lower()
                lines.append(f'  - <a id="{anchor}"></a>[{job["id"]}]({path}#{anchor})')
        else:
            lines.append(f'- **{company}**')
            lines.extend(map(entry, postings))
    lines += ['', '## 招聘渠道', '', '| 渠道 | 岗位条目 | 查找方式 |', '|---|---:|---|']
    for channel in data['channels']:
        name = channel['name']
        lines.append(f'| [{name}]({channel["url"]}) | {platforms[name]} | {channel["guide"]} |')
    lines += ['', '## 岗位与 JD', '']
    for job in jobs:
        if job['company_key'] not in company_pages:
            lines.extend(job_detail(job, directions))
    output = ROOT / 'docs/recruiting'
    write_index(output / 'README.md', lines)

    for key, (name, _, campus, social) in EMPLOYER_PAGES.items():
        postings = [job for job in jobs if job['company_key'] == key]
        if not postings:
            continue
        company_links = [
            f'[网页校招]({recruiting_url(company=key, platform="招聘官网", job_type="校招")})',
            f'[网页社招]({recruiting_url(company=key, platform="招聘官网", job_type="社招")})',
            f'[企业校招官网]({campus})',
            f'[企业社招官网]({social})',
        ]
        company_lines = [
            f'# {name} · 大模型与算法岗', '',
            '[返回招聘索引](../README.md) · ' + ' · '.join(company_links), '',
            f'共 {len(postings)} 条岗位与 JD。投递前可在条目的招聘原页确认状态。', '',
        ]
        for kind in ('校招', '社招', '实习', '未说明'):
            subset = [job for job in postings if job['job_type'] == kind]
            if subset:
                company_lines.extend([f'## {kind}（{len(subset)}）', ''])
                for job in subset:
                    company_lines.extend(job_detail(job, directions))
        write_index(output / company_pages[key], company_lines)


def job_detail(job, directions):
    source_label = '查看公开转载' if job['verification'] == 'reprint' else '在原平台查看'
    links = [
        f'[{source_label}]({job["url"]})',
        f'[网页 JD]({recruiting_url(record=job["id"])})',
    ]
    if job.get('evidence_url'):
        links.append(f'[查看公开摘要]({job["evidence_url"]})')
    lines = [
        f'<a id="{job["id"].lower()}"></a>', '',
        f'### {job["id"]} · {job["company"]} · {job["title"]}', '',
        f'{directions[job["direction"]]} · {job["job_type"]} · {"、".join(job["cities"]) or "地点待确认"}'
        f' · {STATUS_LABELS[job["job_status"]]}', '',
        ' · '.join(links), '',
        f'{job["platform"]} · {VERIFICATION_LABELS[job["verification"]]} · 核验于 {job["accessed"]}。{job["status_note"]}', '',
    ]
    if job.get('team'):
        lines += [f'团队 / 业务为 {job["team"]}。', '']
    dates = []
    if job.get('published'):
        date_label = '转载日期' if job['verification'] == 'reprint' else '原页日期'
        dates.append(f'{date_label} {job["published"]}')
    if job.get('deadline'):
        dates.append(f'投递截止 {job["deadline"]}')
    if dates:
        lines += [' · '.join(dates), '']
    for key, heading in [('responsibilities', '主要职责'), ('requirements', '任职要求'), ('preferred', '优先条件')]:
        values = job.get(key, [])
        if values:
            lines += [f'**{heading}**', ''] + [f'- {value}' for value in values] + ['']
    if not job['requirements']:
        lines += ['公开资料中的任职门槛有待确认。', '']
    if job['skills']:
        lines += ['涉及技术关键词为 ' + '、'.join(job['skills']) + '。', '']
    return lines


def write_index(path, lines):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text('\n'.join(lines).rstrip() + '\n')
