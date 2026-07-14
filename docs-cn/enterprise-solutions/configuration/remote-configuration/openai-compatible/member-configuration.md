---
title: "在 VS Code 中配置 OpenAI 兼容提供商（成员）"
sidebarTitle: "配置 OpenAI 兼容提供商（成员）"
description: "面向工程师的指南：管理员完成设置后，如何通过 VS Code 连接组织的 OpenAI 兼容端点"
---

作为团队成员，你可以将本地开发环境连接到组织的 OpenAI 兼容端点。本指南将引导你在 VS Code 中配置凭据，以便通过组织已配置的端点开始使用模型。管理员已经配置好了提供商设置——你只需添加 API 密钥即可开始使用。

## 开始之前

要成功连接到组织的 OpenAI 兼容端点，你需要提前准备好几项内容。

**已安装并配置 Cline 扩展**  
必须在 VS Code 中安装 Cline 扩展，并且你需要登录组织账号。如果尚未安装 Cline，请参阅我们的[安装指南](/getting-started/installing-cline)。

<Info>
**快速检查**：在 VS Code 中打开 Cline 面板。如果左下角显示了组织名称，就说明你已正确登录。
</Info>

**端点的 API 密钥或凭据**  
你需要 API 密钥或凭据，才能通过组织配置的端点进行身份验证。对于使用 Azure Identity Authentication 的 Azure Foundry 部署，可能会改用你的 Azure AD 凭据。

<Note>
如果你不确定要使用哪些凭据，请咨询管理员或 IT 团队，了解组织如何配置访问权限。
</Note>

## 配置步骤

<Steps>
<Step title="打开 Cline 设置">
打开 VS Code，并使用以下任一方式访问 Cline 设置面板：

- 点击 Cline 面板中的设置图标 (⚙️)
- 点击聊天区域正下方的 API 提供商下拉菜单

</Step>

<Step title="配置凭据">
身份验证方式取决于管理员配置端点的方式：

<AccordionGroup>
<Accordion title="API 密钥身份验证">
对于大多数 OpenAI 兼容端点：

1. 选择或确认已选择 **OpenAI Compatible** 提供商
2. 在 **API 密钥**字段中输入 API 密钥
3. 基础 URL、自定义标头和其他设置已由管理员预先配置
4. 点击**保存**以存储凭据

<Tip>
API 密钥存储在本地，并且仅供 Cline 扩展使用。
</Tip>
</Accordion>

<Accordion title="Azure Identity Authentication (Azure Foundry)">
如果组织使用 Azure AD 身份验证：

1. 选择或确认已选择 **OpenAI Compatible** 提供商
2. 确保已在开发环境中登录 Azure
3. 扩展将自动使用你的 Azure AD 凭据
4. 启用 Azure Identity Authentication 后，无需 API 密钥

<Note>
你可能需要安装 Azure Account 扩展或 Azure CLI 才能解析凭据。
</Note>
</Accordion>
</AccordionGroup>

<Note>
基础 URL、自定义标头、Azure API 版本和 Azure Identity 设置已由管理员预先配置，无需在扩展中设置。
</Note>
</Step>

<Step title="验证配置">
配置凭据后，由管理员控制的设置将被锁定（显示锁定图标 🔒），因为它们由组织管理。
</Step>

<Step title="测试连接">
在 Cline 中发送一条测试消息，验证你的凭据能否与已配置的端点正常配合使用。

<Tip>
**测试建议**

先尝试 "Hello" 这样的简单测试来验证基本连接，然后再开始开发任务。
</Tip>
</Step>
</Steps>

## 故障排除

**OpenAI Compatible 未作为提供商选项显示**  
确认你已登录正确的 Cline 组织。验证管理员已保存配置，并且你使用的是最新版本的 Cline 扩展。

**身份验证错误（"Access Denied" 或 "Invalid API Key"）**  
验证 API 密钥正确且有效。对于使用 Azure Identity Authentication 的 Azure Foundry，请确保已在开发环境中登录 Azure，并且你的账号在 Azure OpenAI 资源上具有适当的角色分配。

**连接错误或超时**  
端点 URL 由管理员配置。如果遇到连接问题，请向 IT 团队咨询网络要求（VPN、防火墙规则等）。

**模型不可用**  
可用模型取决于组织的端点配置。如果预期的模型未出现在模型下拉菜单中，请联系管理员。

**配置更改未保留**  
确保保存凭据。基础 URL 和其他由管理员控制的设置无法在本地更改。

## 安全最佳实践

使用 API 凭据时：

- 确保 API 密钥安全，不要共享
- 切勿将凭据存储在代码或版本控制中
- 如果怀疑密钥泄露，请立即报告给管理员
- 遵循组织针对已配置端点的使用准则

组织管理员控制可用的端点、模型和设置。扩展将根据组织的远程配置自动应用已配置的设置。

对于 Azure Foundry，请参阅 [Azure OpenAI Service 文档](https://learn.microsoft.com/en-us/azure/ai-services/openai/)。对于其他端点，请查阅组织的内部文档或联系管理员。
