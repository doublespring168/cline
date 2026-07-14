---
title: "ACP：编辑器集成"
description: "通过 Agent Client Protocol 在 JetBrains、Neovim、Zed 和其他编辑器中使用 Cline"
---


Cline CLI 支持 [Agent Client Protocol（ACP）](https://agentclientprotocol.com/)，这是一项开放标准，使 AI 编码智能体能够跨不同编辑器和 IDE 工作。这意味着你可以在自己偏好的开发环境中使用完整的 Cline 智能体及其所有功能，包括技能、Hook（钩子）和 MCP 集成。

## 为什么选择 ACP？

- **编辑器灵活性**：在 JetBrains、Neovim、Zed 或任何兼容 ACP 的编辑器中使用 Cline
- **功能毫不妥协**：无论使用哪种编辑器，都能完整使用 Cline 的功能
- **团队一致性**：在不同的开发者工作流中使用相同的 AI 助手
- **开放标准**：基于 Zed 开放的 Agent Client Protocol 规范构建

## JetBrains IDE

[JetBrains](https://www.jetbrains.com) IDE 包括 IntelliJ IDEA、PyCharm、WebStorm 等。它们提供内置且支持 ACP 的 AI Assistant。

<Note>
**推荐：原生 JetBrains 插件**

为了获得最佳 JetBrains 体验，请从 JetBrains Marketplace 安装[原生 Cline 插件](/getting-started/installing-cline#ide-%E6%89%A9%E5%B1%95)。它提供完整的 IDE 集成与 Cline 体验。

下面的 ACP 设置是在 JetBrains IDE 中使用 Cline CLI 功能的另一种方式。
</Note>

或者，你可以通过 IntelliJ IDEA、PyCharm、WebStorm 以及所有其他 JetBrains IDE 内置且支持 ACP 的 AI Assistant 来运行 Cline CLI。

<video
  src="https://storage.googleapis.com/cline_public_images/cline-acp-jetbrains.mp4"
  autoPlay
  loop
  muted
  playsInline
  style={{ width: "100%", borderRadius: "8px", marginTop: "16px", marginBottom: "16px" }}
/>

### 设置

1. **安装 Cline CLI**（如果尚未安装）：
   ```bash
   npm i -g cline
   ```

2. **使用 Cline 进行身份验证**：
   ```bash
   cline auth
   ```

3. **配置 JetBrains AI Assistant**：
   - 打开你的 JetBrains IDE
   - 导航至 `Settings | Tools | AI Assistant | Agents`
   - 点击“添加自定义智能体”
   - 这会打开或创建 `~/.jetbrains/acp.json`

4. **将 Cline 添加到 `acp.json`**：
   ```json
   {
     "agent_servers": {
       "Cline": {
         "command": "cline",
         "args": ["--acp"],
         "env": {}
       }
     }
   }
   ```

5. **使用 Cline**：
   - 打开 AI Chat 工具窗口
   - 从智能体下拉列表中选择“Cline”
   - 开始在 JetBrains IDE 中使用 Cline 编码！

<Tip>
JetBrains AI Assistant 可以将其内置 MCP 服务器开放给 Cline，让 Cline 能够访问 IDE 特定的工具和上下文。
</Tip>

## Neovim

[Neovim](https://neovim.io) 是一款基于 Vim、可高度扩展的文本编辑器，因其速度和灵活性而深受开发者喜爱。通过提供 ACP 集成的 [agentic.nvim](https://github.com/carlos-algms/agentic.nvim) 或 [avante.nvim](https://github.com/yetone/avante.nvim) 插件，在 Neovim 中使用 Cline。

<video
  src="https://storage.googleapis.com/cline_public_images/cline-acp-neovim-avante.mp4"
  autoPlay
  loop
  muted
  playsInline
  style={{ width: "100%", borderRadius: "8px", marginTop: "16px", marginBottom: "16px" }}
/>

### 使用 agentic.nvim 设置

1. **安装 Cline CLI**（如果尚未安装）：
   ```bash
   npm i -g cline
   ```

2. **使用 Cline 进行身份验证**：
   ```bash
   cline auth
   ```

3. **使用 lazy.nvim 安装 agentic.nvim**：
   ```lua
   {
     "carlos-algms/agentic.nvim",
     opts = {
       provider = "cline-acp",
       acp_providers = {
         ["cline-acp"] = {
           command = "cline",
           args = {"--acp"},
         },
       },
     },
     keys = {
       {"<C-\\>", function() require("agentic").toggle() end, mode={"n","v","i"}, desc="Toggle Cline Chat"},
     },
   }
   ```

4. **使用 Cline**：
   - 按 `<C-\>` 切换 Cline 聊天
   - 开始在 Neovim 中使用 Cline 编码！

### 使用 avante.nvim 设置

按照 [avante.nvim 文档](https://github.com/yetone/avante.nvim)配置外部 ACP 智能体，并将其指向 `cline --acp`。

## Zed

[Zed](https://zed.dev) 是一款高性能的多人代码编辑器，从一开始就为速度和协作而打造。Zed 团队创建了 Agent Client Protocol，因此 Cline 与这款编辑器自然契合。

### 设置

1. **安装 Cline CLI**（如果尚未安装）：
   ```bash
   npm i -g cline
   ```

2. **使用 Cline 进行身份验证**：
   ```bash
   cline auth
   ```

3. **配置 Zed**：
   - 打开 Zed 设置（`Cmd/Ctrl + ,`）
   - 将 Cline 添加到你的 `settings.json`：
   ```json
   {
     "agent_servers": {
       "Cline": {
         "type": "custom",
         "command": "cline",
         "args": ["--acp"],
         "env": {}
       }
     }
   }
   ```

4. **使用 Cline**：
   - 打开 AI 助手面板
   - 从智能体下拉列表中选择“Cline”
   - 开始在 Zed 中使用 Cline 编码！

## 其他编辑器

任何支持 Agent Client Protocol 的编辑器都可以运行 Cline。请查阅你的编辑器文档，了解 ACP 配置说明，然后将其指向：

```bash
cline --acp
```

## 故障排除

### 智能体未出现

- 确保已全局安装 Cline CLI：`npm i -g cline`
- 检查身份验证状态：`cline auth`
- 检查 `cline --acp` 能否无错误运行
- 更改配置后重启编辑器

### 权限错误

如果 Cline 无法访问文件或运行命令：
- 检查编辑器的 ACP 集成是否传递了正确的工作目录
- 验证项目中的文件权限
- 确保已正确配置 Cline 的批准设置

### 连接问题

- 确保没有其他 Cline 实例正在使用同一配置目录
- 检查编辑器日志中与 ACP 相关的错误
- 尝试手动运行 `cline --acp` 以测试连接

## 了解更多

<Columns cols={2}>
  <Card title="CLI 概览" icon="terminal" href="/usage/cli-overview">
    了解 Cline CLI 的核心功能和使用场景。
  </Card>
  
  <Card title="无头模式" icon="robot" href="/usage/cli-overview#%E6%97%A0%E5%A4%B4%E6%A8%A1%E5%BC%8F">
    在脚本、CI/CD 流水线和自动化工作流中自主运行 Cline。
  </Card>
  
  <Card title="技能" icon="graduation-cap" href="/customization/skills">
    了解如何通过 ACP 在所有编辑器中使用 Cline 的技能。
  </Card>
  
  <Card title="Hook（钩子）" icon="link" href="/customization/hooks">
    了解如何在任何编辑器中使用 Hook 强制执行策略。
  </Card>
</Columns>
