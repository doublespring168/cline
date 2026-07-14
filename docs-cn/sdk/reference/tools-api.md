---
title: "工具 API"
sidebarTitle: "工具 API"
description: "创建和配置工具的 API 参考。"
---

## `createTool(config)`

```typescript
import { createTool } from "@cline/sdk"
```

创建类型化工具。它也从 `@cline/agents` 和 `@cline/core` 重新导出。

```typescript
const tool = createTool({
  name: "get_current_time",
  description: "Return the current time as ISO string.",
  inputSchema: { type: "object", properties: {} },
  execute: async (_input, context) => {
    return { now: new Date().toISOString() }
  },
})
```

`inputSchema` 可以是 JSON Schema 或 Zod Schema。

## AgentTool

```typescript
interface AgentTool<TInput = unknown, TOutput = unknown> {
  name: string
  description: string
  inputSchema: Record<string, unknown>
  execute: (input: TInput, context: AgentToolContext, onChange?: (update: unknown) => void) => Promise<TOutput>
  timeoutMs?: number
  retryable?: boolean
  maxRetries?: number
}
```

`createTool` 的默认值：

| 字段 | 默认值 |
|-------|---------|
| `timeoutMs` | `30000` |
| `retryable` | `true` |
| `maxRetries` | `3` |

## AgentToolContext

```typescript
interface AgentToolContext {
  agentId: string
  conversationId: string
  iteration: number
  abortSignal?: AbortSignal
  metadata?: Record<string, unknown>
}
```

## ToolPolicy

```typescript
interface ToolPolicy {
  enabled?: boolean
  autoApprove?: boolean
}
```

未列入策略映射的工具名称默认处于启用和自动批准状态。

## ToolCallRecord

```typescript
interface ToolCallRecord {
  id: string
  name: string
  input: unknown
  output: unknown
  error?: string
  durationMs: number
  startedAt: Date
  endedAt: Date
}
```
