---
title: "Anthropic / Claude Code"
description: "在 Cline 中配置 Anthropic API 密钥或 Claude Code 订阅。"
---

**网站：** [https://www.anthropic.com/](https://www.anthropic.com/)

## 选择 Anthropic 使用方式

- **[Anthropic API（基于密钥）](#%E8%8E%B7%E5%8F%96-api-%E5%AF%86%E9%92%A5)：** 使用 Anthropic API 密钥。
- **[Claude Code（基于订阅）](#claude-code%EF%BC%88%E8%AE%A2%E9%98%85%EF%BC%89)：** 通过 Claude CLI 使用你的 Claude Max/Pro 订阅。

## Anthropic API（基于密钥）

### 获取 API 密钥

1.  **注册/登录：** 前往 [Anthropic Console](https://console.anthropic.com/)。创建账户或登录。
2.  **前往 API Keys：** 前往 [API 密钥](https://console.anthropic.com/settings/keys)部分。
3.  **创建密钥：** 点击 "Create Key"。为密钥指定一个描述性名称（例如 "Cline"）。
4.  **复制密钥：** **重要：** 请_立即_复制 API 密钥。之后你将无法再次查看。请安全存储。

### 在 Cline 中配置

> 请参阅[授权与模型选择](/getting-started/authorizing-with-cline#%E8%8F%9C%E5%8D%95)。

1.  **打开 Cline 设置：** 点击 Cline 面板中的设置图标（⚙️）。
2.  **选择提供商：** 从 "API Provider" 下拉菜单中选择 "Anthropic"。
3.  **输入 API 密钥：** 将你的 Anthropic API 密钥粘贴到 "Anthropic API Key" 字段中。
4.  **选择模型：** 从 "Model" 下拉菜单中选择所需的 Claude 模型。
5.  **（可选）自定义 Base URL：** 如果需要为 Anthropic API 使用自定义 Base URL，请选中 "Use custom base URL" 并输入 URL。大多数用户不需要调整此设置。

## Claude Code（订阅）

如果你已经拥有 Claude Max/Pro，并希望在 Cline 中使用基于订阅的访问方式，请使用此方式。

1. 通过 Anthropic 文档安装 Claude CLI 并完成身份验证：[Claude Code 设置](https://docs.anthropic.com/en/docs/claude-code/setup)。
2. 在 Cline 设置中，选择 **Claude Code** 作为提供商。
3. 设置 Claude CLI 路径（如果 PATH 中可用，通常为 `claude`）。

查找 Claude 路径：
- macOS / Linux / WSL / Git Bash：`which claude`
- Windows Command Prompt：`where claude`

注意事项：
- 使用你的 Claude 订阅额度，而不是 API token 计费。
- 响应可能不会逐 token 流式传输。
- 此模式下的图像上传和提示词缓存受到限制。

### 扩展思考

Anthropic 模型提供 "Extended Thinking" 功能，旨在增强它们处理复杂任务的推理能力。此功能允许模型在给出最终答案前输出分步思考过程，从而提高透明度，并对有挑战性的提示词进行更全面的分析。

在 Cline 中启用扩展思考后，模型会生成详细说明其内部推理的 `thinking` 内容块。然后，这些见解会融入最终响应中。
Cline 用户从任意提供商选择 Claude 模型后，可以通过选中模型选择菜单下方的 `Enable Extended Thinking` 框来使用此功能。

**扩展思考的关键方面：**

-   **思考摘要（Claude 3.7+）：** 对于 Claude 3.7+ 模型，API 会返回完整思考过程的摘要，以在洞察力与效率之间取得平衡并防止滥用。计费依据是完整的思考 token，而不仅仅是摘要。
-   **流式传输：** 扩展思考响应（包括 `thinking` 块）可以流式传输。
-   **工具使用和提示词缓存：** 扩展思考会与工具使用（要求传回思考块）和提示词缓存（在缓存失效和上下文方面具有特定行为）交互。

有关扩展思考工作原理的全面详情，包括 API 示例、与工具使用和提示词缓存的交互以及定价，请参阅 [Anthropic 官方扩展思考文档](https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking)。

### 提示和注意事项

-   **提示词缓存：** Claude 3 模型支持[提示词缓存](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)，这可以显著降低重复提示词的成本和延迟。
-   **上下文窗口：** Claude 模型拥有大上下文窗口（200,000 tokens），让你可以在提示词中包含大量代码和上下文。
-   **定价：** 有关最新定价信息，请参阅 [Anthropic 定价](https://www.anthropic.com/pricing)页面。
-   **速率限制：** Anthropic 根据[用量层级](https://docs.anthropic.com/en/api/rate-limits#requirements-to-advance-tier)实施严格的速率限制。如果你反复遇到速率限制，请考虑联系 Anthropic 销售团队，或通过 [OpenRouter](/provider-config/openrouter) 或 [Requesty](/provider-config/other-30-plus-providers#requesty) 等其他提供商访问 Claude。
