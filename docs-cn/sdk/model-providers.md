---
title: "模型提供商"
sidebarTitle: "模型提供商"
description: "配置提供商凭据、模型 ID 和 LLM 网关。"
---

`@cline/llms` 包提供提供商注册表、模型目录、处理器和网关。`@cline/agents` 和 `@cline/core` 在内部使用这一层。

## 配置提供商

```typescript
const agent = new Agent({
  providerId: "anthropic",
  modelId: "claude-sonnet-4-6",
  apiKey: process.env.ANTHROPIC_API_KEY,
  // ...
})
```

提供商配置可以包括 `apiKey`、`baseUrl`、`headers`，以及通过核心/提供商配置类型设置的提供商特定配置。

常用环境变量：

| 提供商 | 环境变量 |
|----------|----------------------|
| Anthropic | `ANTHROPIC_API_KEY` |
| OpenAI | `OPENAI_API_KEY` |
| Google | `GOOGLE_API_KEY` 或 `GOOGLE_APPLICATION_CREDENTIALS` |
| AWS Bedrock | `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY`、`AWS_SESSION_TOKEN` |
| Mistral | `MISTRAL_API_KEY` |

## OpenAI 兼容提供商

对于提供 OpenAI 兼容 API 的提供商，请使用 `openai-compatible`：

```typescript
const agent = new Agent({
  providerId: "openai-compatible",
  modelId: "your-model-name",
  apiKey: process.env.PROVIDER_API_KEY,
  baseUrl: "https://your-provider.com/v1",
})
```

## AWS Bedrock

Bedrock 使用来自标准环境/SDK 链的 AWS 凭据和提供商特定配置：

```typescript
const agent = new Agent({
  providerId: "bedrock",
  modelId: "anthropic.claude-sonnet-4-6",
  providerConfig: {
    awsRegion: "us-east-1",
  },
})
```

## 网关 API

需要直接访问提供商/模型时，请使用 `DefaultGateway` 或 `createGateway`：

```typescript
import { DefaultGateway } from "@cline/llms"

const gateway = new DefaultGateway()

const providers = gateway.listProviders()
const model = gateway.createAgentModel({
  providerId: "anthropic",
  modelId: "claude-sonnet-4-6",
})
```

该包还导出注册表辅助函数，例如 `getAllProviders`、`getProviderIds`、`getModelsForProvider`、`registerProvider` 和 `registerModel`。

有关确切 API，请参阅[网关参考](/sdk/reference/gateway)。

## 模型元数据

模型会公开用于选择和成本计算的元数据：

```typescript
interface ModelInfo {
  id: string
  name?: string
  contextWindow?: number
  maxTokens?: number
  pricing?: {
    input?: number
    output?: number
    cacheCreation?: number
    cacheRead?: number
  }
  capabilities?: Record<string, unknown>
}
```

## 成本跟踪

智能体结果和用量事件包含 Token 用量：

```typescript
const result = await agent.run("Analyze this codebase")

console.log(result.usage.inputTokens)
console.log(result.usage.outputTokens)
console.log(result.usage.totalCost)
```
