---
title: "身份验证"
sidebarTitle: "身份验证"
description: "如何使用 API 密钥或账户令牌通过 Cline API 进行身份验证。"
---

每个发送到 Cline API 的请求都需要通过 `Authorization` 标头中的 Bearer 令牌进行身份验证。

## 身份验证方法

有两种身份验证方式：

| 方法 | 使用场景 | 获取方式 |
|--------|----------|---------------|
| **API 密钥** | 直接调用 API、脚本、CI/CD | 在 [app.cline.bot](https://app.cline.bot) 的设置 > API 密钥中创建 |
| **账户身份验证令牌** | Cline 扩展和 CLI | 登录时自动生成 |

两种方法使用相同的标头格式：

```bash
Authorization: Bearer YOUR_TOKEN
```

## API 密钥

对于编程访问，推荐使用 API 密钥作为身份验证方法。

### 创建密钥

<Steps>
  <Step title="登录">
    前往 [app.cline.bot](https://app.cline.bot) 并登录。
  </Step>
  <Step title="打开 API 密钥">
    前往**设置** > **API 密钥**。
  </Step>
  <Step title="创建并复制">
    创建一个新密钥。请立即复制，因为之后将无法再次查看。
  </Step>
</Steps>

### 删除密钥

你可以随时从同一设置 > API 密钥页面撤销 API 密钥。删除的密钥会立即停止工作。

你还可以通过[企业 API](/enterprise-solutions/api-reference#api-%E5%AF%86%E9%92%A5) 以编程方式管理密钥：

```bash
# List your keys
curl https://api.cline.bot/api/v1/api-keys \
  -H "Authorization: Bearer YOUR_TOKEN"

# Delete a key
curl -X DELETE https://api.cline.bot/api/v1/api-keys/KEY_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 账户身份验证令牌

当你登录 Cline 扩展（VS Code、JetBrains）或 CLI 时，系统会自动生成并管理账户身份验证令牌。你无需手动处理这些令牌。

当你通过以下方式进行身份验证时，Cline CLI 会使用这些令牌：

```bash
# Interactive sign-in
cline auth

# Or quick setup with an API key
cline auth -p cline -k "YOUR_API_KEY" -m anthropic/claude-sonnet-4-6
```

有关所有身份验证选项，请参阅 [CLI 参考](/cli/cli-reference#auth-%5Boptions%5D-%5Bprovider%5D)。

## 安全最佳实践

**应：**
- 将 API 密钥存储在环境变量或密钥管理器中
- 为开发和生产环境使用不同的密钥
- 定期轮换密钥
- 删除不再使用的密钥

**不应：**
- 将密钥提交到版本控制中
- 在聊天或电子邮件中分享密钥
- 将密钥嵌入客户端代码（浏览器、移动应用）
- 在应用程序输出中记录密钥

### 使用环境变量

```bash
# Set the key
export CLINE_API_KEY="your_api_key_here"

# Use it in requests
curl -X POST https://api.cline.bot/api/v1/chat/completions \
  -H "Authorization: Bearer $CLINE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "anthropic/claude-sonnet-4-6", "messages": [{"role": "user", "content": "Hello"}]}'
```

### 使用 .env 文件

```bash
# .env (add to .gitignore)
CLINE_API_KEY=your_api_key_here
```

```python
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://api.cline.bot/api/v1",
    api_key=os.environ["CLINE_API_KEY"],
)
```

## 自定义标头

Cline API 接受用于跟踪和识别的可选标头：

| 标头 | 描述 |
|--------|-------------|
| `HTTP-Referer` | 你的应用程序 URL。有助于跟踪使用情况。 |
| `X-Title` | 你的应用程序名称。显示在使用日志中。 |
| `X-Task-ID` | 唯一的任务标识符。供 Cline 扩展内部使用。 |

## 相关内容

<CardGroup cols={2}>
  <Card title="入门指南" icon="rocket" href="/api/getting-started">
    创建你的第一个 API 密钥并发出请求。
  </Card>
  <Card title="企业 API 密钥" icon="building" href="/enterprise-solutions/api-reference#api-%E5%AF%86%E9%92%A5">
    以编程方式管理 API 密钥。
  </Card>
</CardGroup>
