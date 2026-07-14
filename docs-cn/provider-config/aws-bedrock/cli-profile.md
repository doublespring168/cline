---
title: "CLI 配置文件（SSO）"
sidebarTitle: "CLI 配置文件（SSO）"
description: "配置 AWS Bedrock，以使用 AWS CLI 配置文件在 Cline 中进行身份验证。最适合 SSO/联合角色和安全的企业访问。"
---

### 概述

Cline 提供使用 AWS 凭据或 AWS 配置文件访问 AWS Bedrock 服务的选项。建议使用 SSO/联合角色，而非旧版 IAM 配置；本指南介绍如何配置环境，使 Cline 使用 SSO 角色进行身份验证。

---

### 配置步骤

1. 安装[最新版本](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)的 AWS CLI

    - 按照 AWS 文档安装适用于你的操作系统的 AWS CLI 版本

2. 使用 AWS CLI [配置 IAM 身份验证](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html)

    - 如果你尚未通过 IAM Identity Center 获得 AWS 访问权限，请按照 [IAM 用户指南](https://docs.aws.amazon.com/singlesignon/latest/userguide/getting-started.html)设置 IAM 用户和角色。确保你拥有 `PowerUserAccess` 角色。
    - 如果你通过雇主获得 AWS 访问权限，请打开你的 AWS 访问门户并找到相应账户。确保你拥有 `PowerUserAccess` 权限。
    - 打开 `Access keys` 链接，并记下下一步所需的 `SSO start URL` 和 `SSO region`

3. 继续使用 [`aws configure sso` CLI 向导](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html#cli-configure-sso-configure)配置你的配置文件

    - 配置完成后，使用以下命令对 AWS CLI 进行身份验证：`aws sso login --profile <AWS-profile-name>`
    - 记下与你的 AWS 账户关联的配置文件名称，后续步骤中配置 Cline 时需要该名称

4. 如果尚未安装，请安装 VS Code 和 Cline 扩展。有关指导，请参阅[入门](/getting-started/installing-cline)页面。

5. 打开 Cline 扩展，然后点击设置按钮 ⚙️ 选择 API 提供商。
    - 从 API Provider（API 提供商）下拉菜单中选择 AWS Bedrock
    - 选择 AWS Profile（AWS 配置文件）单选按钮，然后输入步骤 3 中的 AWS Profile Name（AWS 配置文件名称）
    - 从下拉菜单中选择你的 AWS Region（AWS 区域）
    - 某些模型需要选中跨区域推理复选框

<Frame>
	<img
		src="https://storage.googleapis.com/cline_public_images/docs/assets/cline-aws-setup-markup%20(1).png"
		alt="Cline 设置中的 AWS Bedrock 配置，显示配置文件身份验证设置"
	/>
</Frame>
