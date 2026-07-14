---
title: "错误"
sidebarTitle: "错误"
description: "Cline API 的错误代码、错误格式、流中错误和重试策略。"
---

Cline API 以一致的 JSON 格式返回错误。了解这些错误有助于你构建可靠的集成。

## 错误格式

所有错误都遵循 OpenAI 错误格式：

```json
{
  "error": {
    "code": 401,
    "message": "Invalid API key",
    "metadata": {}
  }
}
```

| 字段 | 类型 | 描述 |
|-------|------|-------------|
| `code` | 数字/字符串 | HTTP 状态码或错误标识符 |
| `message` | 字符串 | 易于理解的错误描述 |
| `metadata` | 对象 | 其他上下文（提供商详细信息、请求 ID） |

## 错误代码

### HTTP 错误

这些错误会以 HTTP 响应状态码和错误正文的形式返回：

| 代码 | 名称 | 原因 | 处理方式 |
|------|------|-------|------------|
| `400` | 错误请求 | 请求正文格式错误、缺少必填字段 | 检查 JSON 语法和必填参数 |
| `401` | 未授权 | API 密钥无效或缺失 | 验证 `Authorization` 标头中的 API 密钥 |
| `402` | 需要付款 | 余额不足 | 在 [app.cline.bot](https://app.cline.bot) 添加余额 |
| `403` | 禁止访问 | 密钥无权访问此资源 | 检查密钥权限 |
| `404` | 未找到 | 端点或模型 ID 无效 | 验证 URL 和模型 ID 格式 |
| `429` | 请求过多 | 超出速率限制 | 等待后通过指数退避重试 |
| `500` | 内部服务器错误 | 服务器端问题 | 短暂延迟后重试 |
| `502` | 错误网关 | 上游提供商错误 | 短暂延迟后重试 |
| `503` | 服务不可用 | 服务暂时中断 | 短暂延迟后重试 |

### 流中错误

进行流式传输时，错误可能在响应开始后发生。这些错误显示为带有 `finish_reason: "error"` 的数据块：

```json
{
  "choices": [
    {
      "finish_reason": "error",
      "error": {
        "code": "context_length_exceeded",
        "message": "The input exceeds the model's maximum context length."
      }
    }
  ]
}
```

常见的流中错误代码：

| 代码 | 含义 |
|------|---------|
| `context_length_exceeded` | 输入令牌超出模型的上下文窗口 |
| `content_filter` | 内容被安全过滤器阻止 |
| `rate_limit` | 生成期间触发速率限制 |
| `server_error` | 上游提供商在生成期间发生故障 |

<Warning>
  流中错误不会产生 HTTP 错误代码（连接已经是 200 OK）。始终在流式处理程序中检查 `finish_reason`。
</Warning>

## 重试策略

### 指数退避

对于暂时性错误（429、500、502、503），请使用指数退避进行重试：

```python
import time
import requests

def call_api_with_retry(payload, max_retries=3):
    for attempt in range(max_retries):
        response = requests.post(
            "https://api.cline.bot/api/v1/chat/completions",
            headers={
                "Authorization": "Bearer YOUR_API_KEY",
                "Content-Type": "application/json",
            },
            json=payload,
        )

        if response.status_code == 200:
            return response.json()

        if response.status_code in (429, 500, 502, 503):
            delay = (2 ** attempt) + 1
            print(f"Retrying in {delay}s (attempt {attempt + 1}/{max_retries})")
            time.sleep(delay)
            continue

        # Non-retryable error
        response.raise_for_status()

    raise Exception("Max retries exceeded")
```

### 何时重试

| 错误 | 重试？ | 策略 |
|-------|--------|----------|
| `401 Unauthorized` | 否 | 修复 API 密钥 |
| `402 Payment Required` | 否 | 添加余额 |
| `429 Too Many Requests` | 是 | 指数退避（从 1s 开始） |
| `500 Internal Server Error` | 是 | 1s 后重试一次 |
| `502 Bad Gateway` | 是 | 使用退避最多重试 3 次 |
| `503 Service Unavailable` | 是 | 使用退避最多重试 3 次 |
| 流中 `error` | 视情况而定 | 对暂时性错误重试完整请求 |

### 速率限制

如果你经常触发速率限制：

- 在请求之间添加延迟
- 减少并发请求数量
- 如果需要更高的限制，请联系支持团队

## 调试

报告问题时，请包含：

1. 响应中的**错误代码和消息**
2. 你使用的**模型 ID**
3. **请求 ID**（来自 `x-request-id` 响应标头，如有）
4. 错误是**立即发生**（HTTP 错误）还是**在流中发生**（finish_reason 错误）

## 相关内容

<CardGroup cols={2}>
  <Card title="聊天补全" icon="message" href="/api/chat-completions">
    包含请求和响应架构的端点参考。
  </Card>
  <Card title="身份验证" icon="key" href="/api/authentication">
    验证你的 API 密钥配置是否正确。
  </Card>
</CardGroup>
