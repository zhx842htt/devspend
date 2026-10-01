# Changelog

## 0.1.0 (2026-10-01)

首次发布。

- Claude Code 本地日志解析(`~/.claude/projects` 与平铺目录两种布局)
- 按消息 id 去重,脏行/截断行容错
- 缓存计价(cache write ≈ 1.25× 输入价,cache read ≈ 0.1× 输入价)
- 三张报表:`report`(按日)/ `projects`(按项目)/ `models`(按模型)
- 价格表可用 `~/.devspend/prices.json` 覆盖,未知模型显式告警不计价
- 零依赖,Node ≥ 16
