---
title: "软件包"
sidebarTitle: "软件包"
description: "SDK 软件包如何协同工作、每个软件包导出什么，以及在何处强制实施边界。"
---

SDK 被拆分为分层的软件包。依赖关系向下流动：`core` 依赖 `agents`、`llms` 和 `shared`；`agents` 依赖 `llms` 和 `shared`；`llms` 依赖 `shared`。

## 软件包栈

```txt
Your application / CLI / VS Code / JetBrains
          │
          ▼
@cline/core
Sessions, storage, built-in tools, hub, automation, telemetry
          │
          ├── @cline/agents
          │   Browser-compatible AgentRuntime / Agent loop
          │
          ├── @cline/llms
          │   Provider handlers, gateway, model catalogs
          │
          └── @cline/shared
              Types, schemas, tools, hooks, extension contracts
```

## 软件包

### @cline/core

Node 运行时/编排层。

主要导出包括：

| 导出 | 描述 |
|--------|-------------|
| `ClineCore` | 主运行时入口点 |
| `ClineCoreOptions` | 构造函数选项 |
| `ClineCoreStartInput` | 会话启动输入 |
| `CoreSessionConfig` | 会话配置 |
| `SessionRecord` | 持久化的会话元数据 |
| `AgentPlugin` | 公共插件类型 |
| `createTool` | 从 shared 重新导出 |

功能包括：

- local/hub/remote 运行时后端
- 会话清单和消息产物
- 内置工具
- 工具批准
- 自动化/计划任务服务
- 遥测钩子
- 插件/扩展加载
- 团队/子智能体工具

依赖：`@cline/shared`、`@cline/llms`、`@cline/agents`。

### @cline/agents

兼容浏览器的智能体执行循环。

主要导出包括：

| 导出 | 描述 |
|--------|-------------|
| `AgentRuntime` | 核心运行时类 |
| `Agent` | `AgentRuntime` 的别名 |
| `createAgentRuntime`, `createAgent` | 工厂函数 |
| `AgentRuntimeConfig` | 构造函数配置联合类型 |
| `AgentRunInput`, `AgentEventListener` | 运行时辅助类型 |
| `createTool` | 从 `@cline/shared` 重新导出 |

`AgentRuntime` 上的方法包括 `run`、`continue`、`abort`、`subscribe`、`restore` 和 `snapshot`。

依赖：`@cline/shared`、`@cline/llms`。

### @cline/llms

提供商和模型层。

主要导出包括：

| 导出 | 描述 |
|--------|-------------|
| `DefaultGateway`, `createGateway` | 用于创建由提供商支持的智能体模型的网关 |
| `createHandler`, `createHandlerAsync` | 提供商处理程序工厂 |
| `getAllProviders`, `getProviderIds`, `getModelsForProvider` | 目录辅助函数 |
| `registerProvider`, `registerModel` | 运行时注册表扩展 |
| `ModelInfo`, `ProviderInfo` | 提供商/模型元数据 |

依赖：`@cline/shared`。

### @cline/shared

用于共享契约和实用工具的基础软件包。

主要导出包括：

| 导出 | 描述 |
|--------|-------------|
| `createTool` | 用于创建类型化工具的辅助函数 |
| `AgentTool`, `AgentToolContext`, `ToolPolicy` | 工具接口 |
| `AgentEvent`, `AgentResult`, `AgentConfig` | 面向宿主的智能体类型 |
| `AgentRuntimeEvent`, `AgentRunResult` | 面向运行时的智能体类型 |
| `HookEngine`, `HookStage`, `HookPolicies` | 钩子契约和引擎 |
| `ContributionRegistry`, `AgentExtensionApi` | 扩展注册契约 |
| `ModelInfo`, `Message`, `ContentBlock` | 模型/消息类型 |
| `BasicLogger`, `noopBasicLogger` | 日志记录契约 |

不依赖更高层的软件包。

## 安装

```bash
npm install @cline/sdk
```

`@cline/sdk` 重新导出 `@cline/core` 中的所有内容。只有在需要更底层控制时，才直接安装 `@cline/agents` 或 `@cline/llms`。

## 设计原则

### 严格的依赖方向

依赖关系仅向下流动。较低层保持可嵌入性，无需引入完整运行时。

### 兼容浏览器的智能体循环

`@cline/agents` 提供兼容浏览器的运行时。它不负责会话存储、内置文件/shell 工具、中心传输或 Node 特定的编排。

### Core 作为编排层

`@cline/core` 负责 Node 运行时集成：会话持久化、内置工具、自动化、中心/远程传输、遥测和扩展加载。
