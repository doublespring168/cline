---
title: "在 VS Code 中配置 AWS Bedrock（成员）"
sidebarTitle: "配置 AWS Bedrock（成员）"
description: "管理员完成设置后，工程师在 VS Code 中配置 AWS Bedrock 凭证的指南"
---

作为团队成员，您可以将本地开发环境连接到组织的 AWS Bedrock 设置。本指南将引导您在 VS Code 中配置 AWS 凭证，以便通过组织的 Bedrock 基础设施开始使用模型。您的管理员已经配置了提供商设置 — 您只需添加凭证即可开始使用。

## 开始之前

要成功连接到组织的 AWS Bedrock 设置，您需要准备好几项内容。

**已安装并配置 Cline 扩展**  
必须在 VS Code 中安装 Cline 扩展，并且您需要登录组织账号。如果尚未安装 Cline，请按照我们的[安装指南](/getting-started/installing-cline)操作。

<Info>
**快速检查**：在 VS Code 中打开 Cline 面板。如果左下角显示您的组织名称，则说明您已正确登录。
</Info>

**具有 Bedrock 访问权限的 AWS 凭证**  
您需要拥有可访问组织配置区域中 Bedrock 的 AWS 凭证。

<Note>
如果您还没有 AWS 凭证，请联系 IT 或云团队，获取访问密钥或配置具有必要 Bedrock 权限的 AWS CLI 配置文件。
</Note>


<Frame>
	<img
		src="https://assets.int.cline.bot/assets/VS%20Code%20Bedrock%20API%20Key.gif"
	/>
</Frame>

## 配置步骤

<Steps>
<Step title="打开 Cline 设置">
打开 VS Code，并使用以下任一方法访问 Cline 设置面板：

- 点击 Cline 面板中的设置图标（⚙️）
- 点击聊天区域正下方的 API Provider 下拉菜单（将显示为 `bedrock.anthropic.claude-sonnet-4-20250514-v1:0` 或类似内容）

</Step>

<Step title="选择您的身份验证方式">
选择以下凭证方式之一，以便向 AWS Bedrock 进行身份验证：

<AccordionGroup>
<Accordion title="AWS Bedrock API 密钥">
使用专用于 Bedrock 访问的 AWS 访问密钥。

[详细了解 AWS Bedrock API 密钥](https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html)

1. 选择 **API Key** 单选按钮
2. 输入您的 AWS Access Key ID 和 Secret Access Key
3. 这些凭证存储在本地，并且仅供 VS Code 扩展使用
</Accordion>

<Accordion title="AWS Profile">
使用计算机上配置的现有 AWS CLI 配置文件。

[详细了解 AWS CLI Profiles](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html)

1. 选择 **AWS Profile** 单选按钮
2. 从 `~/.aws/credentials` 文件中选择或输入配置文件名称
3. Cline 将使用与该配置文件关联的凭证
</Accordion>

<Accordion title="AWS Credentials">
使用默认 AWS 凭证链（环境变量、EC2 实例角色等）。

1. 选择 **AWS Credentials** 单选按钮
2. Cline 将使用标准 AWS 凭证提供商链，自动检测您环境中的凭证
</Accordion>
</AccordionGroup>

<Note>
AWS Region 已由管理员预先配置，无需在扩展中设置。
</Note>
</Step>

<Step title="验证配置">
选择身份验证方式后，扩展将为已启用的功能显示复选标记：

- ✓ 支持图像
- ✓ 支持浏览器使用
- ✓ 支持提示词缓存

跨区域推理和全局推理配置文件等其他设置将被锁定（显示锁定图标 🔒），因为它们由管理员控制。
</Step>

<Step title="测试连接">
在 Cline 中发送测试消息，以验证您的凭证能否与配置的 Bedrock 区域正常配合使用。

<Tip>
**测试建议**

建议在 plan 模式下测试连接，以验证一切都能正常运行，然后再将其用于实际任务。
</Tip>
</Step>
</Steps>


## 故障排除

**身份验证错误（"Access Denied" 或 "Invalid Credentials"）**  
验证您选择的凭证方式是否具有在配置区域中调用 Bedrock 所需的 IAM 权限。所需权限包括 `bedrock:InvokeModel` 和 `bedrock:InvokeModelWithResponseStream`。有关更多信息，请参阅 [AWS Bedrock IAM 权限](https://docs.aws.amazon.com/bedrock/latest/userguide/security-iam.html)。

**区域相关错误或 "model not available"**  
请管理员确认组织配置的是哪个区域。确保您的 AWS 凭证有权访问该特定区域中的 Bedrock。[查看 AWS 全球基础设施](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/)

**未看到 AWS Bedrock 选项**  
确认您已登录正确的 Cline 组织。验证管理员已保存 Bedrock 配置。请尝试退出扩展后重新登录。

**AWS Credentials 选项找不到凭证**  
验证是否已安装 AWS CLI，并使用 `aws configure` 进行配置（[AWS CLI 安装指南](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)）。检查 `~/.aws/credentials` 中是否存在凭证。对于 EC2/ECS 环境，请确保已正确附加 IAM 角色。如果使用环境变量，请设置 `AWS_ACCESS_KEY_ID` 和 `AWS_SECRET_ACCESS_KEY`。


## 安全最佳实践

配置 AWS 凭证时，请遵循以下安全准则：

- 使用具有最低所需权限的 IAM 角色（[AWS IAM 最佳实践](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)）
- 如果使用 API Key 方式，请定期轮换访问密钥
- 切勿将凭证存储在代码或版本控制中
- 优先使用 AWS Profile 方式，以更好地管理凭证
- 考虑使用 AWS SSO/联合角色来增强安全性

您的组织管理员控制可用的模型。扩展将根据您所在区域的 Bedrock 配置自动显示可用模型。有关可用模型的更多信息，请参阅 [AWS Bedrock 模型访问文档](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html)。

如需进一步帮助，请参阅 [AWS Bedrock 文档](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html)，并与您组织的云管理员协调。
