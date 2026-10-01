import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

// 出厂默认价(USD / 每百万 token)。各家调价频繁,用户务必用 ~/.devspend/prices.json 覆盖校准。
// 覆盖格式:[{ "match": "claude-sonnet", "input": 3, "output": 15 }]
export const DEFAULT_PRICES = [
  { match: /claude.*opus/i, input: 15, output: 75 },
  { match: /claude.*(sonnet|4-5)/i, input: 3, output: 15 },
  { match: /claude.*haiku/i, input: 0.8, output: 4 },
  { match: /gpt-5/i, input: 1.25, output: 10 },
  { match: /gpt-4o-mini/i, input: 0.15, output: 0.6 },
  { match: /gpt-4o/i, input: 2.5, output: 10 },
  { match: /gpt-4\.1/i, input: 2.5, output: 10 },
];

const CACHE_READ_MULTIPLIER = 0.1;   // 缓存读约为输入价 1 折
const CACHE_WRITE_MULTIPLIER = 1.25; // 缓存写约为输入价 1.25 倍

export function loadPrices() {
  const overrides = [];
  const overridePath = join(homedir(), '.devspend', 'prices.json');
  if (existsSync(overridePath)) {
    try {
      const parsed = JSON.parse(readFileSync(overridePath, 'utf8'));
      for (const o of parsed) {
        overrides.push({ match: new RegExp(o.match, 'i'), input: o.input, output: o.output });
      }
    } catch {
      console.error(`[devspend] 警告: ${overridePath} 解析失败,已忽略,使用默认价格表`);
    }
  }
  // 用户覆盖优先于默认
  return { list: [...overrides, ...DEFAULT_PRICES] };
}

export function costOf(model, usage, prices) {
  const rule = prices.list.find((p) => p.match.test(model));
  if (!rule) return { cost: 0, unknown: true };
  const cacheWrite = usage.cacheWrite || 0;
  const cacheRead = usage.cacheRead || 0;
  const billableInput =
    (usage.input || 0) +
    cacheWrite * CACHE_WRITE_MULTIPLIER +
    cacheRead * CACHE_READ_MULTIPLIER;
  const billableOutput = usage.output || 0;
  return {
    cost: (billableInput * rule.input + billableOutput * rule.output) / 1e6,
    unknown: false,
  };
}
