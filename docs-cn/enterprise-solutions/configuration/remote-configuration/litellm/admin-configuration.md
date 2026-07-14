---
title: "配置 LiteLLM 提供商（管理员）"
sidebarTitle: "配置 LiteLLM（管理员）"
description: "本指南说明管理员如何将 LiteLLM 配置为 Cline 的组织级 LLM 提供商。"
---


作为管理员，你可以通过托管式管理控制台，将 LiteLLM 添加为供所有 Cline 用户使用的组织级 LLM 提供商。这种集中式方法可通过你的 LiteLLM 代理接口统一访问多个 AI 模型。

## 开始之前

要开始将 LiteLLM 设置为组织的 LLM 提供商，你需要先准备好几项内容。

**Cline 管理控制台的管理员访问权限**  
你需要管理员权限，才能在整个组织内强制实施提供商设置。如果你可以在 [app.cline.bot](https://app.cline.bot) 的管理控制台中导航至**设置 → Cline 设置**，就说明你拥有正确的访问级别。

<Info>
**快速检查**：现在尝试访问设置页面。如果你能看到提供商配置选项，就可以继续了。
</Info>

**正在运行的 LiteLLM 代理实例**  
你需要一个团队可以访问的已部署 LiteLLM 代理。它可以自行托管，也可以通过云提供商管理。

<Note>
如果你尚未部署 LiteLLM，请与基础设施团队合作设置 LiteLLM 代理实例。
</Note>

**LiteLLM 端点详细信息**  
你需要 LiteLLM 代理的基础 URL；如果部署需要身份验证，还可以准备主密钥。

<Tip>
确保团队的开发环境可以访问 LiteLLM 代理，并且代理中已配置你希望提供的模型。
</Tip>

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

<Step title="选择 LiteLLM 作为 API 提供商">
打开 **API 提供商**下拉菜单，然后选择 **LiteLLM**。这将打开 LiteLLM 配置面板，你可以在其中配置所有组织级设置。
</Step>

<Step title="配置 LiteLLM 设置">
配置面板包含用于控制 LiteLLM 在组织中工作方式的设置：

<AccordionGroup>
<Accordion title="基础 URL（必填）">
输入 LiteLLM 代理端点 URL。它应是 LiteLLM 代理可访问的完整 URL，例如 `https://litellm.yourcompany.com` 或 `http://your-proxy:4000`。

<Tip>
为确保安全，请在生产环境中使用 HTTPS 端点。确保团队的开发环境可以访问该 URL。
</Tip>
</Accordion>

<Accordion title="主密钥（可选）">
如果 LiteLLM 代理要求身份验证，请在此处输入主密钥。它将用于对所有组织成员发出的请求进行身份验证。

<Note>
**集中式 API 密钥管理**：通过在组织级别配置主密钥，你可以启用集中式 API 密钥管理。组织成员无需管理各自的 API 密钥——访问权限完全通过此集中式配置进行管理。
</Note>

<Warning>
主密钥可提供对 LiteLLM 代理的完整访问权限。仅当代理要求身份验证且你希望集中管理密钥时，才输入此密钥。
</Warning>
</Accordion>
</AccordionGroup>
</Step>

<Step title="保存配置">
配置完设置后，关闭提供商配置面板，然后点击设置页面上的**保存**以保留更改。

保存后，所有已登录 Cline 扩展的组织成员都将自动使用采用你所配置设置的 LiteLLM。他们将无法选择其他提供商，也无法切换到个人 Cline 账号。

<Warning>
启用远程配置后，成员无法切换到个人 Cline 账号或加入其他组织。这可确保整个团队使用一致的提供商。
</Warning>
</Step>
</Steps>

## 验证

要验证配置：

1. 检查已启用的提供商字段中是否显示 "LiteLLM"
2. 确认刷新页面后设置仍然保留
3. 使用成员账号进行测试，确保他们只能看到 LiteLLM 这一个提供商
4. 验证模型下拉菜单中是否提供已配置的模型

## 故障排除

**成员看不到已配置的提供商**  
确保关闭配置面板后点击了保存。验证成员账号属于正确的组织，并且其网络可以访问 LiteLLM 代理。

**连接 LiteLLM 代理时出错**  
验证基础 URL 是否正确且可以访问。检查防火墙或安全组是否允许从团队的 IP 地址或开发环境进行访问。

**身份验证失败**  
如果使用主密钥，请验证输入是否正确，以及它在 LiteLLM 部署中是否拥有适当权限。检查 LiteLLM 代理日志中是否存在身份验证错误。

**模型不可用**  
确认模型已在 LiteLLM 代理部署中正确配置。可用模型取决于 LiteLLM 代理的配置方式。

**配置更改未保留**  
确保点击主设置页面上的保存按钮，而不是仅关闭配置面板。

**之后需要更改端点或密钥**  
你可以随时更新这些设置。更改会立即对所有组织成员生效。

有关 LiteLLM 部署和配置的更多详细信息，请参阅 [LiteLLM 文档](https://docs.litellm.ai/)，并与你的基础设施团队协调。
