---
title: "投入生产"
sidebarTitle: "投入生产"
description: "将智能体部署到生产环境的最佳实践：错误处理、可观测性、成本控制和安全性。"
---

从开发转向生产意味着要处理原型设计阶段无关紧要的事项：错误、成本、可观测性和安全性。本指南介绍生产环境智能体部署所需的模式。

## 错误处理

### 智能体级错误

直接的 `AgentRuntime` 结果报告 `status`；core 使用的面向宿主的 `AgentResult` 则报告 `finishReason`。

```typescript
const result = await agent.run("Do something complex")

if (result.status === "failed") {
  // Log the error and alert
  logger.error("Agent run failed", {
    iterations: result.iterations,
    error: result.error,
  })
}
```

### 工具错误

工具应将错误作为数据返回，而不是抛出错误。这样智能体就能看到错误并进行调整：

```typescript
const apiTool: AgentTool<{ payload: unknown }, { success: boolean; data?: unknown; error?: string }> = {
  name: "call_service",
  // ...
  execute: async (input) => {
    try {
      const result = await service.call(input)
      return { output: { success: true, data: result } }
    } catch (err) {
      return {
        output: { success: false, error: err.message },
        isError: true,
      }
    }
  },
}
```

### 错误操作限制

Core 会话可以跟踪连续的可恢复错误操作，并以 `finishReason: "mistake_limit"` 停止。直接运行时通过 `status` 和 `error` 报告失败。

### 循环检测

循环检测可通过 core/会话执行设置使用。

## 可观测性

### OpenTelemetry 集成

SDK 与 OpenTelemetry 集成，以提供追踪、指标和日志：

```typescript
const cline = await ClineCore.create({
  clientName: "production-app",
  telemetry: myTelemetryService,
  logger: myLogger,
})
```

发出的事件包括：
- `agent_created` -- 使用配置初始化智能体
- `tool_usage` -- 工具调用，包括名称、持续时间、成功/失败
- `model_api_call` -- LLM API 调用，包括模型、Token、延迟
- `session_ended` -- 会话完成，包括结束原因、Token 总数

### 通过插件实现自定义指标

```typescript
const productionMetrics: AgentPlugin = {
  name: "production-metrics",
  manifest: { capabilities: ["hooks"] },

  onRunEnd({ result }) {
    metrics.histogram("agent.duration_ms", result.durationMs)
    metrics.counter("agent.tokens.input", result.usage.inputTokens)
    metrics.counter("agent.tokens.output", result.usage.outputTokens)
    metrics.counter(`agent.finish.${result.finishReason}`, 1)
  },

  onToolCall({ call }) {
    metrics.counter(`agent.tool.${call.name}`, 1)
  },

  onError({ error, recoverable }) {
    metrics.counter("agent.errors", 1, {
      recoverable: String(recoverable),
      type: error.constructor.name,
    })
  },
}
```

### 结构化日志记录

```typescript
import pino from "pino"

const logger = pino({ level: "info" })

const agent = new Agent({
  // ...config
})

agent.subscribe((event) => {
  if (event.type === "run-finished") {
    logger.info({
      event: "agent_complete",
      status: event.result.status,
      iterations: event.result.iterations,
      tokens: event.result.usage,
    })
  }
  if (event.type === "run-failed") {
    logger.error({
      event: "agent_error",
      message: event.error.message,
    })
  }
})
```

## 成本控制

### 设置 Token 限制

```typescript
const agent = new Agent({
  // ...config
  maxTokensPerTurn: 4096,
  maxIterations: 20,
})
```

### 跟踪支出

```typescript
type ModelPricing = {
  inputPerMillion: number
  outputPerMillion: number
}

function estimateCost(
  usage: { inputTokens: number; outputTokens: number; totalCost?: number },
  pricing: ModelPricing,
) {
  if (usage.totalCost != null) {
    return usage.totalCost
  }

  return (
    (usage.inputTokens / 1_000_000) * pricing.inputPerMillion +
    (usage.outputTokens / 1_000_000) * pricing.outputPerMillion
  )
}

let sessionCost = 0

const providerId = "anthropic"
const modelId = "claude-sonnet-4-6"
// Load current USD-per-million-token pricing from configuration or a pricing service.
const pricing = loadModelPricing(providerId, modelId)

const agent = new Agent({
  providerId,
  modelId,
  // ...
})

agent.subscribe((event) => {
  if (event.type === "usage-updated") {
    sessionCost = estimateCost(event.usage, pricing)

    if (sessionCost > 1.0) {
      agent.abort("Cost limit exceeded ($1.00)")
    }
  }
})
```

### 为简单任务使用更便宜的模型

```typescript
// Quick lookup: use a fast, cheap model
const lookupAgent = new Agent({
  providerId: "anthropic",
  modelId: "claude-haiku-4-5",
  // ...
})

// Complex work: use a more capable model
const workAgent = new Agent({
  providerId: "anthropic",
  modelId: "claude-sonnet-4-6",
  // ...
})
```

## 安全性

### 对工具执行进行沙箱隔离

切勿允许智能体在没有约束的情况下于生产服务器上运行任意 shell 命令：

```typescript
const sandboxedBash: AgentTool<{ command: string }, { error?: string; result?: unknown }> = {
  name: "run_commands",
  description: "Execute a shell command in a sandboxed environment.",
  inputSchema: {
    type: "object",
    properties: {
      command: { type: "string", description: "Shell command to execute" },
    },
    required: ["command"],
  },
  execute: async (input) => {
    const blocked = ["rm -rf", "sudo", "curl | sh", "wget | sh", "> /dev/"]
    if (blocked.some((b) => input.command.includes(b))) {
      return { output: { error: "Command blocked by security policy" }, isError: true }
    }

    // Execute in a container, chroot, or restricted shell
    return { output: { result: await executeInSandbox(input.command) } }
  },
}
```

### 验证工具输入

不要比信任用户输入更信任工具输入：

```typescript
const fileTool = createTool({
  name: "read_files",
  // ...
  execute: async (input) => {
    const resolved = path.resolve(input.path)

    // Prevent path traversal
    if (!resolved.startsWith(ALLOWED_DIRECTORY)) {
      return { error: "Access denied: path outside allowed directory" }
    }

    return await fs.readFile(resolved, "utf-8")
  },
})
```

### 轮换 API 密钥

使用环境变量存储 API 密钥，而不是硬编码值：

```typescript
// Good
const agent = new Agent({
  apiKey: process.env.ANTHROPIC_API_KEY,
  // ...
})

// Never do this
const agent = new Agent({
  apiKey: "sk-ant-api03-...",
  // ...
})
```

## 部署模式

### 无状态工作进程

适用于请求/响应工作流（API 端点、webhook 处理程序）：

```typescript
async function handleRequest(prompt: string): Promise<string> {
  const agent = new Agent({
    providerId: "anthropic",
    modelId: "claude-sonnet-4-6",
    apiKey: process.env.ANTHROPIC_API_KEY,
    systemPrompt: "You are a helpful assistant.",
    tools: [myTool],
    maxIterations: 10,
  })

  const result = await agent.run(prompt)
  // Agent has no explicit shutdown method
  return result.outputText
}
```

### 持久化服务

适用于具有会话管理的长时间运行服务：

```typescript
const cline = await ClineCore.create({
  clientName: "my-service",
  backendMode: "hub",
})

// Sessions persist across restarts
// Connectors, schedules, and team state all managed by the hub

process.on("SIGTERM", async () => {
  await cline.dispose("Shutting down")
  process.exit(0)
})
```
