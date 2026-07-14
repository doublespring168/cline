---
title: "Kanban"
sidebarTitle: "概览"
description: "使用 Cline Kanban 通过相互隔离的 git worktree 并行运行多个编码智能体。"
---

<Warning>
Kanban 是一个**研究预览版**。此处介绍的部分功能使用了实验性能力，后续可能会发生变化。
</Warning>

## 前提条件

- Node.js 18+
- 一个 git 仓库（从仓库根目录运行）
- Kanban 启动器可用（`npx kanban`）

## 快速开始

```bash
cd /path/to/your/repo
npx kanban
```

这会启动一个本地服务器，并在浏览器中打开看板。

## 核心工作流

1. 在看板上**创建任务**（手动创建或通过边栏聊天创建）。
2. 使用播放按钮**启动任务**——每张卡片都会获得一个隔离的 git worktree 和终端。
3. 通过卡片状态和智能体的最新输出来**监控进度**。
4. 在卡片详情视图中**审查差异**并留下行内评论。
5. 通过 Commit（提交）或 Open PR（打开 PR）**交付变更**。
6. 将卡片移至回收站以**清理**（worktree 会被移除）。

## 主要功能

- **并行执行：**每项任务都在独立的 worktree 中运行，以避免冲突。
- **任务关联：**依赖链可以自动启动后续任务。
- **行内审查循环：**直接在差异行上添加评论，以引导智能体工作。
- **自动提交/自动创建 PR：**可在设置中启用的可选自动化功能。
- **边栏聊天编排：**让智能体将工作拆分为卡片并启动流程。

## 智能体兼容性

Kanban 专为 CLI 风格的编码智能体设计，目前可与 Cline CLI、Claude Code、Codex、OpenCode 以及设置中提供的相关运行时配合使用。

## 后续步骤

- [Kanban 核心工作流](/kanban/core-workflow)
- [Kanban 远程访问](/kanban/remote-access)
