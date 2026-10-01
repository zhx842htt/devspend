#!/usr/bin/env node
// devspend — 你的 AI 开发开销账本
// 用法:
//   npx devspend report  [--path 日志目录] [--days 30]   按日汇总
//   npx devspend projects [--path 日志目录]              按项目汇总(可计费归集的基础)
//   npx devspend models   [--path 日志目录]              按模型汇总
//   npx devspend prices                                  查看当前价格表
import { defaultClaudeDir, collectUsage } from '../src/ingest/claude-code.mjs';
import { loadPrices, DEFAULT_PRICES } from '../src/pricing.mjs';
import { reportByDay, reportByProject, reportByModel } from '../src/report.mjs';

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--path') out.path = argv[++i];
    else if (a === '--days') out.days = parseInt(argv[++i], 10);
    else out._.push(a);
  }
  return out;
}

function help() {
  console.log(`devspend — 你的 AI 开发开销账本

命令:
  report    [--path 目录] [--days N]  按日汇总 Claude Code 用量与成本
  projects  [--path 目录]             按项目路径汇总(计费归集的基础)
  models    [--path 目录]             按模型汇总
  prices                                打印当前生效的价格表

默认读取 ~/.claude/projects 下的会话日志,一切数据只在本机处理。`);
}

const args = parseArgs(process.argv.slice(2));
const cmd = args._[0] || 'report';

if (cmd === 'help' || cmd === '--help' || cmd === '-h') {
  help();
} else if (cmd === 'prices') {
  console.log('当前价格表(USD / 百万 token,用户覆盖优先):');
  for (const p of loadPrices().list) console.log(`  ${String(p.match)}  in=$${p.input}  out=$${p.output}`);
  console.log(`\n内置默认 ${DEFAULT_PRICES.length} 条,可在 ~/.devspend/prices.json 覆盖。`);
} else if (cmd === 'report' || cmd === 'projects' || cmd === 'models') {
  const dir = args.path || defaultClaudeDir();
  const prices = loadPrices();
  const rows = collectUsage(dir);
  if (cmd === 'report') reportByDay(rows, prices, args.days || 30);
  if (cmd === 'projects') reportByProject(rows, prices);
  if (cmd === 'models') reportByModel(rows, prices);
} else {
  console.error(`未知命令: ${cmd}`);
  help();
  process.exit(1);
}
