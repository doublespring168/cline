---
title: "多智能体团队"
sidebarTitle: "多智能体团队"
description: "通过委派、共享上下文和结果合并，协调多个智能体共同处理复杂任务。"
---

多智能体团队让你可以将复杂工作拆分给多个智能体，这些智能体通过共享任务板进行协调。一个智能体充当协调者，将子任务委派给专业智能体，并合并它们的结果。

## 启用团队

团队是 ClineCore 的一项功能。请在会话配置中启用它：

```typescript
import { ClineCore } from "@cline/sdk"

const cline = await ClineCore.create({ clientName: "team-app" })

const session = await cline.start({
  prompt: "Plan and implement a user authentication module with tests",
  config: {
    providerId: "anthropic",
    modelId: "claude-sonnet-4-6",
    apiKey: process.env.ANTHROPIC_API_KEY,
    systemPrompt: "You are a coordinator for a multi-agent coding team.",
    cwd: "/path/to/project",
    workspaceRoot: "/path/to/project",
    enableTools: true,
    enableSpawnAgent: true,
    enableAgentTeams: true,
    teamName: "auth-sprint",
  },
})
```

## 团队的工作方式

启用团队后，协调者智能体会获得额外的工具：

| 工具 | 描述 |
|------|-------------|
| `team_spawn_teammate` | 创建具有特定角色和任务的新智能体 |
| `team_delegate_task` | 将任务分配给现有队友 |
| `team_check_status` | 检查已委派任务的状态 |
| `team_get_result` | 获取已完成任务的结果 |

协调者决定如何拆分工作、创建哪些智能体，以及如何合并结果。

## 团队持久化

团队状态会跨会话保留：

```
~/.cline/data/teams/[team-name]/
  task-board.json      # Current tasks and their status
  mailbox.json         # Inter-agent messages
  mission-log.json     # Team activity history
```

在新会话中继续团队的工作：

```bash
cline --team-name auth-sprint "Continue -- pick up incomplete tasks"
```

## 通过 CLI

```bash
# Start a new team
cline --team-name auth-sprint "Plan and implement user auth with tests"

# Resume work
cline --team-name auth-sprint "What's the status? Continue with unfinished tasks."

# Different team for a different workstream
cline --team-name perf-sprint "Profile the API endpoints and optimize the slowest 3"
```

## 子智能体与团队的对比

SDK 提供两个级别的多智能体协调：

| 功能 | 子智能体 | 团队 |
|---------|-----------|-------|
| 启用方式 | `enableSpawnAgent: true` | `enableAgentTeams: true` |
| 持久化 | 仅限会话内 | 跨会话 |
| 协调方式 | 父子式 | 通过任务板进行点对点协调 |
| 共享状态 | 无 | 任务板、邮箱、任务日志 |
| 最适合 | 一次性委派 | 复杂的多会话项目 |

子智能体更加轻量。父智能体生成一个子智能体，等待其结果，然后继续执行。没有持久化状态，也没有任务板。

```typescript
// Sub-agents: simple delegation within a single session
const session = await cline.start({
  config: {
    enableSpawnAgent: true,  // Agent can spawn sub-agents
    // ...
  },
  // ...
})
```

团队适用于规模更大的工作，其中工作会跨越多个会话，并且智能体需要异步协调。

## 何时使用团队

团队会带来额外开销。适合在以下情况下使用：

- 任务可以自然地分解为相互独立的子任务
- 不同子任务可受益于不同的系统提示词或专业能力
- 工作跨越多个会话或多天
- 你希望持久记录任务的委派与完成情况

对于更简单的情况，配备合适工具的单个智能体通常比团队更高效。
