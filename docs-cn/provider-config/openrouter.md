---
title: "OpenRouter"
description: "了解如何在 Cline 中使用 OpenRouter，通过单个 API 访问各种语言模型提供商。"
---

OpenRouter 是一个 AI 平台，通过单个 API 提供对来自不同提供商的各种语言模型的访问。这可以简化设置，并让你轻松试用不同的模型。

**网站：** [https://openrouter.ai/](https://openrouter.ai/)

### 获取 API 凭据

1.  **注册/登录：** 前往 [OpenRouter 网站](https://openrouter.ai/)。使用你的 Google 或 GitHub 账户登录。
2.  **获取 API 密钥：** 前往[密钥页面](https://openrouter.ai/keys)。你应该会看到列出的 API 密钥。如果没有，请创建一个新密钥。
3.  **复制密钥：** 复制 API 密钥。

### 在 Cline 中配置

> 请参阅[授权与模型选择](/getting-started/authorizing-with-cline#%E8%8F%9C%E5%8D%95)。

1.  **打开 Cline 设置：** 点击 Cline 面板中的设置图标（⚙️）。
2.  **选择提供商：** 从 "API Provider" 下拉菜单中选择 "OpenRouter"。
3.  **输入 API 密钥：** 将你的 OpenRouter API 密钥粘贴到 "OpenRouter API Key" 字段中。
4.  **选择提供商模型：** 从 "Model" 下拉菜单中选择所需的模型。
5.  **（可选）自定义 Base URL：** 如果需要为 OpenRouter API 使用自定义 Base URL，请选中 "Use custom base URL" 并输入 URL。大多数用户应将此项留空。

### 提示和注意事项

-   **定价：** OpenRouter 根据底层模型的定价收费。详情请参阅 [OpenRouter 模型页面](https://openrouter.ai/models)。
    -   OpenRouter 会将缓存请求传递给支持缓存的底层模型。请查看 [OpenRouter 模型页面](https://openrouter.ai/models)，了解哪些模型提供缓存。
    -   对于大多数模型，如果模型本身支持缓存，缓存应会自动启用（类似于 Requesty 的工作方式）。
    -   **通过 OpenRouter 使用 Gemini 模型时的例外情况：** 通过 OpenRouter 访问时，Google 的缓存机制有时可能造成响应延迟，因此_仅对于 Gemini 模型_，需要手动执行启用步骤。
    -   如果通过 OpenRouter 使用 **Gemini 模型**，则**必须手动选中**提供商设置中的 "Enable Prompt Caching" 复选框，才能为该模型启用缓存。此复选框是一种临时解决方法。对于 OpenRouter 上的非 Gemini 模型，缓存不需要此复选框。
