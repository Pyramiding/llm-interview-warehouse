"""Build stable, cross-linked Markdown indexes from the curated source data."""
from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parents[1]
AS_OF = '2026-11-05'
TOPICS = [
    ('01', 'Transformer与数学基础', '01-transformer-and-math.md', '注意力、归一化、优化、概率与参数估算'),
    ('02', '预训练与数据工程', '02-pretraining-and-data.md', 'tokenizer、配比、去重、Scaling Law与数据质量'),
    ('03', 'SFT与参数高效微调', '03-sft-and-peft.md', '指令数据、LoRA/QLoRA、遗忘与训练诊断'),
    ('04', '偏好对齐与强化学习', '04-alignment-and-rl.md', 'RLHF、PPO、DPO、GRPO、RLVR与奖励审计'),
    ('05', '架构、MoE与长上下文', '05-architectures-moe-long-context.md', 'GQA/MLA、专家路由、位置外推与混合架构'),
    ('06', 'RAG与检索', '06-rag-and-retrieval.md', '切分、混合召回、重排、多跳与端到端评测'),
    ('07', 'Agent与工具调用', '07-agents-and-tool-use.md', '规划、记忆、工具协议、状态、权限与评测'),
    ('08', '推理优化与在线服务', '08-inference-and-serving.md', 'KV、分页、调度、投机解码、SLO与压测'),
    ('09', '分布式训练与AI Infra', '09-distributed-training.md', 'DP/TP/PP、ZeRO、通信、重计算与排障'),
    ('10', '量化、压缩与蒸馏', '10-compression-and-distillation.md', 'PTQ/QAT、激活异常、低比特、蒸馏与端侧'),
    ('11', '推理能力与测试时计算', '11-reasoning-and-test-time-compute.md', 'CoT、搜索、验证器、计算分配与评测公平性'),
    ('12', '多模态理解与生成', '12-multimodal.md', 'CLIP/BLIP/LLaVA、图像、视频、语音与生成'),
    ('13', '评测与安全', '13-evaluation-and-safety.md', '污染、统计、裁判、幻觉、越狱防御与可信性'),
    ('14', '代码模型与具身智能', '14-code-and-embodied-models.md', '代码生成/Agent、软件评测、VLA与世界模型'),
    ('15', '领域模型与研究设计', '15-domain-models-and-research.md', '搜索推荐、医疗金融、AI4Science与实验设计'),
    ('16', '大模型与搜索', '16-llm-search.md', 'query理解、改写、生成式检索、排序与答案'),
    ('17', '大模型与广告', '17-llm-ads.md', '定向、召回排序、创意、出价与增量'),
    ('18', '大模型与推荐', '18-llm-recommendation.md', '生成式召回、用户序列、冷启与反馈'),
    ('19', '大模型与增长', '19-llm-growth.md', '因果、uplift、LTV、实验与策略'),
    ('20', '大模型与营销', '20-llm-marketing.md', '受众、内容、触达、归因与合规'),
    ('21', '大模型与风控', '21-llm-risk.md', '欺诈、审核、代价阈值、漂移与人审'),
    ('22', '大模型与语音', '22-llm-speech.md', 'ASR、TTS、实时交互与打断'),
    ('23', '大模型与客服', '23-llm-service.md', '知识、多轮状态、工具执行、转人工与质检'),
]


def read_json(path):
    return json.loads(path.read_text())


def write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text.rstrip() + '\n')


def canonical_url(url):
    parts = urlsplit(url)
    host = parts.netloc.lower().removeprefix('www.')
    if host in {'leetcode.cn', 'leetcode.com'}:
        # Slugs and comment URLs under the same numeric post are one source.
        # Older Discuss routes/short IDs need observed redirects, not guessed IDs.
        match = re.match(r'/discuss/post/(\d+)(?:/|$)', parts.path)
        if match:
            return f'https://{host}/discuss/post/{match.group(1)}'
    if parts.netloc in {'arxiv.org', 'www.arxiv.org'}:
        match = re.match(r'/(?:abs|html|pdf)/(\d{4}\.\d{4,5})(?:v\d+)?(?:\.pdf)?', parts.path)
        if match:
            return 'https://arxiv.org/abs/' + match.group(1)
    # Curated URLs have no functional query arguments; remove common tracking only.
    query = '&'.join(x for x in parts.query.split('&') if x and not x.split('=')[0].startswith(('utm_', 'sourceSSR', 'toCommentId', 'weFlow', 'urlSource')))
    return urlunsplit((parts.scheme, parts.netloc.lower(), parts.path.rstrip('/'), query, ''))


def md_cell(value):
    return str(value).replace('|', '\\|').replace('\n', ' ')


def question_records():
    records = []
    files = sorted((ROOT/'docs/topics').glob('*.md')) + sorted((ROOT/'docs/preparation').glob('*.md'))
    pattern = re.compile(r'^###\s+([A-Z]+\d{2})[.．、]\s*(.+)$', re.M)
    for file in files:
        content = file.read_text()
        matches = list(pattern.finditer(content))
        for match in reversed(matches):
            anchor = f'<a id="{match[1].lower()}"></a>\n\n'
            if not content[:match.start()].endswith(anchor):
                content = content[:match.start()] + anchor + content[match.start():]
        if content != file.read_text():
            file.write_text(content)
        for match in matches:
            records.append({'id': match[1], 'title': match[2], 'path': str(file.relative_to(ROOT)),
                            'anchor': match[1].lower(), 'kind': 'topic' if file.parent.name == 'topics' else 'practice'})
    return records



COMPANY_ALIASES = {'字节跳动': '字节', '抖音': '字节', '阿里巴巴': '阿里', '阿里云': '阿里', '淘天': '阿里', '淘天集团': '阿里', '百度公司': '百度', '腾讯公司': '腾讯', '快手科技': '快手', '理想汽车': '理想', '美团到店': '美团', '阿里达摩院': '阿里', '网易（可见片段）': '网易', '支付宝': '蚂蚁集团', '蚂蚁': '蚂蚁集团'}
COMPANY_ALIASES.update({'阿里巴巴通义实验室':'阿里', '飞猪':'阿里', '拼多多/TEMU':'拼多多', '智谱华章':'智谱', '智谱AI':'智谱'})
COMPANY_ALIASES.update({'字节跳动/懂车帝':'字节', 'Microsoft':'微软', 'Microsoft Research':'微软', '亚马逊':'Amazon', '谷歌':'Google'})
COMPANY_ALIASES.update({'网易云音乐':'网易', 'CVTE':'视源股份'})
NON_COMPANIES = {'未明确', '未确认', '多家公司（未逐题归属）', '多家公司未逐题归属', '多家公司', '未说明', '未逐题明确', '其他企业待原文核实', '其他公司'}
PLATFORMS = {'nowcoder.com':'牛客', 'zhihu.com':'知乎', 'mp.weixin.qq.com':'微信公众号', 'github.com':'GitHub', 'xiaohongshu.com':'小红书', 'xhslink.com':'小红书', 'xhslink.cn':'小红书', 'maimai.cn':'脉脉', 'v2ex.com':'V2EX', 'juejin.cn':'掘金', 'csdn.net':'CSDN', '1point3acres.com':'一亩三分地', 'woshipm.com':'人人都是产品经理', 'onlyar.site':'个人博客'}
PLATFORMS.update({'leetcode.cn':'LeetCode中文站', 'leetcode.com':'LeetCode国际站'})
PLATFORM_ANCHORS = {'牛客':'platform-nowcoder', 'LeetCode中文站':'platform-leetcode-cn', 'LeetCode国际站':'platform-leetcode-global'}
DOMAIN_RULES = [('搜索', ('搜索','query','检索排序')), ('广告', ('广告','出价','ctr','cvr')), ('推荐', ('推荐','召回排序')), ('用户增长', ('增长','uplift','ltv')), ('营销', ('营销','触达','归因')), ('风控', ('风控','欺诈','内容审核')), ('语音', ('语音','asr','tts')), ('客服', ('客服','转人工'))]

def platform(item):
    host = urlsplit(item['url']).netloc.lower()
    return next((name for domain,name in PLATFORMS.items() if host == domain or host.endswith('.'+domain)), '其他公开来源')

def facets(item, kind):
    if kind == 'platform': return [platform(item)]
    if kind == 'year': return [str(item.get('year')) if item.get('year') else '年份未确认']
    if kind == 'role': return [item.get('role') or '岗位未说明']
    # Business labels are reviewed metadata. A keyword such as “搜索片段” or a
    # candidate's previous job must not silently become an interview domain.
    return item.get('domains') or ['业务领域未明确']

def normalized_companies(item):
    return sorted({COMPANY_ALIASES.get(c,c) if c not in NON_COMPANIES else '未逐公司归属的复盘'
                   for c in item.get('companies',[])}) or ['公司未明确']

def record_link(item, resource=False):
    label = {'preparation_resource':'（备考资料）', 'repost_reference':'（转载）'}.get(item.get('source_type'),'') if resource else ''
    return f'[{item["id"]} · {md_cell(item["title"])}]({"resources.md" if resource else "README.md"}#{item["id"].lower()}){label}'


def access_label(item):
    return {'opened': '已读正文', 'search_excerpt': '仅搜索摘要',
            'metadata_only': '仅目录信息'}.get(item.get('verification'), '待核对')


def source_label(item):
    return {'interview_self_report': '面经', 'interview_collection': '汇编',
            'preparation_resource': '备考资料', 'interview_analysis': '题目解析',
            'repost_reference': '转载'}.get(item.get('source_type'), '参考资料')


def source_note(item):
    note = item.get('note', '')
    return '' if note == '页面内容属于作者自述，未向企业独立核实。' else note


def readable_time(value):
    return value[:16].replace('T', ' ') + (' ' + value[-6:] if value[-6:] != '+08:00' else '')


def date_note(item):
    parts = [f'面试：{item.get("event_date") or "未注明"}']
    if item.get('published_at'):
        parts.append('发布：' + readable_time(item['published_at']))
    else:
        parts.append('页面日期：' + (item.get('published') or '未确认'))
    if item.get('updated_at') and item['updated_at'] != item.get('published_at'):
        parts.append('编辑：' + readable_time(item['updated_at']))
    return '；'.join(parts)


def build_specialty_indexes(interviews, resources):
    specialties = read_json(ROOT/'data/specialties.json')
    interview_map = {x['id']: x for x in interviews}
    resource_map = {x['id']: x for x in resources}
    nav = ('[返回首页](../../README.md) · [按公司](by-company.md) · '
           '[研究专题](by-topic.md) · [细分方向](by-specialty.md) · [LLM Infra专页](llm-infra.md)')
    page = ['# 按细分方向找面经', '', nav, '',
            '按技术问题和应用场景整理。一篇面经可以出现在多个方向；具体是岗位要求、项目经历还是场景题，见原条目的备注。', '',
            '| 方向 | 面经 | 参考资料 |', '|---|---:|---:|']
    page += [f'| [{x["name"]}](#{x["id"]}) | {len(x["interview_ids"])} | {len(x["resource_ids"])} |' for x in specialties]
    for group in ('LLM Infra', 'Agent与模型工程', '应用场景'):
        page += ['', f'## {group}', '']
        for x in [s for s in specialties if s['group'] == group]:
            page += [f'<a id="{x["id"]}"></a>', '', f'### {x["name"]}', '', x['description'], '',
                     '**面经：**', '']
            page += [f'- {record_link(interview_map[id])}（{access_label(interview_map[id])}）' for id in x['interview_ids']]
            if not x['interview_ids']:
                page += ['暂时还没收集到这一方向的面经。']
            if x['resource_ids']:
                page += ['', '**参考资料：**', '']
                page += [f'- {record_link(resource_map[id], True)}（{access_label(resource_map[id])}）' for id in x['resource_ids']]
    write(ROOT/'docs/interviews/by-specialty.md', '\n'.join(page))

    infra = [x for x in specialties if x['group'] == 'LLM Infra']
    ids = {id for x in infra for id in x['interview_ids']}
    extras = {id for x in infra for id in x['resource_ids']}
    page = ['# LLM Infra面经', '', nav, '',
            f'更新于{AS_OF}，共{len(ids)}篇面经、{len(extras)}份参考资料。同一篇跨方向收录时只计一次。', '',
            'Infra岗位的差别很大：有的做训练框架，有的写算子，有的负责推理服务或GPU平台。先看目标团队做哪一层，再挑面经。', '',
            '| 方向 | 主要内容 | 面经 | 参考资料 |', '|---|---|---:|---:|']
    page += [f'| [{x["name"]}](by-specialty.md#{x["id"]}) | {x["description"]} | {len(x["interview_ids"])} | {len(x["resource_ids"])} |' for x in infra]
    page += ['', '## 可以从这几篇开始', '',
             '| 岗位 | 阅读顺序 | 复习重点 |', '|---|---|---|',
             '| 推理引擎/Serving | [字节Data](README.md#int504) → [阿里二面](README.md#int502) → [推理专题](../topics/08-inference-and-serving.md) | 负载、KV管理、调度、质量、吞吐和延迟 |',
             '| CUDA/Triton/算子 | [CUDA GEMM与MLA](README.md#int503) → [硬件生态迁移](README.md#int501) → [多公司复盘](README.md#int219) | 形状与dtype、正确性基线、访存/计算/同步、回归与回退 |',
             '| 分布式训练/RL Infra | [训练向NLP实习](README.md#int042) → [Agentic RL](README.md#int218) → [分布式专题](../topics/09-distributed-training.md) | 状态与显存、并行边界、通信、采样环境、恢复与评测 |',
             '| GPU平台/云原生 | [讯飞推理工程](README.md#int306) → [云原生路线](resources.md#res605) → [Infra指南](resources.md#res604) | GPU池化、配额与隔离、弹性、观测、故障与成本 |', '',
             '## 几份资料的备注', '',
             '- [混元Infra解析](resources.md#res610)来自汇编，牛客原帖暂时读不到。',
             '- [AIInfraGuide](resources.md#res601)内容比较多，也包括数据库和操作系统题，阅读时按岗位挑选。',
             '- [快手题单解析](resources.md#res609)把模型量化答成了金融交易策略，这一段有明显问题。',
             '- AI编译器、通信网络、生产RL系统和大集群容错的面经还比较少，欢迎补充。', '',
             '## 本地筛选', '', '```sh',
             'python3 tools/search.py --interviews --specialty infra-kernel',
             'python3 tools/search.py --interviews --specialty infra-serving --company 阿里',
             'python3 tools/search.py --interviews --specialty infra-profiling', '```']
    write(ROOT/'docs/interviews/llm-infra.md', '\n'.join(page))
    return specialties

def build_resource_index(resources):
    page = ['# 题库、教程与面经汇编', '', '[返回首页](../../README.md) · [按公司](by-company.md) · [按方向](by-topic.md) · [公司与业务](company-direction.md)', '',
            '面经之外的复习资料放在这里。只看到目录、读不到正文的条目会单独注明。[面经原帖](README.md)另有列表。', '']
    for x in resources:
        page += [f'<a id="{x["id"].lower()}"></a>', '', f'### {x["id"]} · [{x["title"]}]({x["url"]})', '',
                 f'- **来源：** {platform(x)} · {source_label(x)} · {access_label(x)}。',
                 f'- **公司：** {"、".join(x.get("companies",[])) or "通用资料"}。',
                 f'- **方向：** {"、".join(t[1] for t in TOPICS if t[0] in x.get("topics",[])) or "通用准备"}。',
                 f'- **时间：** 页面日期 {x.get("published") or "未确认"}；查阅 {x["accessed"]}。',
                 f'- **备注：** {x["note"]}', '']
        if x.get('domains'): page += [f'- **业务：** {"、".join(x["domains"])}。', '']
        if x.get('summary'): page += [f'- **摘要：** {x["summary"]}', '']
        if x.get('role'): page += [f'- **内容：** {x["role"]}。', '']
        if x.get('evidence_url'): page += [f'- **其他入口：** [阅读页面]({x["evidence_url"]})。', '']
        if x.get('related_interview_id'):
            page += [f'- **相关面经：** [{x["related_interview_id"]}](README.md#{x["related_interview_id"].lower()})，具体关系见备注。', '']
    write(ROOT/'docs/interviews/resources.md','\n'.join(page))

def build_company_direction(interviews, resources):
    page = ['# 按公司和业务找面经', '', '[按公司](by-company.md) · [按方向](by-topic.md) · [按平台](by-platform.md) · [全部面经](README.md) · [参考资料](resources.md)', '',
            '先选业务，再查公司。多公司复盘如果没有逐段写清业务归属，放在“多公司”一组；空白表示暂未收录。', '']
    for domain,_ in DOMAIN_RULES:
        groups = defaultdict(lambda: [[],[]])
        for kind,rows in enumerate((interviews,resources)):
            for x in rows:
                if domain not in facets(x,'domain'): continue
                companies = normalized_companies(x)
                names = companies if len(companies)==1 else ['多公司复盘（未逐公司映射）']
                for company in names: groups[company][kind].append(x)
        page += [f'## {domain}', '', '| 公司 | 面经 | 参考资料 |', '|---|---|---|']
        for company,rows in sorted(groups.items()):
            cells = ['<br>'.join(record_link(x,bool(kind)) for x in entries) or '—' for kind,entries in enumerate(rows)]
            page += [f'| {md_cell(company)} | {cells[0]} | {cells[1]} |']
        if not groups: page += ['| 尚无记录 | — | — |']
        page += ['']
    write(ROOT/'docs/interviews/company-direction.md','\n'.join(page))

def build_facets(interviews, resources):
    for kind,title in [('platform','来源平台'), ('role','岗位'), ('year','年份'), ('domain','业务领域')]:
        groups = defaultdict(list)
        for item in interviews:
            for value in facets(item,kind): groups[value].append(item)
        notes = {'platform': '按原帖所在平台整理，访问情况见每条记录。',
                 'role': '岗位名称沿用原帖，找相近岗位时可以用页面搜索。',
                 'year': '按资料年份归档，实际面试时间见条目；年份不明的放在最后。',
                 'domain': '按文章提到的业务整理，岗位和候选项目的区别见备注。'}
        page = [f'# 按{title}找面经', '', '[全部面经](README.md) · [按公司](by-company.md) · [按平台](by-platform.md) · [按岗位](by-role.md) · [按年份](by-year.md) · [按业务](by-domain.md)', '', notes[kind], '']
        if kind == 'platform':
            page += [' · '.join(f'[{name}](#{anchor})' for name,anchor in PLATFORM_ANCHORS.items() if name in groups), '']
        for value,items in sorted(groups.items()):
            if kind == 'platform' and value in PLATFORM_ANCHORS:
                page += [f'<a id="{PLATFORM_ANCHORS[value]}"></a>', '']
            page += [f'## {value}（{len(items)}条记录）', '']
            page += [f'- [{x["id"]} · {x["title"]}](README.md#{x["id"].lower()}) — {x.get("year") or "年份未确认"}；{access_label(x)}' for x in items]
            page += ['']
        if kind == 'platform':
            page += ['## 各平台的参考资料', '']
            for name in sorted({platform(x) for x in resources}):
                page += [f'### {name}', ''] + [f'- [{x["id"]} · {x["title"]}]({x["url"]}) — {source_label(x)}；{access_label(x)}' for x in resources if platform(x)==name] + ['']
            page += ['## 还没找到面经原帖的平台', '', '、'.join(sorted(set(PLATFORMS.values())-{platform(x) for x in interviews})), '', '检索过程见[平台补充记录](../platform-expansion-2026-10-23.md)、[首次检索](../research-platforms-a.md)和[其他平台](../research-platforms-b.md)。']
        if kind == 'domain':
            page += ['## 按业务找参考资料', '', '[按公司和业务查找](company-direction.md)', '']
            for domain,_ in DOMAIN_RULES:
                selected = [x for x in resources if domain in facets(x,'domain')]
                page += [f'### {domain}', ''] + [f'- {record_link(x,True)} — {access_label(x)}' for x in selected] + (['暂未收录。'] if not selected else []) + ['']
            page += ['## 应用方向练习题', ''] + [f'- [{name}](../topics/{filename})：{desc}。' for code,name,filename,desc in TOPICS if int(code)>=16]
        write(ROOT/f'docs/interviews/by-{kind}.md','\n'.join(page))


def main():
    interviews = read_json(ROOT/'data/interviews.json')
    resources = read_json(ROOT/'data/resources.json')
    source_fragments = sorted((ROOT/'data').glob('sources-*.json'))
    research_sources = [item for file in source_fragments for item in read_json(file)]
    unique = {}
    for source in interviews + resources + research_sources:
        key = canonical_url(source['url'])
        if key not in unique:
            unique[key] = dict(source, canonical_url=key, aliases=[source['id']])
        else:
            unique[key]['aliases'].append(source['id'])
            unique[key]['topics'] = sorted(set(unique[key].get('topics',[])) | set(source.get('topics',[])))
            if source.get('verification') == 'opened':
                unique[key]['verification'] = 'opened'
    sources = sorted(unique.values(), key=lambda x: x['id'])
    write(ROOT/'data/sources.json', json.dumps(sources, ensure_ascii=False, indent=2))
    questions = question_records()
    write(ROOT/'data/questions.json', json.dumps(questions, ensure_ascii=False, indent=2))

    intro = ['# 面经合集（重点2023—2026）', '', '[返回首页](../../README.md) · [按公司](by-company.md) · [按方向](by-topic.md) · [细分方向](by-specialty.md) · [LLM Infra](llm-infra.md) · [按平台](by-platform.md) · [按岗位](by-role.md) · [按年份](by-year.md) · [按业务](by-domain.md) · [来源说明](../methodology.md)', '',
             f'更新于{AS_OF}，共{len(interviews)}篇。这里整理公开发帖的求职经历，每篇保留原链接、时间、内容摘要和备注；多公司复盘按一篇计。', '',
             '问题摘录做了简短改写，完整内容请看原帖。“仅搜索摘要”表示还没读到正文，付费截断和日期疑问在备注中说明。题库和教程另放在[参考资料](resources.md)。', '']
    for year in sorted({x['year'] for x in interviews}, key=lambda y: (y is None, y or 0)):
        intro += [f'## {str(year)+"年资料" if year else "年份未确认"}', '']
        for item in [x for x in interviews if x['year'] == year]:
            topic_names = '、'.join(t[1] for t in TOPICS if t[0] in item['topics'])
            intro += [f'<a id="{item["id"].lower()}"></a>', '', f'### {item["id"]} · [{item["title"]}]({item["url"]})', '',
                      f'- **公司 / 岗位：** {"、".join(item["companies"]) or "公司未公开"}；{item["role"]}。',
                      f'- **时间：** {date_note(item)}。',
                      f'- **方向：** {topic_names}。', f'- **摘要：** {item["summary"]}', f'- **阅读建议：** {item["reading_tip"]}',
                      f'- **来源：** {platform(item)} · {access_label(item)}' + (f' · 作者：{item["author"]}' if item.get('author') else '') + '。']
            if source_note(item):
                intro += [f'- **备注：** {source_note(item)}']
            intro += ['']
            if item.get('evidence_url'):
                intro += [f'- **其他阅读入口：** [查看页面]({item["evidence_url"]})。', '']
            if item.get('question_prompts'):
                intro += ['**问题摘录：**', '']
                intro += [f'{i}. {prompt}' for i,prompt in enumerate(item['question_prompts'],1)]
                intro += ['']
            if item.get('alternate_urls'):
                intro += ['- **同文链接：** ' + ' · '.join(
                    f'[入口{i}]({url})' for i,url in enumerate(item['alternate_urls'],1)) + '。', '']
    intro += ['更多题库、教程和汇编见[参考资料](resources.md)，论文和文档见[来源目录](../source-catalog.md)。']
    write(ROOT/'docs/interviews/README.md', '\n'.join(intro))

    topic_page = ['# 按方向找面经', '', '[按年份](README.md) · [按公司](by-company.md) · [题目索引](../question-index.md)', '', '每个方向先列面经，再列题库和教程。一篇涉及多个方向时会重复出现在列表中。', '']
    for code, name, filename, desc in TOPICS:
        selected = [x for x in interviews if code in x['topics']]
        topic_page += [f'## {code} · {name}', '', f'[进入专题题解](../topics/{filename}) · {desc}', '']
        topic_page += [f'- [{x["id"]} · {x["title"]}](README.md#{x["id"].lower()})（{x["year"] or "年份未确认"}；{x["role"]}）' for x in selected]
        if not selected:
            topic_page += ['暂未收录相关面经，可以先看专题练习。']
        topic_page += ['']
        extra = [x for x in resources if code in x.get('topics',[])]
        if extra:
            topic_page += ['### 参考资料', ''] + [f'- {record_link(x,True)} — {access_label(x)}' for x in extra] + ['']
    write(ROOT/'docs/interviews/by-topic.md', '\n'.join(topic_page))

    companies = defaultdict(list)
    for item in interviews:
        for company in normalized_companies(item):
            companies[company].append(item)
    resource_companies = defaultdict(list)
    for item in resources:
        for company in normalized_companies(item): resource_companies[company].append(item)
    company_names = sorted(set(companies) | set(resource_companies))
    company_page = ['# 按公司找面经', '', '[按年份](README.md) · [按方向](by-topic.md) · [细分方向](by-specialty.md) · [LLM Infra](llm-infra.md) · [公司与业务](company-direction.md) · [参考资料](resources.md)', '',
                    '先选公司，再看岗位和年份。不同团队的面试差别很大，具体问题以原帖为准。', '']
    company_page += ['## 公司快速导航', '', ' · '.join(f'[{name}](#company-{i:03d})' for i,name in enumerate(company_names,1)), '',
                     '阿里云、达摩院等名称在导航里合并到集团，条目保留原帖写法。公司不明和多公司未分段的文章单列。', '']
    for i,company in enumerate(company_names,1):
        items = companies[company]
        company_page += [f'<a id="company-{i:03d}"></a>', '', f'## {company}', '']
        company_page += [f'### 面经（{len(items)}篇）', '']
        company_page += [f'- [{x["id"]} · {x["title"]}](README.md#{x["id"].lower()})（{x["year"] or "年份未确认"}；{x["role"]}）' for x in items]
        if not items: company_page += ['暂未收录面经。']
        company_page += ['']
        extras = resource_companies[company]
        if extras: company_page += ['### 参考资料', ''] + [f'- {record_link(x,True)} — {access_label(x)}' for x in extras] + ['']
    write(ROOT/'docs/interviews/by-company.md', '\n'.join(company_page))

    build_facets(interviews, resources)
    build_resource_index(resources)
    build_company_direction(interviews, resources)
    specialties = build_specialty_indexes(interviews, resources)

    qpage = ['# 题目索引', '', '[返回首页](../README.md) · [面经合集](interviews/README.md)', '',
             f'共{len(questions)}道整理的复习题和练习，按专题编号查找；面经原帖中的问题另见上方链接。', '']
    grouped = defaultdict(list)
    for item in questions:
        grouped[item['path']].append(item)
    for path, items in grouped.items():
        title = (ROOT/path).read_text().splitlines()[0].lstrip('# ')
        qpage += [f'## {title}', '']
        qpage += [f'- [{x["id"]} · {x["title"]}]({path.removeprefix("docs/")}#{x["anchor"]})' for x in items]
        qpage += ['']
    write(ROOT/'docs/question-index.md', '\n'.join(qpage))

    research_unique = {canonical_url(x['url']) for x in research_sources}
    stats = {'as_of': AS_OF, 'interview_records': len(interviews), 'reading_resources': len(resources),
             'specialties': len(specialties),
             'topics': len(TOPICS), 'topic_questions': sum(q['kind']=='topic' for q in questions),
             'practice_questions': sum(q['kind']=='practice' for q in questions), 'total_questions': len(questions),
             'normalized_source_urls': len(sources), 'research_source_urls': len(research_unique),
             'verification': dict(Counter(x.get('verification') for x in sources)),
             'interviews_by_year': dict(Counter(x['year'] for x in interviews)),
             'interviews_by_platform': dict(Counter(platform(x) for x in interviews)),
             'interview_source_types': dict(Counter(x['source_type'] for x in interviews)),
             'interviews_by_domain': dict(Counter(d for x in interviews for d in facets(x,'domain')))}
    stats['resources_by_platform'] = dict(Counter(platform(x) for x in resources))
    write(ROOT/'data/stats.json', json.dumps(stats, ensure_ascii=False, indent=2))
    readme_path = ROOT/'README.md'
    if readme_path.exists():
        summary = (f'{len(interviews)}篇面经 · {len(TOPICS)}个专题 · {len(specialties)}个细分方向\n\n'
                   f'另有{len(resources)}份参考资料、{stats["topic_questions"]}道专题题解和{stats["practice_questions"]}道项目/手写练习。'
                   f'论文、文档和原帖共{len(sources)}个去重链接，见[来源目录](docs/source-catalog.md)。')
        content = re.sub(r'<!-- STATS:START -->.*?<!-- STATS:END -->',
                         '<!-- STATS:START -->\n'+summary+'\n<!-- STATS:END -->',
                         readme_path.read_text(), flags=re.S)
        write(readme_path, content)
    spage = ['# 来源目录', '', '[返回首页](../README.md) · [来源说明](methodology.md)', '',
             f'共{len(sources)}个去重链接，包括{len(interviews)}篇面经、{len(resources)}份参考资料，以及题解引用的论文和文档。详细查阅日期保存在data/中。', '']
    for label, items in [('公开面经', interviews), ('补充阅读/汇编', resources), ('论文、官方仓库与文档', sorted({canonical_url(s['url']):s for s in research_sources}.values(), key=lambda x:x['id']))]:
        spage += [f'## {label}', '', '| ID | 来源 | 日期 | 阅读情况 | 备注 |', '|---|---|---|---|---|']
        for x in items:
            spage.append(f'| {x["id"]} | [{md_cell(x["title"])}]({x["url"]}) | {md_cell(x.get("published") or "未确认/持续更新")} | {access_label(x)} | {md_cell(source_note(x))} |')
        spage += ['']
    write(ROOT/'docs/source-catalog.md', '\n'.join(spage))
    coverage = ['# 收录情况', '', '[返回首页](../README.md) · [全部题目](question-index.md)', '',
                '| 方向 | 练习题 | 面经 | 内容 |', '|---|---:|---:|---|']
    for code, name, filename, desc in TOPICS:
        count = sum(x['path']==f'docs/topics/{filename}' for x in questions)
        coverage.append(f'| [{name}](topics/{filename}) | {count} | {sum(code in x["topics"] for x in interviews)} | {desc} |')
    coverage += ['', '目前收录以国内中文面经为主。海外现场面、资深岗位、语音、编译器、世界模型和AI4Science还比较少，欢迎补充原帖。上表只统计本仓库的资料，一篇可出现在多个方向。']
    coverage += ['', '## 更新记录', '', '[11月5日应用与Infra](expansion-applications-infra-2026-11-05.md) · [11月5日增量](incremental-2026-11-05.md) · [11月2日增量](incremental-2026-11-02.md) · [10月23日平台补充](platform-expansion-2026-10-23.md) · [首次检索](research-platforms-a.md) · [其他平台](research-platforms-b.md)', '', '也可以从[平台](interviews/by-platform.md)、[细分方向](interviews/by-specialty.md)、[LLM Infra](interviews/llm-infra.md)或[公司与业务](interviews/company-direction.md)继续查找。']
    write(ROOT/'docs/coverage.md', '\n'.join(coverage))
    print(json.dumps(stats, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
