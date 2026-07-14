---
title: "配置"
sidebarTitle: "配置"
description: "了解 Cline 存储配置的位置，以及全局配置和项目配置如何协同工作。"
---

Cline 配置分为两个作用域：

- `~/.cline/` 中的**全局配置**（全局应用于所有 Cline 应用程序，包括 IDE、CLI 和 SDK）
- `.cline/` 中的**项目配置**（仅应用于当前工作区）

## 配置目录布局

Cline 在几个约定俗成的位置存储共享配置。主要根目录是 `~/.cline/`，结构化应用状态位于 `~/.cline/data/` 下：

```text
~/.cline/
  data/
    settings/
      providers.json           # API keys and provider configuration
      global-settings.json     # Global settings
      cline_mcp_settings.json  # MCP settings
    teams/                     # Team state
    sessions/                  # Session data
    db/                        # SQLite databases (for example cron.db)
    workflows/                 # Global workflows
  rules/                       # Global rules
  hooks/                       # Global hooks
  skills/                      # Global skills
  agents/                      # Global agent definitions
  plugins/                     # Global plugins (.js, .ts)
  cron/                        # Global cron specs
```

代码支持的其他全局搜索路径：

```text
~/Documents/Cline/
  Rules/                       # Additional global rules
  Hooks/                       # Additional global hooks
  Plugins/                     # Additional global plugins
  Workflows/                   # Additional global workflows
```

项目级配置位于仓库根目录的 `.cline/` 中：

```text
.cline/
  rules/                       # Project rules
  skills/                      # Project skills
  hooks/                       # Lifecycle hooks
  agents/                      # Project agent definitions
  plugins/                     # Project plugins
  cron/                        # Workspace cron specs
```

注意：

- 全局提供商设置、全局设置和 MCP 设置存储在 `~/.cline/data/settings/` 下。
- 全局工作流从 `~/.cline/data/workflows/` 解析。
- 全局规则、钩子、技能、智能体、插件和 cron 规范直接从 `~/.cline/` 下解析。
- 为保持兼容性，也可以从 `~/Documents/Cline/` 中发现规则、钩子、插件和工作流。

## 哪些配置放在哪里？

- 对于你计算机上所有 Cline 应用程序（IDE、CLI、SDK）共享的默认设置，请使用**全局配置 (`~/.cline/`)**。
- 对于应随仓库一起传递、供团队共享的行为，请使用**项目配置 (`.cline/`)**。

请提交你希望与团队共享的 `.cline/` 文件。不要将密钥放入仓库。

## 通过 CLI 配置

使用交互式配置 UI：

```bash
cline config
```

你可以在其中查看/编辑：

- 设置（全局 + 工作区）
- 规则
- 技能
- 钩子

## 实用配置命令

使用自定义配置目录：

```bash
cline --config /path/to/custom/config "your task"
```

或通过环境变量：

```bash
export CLINE_DATA_DIR=/custom/path/to/cline
cline "your task"
```

故障排除时查看 CLI 日志：

```bash
cline dev log
```

## 环境变量

| 变量 | 描述 |
|----------|-------------|
| `CLINE_DATA_DIR` | 自定义数据目录（替代 `~/.cline/data/`） |
| `CLINE_HUB_ADDRESS` | 覆盖 hub 地址（默认：`127.0.0.1:25463`） |
| `CLINE_SESSION_BACKEND_MODE` | 强制指定后端模式（`local`、`hub`、`remote`、`auto`） |
| `CLINE_SANDBOX` | 启用沙箱模式 |
| `CLINE_SANDBOX_DATA_DIR` | 沙箱会话存储目录 |
| `CLINE_HOOKS_DIR` | 额外的钩子目录 |
| `CLINE_COMMAND_PERMISSIONS` | 限制 shell 命令的 JSON 策略 |

### CLINE_DATA_DIR

```bash
export CLINE_DATA_DIR=/custom/path/to/cline
cline "your task"
```

### CLINE_COMMAND_PERMISSIONS

限制 Cline 可以执行哪些 shell 命令：

```bash
export CLINE_COMMAND_PERMISSIONS='{"allow": ["npm *", "git *"], "deny": ["rm -rf *"]}'
```

格式：

```json
{
  "allow": ["pattern1", "pattern2"],
  "deny": ["pattern3"],
  "allowRedirects": true
}
```

规则：

- `deny` 覆盖 `allow`
- 如果设置了 `allow`，则不匹配 `allow` 的命令将被拒绝
- `allowRedirects` 控制 shell 重定向（`>`、`>>`、`<`），默认为 `false`

## 相关文档

- [CLI 配置](/cli/configuration)
- [规则](/customization/cline-rules)
- [技能](/customization/skills)
- [钩子](/customization/hooks)
- [插件](/customization/plugins)
- [.clineignore](/customization/clineignore)

## 安全说明

<Warning>
仅使用来自你信任来源的规则、钩子、技能和插件。
</Warning>

钩子和插件可以执行代码。在将它们添加到全局或项目中之前，请像审查任何其他可执行制品一样进行审查。
