---
title: "编写插件"
sidebarTitle: "编写插件"
description: "构建可添加工具、观察执行过程并修改智能体行为的插件。"
---

插件是封装可复用智能体能力的主要方式。本指南将引导你从零开始构建一个生产级插件。

## 你将构建什么

一个 GitHub 集成插件，它将：
- 注册与 GitHub 交互的工具（列出 issue、创建 PR、发表评论）
- 记录所有工具调用以供审计
- 跟踪每个会话的 Token 用量

## 第 1 步：定义插件结构

```typescript
// github-plugin.ts
import { type AgentPlugin } from "@cline/sdk"
import { createTool } from "@cline/sdk"

interface GitHubConfig {
  token: string
  owner: string
  repo: string
}

export function createGitHubPlugin(config: GitHubConfig): AgentPlugin {
  let totalTokens = 0

  return {
    name: "github-integration",
    manifest: {
      capabilities: ["tools", "hooks"],
    },

    setup(api, ctx) {
      // Register tools in the setup phase
      api.registerTool(createListIssuesTool(config))
      api.registerTool(createCreateIssueTool(config))
      api.registerTool(createPostCommentTool(config))
    },

    hooks: {
      beforeRun() {
        console.log(`[github] Run started`)
      },

      beforeTool(context) {
        console.log(`[github] Tool: ${context.toolCall.name}(${JSON.stringify(context.input).slice(0, 100)})`)
      },

      afterRun(context) {
        const usage = context.result.usage
        totalTokens += (usage?.inputTokens ?? 0) + (usage?.outputTokens ?? 0)
        console.log(`[github] Run complete. Session tokens so far: ${totalTokens}`)
      },
    },
  }
}
```

## 第 2 步：创建工具

```typescript
function createListIssuesTool(config: GitHubConfig) {
  return createTool({
    name: "list_github_issues",
    description: `List open issues in ${config.owner}/${config.repo}. Returns issue numbers, titles, labels, and assignees.`,
    inputSchema: {
      type: "object",
      properties: {
        state: {
          type: "string",
          enum: ["open", "closed", "all"],
          description: "Issue state filter. Default: open.",
        },
        labels: {
          type: "string",
          description: "Comma-separated label names to filter by (e.g., 'bug,priority:high').",
        },
        limit: {
          type: "number",
          description: "Maximum issues to return. Default: 10, max: 100.",
        },
      },
    },
    execute: async (input) => {
      const params = new URLSearchParams({
        state: input.state ?? "open",
        per_page: String(Math.min(input.limit ?? 10, 100)),
      })
      if (input.labels) params.set("labels", input.labels)

      const response = await fetch(
        `https://api.github.com/repos/${config.owner}/${config.repo}/issues?${params}`,
        { headers: { Authorization: `token ${config.token}` } }
      )

      const issues = await response.json()
      return {
        issues: issues.map((i: Record<string, unknown>) => ({
          number: i.number,
          title: i.title,
          state: i.state,
          labels: (i.labels as Array<{ name: string }>).map((l) => l.name),
          assignee: (i.assignee as { login: string } | null)?.login,
          createdAt: i.created_at,
        })),
        total: issues.length,
      }
    },
  })
}

function createCreateIssueTool(config: GitHubConfig) {
  return createTool({
    name: "create_github_issue",
    description: `Create a new issue in ${config.owner}/${config.repo}.`,
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Issue title" },
        body: { type: "string", description: "Issue body (Markdown supported)" },
        labels: {
          type: "array",
          items: { type: "string" },
          description: "Labels to apply",
        },
      },
      required: ["title"],
    },
    execute: async (input) => {
      const response = await fetch(
        `https://api.github.com/repos/${config.owner}/${config.repo}/issues`,
        {
          method: "POST",
          headers: {
            Authorization: `token ${config.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: input.title,
            body: input.body,
            labels: input.labels,
          }),
        }
      )

      const issue = await response.json()
      return { number: issue.number, url: issue.html_url }
    },
  })
}

function createPostCommentTool(config: GitHubConfig) {
  return createTool({
    name: "post_github_comment",
    description: `Post a comment on an issue or PR in ${config.owner}/${config.repo}.`,
    inputSchema: {
      type: "object",
      properties: {
        issueNumber: { type: "number", description: "Issue or PR number" },
        body: { type: "string", description: "Comment body (Markdown supported)" },
      },
      required: ["issueNumber", "body"],
    },
    execute: async (input) => {
      const response = await fetch(
        `https://api.github.com/repos/${config.owner}/${config.repo}/issues/${input.issueNumber}/comments`,
        {
          method: "POST",
          headers: {
            Authorization: `token ${config.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ body: input.body }),
        }
      )

      const comment = await response.json()
      return { id: comment.id, url: comment.html_url }
    },
  })
}
```

## 第 3 步：使用插件

```typescript
import { Agent } from "@cline/sdk"
import { createGitHubPlugin } from "./github-plugin"

const agent = new Agent({
  providerId: "anthropic",
  modelId: "claude-sonnet-4-6",
  apiKey: process.env.ANTHROPIC_API_KEY,
  systemPrompt: "You are a project manager assistant with access to GitHub.",
  plugins: [
    createGitHubPlugin({
      token: process.env.GITHUB_TOKEN,
      owner: "my-org",
      repo: "my-project",
    }),
  ],
})

await agent.run("List all open bugs and create a summary issue with the count")
```

## 以文件插件形式分发

要在 ClineCore 中从文件加载此插件，请在 `pluginPaths` 中传入其路径：

```typescript
// /absolute/path/to/github.ts
import { type AgentPlugin, createTool } from "@cline/sdk"

const plugin: AgentPlugin = {
  name: "github",
  manifest: { capabilities: ["tools"] },
  setup(api, ctx) {
    api.registerTool(
      createTool({
        name: "list_github_issues",
        // ... tool definition
      })
    )
  },
}

export default plugin
```

然后将其包含在会话配置中：

```typescript
import { ClineCore } from "@cline/sdk"

const cline = await ClineCore.create({ clientName: "my-app" })

await cline.start({
  config: {
    systemPrompt: "Use the GitHub plugin",
    // ...model/runtime config
    pluginPaths: ["/absolute/path/to/github.ts"],
  },
})
```

## 通过 CLI 安装进行分发

可以直接从文件 URL 安装单文件插件：

```bash
cline plugin install https://github.com/your-org/your-repo/blob/main/plugins/github-plugin.ts
```

单文件插件只能导入 Node 内置模块和 `@cline/*`。一旦需要 npm 依赖项（`zod`、HTTP 客户端等），就必须以软件包形式分发：一个带有 `package.json` 的目录，其中声明用于入口点的 `cline` 字段和运行时 `dependencies`。`@cline/` 作用域下的依赖项由宿主运行时提供——安装程序会移除这些依赖并为其余依赖运行 `npm install`，因此应将导入的所有 `@cline/*` 软件包声明为可选对等依赖项：

```json
{
  "cline": {
    "plugins": [{ "paths": ["./github-plugin.ts"], "capabilities": ["tools", "hooks"] }]
  },
  "dependencies": {
    "@octokit/rest": "^21.0.0"
  },
  "peerDependencies": {
    "@cline/sdk": "*"
  },
  "peerDependenciesMeta": {
    "@cline/sdk": {
      "optional": true
    }
  }
}
```

用户也可以从 git、npm 或本地路径安装软件包插件：

```bash
cline plugin install https://github.com/your-org/cline-github-plugin.git
```

## 捆绑技能

软件包插件可以在 `package.json` 旁边添加顶层 `skills/` 目录，以包含技能：

```txt
cline-github-plugin/
  package.json
  github-plugin.ts
  skills/
    triage/
      SKILL.md
```

每个捆绑技能都遵循与其他 [Cline 技能](/customization/skills)相同的目录格式。安装插件或通过 `pluginPaths` 加载插件时，Cline 会自动发现这些技能。

有关完整的清单格式、目录布局，请参阅[插件](/customization/plugins)；有关完整的可运行示例，请参阅 [typescript-lsp-plugin](https://github.com/cline/typescript-lsp-plugin)。

## 插件设计指南

1. 当插件需要配置时，请使用工厂函数（如 `createGitHubPlugin`）。不需要配置时，直接导出插件对象。

2. 保持 `setup()` 同步且快速。它在首次 LLM 调用之前运行，因此任何异步初始化都会延迟智能体。

3. 在 `setup()` 中注册所有工具，而不是在生命周期钩子中注册。工具必须在第一次迭代之前可用。

4. 使用生命周期钩子进行观察（日志记录、指标、审计），而不是修改智能体行为。如果需要修改行为，请考虑使用 `beforeRun` 或 `beforeModel` 钩子调整系统提示词或上下文。

5. 在钩子中妥善处理错误。`beforeTool` 中抛出的错误将计为一次工具失败。如果钩子仅用于观察，请在内部捕获错误。
