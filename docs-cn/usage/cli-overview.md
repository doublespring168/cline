---
title: "CLI 概览"
sidebarTitle: "CLI 概览"
description: "使用 Cline CLI 进行交互式终端会话和自动化无头工作流。"
---

## 前提条件

- 已安装 Cline CLI（通过 `npm i -g cline` 安装）
- 已完成提供商身份验证（`cline auth`）（[授权指南](/getting-started/authorizing-with-cline#cli-%E8%AE%BE%E7%BD%AE)）

## 快速开始

```bash
# Interactive session
cline

# Run one task immediately
cline "refactor this module to use async/await"

# Structured output for scripts
cline --json "list TODO comments"
```

## 无头模式

使用无头模式执行脚本/自动化任务并获得可处理的输出。

使用 `--json` 等标志、通过管道传入 stdin 或重定向输出时，会触发无头模式。

#### 无头模式何时激活

| 调用方式 | 原因 |
|---|---|
| `cline --json "task"` | JSON 输出模式 |
| `cat file \| cline "task"` | stdin 通过管道传入 |
| `cline "task" > output.txt` | stdout 被重定向 |

```bash
# CI/script style execution
git diff | cline "review these changes"

# JSON for parsing
cline --json "summarize this changelog" | jq -r '.text'
```

参见：[无头模式](#%E6%97%A0%E5%A4%B4%E6%A8%A1%E5%BC%8F)

### 自主执行

对于完全无人值守的运行，请使用自动批准：

```bash
cline --auto-approve true "run tests and fix failures"
```

无头运行也支持模式选择：

```bash
# plan-first
cline -p "design migration plan"

# act immediately (default)
cline "apply migration"
```

<Warning>
自主执行可以在不进一步提示的情况下修改文件和运行命令。请使用干净的分支并审查结果。
</Warning>

## 高价值命令

```bash
cline --help
cline <command> --help
```

| 命令 | 用途 |
|---|---|
| `cline` | 启动交互模式或运行提示词 |
| `cline auth` | 进行身份验证并设置提供商/模型 |
| `cline config` | 打开交互式配置视图 |
| `cline mcp` | 管理 MCP 服务器 |
| `cline doctor` | 诊断/修复配置问题 |
| `cline history` | 显示并管理任务历史记录 |
| `cline schedule` | 管理计划任务 |
| `cline hub` | 管理本地 Hub 守护进程 |
| `cline kanban` | 启动 Kanban 应用 |

## 最常用的全局标志

权威来源：[CLI 参考](/cli/cli-reference)

| 标志 | 用途 |
|---|---|
| `-p, --plan` | 以规划模式启动 |
| `--auto-approve <boolean>` | 全局工具自动批准（`true`/`false`，默认值为 `true`） |
| `-m, --model <model>` | 覆盖本次运行使用的模型 |
| `-P, --provider <id>` | 覆盖本次运行使用的提供商 |
| `-c, --cwd <path>` | 设置工作目录 |
| `--config <dir>` | 使用配置目录 |
| `--data-dir <dir>` | 使用隔离的本地状态 |
| `--json` | 输出以换行符分隔的 JSON 消息 |
| `--thinking <level>` | 设置推理强度：`none\|low\|medium\|high\|xhigh`（默认值为 `medium`） |
| `-t, --timeout <seconds>` | 设置任务超时时间 |

## 自动化模式

### 通过管道传入上下文

```bash
cat README.md | cline "summarize key setup steps"
git diff | cline "review for potential regressions"
```

### 串联任务

```bash
git diff | cline "explain these changes" | cline "write a commit message"
```

### 限制命令执行

```bash
export CLINE_COMMAND_PERMISSIONS='{"allow": ["npm *", "git *"], "deny": ["rm -rf *", "sudo *"]}'
```

### 在任务中包含图片

```bash
cline -i "fix the layout issue shown in @./screenshot.png"

# or reference inline
cline "fix the UI shown in @./design-mockup.png"
```

### 设置执行超时时间

```bash
cline --timeout 600 "run full test suite"
```

## JSON 输出架构

使用 `--json` 时，每一行都是一个 JSON 消息对象。

```json
{"type":"say","text":"I'll create the file now.","ts":1760501486669,"say":"text"}
```

| 字段 | 类型 | 描述 |
|---|---|---|
| `type` | `"ask"` 或 `"say"` | 消息类别 |
| `text` | `string` | 消息内容 |
| `ts` | `number` | 以毫秒为单位的 Unix 时间戳 |
| `say` | `string` | `type` 为 `"say"` 时的子类型 |
| `ask` | `string` | `type` 为 `"ask"` 时的子类型 |
| `reasoning` | `string` | 可选的模型推理内容 |
| `partial` | `boolean` | 流式传输标志 |

## 后续步骤

- [CLI 参考](/cli/cli-reference)
