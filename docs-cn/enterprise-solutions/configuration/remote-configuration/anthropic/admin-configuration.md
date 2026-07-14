---
title: "配置 Anthropic 提供商（管理员）"
sidebarTitle: "配置 Anthropic（管理员）"
description: "本指南说明管理员如何将 Anthropic 配置为整个组织的 Cline LLM 提供商。"
---


作为管理员，您可以通过托管的管理控制台，将 Anthropic 添加为所有 Cline 用户在整个组织范围内使用的 LLM 提供商。这种集中式方法可直接访问 Anthropic 的 Claude 模型，并为通过代理路由流量的组织提供可选的自定义基础 URL。

## 开始之前

要开始将 Anthropic 设置为组织的 LLM 提供商，您需要准备好几个项目。

**Cline Admin 控制台的管理员访问权限**  
您需要管理员权限，才能在整个组织内强制执行提供商设置。如果您可以在 [app.cline.bot](https://app.cline.bot) 的管理控制台中导航至 **Settings → Cline Settings**，则说明您拥有正确的访问级别。

**Anthropic API 访问权限**  
您的组织需要拥有可通过 API 访问 Claude 模型的 Anthropic 账号。成员需要使用各自的 API 密钥进行身份验证。

<Note>
如果您的组织要求通过代理或自定义端点路由 API 流量，请在配置前准备好代理 URL。
</Note>

## 配置步骤

<Steps>
<Step title="访问 Cline 设置">
导航至 [app.cline.bot](https://app.cline.bot)，并使用您的管理员账号登录。前往 **Settings → Cline Settings**。

<Info>
如果您拥有正确的管理员访问级别，应当能看到提供商配置选项。
</Info>
</Step>

<Step title="启用远程提供商配置">
开启 **Enable settings**，以显示远程提供商配置选项。这样您便可以在整个组织内强制执行提供商设置。
</Step>

<Step title="选择 Anthropic 作为 API 提供商">
打开 **API Provider** 下拉菜单并选择 **Anthropic**。这将打开 Anthropic 配置面板，您将在其中配置所有组织范围的设置。
</Step>

<Step title="配置 Anthropic 设置">
配置面板包含用于控制 Anthropic 在您组织中如何运作的设置：

<AccordionGroup>
<Accordion title="基础 URL（可选）">
默认情况下，Cline 会直接连接到 Anthropic API（`https://api.anthropic.com`）。如果您的组织通过代理或自定义端点路由 API 流量，请在此处输入基础 URL。

自定义基础 URL 的使用场景：
- 记录或筛选 API 流量的企业代理
- 用于速率限制或访问控制的自托管 API 网关
- 区域路由要求

将此项留空即可使用默认 Anthropic API 端点。

<Tip>
如果使用代理，请确保其正确地将请求转发到 Anthropic API，并保留所有必需的标头。
</Tip>
</Accordion>
</AccordionGroup>
</Step>

<Step title="保存配置">
配置设置后，关闭提供商配置面板，然后点击设置页面上的 **Save** 以保存更改。

保存后，所有已登录 Cline 扩展的组织成员将自动使用采用您所配置设置的 Anthropic。他们将无法选择其他提供商，也无法切换到个人 Cline 账号。

<Warning>
启用远程配置后，成员无法切换到个人 Cline 账号或加入其他组织。这可确保整个团队使用一致的提供商。
</Warning>
</Step>
</Steps>

## 验证

要验证配置：

1. 检查 Enabled provider 字段中的提供商是否显示为 "Anthropic"
2. 确认刷新页面后设置仍然保留
3. 使用成员账号进行测试，确保他们只能看到 Anthropic 提供商
4. 验证模型下拉菜单中是否提供 Claude 模型

## 故障排除

**成员看不到已配置的提供商**  
确保关闭配置面板后点击了 Save。验证成员账号是否属于正确的组织。

**使用自定义基础 URL 时出现连接错误**  
验证代理 URL 是否正确，并且可以从团队的开发环境访问。确保代理正确地将请求转发到 Anthropic API。

**配置更改未保留**  
请务必点击主设置页面上的 Save 按钮，而不只是关闭配置面板。

**之后需要更改设置**  
您可以随时更新基础 URL 或其他设置。更改会立即对所有组织成员生效。

有关更多详细信息，请参阅 [Anthropic API 文档](https://docs.anthropic.com/)，并与您的基础设施团队协调。
