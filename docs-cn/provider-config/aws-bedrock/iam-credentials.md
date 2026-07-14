---
title: "IAM 凭据"
sidebarTitle: "IAM 凭据"
description: "使用 IAM 访问密钥（Access Key）和秘密访问密钥（Secret Key）凭据在 Cline 中设置 AWS Bedrock。最适合已建立 IAM 策略的企业环境。"
---

### 概述

-   **AWS Bedrock：** 一项完全托管的服务，通过 AWS 提供对领先生成式 AI 模型（例如 Anthropic Claude、Amazon Nova）的访问。\
    [详细了解 AWS Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html)。
-   **Cline：** 一款 VS Code 扩展，通过与 AI 模型集成充当编码助手，使开发者能够生成代码、调试和分析数据。
-   **面向企业：** 本指南专为已建立 AWS 环境（使用 IAM 角色、AWS SSO、AWS Organizations 等）的组织编写，以确保安全且合规的使用。

---

### 第 1 步：准备你的 AWS 环境

#### 1.1 创建或使用 IAM 角色/用户

1. **登录 AWS 管理控制台：**\
   [AWS 控制台](https://aws.amazon.com/console/)
2. **访问 IAM：**
    - 在 AWS 控制台中搜索 **IAM（身份和访问管理）**。
    - 创建新的 IAM 用户，或使用企业的 AWS SSO 代入专用于 Bedrock 访问的角色。
    - [AWS IAM 用户指南](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html)

#### 1.2 附加所需策略

为确保 Cline 可以与 AWS Bedrock 交互，你的 IAM 用户或角色需要特定权限。虽然 `AmazonBedrockLimitedAccess` 托管策略提供全面访问权限，但若要按照最小权限原则进行更受限、更安全的设置，以下最低权限足以支持 Cline 的核心模型调用功能：

-   `bedrock:InvokeModel`
-   `bedrock:InvokeModelWithResponseStream`

你可以使用这些权限创建自定义 IAM 策略，并将其附加到你的 IAM 用户或角色。

**选项 1：最低权限（建议用于生产环境和最小权限原则）**

1.  在 AWS IAM 控制台中创建新策略。
2.  使用 JSON 编辑器添加以下策略文档：
    ```json
    {
    	"Version": "2012-10-17",
    	"Statement": [
    		{
    			"Effect": "Allow",
    			"Action": ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"],
    			"Resource": "*" // For enhanced security, scope this to specific model ARNs if possible.
    		}
    	]
    }
    ```
3.  为策略命名（例如 `ClineBedrockInvokeAccess`），并将其附加到你的 IAM 用户或角色。

**选项 2：使用托管策略（更简单的初始设置）**

-   你也可以附加 AWS 托管策略 **`AmazonBedrockLimitedAccess`**。这会授予更广泛的权限，包括列出模型、管理预置容量和使用其他 Bedrock 功能的能力。对于初始设置，或者当你需要这些更广泛的能力时，这种方式可能更简单。
    [查看 AmazonBedrockLimitedAccess 策略详情](https://docs.aws.amazon.com/bedrock/latest/userguide/security-iam.html)

**重要注意事项：**

-   **Cline 中的模型列表：** 如果你在 Cline 设置中直接指定 Model ID，最低权限（`bedrock:InvokeModel`、`bedrock:InvokeModelWithResponseStream`）足以让 Cline _使用_模型。如果你依赖 Cline 动态列出可用的 Bedrock 模型，可能还需要 `bedrock:ListFoundationModels` 等其他权限。
-   **AWS Marketplace 订阅：** 对于第三方模型（例如 Anthropic Claude），请确保你拥有有效的 AWS Marketplace 订阅。这通常在 AWS Bedrock 控制台的 "Model access（模型访问）" 下管理；如果尚未处理，可能需要 `aws-marketplace:Subscribe` 权限。
-   _企业提示：_ 始终采用最小权限实践。在可行的情况下，将 IAM 策略中的资源 ARN 限定到特定模型或区域。使用[服务控制策略（SCP）](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html)在 AWS Organizations 中实施整体治理。

---

### 第 2 步：验证区域访问权限

#### 2.1 选择并确认区域

1. **选择区域：**\
   AWS Bedrock 可在多个区域使用（例如美国东部、欧洲、亚太地区）。选择满足你的延迟和合规需求的区域。\
   [AWS 全球基础设施](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/)
2. **验证模型访问权限：**
    - 在 AWS Bedrock 控制台中，确认你的团队所需模型（例如 Anthropic Claude、Amazon Nova）标记为 "Access granted（已授予访问权限）"。
    - **注意：** 如果某些高级模型无法按需使用，可能需要[推理配置文件（Inference Profile）](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-support.html)。

#### 2.2 设置 AWS Marketplace 订阅（如需要）

1. **订阅第三方模型：**
    - 前往 AWS Bedrock 控制台并找到模型订阅部分。
    - 对于第三方提供商的模型（例如 Anthropic），接受条款以完成订阅。
    - [AWS Marketplace](https://aws.amazon.com/marketplace/)
2. **企业提示：**
    - 模型订阅通常由中心团队管理。请与你的云团队确认是否已有标准订阅流程。

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
3. **输入你的 AWS 凭据：**
    - 输入你的 **Access Key（访问密钥）** 和 **Secret Key（秘密访问密钥）**（如果使用 AWS SSO，也可以使用临时凭据）。
    - 指定正确的 **AWS Region**（例如 `us-east-1` 或企业批准的区域）。
4. **选择提供商模型：**
5. **保存并测试：**
    - 点击 **Done/Save（完成/保存）** 应用设置。
    - 发送一个简单的提示词来测试集成（例如 "生成一个用于检查数字是否为质数的 Python 函数。"）。

---

### 第 4 步：安全、监控和最佳实践

1. **安全访问：**
    - 优先使用 AWS SSO/联合角色，而不是长期 IAM 凭据。
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
