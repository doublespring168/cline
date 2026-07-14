---
title: "插件示例"
sidebarTitle: "插件示例"
description: "探索 Cline SDK 仓库中可安装的插件示例。"
---

[SDK 仓库](https://github.com/cline/cline/tree/main/sdk)在 [`examples/plugins/`](https://github.com/cline/cline/tree/main/sdk/examples/plugins) 下包含可安装的插件示例。可将它们用作工具、生命周期钩子、消息重写、策略实施、后台任务和多智能体工作流的起点。

## 示例

| 示例 | 展示内容 |
|---------|---------------|
| [`weather-metrics.ts`](https://github.com/cline/cline/blob/main/sdk/examples/plugins/weather-metrics.ts) | 工具注册及生命周期指标钩子。最佳起点。 |
| [`mac-notify.ts`](https://github.com/cline/cline/blob/main/sdk/examples/plugins/mac-notify.ts) | 通过 `afterRun` 钩子发送 macOS 通知中心提醒。 |
| [`custom-compaction.ts`](https://github.com/cline/cline/blob/main/sdk/examples/plugins/custom-compaction.ts) | 使用 `registerMessageBuilder` 压缩提供商消息。 |
| [`background-terminal.ts`](https://github.com/cline/cline/blob/main/sdk/examples/plugins/background-terminal.ts) | 具有持久化日志和可选会话引导的分离式 shell 任务。 |
| [`automation-events.ts`](https://github.com/cline/cline/blob/main/sdk/examples/plugins/automation-events.ts) | 插件发出的自动化事件。 |
| [`gitignore-read-files-guard.ts`](https://github.com/cline/cline/blob/main/sdk/examples/plugins/gitignore-read-files-guard.ts) | 运行时钩子策略，用于阻止访问工作区 `.gitignore` 边界之外的文件。 |
| [`web-search.ts`](https://github.com/cline/cline/blob/main/sdk/examples/plugins/web-search.ts) | 由 Exa API 密钥支持的 `web_search` 工具。 |
| [`typescript-lsp/`](https://github.com/cline/cline/tree/main/sdk/examples/plugins/typescript-lsp) | 由 TypeScript Language Service 驱动的 `goto_definition` 工具。 |
| [`agents-squad/`](https://github.com/cline/cline/tree/main/sdk/examples/plugins/agents-squad) | 多智能体团队，其中的子智能体拥有各自的模型和个性。 |

## 使用 CLI 试用文件插件

CLI 会自动从工作区中的 `.cline/plugins`、`~/.cline/plugins` 和系统插件文件夹中发现插件。

```sh
cline plugin install https://github.com/cline/cline/blob/main/sdk/examples/plugins/weather-metrics.ts --cwd .
cline -i "What's the weather like in Tokyo and Paris?"
```

将 `weather-metrics.ts` 替换为任何其他单文件插件示例。

## 阻止访问被忽略的文件

使用 `gitignore-read-files-guard.ts` 阻止工具读取或编辑被工作区 `.gitignore` 文件忽略的文件：

```sh
cline plugin install https://github.com/cline/cline/blob/main/sdk/examples/plugins/gitignore-read-files-guard.ts --cwd .
cline -i "Read the ignored .env file"
```

该防护插件使用 `beforeTool` 运行时钩子。当 `read_files`、`editor` 或 `apply_patch` 调用的目标是工作区中被忽略的文件时，该钩子会返回 `{ skip: true }`，因此工具会记录策略错误且不会访问该文件。

## 安装目录插件

对于位于自有目录且带有自身 `package.json` 的插件，请使用 `cline plugin install`：

```sh
cline plugin install ./examples/plugins/agents-squad
```

有关更多安装选项，请参阅[安装插件](/sdk/plugin-install)。

## 添加 Web 搜索

`web-search.ts` 插件注册了一个由 Exa 支持的 `web_search` 工具。使用 `web_search` 查找相关 URL；当智能体需要查看特定页面时，再使用 `fetch_web_content`。

```sh
cline plugin install https://github.com/cline/cline/blob/main/sdk/examples/plugins/web-search.ts --cwd .

export EXA_API_KEY=...
export OPENROUTER_API_KEY=...

cline auth --provider openrouter --apikey "$OPENROUTER_API_KEY" --modelid anthropic/claude-sonnet-4.6
cline -P openrouter -m anthropic/claude-sonnet-4.6 "Search the web for recent Bun release notes, then fetch the most relevant page"
```

`EXA_API_KEY` 用于向搜索后端进行身份验证。CLI 仍需要常规模型提供商密钥或已保存的提供商身份验证信息来执行推理。

## 自定义消息压缩

当插件需要在模型调用前重写将发送给提供商的消息列表时，请使用 `registerMessageBuilder`。

| 示例 | 扩展点 | 最适合的场景 |
|---------|-----------------|----------|
| [`custom-compaction.ts`](https://github.com/cline/cline/blob/main/sdk/examples/plugins/custom-compaction.ts) | `api.registerMessageBuilder()` | 由插件负责、可复用的压缩策略。 |
| [`custom-compaction-hook.example.ts`](https://github.com/cline/cline/blob/main/sdk/examples/hooks/custom-compaction-hook.example.ts) | `hooks.beforeModel` | 需要运行时钩子上下文或直接修改请求的运行时钩子逻辑。 |

常规压缩场景首选消息构建器版本。它在内置安全构建器之前的核心消息管线中运行；多个构建器按照注册顺序运行；最后一轮处理会执行符合提供商安全要求的截断。

## 后台终端插件

`background-terminal.ts` 为长时间运行的 shell 任务注册了三个工具：

| 工具 | 用途 |
|------|---------|
| `start_background_command` | 启动分离式 shell 命令，立即返回任务 ID，并在 Cline 的数据目录下捕获 stdout/stderr。 |
| `get_background_command` | 读取任务状态以及最近的 stdout/stderr 尾部内容。 |
| `delete_background_command` | 删除已保存的任务元数据，并可选择删除捕获的日志。 |

当 `notifyParent` 为 true 时，插件会在命令退出后发出一条 `steer_message`，将完成摘要推送回活动会话，使智能体无需阻塞原始工具调用即可响应长时间运行的命令。
