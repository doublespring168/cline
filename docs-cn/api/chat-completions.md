---
title: "聊天补全"
sidebarTitle: "聊天补全"
description: "POST /chat/completions 端点的完整参考，包括所有参数、流式传输和工具调用。"
---

聊天补全端点根据对话生成模型响应。它遵循 [OpenAI 聊天补全](https://platform.openai.com/docs/api-reference/chat/create) 格式。

## 端点

```
POST https://api.cline.bot/api/v1/chat/completions
```

## 请求标头

| 标头 | 必需 | 描述 |
|--------|----------|-------------|
| `Authorization` | 是 | `Bearer YOUR_API_KEY` |
| `Content-Type` | 是 | `application/json` |
| `HTTP-Referer` | 否 | 你的应用程序 URL（用于使用情况跟踪） |
| `X-Title` | 否 | 你的应用程序名称（用于使用日志） |

## 请求正文

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|-----------|------|----------|---------|-------------|
| `model` | 字符串 | 是 | | `provider/model` 格式的模型 ID。请参阅[模型](/api/models)。 |
| `messages` | 数组 | 是 | | 对话消息。每条消息都有 `role`（`system`、`user`、`assistant`）和 `content`。 |
| `stream` | 布尔值 | 否 | `true` | 以服务器发送事件流的形式返回响应。 |
| `tools` | 数组 | 否 | | OpenAI 格式的工具/函数定义。 |
| `temperature` | 数字 | 否 | 模型默认值 | 采样温度（0.0 到 2.0）。值越低，结果越具确定性。 |

### 消息格式

`messages` 数组中的每条消息都具有以下结构：

```json
{
  "role": "user",
  "content": "Your message here"
}
```

**角色：**

| 角色 | 用途 |
|------|---------|
| `system` | 设置模型的行为和角色设定。请将其放在数组首位。 |
| `user` | 人类的输入。 |
| `assistant` | 之前的模型响应（用于多轮对话）。 |

### 多轮对话

包含之前的消息以维持上下文：

```json
{
  "model": "anthropic/claude-sonnet-4-6",
  "messages": [
    {"role": "system", "content": "You are a helpful coding assistant."},
    {"role": "user", "content": "What is a closure in JavaScript?"},
    {"role": "assistant", "content": "A closure is a function that..."},
    {"role": "user", "content": "Can you show me an example?"}
  ]
}
```

## 流式响应

当 `stream: true`（默认值）时，响应是一系列[服务器发送事件](https://developer.mozilla.org/en-US/docs/Web/API/Server-Sent_Events)：

```
data: {"id":"gen-abc123","choices":[{"delta":{"role":"assistant"},"index":0}],"model":"anthropic/claude-sonnet-4-6"}

data: {"id":"gen-abc123","choices":[{"delta":{"content":"The capital"},"index":0}],"model":"anthropic/claude-sonnet-4-6"}

data: {"id":"gen-abc123","choices":[{"delta":{"content":" of France"},"index":0}],"model":"anthropic/claude-sonnet-4-6"}

data: {"id":"gen-abc123","choices":[{"delta":{"content":" is Paris."},"index":0,"finish_reason":"stop"}],"model":"anthropic/claude-sonnet-4-6","usage":{"prompt_tokens":14,"completion_tokens":8,"cost":0.000066}}

data: [DONE]
```

每个 `data:` 行都包含一个 JSON 数据块。关键字段：

| 字段 | 描述 |
|-------|-------------|
| `id` | 生成 ID，在所有数据块中保持一致 |
| `choices[0].delta.content` | 此数据块中的新文本 |
| `choices[0].delta.reasoning` | 推理/思考内容（适用于推理模型） |
| `choices[0].finish_reason` | 完成时为 `stop`，失败时为 `error` |
| `usage` | 令牌数量和成本（包含在最后一个数据块中） |

### 使用情况对象

最后一个数据块包含令牌使用情况和成本：

```json
{
  "usage": {
    "prompt_tokens": 25,
    "completion_tokens": 42,
    "prompt_tokens_details": {
      "cached_tokens": 0
    },
    "cost": 0.000315
  }
}
```

| 字段 | 描述 |
|-------|-------------|
| `prompt_tokens` | 输入令牌总数 |
| `completion_tokens` | 输出令牌总数 |
| `prompt_tokens_details.cached_tokens` | 从缓存提供的令牌（可降低成本） |
| `cost` | 此请求的总成本（美元） |

## 非流式响应

当 `stream: false` 时，响应是单个 JSON 对象：

```json
{
  "id": "gen-abc123",
  "model": "anthropic/claude-sonnet-4-6",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "The capital of France is Paris."
      },
      "finish_reason": "stop",
      "index": 0
    }
  ],
  "usage": {
    "prompt_tokens": 14,
    "completion_tokens": 8
  }
}
```

## 工具调用

你可以使用 OpenAI 函数调用格式定义模型可以调用的工具：

```json
{
  "model": "anthropic/claude-sonnet-4-6",
  "messages": [
    {"role": "user", "content": "What's the weather in San Francisco?"}
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Get the current weather for a location",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "City and state, e.g. San Francisco, CA"
            }
          },
          "required": ["location"]
        }
      }
    }
  ]
}
```

当模型决定调用工具时，响应会包含一个 `tool_calls` 数组：

```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "tool_calls": [
          {
            "id": "call_abc123",
            "type": "function",
            "function": {
              "name": "get_weather",
              "arguments": "{\"location\": \"San Francisco, CA\"}"
            }
          }
        ]
      },
      "finish_reason": "tool_calls"
    }
  ]
}
```

要在工具调用后继续对话，请包含工具结果：

```json
{
  "messages": [
    {"role": "user", "content": "What's the weather in San Francisco?"},
    {"role": "assistant", "tool_calls": [{"id": "call_abc123", "type": "function", "function": {"name": "get_weather", "arguments": "{\"location\": \"San Francisco, CA\"}"}}]},
    {"role": "tool", "tool_call_id": "call_abc123", "content": "{\"temperature\": 62, \"condition\": \"foggy\"}"},
  ]
}
```

## 推理模型

一些模型支持扩展思考（推理）。使用这些模型时，响应可能会在流式增量中包含推理内容：

```json
{"choices":[{"delta":{"reasoning":"Let me think about this step by step..."}}]}
```

推理令牌与主要内容相互独立，并出现在 `delta.reasoning` 字段中。一些提供商通过 `delta.reasoning_details` 返回加密的推理块，可以在后续请求中将其传回，以保留推理轨迹。

<Note>
  并非所有模型都支持推理。请参阅[模型](/api/models)，了解哪些模型具有推理能力。
</Note>

## 完整示例

```bash
curl -X POST https://api.cline.bot/api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "anthropic/claude-sonnet-4-6",
    "messages": [
      {"role": "system", "content": "You are a concise assistant. Answer in one sentence."},
      {"role": "user", "content": "Explain what an API is."}
    ],
    "stream": true
  }'
```

## 相关内容

<CardGroup cols={2}>
  <Card title="模型" icon="brain" href="/api/models">
    浏览可用模型及其能力。
  </Card>
  <Card title="错误" icon="triangle-exclamation" href="/api/errors">
    处理错误并实现重试逻辑。
  </Card>
  <Card title="SDK 示例" icon="code" href="/api/sdk-examples">
    通过 Python、Node.js 等使用此端点。
  </Card>
  <Card title="身份验证" icon="key" href="/api/authentication">
    API 密钥管理和安全实践。
  </Card>
</CardGroup>
