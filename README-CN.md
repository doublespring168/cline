<p align="center">
  <img src="assets/icons/icon.png" width="80" alt="Cline" />
</p>

<h1 align="center">Cline</h1>

<p align="center">
运行在 IDE 和终端中的开源编程智能体。
</p>

<div align="center">
<table>
<tbody>
<td align="center">
<a href="https://docs.cline.bot" target="_blank"><strong>文档</strong></a>
</td>
<td align="center">
<a href="https://discord.gg/cline" target="_blank"><strong>Discord</strong></a>
</td>
<td align="center">
<a href="https://www.reddit.com/r/cline/" target="_blank"><strong>r/cline</strong></a>
</td>
<td align="center">
<a href="https://github.com/cline/cline/discussions/categories/feature-requests?discussions_q=is%3Aopen+category%3A%22Feature+Requests%22+sort%3Atop" target="_blank"><strong>功能建议</strong></a>
</td>
<td align="center">
<a href="https://cline.bot/join-us" target="_blank"><strong>加入我们！</strong></a>
</td>
</tbody>
</table>
</div>

</div>

<br>

<div align="center">
<table>
<tr>
<td align="center" width="50%">

<div align="center">
<table>
<tr>
<td align="center">

---

## 索引

| 产品                     | 说明                                            | 位置                                                            | 更新日志                                                                    |
| ------------------------ | ----------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **SDK**            | Node.js 编程式智能体 API 和扩展导出。           | [`sdk/`](https://github.com/cline/cline/tree/main/sdk)           | [CHANGELOG.md](https://github.com/cline/cline/blob/main/sdk/CHANGELOG.md)      |
| **CLI**            | 终端界面、无头模式、Shell 命令和 CLI 专用流程。 | [`apps/cli/`](https://github.com/cline/cline/tree/main/apps/cli) | [CHANGELOG.md](https://github.com/cline/cline/blob/main/apps/cli/CHANGELOG.md) |
| **VS Code 扩展**   | Marketplace 扩展和扩展宿主集成。                | [`/`](https://github.com/cline/cline/tree/main)（正在迁移）      | [CHANGELOG.md](https://github.com/cline/cline/blob/main/CHANGELOG.md)          |
| **JetBrains 插件** | 与共享智能体核心通信的 JetBrains 客户端。       | JetBrains 插件目前尚未开源                                      | -                                                                           |
| **看板**           | 基于 Web 的多智能体任务看板。                   | [`cline/kanban`](https://github.com/cline/kanban)                | [CHANGELOG.md](https://github.com/cline/kanban/blob/main/CHANGELOG.md)         |
| **文档站点**       | 面向公众的文档页面。                            | [`docs/`](https://docs.cline.bot/)                               | -                                                                           |

## 跨项目编辑代码

Cline 会读取项目结构、理解文件之间的关系，并在整个代码库中进行协调一致的修改。工作期间，它会监控代码检查器和编译器错误，在你看到问题之前，就修复缺失导入、类型不匹配和语法错误等问题。在 VS Code 和 JetBrains 中，每次编辑都会以差异形式显示，供你审查、修改或还原。所有改动都会通过检查点进行跟踪，因此可以轻松撤销智能体完成的工作。

## 运行 Bash 命令

Cline 可以直接在终端中执行命令，并实时监控输出。它可以安装软件包、运行构建脚本、执行测试、部署应用和管理数据库。对于开发服务器等长时间运行的进程，Cline 会继续在后台工作，并在新输出出现时作出响应，及时发现编译错误、测试失败和服务器崩溃。

## 规划与执行

可以在规划模式和执行模式之间切换。在规划模式中，Cline 会探索代码库、提出澄清问题并制定策略。达成一致后，切换到执行模式，Cline 就会实施计划。每次文件编辑和终端命令都需要你的批准，因此实际发生的更改始终由你掌控。你也可以开启自动批准，让 Cline 自主运行。

## 规则与技能

在 `.clinerules` 文件中定义项目专用规则，指导 Cline 如何在代码库中工作，例如编码标准、架构约定、部署流程和测试要求。CLI、VS Code 扩展和 JetBrains 插件会自动读取这些规则。你还可以使用技能，让模型在需要时加载特定规则。

## 支持各种模型

Cline 不受限于单一 AI 模型提供商。你可以选择最适合工作流程的模型：

| 模型提供商           | 模型                              |
| -------------------- | --------------------------------- |
| Anthropic            | Claude Opus、Sonnet、Haiku        |
| OpenAI               | GPT 系列模型                      |
| Google               | Gemini 系列模型                   |
| OpenRouter           | 来自任意模型提供商的 200 多种模型 |
| Vercel AI Gateway    | 通过 Vercel AI Gateway 提供的模型 |
| AWS Bedrock          | Claude、Llama 等                  |
| Azure / GCP Vertex   | 所有托管模型                      |
| Cerebras / Groq      | 高速推理模型                      |
| Ollama / LM Studio   | 在本机运行本地模型                |
| 任意 OpenAI 兼容 API | 自托管或第三方端点                |

## 使用插件或 MCP 服务器扩展能力

通过插件扩展 Cline 的能力。使用 SDK，可以通过插件系统以编程方式注册工具和生命周期钩子，用于日志记录、审计、策略执行或添加领域专用能力。下面是一个简单的插件示例。

```typescript
import { Agent, createTool } from "@cline/sdk"

const deployTool = createTool({
  name: "deploy",
  description: "将当前分支部署到预发布环境。",
  inputSchema: { type: "object", properties: { env: { type: "string" } }, required: ["env"] },
  execute: async (input) => {
    // 在这里编写部署逻辑
  },
})

const agent = new Agent({ tools: [deployTool], /* ... */ })
```

……或者使用 [MCP 服务器](https://github.com/modelcontextprotocol)连接数据库、查询 API、管理云基础设施并与外部系统交互。你可以使用[社区构建的服务器](https://github.com/modelcontextprotocol/servers)，也可以要求 Cline 即时创建自定义工具。在 CLI 中，使用 `cline mcp` 管理服务器。

## 多智能体团队

协调多个智能体共同完成复杂任务。协调智能体会把工作拆分为多个子任务，再委派给拥有各自工具和上下文的专业智能体。团队状态会跨会话持久化，因此可以从上次停止的位置继续工作。

```bash
cline --team-name auth-sprint "规划并实现带有测试的用户身份验证"
```

## 定时智能体

按照 Cron 计划运行智能体，执行重复性自动化任务，例如每日 PR 摘要、每周依赖检查和代码库健康报告。计划会跨重启持久化，并独立于任何终端会话运行。

```bash
cline schedule create "PR 摘要" \
  --cron "0 9 * * MON-FRI" \
  --prompt "列出所有开放的 PR 及其审查状态" \
  --workspace /path/to/repo
```

## 连接 Slack、Telegram、Discord 等平台

通过任意消息平台与智能体聊天，包括 Telegram、Slack、Discord、Google Chat、WhatsApp 和 Linear。每个对话线程都映射到具有完整上下文的智能体会话。你还可以设置访问控制，限制能够与智能体交互的用户。

```bash
# 连接 Telegram
cline connect telegram -k $BOT_TOKEN
# 通过 Webhook 连接 Slack
cline connect slack --bot-token $SLACK_TOKEN --signing-secret $SECRET --base-url $URL
# 使用 Socket Mode 连接 Slack
cline connect slack --bot-token $SLACK_TOKEN --app-token $SLACK_APP_TOKEN
```

## 用于 CI/CD 的无头 CLI

以零交互方式运行 Cline，完成脚本和自动化工作。可以通过管道传入内容、获取 JSON 输出、串联命令，并集成到 CI/CD 流水线中。

```bash
cline "运行测试并修复所有失败项"
git diff origin/main | cline "审查这些更改中是否存在问题"
cline --json "列出所有 TODO 注释" | jq -r 'select(.type == "agent_event" and .event.text) | .event.text'
```

## 参与贡献

请从[贡献指南](CONTRIBUTING.md)开始。加入我们的 [Discord](https://discord.gg/cline)，前往 `#contributors` 频道与其他贡献者交流。如需了解全职职位，请查看我们的[招聘页面](https://cline.bot/join-us)。

## 许可证

[Apache 2.0 © 2026 Cline Bot Inc.](./LICENSE)
