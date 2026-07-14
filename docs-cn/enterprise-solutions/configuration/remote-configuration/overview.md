---
title: "企业级提供商配置"
sidebarTitle: "概述"
description: "通过 Cline 托管的管理控制台配置推理提供商，以实现集中的组织管理"
---


远程提供商配置允许管理员通过 Cline 托管的管理控制台，为整个组织集中配置推理提供商。这种方法无需每位开发者单独设置或部署基础设施，即可确保所有团队成员拥有一致的提供商访问权限、安全策略和成本管理。

## 远程配置的工作原理

远程配置通过 Cline 位于 [app.cline.bot](https://app.cline.bot) 的托管服务运行，管理员可以在其中：

<CardGroup cols={2}>
  <Card title="集中设置" icon="gear">
    通过基于 Web 的管理控制台，一次性为整个组织配置提供商。
  </Card>
  
  <Card title="自动强制执行" icon="shield-check">
    团队成员登录其组织后，会自动接收已配置的提供商设置。
  </Card>
  
  <Card title="简化入职" icon="user-plus">
    新团队成员无需进行复杂的个人配置，即可立即访问推理提供商。
  </Card>
  
  <Card title="一致的体验" icon="users">
    确保整个组织的所有团队成员使用相同的模型、区域和设置。
  </Card>
</CardGroup>

## 支持的提供商

Cline 支持对以下推理提供商进行远程配置：

| 提供商 | 使用场景 | 配置 | 成员设置 |
|----------|----------|---------------|--------------|
| **Cline** | 使用 Cline 原生提供商并集中管理 API 密钥的组织 | API 提供商选择、模型访问权限 | 无需个人 API 密钥 — 完全由组织管理 |
| **Amazon Bedrock** | 使用 AWS 基础设施的组织 | 区域选择、VPC 端点、跨区域推理、全局推理、提示词缓存 | AWS 凭证配置（API 密钥、CLI 配置文件或凭证链） |
| **Google Vertex AI** | 使用 Google Cloud Platform 的组织 | 项目 ID、区域选择、模型访问权限 | Google Cloud 凭证配置（服务账号、SDK 或 ADC） |
| **Azure Foundry** | 使用 Azure OpenAI 或 Azure AI 服务的组织 | 基础 URL、Azure API 版本、Azure 身份验证、自定义标头 | 在扩展中配置 API 密钥 |
| **Anthropic** | 直接使用 Anthropic API 的组织 | 用于代理部署的可选自定义基础 URL、模型访问权限 | 在扩展中配置 API 密钥 |
| **OpenAI Compatible** | 使用任何 OpenAI 兼容端点（自托管、vLLM、自定义代理）的组织 | 基础 URL、自定义标头、模型访问权限 | 在扩展中配置 API 密钥 |
| **LiteLLM** | 需要通过统一代理访问多个模型的组织 | 代理端点、身份验证、模型路由 | API 密钥或端点配置（也可通过 Master Key 集中配置） |

<Note>
**Azure Foundry** 使用带有 Azure 专用设置（API 版本、Azure 身份验证）的 OpenAI Compatible 提供商配置。有关设置说明，请参阅 [OpenAI Compatible 管理员配置](/enterprise-solutions/configuration/remote-configuration/openai-compatible/admin-configuration)。
</Note>

## 配置流程

典型的远程配置流程包括以下步骤：

<Steps>
<Step title="管理员设置">
访问 Cline 管理控制台，并使用组织范围的设置配置所需的推理提供商。
</Step>

<Step title="自动分发">
提供商配置会自动分发给所有已登录 Cline 的组织成员。
</Step>

<Step title="成员凭证设置">
团队成员添加个人凭证（API 密钥、AWS 配置文件等），以连接到配置的提供商。对于 Cline 和 LiteLLM（使用 Master Key）等部分提供商，无需个人凭证。
</Step>

<Step title="立即访问">
凭证配置完成后，成员可以立即开始通过 Cline 使用推理提供商。
</Step>
</Steps>

## 远程配置的优势

### **对管理员而言**
- **集中控制**：从一个位置管理所有提供商设置
- **安全合规**：确保整个组织采用一致的安全策略
- **轻松更新**：即时更改整个组织的提供商设置

### **对团队成员而言**  
- **简化设置**：无需研究提供商配置选项
- **一致的体验**：每个人都能使用相同的模型和功能
- **快速入职**：借助预配置的提供商立即开始使用
- **专注开发**：将时间用于编码，而不是配置推理提供商

## 开始使用

要开始使用提供商远程配置：

1. **选择提供商**：选择最符合组织需求和现有基础设施的推理提供商
2. **管理员配置**：按照特定于提供商的管理员配置指南操作
3. **成员入职**：让团队成员完成特定于提供商的成员配置
4. **开始开发**：开始通过集中管理的推理提供商访问权限使用 Cline

在下方选择您的提供商，开始配置流程：

<CardGroup cols={3}>
  <Card title="Amazon Bedrock" icon="aws" href="/enterprise-solutions/configuration/remote-configuration/aws-bedrock/admin-configuration">
    基于 AWS 的 AI 模型，具有企业级安全与合规功能。
  </Card>
  
  <Card title="Google Vertex AI" icon="google" href="/enterprise-solutions/configuration/remote-configuration/google-vertex/admin-configuration">
    Google Cloud 的 AI 平台，提供 Gemini 模型和区域控制。
  </Card>

  <Card title="OpenAI Compatible" icon="plug" href="/enterprise-solutions/configuration/remote-configuration/openai-compatible/admin-configuration">
    任何 OpenAI 兼容端点，包括 Azure Foundry。
  </Card>

  <Card title="Anthropic" icon="robot" href="/enterprise-solutions/configuration/remote-configuration/anthropic/admin-configuration">
    直接访问 Anthropic API，并提供可选的自定义基础 URL 配置。
  </Card>

  <Card title="LiteLLM" icon="layer-group" href="/enterprise-solutions/configuration/remote-configuration/litellm/admin-configuration">
    通过单一界面访问 100 多种 AI 模型的统一代理。
  </Card>
</CardGroup>
