---
title: "Cline API"
sidebarTitle: "概览"
description: "通过兼容 OpenAI 的聊天补全 API 以编程方式访问 AI 模型。"
---

欢迎阅读 Cline API 文档。你可以使用任何支持 OpenAI 格式的语言、框架或工具，调用为 Cline 扩展和 CLI 提供支持的同款模型。

## 什么是 Cline API？

Cline API 是一个兼容 OpenAI 的聊天补全端点。只需使用 Cline API 密钥进行一次身份验证，即可通过单一基础 URL 访问 Anthropic、OpenAI、Google 等提供商的模型。无需为每个提供商分别管理密钥。

```
Your App  →  Cline API (api.cline.bot)  →  Anthropic / OpenAI / Google / etc.
```

<CardGroup cols={2}>
  <Card title="快速入门" icon="rocket" href="/api/getting-started">
    创建 API 密钥，并在一分钟内发出你的第一个请求。
  </Card>
  <Card title="身份验证" icon="key" href="/api/authentication">
    API 密钥、账户令牌、密钥轮换和安全最佳实践。
  </Card>
  <Card title="聊天补全" icon="message" href="/api/chat-completions">
    包含请求模式、流式传输和工具调用的完整端点参考。
  </Card>
  <Card title="代码示例" icon="code" href="/api/sdk-examples">
    可直接复制的 Python、Node.js、curl 和 Cline CLI 示例。
  </Card>
</CardGroup>

## 浏览参考文档

<CardGroup cols={3}>
  <Card title="模型" icon="brain" href="/api/models">
    浏览可用模型、免费层级选项、推理支持和选择指南。
  </Card>
  <Card title="错误" icon="triangle-exclamation" href="/api/errors">
    错误代码、流式传输中途错误、重试策略和调试技巧。
  </Card>
  <Card title="企业 API" icon="building" href="/enterprise-solutions/api-reference">
    用于管理用户、组织、账单和 API 密钥的管理员端点。
  </Card>
</CardGroup>

## 快速开始

```bash
curl -X POST https://api.cline.bot/api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "anthropic/claude-sonnet-4-6",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

在 [app.cline.bot](https://app.cline.bot)（设置 > API 密钥）获取你的 API 密钥，然后按照[快速入门](/api/getting-started)指南操作。
