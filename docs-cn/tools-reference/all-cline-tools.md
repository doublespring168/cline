---
title: "工具"
sidebarTitle: "工具"
description: "Cline 内置工具系统的参考文档，与 SDK 工具架构保持一致。"
---

Cline 工具是模型在工作时可以调用的可执行函数。模型决定调用哪个工具，Cline 运行该工具，然后将结果返回给模型。

## 内置工具 (ClineCore)

通过 `ClineCore` 运行时，可以使用以下内置工具：

| 工具 | 描述 |
|------|-------------|
| `bash` | 执行 shell 命令 |
| `editor` | 查看和编辑文件 |
| `read_files` | 批量读取多个文件 |
| `apply_patch` | 将统一 diff 应用到文件 |
| `search` | 由 Ripgrep 提供支持的代码库搜索 |
| `fetch_web` | 进行 HTTP 请求并将 HTML 转换为 Markdown |
| `ask_question` | 向用户询问输入 |

<Note>
`Agent`（来自 `@cline/agents`）默认不包含内置工具。你需要显式提供工具。
</Note>

## 工具类别

- **代码库操作**：`editor`、`read_files`、`apply_patch`、`search`
- **执行**：`bash`
- **外部检索**：`fetch_web`
- **人工参与控制**：`ask_question`

## 批准与策略控制

根据设置/策略，Cline 可以在获得批准或自动批准的情况下运行工具。典型模式包括：

- 要求高风险工具获得批准（例如 `bash`、写入/编辑操作）
- 自动批准低风险工具（例如读取/搜索操作）
- 在需要时完全禁用特定工具

有关策略示例，请参阅 [SDK 工具](/sdk/tools) 和 [权限处理](/sdk/guides/permission-handling)。

## MCP 工具

Cline 还可以调用从 `.cline/mcp.json` 中配置的 MCP 服务器发现的工具。

MCP 工具会与内置工具一起加载，因此 Cline 可以在一个任务中同时使用本地工具和外部集成。

请参阅 [MCP 概览](/mcp/mcp-overview) 和 [SDK 工具 → MCP 工具](/sdk/tools#mcp-%E5%B7%A5%E5%85%B7)。

## 自定义工具

<Warning>
  此功能目前仅适用于 Cline SDK、CLI 和 Kanban，暂不适用于 VS Code 和 JetBrains 扩展。
</Warning>

除了内置工具和 MCP 之外，你还可以创建自定义工具，并通过插件添加它们。

- 在插件代码中定义工具行为和输入 schema
- 在插件设置期间注册工具
- 将这些工具与内置工具一起提供给智能体

请参阅：
- [SDK 插件](/sdk/plugins)
- [编写插件（示例）](/sdk/guides/writing-plugins)
- [SDK 工具：创建自定义工具](/sdk/tools#%E4%BD%BF%E7%94%A8-createtool-%E5%88%9B%E5%BB%BA%E8%87%AA%E5%AE%9A%E4%B9%89%E5%B7%A5%E5%85%B7)

## 旧工具名称与当前运行时工具

一些较旧的文档/示例引用了 XML 风格的名称，例如 `read_file`、`replace_in_file` 或 `execute_command`。当前 SDK/ClineCore 运行时使用上面列出的内置工具名称（`read_files`、`apply_patch`、`bash` 等）。

## 相关内容

- [SDK 工具](/sdk/tools)
- [工具 API 参考](/sdk/reference/tools-api)
- [MCP 概览](/mcp/mcp-overview)
