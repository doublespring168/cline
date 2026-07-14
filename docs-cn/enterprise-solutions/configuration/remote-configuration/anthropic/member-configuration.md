---
title: "在 VS Code 中配置 Anthropic（成员）"
sidebarTitle: "配置 Anthropic（成员）"
description: "管理员完成设置后，工程师通过 VS Code 连接其组织的 Anthropic 提供商的指南"
---

作为团队成员，您可以将本地开发环境连接到组织的 Anthropic 提供商设置。本指南将引导您在 VS Code 中配置 API 密钥，以便通过组织的配置开始使用 Claude 模型。您的管理员已经配置了提供商设置 — 您只需添加 API 密钥即可开始使用。

## 开始之前

要成功连接到组织的 Anthropic 提供商，您需要准备好几项内容。

**已安装并配置 Cline 扩展**  
必须在 VS Code 中安装 Cline 扩展，并且您需要登录组织账号。如果尚未安装 Cline，请按照我们的[安装指南](/getting-started/installing-cline)操作。

<Info>
**快速检查**：在 VS Code 中打开 Cline 面板。如果左下角显示您的组织名称，则说明您已正确登录。
</Info>

**Anthropic API 密钥**  
您需要使用 Anthropic 的 API 密钥对请求进行身份验证。您的组织可能会集中提供密钥，也可能要求您通过 [Anthropic Console](https://console.anthropic.com/) 创建密钥。

<Note>
如果您不确定如何获取 API 密钥，请向管理员确认组织的密钥配置流程。
</Note>

## 配置步骤

<Steps>
<Step title="打开 Cline 设置">
打开 VS Code，并使用以下任一方法访问 Cline 设置面板：

- 点击 Cline 面板中的设置图标（⚙️）
- 点击聊天区域正下方的 API Provider 下拉菜单

</Step>

<Step title="输入您的 API 密钥">

1. 选择或确认已选择 **Anthropic** 提供商
2. 在 **API Key** 字段中输入您的 Anthropic API 密钥
3. 如果管理员配置了自定义基础 URL，该 URL 将已设置并锁定
4. 点击 **Save** 存储您的凭证

<Tip>
API 密钥存储在本地，并且仅供 Cline 扩展使用。
</Tip>

<Note>
基础 URL 设置由您的管理员控制。如果配置了自定义代理 URL，您的 API 请求将自动通过该代理路由。
</Note>
</Step>

<Step title="验证配置">
输入 API 密钥后，由管理员控制的设置（例如基础 URL）将被锁定（显示锁定图标 🔒），因为这些设置由您的组织管理。
</Step>

<Step title="测试连接">
在 Cline 中发送测试消息，以验证您的 API 密钥能否与配置的 Anthropic 端点正常配合使用。

<Tip>
**测试建议**

请先尝试发送 "Hello" 之类的简单测试消息，验证基本连接，然后再开始开发任务。
</Tip>
</Step>
</Steps>

## 故障排除

**Anthropic 未显示为可选提供商**  
确认您已登录正确的 Cline 组织。验证管理员已保存 Anthropic 配置，并且您使用的是最新版本的 Cline 扩展。

**身份验证错误（"Invalid API Key" 或 "Unauthorized"）**  
验证您的 API 密钥是否正确且处于有效状态。在 [Anthropic Console](https://console.anthropic.com/) 中确认密钥状态及其是否具有足够权限。

**连接错误或超时**  
如果管理员配置了自定义基础 URL（代理），请向 IT 团队咨询网络要求。如果使用默认 Anthropic 端点，请确保您可以通过互联网访问 `api.anthropic.com`。

**模型不可用**  
可用模型取决于您的 Anthropic API 套餐和组织配置。如果预期的模型不可用，请联系您的管理员。

**速率限制错误**  
您的 API 密钥可能配置了 Anthropic 的速率限制。如果在正常使用期间遇到速率限制错误，请联系管理员，以调整限制或管理团队中的密钥使用情况。

## 安全最佳实践

使用 Anthropic API 密钥时：

- 确保 API 密钥安全，不要共享
- 切勿将 API 密钥存储在代码或版本控制中
- 如怀疑密钥泄露，请立即向管理员报告
- 定期检查 [Anthropic Console](https://console.anthropic.com/) 中是否存在异常使用模式

有关更多详细信息，请参阅 [Anthropic API 文档](https://docs.anthropic.com/)，并与您组织的管理员协调。
