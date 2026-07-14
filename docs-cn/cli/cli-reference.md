---
title: "CLI 参考"
description: "Cline CLI 的完整命令参考，包括所有命令、标志和配置选项。"
---

```bash
cline --help           # Show all commands
cline <command> --help # Show help for a specific command
```

## 用法概要

```bash
cline [options] [command] [prompt]
```

## 帮助菜单（权威来源）

```text
Usage: cline [options] [command] [prompt]

Cline CLI - AI coding assistant in your terminal

Arguments:
  prompt                       Your prompt. Default to start in act mode with auto-approve enabled.

Options:
  -V, --version                Output the version number
  -p, --plan                   Run in plan mode
  --json                       Output messages as JSON instead of styled text
  --auto-approve <boolean>     Set tool auto-approval for all tools (default: true)
  -t, --timeout <seconds>      Optional timeout in seconds (default: 0 for no timeout)
  -m, --model <model-id>       Model to use for the session with the selected provider
  -v, --verbose                Show verbose output
  -c, --cwd <path>             Working directory
  --config <path>              Configuration directory (default: ~/.cline/data/settings)
  --data-dir <path>            Use isolated local state at this directory path (default: ~/.cline)
  --thinking <level>           Set reasoning effort level between none|low|medium|high|xhigh (default: medium)
  --retries <count>            Maximum consecutive mistakes (retries) before halting
  --hooks-dir <path>           Directory path to additional hooks for runtime hook injection (default: ~/.cline/hooks)
  --acp                        Run in Agent Client Protocol (ACP) mode for editor integration
  -i, --tui                    Open the terminal user interface (TUI) for interactive sessions
  --id <session-id>            Resume an existing session by ID
  -k, --key <api-key>          API key override for this run
  -P, --provider <id>          Provider id (default: cline)
  -s, --system <system-prompt> Override the default system prompt
  -z, --zen                    Start a session that runs in the background hub
  -h, --help                   display help for command

Commands:
  auth [options] [provider]    Authenticate a provider and configure what model is used
  config [options]             Show current configuration
  connect [options] [adapter]  Connect to an editor or IDE adapter
  mcp                          Manage MCP servers
  dev                          Developer tools and utilities
  doctor                       Diagnose and fix configuration issues
  history|h [options]          List session history or manage saved sessions
  hook                         Handle a hook payload from stdin
  plugin                       Manage Cline Plugins
  schedule                     Manage scheduled tasks
  hub                          Manage the local hub daemon
  update [options]             Check for updates and install if available
  version                      Show Cline CLI version number
  kanban                       Launch the kanban app and exit
```

## 全局选项

| 选项 | 描述 |
|--------|-------------|
| `-V, --version` | 输出版本号 |
| `-p, --plan` | 以规划模式运行 |
| `--json` | 以 JSON 而非样式化文本输出消息 |
| `--auto-approve <boolean>` | 设置所有工具的自动批准（默认值：`true`） |
| `-t, --timeout <seconds>` | 可选的超时时间（秒）（默认值：`0`，表示不超时） |
| `-m, --model <model-id>` | 会话中与所选提供商搭配使用的模型 |
| `-v, --verbose` | 显示详细输出 |
| `-c, --cwd <path>` | 工作目录 |
| `--config <path>` | 配置目录（默认值：`~/.cline/data/settings`） |
| `--data-dir <path>` | 在此目录路径使用隔离的本地状态（默认值：`~/.cline`） |
| `--thinking <level>` | 设置推理工作量：`none\|low\|medium\|high\|xhigh`（默认值为 `medium`） |
| `--retries <count>` | 停止前允许的最大连续错误（重试）次数 |
| `--hooks-dir <path>` | 用于运行时 Hook 注入的额外 Hook 目录路径（默认值：`~/.cline/hooks`） |
| `--acp` | 以 Agent Client Protocol (ACP) 模式运行，以便与编辑器集成 |
| `-i, --tui` | 打开终端用户界面 (TUI) 进行交互式会话 |
| `--id <session-id>` | 按 ID 恢复现有会话 |
| `-k, --key <api-key>` | 覆盖本次运行的 API 密钥 |
| `-P, --provider <id>` | 提供商 ID（默认值：`cline`） |
| `-s, --system <system-prompt>` | 覆盖默认系统提示词 |
| `-z, --zen` | 启动在后台 Hub 中运行的会话 |
| `-h, --help` | 显示命令帮助 |

## 命令

### `cline`（默认）

启动任务或进入交互模式。

```bash
cline
cline "your prompt here"
cline "Run tests and fix failures"
echo "prompt" | cline
```

### `auth [options] [provider]`

配置 AI 提供商的身份验证。

```bash
cline auth
```

### `config [options]`

显示当前配置。

```bash
cline config
```

### `connect [options] [adapter]`

连接到消息平台。请参阅[连接器](/cli/connectors)。

```bash
cline connect
cline connect [adapter]
```

### `mcp`

管理 MCP 服务器。请参阅 [MCP](/mcp/mcp-overview)。

```bash
cline mcp
```

### `dev`

开发者工具和实用程序。

```bash
cline dev
```

### `doctor`

诊断并修复配置问题。

```bash
cline doctor
```

### `history|h [options]`

列出会话历史或管理已保存的会话。

```bash
cline history
cline h
```

### `hook`

处理来自 stdin 的 Hook 载荷。

```bash
cat payload.json | cline hook
```

### `plugin`

管理 Cline 插件。从文件 URL、npm、git 仓库或本地路径安装插件。有关完整详情和插件清单格式，请参阅[插件](/customization/plugins)。

```bash
cline plugin install <source>  # Install a plugin
cline plugin i <source>        # Shorthand alias
```

| 选项 | 描述 |
|--------|-------------|
| `--npm` | 将源视为 npm 软件包 |
| `--git` | 将源视为 git 仓库 |
| `--force` | 替换同一源的现有安装 |
| `--json` | 以 JSON 输出结果 |
| `--cwd <path>` | 安装到 `<path>/.cline/plugins` 而不是全局目录 |

使用 [TypeScript Navigation Plugin](https://github.com/cline/typescript-lsp-plugin) 试试看：

```bash
cline plugin install https://github.com/cline/typescript-lsp-plugin.git
```

### `schedule`

管理定时智能体。请参阅[定时任务](/cli/scheduling)。

```bash
cline schedule
```

### `hub`

管理本地 Hub 守护进程。

```bash
cline hub
```

### `update [options]`

检查更新，并在有可用更新时进行安装。

```bash
cline update
```

### `version`

显示 Cline CLI 版本号。

```bash
cline version
cline -V
```

### `kanban`

启动 Kanban 应用并退出。

```bash
cline kanban
```

## 环境变量

| 变量 | 描述 |
|----------|-------------|
| `CLINE_DATA_DIR` | 自定义配置目录（替代 `~/.cline/data/`） |
| `CLINE_HUB_ADDRESS` | 覆盖 Hub 地址（默认值：`127.0.0.1:25463`） |
| `CLINE_SESSION_BACKEND_MODE` | 强制后端模式（`local`、`hub`、`remote`、`auto`） |
| `CLINE_SANDBOX_DATA_DIR` | 沙箱会话存储目录 |
| `CLINE_SANDBOX` | 启用沙箱模式 |
| `CLINE_HOOKS_DIR` | 额外的 Hook 目录 |
| `CLINE_BUILD_ENV` | 设置为 `development` 以启用调试功能 |
| `CLINE_DEBUG_PORT_BASE` | Node.js 检查器的基础端口 |
| `CLINE_COMMAND_PERMISSIONS` | 限制 Shell 命令的 JSON 策略（见下文） |

### CLINE_COMMAND_PERMISSIONS

限制智能体可以执行的 Shell 命令：

```bash
export CLINE_COMMAND_PERMISSIONS='{"allow": ["npm *", "git *"], "deny": ["rm -rf *", "sudo *"]}'
```

| 字段 | 类型 | 描述 |
|-------|------|-------------|
| `allow` | `string[]` | 允许命令的 Glob 模式。如果设置，则仅允许匹配的命令。 |
| `deny` | `string[]` | 拒绝命令的 Glob 模式。拒绝规则始终优先。 |
| `allowRedirects` | `boolean` | 是否允许 Shell 重定向（`>`、`>>`、`<`）。默认值：`false`。 |

## JSON 输出格式

使用 `--json` 时，每条消息都是独占一行的 JSON 对象：

```json
{"type": "say", "text": "I'll create the file now.", "ts": 1760501486669, "say": "text"}
```

| 字段 | 类型 | 描述 |
|-------|------|-------------|
| `type` | `"ask"` 或 `"say"` | 消息类别 |
| `text` | `string` | 消息内容 |
| `ts` | `number` | 以毫秒为单位的 Unix 时间戳 |
| `say` | `string` | 当 `type` 为 `"say"` 时的子类型 |
| `ask` | `string` | 当 `type` 为 `"ask"` 时的子类型 |
| `reasoning` | `string` | 模型推理（如果可用） |
| `partial` | `boolean` | 流式传输期间为 `true` |

## 配置文件

```
~/.cline/
  data/
    settings/
      providers.json             # API keys and provider config
      rules/                     # Global rules
      skills/                    # Global skills
    teams/                       # Team state
    sessions/                    # Session database (SQLite)
    logs/
      hub-daemon.log             # Hub logs
  plugins/                       # Global plugins
    _installed/                  # Managed by `cline plugin install`

.cline/                          # Project root
  rules/                         # Project rules
  skills/                        # Project skills
  hooks/                         # Lifecycle hooks
  plugins/                       # Project plugins
  mcp.json                       # MCP server config
  agents.yaml                    # Agent definitions
```
