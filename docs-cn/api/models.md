---
title: "模型"
sidebarTitle: "模型"
description: "可用模型、定价层级、免费模型，以及模型 ID 在 Cline API 中的运作方式。"
---

Cline API 让你可以通过单一端点访问多个提供商的模型。模型 ID 遵循 `provider/model-name` 格式，与 [OpenRouter](https://openrouter.ai) 使用的约定相同。

## 模型 ID 格式

每个模型都由以下格式的字符串标识：

```
provider/model-name
```

例如：
- `anthropic/claude-sonnet-4-6` - Anthropic 的 Claude Sonnet 4.6
- `openai/gpt-4o` - OpenAI 的 GPT-4o
- `google/gemini-2.5-pro` - Google 的 Gemini 2.5 Pro

在你的 [聊天补全](/api/chat-completions)请求中，将此字符串作为 `model` 参数传入。

示例：

```bash
curl -X POST https://api.cline.bot/api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "minimax/minimax-m2.5",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## 推理模型

某些模型支持扩展思考，即模型会先对问题进行推理，然后再作出响应。使用这些模型时：

- 流式传输期间，推理内容会出现在 `delta.reasoning` 中
- 某些提供商会在 `delta.reasoning_details` 中返回加密的推理块
- 推理令牌与输出令牌分开计数

支持推理的模型包括大多数 Claude、Gemini 2.5 和 Grok 3 模型。请在模型目录中查看模型的 `supportsReasoning` 能力。

## 选择模型

| 如果你需要…… | 可以考虑 |
|----------------|----------|
| 最佳编码性能 | `anthropic/claude-sonnet-4-6` |
| 长文档分析 | `google/gemini-2.5-pro`（1M 上下文） |
| 快速、低成本的响应 | `deepseek/deepseek-chat` |
| 免费试用 | `minimax/minimax-m2.5` |
| 多模态（文本 + 图像） | `openai/gpt-4o` 或 `anthropic/claude-sonnet-4-6` |
| 复杂推理 | 任何支持推理的模型 |

有关设置和账户流程的详细信息，请参阅 [Cline 提供商指南](/getting-started/cline-provider)。

## 图像支持

支持图像的模型可在 `messages` 数组中接受以 base64 编码的图像内容：

```json
{
  "model": "anthropic/claude-sonnet-4-6",
  "messages": [
    {
      "role": "user",
      "content": [
        {"type": "text", "text": "What's in this image?"},
        {"type": "image_url", "image_url": {"url": "data:image/png;base64,..."}}
      ]
    }
  ]
}
```

并非所有模型都支持图像。发送图像内容之前，请检查模型的 `supportsImages` 能力。

## 相关内容

<CardGroup cols={2}>
  <Card title="聊天补全" icon="message" href="/api/chat-completions">
    在你的 API 请求中使用这些模型。
  </Card>
  <Card title="Cline 提供商" icon="scale-balanced" href="/getting-started/cline-provider">
    内置身份验证和计费功能的最快设置方式。
  </Card>
</CardGroup>
