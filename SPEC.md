# token账单(devspend)· MVP 规格 v0.1

> 更新:2026-09-28 · 决策方向 A(开发者 × AI 工作流)的落地规格

## 一句话定位

**面向自由职业开发者和小团队的 AI 开销账本**:把散落在 Claude Code 日志、API 账单、订阅里的 AI 花费,归集到项目与客户维度,变成能计入报价和账单的一行行明细。

## 为什么是这个切口(证据链)

1. **痛点真实**:2026 年 Claude Code 用户两大持续抱怨——token 烧钱失控、rate limit 撞墙(相关文章贯穿全年);Cursor 2025 年定价事故留下计费信任裂痕。
2. **竞品全部挤在"单工具、看图"层**:
   - ccusage:免费开源、18k+ star、CLI,**只做 Claude Code**
   - tokn.watch(macOS 菜单栏)、ccassist、Tokemon、claudelog、VibeTime:全是单工具的界面/可视化/排行榜变体
   - Lineman.io:团队治理视角(按开发者可见),企业向
   - **没有一家做:跨工具汇总 + 项目/客户归集 + 开票导出**
3. **付费意愿已被相邻赛道验证**:AI 代码审查的 CodeRabbit 融资 $143M、估值 $15 亿,证明"AI 开发者工作流"的付费市场巨大——但那个位置有重兵,这个位置还是空的。

## 目标用户与 ROI 故事

- **用户**:用 Claude Code / Cursor / API 密钥交付项目的自由职业开发者、小外包团队、indie hacker
- **痛**:每月 AI 花费 $80~300,却说不清哪个客户/项目花了多少,更没法计入账单
- **ROI**:一次性 $49 的工具,帮你把每月 $100~500 的 AI 成本变成可向客户收取的账单行,一单回本
- **定价锚点不是"好看的图表",是"能收回多少钱"**

## MVP 范围

**Phase 0(本周,骨架已完成)**
- [x] Claude Code 本地日志解析(JSONL、去重、缓存计价、脏行容错)
- [x] 按日 / 按项目 / 按模型三张报表
- [x] 价格表可覆盖(`~/.devspend/prices.json`)
- [x] 烟雾测试通过(含去重陷阱用例)
- [ ] npm 发布 + GitHub 开源(MIT)

**Phase 1(2~3 周,验证期)**
- [ ] OpenRouter / OpenAI / Anthropic API 用量接入(只读密钥)
- [ ] 订阅项手工录入(Claude Pro / Cursor / Copilot 月费)
- [ ] 项目别名规则(repo 路径 → 客户/项目名)
- [ ] 本地 Web 仪表盘(React + SQLite,数据不出本机)

**Phase 2(Pro,验证达标后才做)**
- [ ] 客户实体 + 发票级导出(CSV/PDF 行项)
- [ ] 预算告警(按项目 / 客户 / 月度)
- [ ] 多机同步(可选、加密)
- [ ] 一次性授权 $49(Paddle / Creem 收款)

## 商业模式

- **开源核心**(MIT):信任 + GitHub 分发,star 是冷启动货币
- **Pro 一次性买断 $49**:自由职业者对订阅过敏,买断转化好(Tailscan 先例:一次性定价做到 $3.3K MRR)
- **不做账号墙**:CLI 永远免费,Pro 只锁定"开票工作流"

## 风险与对策

| 风险 | 对策 |
|---|---|
| 日志格式随版本变动 | 解析器防御式设计;字段改名历史上发生过(cache_creation → cache_creation_input_tokens),两个口径都收 |
| Anthropic 官方出成本面板 | 官方面板只会覆盖自家;跨工具 + 开票归集是结构性差异 |
| ccusage 扩展成全工具版 | 它的定位是 CLI 统计;开票/客户归集是另一条产品线。靠定位和速度区隔 |
| Cursor 无公开本地日志 | MVP 不依赖它;API/订阅侧先覆盖,后续再评估 |
| 开发者不愿付费 | 卖"回本"不卖"图表";转化对象是"用 AI 交付赚钱的人",不是所有开发者 |

## 分发计划(零预算)

1. Hacker News "Show HN: Devspend"(发布周)
2. r/freelance、r/webdev、r/ClaudeAI + 相关 Discord
3. X build in public(开发过程本身即内容)
4. SEO 长尾词:"claude code cost per project"、"track ai spending freelance",每词一篇对比文
5. ccusage 的 GitHub issue/discussion 生态里提供互补价值(不刷屏)
6. **FDE/ANE 社区**:openfde(Discussions)、awesome-fde-resources、GitHub topic: fde——"AI 前移工程师"是 2026 年新兴职业画像,和本产品目标用户(AI 交付者)高度重合(2026-10-01 补充)

## 验证门槛(发布后 2 周,数据说话)

满足其一才继续投入 Phase 1/Pro:
- GitHub ≥ 100 star,或
- 落地页 waitlist ≥ 100 邮箱,或
- ≥ 10 个目标用户深度对话中,≥ 3 人主动问"什么时候能付费"

未达标 → 回到路线清单(方向 B 创作者工具 / 方向 C 消费工具)。这不是失败,是花 ¥300 以内买到的市场课。

## 决策日志

- **2026-09-28**:否决 AI 代码审查(CodeRabbit $143M/$1.5B,正面战场单人送死);否决"又一个 Claude Code 成本面板"(ccusage 免费 18k star,红海);选定"跨工具 AI 开销账本 + 项目/客户归集 + 开票导出"——竞品地图上的无主之地,且与我们"会写代码 + 时间少"的资源结构完全匹配。
