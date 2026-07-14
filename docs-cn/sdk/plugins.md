---
title: "插件概述"
sidebarTitle: "插件"
description: "了解插件是什么、插件的优势，以及插件如何扩展智能体行为。"
---

插件是可复用智能体能力的集合包。你可以借助插件将工具、生命周期钩子、命令和配置打包到单个模块中，以便跨项目共享或发布供他人使用。

## 插件的优势

| 优势 | 描述 |
|---------|-------------|
| **模块化** | 将相关工具和钩子封装在单个单元中。不再有散落各处的逻辑。 |
| **可复用性** | 跨智能体、项目或团队共享插件。发布到 npm 或通过 git 分发。 |
| **打包** | 将工具、钩子、命令、消息构建器和提供商打包在一起。 |
| **可观测性** | 接入智能体生命周期的每个阶段——运行开始/结束、模型调用、工具调用、错误。 |
| **可组合性** | 在单个智能体中组合多个插件。每个插件处理自己的领域。 |

## 扩展术语表

| 扩展点 | 作用 |
|-----------------|--------------|
| **工具** | 让模型调用某个操作（查询数据库、调用 API 等） |
| **命令** | 注册斜杠命令，以允许手动触发操作 |
| **钩子** | 在特定阶段运行生命周期逻辑或策略检查 |
| **规则** | 引导智能体的提示词，将包含在每个会话中 |
| **事件** | 注册将触发智能体操作的外部事件 |
| **插件** | 将工具、钩子、命令、规则和自动化事件打包在一起 |

| 如果你需要…… | 使用…… |
|-------------------|----------|
| 允许模型查询数据库、调用 API、运行领域操作 | **工具** |
| 注册用户触发的操作（斜杠命令） | **命令** |
| 记录运行、收集指标、实施策略 | **钩子处理程序** |
| 阻止危险的工具调用 | **钩子**或批准策略 |
| 通过提示词为模型提供一致的指导 | **规则** |
| 在外部事件（新 PR、Slack 消息等）发生时触发智能体操作 | **事件** |
| 将多个工具打包为可复用模块 | **插件** |

## 什么是插件？

插件是一个 `AgentPlugin`——即实现 SDK 扩展接口的对象。它可以注册工具、接入智能体生命周期事件，并提供默认配置。

```typescript
import { type AgentPlugin } from "@cline/sdk"

const myPlugin: AgentPlugin = {
  name: "my-plugin",
  manifest: {
    capabilities: ["tools", "hooks"],
  },
  setup(api, ctx) {
    // Register tools, commands, providers via api.registerTool(), etc.
  },
  hooks: {
    beforeTool(context) {
      // Observe or audit tool calls before they execute
    },
    afterRun(context) {
      // Log metrics, cleanup, notify after a run completes
    },
  },
}
```

钩子定义在 `hooks` 对象内部，而不是直接定义在扩展上。可用的生命周期钩子包括 `beforeRun`、`afterRun`、`beforeModel`、`afterModel`、`beforeTool`、`afterTool` 和 `onEvent`。


## 后续步骤

注册到 `ClineCore`：

```typescript
await cline.start({
  prompt: "Analyze customer records",
  config: {
    // ...model/runtime config
    extensions: [databasePlugin],
  },
})
```

## 基于文件的插件

`ClineCore` 支持通过会话配置中的 `pluginPaths` 指定插件模块路径：

```typescript
await cline.start({
  prompt: "Analyze this project",
  config: {
    // ...model/runtime config
    pluginPaths: ["/absolute/path/to/plugin.ts"],
  },
})
```

插件文件导出一个 `AgentPlugin`。

## 通过 CLI 安装插件

也可以使用 `cline plugin install` 从文件 URL、npm、git 或本地路径安装插件。有关安装命令、清单格式和目录布局，请参阅[插件](/customization/plugins)。

## 钩子阶段

钩子阶段包括：

```txt
input
runtime_event
session_start
run_start
iteration_start
turn_start
before_agent_start
tool_call_before
tool_call_after
turn_end
stop_error
iteration_end
run_end
session_shutdown
error
```

常见阶段：

| 阶段 | 用途 |
|-------|---------|
| `before_agent_start` | 注入上下文或修改提示词/消息 |
| `run_start` | 日志记录、计时器、速率限制 |
| `tool_call_before` | 审计或阻止工具调用 |
| `tool_call_after` | 记录结果、触发副作用 |
| `run_end` | 指标、通知、清理 |
| `error` | 错误报告 |

## 钩子策略

钩子策略控制执行行为：

| 字段 | 含义 |
|-------|---------|
| `mode` | `"blocking"` 或 `"async"` |
| `timeoutMs` | 钩子超时时间 |
| `retries` | 重试次数 |
| `retryDelayMs` | 两次重试之间的延迟 |
| `failureMode` | `"fail_open"` 或 `"fail_closed"` |
| `maxConcurrency` | 并发钩子执行数 |
| `queueLimit` | 开始丢弃任务前的队列大小 |

对于绕过钩子会带来安全风险的策略实施钩子，请使用 `fail_closed`。

## 构建插件

有关分步插件教程，请参阅[编写插件](/sdk/guides/writing-plugins)。

## SDK 示例

[SDK 仓库](https://github.com/cline/cline/tree/main/sdk)的 [`examples/plugins/`](https://github.com/cline/cline/tree/main/sdk/examples/plugins) 中包含可直接运行的插件示例，涵盖工具注册、生命周期指标、通知、自定义压缩、策略防护、Web 搜索、后台任务、TypeScript LSP 工具和多智能体团队。

有关完整列表和使用命令，请参阅[插件示例](/sdk/plugin-examples)。
