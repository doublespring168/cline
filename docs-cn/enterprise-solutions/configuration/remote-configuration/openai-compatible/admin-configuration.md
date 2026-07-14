---
title: "配置 OpenAI 兼容提供商（管理员）"
sidebarTitle: "配置 OpenAI 兼容提供商（管理员）"
description: "本指南说明管理员如何将 OpenAI 兼容端点配置为 Cline 的组织级 LLM 提供商。"
---


作为管理员，你可以通过托管式管理控制台，将 OpenAI 兼容端点添加为供所有 Cline 用户使用的组织级 LLM 提供商。这涵盖任何公开 OpenAI 兼容 API 的提供商，包括 Azure Foundry (Azure OpenAI)、自行托管的推理引擎 (vLLM, TGI) 以及其他兼容服务。

## 开始之前

要开始为组织设置 OpenAI 兼容提供商，你需要先准备好几项内容。

**Cline 管理控制台的管理员访问权限**  
你需要管理员权限，才能在整个组织内强制实施提供商设置。如果你可以在 [app.cline.bot](https://app.cline.bot) 的管理控制台中导航至**设置 → Cline 设置**，就说明你拥有正确的访问级别。

**OpenAI 兼容 API 端点**  
你需要一个实现 OpenAI 聊天补全 API 的运行中端点。它可以是：
- Azure Foundry (Azure OpenAI Service)
- 自行托管的推理引擎 (vLLM, text-generation-inference, etc.)
- 任何提供 OpenAI 兼容 API 的第三方服务

<Note>
如果你使用 Azure Foundry，则需要 Azure OpenAI 端点 URL，还可能需要 API 版本。请与 Azure 管理员合作，确保已预配该端点且可以访问。
</Note>

**端点 URL 和身份验证详细信息**  
你需要端点的基础 URL 和任何必需的身份验证标头。

## 配置步骤

<Steps>
<Step title="访问 Cline 设置">
导航至 [app.cline.bot](https://app.cline.bot)，使用管理员账号登录。前往**设置 → Cline 设置**。

<Info>
如果你拥有正确的管理员访问级别，应该会看到提供商配置选项。
</Info>
</Step>

<Step title="启用远程提供商配置">
开启**启用设置**，以显示远程提供商配置选项。这样，你便可以在整个组织内强制实施提供商设置。
</Step>

<Step title="选择 OpenAI Compatible 作为 API 提供商">
打开 **API 提供商**下拉菜单，然后选择 **OpenAI Compatible**。这将打开配置面板，你可以在其中配置所有组织级设置。
</Step>

<Step title="配置 OpenAI 兼容设置">
配置面板包含用于控制提供商在组织中工作方式的设置：

<AccordionGroup>
<Accordion title="基础 URL（必填）">
输入 OpenAI 兼容端点的基础 URL。示例：

- **Azure Foundry**：`https://your-resource.openai.azure.com`
- **自行托管的 vLLM**：`https://inference.yourcompany.com/v1`
- **其他兼容服务**：提供商的 API 基础 URL

<Tip>
为确保安全，请在生产环境中使用 HTTPS 端点。确保团队的开发环境可以访问该 URL。
</Tip>
</Accordion>

<Accordion title="自定义标头（可选）">
添加将随每个 API 请求一同发送的自定义 HTTP 标头。适用场景包括：

- API 密钥以外的自定义身份验证方案
- 内部负载均衡器的路由标头
- 端点要求的组织或租户标识符

标头以键值对的形式配置。
</Accordion>

<Accordion title="Azure API 版本（可选 — 仅限 Azure Foundry）">
如果你使用 Azure Foundry (Azure OpenAI)，请指定 API 版本字符串。例如：`2024-02-15-preview` 或 `2024-06-01`。

仅 Azure OpenAI 部署需要此字段。对于非 Azure 端点，请将其留空。

<Note>
请查看 [Azure OpenAI API 版本文档](https://learn.microsoft.com/en-us/azure/ai-services/openai/reference)，了解可用版本。
</Note>
</Accordion>

<Accordion title="Azure Identity Authentication（可选 — 仅限 Azure Foundry）">
启用此选项可使用基于 Azure Active Directory (Entra ID) 令牌的身份验证，而不使用 API 密钥。启用后，成员将使用自己的 Azure AD 凭据进行身份验证，而不是静态 API 密钥。

此字段仅适用于 Azure Foundry 部署。
</Accordion>
</AccordionGroup>
</Step>

<Step title="保存配置">
配置完设置后，关闭提供商配置面板，然后点击设置页面上的**保存**以保留更改。

保存后，所有已登录 Cline 扩展的组织成员都将自动使用采用你所配置设置的 OpenAI Compatible 提供商。他们将无法选择其他提供商，也无法切换到个人 Cline 账号。

<Warning>
启用远程配置后，成员无法切换到个人 Cline 账号或加入其他组织。这可确保整个团队使用一致的提供商。
</Warning>
</Step>
</Steps>

## Azure Foundry 配置

对于使用 Azure Foundry (Azure OpenAI Service) 的组织，请使用以下配置：

1. **基础 URL**：你的 Azure OpenAI 端点（例如 `https://your-resource.openai.azure.com`）
2. **Azure API 版本**：要使用的 API 版本（例如 `2024-06-01`）
3. **Azure Identity Authentication**：如果组织使用 Azure AD 进行身份验证而不是 API 密钥，请启用此选项

## 验证

要验证配置：

1. 检查已启用的提供商字段中是否显示 "OpenAI Compatible"
2. 确认刷新页面后设置仍然保留
3. 使用成员账号进行测试，确保他们只能看到 OpenAI Compatible 提供商
4. 验证模型下拉菜单中是否提供已配置的模型

## 故障排除

**成员看不到已配置的提供商**  
确保关闭配置面板后点击了保存。验证成员账号属于正确的组织。

**连接端点时出错**  
验证基础 URL 是否正确，以及团队的开发环境是否可以访问。检查防火墙或安全组是否允许从开发者 IP 地址进行访问。

**Azure 身份验证失败**  
如果使用 Azure Identity Authentication，请验证成员的 Azure AD 账号是否在 Azure OpenAI 资源上具有适当的角色分配。如果使用 API 密钥，请验证成员输入的密钥是否正确。

**配置更改未保留**  
确保点击主设置页面上的保存按钮，而不是仅关闭配置面板。

**之后需要更改端点或设置**  
你可以随时更新这些设置。更改会立即对所有组织成员生效。

对于 Azure Foundry，请参阅 [Azure OpenAI Service 文档](https://learn.microsoft.com/en-us/azure/ai-services/openai/)。对于其他 OpenAI 兼容端点，请参阅提供商的文档。
