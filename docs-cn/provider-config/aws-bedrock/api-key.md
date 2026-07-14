---
title: "API 密钥（简单设置）"
sidebarTitle: "API 密钥"
description: "使用 Bedrock API 密钥在 Cline 中设置 AWS Bedrock。这是个人开发者访问前沿模型提供商的最简单设置方式。"
---

### 概述

-   **AWS Bedrock：** 一项完全托管的服务，通过 AWS 提供对领先生成式 AI 模型（例如 Anthropic Claude、Amazon Nova）的访问。\
    [详细了解 AWS Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html)。
-   **Cline：** 一款 VS Code 扩展，通过与 AI 模型集成充当编码助手，使开发者能够生成代码、调试和分析数据。
-   **面向开发者：** 本指南专为希望通过 AWS Bedrock 使用 API 密钥进行简化设置，从而访问前沿模型的个人开发者编写。

---

### 第 1 步：准备你的 AWS 环境

#### 1.1 个人用户设置 - 创建 Bedrock API 密钥

如需更详细的说明，请查看[文档](https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html)。

1. **登录 AWS 管理控制台：**\
   [AWS 控制台](https://aws.amazon.com/console/)
2. **访问 Bedrock 控制台：**
    - [Bedrock 控制台](https://console.aws.amazon.com/bedrock)
    - 创建一个新的长期 API 密钥。默认情况下，此 API 密钥将拥有 `AmazonBedrockLimitedAccess` IAM 策略。
      [查看 AmazonBedrockLimitedAccess 策略详情](https://docs.aws.amazon.com/bedrock/latest/userguide/security-iam.html)

#### 1.2 创建或修改策略

为确保 Cline 可以与 AWS Bedrock 交互，你的 IAM 用户或角色需要特定权限。虽然 `AmazonBedrockLimitedAccess` 托管策略提供全面访问权限，但若要按照最小权限原则进行更受限、更安全的设置，以下最低权限足以支持 Cline 的核心模型调用功能：

-   `bedrock:InvokeModel`
-   `bedrock:InvokeModelWithResponseStream`
-   `bedrock:CallWithBearerToken`

你可以使用这些权限创建自定义 IAM 策略，并将其附加到你的 IAM 用户或角色。

1.  在 AWS IAM 控制台中创建新策略。
2.  使用 JSON 编辑器添加以下策略文档：
    ```json
    {
    	"Version": "2012-10-17",
    	"Statement": [
    		{
    			"Effect": "Allow",
    			"Action": ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream", "bedrock:CallWithBearerToken"],
    			"Resource": "*" // For enhanced security, scope this to specific model ARNs if possible.
    		}
    	]
    }
    ```
3.  为策略命名（例如 `ClineBedrockInvokeAccess`），并将其附加到与你创建的密钥关联的 IAM 用户。IAM 用户与 API 密钥具有相同的前缀。

**重要注意事项：**

-   **Cline 中的模型列表：** 如果你在 Cline 设置中直接指定 Model ID，最低权限（`bedrock:InvokeModel`、`bedrock:InvokeModelWithResponseStream`）足以让 Cline _使用_模型。如果你依赖 Cline 动态列出可用的 Bedrock 模型，可能还需要 `bedrock:ListFoundationModels` 等其他权限。
-   **AWS Marketplace 订阅：** 对于第三方模型（例如 Anthropic Claude），**`AmazonBedrockLimitedAccess`** 策略会授予你通过 AWS Marketplace 订阅所需的权限。无需显式启用访问权限。对于 Anthropic 模型，你仍需通过控制台提交首次使用（FTU）表单。如果 Cline 聊天中出现以下消息 `[ERROR] Failed to process response: Model use case details have not been submitted for this account. Fill out the Anthropic use case details form before using the model.`，请打开 [AWS Bedrock 控制台中的 Playground](https://console.aws.amazon.com/bedrock/home?#/text-generation-playground)，选择任意 Anthropic 模型并填写表单（可能需要先发送提示词）

---

### 第 2 步：验证区域访问权限

#### 2.1 选择并确认区域

1. **选择区域：**\
   AWS Bedrock 可在多个区域使用（例如美国东部、欧洲、亚太地区）。选择满足你的延迟和合规需求的区域。\
   [AWS 全球基础设施](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/)
2. **验证模型访问权限：**
    - **注意：** 某些模型只能通过[推理配置文件（Inference Profile）](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-support.html)访问。在这种情况下，请选中 "Cross Region Inference（跨区域推理）" 框。

---

### 第 3 步：配置 Cline VS Code 扩展

#### 3.1 安装并打开 Cline

1. **安装 VS Code：**\
   从 [VS Code 网站](https://code.visualstudio.com/)下载。
2. **安装 Cline 扩展：**
    - 打开 VS Code。
    - 前往扩展市场（`Ctrl+Shift+X` 或 `Cmd+Shift+X`）。
    - 搜索 **Cline** 并安装。

#### 3.2 配置 Cline 设置

1. **打开 Cline 设置：**
    - 点击设置 ⚙️ 以选择 API 提供商。
2. **选择 AWS Bedrock 作为 API 提供商：**
    - 从 API Provider（API 提供商）下拉菜单中选择 **AWS Bedrock**。
3. **输入你的 AWS API 密钥：**
    - 输入你的 **API Key（API 密钥）**
    - 指定正确的 **AWS Region（AWS 区域）**（例如 `us-east-1` 或企业批准的区域）。
4. **选择提供商模型：**
5. **保存并测试：**
    - 点击 **Done/Save（完成/保存）** 应用设置。
    - 发送一个简单的提示词来测试集成（例如 "生成一个用于检查数字是否为质数的 Python 函数。"）。

---

### 第 4 步：安全、监控和最佳实践

1. **安全访问：**
    - 尽可能优先使用 AWS SSO/联合角色，而不是长期 API Key。
    - [AWS IAM 最佳实践](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
2. **增强网络安全：**
    - 考虑设置 [AWS PrivateLink](https://docs.aws.amazon.com/vpc/latest/userguide/endpoint-services-overview.html)，以安全连接到 Bedrock。
3. **监控和记录活动：**
    - 启用 AWS CloudTrail 以记录 Bedrock API 调用。
    - 使用 CloudWatch 监控调用次数、延迟和 token 用量等指标。
    - 为异常活动设置警报。
4. **处理错误和管理成本：**
    - 为限流错误实施指数退避。
    - 使用 AWS Cost Explorer 并设置账单警报以跟踪用量。\
      [AWS 成本管理](https://docs.aws.amazon.com/cost-management/latest/userguide/what-is-aws-cost-management.html)
5. **定期审计和合规：**
    - 定期检查 IAM 角色和 CloudTrail 日志。
    - 遵循内部数据隐私和治理策略。

---
