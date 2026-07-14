---
title: "MCP"
sidebarTitle: "MCP"
description: "在 Cline 中添加、配置和使用 MCP 服务器。"
---

MCP (Model Context Protocol) 让 Cline 可以通过 MCP 服务器使用外部工具和数据源。

## MCP 为你带来什么

- 将 Cline 连接到外部 API 和服务
- 添加 Cline 内置工具之外的自定义工具
- 使用本地服务器或远程托管服务器

## 快速开始

1. 在 Cline 中打开 **MCP 服务器**
2. 添加服务器（从市场添加或手动添加）
3. 配置凭据/环境变量
4. 验证工具是否出现，并测试一次工具调用

## 添加服务器

### 选项 1：市场

在可用时，使用 Cline 的 MCP 市场一键安装。
1. 在 Cline 面板中，点击 MCP 服务器图标（顶部工具栏中的堆叠服务器图标）。
2. 打开市场选项卡。

### 选项 2：手动配置

编辑 MCP 配置文件，并添加以下任一种配置：

- **CLI：** `~/.cline/mcp.json`
- **IDE 扩展：**
  1. 在 Cline 面板中，点击 **MCP 服务器**图标（顶部工具栏中的堆叠服务器图标）。
  2. 打开**配置**选项卡。
  3. 点击**配置 MCP 服务器**（靠近底部的按钮）。
  4. 这会打开扩展使用的 MCP 设置 JSON；在 `mcpServers` 下添加/更新条目。
  - 如果你要添加托管端点（而不是直接编辑 JSON），请使用**远程服务器**选项卡：
    1. 输入**服务器名称**（任意唯一标签）。
    2. 输入**服务器 URL**（完整端点 URL）。
    3. 选择**传输类型**：
       - **Streamable HTTP**（推荐）
       - **SSE（旧版）**
    4. 点击**添加服务器**。

  - 服务器配置形式：
    - 使用 `command` + `args` 的**本地 (STDIO)** 服务器
    - 使用 `url` 的**远程 (HTTP/SSE)** 服务器

### CLI MCP 向导

在 CLI 中运行：

```bash
cline mcp
```

该向导支持：

| 操作 | 描述 |
|---|---|
| 列出服务器 | 显示已配置的服务器及启用/禁用状态 |
| 添加服务器 | 创建新的 MCP 服务器条目 |
| 编辑服务器 | 修改现有服务器 |
| 启用/禁用 | 在不删除服务器的情况下切换其状态 |
| 删除服务器 | 永久移除服务器 |

添加服务器时，CLI 会提示输入服务器名称、传输类型、命令/参数（针对 stdio）或 URL/请求头（针对远程传输）。

## 配置示例

### 本地服务器 (STDIO)

```json
{
  "mcpServers": {
    "local-server": {
      "command": "node",
      "args": ["/path/to/server.js"],
      "env": {
        "API_KEY": "your_api_key"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### 远程服务器 (HTTP/SSE)

```json
{
  "mcpServers": {
    "remote-server": {
      "url": "https://example.com/mcp",
      "headers": {
        "Authorization": "Bearer your-token"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

## 传输类型

- **STDIO**：本地进程，延迟更低，本地设置更简单
- **远程 HTTP/SSE**：托管端点，集中式部署，支持多客户端使用

本地工具使用 STDIO，共享的托管服务使用远程传输。

## 管理服务器

在 MCP 设置中，你可以：

- 启用/禁用服务器
- 重启无响应的服务器
- 设置请求超时时间
- 移除服务器

## 安全基础

- 仅安装你信任的服务器
- 将密钥存储在环境变量中
- 将 `autoApprove` 限制为安全工具
- 批准前检查工具调用

## 故障排除

| 问题 | 修复方法 |
|---|---|
| 服务器无法连接 | 验证命令/URL、服务器进程状态和端口 |
| 工具缺失 | 确认服务器已成功启动且工具已公开 |
| 身份验证错误 | 重新检查 API 密钥/令牌和必需的请求头 |
| 超时错误 | 增加 MCP 超时时间并直接测试服务器响应 |

## CLI

MCP 也可在 Cline CLI 中使用。在 CLI MCP 设置中配置服务器，并使用相同的服务器定义。

你也可以以非交互方式列出服务器：

```bash
cline config mcp
cline config mcp --json
```
