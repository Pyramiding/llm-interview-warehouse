"""Build stable, cross-linked Markdown indexes from the curated source data."""
from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parents[1]
AS_OF = '2026-10-22'
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
]


def read_json(path):
    return json.loads(path.read_text())


def write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text.rstrip() + '\n')


def canonical_url(url):
    parts = urlsplit(url)
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
    pattern = re.compile(r'^###\s+([A-Z]\d{2})[.．、]\s*(.+)$', re.M)
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
            if source.get('verification') == 'opened':
                unique[key]['verification'] = 'opened'
    sources = sorted(unique.values(), key=lambda x: x['id'])
    write(ROOT/'data/sources.json', json.dumps(sources, ensure_ascii=False, indent=2))
    questions = question_records()
    write(ROOT/'data/questions.json', json.dumps(questions, ensure_ascii=False, indent=2))

    intro = ['# 公开面经索引：2023—2026', '', '[返回首页](../../README.md) · [按研究方向](by-topic.md) · [按公司](by-company.md) · [来源规范](../methodology.md)', '',
             f'查阅截止：**{AS_OF}**。共 **{len(interviews)}条面经记录**，单篇多公司复盘计一条。内容是求职者公开自述，未向企业核实；仅作短摘要并链接原文。日期、核验状态及歧义逐条保留。', '',
             '`opened`表示已获得相关页面内容；`search_excerpt`表示只核对搜索可见片段，全文可能受限。`未确认`不是发生过面试的证明。', '']
    for year in sorted({x['year'] for x in interviews}):
        intro += [f'## {year}年资料', '']
        for item in [x for x in interviews if x['year'] == year]:
            topic_names = '、'.join(t[1] for t in TOPICS if t[0] in item['topics'])
            intro += [f'<a id="{item["id"].lower()}"></a>', '', f'### {item["id"]} · [{item["title"]}]({item["url"]})', '',
                      f'- **企业/岗位（作者自述）：** {"、".join(item["companies"])}；{item["role"]}。',
                      f'- **日期：** 页面发布/编辑：{item["published"] or "未确认"}；面试：{item["event_date"] or "未确认"}。',
                      f'- **方向：** {topic_names}。', f'- **摘要：** {item["summary"]}', f'- **阅读建议：** {item["reading_tip"]}',
                      f'- **核验/备注：** `{item["verification"]}`；{item["note"]}', '']
    intro += ['## 如何观察考点变化', '',
              '本样本中，2023年资料已出现PEFT、RLHF与上线项目；2024年可看到更细的显存、并行、奖励与评测追问；2025年资料包含GRPO、多模态、MCP和应用系统；2026年样本出现Agent轨迹、回归评测与上下文管理。这是对所选样本的定性阅读，不是市场频率或招聘趋势统计。', '',
              '补充阅读、题库与二次汇编见[完整来源目录](../source-catalog.md)，不混入亲历面经数量。']
    write(ROOT/'docs/interviews/README.md', '\n'.join(intro))

    topic_page = ['# 按研究方向找公开面经', '', '[按年份](README.md) · [按公司](by-company.md) · [题目索引](../question-index.md)', '', '映射表示该面经可见内容涉及该方向，不表示其覆盖整个研究领域；数量仅为本仓库样本。', '']
    for code, name, filename, desc in TOPICS:
        selected = [x for x in interviews if code in x['topics']]
        topic_page += [f'## {code} · {name}', '', f'[进入专题题解](../topics/{filename}) · {desc}', '']
        topic_page += [f'- [{x["id"]} · {x["title"]}](README.md#{x["id"].lower()})（{x["year"]}；{x["role"]}）' for x in selected]
        if not selected:
            topic_page += ['当前没有直接归入的亲历面经；专题题解为公开研究延伸。']
        topic_page += ['']
    write(ROOT/'docs/interviews/by-topic.md', '\n'.join(topic_page))

    companies = defaultdict(list)
    for item in interviews:
        for company in item['companies']:
            companies[company].append(item)
    company_page = ['# 按公司找公开面经', '', '[按年份](README.md) · [按方向](by-topic.md)', '',
                    '公司及岗位为原作者自述；多公司汇总没有逐题归属时，不强行把每题分配给企业。本页不构成招聘流程或官方题库说明。', '']
    for company, items in sorted(companies.items()):
        company_page += [f'## {company}', '']
        company_page += [f'- [{x["id"]} · {x["title"]}](README.md#{x["id"].lower()})（{x["year"]}；{x["role"]}）' for x in items]
        company_page += ['']
    write(ROOT/'docs/interviews/by-company.md', '\n'.join(company_page))

    qpage = ['# 全部题目：稳定ID索引', '', '[返回首页](../README.md) · [真实面经入口](interviews/README.md)', '',
             f'共 **{len(questions)}道原创题/练习**，追问不另计。专题题为研究延伸，项目与手写为原创练习；它们不是未经核实的企业真题。', '']
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
             'topics': len(TOPICS), 'topic_questions': sum(q['kind']=='topic' for q in questions),
             'practice_questions': sum(q['kind']=='practice' for q in questions), 'total_questions': len(questions),
             'normalized_source_urls': len(sources), 'research_source_urls': len(research_unique),
             'verification': dict(Counter(x.get('verification') for x in sources)),
             'interviews_by_year': dict(Counter(x['year'] for x in interviews))}
    write(ROOT/'data/stats.json', json.dumps(stats, ensure_ascii=False, indent=2))
    readme_path = ROOT/'README.md'
    if readme_path.exists():
        summary = (f'**{len(interviews)}篇公开面经 · {len(TOPICS)}个专题 · '
                   f'{stats["topic_questions"]}道专题题解 + {stats["practice_questions"]}道项目/手写练习 '
                   f'· {len(sources)}个去重来源链接**\n\n'
                   f'另附{len(resources)}个补充阅读入口；研究来源包含{len(research_unique)}个规范化链接。'
                   '题目数不含追问；来源数按链接归一化，并非独立论文或企业真题数量。')
        content = re.sub(r'<!-- STATS:START -->.*?<!-- STATS:END -->',
                         '<!-- STATS:START -->\n'+summary+'\n<!-- STATS:END -->',
                         readme_path.read_text(), flags=re.S)
        write(readme_path, content)
    spage = ['# 完整来源目录', '', '[返回首页](../README.md) · [来源规范](methodology.md)', '',
             f'共{len(sources)}个规范化来源链接：{len(interviews)}条面经记录、{len(resources)}个补充入口，以及专题研究来源。计数方法及局限见来源规范。查阅日期均记录于JSON。', '']
    for label, items in [('公开面经', interviews), ('补充阅读/汇编', resources), ('论文、官方仓库与文档', sorted({canonical_url(s['url']):s for s in research_sources}.values(), key=lambda x:x['id']))]:
        spage += [f'## {label}', '', '| ID | 来源 | 日期 | 核验 | 说明 |', '|---|---|---|---|---|']
        for x in items:
            spage.append(f'| {x["id"]} | [{md_cell(x["title"])}]({x["url"]}) | {md_cell(x.get("published") or "未确认/持续更新")} | {x.get("verification", "未记录")} | {md_cell(x.get("note", ""))} |')
        spage += ['']
    write(ROOT/'docs/source-catalog.md', '\n'.join(spage))
    coverage = ['# 覆盖情况与缺口', '', '[返回首页](../README.md) · [全部题目](question-index.md)', '',
                '| 方向 | 原创专题题 | 对应面经记录 | 内容 |', '|---|---:|---:|---|']
    for code, name, filename, desc in TOPICS:
        count = sum(x['path']==f'docs/topics/{filename}' for x in questions)
        coverage.append(f'| [{name}](topics/{filename}) | {count} | {sum(code in x["topics"] for x in interviews)} | {desc} |')
    coverage += ['', '当前局限：样本以中文公开面经和国内求职者自述为主；海外现场面、资深管理、音频专岗、芯片编译器、世界模型与AI4Science的亲历样本不足。具身和科学方向目前更多依赖研究延伸题。没有据此推算企业通过率、题目频次、薪资或行业供需。', '',
                 '只有摘要可见、反爬、推广及日期冲突均在条目中标注。欢迎补齐原始亲历复盘和可复现实验；新增资料应保留公开来源及查阅日期。']
    write(ROOT/'docs/coverage.md', '\n'.join(coverage))
    print(json.dumps(stats, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
