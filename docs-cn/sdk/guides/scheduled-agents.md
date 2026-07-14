---
title: "定时智能体"
sidebarTitle: "定时智能体"
description: "按 cron 计划运行智能体，用于每日摘要、代码审查和维护任务等周期性自动化。"
---

SDK 支持按 cron 计划运行智能体。定时智能体可在进程重启后继续存在，并且独立于任何客户端应用程序运行。

## 调度的工作原理

1. 定义计划（cron 表达式 + 提示词 + 配置）
2. SDK 存储计划并管理执行
3. 每次触发时，都会创建一个新会话并运行智能体
4. 结果会被存储，并可路由至连接器（Slack、电子邮件等）

定时智能体依赖作为 `ClineCore` 一部分的[中心辐射式架构](/sdk/architecture/hub-spoke)。中心在你的计算机上作为后台进程运行。它会在需要时自动启动，并在重启后保留计划。

## 使用 Cline SDK 以编程方式创建计划

```typescript
import { ClineCore } from "@cline/sdk"

const cline = await ClineCore.create({
  clientName: "scheduler",
  automation: true,
})

await cline.automation.start()

// Use cline.automation to reconcile specs, ingest events, and list runs.
```

## 使用 Cline CLI 的计划向导

如果你已通过 `npm i -g cline` 安装 Cline CLI，使用它来安排任务是一种简便的方法。

运行 `cline schedule` 可打开交互式菜单，用于创建和管理计划、浏览执行历史记录以及查看性能统计信息。

## 使用标志创建计划

```bash
# Daily at 9 AM on weekdays
cline schedule create "PR summary" \
  --cron "0 9 * * MON-FRI" \
  --prompt "List all open PRs, their review status, and any that have been open more than 3 days" \
  --workspace /path/to/repo \
  --model anthropic/claude-sonnet-4-6

# Every 6 hours
cline schedule create "Health check" \
  --cron "0 */6 * * *" \
  --prompt "Run the test suite and report any failures" \
  --workspace /path/to/project

# Monday mornings
cline schedule create "Weekly digest" \
  --cron "0 8 * * MON" \
  --prompt "Summarize last week's commits, PRs merged, and issues closed"
```

## 管理计划

```bash
# List all schedules
cline schedule list

# Trigger a schedule immediately (without waiting for cron)
cline schedule trigger <schedule-id>

# Pause a schedule
cline schedule pause <schedule-id>

# Resume a paused schedule
cline schedule resume <schedule-id>

# Delete a schedule
cline schedule delete <schedule-id>

# View execution history
cline schedule executions <schedule-id>
```

## Cron 表达式参考

| 表达式 | 计划 |
|-----------|----------|
| `0 9 * * MON-FRI` | 周一至周五上午 9 点 |
| `0 */6 * * *` | 每 6 小时 |
| `0 8 * * MON` | 每周一上午 8 点 |
| `30 17 * * *` | 每天下午 5:30 |
| `0 0 1 * *` | 每月 1 日午夜 |
| `*/30 * * * *` | 每 30 分钟 |

## 使用场景

### 每日站会摘要

```bash
cline schedule create "Standup prep" \
  --cron "0 8 * * MON-FRI" \
  --prompt "Summarize: (1) PRs merged yesterday, (2) PRs currently in review, (3) open issues assigned to team members. Format as a brief standup update." \
  --workspace /path/to/repo
```

### 自动更新依赖项

```bash
cline schedule create "Dependency check" \
  --cron "0 10 * * MON" \
  --prompt "Check for outdated npm dependencies. For any with security vulnerabilities, create a branch with the update and open a PR." \
  --workspace /path/to/project
```

### 代码库健康状况报告

```bash
cline schedule create "Code health" \
  --cron "0 6 * * MON" \
  --prompt "Analyze the codebase for: (1) files with no test coverage, (2) TODO/FIXME comments older than 30 days, (3) functions longer than 100 lines. Produce a health report." \
  --workspace /path/to/project
```

## 并发和资源限制

调度器会强制执行限制以防止资源耗尽：

- 计划具有可配置的并发限制
- 如果下一次触发时上一次执行仍在运行，则新的执行会排队或跳过（可配置）
- 中心会监控资源使用情况，并可在系统负载过高时暂停计划

## 路由结果

在 CLI 中将定时智能体与[连接器](/cli/connectors)结合使用，将结果路由到消息平台：

```bash
# Start a Telegram connector
cline connect telegram -k $BOT_TOKEN

# Schedule an agent whose output gets sent to Telegram
cline schedule create "Morning briefing" \
  --cron "0 8 * * *" \
  --prompt "Summarize overnight activity in the repo"
```
