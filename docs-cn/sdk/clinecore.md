---
title: "ClineCore"
sidebarTitle: "ClineCore"
description: "完整的 Cline 运行框架：内置工具、会话、批准、调度和 Hub 支持。"
---

`ClineCore` 是作为可编程运行时提供的完整 Cline 运行框架。它为你提供 Cline 开箱即用的全部功能：用于文件、shell、搜索和 Web 的内置工具；会话持久化和消息历史记录；工具批准回调；本地、Hub 和远程后端；调度与自动化 API；以及插件支持。

在底层，`ClineCore` 使用来自 `@cline/agents` 的 `Agent` 类。如果你想跳过该运行框架并自行连接一切，可以直接使用 `Agent`：使用你自己的工具、你自己的持久化机制和你自己的生命周期。

## 何时使用哪一个

| 需求 | 使用 |
|------|-----|
| 会话、持久化、消息历史记录 | `ClineCore` |
| 用于文件、shell、搜索、Web 获取的内置工具 | `ClineCore` |
| Hub/远程运行时 | `ClineCore` |
| 调度或事件自动化 | `ClineCore` |
| 多智能体团队 | `ClineCore` |
| 兼容浏览器或轻量级的进程内智能体 | `Agent` |
| 仅使用自定义工具，不使用内置工具 | `Agent` |
| 完全控制持久化和生命周期 | `Agent` |

## ClineCore

`ClineCore` 使用应用功能封装运行时执行：

- 会话清单和消息产物
- 内置工具
- 工具批准回调
- 本地、Hub 和远程后端
- 自动化/调度 API
- 可选的插件路径和扩展

```typescript
import { ClineCore } from "@cline/sdk"

const cline = await ClineCore.create({
  clientName: "my-app",
  backendMode: "auto",
})

const session = await cline.start({
  prompt: "Set up GitHub Actions for this repo",
  config: {
    providerId: "anthropic",
    modelId: "claude-sonnet-4-6",
    apiKey: process.env.ANTHROPIC_API_KEY,
    systemPrompt: "You are a helpful coding assistant.",
    cwd: "/path/to/project",
    workspaceRoot: "/path/to/project",
    enableTools: true,
    enableSpawnAgent: false,
    enableAgentTeams: false,
  },
})

console.log(session.sessionId)
console.log(session.result?.finishReason)
```

### 方法

| 方法 | 用途 |
|--------|---------|
| `ClineCore.create(options)` | 创建运行时 |
| `start(input)` | 启动会话 |
| `send({ sessionId, prompt })` | 发送后续消息 |
| `subscribe(listener, options?)` | 监听会话事件 |
| `list(limit?, options?)` | 列出会话及其历史记录元数据 |
| `get(sessionId)` | 读取会话元数据 |
| `readMessages(sessionId)` | 读取会话消息 |
| `getAccumulatedUsage(sessionId)` | 读取会话的 Token/成本总计 |
| `abort(sessionId, reason?)` | 中止当前工作 |
| `stop(sessionId)` | 停止会话 |
| `delete(sessionId)` | 删除会话 |
| `dispose(reason?)` | 清理运行时资源 |

有关确切签名，请参阅 [ClineCore 参考](/sdk/reference/cline-core)。

## 后端模式

| 模式 | 行为 |
|------|----------|
| `auto` | 优先使用兼容的本地 Hub，否则使用本地执行 |
| `hub` | 要求使用兼容的 WebSocket Hub |
| `remote` | 连接到已配置的远程 Hub |
| `local` | 始终使用本地进程内执行和本地存储 |

有关进程拓扑，请参阅[中心辐射式架构](/sdk/architecture/hub-spoke)。

## 会话产物

`ClineCore` 将会话清单和消息存储为文件。会话结果包括：

| 字段 | 含义 |
|-------|---------|
| `sessionId` | 会话标识符 |
| `manifest` | 解析后的会话清单 |
| `manifestPath` | 会话清单 JSON 的路径 |
| `messagesPath` | 持久化消息 JSON 的路径 |
| `result` | 最终的 `AgentResult`（如可用） |

## 工具批准

对于简单场景，请使用工具策略：

```typescript
await cline.start({
  prompt: "Audit this repo",
  config: {
    providerId: "anthropic",
    modelId: "claude-sonnet-4-6",
    apiKey: process.env.ANTHROPIC_API_KEY,
    systemPrompt: "You are a helpful coding assistant.",
    cwd: process.cwd(),
    workspaceRoot: process.cwd(),
    enableTools: true,
    enableSpawnAgent: false,
    enableAgentTeams: false,
  },
  toolPolicies: {
    read_files: { autoApprove: true },
    search_codebase: { autoApprove: true },
    run_commands: { autoApprove: false },
    editor: { autoApprove: false },
  },
})
```

当应用需要动态作出决定时，请使用 `requestToolApproval`：

```typescript
const cline = await ClineCore.create({
  clientName: "my-app",
  capabilities: {
    requestToolApproval: async (request) => {
      return { approved: request.toolName !== "run_commands" }
    },
  },
})
```

有关工具行为和策略，请参阅[工具](/sdk/tools)。

## 直接使用 Agent

`Agent`（也导出为 `AgentRuntime`）是 `ClineCore` 构建于其上的无状态基础组件。需要完全控制或不需要完整运行框架时，请直接使用它。

`Agent` 是 `AgentRuntime` 的别名。通过提供商/模型 ID 构造时使用 `Agent`；提供预构建的 `AgentModel` 时使用 `AgentRuntime`。

`Agent` 运行以下核心循环：

```txt
run() or continue()
  -> model request
  -> tool calls, if any
  -> tool results
  -> repeat until complete
```

```typescript
import { Agent } from "@cline/sdk"

const agent = new Agent({
  providerId: "anthropic",
  modelId: "claude-sonnet-4-6",
  apiKey: process.env.ANTHROPIC_API_KEY,
  systemPrompt: "You are a helpful coding assistant.",
  tools: [myTool],
})

agent.subscribe((event) => {
  if (event.type === "assistant-text-delta") {
    process.stdout.write(event.text ?? "")
  }
})

const result = await agent.run("Review this diff")
console.log(result.outputText)
```

### Agent 方法

| 方法 | 用途 |
|--------|---------|
| `run(input)` | 使用用户输入开始一次运行 |
| `continue(input?)` | 使用可选的新输入继续运行 |
| `abort(reason?)` | 中止活动运行 |
| `subscribe(listener)` | 监听 `AgentRuntimeEvent` 事件 |
| `restore(messages)` | 替换对话历史记录 |
| `snapshot()` | 读取运行时状态 |

有关确切签名，请参阅 [Agent 参考](/sdk/reference/agent)。

### 多轮对话

`AgentRuntime` 在内部保留消息状态。首次运行后使用 `continue()`：

```typescript
await agent.run("What does this project do?")
await agent.continue("Now identify risky files")
```

如果在外部持久化消息，请先使用 `restore(messages)` 恢复它们，再继续运行。
