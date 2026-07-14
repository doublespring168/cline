---
title: "权限处理"
sidebarTitle: "权限处理"
description: "控制智能体可以自动运行哪些工具，以及哪些工具需要明确批准。"
---

工具策略控制工具是否启用，以及工具是否无需批准即可运行。未在 `toolPolicies` 中列出的工具名称默认启用并自动批准，因此请为需要审查的工具明确设置策略。

## 工具策略

管理权限最简单的方法是使用工具策略。创建智能体时，按工具分别设置策略：

```typescript
const agent = new Agent({
  // ...config
  tools: [readFileTool, writeFileTool, bashTool, searchTool],
  toolPolicies: {
    read_files: { autoApprove: true },     // Always run without asking
    search_codebase: { autoApprove: true },         // Always run without asking
    write_file: { autoApprove: false },    // Always ask before running
    run_commands: { autoApprove: false },          // Always ask before running
  },
})
```

### 策略选项

| 策略 | 效果 |
|--------|--------|
| `{ autoApprove: true }` | 工具立即执行，无需批准 |
| `{ autoApprove: false }` | 工具在执行前等待批准 |
| `{ enabled: false }` | 工具被完全禁用（模型将无法看到它） |
| 未设置策略 | 默认启用并自动批准 |

## 自动批准所有工具

适用于可信环境（CI 流水线、沙盒容器、开发脚本）：

```typescript
const agent = new Agent({
  // ...config
  tools: allTools,
  toolPolicies: Object.fromEntries(
    allTools.map((t) => [t.name, { autoApprove: true }])
  ),
})
```

或者使用 ClineCore：

```typescript
const session = await cline.start({
  config: {
    enableTools: true,
  },
  toolPolicies: {
    run_commands: { autoApprove: true },
    editor: { autoApprove: true },
    read_files: { autoApprove: true },
    apply_patch: { autoApprove: true },
    search_codebase: { autoApprove: true },
    fetch_web_content: { autoApprove: true },
  },
  capabilities: {
    requestToolApproval: async () => ({ approved: true }),
  },
  // ...
})
```

<Warning>
自动批准所有工具意味着智能体可以执行任何 shell 命令、修改任何文件，并在未经你审查的情况下发出网络请求。仅应在智能体操作已被沙盒隔离或完全可信的环境中使用此设置。
</Warning>

## 交互式批准

对于需要人工监督的应用程序，请实现自定义批准处理程序：

```typescript
import { ClineCore } from "@cline/sdk"
import * as readline from "readline"

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (q: string) => new Promise<string>((res) => rl.question(q, res))

const cline = await ClineCore.create({
  clientName: "interactive-app",
  capabilities: {
    requestToolApproval: async (request) => {
      console.log(`\nTool: ${request.toolName}`)
      console.log(`Input: ${JSON.stringify(request.input, null, 2)}`)

      const answer = await ask("Approve? (y/n): ")
      return { approved: answer.toLowerCase() === "y" }
    },
  },
})
```

## 分级权限

一种实用的折中方案：自动批准只读操作，写入操作则需要批准：

```typescript
const READ_TOOLS = new Set(["read_files", "search_codebase", "fetch_web_content"])
const WRITE_TOOLS = new Set(["run_commands", "editor", "apply_patch"])

const toolPolicies: Record<string, { autoApprove: boolean }> = {}

for (const tool of READ_TOOLS) {
  toolPolicies[tool] = { autoApprove: true }
}
for (const tool of WRITE_TOOLS) {
  toolPolicies[tool] = { autoApprove: false }
}
```

## 条件批准逻辑

根据工具实际执行的操作进行批准，而不只是根据它是哪种工具：

```typescript
const cline = await ClineCore.create({
  clientName: "smart-approval",
  capabilities: {
    requestToolApproval: async (request) => {
      // Auto-approve non-destructive shell commands
      if (request.toolName === "run_commands") {
        const cmd = JSON.stringify(request.input)
        const safeCommands = ["ls", "cat", "grep", "find", "git status", "git log", "git diff"]
        if (safeCommands.some((safe) => cmd.startsWith(safe))) {
          return { approved: true }
        }
      }

      // Auto-approve reads to specific directories
      if (request.toolName === "read_files") {
        const path = request.input.path as string
        if (path.startsWith("/src/") || path.startsWith("/tests/")) {
          return { approved: true }
        }
      }

      // Everything else requires manual approval
      console.log(`Approval needed: ${request.toolName}`)
      console.log(`Input: ${JSON.stringify(request.input)}`)
      return { approved: false }
    },
  },
})
```

## 工具被拒绝时会发生什么

当批准被拒绝时，智能体会收到一条拒绝消息，并可以调整其处理方式。它可能会：
- 请求用户澄清
- 尝试使用其他工具完成相同目标
- 修改处理方式，并使用不同参数重试
- 放弃该子任务并继续处理后续任务

智能体不会陷入循环。拒绝会被视为一次响应，智能体将继续进行下一次迭代。
