---
title: "类型"
sidebarTitle: "类型"
description: "常用 SDK 类型接口。"
---

大多数常用类型从 `@cline/shared` 导出；运行时入口软件包会重新导出其中选定的辅助类型。

## AgentRuntime 类型

```typescript
import type {
  AgentMessage,
  AgentMessagePart,
  AgentRunResult,
  AgentRuntimeEvent,
  AgentRuntimeStateSnapshot,
  AgentUsage,
} from "@cline/sdk"
```

直接运行 `AgentRuntime` / `Agent` 时会返回 `AgentRunResult`：

```typescript
interface AgentRunResult {
  agentId: string
  agentRole?: string
  runId: string
  status: "completed" | "aborted" | "failed"
  iterations: number
  outputText: string
  messages: readonly AgentMessage[]
  usage: AgentUsage
  error?: Error
}
```

## 面向宿主的智能体类型

```typescript
import type {
  AgentConfig,
  AgentEvent,
  AgentResult,
  AgentPlugin,
  AgentTool,
  AgentToolContext,
  ToolPolicy,
} from "@cline/sdk"
```

`AgentResult` 是面向宿主/核心的结果结构：

```typescript
interface AgentResult {
  text: string
  usage: LegacyAgentUsage
  messages: MessageWithMetadata[]
  toolCalls: ToolCallRecord[]
  iterations: number
  finishReason: "completed" | "max_iterations" | "aborted" | "mistake_limit" | "error"
  model: { id: string; provider: string; info?: ModelInfo }
  startedAt: Date
  endedAt: Date
  durationMs: number
}
```

## ClineCore 类型

```typescript
import type {
  ClineCoreOptions,
  ClineCoreStartInput,
  CoreSessionConfig,
  SessionRecord,
} from "@cline/sdk"
```

## 工具类型

```typescript
interface ToolPolicy {
  enabled?: boolean
  autoApprove?: boolean
}
```

有关完整工具接口，请参阅[工具 API](/sdk/reference/tools-api)。
