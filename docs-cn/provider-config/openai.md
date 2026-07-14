---
title: "OpenAI（Codex）"
description: "在 Cline 中使用 API 密钥或 OpenAI Codex OAuth 配置 OpenAI。"
---

Cline 支持通过 OpenAI 官方 API 直接访问模型。

## 选择 OpenAI 使用方式

- **[OpenAI API（基于密钥）](#%E8%8E%B7%E5%8F%96-api-%E5%87%AD%E6%8D%AE)：** 使用你的 OpenAI API 密钥。
- **[OpenAI Codex（订阅 OAuth）](#openai-codex%EF%BC%88oauth%EF%BC%89)：** 使用 OpenAI 账户登录并使用 OAI 订阅（无需管理密钥）。

**网站：** [https://openai.com/](https://openai.com/)

## OpenAI API（基于密钥）

### 获取 API 凭据

1.  **注册/登录：** 访问 [OpenAI Platform](https://platform.openai.com/)。你需要创建账户；如果已经有账户，则直接登录。
2.  **前往 API Keys：** 登录后，前往账户的 [API keys 部分](https://platform.openai.com/api-keys)。
3.  **创建密钥：** 点击 "Create new secret key"。建议为密钥指定一个描述性名称（例如 "Cline API Key"）。
4.  **复制密钥：** **关键：** 立即复制生成的 API 密钥。出于安全原因，OpenAI 不会再次向你显示该密钥。请将此密钥存放在安全的位置。

### 在 Cline 中配置

> 请参阅[授权与模型选择](/getting-started/authorizing-with-cline#%E8%8F%9C%E5%8D%95)。

1.  **打开 Cline 设置：** 点击 Cline 面板中的设置齿轮图标（⚙️）。
2.  **选择提供商：** 从 "API Provider" 下拉菜单中选择 "OpenAI"。
3.  **输入 API 密钥：** 将你的 OpenAI API 密钥粘贴到 "OpenAI API Key" 字段中。
4.  **选择提供商模型：** 从 "Model" 下拉列表中选择所需的模型。
5.  **（可选）Base URL：** 如果需要为 OpenAI API 使用代理或自定义 Base URL，可以在此处输入。大多数用户无需更改默认值。

### 提示和注意事项

-   **定价：** 请务必查看 [OpenAI 定价页面](https://openai.com/pricing)，了解与不同模型相关的详细费用信息。
-   **Azure OpenAI Service：** 如果你希望使用 Azure OpenAI 服务，请注意，可能会有关于在 Cline 中使用 Azure OpenAI 的单独文档；如果 Cline 的自定义配置支持此功能，你也可能需要将其配置为 OpenAI 兼容端点。

## OpenAI Codex（OAuth）

1. 打开 Cline 设置。
2. 从 **API Provider** 中选择 **OpenAI Codex**。
3. 点击 **Sign in with OpenAI**，并在浏览器中完成 OAuth。
4. 返回 Cline 并选择一个模型。

注意事项：
- 无需输入 API 密钥。
- 可用模型取决于你的 OpenAI 方案。
