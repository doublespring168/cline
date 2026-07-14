---
title: "事件"
sidebarTitle: "事件"
description: "订阅运行时和会话事件，用于 UI、日志、监控和取消操作。"
---

SDK 提供两个相关的事件接口：

- 来自 `@cline/agents` 的 `AgentRuntimeEvent`，通过 `agent.subscribe(listener)` 传递。
- 来自 `@cline/core` 的 `AgentEvent` / `CoreSessionEvent`，通过核心会话适配器和 `cline.subscribe(listener)` 传递。

有关事件处理模式，请参阅本页面。有关事件结构，请参阅[事件参考](/sdk/reference/events)。

## AgentRuntime 事件

```typescript
const unsubscribe = agent.subscribe((event) => {
  if (event.type === "assistant-text-delta") {
    process.stdout.write(event.text ?? "")
  }
})

await agent.run("Explain this codebase")
unsubscribe()
```

`AgentRuntimeEvent` 是来自兼容浏览器的运行时的底层事件流。

## 核心 / 面向宿主的智能体事件

`AgentEvent` 是 `@cline/core` 会话编排所使用的面向宿主的事件结构。直接使用 `Agent` 时，建议使用 `agent.subscribe(...)` 和 `AgentRuntimeEvent`。

常见的面向宿主的事件类别：

| 类别 | 事件 | 用途 |
|----------|--------|---------|
| 内容 | `content_start`, `content_update`, `content_end` | 文本/推理/工具 UI |
| 迭代 | `iteration_start`, `iteration_end` | 进度跟踪 |
| 用量 | `usage` | Token/成本跟踪 |
| 通知 | `notice` | 恢复和状态更新 |
| 完成 | `done`, `error` | 最终状态和失败处理 |

## ClineCore 会话事件

使用 `cline.subscribe()` 处理会话级事件：

```typescript
const unsubscribe = cline.subscribe((event) => {
  console.log(event.type, event.sessionId)
})

await cline.start({ /* ... */ })
unsubscribe()
```

当只需要一个会话的事件时，请传入 `sessionId` 过滤器：

```typescript
const unsubscribe = cline.subscribe(listener, { sessionId })
```

## 流式 UI 模式

订阅事件以构建实时 UI：

```typescript
agent.subscribe((event) => {
  switch (event.type) {
    case "assistant-text-delta":
      onUpdate({ type: "text", content: event.text ?? "" })
      break
    case "tool-started":
      onUpdate({ type: "tool_start", content: event.toolCall.toolName })
      break
    case "tool-finished":
      onUpdate({ type: "tool_end", content: event.toolCall.toolName })
      break
    case "run-finished":
      onUpdate({ type: "done", content: event.result.status })
      break
  }
})
```

有关通过 SSE 将智能体事件流式传输到浏览器的完整可运行示例，请参阅[多智能体示例](https://github.com/cline/cline/tree/main/apps/examples/multi-agent)。该示例会并行生成多个智能体，并将各智能体的事件流式传输到不同的 UI 卡片。

## 用量跟踪模式

```typescript
let totalTokens = 0

agent.subscribe((event) => {
  if (event.type === "usage-updated") {
    totalTokens = event.usage.inputTokens + event.usage.outputTokens
  }
})
```

## 运行时状态快照

需要当前状态时调用 `snapshot()`：

```typescript
const snapshot = agent.snapshot()
console.log(snapshot.status, snapshot.iteration, snapshot.usage)
```
