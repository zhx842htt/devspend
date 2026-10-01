import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

// Claude Code 的本地会话日志: ~/.claude/projects/<project-slug>/<sessionId>.jsonl
// 已知格式(以 ccusage 等工具的解析口径为准):
//   每行一个 JSON,assistant 消息形如
//   { type:"assistant", timestamp, sessionId, cwd,
//     message:{ id, model, usage:{ input_tokens, output_tokens,
//       cache_creation_input_tokens, cache_read_input_tokens } } }
// 字段在不同版本间有改名(cache_creation -> cache_creation_input_tokens),此处两个口径都收。

export function defaultClaudeDir() {
  return join(homedir(), '.claude', 'projects');
}

export function* jsonlEntries(dir) {
  if (!existsSync(dir)) return;
  const jsonlFiles = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      // Claude Code 原生布局: <dir>/<project-slug>/<sessionId>.jsonl
      for (const f of readdirSync(join(dir, entry.name))) {
        if (f.endsWith('.jsonl')) jsonlFiles.push(join(dir, entry.name, f));
      }
    } else if (entry.name.endsWith('.jsonl')) {
      // 平铺布局: <dir>/*.jsonl(方便用户直接指定任意目录)
      jsonlFiles.push(join(dir, entry.name));
    }
  }
  for (const full of jsonlFiles) {
    const text = readFileSync(full, 'utf8');
    for (const line of text.split('\n')) {
      const t = line.trim();
      if (!t) continue;
      let entry;
      try {
        entry = JSON.parse(t);
      } catch {
        continue; // 跳过截断/损坏行
      }
      yield entry;
    }
  }
}

// 汇总成统一的 usage 行;按 message id + 时间戳去重(流式写入可能产生重复行)
export function collectUsage(dir) {
  const rows = [];
  const seen = new Set();
  for (const e of jsonlEntries(dir)) {
    const u = e && e.message && e.message.usage;
    if (!u || !e.timestamp) continue;
    // message.id 全局唯一,以它为主键去重(流式/重放会产生重复行);
    // 没有 id 的旧格式行退回到"时间戳+会话+用量指纹"去重
    const fingerprint = `${u.input_tokens}|${u.output_tokens}|${u.cache_creation_input_tokens || 0}|${u.cache_read_input_tokens || 0}`;
    const key = e.message.id || `${e.timestamp}|${e.sessionId || ''}|${fingerprint}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const usage = u || {};
    const cacheObj = usage.cache_creation || {};
    rows.push({
      ts: new Date(e.timestamp),
      sessionId: e.sessionId || 'unknown',
      project: e.cwd || '(未知项目)',
      model: (e.message && e.message.model) || 'unknown',
      input: usage.input_tokens || 0,
      output: usage.output_tokens || 0,
      cacheWrite: usage.cache_creation_input_tokens ?? cacheObj.input_tokens ?? 0,
      cacheRead: usage.cache_read_input_tokens ?? (usage.cache_read || {}).input_tokens ?? 0,
    });
  }
  return rows;
}
