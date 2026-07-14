---
title: "Cline SDK"
sidebarTitle: "概述"
description: "用于在你自己的应用中嵌入 Cline 智能体运行时的 TypeScript 包。"
---

Cline SDK 是一个用于构建智能体应用的开源框架，也是 Cline IDE 扩展和 CLI 所使用的同一套框架。它采用易于自定义的插件架构，并具备你期望智能体拥有的所有功能，例如检查点、网页获取、MCP、定时任务、子智能体等。

使用 Cline SDK 可从 CI/CD 流水线运行智能体、为端到端工作流创建自动化，或将智能体直接嵌入你的产品中。

## 安装

```bash
npm install @cline/sdk
```

`@cline/sdk` 导出所有 SDK 包：用于完整智能体框架的 `@cline/core`、用于无状态智能体循环的 `@cline/agents`、用于控制模型网关的 `@cline/llms`，以及用于通用实用工具的 `@cline/shared`。

需要 Node.js 22 或更高版本。

## SDK 技能

如果你使用编码智能体（Claude Code、Codex、Cline 等），请安装 [Cline SDK 技能](https://github.com/cline/sdk-skill)，为智能体提供 SDK API 和最佳实践的上下文，帮助你使用 Cline SDK 进行构建。

```bash
npx skills add cline/sdk-skill
```

提示它搭建智能体、创建自定义工具、连接插件、配置提供商等。

## 你的第一个智能体

```typescript
import { Agent } from "@cline/sdk"

const agent = new Agent({
  providerId: "anthropic",
  modelId: "claude-sonnet-4-6",
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxIterations: 1,
})

agent.subscribe((event) => {
  if (event.type === "assistant-text-delta") {
    process.stdout.write(event.text ?? "")
  }
})

const result = await agent.run("Explain what an SDK is in two sentences.")
```

<Note>
  这里有一个完整的[快速入门示例](https://github.com/cline/cline/tree/main/apps/examples/quickstart)。克隆该示例并运行 `bun dev` 即可体验。
</Note>

## 软件包

| 软件包 | 用途 |
|---------|---------|
| `@cline/sdk` | 公共 SDK 接口（重新导出 `@cline/core`） |
| `@cline/core` | 用于会话、内置工具、持久化、Hub 支持和自动化的 Node 运行时 |
| `@cline/agents` | 兼容浏览器的无状态智能体执行循环 |
| `@cline/llms` | 提供商网关和模型目录 |
| `@cline/shared` | 类型、Schema、工具辅助函数、钩子和存储辅助函数 |



有关软件包边界和导出，请参阅[软件包](/sdk/architecture/overview)。

## 后续步骤

<CardGroup cols={2}>
  <Card title="示例" icon="rocket" href="/sdk/examples">
    浏览完整且可运行的 SDK 示例。
  </Card>
  <Card title="插件" icon="diagram-project" href="/sdk/plugins">
    扩展 Cline 的功能。
  </Card>
  <Card title="工具" icon="wrench" href="/sdk/tools">
    添加模型可以调用的操作。
  </Card>
  <Card title="构建智能体" icon="code" href="/sdk/guides/building-an-agent">
    通过教程构建一个完整的 SDK 智能体。
  </Card>
</CardGroup>
