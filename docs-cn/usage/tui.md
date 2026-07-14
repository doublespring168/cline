---
title: "TUI"
sidebarTitle: "TUI"
description: "使用 Cline 的终端 UI（TUI），在终端中开展交互式编码工作流。"
---

## 什么是 TUI？

TUI 是 Cline 的交互式终端界面。它专为终端内的对话式工作而设计：提出问题、审查计划、批准操作并快速迭代。

## 前提条件

安装 CLI：

```bash
npm install -g cline
```

## 启动 TUI

```bash
# default interactive launch
cline

# explicit TUI mode
cline -i
```

## TUI 核心操作

- 按 `Tab` 切换 Plan/Act
- 按 `Shift+Tab` 切换是否全部自动批准
- 按 `Ctrl+C` 中止正在运行的轮次；再次按下可退出
- 当提示符为空且处于空闲状态时，按 `Ctrl+D` 退出
- 按 `Ctrl+L` 清除聊天视图或当前对话
- `/settings`、`/model`、`/account`、`/mcp`、`/compact`、`/undo`、`/clear`、`/history`、`/help`、`/quit`
- 使用 `@file` 提及来提供工作区上下文

状态区域会显示当前模型、上下文使用量、费用、工作区/分支、git 差异统计、Plan/Act 状态，以及是否已启用全部自动批准。

## 何时使用 TUI，何时使用无头模式

- 当你希望进行协作和批准时，请使用 **TUI**。
- 对于自动化任务，请使用**无头模式**（`--json`、通过管道传入的 stdin/stdout、CI 脚本）。

参见：[CLI 无头模式](/usage/cli-overview#%E6%97%A0%E5%A4%B4%E6%A8%A1%E5%BC%8F)

## 后续步骤

- [CLI 概览](/usage/cli-overview)
- [CLI 参考](/cli/cli-reference)
