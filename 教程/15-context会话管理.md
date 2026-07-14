# Cline Context 会话管理机制

> 本文基于当前工作区源码，分析 Cline 在对话中如何构建、持久化、裁剪和压缩模型 Context。项目目前存在两套相关但不相同的运行时：正式 VS Code 扩展的 `Task`，以及供 SDK、CLI、桌面 Sidecar 和团队智能体使用的 `SessionRuntime`。本文以 VS Code 主链路为重点，同时单列 SDK/CLI 实现，避免把两者的策略混为一谈。

## 1. 先给出结论

1. **Context 不等于聊天界面中的全部消息，也不等于磁盘上的全部会话记录。** 一次模型请求的实际输入由 System Prompt、发送前处理后的会话消息和当前工具定义共同组成；UI 卡片、费用展示、Checkpoint 元数据等通常不发送给模型。
2. **VS Code 主链路维护两套消息。** `apiConversationHistory` 是模型可重放历史，`clineMessages` 是 Webview/UI 历史。二者有关联，但不会把 UI 消息 JSON 原样塞进模型 Context。
3. **VS Code 每一轮都会重新生成 System Prompt 和动态环境信息。** Rules、Workflows、Skills、MCP、工具能力、Plan/Act 模式、打开的标签页、终端新增输出等都可能使下一轮 Context 与上一轮不同。
4. **进入 Context 的内容通常不是原始输入。** 用户文本会被任务标签、Mention、Slash Command、Hook、附件文本和环境详情扩展；工具结果可能被截断；重复文件读取可能被占位符替换；Provider 适配器还会转换角色和内容块格式。
5. **VS Code 普通截断不会直接删除完整 API 历史。** `ContextManager` 通过 `conversationHistoryDeletedRange` 和 `contextHistoryUpdates` 生成发送视图，完整 `apiConversationHistory` 仍可用于恢复、Checkpoint 和历史管理。
6. **Auto Condense 是语义压缩，不只是裁掉旧消息。** 模型被要求调用 `summarize_task` 生成延续摘要，旧历史被屏蔽，后续主要依赖摘要、必要文件和最近回合继续工作。
7. **模型窗口差异由模型元数据和安全预留共同处理。** VS Code 根据 `contextWindow` 计算 `maxAllowedSize`；SDK/CLI 优先使用 `maxInputTokens`，并支持 `basic`、`agentic`、`off` 三种模式。
8. **SDK/CLI 与 VS Code 的持久化语义不同。** SDK/CLI 的 `prepareTurn` 会把压缩结果写回运行时消息状态，之后持久化的是压缩后的轨迹；VS Code 的标准 ContextManager 主要保留原始历史并维护发送视图。
9. **项目只能管理 Provider 返回给客户端的推理块。** `thinking`、`redacted_thinking`、签名和部分 `reasoning_details` 可以重放；模型服务端未返回的隐式思考并不存在于客户端，自然不会进入后续 Context。
10. **Prompt Cache 不会缩短 Context。** `cache_control` 只是让 Provider 复用前缀计算、影响延迟和计费；被缓存的 Token 仍属于请求上下文，并仍参与窗口判断。

## 2. “Context”在本项目中的准确含义

对某一次模型调用，可以把实际输入近似表示为：

```text
Model Context
  = 本轮重新生成的 System Prompt
  + ContextManager / Compaction 处理后的会话消息
  + 本轮用户消息及动态环境信息
  + 当前可用工具的定义（名称、描述、参数 Schema）
  + Provider 为协议兼容添加的控制字段
```

这里至少要区分四个概念：

| 概念 | VS Code 主链路 | SDK/CLI 主链路 | 是否必然发送给模型 |
| --- | --- | --- | --- |
| UI 历史 | `clineMessages` | CLI/TUI 事件和展示状态 | 否 |
| 可重放会话历史 | `apiConversationHistory` | `ConversationStore.messages` / `messages.json` | 需要发送前处理 |
| 本次请求消息视图 | `ContextManager` 输出 | `prepareTurn` + `MessageBuilder` 输出 | 是 |
| System Prompt 与工具定义 | 每轮动态生成 | 每个运行回合组装 | 是，但不作为普通历史消息保存 |

因此，“磁盘里有这条记录”并不等于“模型这一轮能看到它”；反过来，动态生成的 System Prompt、环境详情和工具 Schema 可能进入本轮 Context，却不是聊天界面中的一条普通消息。

## 3. 两套实现的边界

### 3.1 VS Code `Task`

正式扩展核心链路位于：

- `apps/vscode/src/core/task/index.ts`
- `apps/vscode/src/core/task/message-state.ts`
- `apps/vscode/src/core/context/context-management/ContextManager.ts`
- `apps/vscode/src/core/context/context-management/context-window-utils.ts`
- `apps/vscode/src/core/prompts/system-prompt/`

这一套负责 React Webview 对话、VS Code 环境采集、工具执行、历史恢复和 Checkpoint。

### 3.2 SDK/CLI `SessionRuntime`

共享运行时链路位于：

- `sdk/packages/agents/src/agent-runtime.ts`
- `sdk/packages/core/src/runtime/orchestration/session-runtime-orchestrator.ts`
- `sdk/packages/core/src/session/stores/conversation-store.ts`
- `sdk/packages/core/src/session/services/message-builder.ts`
- `sdk/packages/core/src/extensions/context/`
- `apps/cli/src/runtime/interactive/`

这套实现服务于 `@cline/sdk`、CLI、桌面 Sidecar、团队和子智能体运行。它使用统一的 Provider 无关消息格式和 `prepareTurn` 扩展点。

两者解决的是同一个问题，但数据结构、压缩算法和持久化结果并不完全相同。改造时不能只修改其中一套就假设所有入口都生效。

## 4. VS Code 为什么维护两套消息

`apps/vscode/src/core/task/message-state.ts` 中的 `MessageStateHandler` 同时管理：

```ts
apiConversationHistory: ClineStorageMessage[]
clineMessages: ClineMessage[]
```

### 4.1 `apiConversationHistory`

它是后续模型调用的基础历史，内容主要是：

- `user` 消息；
- `assistant` 文本；
- `assistant` 的 `thinking` / `redacted_thinking`；
- `assistant` 的 `tool_use`；
- 作为 `user` 内容块返回的 `tool_result`；
- 与生成消息有关的本地 `modelInfo`、`metrics`、请求 ID 和时间戳。

其中本地元数据用于恢复、转换和统计，但在 Provider 边界会被剥离或重映射，不会作为自然语言正文发送。

### 4.2 `clineMessages`

它服务于 Webview 展示、用户交互、历史列表、费用和状态管理，除可见聊天内容外还可以包含：

- `api_req_started` 请求卡片及 Token/费用；
- 推理展示消息；
- 流式 Partial Message；
- 工具确认和用户按钮选择；
- 错误、重试和通知；
- Checkpoint 创建状态；
- 条件规则启用提示；
- 命令执行进度等 UI 信息。

`conversationHistoryIndex` 把部分 UI 消息映射到当时的 API 历史位置；`conversationHistoryDeletedRange` 记录当时使用的裁剪范围。它们用于恢复、编辑消息和 Checkpoint 回退，不代表 UI 消息本身会进入模型。

## 5. VS Code 单轮 Context 构建主链路

一次普通请求的核心顺序如下：

```text
用户输入 / 上一轮工具结果
  │
  ▼
Task.recursivelyMakeClineRequests()
  ├─ 判断是否需要 Auto Condense
  ├─ loadContext()
  │    ├─ Mention 展开
  │    ├─ Slash Command / Workflow 展开
  │    ├─ Hook Context
  │    ├─ Focus Chain
  │    └─ Environment Details
  ├─ 追加 user 消息到 apiConversationHistory
  │
  ▼
Task.attemptApiRequest()
  ├─ 根据当前 Provider、模型、Rules、Skills、MCP 等重建 System Prompt
  ├─ ContextManager 生成裁剪和覆盖后的历史视图
  ├─ 获取当前 Native Tools 定义
  │
  ▼
ApiHandler.createMessage(systemPrompt, messages, tools)
  ├─ 转成 Anthropic / OpenAI / Responses / Gemini / VS Code LM 等协议
  └─ 发给模型
  │
  ▼
流式响应
  ├─ UI Partial Message
  ├─ 执行工具并形成 tool_result
  └─ 整理完整 assistant 消息写入 apiConversationHistory
```

需要注意：`attemptApiRequest()` 并不是简单读取上一次已经拼好的 Prompt，而是每次都重新评估当前能力和状态。

## 6. System Prompt 中包含什么

`apps/vscode/src/core/task/index.ts::attemptApiRequest()` 构造 `SystemPromptContext`，再交给 `apps/vscode/src/core/prompts/system-prompt/index.ts::getSystemPrompt()`。

当前 System Prompt 的动态来源包括：

- Provider、模型 ID、API Format 和模型能力；
- Plan / Act / YOLO 模式；
- 是否启用 Native Tool Call、并行工具调用；
- Cline Rules、Cursor Rules、Windsurf Rules、`AGENTS.md` 类规则；
- Workflows、Skills 发现结果；
- 已连接 MCP Server、MCP Tools 和 Prompts；
- `.clineignore` 约束；
- 用户偏好语言；
- 浏览器工具是否可用；
- 多根工作区；
- 当前打开或可见的 Notebook/编辑器标签；
- Focus Chain；
- 子智能体、Web Tools、终端执行模式等开关。

System Prompt 不作为普通 `user` / `assistant` 消息反复追加到 `apiConversationHistory`。它每轮重建并作为 `createMessage()` 的独立参数传给 Provider，因此修改规则、模型、模式或工具开关会直接影响下一次请求。

## 7. 用户消息进入 Context 前经历的转换

### 7.1 初始任务包装

`Task.startTask()` 会把初始任务包装为：

```text
<task>
用户输入
</task>
```

图片由 `formatResponse.imageBlocks()` 转成图片内容块；普通附件由 `processFilesIntoText()` 提取文本并包装为 `<file_content path="...">`。PDF、Office 等附件会走对应文本提取器，而不是把文件路径本身交给模型。

### 7.2 Mention 展开

`apps/vscode/src/core/mentions/index.ts::parseMentions()` 会根据 Mention 类型动态加载内容，例如：

- 文件或目录；
- URL；
- VS Code Problems；
- Git Commit / Changes；
- 其他支持的上下文来源。

文件 Mention 通常转换为：

```xml
<file_content path="src/example.ts">
文件正文
</file_content>
```

因此 API History 中保存和后续重放的是“已展开的内容”，不是仅保存一个 `@file` 引用等待 Provider 自己解析。

### 7.3 Slash Command 与 Workflow

`loadContext()` 在 Mention 之后调用 `parseSlashCommands()`。Slash Command 可以展开为 Workflow 指令、规则创建指令或 MCP Prompt 内容。模型看到的是处理后的文本，而不是所有情况下都只看到用户键入的短命令。

### 7.4 Hook 修改

`UserPromptSubmit`、`TaskStart` 等 Hook 可以返回 Context Modification。项目把该内容包装为类似 `<hook_context>` 的文本块追加到本轮消息。Hook 的 UI 执行状态不会自动进入 Context，但 Hook 明确返回的上下文会进入。

### 7.5 Focus Chain 与环境详情

启用时，Focus Chain 指令会被追加为额外文本块；随后 `<environment_details>` 作为独立文本块加入用户消息。最终保存到 API History 的用户消息已经是组合后的 `ClineContent[]`。

## 8. 哪些记录会放入 Context

下表以 VS Code 主链路为准：

| 记录 | 是否进入 | 进入方式 |
| --- | --- | --- |
| 初始用户任务 | 是 | 加 `<task>` 包装后进入 |
| 后续用户反馈 | 是 | 可能加 `<feedback>`、工具拒绝或回答包装 |
| 用户图片 | 条件进入 | 转为 Base64 图片块；还受模型图片能力和 Provider 转换限制 |
| 用户附件 | 是 | 先提取文本，再包装为 `<file_content>`；失败时记录错误文本 |
| 文件 Mention | 是 | 读取后展开为文件正文 |
| URL、Problems、Git Mention | 是 | 解析为抓取或查询后的文本 |
| Rules / Workflows / Skills | 是 | 进入 System Prompt 或 Slash Command 展开内容 |
| MCP 工具定义 | 是 | 作为 System Prompt 能力说明或 Native Tool Schema |
| Assistant 最终文本 | 是 | 作为 `assistant` 文本块保存和重放 |
| `tool_use` | 是 | 保留调用 ID、名称和参数 |
| `tool_result` | 是 | 作为下一条 `user` 内容块，与 `tool_use_id` 配对 |
| 工具拒绝、错误、用户修改反馈 | 是 | 格式化成工具结果文本 |
| Provider 返回的 Thinking | 条件进入 | 保存可重放的 thinking、签名或 reasoning details |
| Environment Details | 是 | 每轮动态生成并追加到用户消息 |
| PreCompact Hook Modification | 压缩后进入 | 追加到 Continuation Prompt |

“进入”仍然要经过后续截断、重复文件优化和 Provider 能力过滤；它不是“永久保证每一轮都原样可见”。

## 9. 哪些记录不会直接放入 Context

| 记录 | 原因 |
| --- | --- |
| `api_req_started` UI 卡片 | 用于展示请求、Token、费用和重试状态，不是会话正文 |
| Webview 的 Partial Message 状态 | 只是流式渲染状态；完成后由整理后的 assistant 消息替代 |
| Checkpoint Git 对象和提交状态 | 用于工作区恢复，不是模型消息 |
| 历史标题、收藏、目录大小等索引 | 属于任务列表和存储元数据 |
| 条件规则“已启用”的提示卡片 | UI 通知本身不进入；规则正文通过 System Prompt 进入 |
| 遥测事件、费用展示、按钮状态 | 观测和交互元数据 |
| 已经消费且没有新增输出的终端历史 | `getUnretrievedOutput()` 只取未取走的新输出 |
| 被 `.clineignore` 阻止的文件内容 | 文件路径过滤后不加载 |
| 未获自动批准的 Summary Required Files | Auto Condense 不会绕过自动批准策略 |
| 超出数量、字符或媒体预算的部分 | 被截断、忽略或改为占位符 |
| Provider 未返回的内部隐式推理 | 客户端从未收到，无法保存或重放 |

某个 UI 消息可能有对应的 API 内容，例如工具 UI 卡片与 `tool_result`；这表示二者描述同一事件，不表示项目把 UI JSON 原样发送给模型。

## 10. Assistant、工具和推理内容如何保存

流结束后，`apps/vscode/src/core/task/index.ts` 将响应整理为一个 `assistantContent` 数组，顺序大致是：

```text
redacted_thinking blocks
+ thinking / reasoning block
+ assistant text
+ finalized tool_use blocks
```

消息还会携带本地字段：

- `modelInfo`：模型、Provider 和 Plan/Act 模式；
- `metrics`：输入、输出、缓存 Token 和成本；
- `id`：Provider Request ID；
- `ts`：时间戳。

`apps/vscode/src/shared/messages/content.ts` 明确规定 `modelInfo` 必须在发送给 LLM 前移除。`convertClineStorageToAnthropicMessage()` 还会：

- 删除无签名、对 Anthropic 无效的 thinking 块；
- 对不支持 `reasoning_details` 的 Provider 清理 Cline 自定义字段；
- 移除 Gemini 等协议附加在非 thinking 块上的签名；
- 保留 Provider 协议真正需要的推理连续性字段。

### 10.1 能保存的“思考”是什么

项目可保存的是 Provider 实际返回的内容：

- 明文 `thinking`；
- 加密或删节的 `redacted_thinking`；
- Anthropic Thinking Signature；
- Gemini Thought Signature；
- OpenAI Responses / OpenRouter / Cline 的部分 Reasoning Details 或 Summary。

这些字段有时必须在后续工具回合中原样回传，目的是满足 Provider 的连续性和校验要求。

### 10.2 不能保存的“隐式思考”是什么

若 Provider 只返回最终文本、工具调用或一个摘要，而完整推理始终在服务端，Cline 没有任何源码路径可以读取它。因此：

- UI 未显示不必然代表没保存，需检查 API History 中是否有 thinking 块；
- API History 中没有的隐式推理，后续 Context 也不可能恢复；
- `reasoning_details`、Reasoning Summary 不等于模型全部内部思维过程。

## 11. 工具结果和附件并非无限进入 Context

项目在产生内容和发送请求两个阶段都设置了防护。

### 11.1 VS Code 主链路的典型限制

- `apps/vscode/src/shared/content-limits.ts`：通用文本上限为 `400 * 1024`，超出后保留开头并加入明确截断说明；附件文本、MCP Tool Result、MCP Resource 会使用这一限制。
- `ReadFileToolHandler.ts`：`read_file` 默认一次显示最多 1000 行，可用 `start_line` / `end_line` 分段继续读取。
- `apps/vscode/src/services/ripgrep/index.ts`：搜索最多 300 个结果，并有约 0.25 MB 的输出限制。
- `apps/vscode/src/integrations/terminal/constants.ts`：命令输出达到 1000 行或 512 KB 时切换到文件日志；返回模型的普通终端输出默认最多 500 行。

这些限制发生在消息写入 API History之前，因此历史中保存的通常已是受控结果，而不是工具产生的无限原始字节流。

### 11.2 SDK/CLI 的发送前 `MessageBuilder`

`sdk/packages/core/src/session/services/message-builder.ts` 不修改调用方传入的原数组，而是构造 API-safe 副本。默认策略包括：

| 内容 | 默认限制或动作 |
| --- | --- |
| 单个工具结果文本 | 中间截断到 8,000 字符 |
| 顶层用户文件附件 | 中间截断到 50,000 字符 |
| Assistant 普通文本 | 200,000 字符 |
| 大量重复 Tool Call Markup 的 Assistant 文本 | 12,000 字符 |
| 全部文本聚合预算 | 6,000,000 UTF-8 字节 |
| 单张图片 Base64 | 5 MB 编码数据 |
| 单张图片解码后 | 6 MB |
| 单次请求全部媒体 | 8 MB |

超出媒体预算的图片被替换为：

```text
[media omitted: invalid or exceeds size limit]
```

`MessageBuilder` 还会补齐缺失的工具结果、合并必要的连续 User Block，并优先截断 Tool Result 和 Assistant Text；模型生成的工具参数只作为最后兜底截断对象。

## 12. 动态 Environment Details

`Task.getEnvironmentDetails()` 每轮可以加入：

- 多根 Workspace Roots；
- VS Code Visible Files；
- Open Tabs；
- 活跃终端及未读取的新输出；
- 非活跃终端的未读取新输出；
- Recently Modified Files；
- 当前时间、时区和 UTC Offset；
- Context Window 使用率；
- 当前 Plan / Act 模式。

首次请求、恢复任务或显式要求完整文件详情时还可以加入：

- 当前工作目录文件树，最多 200 项；
- Workspace Configuration；
- Detected CLI Tools。

关键行为如下：

1. Visible/Open Tab 路径先过滤不存在的文件，再经过 `.clineignore`。
2. 终端只返回 `getUnretrievedOutput()`，已消费的旧输出不会每轮完整重复。
3. Recently Modified Files 取出后会清空，避免反复占用 Context。
4. Environment Details 是动态快照；旧快照已经随历史消息保存时，重复文件和整体截断优化仍可能进一步缩减它。

## 13. VS Code ContextManager 如何生成发送视图

`ContextManager` 的关键状态是：

```text
conversationHistoryDeletedRange: [start, end] | undefined
contextHistoryUpdates: Map<messageIndex, text overlays>
```

它的设计不是直接破坏完整 `apiConversationHistory`，而是在发送前：

1. 保留第一对 `user` / `assistant` 消息；
2. 跳过 Deleted Range；
3. 把 `contextHistoryUpdates` 中最新的文本覆盖应用到指定内容块；
4. 删除截断边界处孤立的 `tool_result`；
5. 修复工具调用和结果的顺序、配对；
6. 对缺失结果补入类似 `result missing` 的错误结果，防止 Provider 因协议结构非法而拒绝请求。

Overlay 会保存到 Task 目录的 Context History 文件，并带发生时间。Checkpoint 或消息回退时，`truncateContextHistory()` 可移除目标时间之后的覆盖，恢复当时的 Context 视图。

## 14. 重复文件读取优化

完整文件内容是编码任务中最容易重复占用窗口的部分。`ContextManager.applyContextOptimizations()` 会识别：

- `read_file` 的结果；
- `write_to_file` / `replace_in_file` 返回的最终文件全文；
- Mention 展开的 `<file_content path="...">`。

同一文件多次出现时，最新版本保留，较早版本会在发送视图中替换为：

```text
[[NOTE] This file read has been removed to save space in the context window.
Refer to the latest file read for the most up to date version of this file.]]
```

优化后会估算节省比例：

- 若至少节省约 30%，本轮可以暂缓普通历史截断；
- 若不足 30%，继续执行 Deleted Range 截断。

SDK/CLI 的 `MessageBuilder` 也做类似优化，但实现不同：它按文件路径和读取区间建立索引，把较早读取改为 `[outdated - see the latest file content]`，然后再应用工具结果字符预算。

## 15. VS Code 普通截断策略

`ContextManager.getNextTruncationRange()` 始终从索引 2 开始，因为索引 0 和 1 的第一对消息保留。删除数量按完整 user/assistant 对调整，避免打断角色交替。

| 策略 | 行为 |
| --- | --- |
| `none` | 删除第一对之后的全部历史 |
| `lastTwo` | 除第一对外，再保留最后一对 |
| `half` | 删除剩余历史的大约一半 |
| `quarter` | 删除剩余历史的大约四分之三，即仅保留约四分之一 |

普通阈值截断会给第一条 Assistant Message 加入“历史已被截断”的覆盖提示。Context Exceeded、`summarize_task`、`condense` 等调用 `triggerApplyStandardContextTruncationNoticeChange()` 的路径还会尝试把第一条 User Message 覆盖为继续协助提示。

这里的“保留第一对”不代表模型仍能看到原始第一对的所有正文：Overlay 可以改写它们；Deleted Range 也只是一种发送视图状态，不等于磁盘历史已经物理删除。

## 16. Auto Condense / `summarize_task`

Auto Condense 仅在以下条件同时满足时进入自动摘要流：

- 全局 `useAutoCondense` 开启；
- 当前模型属于 `isNextGenModelFamily()`；
- 上一轮真实 Token 总量达到当前模型阈值；
- 当前活跃消息数量足以继续压缩。

触发后本轮不会执行昂贵的完整 Mention 和 Environment Details 加载，而是追加 `apps/vscode/src/core/prompts/contextManagement.ts` 生成的强制摘要指令，要求模型：

- 尚未完成任务时调用 `summarize_task`；
- 已经完成任务时调用 `attempt_completion`；
- 摘要覆盖目标、关键技术、文件、已解决问题、待办、任务演化、当前工作和下一步；
- 给出后续真正需要的 Required Files。

`SummarizeTaskHandler` 收到摘要后：

1. 可先执行 PreCompact Hook；Hook 可取消压缩或追加 Context Modification。
2. 解析摘要中的 Required Files。
3. 最多处理 10 个路径、实际加载 8 个文件、合计不超过 100,000 字符。
4. 文件必须通过 `.clineignore` 和自动批准检查。
5. 使用 `continuationPrompt(summary)` 生成后续工具结果。
6. 用 `keep = "none"` 扩展 Deleted Range，屏蔽旧历史。
7. 标记 `currentlySummarizing`，下一轮再屏蔽摘要触发回合本身。

压缩后模型主要依赖：

```text
第一对的截断/继续提示
+ Continuation Prompt
+ 模型生成的 Summary
+ 自动加载的最新 Required Files
+ PreCompact Hook Modification
+ 压缩后的最近有效回合
```

摘要属于有损语义压缩。没有写入 Summary、Required Files 或 Hook Modification 的旧细节，即使仍在完整磁盘历史中，也不会自动重新进入模型 Context。

## 17. 用户确认式 `condense`

`apps/vscode/src/core/task/tools/handlers/CondenseHandler.ts` 是另一条压缩路径：

1. 模型提出 Context Summary；
2. Cline 展示给用户确认；
3. 用户可反馈文本、图片或附件；这些反馈作为工具结果继续进入 Context；
4. 用户没有反馈表示接受摘要；
5. 若 Assistant Summary 已经写入历史，则使用 `lastTwo`，否则使用 `none`；
6. 更新 Deleted Range 并加入截断提示。

它与 Auto Condense 的主要区别是：`condense` 有明确用户确认环节，`summarize_task` 是达到阈值后的强制自动延续流程。

## 18. 不同模型 Context Window 如何适配

### 18.1 VS Code 的窗口计算

`apps/vscode/src/core/context/context-management/context-window-utils.ts::getContextWindowInfo()` 首先读取：

```ts
contextWindow = api.getModel().info.contextWindow || 128_000
```

OpenAI-compatible 且模型 ID 包含 `deepseek` 时临时修正为 128K。有效可用上限如下：

| 模型声明窗口 | `maxAllowedSize` | 预留空间 |
| --- | ---: | ---: |
| 64K | 37K | 27K |
| 128K | 98K | 30K |
| 200K | 160K | 40K |
| 其他 | `max(window - 40K, window * 0.8)` | 至少按公式留出输出/安全空间 |

项目优先读取上一轮 Provider 返回的真实统计：

```text
tokensIn + tokensOut + cacheWrites + cacheReads
```

普通管理和主 Task Auto Condense 默认以 `maxAllowedSize` 为阈值。子智能体的 Next-Gen Auto Condense 路径另外使用 `min(contextWindow * 0.75, maxAllowedSize)`，因此不要把子智能体的 75% 直接当成主 Task 的统一阈值。

### 18.2 切换到更小模型

当用户从大窗口模型切到小窗口模型时，删除一半可能仍然超限。`ContextManager` 会比较 `totalTokens / 2` 与新模型的 `maxAllowedSize`：

- 一半已经足够：使用 `half`；
- 一半仍不够：使用更激进的 `quarter`。

### 18.3 Provider 仍报告超限

`context-error-handling.ts` 识别 OpenAI、OpenRouter、Anthropic、Cerebras、Bedrock、Vercel 等 Provider 的 Context Exceeded 错误。首次失败时：

1. 计算 `quarter` 删除范围；
2. 运行 PreCompact Hook，允许取消或修改 Context；
3. 保存 Deleted Range 和 Overlay；
4. 自动重试一次。

再次失败时提示用户手动重试。若发送视图只剩很少消息，项目会判定无法再进行有效截断，避免无限重试。

## 19. SDK/CLI 的 Context 组装

SDK/CLI 每轮由 `SessionRuntime` 完成：

```text
ConversationStore 中的完整当前轨迹
  + 新用户消息、图片、文件
  │
  ▼
AgentRuntime.prepareTurn
  ├─ 发送前 MessageBuilder 视图用于 Token 诊断
  └─ basic / agentic / custom compaction
  │
  ▼
beforeModel hooks / extension message builders
  │
  ▼
MessageBuilder.buildForApi()
  ├─ 结构修复
  ├─ 重复文件内容替换
  ├─ 工具结果、文本和媒体预算
  └─ Provider-ready messages
  │
  ▼
@cline/llms Provider Adapter
```

`ConversationStore` 只保存 Provider 无关的 `MessageWithMetadata[]` 和 `conversationId`。新回合开始时，历史轨迹作为 `initialMessages` 注入 `AgentRuntime`，避免多轮运行丢失前文。

用户文件在 `user-input-builder.ts` 中转为 `file` 内容块，图片解析为 `{ type: "image", mediaType, data }`；Mention 则由 `LocalRuntimeHost.prepareTurnInput()` 先解析并合并进 `userFiles`。

## 20. SDK/CLI 压缩触发阈值

`createContextCompactionPrepareTurn()` 只有在 `compaction.enabled === true` 时启用。每轮使用 API-safe 消息副本估算消息 Token，默认按 3 字符约等于 1 Token 的保守算法。

最大输入 Token 的优先级是：

```text
compaction.maxInputTokens
  > model.info.maxInputTokens
  > model.info.contextWindow
  > 200,000
```

自动触发规则：

1. 配置了 `reserveTokens`：`trigger = maxInputTokens - reserveTokens`；
2. 没配置 `reserveTokens` 和 `thresholdRatio`：

   ```text
   trigger = min(maxInputTokens - 16,384, maxInputTokens * 0.9)
   ```

3. 显式配置 `thresholdRatio`：`trigger = maxInputTokens * thresholdRatio`。

当前估算只累计消息数组，不把 System Prompt 和工具 Schema 一起纳入 `inputTokens`。因此对于很长的自定义 System Prompt 或大量工具，应该通过更保守的 `reserveTokens`、`thresholdRatio` 或显式 `maxInputTokens` 留余量。

## 21. SDK/CLI `basic` 压缩

`sdk/packages/core/src/extensions/context/basic-compaction.ts` 不调用额外模型，主要做结构化删除和截断：

1. 最新一个用户回合及其后续消息作为 `protectedTail`，不参与普通候选删除。
2. 清除空文本和旧 `compaction_summary`。
3. Tool Result 内容在压缩候选中进一步缩到 2,000 字符；File Block 缩到 2,000 字符。
4. 优先删除较旧 Assistant Message。
5. 再删除非首条、非最新的 User Message。
6. 再考虑最新旧 Assistant、最新旧 User。
7. 删除时以 `tool_use_id` 为关联做原子移除，避免只留调用或只留结果。
8. 若仍超预算，从后向前截断文本；最后才截断第一条 User Message。

它的优点是不增加模型调用、速度快且确定；缺点是不会主动把被删历史的语义归纳成摘要，长期任务更容易丢失旧决策。

## 22. SDK/CLI `agentic` 压缩

`sdk/packages/core/src/extensions/context/agentic-compaction.ts` 调用一个总结模型：

1. 默认保护最近约 20,000 Token；
2. `findCutIndex()` 把切点对齐到 User Turn 开始处，避免拆开 `tool_use` / `tool_result`；
3. 若旧历史已有 Compaction Summary，则把旧 Summary 与新增旧消息增量折叠；
4. 从消息中提取已读文件、已修改文件；
5. 将 Thinking 最多序列化 2,000 字符，Tool Result 和 File 内容最多 2,000 字符，图片只记录媒体类型；
6. 请求总结模型输出 Goal、State、Highlights、Next 和 Files；
7. 用一条新的 User Message 替换被折叠历史：

   ```text
   Context summary:

   <summary>
   ```

8. Summary Message 的 `metadata.kind` 为 `compaction_summary`，还保存文件清单、压缩前 Token 和生成时间。

总结模型默认复用当前 Provider，也可以通过 `compaction.summarizer` 指定另一 Provider、模型、Key、Base URL 和输出上限。总结时关闭 Thinking；非 `openai-codex` 默认最大输出 1,024 Token。

这种方式比 `basic` 更能保留任务语义，但会增加一次模型调用、费用和摘要误差风险。

## 23. CLI 的 `basic / agentic / off` 与手动压缩

`apps/cli/src/utils/compaction-mode.ts` 定义：

```text
--compaction basic    # 默认，结构化删除/截断
--compaction agentic  # 调用 LLM 生成摘要
--compaction off      # 关闭内置自动压缩
```

交互式 CLI 的手动压缩由 `apps/cli/src/runtime/interactive/compaction.ts` 调用同一个 `createContextCompactionPrepareTurn()`，但使用 `mode = "manual"`。手动目标默认压到当前输入的大约 50%，并限制在 5% 到 95% 范围内；它至少与自动阈值一样激进。

压缩成功后，`apps/cli/src/runtime/interactive/session-runtime.ts` 会停止当前 Session，并用压缩后的消息启动新 Session。`off` 只关闭内置 Compaction；扩展注册的 Message Builder 或 `beforeModel` Hook 仍然可以修改最终请求消息。

## 24. SDK/CLI 压缩为什么会改变持久化历史

`sdk/packages/agents/src/agent-runtime.ts::prepareTurnForModelRequest()` 在 `prepareTurn` 返回消息时执行：

```ts
this.state.messages = preparedMessages
```

之后 `SessionRuntime` 用完整的 `runResult.messages` 替换 `ConversationStore`，`LocalRuntimeHost` 再持久化到：

```text
~/.cline/data/sessions/<sessionId>/<sessionId>.messages.json
```

文件遵循 `sdk/packages/core/docs/messages-contract-v1.md`，可包含：

- 顶层 `version`、`updated_at`、Agent/Session 信息；
- `messages[]`；
- 可选 `system_prompt`；
- Message ID、角色和 Content Blocks；
- Assistant 的 Model Info、Metrics 和时间戳。

所以 SDK/CLI 自动压缩后，被删除的旧消息不会像 VS Code Context Overlay 那样继续作为同一活动轨迹的完整原文保留在 `messages[]` 中。若改造目标要求“既压缩发送 Context，又永久保留未经压缩的审计轨迹”，应增加独立的 Append-only Event Log，不能只依赖当前 `ConversationStore`。

## 25. 子智能体的 Context

### 25.1 VS Code Subagent

`apps/vscode/src/core/task/tools/subagent/SubagentRunner.ts` 为子智能体创建独立的：

- Conversation；
- `conversationHistoryDeletedRange`；
- Token Stats；
- ContextManager 处理流程。

它不会把父 Task 的全部历史直接复制进去，而是依赖父任务传入的子任务说明和自身后续工具轨迹。它同样支持重复文件优化、阈值压缩和 Context Exceeded 后的 `quarter` 重试。

### 25.2 SDK 团队和子智能体

SDK 的子智能体/Teammate 也拥有独立 Session、Conversation ID 和 `messages.json`。父子关系通过 Session Metadata 和团队事件保存，不等于共享同一个无限 Context。父智能体通常只看到委派说明、子智能体事件或最终工具结果。

独立 Context 能避免父历史挤占子任务窗口，但也意味着父任务中的隐含约束必须在委派 Prompt、Rules 或共享文件中明确传递。

## 26. Prompt Cache 与 Context 长度的关系

Anthropic、OpenRouter、Vercel Gateway、Bedrock 等适配器会根据模型能力给 System Prompt 或最近 User Message 添加 `cache_control` / Cache Point。其作用是：

- 复用相同前缀的 Provider 计算；
- 减少部分请求延迟；
- 影响 Cache Read / Cache Write Token 和费用。

它不会：

- 从请求中删除被缓存内容；
- 让模型窗口变大；
- 替代 Deleted Range、Summary 或 MessageBuilder 截断。

VS Code 在窗口判断中把 `cacheWrites`、`cacheReads` 与输入输出 Token 相加，是一种偏保守的安全策略。SDK/CLI 则使用序列化消息字符数估算，并通过 Reserve Token 预留其他请求组成部分。

## 27. 恢复、编辑消息和 Checkpoint 对 Context 的影响

### 27.1 VS Code

- 恢复任务时加载 API History、UI History、Deleted Range 和 Context History Overlay。
- 编辑或回退到某条消息时，根据 `conversationHistoryIndex` 截断后续 API History。
- `truncateContextHistory(timestamp)` 删除目标时间之后发生的文件读取替换和截断提示。
- Checkpoint 恢复工作区与恢复 Conversation 是相关但可分别控制的动作；Git 对象本身不进入 Context。

### 27.2 CLI/SDK

- Resume 从 `messages.json` 读取当前轨迹；读取展示时会清理内部用户输入包装。
- CLI Fork 读取消息并以同样轨迹启动新 Session。
- 手动压缩或模式切换通过“停止当前 Session + 用指定消息重启”实现。
- Checkpoint Restore 可以恢复消息和工作区，并返回新的 Session ID。

## 28. 改造 Context 管理时最重要的入口

| 改造目标 | 主要入口 |
| --- | --- |
| 改 VS Code 每轮发送哪些历史 | `ContextManager.getNewContextMessagesAndMetadata()` |
| 改窗口预留 | `context-window-utils.ts::getContextWindowInfo()` |
| 改重复文件策略 | `ContextManager.applyContextOptimizations()` |
| 改 Auto Condense 摘要格式 | `prompts/contextManagement.ts`、`SummarizeTaskHandler.ts` |
| 改动态环境信息 | `Task.getEnvironmentDetails()` |
| 改 Mention 展开 | `core/mentions/index.ts` |
| 改 System Prompt | `core/prompts/system-prompt/` |
| 改 Provider 发送格式 | `core/api/transform/` 和各 Provider Handler |
| 改 SDK/CLI 自动压缩阈值 | `extensions/context/compaction.ts` |
| 改 SDK/CLI 无模型压缩 | `basic-compaction.ts` |
| 改 SDK/CLI 摘要压缩 | `agentic-compaction.ts`、`compaction-shared.ts` |
| 改 SDK/CLI 发送前内容预算 | `session/services/message-builder.ts` |
| 保留压缩前审计记录 | 在 `prepareTurn` 改写前增加独立 Append-only 存储 |

建议把“永久事实记录”和“发送给模型的工作记忆”拆成两层：

```text
Append-only Session Event Log
  ├─ 原始用户输入和附件引用
  ├─ 原始 Provider 输出
  ├─ 工具调用和完整结果
  └─ 压缩、截断、恢复事件

Model Context Projection
  ├─ 当前 System Prompt
  ├─ Summary / Memory
  ├─ 最近回合
  ├─ 必要文件
  └─ 严格 Token / Media Budget
```

这样既能审计和回放，也能在不同模型窗口下稳定运行。

## 29. 已知边界与风险

1. **Token 判断并不绝对精确。** VS Code 依赖上一轮 Provider 统计，SDK/CLI 使用 3 字符/Token 的估算；模型、语言、图片和工具 Schema 都可能造成误差。
2. **SDK/CLI 默认估算不含 System Prompt 与工具定义。** 自定义 Prompt 和大量 MCP/插件工具需要额外 Reserve。
3. **摘要必然有损。** Auto Condense 和 Agentic Compaction 都可能漏掉细节，关键状态应落到文件、结构化 Memory 或 Required Files。
4. **规则和动态环境会变化。** 同一 API History 在下一轮可能因 Rules、Mode、Open Tabs 或工具开关不同而形成不同 Context。
5. **Provider 协议会过滤内容。** 不支持图片、Thinking、Reasoning Details 或某些 Tool Call 结构的 Provider 不会收到完全相同的内容块。
6. **压缩策略存在运行时差异。** VS Code Overlay 改造不会自动影响 SDK/CLI；SDK MessageBuilder 改动也不会自动覆盖 VS Code `Task`。
7. **隐藏推理不可审计。** 只能审计 Provider 返回的数据，不能声称项目记录了模型全部内部思考。

## 30. 源码索引

### VS Code 主链路

- `apps/vscode/src/core/task/index.ts`：用户消息加载、System Prompt、API 请求、流式响应、Assistant History。
- `apps/vscode/src/core/task/message-state.ts`：API History 与 UI History 双轨状态。
- `apps/vscode/src/shared/messages/content.ts`：存储消息结构和 Provider 边界清理。
- `apps/vscode/src/core/context/context-management/ContextManager.ts`：Deleted Range、Overlay、文件读取优化、截断与修复。
- `apps/vscode/src/core/context/context-management/context-window-utils.ts`：模型窗口和安全预留。
- `apps/vscode/src/core/context/context-management/context-error-handling.ts`：Provider 超限错误识别。
- `apps/vscode/src/core/prompts/contextManagement.ts`：摘要与延续 Prompt。
- `apps/vscode/src/core/task/tools/handlers/SummarizeTaskHandler.ts`：Auto Condense 工具处理。
- `apps/vscode/src/core/task/tools/handlers/CondenseHandler.ts`：用户确认式压缩。
- `apps/vscode/src/core/hooks/precompact-executor.ts`：压缩前 Hook。
- `apps/vscode/src/core/mentions/index.ts`：Mention 展开。
- `apps/vscode/src/core/task/tools/subagent/SubagentRunner.ts`：VS Code 子智能体 Context。

### SDK/CLI 主链路

- `sdk/packages/agents/src/agent-runtime.ts`：每轮请求状态和 `prepareTurn` 写回。
- `sdk/packages/core/src/runtime/orchestration/session-runtime-orchestrator.ts`：Conversation、System Prompt、Hook、MessageBuilder 编排。
- `sdk/packages/core/src/session/stores/conversation-store.ts`：会话轨迹状态。
- `sdk/packages/core/src/runtime/orchestration/user-input-builder.ts`：用户文本、图片、文件内容块。
- `sdk/packages/core/src/session/services/message-builder.ts`：Provider-safe 消息、内容和媒体预算。
- `sdk/packages/core/src/extensions/context/compaction.ts`：阈值、策略选择、自动/手动压缩。
- `sdk/packages/core/src/extensions/context/basic-compaction.ts`：无模型截断。
- `sdk/packages/core/src/extensions/context/agentic-compaction.ts`：LLM 摘要压缩。
- `sdk/packages/core/src/extensions/context/compaction-shared.ts`：Token 估算、摘要格式、文件操作提取。
- `sdk/packages/shared/src/llms/messages.ts`：Provider 无关消息结构。
- `sdk/packages/shared/src/llms/tokens.ts`：Token 近似算法。
- `sdk/packages/shared/src/llms/media.ts`：图片合法性和媒体预算。
- `sdk/packages/core/docs/messages-contract-v1.md`：持久化消息契约。
- `apps/cli/src/utils/compaction-mode.ts`：CLI 三种模式。
- `apps/cli/src/runtime/interactive/compaction.ts`：手动压缩入口。
- `apps/cli/src/runtime/interactive/session-runtime.ts`：压缩、恢复、Fork 和 Checkpoint 后重启。

## 31. 总结

Cline 的 Context 管理不是简单的“把所有聊天记录重复发送”。VS Code 主链路使用双轨消息、动态 Prompt、环境快照、发送视图 Overlay、重复文件优化和摘要工具；SDK/CLI 使用 Provider 无关 Conversation、发送前 MessageBuilder 与可配置 Compaction Pipeline。

对模型而言，真正可见的是经过投影后的工作记忆；对用户和系统而言，还存在 UI 状态、持久化历史、Checkpoint 和遥测等更完整的数据层。理解并保持这几个层次的边界，是修改窗口策略、增加长期记忆、做会话审计或适配新模型时最重要的前提。
