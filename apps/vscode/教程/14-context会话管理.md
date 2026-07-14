# Context 会话管理机制

> 本文说明“用户消息如何变成某一次模型请求的 context”。代码依据主要为 `src/core/context/context-management/ContextManager.ts`、`context-window-utils.ts`、`src/core/task/index.ts`、`SummarizeTaskHandler.ts`、`CondenseHandler.ts`、`src/core/prompts/system-prompt` 及各 Provider transform。这里的 context 指发送给模型的动态请求，不等同于 `ui_messages.json` 或 `api_conversation_history.json`。

## 1. 核心结论

项目没有一份永久不变的“上下文表”。每次请求都从本地 API 历史、当前环境和系统提示重新构造：

```text
apiConversationHistory（可恢复源数组）
        │
        ├─ conversationHistoryDeletedRange 逻辑删除
        ├─ context_history.json 覆盖/去重/压缩变换
        ├─ tool_use/tool_result 配对修复
        └─ half/quarter/none/lastTwo 或 summary 截断
        ▼
本轮 user 内容（用户反馈 + environment_details）
        + system prompt（规则、模式、skills、MCP schema）
        + tools
        ▼
Provider transform（Anthropic/OpenAI/Gemini/Responses/Bedrock 等）
        ▼
模型请求
```

因此，“聊天界面显示过”不代表“一定送进本轮模型”；“API 历史仍在 JSON 中”也不代表“没有被逻辑删除”。

## 2. 一次请求的主流程

在 `Task.initiateTaskLoop`/`recursivelyMakeClineRequests` 中，每轮大致执行：

1. **定位上一请求。**从 `clineMessages` 找到上一个 `api_req_started`，读取其 `tokensIn`、`tokensOut`、`cacheWrites`、`cacheReads`，作为上下文管理的遥测依据。
2. **取得模型和 Provider 信息。**`api.getModel().info.contextWindow`、模型族、自动压缩设置、当前 mode 等决定后续策略。
3. **判断是否需要优化或压缩。**`ContextManager.shouldCompactContextWindow`/`getNewContextMessagesAndMetadata` 依据上一请求 token 总量和有效上限选择文件读取去重、half/quarter 或自动 summary。
4. **加载当前上下文。**`loadContext` 处理用户 mentions、slash commands、工具反馈 tags、当前 workspace 环境；首轮还加入文件树、workspace 配置和 CLI 工具信息。
5. **取得历史切片。**`getNewContextMessagesAndMetadata` 克隆/切片 API 历史，应用 deleted range、`context_history.json` 更新、截断和工具配对修复，返回本轮实际 history 及元数据。
6. **构建系统消息和工具定义。**system-prompt 代码按当前模式动态加入规则、skills、MCP 工具 schema 等；它们通常不写入 API conversation history，而是作为本次请求独立的 system/tools 参数。
7. **调用 Provider。**`attemptApiRequest` 将 Anthropic 风格的本地消息转换为目标协议，发起流式请求；`StreamResponseHandler` 聚合 text、reasoning、tool call 和 usage。
8. **写回状态。**流结束后把 assistant 的 thinking/text/tool_use 写入 API 历史，把 UI 状态和 token/cost 写入 `clineMessages`；工具执行结果暂存为下一轮 user 内容，然后再次进入循环。

## 3. 哪些内容进入 context

### 3.1 API 历史中的持久内容

`Task.startTask` 初次构造 `<task>` 用户消息；文本会经过 mentions/slash command 处理，图片转成 image block，普通文件经过 `processFilesIntoText` 提取文本。后续可能加入：

- 用户在 Webview 输入的补充、恢复任务反馈、审批结果和 continuation prompt；
- 每轮的 `<environment_details>`，包括 workspace roots、打开/可见 tab、终端输出、最近修改文件、当前时间、context 使用量和 mode；
- 工具结果（native `tool_result` 或兼容 provider 的文本包装）；
- assistant 文本、结构化 `tool_use`/function call；
- Provider 返回并被适配器保留的 `thinking`、`redacted_thinking`、reasoning summary、signature 等；
- 无工具重试、模型切换提示、`[Continue assisting the user!]` 等系统生成的继续消息；
- Hook 的 `contextModification`（仅当 Hook 实现将其返回为上下文修改）。

每轮 API 请求结束后，assistant 消息的顺序通常是 `redacted_thinking* -> thinking? -> text? -> tool_use*`，并带有 id、modelInfo、metrics、ts 等 Cline 元数据。发送到 Provider 前会清掉其中的 Cline 私有字段。

### 3.2 当前请求才加入的内容

环境信息不是一次写死的全局系统消息，而是每轮由 `getEnvironmentDetails` 重新生成的 user 内容。因此文件是否打开、终端输出和最近修改状态会变化；旧环境详情仍可能留在 API 历史，但本轮新详情才反映当前状态。

system prompt、规则、skills、MCP 工具 schema 和工具描述在每次请求动态构建，通常作为 system/tools 参数，不直接追加到 `apiConversationHistory`。如果开启 `CLINE_WRITE_PROMPT_ARTIFACTS`，系统提示可能另写 `.system_prompt.md` 和 manifest，但那是调试产物，不是对话消息。

## 4. 哪些内容不进入或不直接进入 context

| 内容 | 处理 | 原因 |
| --- | --- | --- |
| `api_req_started` 的 UI 状态、成本卡片 | 留在 `clineMessages` | UI/遥测，不是模型消息正文 |
| Hook status/stream、通知、进度、checkpoint 哈希 | 多数仅 UI/TaskState | 防止把内部状态当用户指令 |
| `TaskState` 的锁、retry、abort、ask 原始按钮对象 | 内存或 UI 投影 | 运行控制信息 |
| `conversationHistoryDeletedRange` 覆盖的旧消息 | 逻辑上不发送 | JSON 文件可能仍保留原文 |
| 被 `context_history` 更新替换的旧文件内容 | 用新文本/notice 替代 | 去重和压缩节省 token |
| Provider 未返回的隐式 CoT、内部草稿、采样中间 token | 永远不可从客户端恢复 | 服务端不可见 |
| 原始 SSE/WS delta 中未映射的私有字段 | 通常丢弃 | 统一 stream 类型只保留 text/reasoning/tool/usage |
| 子代理内部完整历史 | 默认不进入父任务 context | `SubagentRunner` 主要返回状态/summary/usage |

工具结果有一个重要边界：工具完整执行结果先在 `TaskState.userMessageContent`/工具处理器中存在，下一次循环才包装成 user `tool_result` 进入模型；只显示在 UI 的结果不一定会送入模型。

## 5. 历史是原始记录还是变换后的记录

### 5.1 入库时已经做过的变换

`apiConversationHistory` 不是用户原始字符串的字节级副本：

- 文本被包在 `<task>`、`<environment_details>` 等标记中；
- mentions 解析成文件/目录上下文，slash command 展开为指令；
- 图片变为 MIME + base64 image block；
- 普通附件只在可提取时加入文本，20 MB 输入限制、约 400 KB 最终截断，IPYNB 大输出会被清理；
- 工具调用被标准化为 `tool_use`/`tool_result`，并带 id、name、input；
- Provider 的 reasoning/signature 经过统一类型解析，部分私有 metadata 在边界被删除。

所以它是“可重放的语义历史”，不是原始 WebSocket 或用户输入审计。

### 5.2 请求前的 ContextManager overlay

`ContextManager` 保存 `contextHistoryUpdates`：键为 API 消息索引和内容块索引，值为带时间戳的更新。`context_history.json` 只序列化这些更新，不复制完整消息。请求时：

1. 先按 `conversationHistoryDeletedRange` 选出仍有效的消息；
2. 对重复文件读取，若内容相同，用 `duplicateFileReadNotice` 替换旧正文；
3. 必要时在首 assistant 加 context truncation notice，或把首 user 替换为 `[Continue assisting the user!]`；
4. 调整工具消息顺序，确保每个 `tool_result` 紧跟对应 `tool_use`；缺失结果补 `result missing`，孤儿结果删除；
5. 返回副本，不直接破坏恢复用的原数组。

因此同一个任务在不同时间、不同模型窗口下，发送的 context 可能不同；`context_history.json` 是解释这些差异的变更轨迹，而非另一份完整聊天。

## 6. 上下文窗口差异和压缩策略

### 6.1 有效上限

`context-window-utils.ts` 读取模型 `contextWindow`，缺省 128,000。为了给当前输出、工具和提示留空间，计算 `maxAllowedSize`：

| 原始窗口 | 有效上限 |
| --- | --- |
| 64k | 64k - 27k |
| 128k | 128k - 30k |
| 200k | 200k - 40k |
| 其他 | `max(contextWindow - 40k, contextWindow * 0.8)` |

OpenAI-compatible 的 DeepSeek id 特殊按 128k 处理，这是源码中的兼容性 workaround。有效上限不是精确 tokenizer 预估，而是根据上一请求返回的 token/caching 计数做阈值判断。

### 6.2 旧的程序式截断

当 `useAutoCondense` 关闭且上一请求总 token 达到 `maxAllowedSize`：

- 默认保留首 user+assistant pair，从 index 2 开始成对删除；
- 通常采用 `half`，如果总量的一半仍大于新模型窗口，则采用 `quarter`；这覆盖从 Claude 200k 切换到 64k 模型的情况；
- `conversationHistoryDeletedRange` 记录逻辑删除区间；旧消息可能仍在 JSON，但本轮不发送；
- 若文件读取去重可节省至少约 30%，先应用 `context_history` 更新，可能无需完整截断；
- 删除后在首 assistant 加提示，避免模型误以为早期内容从未存在。

### 6.3 自动压缩（summarize）

只有启用 `useAutoCondense` 且模型属于 `isNextGenModelFamily` 时走 `SummarizeTaskHandler`。流程包括：

1. 执行 PreCompact Hook，并写临时 conversation history 快照供 Hook 使用；
2. 让模型生成任务 summary；
3. 解析 `Required Files`，最多批准 8 个文件、总计约 100k 字符；
4. 以 `continuationPrompt(summary)` 加文件内容作为新的 tool result/user 内容；
5. 将旧范围按 `none` 策略覆盖/截断，并设置 `currentlySummarizing`，下一轮继续。

自动压缩不等于保留全部历史：summary 是模型生成的摘要，原始删除范围仍受 checkpoint/context history 管理。

### 6.4 错误、手动和特殊分支

- 模型返回 context-window error 时，首次会执行 PreCompact/更激进的 quarter 截断并自动重试；再次失败才要求用户 retry/调整模型。
- 用户 `/smol` 或 `/compact` 经 `CondenseHandler` 确认后，按 `none` 或 `lastTwo` 策略压缩。
- 取消请求时会保存当前部分 UI/API，并追加 `Response interrupted...` 文本；部分 stream delta 不会自动变成完整历史版本。
- 切换到更小窗口模型会重新依据新 `api.getModel()` 计算阈值，不假设旧模型的 200k 仍可用。
- `maxTokens`/输出预算与输入 context window 分开；预留 buffer 不能视为模型实际支持的最大输出。

## 7. Provider 适配对 context 的影响

本地历史采用扩展 Anthropic `MessageParam` 形态，Provider transform 再转换：

- Anthropic 原生保留 content blocks、thinking 和 tool_result；
- OpenAI Chat Completions 将 tool_use/result 转为 tool calls/messages，reasoning 字段按供应商能力清理；
- OpenAI Responses 可能使用 reasoning summary/encrypted content 和短期 `previous_response_id`，但本地 API 历史仍是恢复基准；
- Gemini 使用 `part.thought`/thought signature；Bedrock、OpenRouter、Cline 等适配器各自映射 reasoning、缓存和工具字段；
- 不支持某字段的 Provider 会删除或降级为普通文本。

这意味着“进入本地 context”与“最终在线路上传输的字段”不是一一相同；要审计 wire payload，必须在 Provider 发送前记录脱敏快照。

## 8. 恢复、检查点和删除

`resumeTaskFromHistory` 读取 UI/API/context 文件，初始化 `ContextManager` 后重建循环；如果 API 历史为空，会根据 UI/任务元数据做有限恢复。检查点恢复会按时间戳回滚 `contextHistoryUpdates`，因此更新中保存时间序列而不仅是最终文本。

删除任务时 `deleteTasksWithIds` 会删除已知 UI/API/context/metadata 文件，但 Focus Chain、archive、sync queue、远端 blob 不一定统一清理。若改造 context 或归档，应明确这些副本的生命周期。

## 9. 对改造者的实践建议

1. 把“恢复源”（API history）和“本轮请求副本”（ContextManager 输出）分开命名和记录，调试时同时打印两者的 message index/hash。
2. 在 Provider 调用前保存 `systemPromptHash`、工具 schema hash、active history hash、deleted range 和模型窗口，才能复现一次请求。
3. 任何压缩/去重都记录 reason、before/after 字符或 token 估计；不要只写“context compacted”。
4. 若需要完整聊天审计，在 `say`/`ask` partial 更新前加事件 sink；不能依赖最终 `ui_messages.json`。
5. 对附件、终端大输出和 MCP 结果分别保存原始快照与送模型截断版本。
6. 把服务端隐式 CoT 标为“不可获得”；只展示 Provider 明确返回的 reasoning/redacted/encrypted block。
7. 新增模型时同时实现 `contextWindow`、token usage、tool/result pairing 和 reasoning transform，并测试从大窗口切换到小窗口的 quarter 分支。

## 10. 关键源码索引

| 文件 | 作用 |
| --- | --- |
| `src/core/context/context-management/ContextManager.ts` | 历史切片、删除范围、文件读取优化、工具配对、压缩入口 |
| `src/core/context/context-management/context-window-utils.ts` | 原始窗口与有效上限、DeepSeek 特殊处理 |
| `src/core/task/index.ts` | 请求循环、环境详情、旧截断、自动压缩和恢复 |
| `src/core/task/tools/handlers/SummarizeTaskHandler.ts` | PreCompact、summary、Required Files、继续提示 |
| `src/core/task/tools/handlers/CondenseHandler.ts` | `/smol`、`/compact` 手动压缩 |
| `src/core/task/message-state.ts` | API/UI 历史内存数组及持久化 |
| `src/core/prompts/system-prompt/*` | 动态 system prompt、rules、skills、MCP schema |
| `src/core/api/providers/*`、`src/core/api/transform/*` | 各模型协议和消息/流字段转换 |
