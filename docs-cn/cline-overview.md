---
title: "Cline 概览"
sidebarTitle: "Cline 概览"
description: "面向复杂工作的 AI 编程智能体。读取文件、编写代码、运行命令，所有操作均需经你批准。"
---

欢迎阅读 Cline 文档。无论你是刚刚开始使用，还是希望解锁高级功能，都能在这里找到所需的一切。

## 什么是 Cline？

Cline 是一个运行在编辑器和终端中的 AI 编程智能体。它可以读取和写入文件、运行终端命令、使用浏览器，并通过自然对话帮助你构建功能。每项操作都需要你的明确批准。控制权始终在你手中。
### 智能体核心（SDK）

SDK 是 Cline 的智能体核心——可用它构建你自己的应用程序、自动化流程和集成。有关 Cline 智能体的详细功能和架构设计，请参阅 SDK 部分。

<CardGroup cols={1}>
  <Card title="SDK" icon="cube" href="/sdk/overview">
    使用 CLI、Kanban、VS Code 扩展和 JetBrains 插件背后的同一核心引擎，构建 AI 智能体和集成。

    `npm install @cline/sdk`
  </Card>
</CardGroup>

### 应用程序

以下是构建在 Cline 智能体核心之上的最终用户应用程序：

<CardGroup cols={2}>
  <Card title="CLI" icon="terminal" href="/usage/cli-overview">
    在终端中以交互式聊天方式运行 Cline，或为 CI/CD 和脚本运行完全无头的自动化任务。

    `npm i -g cline`
  </Card>
  <Card title="Kanban" icon="table-columns" href="https://github.com/cline/kanban">
    通过基于 Web 的任务看板并行运行多个智能体，每张卡片均可使用独立 worktree、自动提交和依赖链。

    `npx kanban`
  </Card>
  <Card title="VS Code 扩展" icon="code" href="https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev">
    编辑器中的 AI 编程助手。创建文件、运行命令、浏览 Web，并在人工参与批准的情况下使用工具。
  </Card>
  <Card title="JetBrains 插件" icon="brain" href="https://plugins.jetbrains.com/plugin/27189-cline">
    在 IntelliJ IDEA、PyCharm、WebStorm、GoLand 及 JetBrains 系列其他产品中获得相同的 Cline 体验。
  </Card>
</CardGroup>


## 其他 IDE 支持

Cline 支持所有主流编辑器：**VS Code**、**Cursor**、**Windsurf**、**JetBrains**（IntelliJ、PyCharm、WebStorm）、**Antigravity** 和 **Zed**，还可通过 ACP 模式支持 **Neovim**。


## 企业解决方案

<CardGroup cols={2}>
  <Card title="安全与治理" icon="shield-halved" href="/enterprise-solutions/overview">
    SSO、基于角色的访问控制、按团队设置的模型和工具控制，以及远程配置。
  </Card>
  <Card title="可观测性" icon="chart-line" href="/enterprise-solutions/monitoring/overview">
    OpenTelemetry、Datadog、Grafana、Splunk 集成，并提供实时分析。
  </Card>
  <Card title="团队管理" icon="users-gear" href="/enterprise-solutions/team-management/managing-members">
    管理整个组织中的成员、角色和权限。
  </Card>
  <Card title="API 参考" icon="code" href="/enterprise-solutions/api-reference">
    以编程方式访问 Cline 的企业功能。
  </Card>
</CardGroup>
