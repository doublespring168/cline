---
title: "创建自定义工具"
sidebarTitle: "创建自定义工具"
description: "使用类型安全的 schema 和执行处理程序定义、注册并测试你自己的工具。"
---

自定义工具扩展了智能体可以执行的操作。工具是一个函数，包含名称、供 LLM 读取的描述、输入 schema，以及执行实际工作的 execute 函数。

## 基础工具

最简单的方法是使用带有 zod schema 的 `createTool`：

```typescript
import { createTool } from "@cline/sdk"
import { z } from "zod"

const getCurrentTime = createTool({
  name: "get_current_time",
  description: "Get the current date and time. Optionally specify a timezone.",
  inputSchema: z.object({
    timezone: z.string().optional().describe("IANA timezone (e.g., 'America/New_York'). Defaults to UTC."),
  }),
  async execute(input) {
    const tz = input.timezone ?? "UTC"
    const date = new Date()
    return {
      iso: date.toISOString(),
      timezone: tz,
      formatted: date.toLocaleString("en-US", { timeZone: tz }),
    }
  },
})
```

SDK 会自动将 zod schema 转换为 JSON Schema。`execute` 函数中的输入是完全类型化的。

有关真实智能体中工具的可运行示例，请参阅 [cli-agent](https://github.com/cline/cline/tree/main/apps/examples/cli-agent)（使用 zod 的 shell 工具）和 [code-review-bot](https://github.com/cline/cline/tree/main/apps/examples/code-review-bot)（多个具有完成生命周期的工具）。

## 工具的组成

每个工具都有四个部分：

| 字段 | 用途 |
|-------|---------|
| `name` | 唯一标识符（建议使用 snake_case） |
| `description` | LLM 读取此字段以决定何时使用工具 |
| `inputSchema` | 定义所接受参数的 Zod schema 或 JSON Schema |
| `execute` | 执行工作的函数 |

### 名称

使用 `snake_case`。名称应具描述性，但要简洁：

- `search_database`，而不是 `db` 或 `performDatabaseSearchOperation`
- `send_email`，而不是 `email` 或 `handleEmailSending`

### 描述

这是影响工具调用准确性的最重要字段。LLM 使用它来决定何时以及如何使用该工具。

```typescript
// Weak: model won't know when to use this
description: "Handles data."

// Strong: model knows exactly what this does and when to use it
description: "Search the PostgreSQL database by executing a read-only SQL query. Returns matching rows as JSON. Use this when you need to look up user records, order history, or product data. Maximum 100 rows per query."
```

包括：
- 工具的作用
- 它返回什么
- 何时使用（以及何时不使用）
- 约束（速率限制、只读、最大结果数等）

### 输入 Schema

使用 zod 时，请对每个字段使用 `.describe()`：

```typescript
inputSchema: z.object({
  query: z.string().describe("Search query. Supports wildcards (*) and exact phrases."),
  limit: z.number().min(1).max(100).optional().describe("Maximum results. Default: 10."),
  status: z.enum(["active", "archived", "deleted"]).optional().describe("Filter by record status."),
})
```

对于具有固定值集合的字段，请使用 `z.enum`。这会显著提高准确性。

## 使用 AgentToolContext

`execute` 函数接收一个包含执行元数据的上下文对象：

```typescript
const longProcess = createTool({
  name: "long_process",
  description: "Process data in batches.",
  inputSchema: z.object({}),
  async execute(_input, context) {
    console.log(`Agent: ${context.agentId}, Iteration: ${context.iteration}`)

    for (const batch of batches) {
      if (context.signal?.aborted) {
        return { status: "cancelled", processed: count }
      }
      await processBatch(batch)
    }

    return { status: "complete" }
  },
})
```

## 错误处理

将错误作为结构化数据返回，而不是抛出错误：

```typescript
const apiTool = createTool({
  name: "call_api",
  description: "Make an authenticated API call.",
  inputSchema: z.object({
    endpoint: z.string().describe("API endpoint path"),
  }),
  async execute(input) {
    try {
      const response = await fetch(`https://api.example.com${input.endpoint}`, {
        headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
      })

      if (!response.ok) {
        return {
          output: { error: `API returned ${response.status}` },
          isError: true,
        }
      }

      return await response.json()
    } catch (err) {
      return {
        output: { error: `Network error: ${(err as Error).message}` },
        isError: true,
      }
    }
  },
})
```

当工具返回错误时，智能体会看到错误并可以调整其方法。当工具抛出错误时，它会被计为一次“错误操作”，并增加连续错误操作计数器。

## 完成工具

使用 `lifecycle: { completesRun: true }` 标记工具，可以使该工具在成功调用时结束智能体循环：

```typescript
const submitResult = createTool({
  name: "submit_result",
  description: "Submit the final result and end the run.",
  inputSchema: z.object({
    summary: z.string(),
    approve: z.boolean(),
  }),
  lifecycle: { completesRun: true },
  async execute(input) {
    return JSON.stringify(input)
  },
})
```

有关完整应用中的这种模式，请参阅 [code-review-bot 示例](https://github.com/cline/cline/tree/main/apps/examples/code-review-bot)。

## 测试工具

在将工具交给智能体之前，先对其进行隔离测试：

```typescript
import { describe, it, expect } from "vitest"

describe("get_current_time", () => {
  it("returns ISO timestamp", async () => {
    const result = await getCurrentTime.execute(
      { timezone: "UTC" },
      {
        agentId: "test",
        runId: "run_test",
        iteration: 1,
        toolCallId: "tool_test",
        snapshot: {} as never,
        emitUpdate: () => {},
      }
    )

    expect(result.iso).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})
```

## 注册工具

<Tabs>
  <Tab title="Cline Core">
    ```typescript
    await cline.start({
      prompt: "Get the current time",
      config: {
        // ...
        extraTools: [getCurrentTime],
      },
    })
    ```
  </Tab>
  <Tab title="Agent">
    ```typescript
    const agent = new Agent({
      tools: [searchDatabase, getCurrentTime],
      // ...
    })
    ```
  </Tab>
  <Tab title="通过插件">
    ```typescript
    const myPlugin: AgentPlugin = {
      name: "my-tools",
      manifest: { capabilities: ["tools"] },
      setup(api) {
        api.registerTool(searchDatabase)
        api.registerTool(getCurrentTime)
      },
    }
    ```
  </Tab>
</Tabs>

## 工具设计规则

优秀的工具应当具体且可预测。

- 使用面向动作的名称：`get_pull_request`、`search_database`、`deploy_service`。
- 描述工具的作用、何时使用以及返回什么。
- 在描述中说明约束：速率限制、只读行为、所需权限。
- 为每个输入属性添加描述。
- 尽可能返回结构化 JSON，而不是散文。
- 在长时间运行的工具中遵循 `context.abortSignal`。
