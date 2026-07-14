---
title: "连接器"
sidebarTitle: "连接器"
description: "将 CLI 连接到 Telegram、Slack、Discord、Google Chat、WhatsApp 等平台。"
---
<Warning>
  此功能目前仅适用于 Cline CLI。
</Warning>

连接器让你可以从消息平台与智能体聊天。每条传入消息都会创建或继续一个智能体会话，智能体的回复会发送回对话。

## 设置向导

运行 `cline connect` 打开交互式向导，它会引导你完成平台选择、凭据输入、安全配置和高级选项（提供商、模型、系统提示词、智能体模式）。

```bash
cline connect
```

## 支持的平台

| 平台 | 直接命令 | 所需凭据 |
|----------|---------------|---------------------|
| Telegram | `cline connect telegram` | 机器人 token |
| Slack | `cline connect slack` | 机器人 token，以及 webhook 签名密钥/基础 URL 或 socket 应用 token |
| Discord | `cline connect discord` | 应用程序 ID、机器人 token、公钥、基础 URL |
| Google Chat | `cline connect gchat` | 服务账号凭据 JSON、基础 URL |
| WhatsApp | `cline connect whatsapp` | 电话号码 ID、访问 token、应用密钥、验证 token、基础 URL |
| Linear | `cline connect linear` | API 密钥、webhook 签名密钥、基础 URL |

## Telegram

<Steps>
  <Step title="创建 Telegram 机器人">
    打开 Telegram 并开始与 [@BotFather](https://t.me/BotFather) 聊天。发送 `/newbot` 并按照提示操作：

    1. 输入显示名称（例如“Cline”）
    2. 输入以 `bot` 结尾的用户名（例如 `cline_myname_bot`）。该用户名必须在整个 Telegram 中唯一。
    3. BotFather 会返回你的机器人 token（类似 `7123456789:AAH...`）
  </Step>

  <Step title="启动连接器">
    ```bash
    cline connect telegram -k <BOT-TOKEN>
    ```

    连接器会从 token 中发现机器人用户名。仅当需要覆盖该用户名时才使用 `--bot-username`。
  </Step>

  <Step title="与你的机器人聊天">
    打开 Telegram，搜索机器人的用户名并发送消息。智能体会处理消息并在聊天中回复。
  </Step>
</Steps>

### 安全性

默认情况下，任何找到你机器人的人都可以向它发送消息，而它会在你的机器上执行任务。`cline connect` 向导会询问是否限制 Telegram 访问，并可为你完成配置。

<Steps>
  <Step title="获取你的 Telegram 用户 ID">
    在 Telegram 上向 [@userinfobot](https://t.me/userinfobot) 发送消息。它会立即回复你的数字用户 ID。
  </Step>

  <Step title="使用向导">
    ```bash
    cline connect
    ```

    选择 Telegram，输入机器人 token，对访问限制选择“是”，然后输入你的用户 ID。
  </Step>

  <Step title="或手动传入标志">
    将 `12345` 替换为你的 Telegram 用户 ID：

    ```bash
    cline connect telegram -k <BOT-TOKEN> \
      --allowed-user-id 12345
    ```
  </Step>
</Steps>

仅当需要自定义访问逻辑时才使用 `--hook-command`。该 Hook 通过 stdin 接收每条传入消息及发送者信息。你的脚本返回 `{"action": "allow"}` 或 `{"action": "deny", "message": "reason"}`。如果没有 `--allowed-user-id` 或 `--hook-command`，所有内容都会自动批准，因此请限制能够访问正在运行的 Cline 实例的 Telegram 机器人。

## Slack

Slack 支持 webhook 模式和 socket 模式。每个 Slack 线程都映射到一个智能体会话，因此智能体会在线程内保持对话上下文。

Webhook 模式需要机器人 token、签名密钥和公共基础 URL：

```bash
cline connect slack \
  --bot-token <BOT-TOKEN> \
  --signing-secret <SECRET> \
  --base-url <URL>
```

将 Slack 应用的事件订阅和交互请求 URL 配置为 `<URL>/api/webhooks/slack`。

Socket 模式需要机器人 token，以及具有 `connections:write` 作用域的应用级 token：

```bash
cline connect slack \
  --bot-token <BOT-TOKEN> \
  --app-token <APP-LEVEL-TOKEN>
```

在 Slack 应用中启用 Socket Mode。Socket 模式不需要公共请求 URL，并且仅支持单个工作区。

## Discord

需要 Discord 应用程序 ID、机器人 token、公钥和公共基础 URL。
连接器在 `/api/webhooks/discord` 监听 Discord 交互，并且
还会启动 Discord 网关监听器，用于监听提及、回复、表情回应和私信。

<Steps>
  <Step title="创建 Discord 应用程序和机器人">
    打开 [Discord Developer Portal](https://discord.com/developers/applications)
    并创建一个应用程序。

    1. 在 **General Information** 中，复制 **Application ID** 和 **Public Key**。
    2. 在 **Bot** 中，如果机器人不存在则创建一个，然后重置并复制机器人 token。
    3. 如果希望普通消息、回复和私信包含文本内容，请启用 **Message Content Intent**。
  </Step>

  <Step title="公开一个公共基础 URL">
    对于本地开发，使用 ngrok 等隧道：

    ```bash
    ngrok http 8788
    ```

    复制 HTTPS 转发 URL。这就是你的连接器基础 URL，例如
    `https://1234-5678.ngrok-free.app`。
  </Step>

  <Step title="启动连接器">
    ```bash
    cline connect discord \
      --application-id <ID> \
      --bot-token <TOKEN> \
      --public-key <KEY> \
      --base-url <URL> \
      --port 8788 \
      --cwd /path/to/repo \
      --enable-tools
    ```

    `--app-id` 是 `--application-id` 的别名，而 `--token` 是
    `--bot-token` 的别名。

    `--enable-tools` 允许智能体从 Discord 检查文件、运行命令、编辑代码
    并准备 PR。如果机器人只应聊天，请省略此标志。
  </Step>

  <Step title="配置 Discord 交互端点">
    在 Discord Developer Portal 中，将 **Interactions Endpoint URL** 设置为：

    ```text
    <base-url>/api/webhooks/discord
    ```

    例如：

    ```text
    https://1234-5678.ngrok-free.app/api/webhooks/discord
    ```

    你可以使用以下命令验证连接器是否可访问：

    ```bash
    curl <base-url>/health
    ```
  </Step>

  <Step title="邀请机器人加入测试服务器">
    在 **OAuth2 > URL Generator** 中，选择 `bot` 和
    `applications.commands` 作用域，然后授予机器人发送
    消息和读取消息历史记录的权限。打开生成的 URL，将机器人安装
    到你的测试服务器中。
  </Step>

  <Step title="与机器人聊天">
    在服务器频道中提及机器人、在机器人创建的线程中回复，或向机器人发送
    私信。每个 Discord 对话都会保留自己的智能体会话和上下文。
  </Step>
</Steps>

### Discord 命令参考

在 Discord 中发送以下命令：

| 命令 | 描述 |
|---------|-------------|
| `/help` 或 `/start` | 显示连接器帮助 |
| `/new` 或 `/clear` | 为此 Discord 对话启动全新会话 |
| `/whereami` | 显示线程、频道、私信状态、`cwd`、`workspaceRoot`、工具和 YOLO 状态 |
| `/tools [on\|off\|toggle]` | 查看或更改是否允许仓库、文件和 shell 工具 |
| `/yolo [on\|off\|toggle]` | 查看或更改工具自动批准 |
| `/cwd [path]` | 查看或更改此对话的工作目录 |
| `/schedule create/list/trigger/delete` | 管理以此对话为目标的定时工作流 |
| `/abort` | 停止当前任务 |
| `/exit` | 停止连接器 |

普通消息会被视为智能体任务。如果任务已在运行，普通
消息会引导当前任务。

### Discord 安全性

默认情况下，任何能够访问机器人的人都可以要求它运行任务。使用
`--hook-command` 限制访问。该 Hook 接收 Discord 用户的参与者键，
例如 `discord:user:123456789`。

```bash
cline connect discord \
  --application-id <ID> \
  --bot-token <TOKEN> \
  --public-key <KEY> \
  --base-url <URL> \
  --hook-command 'jq -r ".payload.actor.participantKey" | grep -q "discord:user:123456789" && echo "{\"action\":\"allow\"}" || echo "{\"action\":\"deny\",\"message\":\"unauthorized\"}"'
```

## Google Chat

需要服务账号凭据 JSON 文件和公共基础 URL。

```bash
cline connect gchat --credentials <JSON> --base-url <URL>
```

## WhatsApp

需要电话号码 ID、访问 token、应用密钥、webhook 验证 token 和公共基础 URL。

```bash
cline connect whatsapp --phone-id <ID> --token <TOKEN> --app-secret <SECRET> --base-url <URL>
```

## Linear

需要 API 密钥、webhook 签名密钥和公共基础 URL。

```bash
cline connect linear --api-key <KEY> --signing-secret <SECRET> --base-url <URL>
```

## 管理连接器

```bash
# Stop all connectors
cline connect --stop

# Stop a specific connector
cline connect telegram --stop
```

## Hook 命令协议

`--hook-command` 模式适用于所有连接器。脚本通过 stdin 接收 JSON 载荷：

```json
{
  "payload": {
    "actor": {
      "participantKey": "telegram:id:12345",
      "displayName": "User Name"
    },
    "message": "The incoming message text"
  }
}
```

返回 `{"action": "allow"}` 或 `{"action": "deny", "message": "reason"}`。

## 运行多个连接器

多个连接器可以同时运行。它们都共享同一个 Hub：

```bash
# Terminal 1
cline connect telegram -k $TELEGRAM_TOKEN

# Terminal 2
cline connect slack --bot-token $SLACK_TOKEN --signing-secret $SECRET --base-url $URL
```

连接器需要 Hub。如果它没有自动启动，请使用 `cline hub start` 启动。
