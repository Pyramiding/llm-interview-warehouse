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
DOMESTIC_EMPLOYERS = {
    '美团': ('美团', 'meituan', 'https://zhaopin.meituan.com/longcatprogram',
           'https://zhaopin.meituan.com/web/position?highlightType=social'),
    '百度': ('百度', 'baidu', 'https://talent.baidu.com/jobs/list?recruitType=GRADUATE',
           'https://talent.baidu.com/jobs/list?recruitType=SOCIAL'),
    '华为': ('华为', 'huawei', 'https://career.huawei.com/cn/campus-recruitment-job-list',
           'https://career.huawei.com/reccampportal/portal5/social-recruitment-ai.html'),
    '快手': ('快手', 'kuaishou', 'https://campus.kuaishou.cn/',
           'https://zhaopin.kuaishou.cn/recruit/e/#/official/index/'),
    '小米': ('小米', 'xiaomi', 'https://hr.xiaomi.com/website/campus.html', 'https://career.mi.com/jobs'),
    '拼多多': ('拼多多', 'pdd', 'https://careers.pddglobalhr.com/campus/grad',
             'https://careers.pddglobalhr.com/jobs'),
    '滴滴': ('滴滴', 'didi', 'https://talent.didiglobal.com/campus/', 'https://talent.didiglobal.com/social/'),
    '小红书': ('小红书', 'xiaohongshu', 'https://job.xiaohongshu.com/campus/position',
             'https://job.xiaohongshu.com/social/position'),
}
MODEL_EMPLOYERS = {
    '智谱': ('智谱（Z.ai）', 'zhipu', 'https://app.mokahr.com/campus-recruitment/zphz/148984',
           'https://app.mokahr.com/social-recruitment/zphz/148983'),
    '月之暗面': ('月之暗面（Kimi）', 'moonshot', 'https://careers.kimi.com/campus', 'https://careers.kimi.com/'),
    'DeepSeek': ('DeepSeek', 'deepseek', None, 'https://talent.deepseek.com/'),
    'MiniMax': ('MiniMax（稀宇科技）', 'minimax', None, 'https://www.minimax.cn/careers'),
    '智源研究院': ('北京智源人工智能研究院', 'baai', 'https://app.mokahr.com/campus-recruitment/baai/42174',
              'https://app.mokahr.com/social-recruitment/baai/42173'),
    '阶跃星辰': ('阶跃星辰（StepFun）', 'stepfun', 'https://app.mokahr.com/campus-recruitment/step/94905', None),
    '面壁智能': ('面壁智能（ModelBest）', 'modelbest', 'https://modelbest.jobs.feishu.cn/campus',
             'https://modelbest.jobs.feishu.cn/career'),
    '百川智能': ('百川智能', 'baichuan', 'https://careers.baichuan-inc.com/',
             'https://cq6qe6bvfr6.jobs.feishu.cn/baichuanzhaopin'),
}
ROBOTICS_EMPLOYERS = {
    '智元机器人': ('智元机器人（AGIBOT）', 'agibot', None, 'https://agirobot.jobs.feishu.cn/campusrecruitment'),
    '旷视科技': ('旷视科技（Megvii）', 'megvii', 'https://www.nowcoder.com/careers/Megviicampus/38302', None),
    '商汤科技': ('商汤科技（SenseTime）', 'sensetime', 'https://hr.sensetime.com/campus/?c=1',
             'https://hr-jobs.sensetime.com/exp/position/list'),
}
FINANCE_TELECOM_EMPLOYERS = {
    '中国电信': ('中国电信（含中电信人工智能科技）', 'china-telecom', None,
             'https://job.chinatelecom.com.cn/wt/TELE/web/index?brandCode=1'),
    '中信银行': ('中信银行', 'citic-bank', None, 'https://job.citicbank.com/'),
    '招商银行': ('招商银行', 'cmb', None, 'https://career.cmbchina.com/'),
    '招银网络科技': ('招银网络科技', 'cmb-network', None, 'https://cmbntjob.cmbchina.com/'),
}
GLOBAL_EMPLOYERS = {
    'Google': ('Google（谷歌）', 'google', None, 'https://www.google.com/about/careers/applications/jobs/results/?q=Machine+Learning'),
    '微软': ('Microsoft（微软）', 'microsoft', None, 'https://apply.careers.microsoft.com/careers?query=Machine+Learning'),
    'Amazon': ('Amazon（亚马逊）', 'amazon', None, 'https://www.amazon.jobs/content/en/job-categories/applied-science'),
    'NVIDIA': ('NVIDIA（英伟达）', 'nvidia', None, 'https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite'),
    'Apple': ('Apple（苹果）', 'apple', None, 'https://jobs.apple.com/en-us/search?team=machine-learning-and-ai-SFTWR-MCHLN'),
    'Salesforce': ('Salesforce', 'salesforce', 'https://careers.salesforce.com/en/university/',
                   'https://salesforce.wd12.myworkdayjobs.com/External_Career_Site'),
    'Grab': ('Grab', 'grab', None, 'https://www.grab.careers/en/jobs/'),
    'OpenAI': ('OpenAI', 'openai', None, 'https://openai.com/careers/search/'),
    'Anthropic': ('Anthropic', 'anthropic', None, 'https://www.anthropic.com/careers/jobs'),
    'SAP': ('SAP（思爱普）', 'sap', None, 'https://jobs.sap.com/en/jobs/?location=Shanghai'),
}
MAINLAND_CITIES = {'北京', '上海', '深圳', '广州', '杭州', '成都', '苏州', '南京', '西安', '武汉', '大连', '合肥', '中国内地'}


def recruiting_url(**filters):
    query = urlencode({'view': 'jobs', **filters})
    anchor = '' if 'record' in filters else '#library'
    return f'{SITE_URL}?{query}{anchor}'


def is_https(url):
    if not isinstance(url, str) or any(char.isspace() for char in url):
        return False
    parsed = urlsplit(url)
    return parsed.scheme == 'https' and bool(parsed.hostname) and parsed.username is None


def is_mainland_location(city):
    if city in MAINLAND_CITIES:
        return True
    if re.search(r'香港|澳门|澳門|台湾|臺灣|Hong Kong|Maca[ou]|Taiwan', city, re.IGNORECASE):
        return False
    return bool(re.search(r'^China, |, (?:China|CHN)$', city, re.IGNORECASE))


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
    all_by_employer = Counter((job['company_key'], job['job_type']) for job in jobs)
    listed_employers = {job['company_key'] for job in jobs}
    employer_groups = (
        ('major-employers', '重点公司官网', EMPLOYER_PAGES, True),
        ('domestic-employers', '国内其他企业', DOMESTIC_EMPLOYERS, True),
        ('model-employers', '大模型公司与研究机构', MODEL_EMPLOYERS, False),
        ('robotics-employers', '机器人与计算机视觉', ROBOTICS_EMPLOYERS, False),
        ('telecom-finance-employers', '运营商与金融机构', FINANCE_TELECOM_EMPLOYERS, False),
        ('global-employers', '海外企业', GLOBAL_EMPLOYERS, True),
    )
    employers = {
        key: (*spec, official_only)
        for _, _, group, official_only in employer_groups
        for key, spec in group.items()
        if key in listed_employers
    }
    company_pages = {key: 'companies/' + spec[1] + '.md' for key, spec in employers.items()}

    def company_filter(key, kind, official_only):
        params = {'company': key, 'job_type': kind}
        if official_only:
            params['platform'] = '招聘官网'
        return recruiting_url(**params)

    def company_count(key, kind, official_only):
        counts = official_by_employer if official_only else all_by_employer
        count = counts[key, kind]
        return f'[{count} 条]({company_filter(key, kind, official_only)})' if count else '—'

    def employer_links(campus, portal):
        if campus and portal:
            return [f'[企业校招]({campus})', f'[企业社招]({portal})']
        if campus:
            return [f'[校招入口]({campus})']
        return [f'[企业官网]({portal})'] if portal else []

    def entry(job, include_company=False):
        label = f'{job["company"]} · {job["title"]}' if include_company else job['title']
        label = label.replace('[', '［').replace(']', '］')
        return f'  - [{label}]({company_pages.get(job["company_key"], "")}#{job["id"].lower()})'

    lines = [
        '# 大模型与算法岗招聘 / JD', '',
        f'[打开招聘网页]({recruiting_url()}) · [返回面经仓库](../../README.md)', '',
        f'{last_checked} 更新，共收录 {len(jobs)} 条岗位与 JD。记录附岗位原页或招聘公告、职责和要求摘要、核验日期与投递状态。',
        '“有投递入口”表示核验时确认了官网申请入口。投递状态与招聘类型以原页为准，已结束的批次保留作往届 JD。', '',
        '## 官网岗位', '',
        '| 招聘类型 | 官网岗位 | 有投递入口 | 网页入口 |',
        '|---|---:|---:|---|',
    ]
    for kind in ('校招', '社招', '实习'):
        filtered_url = recruiting_url(platform='招聘官网', job_type=kind)
        lines.append(f'| {kind} | {official_by_type[kind]} | {official_with_application[kind]} | [查看{kind}]({filtered_url}) |')
    for anchor, heading, group, official_only in employer_groups:
        lines += ['', f'<a id="{anchor}"></a>', '', f'## {heading}', '']
        if not official_only:
            lines += ['表内统计各公开渠道的收录记录，招聘类型未注明的条目可在公司 JD 页查看。', '']
        lines += ['| 公司 | 校招 | 社招 | 实习 | GitHub JD | 招聘入口 |', '|---|---:|---:|---:|---|---|']
        for key, (name, _, campus, portal) in group.items():
            if key in employers:
                counts = ' | '.join(company_count(key, kind, official_only) for kind in ('校招', '社招', '实习'))
                links = ' · '.join(employer_links(campus, portal)) or '—'
                lines.append(f'| {name} | {counts} | [查看 JD]({company_pages[key]}) | {links} |')
    china_jobs = defaultdict(list)
    for job in official_jobs:
        if job['company_key'] in GLOBAL_EMPLOYERS and any(map(is_mainland_location, job['cities'])):
            china_jobs[job['company_key']].append(job)
    lines += ['', '<a id="china-foreign-employers"></a>', '', '## 在华外企岗位', '',
              '列出官网 JD 中明确包含中国内地工作地点的岗位。', '']
    for key, (name, _, _, _) in GLOBAL_EMPLOYERS.items():
        if china_jobs[key]:
            lines += [f'### {name}（{len(china_jobs[key])}）', '']
            for job in china_jobs[key]:
                lines.append(entry(job) + f' · {job["job_type"]} · {"、".join(job["cities"])}')
            lines.append('')
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

    for key, (name, _, campus, portal, official_only) in employers.items():
        postings = [job for job in jobs if job['company_key'] == key]
        counts = official_by_employer if official_only else all_by_employer
        company_links = [
            f'[网页{kind}]({company_filter(key, kind, official_only)})'
            for kind in ('校招', '社招', '实习')
            if counts[key, kind]
        ]
        company_links.extend(employer_links(campus, portal))
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
