结论是：记忆底座基本统一，但会按模型能力和 Provider 协议做明显调整；Dify 是当前最特殊的例外。

| 层面                | 是否统一            | 具体表现                                                                                                |
| ------------------- | ------------------- | ------------------------------------------------------------------------------------------------------- |
| 本地持久化          | 基本统一            | 都使用 `apiConversationHistory`、`ui_messages.json`、`context_history.json`、TaskState 和任务索引 |
| 截断框架            | 基本统一            | 都经过 `ContextManager`的文件去重、deleted range、工具配对修复                                        |
| Context 上限        | 按模型调整          | 根据模型的 `contextWindow`计算有效上限和预留空间                                                      |
| 自动摘要            | 按模型族调整        | 只有 Next-Gen 模型才自动使用 `summarize_task`                                                         |
| System Prompt       | 按模型族调整        | GPT-5、Gemini 3、GLM、Devstral、Next-Gen 等使用不同 Prompt Variant                                      |
| 工具/Reasoning 历史 | 按 Provider 调整    | 转换成 Anthropic、OpenAI、Responses、Gemini、Bedrock 等不同结构                                         |
| Prompt Cache        | 按 Provider 调整    | Anthropic `cache_control`、Bedrock `cachePoint`，其他 Provider 可能自动缓存                         |
| 服务端会话记忆      | 大多不用，Dify 使用 | Dify 依赖 `conversation_id`保存服务端上下文                                                           |

### 1. 共同的记忆底座

绝大多数 Provider 共用同一份本地恢复源：

```
apiConversationHistory
    -> ContextManager 截断/覆盖
    -> System Prompt + Tools
    -> Provider 格式转换
    -> 模型
```

所以切换 Anthropic、OpenAI、Gemini、OpenRouter 等 Provider 后，任务记录一般仍能继续使用。规则、Skills、Focus Chain、任务恢复和 Checkpoint 也基本与 Provider 无关。

### 2. 模型决定如何控制记忆容量

不同模型会使用自己的 `contextWindow`。项目据此计算安全上限：

* 64k 模型：约 37k 后准备清理；
* 128k 模型：约 98k；
* 200k 模型：约 160k；
* 其他窗口：保留至少 20% 或 40k 缓冲。

另外，自动摘要不是所有模型都启用。只有：

```
useAutoCondense && isNextGenModelFamily(modelId)
```

才会自动要求模型调用 `summarize_task`。当前 Next-Gen 判断包括 Claude 4+、GPT-5、Gemini 2.5/3、Grok 4、MiniMax、部分 DeepSeek、Kimi K2 等。

非 Next-Gen 模型即使开启了 Auto Condense，通常仍走程序式 `half/quarter` 截断。

相关代码：

* [model-utils.ts (line 197)](/Users/darcy/mwp/ala-platform-other/cline/apps/vscode/src/utils/model-utils.ts:197)
* [context-window-utils.ts (line 10)](/Users/darcy/mwp/ala-platform-other/cline/apps/vscode/src/core/context/context-management/context-window-utils.ts:10)
* [Task 主循环 (line 2874)](/Users/darcy/mwp/ala-platform-other/cline/apps/vscode/src/core/task/index.ts:2874)

### 3. Provider 决定记忆在线路上如何表达

本地统一保存为扩展后的 Anthropic 消息格式，但发送时会转换。

* Anthropic：保留 `thinking`、`redacted_thinking`、signature、`tool_use/tool_result`，并可添加 `cache_control`。
* OpenAI Chat：转换成 `system/user/assistant/tool` 和 `tool_calls`，Reasoning 可能变成 `reasoning_details`。
* OpenAI Responses/Codex：转换成 `message`、`reasoning`、`function_call`、`function_call_output`，并支持 encrypted reasoning。
* Gemini：转换为 `user/model` 和 `functionCall/functionResponse`；工具调用和思考需要 thought signature，缺失时可能补 dummy signature。
* Bedrock：根据目标模型转换为 Converse/Anthropic 等格式，Prompt Cache 使用 `cachePoint`。
* 部分 R1 模型：System Prompt 可能被折叠进 user 消息，并重新格式化历史。

这意味着切换 Provider 后，普通文本和工具结果通常可以继续使用，但 Reasoning 记忆不一定完全可移植：

* 没有 signature 的 Anthropic thinking 可能被删除；
* Gemini 工具调用需要 thought signature；
* 不支持 `reasoning_details` 的模型会清理该字段；
* 部分 Gemini 转换会删除无法配对的历史 tool call。

### 4. System Prompt 也按模型调整

`PromptRegistry` 会根据模型 ID 选择不同 Prompt Variant，例如：

* Generic
* Next-Gen
* Native GPT-5
* Native GPT-5.1+
* Gemini 3
* GLM
* Devstral
* Hermes
* Trinity

因此 Rules、Skills 和历史内容的来源相同，但模型收到的工具说明、行为约束及原生工具 schema 可能不同。

相关代码：[PromptRegistry.ts (line 38)](/Users/darcy/mwp/ala-platform-other/cline/apps/vscode/src/core/prompts/system-prompt/registry/PromptRegistry.ts:38)

### 5. Dify 是明显例外

Dify 没有重放本地完整历史，而是：

```
第一次：system prompt + 最后一条 user message
后续：conversation_id + 最后一条 user message
```

也就是说，任务运行期间主要依赖 Dify 服务端保存的会话记忆，本地 `ContextManager` 生成的完整有效历史并不会全部发送。

而且当前 `conversationId` 只存在于 `DifyHandler` 内存中，没有写入任务文件。重新打开任务、重建 API Handler 后，这个 ID 会丢失。此时 Dify 会创建新服务端会话，但仍只取本地最后一条 user 消息，可能无法完整恢复旧任务语境。

这是当前不同 Provider 之间最大的记忆语义差异。

相关代码：[dify.ts (line 441)](/Users/darcy/mwp/ala-platform-other/cline/apps/vscode/src/core/api/providers/dify.ts:441)

### 6. OpenAI 服务端链式记忆目前基本未启用

OpenAI Responses 转换器支持从最近 assistant response id 构造 `previous_response_id`，有效期按 23 小时判断。但当前 `openai-native` 和 `openai-codex` 的 `useWebsocketMode()` 都固定返回 `false`，所以正常路径仍发送本地转换后的历史，并不依赖服务端链式会话。

因此当前可以概括为：

> Anthropic、OpenAI、Gemini、OpenRouter、Bedrock 等共享本地记忆，只在窗口、Prompt、工具和 Reasoning 表达上适配；Dify 则真正改变了记忆来源，依赖服务端 `conversation_id`，并存在 Resume 记忆丢失风险。
