---
title: "工具"
sidebarTitle: "工具"
description: "工具让智能体能够读取、写入、搜索、调用 API，以及运行特定领域的操作。"
---

工具是模型在执行期间可以调用的函数。工具由名称、描述和 Schema 组成，SDK 会将这些内容发送给模型。然后，模型可以指示 SDK 执行工具函数，并将结果发回对话。

## 内置工具

`ClineCore` 可以启用内置工具套件：

| 工具 | 描述 |
|------|-------------|
| `read_files` | 读取一个或多个文件 |
| `search_codebase` | 搜索工作区 |
| `run_commands` | 执行 shell 命令 |
| `fetch_web_content` | 获取 Web 内容 |
| `apply_patch` | 应用补丁/diff 编辑 |
| `editor` | 编辑文件 |
| `skills` | 调用已配置的技能 |
| `ask_question` | 向用户询问输入 |
| `submit_and_exit` | 提交最终答案并停止 |

<Note>
  如果你需要更多控制，可以直接使用 `Agents` 包。它不包含内置工具。构造智能体时，你只需传入所需的工具。
</Note>

## 使用 createTool 创建自定义工具

SDK 最强大的功能之一是能够创建并注册自定义工具。这样，你可以添加和共享上下文高效、行为确定的能力，因为它们由代码而不是提示词实现。

### 快速示例

使用带有 zod 模式的 `createTool` 创建类型安全的工具：

```typescript
import { createTool } from "@cline/sdk"
import { z } from "zod"

const searchDatabase = createTool({
  name: "search_database",
  description: "Search the application database. Returns matching records as JSON.",
  inputSchema: z.object({
    query: z.string().describe("Search query"),
    limit: z.number().optional().describe("Maximum results to return"),
  }),
  async execute(input) {
    const results = await db.search(input.query, input.limit ?? 10)
    return { results, count: results.length }
  },
})
```

如果愿意，`createTool` 也接受原始 JSON Schema：

```typescript
const searchDatabase = createTool({
  name: "search_database",
  description: "Search the application database.",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search query" },
      limit: { type: "number", description: "Maximum results to return" },
    },
    required: ["query"],
  },
  async execute(input) {
    return await db.search(input.query, input.limit ?? 10)
  },
})
```

有关实际使用工具的完整示例，请参阅 [cli-agent](https://github.com/cline/cline/tree/main/apps/examples/cli-agent)（shell 工具）和 [code-review-bot](https://github.com/cline/cline/tree/main/apps/examples/code-review-bot)（多个带完成生命周期的工具）。

有关完整教程，请参阅[创建自定义工具](/sdk/guides/creating-custom-tools)。有关确切类型，请参阅[工具 API](/sdk/reference/tools-api)。

## 注册工具

使用 `ClineCore` 时，自定义工具通过会话配置中的 `extraTools` 传入：

```typescript
await cline.start({
  prompt: "Analyze customer records",
  config: {
    // ...
    extraTools: [searchDatabase],
  },
})
```

使用 `Agent` 时，将所有工具传入构造函数：

```typescript
const agent = new Agent({
  tools: [searchDatabase, myOtherTool],
  // ...
})
```

通过插件/扩展可以更方便地共享工具：

```typescript
const plugin: AgentPlugin = {
  name: "database-tools",
  manifest: { capabilities: ["tools"] },
  setup(api) {
    api.registerTool(searchDatabase)
  },
}
```
有关更多信息，请参阅[插件](/sdk/plugins)。

## 工具策略

你可以通过工具策略控制工具的使用方式。这些策略控制工具是否可见以及是否需要批准。

```typescript
const agent = new Agent({
  tools: [readTool, writeTool, deleteTool],
  toolPolicies: {
    read_data: { autoApprove: true },
    write_data: { autoApprove: false },
    delete_data: { enabled: false },
  },
  // ...
})
```

| 策略 | 效果 |
|--------|--------|
| `{ autoApprove: true }` | 无需询问即可运行 |
| `{ autoApprove: false }` | 运行前询问 |
| `{ enabled: false }` | 隐藏/禁用工具 |

未列入 `toolPolicies` 的工具名称默认处于启用和自动批准状态。

## MCP 工具

工具可与 MCP 配合使用。`ClineCore` 可以通过其运行时/配置扩展路径加载 MCP 设置。为会话启用 MCP 支持后，MCP 工具会与内置工具和自定义工具一同注册。
