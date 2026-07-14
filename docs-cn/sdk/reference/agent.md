---
title: "Agent"
sidebarTitle: "Agent"
description: "@cline/agents 中 Agent / AgentRuntime 的 API 参考。"
---

`Agent` 是 `@cline/agents` 中 `AgentRuntime` 的别名。

```typescript
import { Agent, AgentRuntime, createAgent, createAgentRuntime } from "@cline/sdk"
```

## 构造函数

```typescript
new Agent(config: AgentRuntimeConfig)
```

`AgentRuntimeConfig` 接受以下任一配置方式：

- 预构建的 `model: AgentModel`，或
- `providerId`、`modelId` 以及可选的提供商凭据（`apiKey`、`baseUrl`、`headers`）。

常用字段：

| 字段 | 类型 | 必填 | 说明 |
|-------|------|----------|-------------|
| `providerId` | `string` | 是，除非提供了 `model` | 提供商 ID |
| `modelId` | `string` | 是，除非提供了 `model` | 模型 ID |
| `apiKey` | `string` | 否 | 提供商 API 密钥 |
| `baseUrl` | `string` | 否 | 自定义提供商基础 URL |
| `systemPrompt` | `string` | 否 | 系统指令 |
| `tools` | `AgentTool[]` | 否 | 运行时可用的工具 |
| `initialMessages` | `AgentMessage[]` | 否 | 预加载的对话 |
| `toolPolicies` | `Record<string, ToolPolicy>` | 否 | 各工具的启用/批准策略 |
| `hooks` | `AgentRuntimeHooks` | 否 | 运行时生命周期钩子 |

## 方法

### `run(input)`

```typescript
const result = await agent.run("Analyze this codebase")
```

使用输入启动一次运行。

### `continue(input?)`

```typescript
const result = await agent.continue("Now inspect the auth module")
```

使用可选的新输入继续运行。

### `abort(reason?)`

```typescript
agent.abort("User cancelled")
```

中止当前运行。

### `subscribe(listener)`

```typescript
const unsubscribe = agent.subscribe((event) => {
  console.log(event.type)
})
```

订阅 `AgentRuntimeEvent` 事件。

### `restore(messages)`

```typescript
agent.restore(savedMessages)
```

替换对话历史记录并重置运行时状态，同时保留工具、钩子、模型、智能体身份和订阅者。

### `snapshot()`

```typescript
const state = agent.snapshot()
```

返回一个 `AgentRuntimeStateSnapshot`。

## AgentRunResult

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

## 工厂函数

```typescript
const agent = createAgent(config)
const runtime = createAgentRuntime(config)
```
