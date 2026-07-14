---
title: "配置 AWS Bedrock 提供商（管理员）"
sidebarTitle: "配置 AWS Bedrock（管理员）"
description: "本指南说明管理员如何将 AWS Bedrock 配置为整个组织的 Cline LLM 提供商。"
---


作为管理员，您可以通过托管的管理控制台，将 AWS Bedrock 添加为所有 Cline 用户在整个组织范围内使用的 LLM 提供商。这种集中式方法通过区域控制和基本配置选项，在满足组织安全性与合规性要求的同时，确保对 Amazon AI 模型的一致访问。

## 开始之前

要开始将 AWS Bedrock 设置为组织的 LLM 提供商，您需要准备好几个项目。 

**Cline Admin 控制台的管理员访问权限**  
您需要管理员权限，才能在整个组织内强制执行提供商设置。如果您可以在 [app.cline.bot](https://app.cline.bot) 的管理控制台中导航至 **Settings → Cline Settings**，则说明您拥有正确的访问级别。


**具备适当权限的 AWS Bedrock 账号**  
您的 AWS 账号需要特定的 Bedrock 权限才能与 Cline 配合使用。 

<Note>
如果您无法直接访问 AWS，请先与云团队协调设置这些权限，然后再继续操作。
</Note>

**您的首选 AWS 区域**  
请谨慎选择主要 AWS 区域，因为该区域将对所有用户强制执行。

<Tip>
请先检查您所在区域提供哪些模型。某些较新的模型可能尚未在所有区域提供。
</Tip>

<Frame>
	<img
		src="https://assets.int.cline.bot/assets/AWS%20Remote%20Config.gif"
	/>
</Frame>

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

<Step title="选择 AWS Bedrock 作为 API 提供商">
打开 **API Provider** 下拉菜单并选择 **Amazon Bedrock**。这将打开 Bedrock 配置面板，您将在其中配置所有组织范围的设置。
</Step>

<Step title="配置 Bedrock 设置">
配置面板包含多个用于控制 Bedrock 在您组织中如何运作的设置。请根据需要进行配置：

<AccordionGroup>
<Accordion title="区域（必填）">
输入首选 AWS 区域，例如 `us-west-2` 或 `us-east-1`。该区域将对所有组织成员强制执行。

[查看 AWS Global Infrastructure](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/)

<Tip>
对于大多数组织，建议使用 `us-east-1` 或 `us-west-2`，因为这些区域提供的模型最为丰富。
</Tip>
</Accordion>

<Accordion title="自定义 VPC 端点（可选）">
如果您的组织使用 Bedrock 的私有 VPC 端点，请在此处指定，以确保所有 API 调用都通过您的网络基础设施进行。

[详细了解 AWS PrivateLink](https://docs.aws.amazon.com/vpc/latest/userguide/endpoint-services-overview.html)
</Accordion>

<Accordion title="跨区域推理（可选）">
启用此选项后，当主要区域面临容量限制时，Bedrock 可自动将请求路由到其他区域。这有助于在高需求期间保持可用性。

[详细了解 Inference Profiles](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-support.html)
</Accordion>

<Accordion title="全局推理配置文件（可选）">
开启此选项可使用 AWS 的全局推理路由，该功能会根据可用性和延迟自动将请求定向到最佳区域。
</Accordion>

<Accordion title="提示词缓存（可选）">
启用提示词缓存以降低成本和延迟。Bedrock 会缓存不同请求中保持一致的提示词部分，使重复交互更快、成本更低。

[详细了解 Prompt Caching](https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-caching.html)
</Accordion>
</AccordionGroup>
</Step>

<Step title="保存配置">
配置设置后，关闭提供商配置面板，然后点击设置页面上的 **Save** 以保存更改。

保存后，所有已登录 Cline 扩展的组织成员将自动使用采用您所配置设置的 AWS Bedrock。他们将无法选择其他提供商，也无法切换到个人 Cline 账号。

<Warning>
启用远程配置后，成员无法切换到个人 Cline 账号或加入其他组织。这可确保整个团队使用一致的提供商。
</Warning>
</Step>
</Steps>

## 验证

要验证配置：

1. 检查 Enabled provider 字段中的提供商是否显示为 "Amazon Bedrock"
2. 确认刷新页面后设置仍然保留
3. 使用成员账号进行测试，确保他们只能看到 Bedrock 提供商

## 故障排除

**成员看不到已配置的提供商**  
确保关闭配置面板后点击了 Save。验证成员账号是否属于正确的组织。

**配置更改未保留**  
请务必点击主设置页面上的 Save 按钮，而不只是关闭配置面板。

**之后需要更改区域**  
您可以随时更新区域。成员需要确保其本地 AWS 凭证有权访问新区域。有关更多信息，请参阅 [AWS Bedrock 文档](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html)。

有关更多详细信息，请参阅 [AWS Bedrock 文档](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html)，并与您的内部云团队协调。
