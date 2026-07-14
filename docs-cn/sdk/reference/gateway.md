---
title: "网关"
sidebarTitle: "网关"
description: "@cline/llms 中 LLM 提供商网关的 API 参考。"
---

`DefaultGateway` 创建由提供商支持的 `AgentModel` 实例，并提供提供商/模型目录辅助函数。

```typescript
import { DefaultGateway, createGateway } from "@cline/llms"
```

## 构造函数

```typescript
const gateway = new DefaultGateway({
  providerConfigs: [
    { providerId: "anthropic", apiKey: process.env.ANTHROPIC_API_KEY },
  ],
})
```

或者：

```typescript
const gateway = createGateway({ providerConfigs: [...] })
```

## 方法

### `registerProvider(registration)`

```typescript
gateway.registerProvider(registration)
```

注册一个 `GatewayProviderRegistration`。

### `configureProvider(config)`

```typescript
gateway.configureProvider({
  providerId: "anthropic",
  apiKey: process.env.ANTHROPIC_API_KEY,
})
```

配置提供商的凭据/默认值。

### `listProviders()`

```typescript
const providers = gateway.listProviders()
```

返回已注册的提供商清单。

### `listModels(providerId?)`

```typescript
const allModels = gateway.listModels()
const anthropicModels = gateway.listModels("anthropic")
```

返回模型元数据。

### `createAgentModel(selection, options?)`

```typescript
const model = gateway.createAgentModel({
  providerId: "anthropic",
  modelId: "claude-sonnet-4-6",
})
```

返回一个可传递给 `AgentRuntime` 的 `AgentModel`。

### `stream(request)`

```typescript
const stream = await gateway.stream({
  providerId: "anthropic",
  modelId: "claude-sonnet-4-6",
  messages,
  tools: [],
})
```

返回 `AsyncIterable<AgentModelEvent>`。

## 注册表辅助函数

`@cline/llms` 还导出：

- `getAllProviders`
- `getProviderIds`
- `getProvider`
- `getModelsForProvider`
- `registerProvider`
- `registerModel`
- `createHandler`
- `createHandlerAsync`

## 内置提供商系列

运行时包含多个提供商系列的内置注册，包括 Anthropic、OpenAI、Gemini、Vertex、Bedrock、Mistral、Claude Code、OpenAI Codex、OpenCode、Dify 和 OpenAI 兼容提供商。
