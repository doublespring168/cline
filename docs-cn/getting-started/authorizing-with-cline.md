---
title: "授权"
description: "通过 Cline 进行身份验证并选择你的第一个 AI 模型"
---

Cline 通过**提供商**连接 AI 模型。你有两种方式：

- **Cline 提供商**（推荐）：使用 Google/GitHub/电子邮件登录，无需设置 API 密钥。
- **使用你自己的密钥 (BYOK)**：使用你自己的提供商凭据（云端或本地运行时）。

## 菜单

- [IDE 设置](#ide-%E8%AE%BE%E7%BD%AE)
- [CLI 设置](#cli-%E8%AE%BE%E7%BD%AE)

## IDE 设置

<Steps>
  <Step title="打开 Cline 设置">
    点击 Cline 面板中的设置图标 (⚙️)。
  </Step>

  <Step title="选择提供商">
    从 **API 提供商**下拉列表中选择所需的提供商。
  </Step>

  <Step title="进行身份验证">
    - **Cline 提供商：**点击**登录**并完成 OAuth。
    - **BYOK 云提供商：**将你的 API 密钥粘贴到 **API 密钥**字段中。
    - **本地运行时 (Ollama/LM Studio)：**无需密钥；请确保运行时正在运行。
  </Step>

  <Step title="选择模型">
    从**模型**下拉列表中选择所需的 Claude 模型。
  </Step>
</Steps>

## 提供商选项

### Cline 提供商

- 登录一次，无需管理密钥
- 内置计费和免费模型选项
- 使用一个账户访问多个提供商

在 Cline 设置中或前往 [app.cline.bot/dashboard](https://app.cline.bot/dashboard) 添加额度。

### BYOK（云端 + 本地）

### 云提供商

| 提供商 | 最适合 | 设置指南 |
|----------|----------|-------------|
| **OpenRouter** | 多种模型、价格有竞争力 | [设置](/provider-config/openrouter) |
| **Anthropic** | 直接访问 Claude | [设置](/provider-config/anthropic) |
| **Claude Code** | Claude Max/Pro 订阅 | [设置](/provider-config/anthropic) |
| **OpenAI** | GPT 模型 | [设置](/provider-config/openai) |
| **Google Gemini** | Gemini 模型 | [设置](/provider-config/google-gemini) |
| **AWS Bedrock** | 企业 | [设置](/provider-config/aws-bedrock/api-key) |
| **DeepSeek** | 极具性价比 | [设置](/provider-config/deepseek) |

### 本地模型

在你自己的硬件上运行模型，以获得完全的隐私保护，并且无需支付按请求计费的费用。

| 提供商 | 最适合 | 设置指南 |
|----------|----------|-------------|
| **Ollama** | 基于 CLI 的本地运行时 | [设置](/running-models-locally/overview#%E8%BF%90%E8%A1%8C%E6%97%B6%E9%80%89%E9%A1%B9) |
| **LM Studio** | 基于 GUI 的本地运行时 | [设置](/running-models-locally/overview#%E8%BF%90%E8%A1%8C%E6%97%B6%E9%80%89%E9%A1%B9) |

本地模型需要足够的硬件资源（尤其是 GPU 显存）。有关要求，请参阅[在本地运行模型](/running-models-locally/overview)。

## CLI 设置

```bash
# Authenticate from the terminal
cline auth

# Shorthand
cline a
```

运行与 IDE 设置相同的身份验证流程。

## 故障排除

| 问题 | 解决方法 |
|-------|-----|
| “未授权：请登录” | 会话已过期。点击**登录**以重新进行身份验证。 |
| 浏览器未打开 | 检查默认浏览器设置。从 Cline 输出面板手动复制 URL。 |
| 频繁需要重新进行身份验证 | 检查组织安全策略。确保你没有清除 IDE 密钥。尝试完全退出登录后再重新登录。 |
| 无法访问组织 | 在 [app.cline.bot](https://app.cline.bot) 验证成员身份。向管理员询问权限。退出登录后再重新登录。 |
