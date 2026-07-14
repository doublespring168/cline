---
title: "OpenAI 兼容"
description: "了解如何使用提供 OpenAI 兼容 API 的各种 AI 模型提供商配置 Cline。"
---

Cline 支持各种提供兼容 OpenAI API 标准接口的 AI 模型提供商。这样，你可以使用 OpenAI _以外_的提供商所提供的模型，同时仍然使用熟悉的 API 接口。其中包括：

-   通过 Ollama 和 LM Studio 等工具运行的**本地模型**（相关内容在各自的部分中介绍）。
-   Perplexity、Together AI、Anyscale 等许多**云提供商**。
-   提供 OpenAI 兼容 API 端点的**任何其他提供商**。

本文重点介绍 OpenAI 官方 API _以外_的提供商设置（OpenAI 官方 API 有自己的[专用配置页面](/provider-config/openai)）。

### 常规配置

要在 Cline 中使用 OpenAI 兼容提供商，关键是配置以下主要设置：

1.  **Base URL：** 这是该提供商特有的 API 端点。它_不是_ `https://api.openai.com/v1`（该 URL 用于 OpenAI 官方 API）。
2.  **API Key：** 这是从你选择的提供商处获取的密钥。（或 **Use Azure Identity Authentication（使用 Azure 身份验证）**）
3.  **Model ID：** 这是你希望使用的模型的具体名称或标识符。

你可以在 Cline 设置面板（点击 ⚙️ 图标）中找到这些设置：

-   **API Provider：** 选择 "OpenAI Compatible"。
-   **Base URL：** 输入所选提供商提供的 Base URL。**这是关键步骤。**
-   **API Key：** 输入提供商提供的 API 密钥。
-   **Model：** 选择或输入 Model ID。
-   **Use Azure Identity Authentication（使用 Azure 身份验证）：** 选中此框以使用你的 Azure 托管身份进行身份验证（请注意，这不会触发身份验证，而是使用现有身份验证，例如 "az login"）
-   **Model Configuration（模型配置）：** 此部分允许你自定义模型的高级参数，例如：
    -   Max Output Tokens（最大输出 token 数）
    -   Context Window size（上下文窗口大小）
    -   Image Support capabilities（图像支持能力）
    -   Computer Use（计算机操作，例如用于支持工具/函数调用的模型）
    -   Input Price（输入价格，每 token/每百万 token）
    -   Output Price（输出价格，每 token/每百万 token）

**注意：** 如果你使用其他 OpenAI 兼容提供商（例如 Together AI、Anyscale 等），可用的 Model ID 会有所不同。请始终查阅特定提供商的文档，了解其支持的模型名称和任何特殊配置详情。

### Cline 中的 v0（Vercel SDK）：

-   对于使用 v0 的开发者，其 [AI SDK 文档](https://vercel.com/docs/v0/cline)提供了集成各种模型的实用见解和示例，其中许多模型与 OpenAI 兼容。使用 Cline 配合部署在 Vercel 上或与 Vercel 集成的服务时，此资源有助于理解如何构建调用和管理配置。

-   v0 可在 Cline 中与 OpenAI 兼容提供商配合使用。

-   ### 快速开始

-   1. 选择 OpenAI 兼容提供商后，将 Base URL 设置为 https://api.v0.dev/v1。
-   2. 粘贴你的 v0 API 密钥
-   3. 设置 Model ID：v0-1.0-md
-   4. 点击 Verify（验证）确认连接。

### 故障排除

-   **"API 密钥无效"：** 再次检查输入的 API 密钥是否正确，并确认它属于正确的提供商。
-   **"未找到模型"：** 确保你使用的是所选提供商的有效 Model ID，并且该模型可通过指定的 Base URL 使用。
-   **连接错误：** 确认 Base URL 正确、你的计算机可以访问提供商的 API，并且不存在防火墙或网络问题。
-   **意外结果：** 如果得到意外输出，请尝试其他模型，或再次检查所有配置参数。

使用 OpenAI 兼容提供商，可以让你凭借 Cline 的灵活性使用更广泛的 AI 模型。请记得始终查阅提供商的文档，以获取最准确、最新的信息。
