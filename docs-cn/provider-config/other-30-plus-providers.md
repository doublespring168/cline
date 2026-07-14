---
title: "其他 30 多个提供商"
description: "使用共享配置流程的其他受支持提供商参考列表。"
---

此页面适用于遵循相同设置模式的提供商。

## 菜单

- [Cline 中的共享配置](#cline-%E4%B8%AD%E7%9A%84%E5%85%B1%E4%BA%AB%E9%85%8D%E7%BD%AE)
- [提供商](#%E6%8F%90%E4%BE%9B%E5%95%86)
  - [AIHubMix](#aihubmix)
  - [AskSage](#asksage)
  - [Baseten](#baseten)
  - [Cerebras](#cerebras)
  - [Dify.ai](#dify-ai)
  - [Doubao](#doubao)
  - [Fireworks AI](#fireworks-ai)
  - [GCP Vertex AI](#gcp-vertex-ai)
  - [Groq](#groq)
  - [Hicap](#hicap)
  - [Huawei Cloud MaaS](#huawei-cloud-maas)
  - [Hugging Face](#hugging-face)
  - [Mistral](#mistral)
  - [Moonshot](#moonshot)
  - [Nebius AI Studio](#nebius-ai-studio)
  - [Nous Research](#nous-research)
  - [Oracle Code Assist](#oracle-code-assist)
  - [Qwen Code](#qwen-code)
  - [Requesty](#requesty)
  - [SambaNova](#sambanova)
  - [SAP AI Core](#sap-ai-core)
  - [Together](#together)
  - [Vercel AI Gateway](#vercel-ai-gateway)
  - [VS Code Language Model API](#vs-code-language-model-api)
  - [xAI (Grok)](#xai-grok)

## Cline 中的共享配置

1. 打开 Cline 设置（⚙️）。
2. 从 **API Provider** 中选择你的提供商。
3. 将你的 API 密钥/token 粘贴到对应的凭据字段中。
4. 从 **Model** 中选择一个模型。

有关完整的身份验证流程（IDE + CLI），请参阅[授权与模型选择](/getting-started/authorizing-with-cline#%E8%8F%9C%E5%8D%95)。

## 提供商

### AIHubMix
AIHubMix 是一个 OpenAI 兼容的模型聚合器，通过一个 API 接口连接多个模型后端。

**网站：** [https://aihubmix.com/](https://aihubmix.com/)

#### 基本设置

1. 创建 AIHubMix 账户或登录。
2. 从仪表板生成 API 密钥。
3. 在 Cline 中选择 **AIHubMix** 并粘贴密钥。

### AskSage
AskSage 专注于企业和政府 AI 访问，并提供面向合规的控制措施。

**网站：** [https://www.asksage.ai/](https://www.asksage.ai/)

#### 基本设置

1. 登录 AskSage 并创建 API 凭据。
2. 确认你的工作区/组织已启用模型访问权限。
3. 在 Cline 中选择 **AskSage** 并输入密钥。

### Baseten
Baseten 提供托管模型 API 和用于生产推理的部署基础设施。

**网站：** [https://www.baseten.co/products/model-apis/](https://www.baseten.co/products/model-apis/)

#### 基本设置

1. 创建 Baseten 账户并打开 API 密钥部分。
2. 生成具有所需权限的 API 密钥。
3. 在 Cline 中选择 **Baseten** 并粘贴密钥。

### Cerebras
Cerebras 为支持的模型系列提供速度非常快的托管推理。

**网站：** [https://cloud.cerebras.ai/](https://cloud.cerebras.ai/)

#### 基本设置

1. 登录 Cerebras Cloud。
2. 创建或获取你的 API 密钥。
3. 在 Cline 中选择 **Cerebras** 并输入密钥。

### Dify.ai
Dify.ai 是一个以工作流为中心的 AI 平台，具有应用和流水线功能。

**网站：** [https://dify.ai/](https://dify.ai/)

#### 基本设置

1. 创建 Dify 工作区和 API 凭据。
2. 确认你的 Dify 端点/提供商设置处于活动状态。
3. 在 Cline 中选择 **Dify.ai** 并粘贴密钥。

### Doubao
Doubao 是 ByteDance 的模型系列，通常通过 Volcengine 服务访问。

**网站：** [https://www.volcengine.com/](https://www.volcengine.com/)

#### 基本设置

1. 登录 Volcengine 并启用模型访问权限。
2. 为 Doubao 端点生成 API 凭据。
3. 在 Cline 中选择 **Doubao** 并粘贴凭据。

### Fireworks AI
Fireworks AI 为开放模型提供托管推理以及注重性能的部署。

**网站：** [https://fireworks.ai/](https://fireworks.ai/)

#### 基本设置

1. 创建 Fireworks 账户。
2. 在项目/账户设置中生成 API 密钥。
3. 在 Cline 中选择 **Fireworks AI** 并输入密钥。

### GCP Vertex AI
Vertex AI 是 Google Cloud 的企业模型平台，提供 IAM 和项目级治理。

**网站：** [https://cloud.google.com/vertex-ai](https://cloud.google.com/vertex-ai)

#### 基本设置

1. 设置已启用 Vertex AI 的 GCP 项目。
2. 配置身份验证（服务账户或应用默认凭据）。
3. 在 Cline 中选择 **GCP Vertex AI** 并提供所需的配置值。

### Groq
Groq 是为支持的模型系列提供低延迟推理的提供商。

**网站：** [https://groq.com/](https://groq.com/)

#### 基本设置

1. 登录 Groq Console。
2. 创建 API 密钥。
3. 在 Cline 中选择 **Groq** 并粘贴密钥。

### Hicap
Hicap 提供具有多模态支持的 OpenAI 兼容访问。

**网站：** [https://hicap.ai](https://hicap.ai)

#### 基本设置

1. 创建你的 Hicap 账户。
2. 生成 API 密钥/token。
3. 在 Cline 中选择 **Hicap** 并输入凭据。

### Huawei Cloud MaaS
Huawei Cloud MaaS 在 Huawei Cloud 内提供模型即服务访问。

**网站：** [https://www.huaweicloud.com/](https://www.huaweicloud.com/)

#### 基本设置

1. 登录 Huawei Cloud 并打开 MaaS 服务。
2. 创建用于模型访问的 API 凭据。
3. 在 Cline 中选择 **Huawei Cloud MaaS** 并添加凭据。

### Hugging Face
Hugging Face 为开源模型提供托管推理访问。

**网站：** [https://huggingface.co/](https://huggingface.co/)

#### 基本设置

1. 登录 Hugging Face。
2. 创建具有推理权限的访问 token。
3. 在 Cline 中选择 **Hugging Face** 并粘贴 token。

### Mistral
Mistral 提供对其模型系列的直接 API 访问。

**网站：** [https://mistral.ai/](https://mistral.ai/)

#### 基本设置

1. 创建 Mistral 平台账户或登录。
2. 生成 API 密钥。
3. 在 Cline 中选择 **Mistral** 并粘贴密钥。

### Moonshot
Moonshot 提供对 Kimi 模型系列的 API 访问。

**网站：** [https://platform.moonshot.ai/](https://platform.moonshot.ai/)

#### 基本设置

1. 登录 Moonshot 平台。
2. 在账户设置中创建 API 密钥。
3. 在 Cline 中选择 **Moonshot** 并输入密钥。

### Nebius AI Studio
Nebius AI Studio 提供托管模型 API。

**网站：** [https://studio.nebius.com/](https://studio.nebius.com/)

#### 基本设置

1. 创建 Nebius AI Studio 账户或登录。
2. 生成 API 凭据。
3. 在 Cline 中选择 **Nebius AI Studio** 并提供凭据。

### Nous Research
Nous Research 提供 Hermes 系列模型产品的访问权限。

**网站：** [https://nousresearch.com/](https://nousresearch.com/)

#### 基本设置

1. 获取 Nous 托管端点的提供商访问权限/凭据。
2. 确认你的账户可用的 Model ID。
3. 在 Cline 中选择 **NousResearch** 并添加凭据。

### Oracle Code Assist
Oracle Code Assist 通过 Oracle Cloud Infrastructure（OCI）生成式 AI 服务提供 AI 驱动的编码辅助。

**网站：** [https://www.oracle.com/application-development/code-assist/](https://www.oracle.com/application-development/code-assist/)

#### 基本设置

1. **OCI 账户：** 你需要一个 Oracle Cloud Infrastructure 账户。
2. **启用生成式 AI：** 在你的租户中启用 OCI 生成式 AI 服务。
3. **获取凭据：** 配置 OCI 身份验证（API 密钥、配置文件或实例主体）。

### Qwen Code
Qwen Code 提供面向编码的 Qwen 模型访问。

**网站：** [https://chat.qwen.ai/](https://chat.qwen.ai/)

#### 基本设置

1. 登录 Qwen 平台。
2. 获取 API 访问凭据。
3. 在 Cline 中选择 **Qwen Code** 并输入凭据。

### Requesty
Requesty 在单个 API 接口后提供多提供商路由。

**网站：** [https://www.requesty.ai/](https://www.requesty.ai/)

#### 基本设置

1. 创建 Requesty 账户或登录。
2. 生成 API 密钥。
3. 在 Cline 中选择 **Requesty** 并粘贴密钥。

### SambaNova
SambaNova 提供托管推理和企业 AI 平台功能。

**网站：** [https://sambanova.ai/](https://sambanova.ai/)

#### 基本设置

1. 创建 SambaNova 账户或登录。
2. 创建 API 密钥/token。
3. 在 Cline 中选择 **SambaNova** 并输入凭据。

### SAP AI Core
SAP AI Core 是 SAP 用于模型集成和治理的企业 AI 平台。

**网站：** [https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/what-is-sap-ai-core](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/what-is-sap-ai-core)

#### 基本设置

1. 设置 SAP AI Core / generative AI hub 访问权限。
2. 配置你的服务密钥/端点凭据。
3. 在 Cline 中选择 **SAP AI Core** 并提供所需的值。

### Together
Together 为许多热门开放模型提供托管推理。

**网站：** [https://together.ai/](https://together.ai/)

#### 基本设置

1. 创建 Together 账户或登录。
2. 生成 API 密钥。
3. 在 Cline 中选择 **Together** 并粘贴密钥。

### Vercel AI Gateway
Vercel AI Gateway 提供一个用于多个上游模型提供商的 API。

**网站：** [https://vercel.com/](https://vercel.com/)

#### 基本设置

1. 登录 Vercel 并打开 AI Gateway。
2. 创建 Gateway API 密钥。
3. 在 Cline 中选择 **Vercel AI Gateway** 并添加密钥。

### VS Code Language Model API
VS Code Language Model API 支持让 Cline 使用 VS Code 宿主环境公开的模型。

**网站：** [https://code.visualstudio.com/api/extension-guides/language-model](https://code.visualstudio.com/api/extension-guides/language-model)

#### 基本设置

1. 使用配置了 LM API 兼容模型访问权限的 VS Code。
2. 确保语言模型集成在你的环境中可用。
3. 在 Cline 中选择 **VS Code Language Model API**。

### xAI (Grok)
xAI 通过其 API 平台提供 Grok 模型。

**网站：** [https://x.ai/](https://x.ai/)

#### 基本设置

1. 登录 xAI 平台。
2. 生成 API 密钥。
3. 在 Cline 中选择 **xAI (Grok)** 并粘贴密钥。
