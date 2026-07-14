---
title: "中心辐射式架构"
sidebarTitle: "中心与辐射节点"
description: "本地守护进程协调各客户端之间的会话，而辐射节点工作进程负责智能体执行。"
---

SDK 在生产部署中采用中心辐射式架构。后台守护进程（中心）协调会话状态和事件路由，辐射节点工作进程执行智能体循环，而客户端（CLI、VS Code、JetBrains 等）则通过 WebSocket 作为对等节点接入。

## 为什么采用中心辐射式架构？

单进程架构适用于简单脚本，但当你需要以下能力时就会力不从心：

- 窗口关闭或 CLI 退出后仍然存续的会话
- 多个客户端查看和控制同一个会话
- 在没有客户端连接时运行的定时智能体
- 通过进程隔离，避免失控的智能体冻结 UI

中心辐射式模型通过将协调、执行以及客户端 UI 三者分离，解决了所有这些问题。

## 三种角色

<CardGroup cols={3}>
  <Card title="中心" icon="circle-nodes">
    每台机器上运行的单例守护进程。协调会话、路由事件和批准请求、管理计划任务，并在客户端之间代理能力。不运行智能体循环。
  </Card>
  <Card title="辐射节点" icon="gear">
    运行 `@cline/core` 的工作进程。执行智能体循环、调用工具、流式传输输出。将事件报告回中心。由守护进程而非任何客户端所有。
  </Card>
  <Card title="客户端" icon="display">
    CLI、VS Code、JetBrains 或任何自定义应用。发现中心、通过 WebSocket 注册、附加到会话、发送用户输入并接收流式事件。
  </Card>
</CardGroup>

保持架构清晰的一条规则是：客户端参与，辐射节点执行，中心协调。任何两种角色都不应重叠。

## 通信流程

客户端通过 WebSocket 连接到中心。中心路由命令并流式传输事件。辐射节点向中心报告，而绝不直接向客户端报告。

<Steps>
  <Step title="客户端发现或启动中心">
    中心是每台机器上的单例守护进程。如果中心未运行，`ClineCore` 会自动启动它。发现机制使用位于 `~/.cline/locks/hub/owners/` 的锁文件。
  </Step>
  <Step title="客户端注册并附加到会话">
    客户端通过 WebSocket 发送 `client.register` 命令，通告其能力（shell 访问、文件编辑、差异查看等）。随后它会创建会话或附加到会话。
  </Step>
  <Step title="中心分配辐射节点执行任务">
    中心生成或分配一个辐射节点工作进程来运行智能体循环。辐射节点执行工具、流式传输部分输出，并处理中止/取消操作。
  </Step>
  <Step title="中心将事件扇出到所有已附加的客户端">
    当辐射节点产生事件（文本增量、工具调用、用量）时，中心会将这些事件中继给附加到该会话的每个客户端。客户端可以随时加入和离开，而不会中断执行。
  </Step>
  <Step title="客户端断开连接，会话继续运行">
    如果 CLI 退出或窗口关闭，辐射节点会继续执行。另一个客户端可以附加到同一会话，并在执行过程中接续事件流。
  </Step>
</Steps>

## 后端模式

`ClineCore` 根据配置选择执行模式：

```typescript
const cline = await ClineCore.create({
  clientName: "my-app",
  backendMode: "auto",
})
```

| 模式 | 行为 |
|------|----------|
| `auto` | 可用时优先使用兼容的本地中心，不可用时回退到本地进程内执行。这是默认模式。 |
| `hub` | 要求存在兼容的 WebSocket 中心。如果无法访问，则抛出错误。 |
| `remote` | 要求显式指定远程 WebSocket 中心端点。适用于中心不在用户机器上的部署。 |
| `local` | 始终使用本地进程内执行以及本地 SQLite/文件存储。没有中心，也没有共享会话。 |

### 何时使用各种模式

以下情况使用 `local`：
- 简单脚本和一次性任务
- 测试和开发
- 不适合运行后台进程的环境

以下情况使用 `hub`（或 `auto`）：
- 客户端重启后仍需保持会话
- 多个客户端共享同一会话
- 定时智能体
- 连接器集成（Telegram、Slack 等）

以下情况使用 `remote`：
- 中心运行在服务器上的云部署
- 团队共享的中心实例

## 能力代理

当多个客户端附加到一个会话时，中心会将能力请求路由给能够处理它们的客户端。客户端在注册时通告其能力。

例如，VS Code 可能会注册 `open-file`、`reveal-diff` 和 `run-build` 能力。CLI 可能会注册 `shell` 和 `run-tests`。当智能体需要打开差异时，中心会将请求路由到 VS Code。当它需要运行 shell 命令时，中心会将请求路由到 CLI。

这意味着随着更多客户端加入，会话将获得更丰富的能力。CLI 会话可以在 VS Code 附加后得到增强 -- IDE 中的选择内容可以发送到正在运行的终端会话中，或者一个客户端创建的差异可以由另一个客户端打开。

## 会话持久化

会话连同完整对话历史、工具调用记录和元数据一起存储。中心维护 SQLite 索引以实现高效列出，并将 JSON 快照作为每个会话状态的事实来源。

```
~/.cline/data/sessions/
  sessions.db                    # SQLite index
  [session-id].json              # Authoritative session record
```

会话可以有多个参与者，每个参与者都带有一个被跟踪的角色（`creator`、`participant`、`observer`）。会话独立于任何单个客户端的生命周期而持久存在。

## 管理中心

当 `ClineCore` 需要中心时，它会自动启动。你也可以手动管理它：

```bash
cline hub start      # Start the hub daemon
cline hub stop       # Stop it
cline hub status     # Check if running
cline hub ensure     # Start if not running, return URL
```

中心默认监听 `127.0.0.1:25463`，并将日志写入 `~/.cline/logs/hub-daemon.log`。

## 多客户端访问

多个客户端可以同时连接到同一个中心，并附加到同一个会话：

```bash
# Terminal 1: start a task
cline "Work on feature X"

# Terminal 2: attach to the same session from VS Code or another CLI

# Terminal 3: Telegram connector
cline connect telegram -k $TOKEN

# All three share the same hub and can access the same sessions
```

## 进程隔离

如果客户端崩溃，中心及其正在运行的辐射节点不会受到影响。会话会在辐射节点工作进程中继续执行。当客户端重新连接（或另一个客户端附加）时，它会接收完整的会话历史记录，并恢复实时事件流。

辐射节点本身也与中心存在进程边界。辐射节点中失控的模型调用不会削弱中心协调其他会话、路由批准请求或扇出事件的能力。
