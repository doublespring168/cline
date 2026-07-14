---
title: "事件"
sidebarTitle: "事件"
description: "SDK 事件接口参考。"
---

SDK 提供多个事件接口。

## AgentRuntimeEvent

直接使用 `AgentRuntime` 会通过 `agent.subscribe(listener)` 发出底层运行时事件。

```typescript
const unsubscribe = agent.subscribe((event) => {
  console.log(event.type)
})
```

常见的运行时事件包括模型事件、工具执行事件、运行生命周期事件和失败事件。运行时结果使用 `AgentRunResult.status`，而不是 `finishReason`。

## AgentEvent

面向核心/宿主的智能体事件通过 `AgentConfig.onEvent` 和核心适配器发出。

| 事件 | 描述 |
|-------|-------------|
| `content_start` | 文本/推理/工具内容开始 |
| `content_update` | 工具进度更新 |
| `content_end` | 文本/推理/工具内容完成 |
| `iteration_start` | 循环迭代开始 |
| `iteration_end` | 循环迭代完成 |
| `usage` | Token/成本用量更新 |
| `notice` | 运行时状态/恢复通知 |
| `done` | 智能体已完成/中止/失败 |
| `error` | 发生错误 |

## `done` 事件

```typescript
interface AgentDoneEvent {
  type: "done"
  reason: "completed" | "max_iterations" | "aborted" | "mistake_limit" | "error"
  text: string
  iterations: number
  usage?: LegacyAgentUsage
}
```

## `usage` 事件

```typescript
interface AgentUsageEvent {
  type: "usage"
  inputTokens: number
  outputTokens: number
  cacheReadTokens?: number
  cacheWriteTokens?: number
  cost?: number
  totalInputTokens: number
  totalOutputTokens: number
  totalCacheReadTokens?: number
  totalCacheWriteTokens?: number
  totalCost?: number
}
```

## CoreSessionEvent

`ClineCore.subscribe(listener, options?)` 会发出来自运行时宿主的会话级事件。

```typescript
const unsubscribe = cline.subscribe((event) => {
  console.log(event.type, event.sessionId)
}, { sessionId })
```
