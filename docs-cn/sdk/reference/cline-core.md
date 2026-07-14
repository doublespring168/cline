---
title: "ClineCore"
sidebarTitle: "ClineCore"
description: "@cline/core 中 ClineCore 的 API 参考。"
---

```typescript
import { ClineCore } from "@cline/sdk"
```

## `ClineCore.create(options)`

```typescript
const cline = await ClineCore.create({
  clientName: "my-app",
  backendMode: "auto",
})
```

常用选项：

| 选项 | 类型 | 说明 |
|--------|------|-------------|
| `clientName` | `string` | 便于阅读的 SDK 客户端名称 |
| `distinctId` | `string` | 稳定的遥测/用户标识符 |
| `backendMode` | `"auto" \| "local" \| "hub" \| "remote"` | 运行时后端选择 |
| `hub` | `HubOptions` | 本地 Hub 连接选项 |
| `remote` | `RemoteOptions` | 远程 Hub 选项 |
| `capabilities` | `RuntimeCapabilities` | 客户端负责的工具执行器和批准回调 |
| `toolPolicies` | `Record<string, ToolPolicy>` | 默认工具批准策略 |
| `automation` | `boolean \| ClineCoreAutomationOptions` | 启用自动化 API |
| `fetch` | `typeof fetch` | 用于本地提供商调用的自定义 fetch |

## `start(input)`

```typescript
const session = await cline.start({
  prompt: "Summarize this repo",
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
})
```

### ClineCoreStartInput

| 字段 | 类型 | 必填 | 说明 |
|-------|------|----------|-------------|
| `prompt` | `string` | 否 | 初始提示词 |
| `config` | `CoreSessionConfig` | 是 | 会话模型/运行时配置 |
| `source` | `SessionSource` | 否 | 会话来源标签 |
| `interactive` | `boolean` | 否 | 会话是否需要交互 |
| `sessionMetadata` | `Record<string, unknown>` | 否 | 随会话持久化的元数据 |
| `initialMessages` | `Message[]` | 否 | 预加载的消息 |
| `toolPolicies` | `Record<string, ToolPolicy>` | 否 | 会话级工具策略 |
| `capabilities` | `RuntimeCapabilities` | 否 | 会话级工具执行器和批准回调 |

### StartSessionResult

```typescript
interface StartSessionResult {
  sessionId: string
  manifest: SessionManifest
  manifestPath: string
  messagesPath: string
  result?: AgentResult
}
```

## `send(input)`

```typescript
const result = await cline.send({
  sessionId,
  prompt: "Continue with tests",
})
```

返回 `AgentResult | undefined`。

## 会话 API

| 方法 | 说明 |
|--------|-------------|
| `subscribe(listener, options?)` | 订阅 `CoreSessionEvent` 事件 |
| `list(limit?, options?)` | 列出会话历史记录 |
| `listHistory(options?)` | 列出会话历史记录 |
| `get(sessionId)` | 获取会话元数据 |
| `readMessages(sessionId)` | 读取持久化消息 |
| `getAccumulatedUsage(sessionId)` | 读取累计的 Token/成本用量 |
| `update(sessionId, updates)` | 更新提示词/标题/元数据 |
| `abort(sessionId, reason?)` | 中止当前工作 |
| `stop(sessionId)` | 停止会话 |
| `delete(sessionId)` | 删除会话 |
| `restore(input)` | 从检查点恢复 |
| `dispose(reason?)` | 释放运行时资源 |

## 自动化 API

启用 `automation` 后，可使用 `cline.automation` 启动/停止自动化服务、同步规格、接收事件，以及列出事件/规格/运行记录。
