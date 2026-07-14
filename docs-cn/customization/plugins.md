---
title: "插件"
sidebarTitle: "插件"
description: "安装和管理通过自定义工具、钩子和功能扩展 Cline 的插件。"
---
<Warning>
  此功能目前仅适用于 Cline SDK、CLI 和 Kanban，暂不适用于 VS Code 和 JetBrains 扩展。
</Warning>

插件通过自定义工具、生命周期钩子、斜杠命令等来扩展 Cline。它们可以全局安装（在所有会话中可用），也可以按项目安装。

## 通过 CLI 安装插件

`cline plugin install` 命令可从四种来源类型安装插件：

<Tabs>
  <Tab title="文件 URL">
    ```bash
    cline plugin install https://github.com/owner/repo/blob/main/plugins/my-plugin.ts
    cline plugin install https://raw.githubusercontent.com/owner/repo/main/plugins/my-plugin.ts
    ```

    文件 URL 会直接安装单个 `.ts` 或 `.js` 插件文件。支持 GitHub `blob` 和原始 URL，远程插件文件 URL 必须使用 `https://`。
  </Tab>
  <Tab title="Git 仓库">
    ```bash
    cline plugin install https://github.com/owner/repo.git
    cline plugin install git@github.com:owner/repo.git
    ```

    安装程序会克隆仓库、安装生产依赖项，并注册插件入口文件。

    要安装特定分支或标签，请附加 `@ref`：

    ```bash
    cline plugin install https://github.com/owner/repo.git@v1.2.0
    cline plugin install https://github.com/owner/repo.git@main
    ```
  </Tab>
  <Tab title="npm 包">
    ```bash
    cline plugin install npm:@scope/my-plugin
    cline plugin install --npm my-plugin
    ```
  </Tab>
  <Tab title="本地路径">
    ```bash
    cline plugin install ./my-plugin
    cline plugin install ~/plugins/my-tool
    cline plugin install /absolute/path/to/plugin.ts
    ```

    本地安装会将文件或目录复制到插件存储中。支持单个 `.ts`/`.js` 文件以及包含 `package.json` 的目录。
  </Tab>
</Tabs>

其他标志：

| 标志 | 描述 |
|------|-------------|
| `--force` | 替换同一来源的现有安装 |
| `--json` | 以 JSON 格式输出结果（适用于脚本） |
| `--cwd <path>` | 安装到 `<path>/.cline/plugins`，而不是全局目录 |

安装后，运行 `cline config` 并检查插件选项卡，以确认插件已加载。

### 示例：TypeScript 导航插件

[typescript-lsp-plugin](https://github.com/cline/typescript-lsp-plugin) 是了解插件工作原理的良好参考。它添加了一个 `goto_definition` 工具，该工具使用 TypeScript Language Service API，通过导入、重新导出和类型别名来解析符号定义。

使用以下命令安装：

```bash
cline plugin install https://github.com/cline/typescript-lsp-plugin.git
```

安装后，Cline 可以使用文件路径和行号调用 `goto_definition`，以查找符号的定义位置，这比文本搜索精确得多。

## 插件清单格式

要使仓库或 npm 包可作为 Cline 插件安装，其 `package.json` 应包含一个声明插件入口点的 `cline` 字段：

```json
{
  "name": "my-cline-plugin",
  "version": "1.0.0",
  "cline": {
    "plugins": [
      {
        "paths": ["./index.ts"],
        "capabilities": ["tools", "hooks"]
      }
    ]
  }
}
```

`cline.plugins` 数组接受以下格式：

| 格式 | 示例 |
|--------|---------|
| 包含 `paths` 数组的对象 | `{ "paths": ["./src/plugin.ts"], "capabilities": ["tools"] }` |
| 普通字符串 | `"./index.ts"` |

每个路径都应指向一个 `.ts` 或 `.js` 文件，该文件需导出 `AgentPlugin`（作为默认导出或命名导出）。

如果不存在 `cline.plugins` 字段，安装程序会回退到自动发现：它会查找标准入口点，然后递归扫描 `.ts` 和 `.js` 文件（跳过 `node_modules` 和 `.git`）。

### 由宿主提供的依赖项

`@cline/` 作用域下的依赖项由宿主运行时提供。安装程序会在运行 `npm install` 前自动从插件的依赖项列表中移除这些依赖项，因此请将插件导入的所有 `@cline/*` 包声明为可选的对等依赖项。宿主目前提供 `@cline/sdk`、`@cline/core`、`@cline/agents`、`@cline/llms` 和 `@cline/shared`。

```json
{
  "peerDependencies": {
    "@cline/sdk": "*"
  },
  "peerDependenciesMeta": {
    "@cline/sdk": {
      "optional": true
    }
  }
}
```

## 插件目录结构

插件存储在两个层级的 `plugins` 目录中：

```
~/.cline/
  plugins/                     # Global plugins
    _installed/                # Managed by `cline plugin install`
      npm/                     # npm-sourced plugins
      git/                     # git-sourced plugins
      remote/                  # file URL-sourced plugins
      local/                   # local-sourced plugins

.cline/                        # Project root
  plugins/                     # Project-scoped plugins
```

全局插件（`~/.cline/plugins/`）在所有会话中可用。项目插件（仓库中的 `.cline/plugins/`）仅在处理该项目时可用。

## 编写插件

有关使用 SDK 构建插件的指南，请参阅[编写插件](/sdk/guides/writing-plugins)。有关插件 API 参考，请参阅 [SDK 插件](/sdk/plugins)。
