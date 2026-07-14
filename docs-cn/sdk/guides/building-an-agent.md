---
title: "构建智能体"
sidebarTitle: "构建智能体"
description: "逐步构建一个完整的代码审查机器人，它会读取差异、分析代码并生成结构化反馈。"
---

本教程将介绍 SDK 仓库中的 [code-review-bot 示例](https://github.com/cline/cline/tree/main/apps/examples/code-review-bot)。完成本教程后，你将了解如何将自定义工具、系统提示词、完成生命周期和事件流式传输组合成一个真实应用。

## 你将构建什么

一个代码审查智能体，它会：
1. 从本地仓库读取 git diff
2. 根据需要读取完整文件内容以获取上下文
3. 生成带有严重性级别的结构化审查评论
4. 以摘要和批准/拒绝决定结束运行

## 前置条件

- Node.js 22+
- Anthropic API 密钥
- 至少有一个提交的 git 仓库

## 获取代码

```bash
git clone https://github.com/cline/cline.git
cd cline/apps/examples/code-review-bot
bun install
```

或者对照阅读 [GitHub 上的源代码](https://github.com/cline/cline/blob/main/apps/examples/code-review-bot/src/index.ts)。

## 工作原理

### 使用 Zod Schema 定义工具

该机器人使用带有 zod schema 的 `createTool` 来实现类型安全的工具定义。以下是审查评论工具：

```typescript
createTool({
  name: "add_review_comment",
  description: "Add a review comment on a specific file and line.",
  inputSchema: z.object({
    file: z.string().describe("File path"),
    line: z.number().describe("Line number (approximate is fine)"),
    severity: z.enum(["critical", "warning", "suggestion"]),
    comment: z.string().describe("The review comment"),
  }),
  async execute(input) {
    reviews.push(input)
    return `Comment added (${reviews.length} total)`
  },
})
```

要点：
- `z.enum` 将严重性限制为有效值，从而提高模型准确性
- 每个字段上的 `.describe()` 告诉模型需要提供什么
- 该工具将结果累积到数组中，以便运行后处理

### 完成工具

`submit_review` 工具使用 `lifecycle: { completesRun: true }` 表明智能体的工作已经完成：

```typescript
createTool({
  name: "submit_review",
  description: "Submit the completed review with a summary.",
  inputSchema: z.object({
    summary: z.string().describe("Brief overall assessment of the changes"),
    approve: z.boolean().describe("Whether the changes look good to merge"),
  }),
  lifecycle: { completesRun: true },
  async execute(input) {
    return JSON.stringify({ summary: input.summary, approve: input.approve })
  },
})
```

如果没有它，智能体将持续循环，直到达到 `maxIterations`。有了它，智能体会在完成工作时调用 `submit_review`，运行便会干净利落地结束。

### 系统提示词

系统提示词为智能体提供了一个需要遵循的结构化工作流：

```typescript
const agent = new Agent({
  systemPrompt: `You are a senior code reviewer. Analyze the git diff provided and leave review comments using the add_review_comment tool. Focus on:
- Bugs and logic errors (critical)
- Security issues (critical)
- Performance problems (warning)
- Style and readability improvements (suggestion)

When you are done reviewing, call submit_review with a brief summary.`,
  // ...
})
```

明确告诉智能体使用哪些工具以及何时使用，有助于保持工作流可预测。

### 事件流式传输

该机器人订阅事件，以便在智能体工作时显示进度：

```typescript
agent.subscribe((event) => {
  switch (event.type) {
    case "assistant-text-delta":
      process.stdout.write(event.text ?? "")
      break
    case "tool-started":
      if (event.toolCall.toolName === "add_review_comment") {
        const input = event.toolCall.input
        console.log(`  [${input.severity}] ${input.file}:${input.line} - ${input.comment}`)
      }
      break
  }
})
```

这会在审查评论产生时将其打印出来，因此你可以看到结果流式输出，而不必等待整个运行完成。

### 运行后处理

运行结束后，机器人按严重性对评论进行分组并打印摘要：

```typescript
const result = await agent.run(`Review this git diff:\n\n\`\`\`diff\n${diff}\n\`\`\``)

const critical = reviews.filter((r) => r.severity === "critical")
const warnings = reviews.filter((r) => r.severity === "warning")
const suggestions = reviews.filter((r) => r.severity === "suggestion")
```

工具调用在运行期间累积结构化数据，应用在运行后对其进行处理。每当你希望智能体生成结构化输出时，这种模式都很有用。

## 运行

```bash
ANTHROPIC_API_KEY=sk-ant-... bun dev        # review last commit
ANTHROPIC_API_KEY=sk-ant-... bun dev main   # review against main
```

## 进一步扩展

在此基础上，你可以：

- 添加一个通过 API 将审查评论发回 GitHub 的工具
- 使用 `continue()` 针对特定发现提出后续问题
- 添加一个在已更改文件上运行 linter 的 `checkstyle` 工具
- 将其连接到 webhook，以实现自动 PR 审查

## 更多示例

<CardGroup cols={2}>
  <Card title="CLI 智能体" icon="terminal" href="https://github.com/cline/cline/tree/main/apps/examples/cli-agent">
    带有工具和多轮对话的交互式终端聊天。
  </Card>
  <Card title="多智能体" icon="users" href="https://github.com/cline/cline/tree/main/apps/examples/multi-agent">
    将并行智能体的输出流式传输到 Web UI。
  </Card>
</CardGroup>

有关扩展智能体能力的更多信息，请参阅[创建自定义工具](/sdk/guides/creating-custom-tools)和[编写插件](/sdk/guides/writing-plugins)。
