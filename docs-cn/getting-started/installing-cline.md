---
title: "安装 Cline"
description: "选择你的安装方式：IDE 扩展、CLI、SDK 或 Kanban"
---

## 选择安装方式

- [IDE 扩展](#ide-%E6%89%A9%E5%B1%95) — VS Code、Cursor、JetBrains、Windsurf、VSCodium、Antigravity
- [CLI](#cli) — 终端工作流
- [Kanban](#kanban)（预览版）— 通过 Kanban 看板轻松管理多个智能体
- [SDK](#sdk) — 使用 `@cline/sdk` 构建

## IDE 扩展

如果你希望在编辑器 UI 中使用 Cline，请选择此方式。

<Tabs>
  <Tab title="VS Code / Cursor / Windsurf / VSCodium / Antigravity">
    <Steps>
      <Step title="打开扩展">
        按下 `Ctrl/Cmd + Shift + X`。
      </Step>
      <Step title="搜索 Cline">
        输入 `Cline`。
      </Step>
      <Step title="安装">
        在 Cline 扩展上点击**安装**。
      </Step>
      <Step title="打开 Cline">
        使用 Cline 活动栏图标，或从命令面板运行 `Cline: Open In New Tab`。
      </Step>
      <Step title="通过 Cline 授权">
        安装扩展后，在 Cline 设置中完成提供商设置。

        [通过 Cline 授权](/getting-started/authorizing-with-cline)
      </Step>
    </Steps>

    <Note>
    Windsurf 和 VSCodium 使用 Open VSX。安装流程相同。
    </Note>
  </Tab>

  <Tab title="JetBrains">
    <Steps>
      <Step title="打开插件市场">
        **设置** → **插件** → **市场**。
      </Step>
      <Step title="安装 Cline">
        搜索 `Cline`，点击**安装**，然后重启 IDE。
      </Step>
      <Step title="打开 Cline">
        **视图** → **工具窗口** → **Cline**。
      </Step>
      <Step title="通过 Cline 授权">
        安装扩展后，在 Cline 设置中完成提供商设置。

        [通过 Cline 授权](/getting-started/authorizing-with-cline)
      </Step>
    </Steps>

    另一种方式：从 [JetBrains Marketplace](https://plugins.jetbrains.com/plugin/28247-cline) 安装。
  </Tab>
</Tabs>

## CLI

如果你希望在终端工作流（交互 + 自动化）中使用 Cline，请选择此方式。

<Steps>
  <Step title="安装 Node.js">
    安装 Node.js 20+（推荐 22）。
  </Step>
  <Step title="安装 CLI">
    ```bash
    npm install -g cline
    ```
  </Step>
  <Step title="进行身份验证">
    ```bash
    cline auth
    ```
  </Step>
  <Step title="运行 Cline">
    ```bash
    cline
    # or
    cline "your task"
    ```
  </Step>
</Steps>

更多详细信息：[CLI 安装与设置](/usage/cli-overview)

## Kanban

如果你希望使用由智能体执行任务的任务看板工作流，请选择此方式。

<Steps>
  <Step title="安装 Node.js">
    安装 Node.js 18+。
  </Step>
  <Step title="启动 Kanban">
    ```bash
    npx kanban
    ```
  </Step>
</Steps>

更多详细信息：[Kanban](/usage/kanban)

## SDK

如果你要基于 Cline 构建自己的应用程序/智能体，请选择此方式。

<Steps>
  <Step title="创建项目">
    ```bash
    mkdir my-agent && cd my-agent
    npm init -y
    ```
  </Step>
  <Step title="安装 SDK">
    ```bash
    npm install @cline/sdk
    ```
  </Step>
  <Step title="构建并运行">
    浏览 SDK 示例以运行你的第一个智能体。
  </Step>
</Steps>

从这里开始：[SDK 示例](/sdk/examples)


## 需要帮助？

- [故障排除](/troubleshooting/networking-and-proxies)
- [Discord 社区](https://discord.gg/cline)
