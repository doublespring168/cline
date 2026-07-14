---
title: "在 VS Code 中配置 Google Vertex AI（成员）"
sidebarTitle: "配置 Google Vertex（成员）"
description: "面向工程师的指南：管理员完成设置后，如何通过 VS Code 连接组织的 Google Vertex AI 设置"
---

作为团队成员，你可以将本地开发环境连接到组织的 Google Vertex AI 设置。本指南将引导你在 VS Code 中配置 Google Cloud 凭据，以便通过组织已配置的项目和区域设置开始使用 Vertex AI 模型。管理员已经配置好了提供商设置——你只需添加凭据即可开始使用。

## 开始之前

要成功连接到组织的 Google Vertex AI 设置，你需要提前准备好几项内容。

**已安装并配置 Cline 扩展**  
必须在 VS Code 中安装 Cline 扩展，并且你需要登录组织账号。如果尚未安装 Cline，请参阅我们的[安装指南](/getting-started/installing-cline)。

<Info>
**快速检查**：在 VS Code 中打开 Cline 面板。如果左下角显示了组织名称，就说明你已正确登录。
</Info>

**具有 Vertex AI 访问权限的 Google Cloud 凭据**  
你需要拥有相应权限的 Google Cloud 凭据，以便访问组织所配置项目和区域中的 Vertex AI。

<Note>
如果你不确定应使用哪种方式，请咨询管理员或 IT 团队，了解组织如何配置 Google Cloud 访问权限。
</Note>

## 配置步骤

<Steps>
<Step title="打开 Cline 设置">
打开 VS Code，并使用以下任一方式访问 Cline 设置面板：

- 点击 Cline 面板中的设置图标 (⚙️)
- 点击聊天区域正下方的 API 提供商下拉菜单（它将显示为 `vertex_ai/gemini-pro` 或类似内容）

</Step>

<Step title="选择身份验证方式">
选择以下任一凭据方式，通过 Google Vertex AI 进行身份验证：

<AccordionGroup>
<Accordion title="服务账号密钥">
使用服务账号 JSON 密钥文件访问 Vertex AI。

[详细了解服务账号密钥](https://cloud.google.com/iam/docs/service-accounts)

1. 选择**服务账号密钥**身份验证方式
2. 上传或粘贴服务账号 JSON 密钥内容
3. 该密钥应具有 `aiplatform.user` 或类似的 Vertex AI 权限
4. 这些凭据存储在本地，并且仅供 VS Code 扩展使用
</Accordion>

<Accordion title="Google Cloud SDK">
使用计算机上安装的 Google Cloud SDK 和已经过身份验证的账号。

[详细了解 Google Cloud SDK](https://cloud.google.com/sdk/docs/install)

1. 选择 **Google Cloud SDK** 身份验证方式
2. 确保已使用 `gcloud auth login` 完成身份验证
3. 验证你的账号是否有权访问组织的 Vertex AI 项目
4. Cline 将自动使用默认的 Google Cloud 凭据
</Accordion>

<Accordion title="应用默认凭据">
使用 Google Cloud 的应用默认凭据 (ADC) 链。

1. 选择**应用默认凭据**方式
2. 确保已在环境中正确配置 ADC
3. 这非常适合集中管理 Google Cloud 凭据的环境
4. Cline 将自动检测环境中的凭据
</Accordion>
</AccordionGroup>

<Note>
Google Cloud 项目 ID 和区域已由管理员预先配置，无需在扩展中设置。
</Note>
</Step>

<Step title="验证配置">
选择身份验证方式后，扩展将为已启用的功能显示复选标记：

- ✓ 支持图像（适用于 Gemini Pro Vision 和类似模型）
- ✓ 支持多模态输入
- ✓ 支持函数调用（适用于支持的模型）

项目 ID 和区域设置将被锁定（显示锁定图标 🔒），因为它们由管理员控制。
</Step>

<Step title="测试连接">
在 Cline 中发送一条测试消息，验证你的凭据能否在已配置的 Vertex AI 项目和区域中正常工作。

<Tip>
**测试建议**

先尝试 "Hello" 这样的简单测试来验证基本连接；如有需要，再通过共享图像测试多模态功能。
</Tip>
</Step>
</Steps>

## 模型使用

### 可用的模型系列
通过组织的 Vertex AI 设置可用的模型通常包括：

**Gemini 模型：**
- **Gemini Pro**：高级推理、代码生成和多模态能力
- **Gemini Pro Vision**：图像理解和视觉问答
- **Gemini Ultra**：用于复杂推理任务的最强模型

**PaLM 模型：**
- **PaLM 2 for Text**：文本生成和补全
- **PaLM 2 for Chat**：对话式 AI 交互
- **Codey**：专门用于代码生成和解释

**专用模型：**
- **Text Embedding**：用于语义搜索和相似性任务  
- **自定义模型**：组织的微调变体（如有）

### 模型选择策略
根据开发需求选择模型：

- **常规任务**：大多数文本和推理任务使用 Gemini Pro
- **视觉内容**：处理图像时使用 Gemini Pro Vision
- **代码密集型工作**：编程任务使用 Codey 模型
- **复杂推理**：复杂问题求解使用 Gemini Ultra
- **嵌入任务**：语义操作使用 Text Embedding 模型

### 多模态能力
充分利用 Vertex AI 的多模态功能：

- **图像分析**：直接在 Cline 中上传图像进行分析
- **视觉问答**：针对图像提问
- **代码截图**：获取截图中代码的解释
- **文档处理**：分析图表、图形和可视化数据

## 故障排除

**Google Vertex AI 未作为提供商选项显示**  
确认你已登录正确的 Cline 组织。验证管理员已保存 Vertex AI 配置，并且你使用的是最新版本的 Cline 扩展。

**身份验证错误（"Access Denied" 或 "Invalid Credentials"）**  
验证所选凭据方式是否具备在已配置项目和区域中访问 Vertex AI 所需的 IAM 权限。所需权限包括 `aiplatform.endpoints.predict` 和 `aiplatform.models.predict`。

**项目访问错误**  
请管理员确认组织配置的是哪个 Google Cloud 项目。确保你的 Google Cloud 凭据有权访问该特定项目。

**区域访问错误**  
验证你的凭据是否有权访问已配置区域中的 Vertex AI。某些模型可能并非在所有区域都可用，因此请向管理员确认所选区域。

**Google Cloud SDK 身份验证问题**  
确保已正确安装 Google Cloud SDK 并完成身份验证：
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud auth application-default login
```

**服务账号密钥错误**  
验证服务账号密钥是否有效且尚未过期。检查该服务账号在组织项目中是否具备适当的 Vertex AI 权限。确保 JSON 密钥文件格式正确并包含所有必需字段。

**模型访问错误或“model not found”**  
某些模型可能未在组织的项目或区域中启用。如果特定模型不可用，请联系管理员。请验证组织是否已在 Google Cloud Console 中启用你尝试使用的模型。

## 安全最佳实践

配置 Google Cloud 凭据时，请遵循以下安全准则：

- 使用仅具备 Vertex AI 访问所需最低权限的服务账号
- 定期轮换服务账号密钥（建议每 90 天一次）
- 切勿在代码或版本控制中存储凭据
- 尽可能使用 Google Cloud SDK，以便更好地管理凭据
- 对于容器化开发环境，可考虑使用 Workload Identity
- 报告任何可疑活动或未经授权的访问尝试

组织管理员负责控制可用的模型和区域。扩展会根据项目配置和区域可用性自动显示可用模型。

有关 Google Cloud 身份验证和 Vertex AI 权限的更多信息，请参阅 [Google Cloud IAM 文档](https://cloud.google.com/iam/docs)，并与组织的云管理员协调。
