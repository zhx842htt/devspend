---
title: How I Track My AI Coding Costs Per Project (and Bill Them to Clients)
published: false
description: Your Claude Code spend is a real line in your costs. Here's how to attribute it to projects — from raw JSONL logs to invoice-ready numbers.
tags: ai, devtools, productivity, opensource
canonical_url: https://dev.to/zhx842htt/track-ai-coding-costs-per-project
---

If you deliver software with Claude Code (or Cursor, or raw API keys), you probably know roughly what you spend on AI each month. What you almost certainly *can't* answer is:

> "Which project — or which **client** — consumed that spend?"

That question matters if any of your work is billed. Hours and licenses show up on invoices; AI costs currently hide inside a terminal. This post shows where the data actually lives, how to turn it into per-project dollars, and the tooling I built to make it one command.

## The data was on your machine all along

Claude Code writes every session to local JSONL files:

```
~/.claude/projects/<project-slug>/<session-id>.jsonl
```

Each line is an event. Assistant messages carry the interesting part — a `message.usage` object with token counts, the model name, plus the session's `cwd` (which is how you know *which project* the tokens belong to):

```json
{
  "type": "assistant",
  "timestamp": "2026-09-20T10:00:00.000Z",
  "sessionId": "session-a",
  "cwd": "/home/dev/clientA-api",
  "message": {
    "model": "claude-sonnet-4-20250514",
    "usage": {
      "input_tokens": 1200,
      "output_tokens": 800,
      "cache_creation_input_tokens": 5000,
      "cache_read_input_tokens": 20000
    }
  }
}
```

Group by `cwd`, sum tokens, multiply by prices — done? Almost. Three gotchas first.

## Gotcha 1: naive token × price is wrong

Most of the tokens in an agentic coding session never hit list input price. The big three buckets:

| Bucket | Typical price vs input | Why it dominates |
|---|---|---|
| `input_tokens` | 1× | the actual new context |
| `cache_creation_input_tokens` | ~1.25× | writing context to cache |
| `cache_read_input_tokens` | ~0.1× | re-reading cached context — **the majority in long sessions** |

Ignore the cache split and your estimate can be off by several times. The formula per message:

```
billable = input×1 + cache_write×1.25 + cache_read×0.1   (× input price)
         + output×output_price
```

## Gotcha 2: duplicate lines

Streaming writes can emit the same assistant message more than once. Dedupe on `message.id` (unique per message) — or your costs inflate silently. A fingerprint of `timestamp + sessionId + token counts` works for older formats without ids.

## Gotcha 3: prices drift

Model pricing changes often enough that hardcoding numbers in a script you'll forget about is a trap. Keep a price table in a config file (`~/.devspend/prices.json` overrides the built-ins) and treat every output as an *estimate* until you calibrate it.

## Putting it together: one command

I packed the above into a small zero-dependency CLI, **devspend** (MIT, open source — I'm the author, to be clear):

```bash
npx devspend projects
```

```
项目路径                          花费        输入tok       输出tok
/clients/acme-rewrite           $142.80      31.2M         1.8M
/clients/globex-mvp              $96.15      19.7M         1.1M
/side-projects/devspend          $12.40       2.1M         0.3M
─────────────────────────────────────────────────────────────
合计                             $251.35
```

It reads only local files, sends nothing anywhere, and also does day/model breakdowns (`devspend report`, `devspend models`). The full source is short enough to audit in one sitting — which is the point; billing numbers should be verifiable.

- GitHub: [zhx842htt/devspend](https://github.com/zhx842htt/devspend)
- Waitlist for the billing-grade features: [devspend.netlify.app](https://devspend.netlify.app)

## The part that actually pays: billing

Once spend is attributed per project, two defensible billing models emerge:

1. **Rate-card billing (API users):** your token costs at list prices become a line item, like billable hours. Estimate-based, transparent, easy to defend.
2. **Cost-pool allocation (subscription users):** your Claude Max / Cursor subscription is a fixed pool; allocate it across clients proportionally to usage. Arguably *more* honest than rate-card, since it matches your real cash outflow.

Either way the win is the same: a cost that used to silently eat your margin becomes visible, discussable, and recoverable. The first freelancer conversation I'd love to hear more about is simply: *do your clients accept AI as a billable line today, or is everyone still rolling it into the rate?* Genuine question — comments open.

## Roadmap

API-key usage ingest (OpenRouter/OpenAI/Anthropic) and subscription cost pools are next; client entities and invoice-grade exports after that. The CLI stays free and open — the billing workflow is what becomes Pro.

If you've built your own tracking scripts, I'd genuinely like to compare notes.
