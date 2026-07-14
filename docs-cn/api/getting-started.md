---
title: "入门指南"
sidebarTitle: "入门指南"
description: "在一分钟内创建 API 密钥并向 Cline API 发出第一个请求。"
---

本指南将引导你创建 API 密钥并发出第一个聊天补全请求。

## 前提条件

- 在 [app.cline.bot](https://app.cline.bot) 拥有 Cline 账户
- `curl` 或任何 HTTP 客户端（Python、Node.js 等）

## 创建 API 密钥

<Steps>
  <Step title="登录 app.cline.bot">
    前往 [app.cline.bot](https://app.cline.bot)，使用你的账户登录。
  </Step>
  <Step title="前往 API 密钥">
    打开**设置**并选择 **API 密钥**。
  </Step>
  <Step title="创建新密钥">
    点击**创建 API 密钥**。请立即复制该密钥。离开此页面后，你将无法再次查看它。
  </Step>
</Steps>

<Warning>
  像对待密码一样保护你的 API 密钥。不要将其提交到版本控制中，也不要公开分享。
</Warning>

## 发出第一个请求

将 `YOUR_API_KEY` 替换为你刚刚创建的密钥：

```bash
curl -X POST https://api.cline.bot/api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "anthropic/claude-sonnet-4-6",
    "messages": [
      {"role": "user", "content": "What is the capital of France?"}
    ],
    "stream": false
  }'
```

## 验证响应

你应该会收到如下 JSON 响应：

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

`choices[0].message.content` 字段包含模型的回复。`usage` 字段显示消耗了多少个令牌。

## 尝试流式传输

要获得实时输出，请设置 `stream: true`。响应将以服务器发送事件的形式到达：

```bash
curl -X POST https://api.cline.bot/api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "anthropic/claude-sonnet-4-6",
    "messages": [
      {"role": "user", "content": "Write a haiku about programming."}
    ],
    "stream": true
  }'
```

每个分块均以 `data:` 行的形式到达。流以 `data: [DONE]` 结束。

## 尝试免费模型

要在不消耗额度的情况下进行测试，请使用任一[免费模型](/api/models#%E9%80%89%E6%8B%A9%E6%A8%A1%E5%9E%8B)：

```bash
curl -X POST https://api.cline.bot/api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "minimax/minimax-m2.5",
    "messages": [
      {"role": "user", "content": "Hello! What can you help me with?"}
    ],
    "stream": false
  }'
```

## 故障排除

| 问题 | 解决方案 |
|---------|----------|
| `401 Unauthorized` | 检查你的 API 密钥是否正确，并且是否已包含在 `Authorization` 标头中 |
| `402 Payment Required` | 你的账户额度不足。请在 [app.cline.bot](https://app.cline.bot) 添加额度 |
| 空响应 | 确保 `messages` 是一个非空数组，且至少包含一条用户消息 |
| 连接超时 | 验证你的网络能否访问 `api.cline.bot`。如果使用公司网络，请检查代理设置 |

## 后续步骤

<CardGroup cols={2}>
  <Card title="身份验证" icon="key" href="/api/authentication">
    了解 API 密钥、令牌作用域和安全实践。
  </Card>
  <Card title="聊天补全" icon="message" href="/api/chat-completions">
    包含所有参数和选项的完整端点参考。
  </Card>
  <Card title="模型" icon="brain" href="/api/models">
    浏览可用模型，并为你的使用场景找到合适的模型。
  </Card>
  <Card title="SDK 示例" icon="code" href="/api/sdk-examples">
    通过 Python、Node.js 或 Cline CLI 使用 API。
  </Card>
</CardGroup>
