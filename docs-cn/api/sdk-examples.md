---
title: "代码示例"
sidebarTitle: "代码示例"
description: "通过 Python、Node.js、curl、Cline CLI 和 VS Code 扩展使用 Cline API。"
---

Cline API 与 OpenAI 兼容，因此任何适用于 OpenAI 的库或工具也适用于 Cline API。只需更改基础 URL 和 API 密钥即可。

## curl

### 非流式

```bash
curl -X POST https://api.cline.bot/api/v1/chat/completions \
  -H "Authorization: Bearer $CLINE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "anthropic/claude-sonnet-4-6",
    "messages": [{"role": "user", "content": "What is 2+2?"}],
    "stream": false
  }'
```

### 流式

```bash
curl -X POST https://api.cline.bot/api/v1/chat/completions \
  -H "Authorization: Bearer $CLINE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "anthropic/claude-sonnet-4-6",
    "messages": [{"role": "user", "content": "Write a short poem about code."}],
    "stream": true
  }'
```

## Python

### OpenAI SDK

通过设置 `base_url`，[OpenAI Python SDK](https://github.com/openai/openai-python) 即可与 Cline API 配合使用：

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.cline.bot/api/v1",
    api_key="YOUR_API_KEY",
)

# Non-streaming
response = client.chat.completions.create(
    model="anthropic/claude-sonnet-4-6",
    messages=[{"role": "user", "content": "Explain recursion in one sentence."}],
)
print(response.choices[0].message.content)
```

### 在 Python 中进行流式传输

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.cline.bot/api/v1",
    api_key="YOUR_API_KEY",
)

stream = client.chat.completions.create(
    model="anthropic/claude-sonnet-4-6",
    messages=[{"role": "user", "content": "Write a function to reverse a string in Python."}],
    stream=True,
)

for chunk in stream:
    content = chunk.choices[0].delta.content
    if content:
        print(content, end="", flush=True)
print()
```

### 在 Python 中调用工具

```python
from openai import OpenAI
import json

client = OpenAI(
    base_url="https://api.cline.bot/api/v1",
    api_key="YOUR_API_KEY",
)

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get weather for a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string", "description": "City name"}
                },
                "required": ["location"],
            },
        },
    }
]

response = client.chat.completions.create(
    model="anthropic/claude-sonnet-4-6",
    messages=[{"role": "user", "content": "What's the weather in Tokyo?"}],
    tools=tools,
)

# Check if the model wants to call a tool
choice = response.choices[0]
if choice.message.tool_calls:
    tool_call = choice.message.tool_calls[0]
    print(f"Tool: {tool_call.function.name}")
    print(f"Args: {tool_call.function.arguments}")
```

### 使用 requests

如果你不想使用 OpenAI SDK：

```python
import requests

response = requests.post(
    "https://api.cline.bot/api/v1/chat/completions",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json",
    },
    json={
        "model": "anthropic/claude-sonnet-4-6",
        "messages": [{"role": "user", "content": "Hello!"}],
        "stream": False,
    },
)

data = response.json()
print(data["choices"][0]["message"]["content"])
```

## Node.js / TypeScript

### OpenAI SDK

通过设置 `baseURL`，[OpenAI Node.js SDK](https://github.com/openai/openai-node) 即可与 Cline API 配合使用：

```typescript
import OpenAI from "openai"

const client = new OpenAI({
  baseURL: "https://api.cline.bot/api/v1",
  apiKey: "YOUR_API_KEY",
})

// Non-streaming
const response = await client.chat.completions.create({
  model: "anthropic/claude-sonnet-4-6",
  messages: [{ role: "user", content: "Explain async/await in one sentence." }],
})
console.log(response.choices[0].message.content)
```

### 在 Node.js 中进行流式传输

```typescript
import OpenAI from "openai"

const client = new OpenAI({
  baseURL: "https://api.cline.bot/api/v1",
  apiKey: "YOUR_API_KEY",
})

const stream = await client.chat.completions.create({
  model: "anthropic/claude-sonnet-4-6",
  messages: [{ role: "user", content: "Write a haiku about TypeScript." }],
  stream: true,
})

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content
  if (content) {
    process.stdout.write(content)
  }
}
console.log()
```

### 使用 fetch

```typescript
const response = await fetch("https://api.cline.bot/api/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "anthropic/claude-sonnet-4-6",
    messages: [{ role: "user", content: "Hello!" }],
    stream: false,
  }),
})

const data = await response.json()
console.log(data.choices[0].message.content)
```

## Cline CLI

[Cline CLI](/cli/cli-reference) 是从终端使用 Cline API 的最快方式。它会为你处理身份验证、流式传输和工具执行。

### 设置

```bash
# Install
npm install -g @anthropic-ai/cline

# Authenticate with a Cline API key
cline auth -p cline -k "YOUR_API_KEY" -m anthropic/claude-sonnet-4-6
```

### 运行任务

```bash
# Simple prompt
cline "Explain what a REST API is."

# Pipe input
cat README.md | cline "Summarize this document."

# Use a specific model
cline -m google/gemini-2.5-pro "Analyze this codebase."

# YOLO mode for automation
cline -y "Run tests and fix failures."
```

有关所有命令和选项，请参阅 [CLI 参考](/cli/cli-reference)。

## VS Code / JetBrains

Cline 扩展会为你处理 API 集成：

1. 在编辑器中打开 Cline 面板
2. 在模型选择器中选择 **Cline** 作为提供商
3. 登录你的 Cline 账户
4. 开始聊天或向 Cline 分配任务

你的 API 密钥会自动管理，无需手动配置。

有关设置说明，请参阅[安装 Cline](/getting-started/installing-cline)和[使用 Cline 授权](/getting-started/authorizing-with-cline)。

## 相关内容

<CardGroup cols={2}>
  <Card title="聊天补全" icon="message" href="/api/chat-completions">
    包含所有参数的完整端点参考。
  </Card>
  <Card title="身份验证" icon="key" href="/api/authentication">
    API 密钥管理和安全实践。
  </Card>
  <Card title="模型" icon="brain" href="/api/models">
    浏览可用模型。
  </Card>
  <Card title="CLI 参考" icon="terminal" href="/cli/cli-reference">
    完整的 Cline CLI 命令参考。
  </Card>
</CardGroup>
