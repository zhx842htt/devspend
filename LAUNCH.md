# token账单(devspend)发布作战手册

> 目标:2 周验证期内拿到 ≥100 star 或 ≥100 waitlist 或 ≥3 人主动问付费。
> 原则:所有文案基于事实,不虚构身份;发布顺序有讲究,不要同一天轰炸所有平台。

---

## 第 0 步 · 发布前 10 分钟自检(你)

- [ ] `LICENSE` 里的 `<你的名字或昵称>` 已替换
- [ ] GitHub 仓库已建(Public),本地已推送
- [ ] `npm publish` 成功,`npx devspend report` 在干净机器上可跑
- [ ] 落地页 Formspree endpoint 已替换,表单能真收到邮件
- [ ] (建议)自己先在 r/ClaudeAI 等目标社区有历史发言,纯新号首帖易被删

## 第 1 步 · Hacker News(发布日,美东早上 = 北京时间晚上 9~11 点)

**标题**(Show HN,直接用,别加形容词):

```
Show HN: Devspend – Your AI dev spend, tagged by project, ready to bill
```

**正文**(首评,HN 风格:朴素、技术、诚实):

```
Hi HN — I built a small local CLI because of a problem I kept running into:
AI tooling spend is invisible at the project level.

I'd finish a month of Claude Code + API calls, know roughly what I'd spent
in total, and have no idea which project (let alone which client) consumed
it. Cost dashboards that exist are per-tool; nothing attributes spend to
projects.

Devspend reads Claude Code's local JSONL logs, dedupes messages, applies
cache-aware list pricing (overridable in ~/.devspend/prices.json), and
prints spend by day / by project / by model. Zero dependencies, Node 16+,
data never leaves your machine:

  npx devspend projects

Honest limitations: costs are list-price estimates (subscription plans pay
differently); Cursor has no public local logs yet, so it's Claude Code +
API keys for now. The billing-grade parts (client entities, invoice
exports, budget alerts) come later as a one-time-license Pro; the CLI stays
free and open (MIT).

I'm curious how others handle AI costs in client work — do you itemize them,
roll them into rates, or eat them?
```

**注意事项**:发布后不要找人投票(HN 会 shadowban);老实回答每条评论;被踩到负面也别删帖。

## 第 2 步 · Reddit(发布次日,间隔几小时,别同步发)

**r/ClaudeAI**(先发这个,最对口):

```
标题: I made a CLI that shows which of my projects is actually eating my Claude Code budget

正文:
After another month of hitting rate limits without knowing which repo caused
it, I wrote a zero-dependency CLI: it reads Claude Code's local logs, dedupes
messages, applies cache-aware pricing (overridable via ~/.devspend/prices.json)
and prints spend by day / project / model.

    npx devspend projects

Example output: my side project turned out to cost 3x what my client work did.

Everything is local, no telemetry, MIT. Big respect to ccusage (which this
borrows the log-parsing approach from) — the difference is project-level
attribution, which is what I needed for billing work.

Caveats: list-price estimates; only Claude Code logs for now (API keys in
Phase 1). What do you all do — track spend per project, or just not look? :)
```

**r/SideProject**(次日):

```
标题: Launched my first open-source tool — AI spend by project, in a local CLI

正文:
I kept seeing the same complaint: $100–300/month on AI coding tools, zero
visibility into which project burned it. So I built devspend: reads your
Claude Code logs locally, attributes spend to projects (cwd-based), cache-aware
pricing you can override, prints day/project/model tables. Free, MIT, zero
deps: npx devspend report.

Next phase: API-key spend ingest + a local dashboard; billing-grade client
exports later. Would love feedback from anyone doing client/agency work with
AI — especially: would you itemize AI costs on an invoice, or is rolling it
into your rate the norm?
```

**r/freelance / r/webdev**(第 3~4 天,用提问帖而非广告帖):

```
标题: How do you handle AI tool costs in client billing?

正文:
Genuine question for those doing delivery work with Claude Code / Copilot /
APIs: my AI spend is now a real line in my monthly costs ($100–300), but
clients never see it. Three approaches I can see:

1. Itemize AI costs on the invoice (needs per-project tracking)
2. Roll it into my rate and say nothing
3. Eat it and grumble

I built myself a small local CLI that attributes Claude Code spend to
projects (happy to share, it's open source), which makes #1 actually
feasible — but I'm wondering what the norm is out there. Do your clients
accept AI as a billable line item?
```

## 第 3 步 · X / Twitter build-in-public 线程(发布日或次日)

```
1/ I shipped my first open-source tool: devspend — a local CLI that tells
you which PROJECT is eating your AI coding budget. 🧵

2/ The problem: everyone knows their total AI spend ($100–300/mo is common
now). Nobody knows the split per project/client. Rate-limit anxiety without
attribution.

3/ What it does: reads Claude Code's local logs → dedupes → cache-aware
pricing (overridable) → spend by day / project / model. Zero deps, MIT,
100% local.

npx devspend projects

4/ Founding insight: cost dashboards are per-tool. Billing is per-project.
The intersection was empty.

5/ Roadmap: API-key ingest → subscriptions as cost pools allocated by usage
→ invoice-grade exports (Pro, one-time license, no subscription).

GitHub: <你的仓库链接>
```

## 第 4 步 · Product Hunt(第 2 周,HN/Reddit 有素材后再上)

Tagline: `Know which project eats your AI budget`
Description: 三句话(问题/做法/承诺),配落地页截图 + 终端输出图。

## 第 5 步 · FDE 生态(第 2 周,顺手)

- openfde 的 Discussions 发一帖(同 r/freelance 的提问角度)
- fde-workbench 若仍活跃,在其 issue/discussion 礼貌提互补工具(先看版规)

## 每日 5 分钟 · 数据记录(贴在此表,决策用)

| 日期 | GitHub star | waitlist | 评论/DM 中付费意向 | 备注 |
|---|---|---|---|---|
|  |  |  |  |  |

## 止损与加注(第 14 天复盘)

- **达标任一**(≥100★ / ≥100 waitlist / ≥3 人问付费):继续 Phase 1 + Pro
- **接近**(如 40~80★):再做一轮内容(SEO 对比文、教程视频)延长一周观察
- **远未达标**:停,回决策文档走方向 B,损失 ≈ 0
