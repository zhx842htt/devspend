import { costOf } from './pricing.mjs';

function fmtUSD(n) {
  if (n === 0) return '$0';
  if (n < 0.01) return '$' + n.toFixed(4);
  if (n < 1) return '$' + n.toFixed(3);
  return '$' + n.toFixed(2);
}

function sumBy(rows, keyFn, prices) {
  const map = new Map();
  const unknownModels = new Set();
  for (const r of rows) {
    const { cost, unknown } = costOf(r.model, r, prices);
    if (unknown) unknownModels.add(r.model);
    const key = keyFn(r);
    const cur = map.get(key) || { cost: 0, rows: 0, tokensIn: 0, tokensOut: 0 };
    cur.cost += cost;
    cur.rows += 1;
    cur.tokensIn += r.input + r.cacheWrite + r.cacheRead;
    cur.tokensOut += r.output;
    map.set(key, cur);
  }
  return { map, unknownModels };
}

function printTable(title, entries, unit) {
  console.log(`\n${title}`);
  const w = [28, 12, 14, 16];
  console.log(
    [unit.padEnd(w[0]), '花费'.padStart(w[1]), '输入tok'.padStart(w[2]), '输出tok'.padStart(w[3])].join('')
  );
  let total = 0;
  for (const [key, v] of entries) {
    total += v.cost;
    console.log(
      [
        key.slice(0, w[0]).padEnd(w[0]),
        fmtUSD(v.cost).padStart(w[1]),
        (v.tokensIn >= 1e6 ? (v.tokensIn / 1e6).toFixed(1) + 'M' : Math.round(v.tokensIn / 1e3) + 'K').padStart(w[2]),
        (v.tokensOut >= 1e6 ? (v.tokensOut / 1e6).toFixed(1) + 'M' : Math.round(v.tokensOut / 1e3) + 'K').padStart(w[3]),
      ].join('')
    );
  }
  console.log('─'.repeat(w[0] + w[1] + w[2] + w[3]));
  console.log(`${'合计'.padEnd(w[0])}${fmtUSD(total).padStart(w[1])}`);
  return total;
}

export function reportByDay(rows, prices, days) {
  const cutoff = Date.now() - days * 86400 * 1000;
  const recent = rows.filter((r) => r.ts.getTime() >= cutoff);
  if (recent.length === 0) {
    console.log(`近 ${days} 天没有找到任何用量记录。`);
    console.log('提示: 用 --path 指定日志目录,或先运行 Claude Code 产生本地日志。');
    return;
  }
  const { map, unknownModels } = sumBy(recent, (r) => r.ts.toISOString().slice(0, 10), prices);
  const total = printTable(`devspend · 近 ${days} 天按日汇总`, [...map.entries()].sort(), '日期');
  printModelWarning(unknownModels);
  console.log(`\n(价格为出厂估算,可在 ~/.devspend/prices.json 覆盖;本期合计 ${fmtUSD(total)})`);
}

export function reportByProject(rows, prices) {
  const { map, unknownModels } = sumBy(rows, (r) => r.project, prices);
  const entries = [...map.entries()].sort((a, b) => b[1].cost - a[1].cost);
  printTable('devspend · 按项目汇总(全量)', entries, '项目路径');
  printModelWarning(unknownModels);
}

export function reportByModel(rows, prices) {
  const { map } = sumBy(rows, (r) => r.model, prices);
  const entries = [...map.entries()].sort((a, b) => b[1].cost - a[1].cost);
  printTable('devspend · 按模型汇总(全量)', entries, '模型');
}

function printModelWarning(unknownModels) {
  if (unknownModels.size > 0) {
    console.log(`\n⚠ 未知价格模型的 token 未计价: ${[...unknownModels].join(', ')}`);
    console.log('  请在 ~/.devspend/prices.json 里为它们添加价格规则。');
  }
}
