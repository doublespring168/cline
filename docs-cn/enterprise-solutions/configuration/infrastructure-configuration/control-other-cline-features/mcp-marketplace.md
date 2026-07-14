---
title: "MCP 市场"
sidebarTitle: "MCP 市场"
description: "用于 MCP 市场访问、服务器允许列表和远程 MCP 服务器管理的企业控制"
---

MCP 市场让开发者可以发现并安装扩展 Cline 功能的 MCP 服务器。对于 Enterprise 管理员，本页介绍如何控制市场访问、限制可用的服务器，以及向您的组织推送预配置的 MCP 服务器。

<Note>
有关 MCP 市场以及开发者如何使用它的完整详情，请参阅[轻松使用 MCP](/mcp/mcp-marketplace)。
</Note>

## 概述

Enterprise 管理员有四个配置选项，可用于管理整个组织的 MCP 服务器使用情况：

| 设置 | 用途 |
|---------|---------|
| `mcpMarketplaceEnabled` | 完全启用或禁用 MCP 市场 |
| `allowedMCPServers` | 将市场限制为仅允许已批准的 MCP 服务器 |
| `remoteMCPServers` | 向所有用户推送预配置的远程 MCP 服务器 |
| `blockPersonalRemoteMCPServers` | 阻止用户添加自己的远程 MCP 服务器 |

这些设置通过您组织的[远程配置](/enterprise-solutions/configuration/remote-configuration/overview)应用，并立即对所有团队成员生效。

## 禁用 MCP 市场

要为您的组织完全禁用 MCP 市场，请将 `mcpMarketplaceEnabled` 设置为 `false`：

```json
{
  "mcpMarketplaceEnabled": false
}
```

当 `mcpMarketplaceEnabled` 设置为 `false` 时：
- 对所有用户隐藏 MCP 市场选项卡
- 用户无法从市场浏览或安装 MCP 服务器
- 本地配置的 MCP 服务器会被阻止
- 企业策略优先于个人偏好

当 `mcpMarketplaceEnabled` 设置为 `true` 或省略时：
- 用户可以自由浏览和安装市场中的 MCP 服务器
- 市场访问不受任何组织限制

<Warning>
完全禁用市场也会阻止本地配置的 MCP 服务器。如果您想允许特定服务器并限制其他服务器，请改用下述允许列表方法。
</Warning>

## 将市场限制为已批准的服务器

您不必完全禁用市场，而是可以使用 `allowedMCPServers` 设置，将其限制为精心挑选的已批准 MCP 服务器列表。这是大多数企业的推荐方法——它让开发者能从 MCP 中获益，同时确保只有经过审查的服务器可用。

### 配置

将 `allowedMCPServers` 数组添加到您的远程配置中。每个条目都需要一个 `id` 字段，其值设置为服务器的 GitHub 存储库路径：

```json
{
  "allowedMCPServers": [
    { "id": "github.com/modelcontextprotocol/server-filesystem" },
    { "id": "github.com/modelcontextprotocol/server-github" },
    { "id": "github.com/your-org/internal-mcp-server" }
  ]
}
```

### 工作原理

配置 `allowedMCPServers` 后：
- 市场目录会经过筛选，**仅**显示允许列表中的服务器
- 用户可以浏览、查看详情并安装列表中的任何服务器
- 不在列表中的服务器会从市场中完全隐藏
- 允许列表适用于组织中的所有团队成员

省略 `allowedMCPServers` 或将其设为 `undefined` 时：
- 完整的市场目录可用，不受任何限制

将 `allowedMCPServers` 设置为空数组 (`[]`) 时：
- 市场不显示任何服务器——这实际上禁用了安装功能，但仍保留 UI 可见

### 查找服务器 ID

每个允许的服务器的 `id` 都是其 GitHub 存储库路径（不含 `https://` 前缀）。例如：

| 服务器 | ID |
|--------|----|
| Filesystem | `github.com/modelcontextprotocol/server-filesystem` |
| GitHub | `github.com/modelcontextprotocol/server-github` |
| 自定义内部服务器 | `github.com/your-org/your-mcp-server` |

您可以查看 [MCP 市场](/mcp/mcp-marketplace)中任何服务器的 `githubUrl` 字段并移除 `https://` 前缀，以找到正确的 ID。

## 推送预配置的远程 MCP 服务器

使用 `remoteMCPServers` 可直接向所有用户推送 MCP 服务器，而无需他们从市场安装任何内容。这非常适合需要特定配置的内部 MCP 服务器或第三方服务器。

### 配置

```json
{
  "remoteMCPServers": [
    {
      "name": "Internal Code Search",
      "url": "https://mcp.internal.yourcompany.com/code-search",
      "alwaysEnabled": true,
      "headers": {
        "Authorization": "Bearer ${AUTH_TOKEN}"
      }
    },
    {
      "name": "Documentation Server",
      "url": "https://mcp.internal.yourcompany.com/docs",
      "alwaysEnabled": false
    }
  ]
}
```

### 远程服务器选项

每个远程 MCP 服务器条目都支持以下字段：

| 字段 | 类型 | 必需 | 描述 |
|-------|------|----------|-------------|
| `name` | string | 是 | 服务器的显示名称 |
| `url` | string | 是 | MCP 服务器的 URL 端点 |
| `alwaysEnabled` | boolean | 否 | 当为 `true` 时，用户无法禁用此服务器 |
| `headers` | object | 否 | 用于身份验证的自定义 HTTP 标头 |

### 始终启用的服务器

当 `alwaysEnabled` 设置为 `true` 时：
- 服务器会对所有用户自动激活
- 用户无法关闭该服务器
- 服务器会显示在用户的 MCP 配置中，但禁用控件会被锁定
- 这适用于必须始终可用的合规、安全或内部工具服务器

## 阻止个人远程 MCP 服务器

要阻止用户添加自己的远程 MCP 服务器，请将 `blockPersonalRemoteMCPServers` 设置为 `true`：

```json
{
  "blockPersonalRemoteMCPServers": true
}
```

当 `blockPersonalRemoteMCPServers` 为 `true` 时：
- 用户无法自行添加或配置远程 MCP 服务器
- 只有组织的 `remoteMCPServers` 配置中定义的服务器可用
- 这可确保所有远程 MCP 连接都通过已批准、由组织管理的端点

当 `blockPersonalRemoteMCPServers` 为 `false` 或省略时：
- 用户可以自由添加自己的远程 MCP 服务器连接

## 组合配置示例

### 严格受限的环境

对于需要严格控制所有 MCP 服务器访问的组织：

```json
{
  "mcpMarketplaceEnabled": true,
  "allowedMCPServers": [
    { "id": "github.com/modelcontextprotocol/server-filesystem" },
    { "id": "github.com/modelcontextprotocol/server-github" }
  ],
  "remoteMCPServers": [
    {
      "name": "Internal API Gateway",
      "url": "https://mcp.internal.yourcompany.com/gateway",
      "alwaysEnabled": true,
      "headers": {
        "X-Api-Key": "org-managed-key"
      }
    }
  ],
  "blockPersonalRemoteMCPServers": true
}
```

此配置：
- 允许使用市场，但将其限制为两个已批准的服务器
- 向所有用户推送一个始终启用的内部 MCP 服务器
- 阻止用户添加自己的远程 MCP 服务器

### 包含内部服务器的开放环境

对于希望灵活访问内部服务器的组织：

```json
{
  "remoteMCPServers": [
    {
      "name": "Company Knowledge Base",
      "url": "https://mcp.yourcompany.com/kb",
      "alwaysEnabled": true
    }
  ]
}
```

此配置：
- 保持完整市场开放（无 `allowedMCPServers` 限制）
- 确保所有开发者都能访问公司的知识库
- 允许用户添加自己的远程 MCP 服务器

### 禁用市场，仅使用内部服务器

对于希望全面管理 MCP 体验的组织：

```json
{
  "mcpMarketplaceEnabled": false,
  "remoteMCPServers": [
    {
      "name": "Approved Code Assistant",
      "url": "https://mcp.internal.yourcompany.com/code-assist",
      "alwaysEnabled": true
    },
    {
      "name": "Internal Docs Search",
      "url": "https://mcp.internal.yourcompany.com/docs",
      "alwaysEnabled": true
    }
  ],
  "blockPersonalRemoteMCPServers": true
}
```

此配置：
- 完全禁用市场
- 仅提供由组织管理的 MCP 服务器
- 阻止用户添加任何其他远程服务器

## 企业策略建议

### 推荐方法

大多数组织应**使用允许列表** (`allowedMCPServers`)，而不是完全禁用市场。这样既能让开发者访问实用工具，又能确保对每个服务器进行安全审查。

<AccordionGroup>
  <Accordion title="安全审查流程" icon="shield">
    在将 MCP 服务器添加到允许列表之前：
    - 在 GitHub 上查看服务器的源代码
    - 评估服务器的权限和数据访问模式
    - 检查是否有积极的维护和安全实践
    - 评估服务器的数据处理是否满足您的合规要求
    - 在批准前于沙盒环境中测试服务器
  </Accordion>

  <Accordion title="内部 MCP 服务器" icon="building">
    对于内部工具，请使用设置了 `alwaysEnabled: true` 的 `remoteMCPServers`：
    - 将 Cline 连接到内部 API、数据库和知识库
    - 确保所有开发者都能获得一致的访问权限
    - 通过自定义标头集中管理身份验证
    - 使用 `blockPersonalRemoteMCPServers` 防止影子 IT
  </Accordion>

  <Accordion title="合规注意事项" icon="clipboard-check">
    MCP 服务器可以访问外部 API 并处理数据：
    - 审计哪些服务器处理敏感数据
    - 确保服务器符合您的数据驻留要求
    - 在安全策略中记录已批准的服务器
    - 定期审查和更新您的允许列表
  </Accordion>
</AccordionGroup>

### 按组织规模划分的建议

#### 小型团队（5–20 名开发者）
- **市场：** 开放，或使用允许列表进行轻度限制
- **远程服务器：** 根据需要推送内部服务器
- **个人服务器：** 在提供指导的情况下允许
- **审查频率：** 每季度审查允许列表

#### 中型组织（20–100 名开发者）
- **市场：** 限制为已批准的允许列表
- **远程服务器：** 使用 `alwaysEnabled` 推送内部服务器
- **个人服务器：** 考虑阻止 (`blockPersonalRemoteMCPServers: true`)
- **审查频率：** 每月审查允许列表

#### 大型企业（100+ 名开发者）
- **市场：** 严格限制为经过审查的允许列表
- **远程服务器：** 所有 MCP 访问都通过由组织管理的服务器
- **个人服务器：** 阻止 (`blockPersonalRemoteMCPServers: true`)
- **审查频率：** 对新服务器执行包含安全审查的正式批准流程

## 支持和问题

如需 MCP 市场策略的配置帮助：
- 查看[远程配置概述](/enterprise-solutions/configuration/remote-configuration/overview)
- 有关市场功能详情，请参阅[轻松使用 MCP](/mcp/mcp-marketplace)
- 有关一般 MCP 概念，请参阅 [MCP 概述](/mcp/mcp-overview)
- 联系您的 Enterprise 支持代表
- 加入我们的 [Discord](https://discord.gg/cline) 参与社区讨论
