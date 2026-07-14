---
title: "安装插件"
sidebarTitle: "安装插件"
description: "使用 CLI 或以编程方式从文件 URL、npm、git 或本地源安装插件。"
---

Cline CLI 提供了 `plugin install` 命令，用于从各种来源安装插件。你也可以通过会话配置以编程方式加载插件。

## CLI 安装

使用 `cline plugin install` 命令从文件 URL、npm、git 仓库或本地路径安装插件。

```sh
cline plugin install <source> [options]
```

也可以使用简写形式 `cline plugin i`。

### 从文件 URL 安装

```sh
cline plugin install https://github.com/cline/cline/blob/main/sdk/examples/plugins/weather-metrics.ts
cline plugin install https://raw.githubusercontent.com/cline/cline/main/sdk/examples/plugins/weather-metrics.ts
```

从 HTTPS URL 安装单个 `.ts` 或 `.js` 插件文件。GitHub `blob` URL 会自动转换为原始文件下载地址。

### 从 npm 安装

```sh
cline plugin install --npm @scope/plugin-name
```

将 npm 注册表中的包安装到 Cline 插件目录。

### 从 Git 安装

```sh
cline plugin install --git https://github.com/owner/repo.git
cline plugin install --git github.com/owner/repo
```

克隆仓库（浅克隆，并使用无 blob 过滤器来提高速度）并安装其依赖项。最终安装中不包含 `.git` 目录。

### 从本地源安装

```sh
cline plugin install ./path/to/plugin.ts     # Single file
cline plugin install /absolute/path/to/dir   # Directory with package.json
```

同时支持文件和目录。本地安装会复制源文件，过滤掉 `.git` 和 `node_modules`，并运行 `npm install` 以解析依赖项。

### 选项

| 选项 | 说明 |
|--------|-------------|
| `--npm` | 将源视为 npm 软件包名称 |
| `--git` | 将源视为 git 仓库 URL |
| `--force` | 覆盖相同路径下的现有插件 |
| `--json` | 以 JSON 格式输出结果（便于编写脚本） |
| `--cwd` | 安装到 `<path>/.cline/plugins`，并从 `<path>` 解析相对本地路径 |

### 示例

```sh
# Install a local plugin directory
cline plugin install ./my-custom-plugin

# Install a single plugin file from GitHub
cline plugin install https://github.com/cline/cline/blob/main/sdk/examples/plugins/weather-metrics.ts

# Install an npm package as a plugin
cline plugin install --npm @cline/plugin-sql

# Install from a GitHub repo
cline plugin install --git https://github.com/my-org/my-plugin.git

# Force reinstall an existing plugin
cline plugin install --force --npm @scope/plugin-name

# Use shorthand
cline plugin i --git github.com/owner/repo
```

### 列出已安装的插件

已安装的插件会出现在 CLI 配置的 `plugins` 部分：

```sh
cline config
```

### 从文件系统中查找所有插件

项目范围的插件位于工作区根目录的 `.cline/plugins/` 文件夹中。在该项目内运行 Cline 时，CLI 会自动从此文件夹中发现插件。

```text
your-project/
├── .cline/
│   └── plugins/
│       ├── my-plugin.ts
│       └── another-plugin/
└── ...
```

要将单文件插件添加到项目，请使用 `--cwd` 安装：

```sh
cline plugin install https://github.com/owner/repo/blob/main/plugins/my-plugin.ts --cwd .
```

全局插件会从 `~/.cline/plugins/` 中发现，Cline 也可能从系统 Plugins 文件夹中发现插件。如果希望插件与特定项目保持在一起，请使用 `--cwd .`。

## 以编程方式安装

### 使用 `pluginPaths`（ClineCore）

在 SDK 代码中，使用 `pluginPaths` 会话配置选项从文件路径加载插件：

```typescript
import { ClineCore } from "@cline/sdk"

const cline = await ClineCore.create({ clientName: "my-app" })

await cline.start({
  config: {
    systemPrompt: "Analyze this project",
    // ...model/runtime config
    pluginPaths: ["/absolute/path/to/plugin.ts"],
  },
})
```

插件文件必须默认导出一个 `AgentPlugin`。`pluginPaths` 也接受软件包目录——SDK 会读取 `package.json` 并遵循 `cline.plugins` 条目，因此你只需在软件包内运行一次 `npm install`，之后每次编辑时无需重新运行 `cline plugin install` 即可迭代。

### 使用 `plugins`（Agent Runtime）

直接使用 `Agent` 或 `AgentRuntime` 时，请在 `plugins` 数组中传入插件实例：

```typescript
import { Agent } from "@cline/sdk"
import { myPlugin } from "./my-plugin"

const agent = new Agent({
  providerId: "anthropic",
  modelId: "claude-sonnet-4-6",
  plugins: [myPlugin],
})
```

### 使用 `extensions`（ClineCore）

使用 `ClineCore` 时，请改用 `extensions` 配置数组：

```typescript
import { ClineCore } from "@cline/sdk"

const cline = await ClineCore.create({ clientName: "my-app" })

await cline.start({
  config: {
    systemPrompt: "Analyze customer records",
    extensions: [myPlugin],
  },
})
```

## 后续步骤

- **了解[插件](/sdk/plugins)**——理解插件是什么以及它们的优势。
- **按照[编写插件](/sdk/guides/writing-plugins)指南操作**——构建并分发你自己的插件。
- 探索[插件示例](/sdk/plugin-examples)，安装 SDK 仓库中可直接运行的插件示例。
