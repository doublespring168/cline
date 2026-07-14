---
title: "定时任务"
sidebarTitle: "定时任务"
description: "按 cron 计划运行智能体，用于每日摘要和代码审查等周期性自动化任务。"
---
<Warning>
  此功能目前仅适用于 Cline SDK、CLI 和 Kanban，暂不适用于 VS Code 和 JetBrains 扩展。
</Warning>

CLI 支持通过 Hub 按 cron 计划运行智能体。定时智能体会跨进程重启保留，并独立于任何终端会话运行。

## 定时任务向导

运行 `cline schedule` 可打开交互式菜单，用于创建和管理定时任务、浏览执行历史以及查看性能统计数据。

```bash
cline schedule
```

该向导提供以下操作：

| 操作 | 描述 |
|--------|-------------|
| 创建新定时任务 | 设置具有 cron 时间安排和提示词的周期性任务 |
| 列出定时任务 | 查看所有定时任务及其状态和下次运行时间 |
| 即将运行 | 预览接下来的 10 次定时执行 |
| 活跃执行 | 显示当前正在运行的任务 |
| 立即触发 | 立即运行选定的定时任务 |
| 暂停 / 恢复 | 暂停或重新启动定时任务 |
| 执行历史 | 查看过去运行的状态、时长、token 和成本 |
| 统计数据 | 成功率、平均时长、最近一次失败 |
| 删除 | 移除定时任务 |

## 使用标志创建定时任务

```bash
cline schedule create "PR summary" \
  --cron "0 9 * * MON-FRI" \
  --prompt "List all open PRs and their review status" \
  --workspace /path/to/repo \
  --model anthropic/claude-sonnet-4-6
```

## 管理定时任务

```bash
cline schedule list
cline schedule trigger <schedule-id>
cline schedule pause <schedule-id>
cline schedule resume <schedule-id>
cline schedule delete <schedule-id>
cline schedule executions <schedule-id>
```

## Cron 表达式参考

| 表达式 | 计划 |
|-----------|----------|
| `*/5 * * * *` | 每 5 分钟 |
| `*/15 * * * *` | 每 15 分钟 |
| `0 * * * *` | 每小时 |
| `0 */6 * * *` | 每 6 小时 |
| `0 0 * * *` | 每天午夜 |
| `0 9 * * *` | 每天上午 9 点 |
| `0 9 * * 1-5` | 每个工作日上午 9 点 |
| `0 9 * * 1` | 每周一上午 9 点 |
| `0 0 1 * *` | 每月第一天 |

## 示例

### 每日站会摘要

```bash
cline schedule create "Standup prep" \
  --cron "0 8 * * MON-FRI" \
  --prompt "Summarize: (1) PRs merged yesterday, (2) PRs currently in review, (3) open issues assigned to team members." \
  --workspace /path/to/repo
```

### 每周依赖项检查

```bash
cline schedule create "Dependency check" \
  --cron "0 10 * * MON" \
  --prompt "Check for outdated npm dependencies. For any with security vulnerabilities, create a branch with the update and open a PR." \
  --workspace /path/to/project
```

### 代码库健康报告

```bash
cline schedule create "Code health" \
  --cron "0 6 * * MON" \
  --prompt "Analyze the codebase for: (1) files with no test coverage, (2) TODO/FIXME comments older than 30 days, (3) functions longer than 100 lines." \
  --workspace /path/to/project
```

## 路由结果

将定时任务与[连接器](/cli/connectors)结合使用，以将结果发送到消息平台：

```bash
cline connect telegram -k $BOT_TOKEN

cline schedule create "Morning briefing" \
  --cron "0 8 * * *" \
  --prompt "Summarize overnight activity in the repo"
```

定时任务需要 Hub。创建定时任务时，它会自动启动。
