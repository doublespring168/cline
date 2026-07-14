---
title: "智能体团队"
sidebarTitle: "智能体团队"
description: "通过 CLI 协调多个智能体，共同处理复杂任务。"
---
<Warning>
  此功能目前仅适用于 Cline SDK、CLI 和 Kanban，暂不适用于 VS Code 和 JetBrains 扩展。
</Warning>


智能体团队让你可以将复杂工作拆分给多个智能体，这些智能体通过共享任务板进行协调。一个智能体担任协调者，将子任务委派给专业智能体。

## 启动团队

```bash
cline --team-name auth-sprint "Plan and implement user authentication with tests"
```

`--team-name` 标志用于启用团队模式。协调者智能体会获得用于生成队友和委派任务的额外工具。

## 恢复团队工作

团队状态会跨会话保留。从上次中断的位置继续：

```bash
cline --team-name auth-sprint "Continue with incomplete tasks"
```

## 交互模式

在交互模式下，使用 `/team` 斜杠命令：

```
/team Plan and implement a REST API with tests
```

## 团队状态

团队状态存储在 `~/.cline/data/teams/[team-name]/` 中，其中包括：

- 包含当前任务和状态的任务板
- 智能体间邮箱
- 包含活动历史的任务日志

## 禁用团队

团队默认启用。使用以下命令将其禁用：

```bash
cline --no-teams "your prompt"
```

## 子智能体

对于单个会话中的简单委派（无持久状态），请使用[子智能体](/features/subagents)。子智能体并行运行以进行只读研究，并向主智能体返回聚焦的报告。

有关编程 API，请参阅 [SDK 多智能体团队指南](/sdk/guides/multi-agent-teams)。
