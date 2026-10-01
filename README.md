# devspend

> **One ledger for your AI dev spend. Tagged by project. Ready to bill.**

If you deliver client work with Claude Code, API keys, and AI subscriptions, you're probably spending **$80–300/month on AI** — and you can't say which client it went to, let alone put it on an invoice.

**devspend** reads your local agent logs and API usage, tags every dollar by project, and turns it into invoice-ready line items. 100% local. Zero cloud. Zero config.

## Quickstart

```bash
npx devspend report      # spend by day (last 30d)
npx devspend projects    # spend by project — the billing view
npx devspend models      # spend by model
```

It reads Claude Code session logs from `~/.claude/projects` by default. Point it anywhere:

```bash
npx devspend projects --path /some/other/log/dir
```

## How billing-accurate pricing works

Token costs include cache pricing (cache writes ≈ 1.25× input, cache reads ≈ 0.1× input), and prices are fully overridable at `~/.devspend/prices.json`:

```json
[{ "match": "claude-sonnet", "input": 3, "output": 15 }]
```

Default prices ship built-in as sane estimates — **calibrate them to your plan before invoicing** (subscription plans like Claude Max don't pay per-token rates).

## Roadmap

- **Phase 1** — API usage ingest (OpenRouter / OpenAI / Anthropic, read-only keys), subscription entries, project aliases, local web dashboard
- **Phase 2 (Pro)** — client entities, invoice-grade exports (CSV/PDF), budget alerts, optional encrypted sync. One-time license, no subscription.

## How is this different from ccusage?

[ccusage](https://github.com/ryoppippi/ccusage) is an excellent free CLI for Claude Code usage stats — this project stands on its shoulders for the log format. devspend is built one layer up, for **billing**: multi-source ingest, project/client attribution, and invoice-ready exports. Use both if you like; devspend will always keep the CLI free.

## Privacy

Everything runs on your machine. No telemetry, no accounts, no cloud. Open core (MIT); Pro adds billing workflows, not locks on your data.

## License

MIT
