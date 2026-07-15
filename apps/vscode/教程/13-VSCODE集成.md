# Cline 与 VS Code 的集成机制

> 本文基于当前工作区源码，分析 Cline 怎样作为 VS Code 扩展被激活，怎样把 React 聊天界面嵌入侧边栏，以及编辑器、文件 Diff、终端、诊断、Notebook、Git、评论、模型、授权回调和存储等能力怎样调用 VS Code API。当前工程只保留 VS Code 插件形态。
>
> 更新日期：2026-07-15。其余大多数业务代码通过 HostProvider/HostBridge 间接调用宿主能力。

## 1. 先给出结论

1. **Cline 是标准的 VS Code Extension Host 扩展。** `apps/vscode/package.json` 声明扩展身份、激活条件、Activity Bar、Webview View、命令、菜单和快捷键；`apps/vscode/src/extension.ts` 导出 `activate()` / `deactivate()`；esbuild 最终生成 `dist/extension.js`。
2. **聊天框不是 VS Code Chat Participant。** 它是注册在 Activity Bar 中的 `WebviewView`，前端是 React 应用，通过 `webview.postMessage()` / `onDidReceiveMessage()` 传输 Proto 风格的请求和响应。当前源码没有注册 `vscode.chat.createChatParticipant()`、`vscode.lm.registerTool()` 或自定义编辑器 Provider。
3. **核心代码并不都直接依赖 `vscode`。** `HostProvider` 注入 VS Code 版本的 Webview、Diff、Comment、Terminal 和 HostBridge，使公共业务代码通过 `HostProvider.workspace/window/env/diff` 使用宿主能力。
4. **HostBridge 在 VS Code 扩展内不是网络 RPC。** Proto 定义提供类型和服务边界，VS Code 端使用生成的服务表在同一 Extension Host 进程内分发，不监听网络端口。
5. **智能体最深的 VS Code 集成是前台文件编辑和前台命令执行。** 文件写入工具会打开可编辑 Diff、流式应用 `WorkspaceEdit`、保存文件并比较编辑前后的 Diagnostics；`execute_command` 会创建或复用 VS Code Terminal，并尽可能通过 Shell Integration 读取实时输出和退出码。
6. **命令执行统一使用 VS Code Terminal。** `backgroundEditEnabled` 仍可让文件编辑绕开可视化 Diff，但已不存在隐藏子进程式后台终端模式。
7. **Cline 能把 VS Code 当前状态反馈给模型。** 每轮环境上下文可包含工作区根目录、可见文件、打开的标签页、终端状态及新增输出；文件编辑后还会读取 VS Code Diagnostics，并只把本次编辑新增的 Error 反馈给模型。
8. **Cline 也能把 VS Code 自己管理的模型作为 Provider。** `vscode.lm.selectChatModels()` 发现模型，`LanguageModelChat.sendRequest()` 发起流式请求；这条链路不同于 Anthropic/OpenAI 的 HTTP Provider。
9. **当前持久化已从 VS Code 原生 Memento/SecretStorage 迁到共享文件。** 普通设置、工作区状态和密钥主要写到 `~/.cline/data`；但 Task、Checkpoint 等数据仍会使用 `ExtensionContext.globalStorageUri` 指向的 VS Code 托管目录。

## 2. 集成总图

```text
apps/vscode/package.json
  ├─ activationEvents / main
  ├─ Activity Bar + Webview View
  └─ commands / menus / keybindings
          │
          ▼
apps/vscode/src/extension.ts::activate(context)
  ├─ setupHostProvider(context)
  │    ├─ VscodeWebviewProvider
  │    ├─ VscodeDiffViewProvider
  │    ├─ VscodeCommentReviewController
  │    ├─ VscodeTerminalManager
  │    └─ VS Code HostBridge clients
  ├─ 迁移并初始化存储
  ├─ initialize() 创建 Controller/Webview
  ├─ 注册 Webview、命令、Code Action、URI Handler
  ├─ 注册 Notebook、Git 和 Hook Watcher
  └─ 返回 ClineAPI 给其他扩展
          │
          ▼
React Webview
  ⇄ grpc_request / grpc_response（webview.postMessage）
Controller / Task / ToolExecutor
  ├─ HostProvider.window/workspace/env/diff
  ├─ DiffViewProvider → VS Code Editor/Diff/Diagnostics
  ├─ CommandExecutor → VS Code Terminal/Shell Integration
  └─ ApiHandler → HTTP Provider 或 VS Code Language Model API
```

这个结构把集成分成四层：

| 层次 | 主要源码 | 职责 |
| --- | --- | --- |
| 声明层 | `apps/vscode/package.json`、`apps/vscode/src/registry.ts` | 告诉 VS Code 何时激活、显示哪些入口、命令 ID 是什么 |
| 宿主入口层 | `apps/vscode/src/extension.ts`、`apps/vscode/src/common.ts` | 组装 VS Code 适配器、初始化公共服务、注册和释放资源 |
| 宿主适配层 | `apps/vscode/src/hosts/host-provider.ts`、`apps/vscode/src/hosts/vscode/` | 把通用宿主接口实现为 VS Code API 调用 |
| 业务层 | `apps/vscode/src/core/`、`apps/vscode/src/integrations/` | 聊天、智能体循环、工具、模型、Checkpoint 等；优先依赖抽象而不是直接依赖 VS Code |

## 3. VS Code 怎样发现和激活 Cline

### 3.1 扩展清单

`apps/vscode/package.json` 中当前关键值如下：

| 项目 | 当前值 | 作用 |
| --- | --- | --- |
| `name` | `claude-dev` | 构成扩展 ID 和 View ID 的内部名称 |
| `displayName` | `Cline` | Marketplace 和 VS Code UI 中的显示名 |
| `publisher` | `saoudrizwan` | 与 `name` 组成 `saoudrizwan.claude-dev` |
| `engines.vscode` | `^1.84.0` | 最低兼容的 VS Code API 基线 |
| `main` | `./dist/extension.js` | Extension Host 加载的 CommonJS 入口 |

激活事件包括：

- `onLanguage`：打开语言文档时可激活；
- `onUri`：通过扩展 URI 回调进入时激活；
- `onStartupFinished`：VS Code 启动完成后激活；
- `workspaceContains:evals.env`：评测工作区包含指定文件时激活。

### 3.2 Activity Bar 和侧边栏

清单注册：

- Activity Bar Container：`claude-dev-ActivityBar`；
- Webview View：`claude-dev.SidebarProvider`；
- 自定义图标：`cline-icon`；
- 新建任务、MCP、历史和设置等 View Title 按钮；账号按钮已删除。

运行时由 `apps/vscode/src/extension.ts` 调用：

```ts
vscode.window.registerWebviewViewProvider(
  VscodeWebviewProvider.SIDEBAR_ID,
  webview,
  { webviewOptions: { retainContextWhenHidden: true } },
)
```

`retainContextWhenHidden` 使侧栏暂时隐藏时仍保留 Webview 上下文，避免 React 页面每次切回都重新创建。

### 3.3 命令、菜单和快捷键

清单和运行时注册的主要入口有：

| 场景 | 命令/菜单 | 用途 |
| --- | --- | --- |
| Webview 标题栏 | New Task、MCP、History、Settings | 切换 Cline 内部页面或清空当前任务 |
| 编辑器右键 | `cline.addToChat` | 把选择代码加入聊天输入 |
| 编辑器 Code Action | Add、Explain、Improve、Fix with Cline | 从选择范围和诊断生成聊天上下文或新任务 |
| 终端右键 | `cline.addTerminalOutputToChat` | 把终端当前选择加入聊天 |
| SCM 标题栏 | Generate/Abort Git Commit Message | 生成或中止提交信息 |
| Notebook 工具栏 | Generate Cell | 创建 Notebook 单元任务 |
| Notebook Cell 标题栏 | Explain/Improve Cell | 解释或改进当前单元 |
| Comment Thread | Reply、Add to Cline Chat | 继续行级 AI Review 对话 |
| Command Palette | Reconstruct Task History 等 | 执行维护命令 |

快捷键 `Cmd+'` / `Ctrl+'` 根据上下文分流：有编辑器选择时执行 Add to Chat；没有选择时聚焦聊天输入。评论编辑器中 Enter 会提交 Cline Review Reply。

`apps/vscode/src/registry.ts` 从 `package.json` 读取 `name/publisher/version`，集中生成命令和 View ID。正式版内部名为 `claude-dev` 时命令前缀仍使用 `cline`；Nightly 改名后则使用新的扩展名前缀。因此新增或改名命令时，必须同步清单和 Registry。

当前还有两个只在运行时注册、没有出现在 `contributes.commands` 列表中的命令：`FixWithCline` 由 Code Action 间接调用，`WorktreesButton` 用于内部 Worktree UI 事件。VS Code 允许执行已经通过 `registerCommand()` 注册但未贡献到命令面板的命令，不过这种清单与 Registry 的差异容易在改名或裁剪功能时被遗漏。

## 4. `activate()` 的完整组装顺序

入口位于 `apps/vscode/src/extension.ts`。当前顺序不是随意的：HostProvider 必须先建立，存储迁移必须在 StateManager 初始化前完成。

```text
VS Code 加载 dist/extension.js
  → activate(context)
  → setupHostProvider(context)
  → cleanupLegacyVSCodeStorage(context)
  → createStorageContext({ workspacePath })
  → exportVSCodeStorageToSharedFiles(context, storageContext)
  → initialize(storageContext)
      → StateManager.initialize()
      → 创建 VscodeWebviewProvider + Controller
      → 初始化本地日志、MCP、Workspace、Hooks 等公共服务
  → 初始化 HookDiscoveryCache
  → registerWebviewViewProvider()
  → 注册命令、虚拟文档 Provider、URI Handler、Code Action
  → 注册 Notebook、历史重建、Git Commit 命令
  → return undefined
```

所有 `Disposable` 尽量压入 `context.subscriptions`，由 VS Code 在扩展停用时统一释放。`deactivate()` 还会调用 `apps/vscode/src/common.ts` 的 `tearDown()`，并显式销毁 Comment Review Controller。

开发模式下，入口会用 `workspace.createFileSystemWatcher()` 监听源码变化，并执行 `workbench.action.reloadWindow`。这是 Extension Host 的整窗重载，不是扩展后端热更新；Webview 前端则另有 Vite HMR。

## 5. HostProvider 和 HostBridge：跨平台代码怎样调用 VS Code

### 5.1 HostProvider 依赖注入

`apps/vscode/src/hosts/host-provider.ts` 是宿主依赖注入单例。`setupHostProvider()` 注入：

```text
createWebviewProvider       → VscodeWebviewProvider
createDiffViewProvider      → VscodeDiffViewProvider
createCommentReviewController → VscodeCommentReviewController
createTerminalManager       → VscodeTerminalManager
hostBridge                  → vscodeHostBridgeClient
getCallbackUrl              → vscode:// 或 asExternalUri() 结果
getBinaryLocation           → VS Code 安装目录中的 ripgrep
extensionFsPath             → context.extensionUri.fsPath
globalStorageFsPath         → context.globalStorageUri.fsPath
```

公共代码随后可以调用：

```ts
HostProvider.workspace.getWorkspacePaths({})
HostProvider.window.showMessage(...)
HostProvider.env.openExternal(...)
HostProvider.diff.openMultiFileDiff(...)
```

这样 `Controller`、`Task`、规则、工具和状态逻辑不必普遍导入 `vscode`，也更容易进行单元测试。

### 5.2 HostBridge 服务边界

Proto 定义位于：

- `apps/vscode/proto/host/workspace.proto`；
- `apps/vscode/proto/host/window.proto`；
- `apps/vscode/proto/host/env.proto`；
- `apps/vscode/proto/host/diff.proto`；
- `apps/vscode/proto/host/testing.proto`。

对应能力如下：

| Service | VS Code 端能力 |
| --- | --- |
| `WorkspaceService` | 工作区根目录、保存 Dirty 文档、Diagnostics、打开 Problems/Explorer/Terminal/Cline、运行终端命令、打开文件夹 |
| `WindowService` | 打开/显示文档、打开/保存对话框、消息、输入框、设置页、Open/Visible Tabs、Active Editor |
| `EnvService` | 剪贴板、宿主版本、远程环境名、回调 URI、Output Channel、外部浏览器 |
| `DiffService` | 当前 VS Code Host 实际只支持多文件 Change View；单文件 Diff 走 `VscodeDiffViewProvider` |
| `TestingService` | 测试所需的 Webview/宿主能力 |

### 5.3 为什么叫 gRPC，但没有网络

`apps/vscode/src/hosts/vscode/hostbridge/client/host-grpc-client-base.ts` 根据 Proto Service Definition 创建类型化客户端；`apps/vscode/src/hosts/vscode/hostbridge-grpc-handler.ts` 查找构建时生成的 Handler 配置并直接调用实现函数。请求 ID、流式回调、取消和 Proto 消息形状都保留，但 VS Code 扩展内不打开端口，也不做序列化后的网络传输。

生成过程由 `apps/vscode/scripts/build-proto.mjs` 和 `apps/vscode/scripts/generate-host-bridge-client.mjs` 驱动。生成产物位于构建目录，清理构建后可能不在工作树中，因此修改 Proto 或新增 Handler 后必须先运行 `npm run protos`。

### 5.4 当前未实现的 HostBridge 能力

这两个边界对改造很重要：

- `apps/vscode/src/hosts/vscode/hostbridge/workspace/searchWorkspaceItems.ts` 当前主动抛出未实现错误。VS Code Host 没有使用原生文件名索引，上层应回退到 ripgrep/文件搜索逻辑。
- `apps/vscode/src/hosts/vscode/hostbridge/diff/` 中 `openDiff`、`replaceText`、`truncateDocument`、`saveDocument`、`getDocumentText`、`closeAllDiffs` 等当前都是未支持占位；只有 `openMultiFileDiff` 真正执行 VS Code `vscode.changes` 命令。普通智能体文件编辑使用 `VscodeDiffViewProvider`，不能把两条路径混为一谈。

## 6. Webview 聊天界面怎样嵌入和通信

### 6.1 Webview 初始化

`apps/vscode/src/hosts/vscode/VscodeWebviewProvider.ts` 实现 `vscode.WebviewViewProvider`。`resolveWebviewView()` 会：

1. 保存 `WebviewView` 实例；
2. 设置 `enableScripts: true`；
3. 把 `localResourceRoots` 限制在扩展安装目录；
4. 生产模式加载构建生成的 `webview-ui/build/assets/index.js` 和 `index.css`（清理构建产物后，源码工作树中可能不存在）；
5. 开发模式尝试连接 Vite HMR，失败则退回打包资源；
6. 注册消息、可见性、销毁和配置变化监听器；
7. 清理旧 Task UI 状态。

`apps/vscode/src/core/webview/WebviewProvider.ts` 负责生成 HTML、Nonce 和 CSP。资源路径通过 `webview.asWebviewUri()` 转成 Webview 可访问 URI，CSP 使用 `webview.cspSource` 限制字体、样式、图片和脚本来源。

### 6.2 前后端消息链

```text
React Webview 调用生成的 Service Client
  → window.acquireVsCodeApi().postMessage(grpc_request)
  → VscodeWebviewProvider.onDidReceiveMessage()
  → handleGrpcRequest(controller, postMessage, request)
  → 按 service + method 找 Controller Handler
  → 执行业务逻辑
  → webview.postMessage(grpc_response)
  → 前端按 request_id 完成 Promise 或继续消费 Stream
```

关键后端文件：

- `apps/vscode/src/hosts/vscode/VscodeWebviewProvider.ts`：VS Code Message 通道；
- `apps/vscode/src/core/controller/grpc-handler.ts`：Webview 请求路由、流式响应和取消；
- `apps/vscode/src/core/controller/grpc-request-registry.ts`：活动请求与清理函数。

这里同样是“Proto 风格消息总线”，不是 Webview 到后端的 HTTP/2 gRPC。实际传输载体就是 VS Code Webview Message API。

### 6.3 聚焦和可见性

`cline.focusChatInput` 会调用 `WebviewView.show()`，再向前端发送 Show Webview 事件。调用方可传 `preserveEditorFocus`：

- 显式跳转聊天时聚焦 Webview；
- 从编辑器或终端“Add to Cline”时可只显示侧栏而保留编辑器焦点。

## 7. 编辑器选择、Code Action 和聊天上下文

### 7.1 Code Action 注册

`apps/vscode/src/extension.ts` 对 selector `"*"` 注册 `languages.registerCodeActionsProvider()`：

- Add to Cline：始终可用；
- Explain with Cline：始终可用；
- Improve with Cline：始终可用；
- Fix with Cline：当前 Range 有 Diagnostics 时才出现，并标记为 Preferred Quick Fix。

默认 Range 会向上下各扩展三行；如果用户选择范围更大且包含诊断 Range，则优先使用完整选择。

### 7.2 读取 VS Code 编辑器状态

`apps/vscode/src/hosts/vscode/commandUtils.ts` 的 `getContextForCommand()` 读取：

| VS Code 对象 | 转成的 Cline 上下文 |
| --- | --- |
| `window.activeTextEditor` | 当前编辑器 |
| `editor.selection` / 传入的 `Range` | 选区 |
| `document.getText(range)` | 选中的源码 |
| `document.uri.fsPath` | 文件绝对路径 |
| `document.languageId` | 语言 ID |
| `Diagnostic[]` | Proto Diagnostics |
| `window.activeNotebookEditor` | 无 TextEditor 时的 Notebook 文件回退 |

随后 `apps/vscode/src/core/controller/commands/` 中的处理器构造文件 Mention、代码块和 Problems：

- Add：填入聊天输入框，不一定立即发送；
- Fix：创建“修复代码和诊断”的新 Task；
- Explain：创建解释代码的新 Task；
- Improve：创建改进/重构代码的新 Task。

### 7.3 终端选择加入聊天

VS Code 没有直接读取“终端当前选择”的稳定 API，因此 `cline.addTerminalOutputToChat` 使用命令和剪贴板桥接：

```text
保存系统剪贴板
  → workbench.action.terminal.copySelection
  → 读取剪贴板中的终端选区
  → 恢复用户原剪贴板
  → 显示 Cline Webview
  → 把 Terminal output 代码块填入聊天输入
```

异常路径也会恢复原剪贴板，避免破坏用户数据。

## 8. 文件工具怎样调用 VS Code Diff 和 Diagnostics

### 8.1 哪些工具进入 Diff 链路

前台编辑模式下，以下工具最终复用 `DiffViewProvider`：

- `write_to_file`；
- `replace_in_file`；
- `apply_patch`；
- `new_rule`（复用写文件处理器）；
- 其他经相同文件编辑 Provider 提交内容的内部流程。

主要入口：

- `apps/vscode/src/core/task/tools/handlers/WriteToFileToolHandler.ts`；
- `apps/vscode/src/core/task/tools/handlers/ApplyPatchHandler.ts`；
- `apps/vscode/src/integrations/editor/DiffViewProvider.ts`；
- `apps/vscode/src/hosts/vscode/VscodeDiffViewProvider.ts`。

### 8.2 前台编辑主链路

```text
模型提出写文件/替换/补丁工具
  → Tool Handler 校验路径、权限和审批
  → DiffViewProvider.open(relPath)
      → 保存同路径的 Dirty TextDocument
      → 读取原文件内容和编码
      → 记录编辑前 vscode.languages.getDiagnostics()
      → 必要时创建空文件和父目录
  → VscodeDiffViewProvider.openDiffEditor()
      → 注册的 cline-diff URI 提供只读原文
      → 执行 vscode.diff
      → 右侧是真实文件的可编辑 TextDocument
  → 模型内容流式到达
      → WorkspaceEdit.replace/insert/delete
      → workspace.applyEdit()
      → Decoration + revealRange() 展示当前修改位置
  → 用户批准
      → TextDocument.save()
      → 读取保存后文本和自动格式化结果
      → 再次读取 Diagnostics
      → 只计算本次新增的 Error
      → 新错误、用户手改和格式化差异返回模型
```

### 8.3 虚拟原文和真实修改文档

`extension.ts` 为 `cline-diff` Scheme 注册 `TextDocumentContentProvider`。原始内容放在 URI Query 的 Base64 中，Provider 解码后作为 Diff 左侧只读文档；右侧 URI 是真实文件，因此用户可在 Cline 流式修改时直接编辑。

`VscodeDiffViewProvider` 还使用：

- `window.tabGroups` 查找、复用和关闭 Tab；
- `window.showTextDocument()` 激活修改文档；
- `WorkspaceEdit` / `workspace.applyEdit()` 修改内容；
- `TextEditorDecorationType`、`Range`、`Position`、`Selection` 标示活动行和淡化未生成区域；
- `TextEditor.revealRange()` 跟随生成位置；
- `TextDocument.save()` 触发 VS Code 保存、格式化和语言服务更新。

### 8.4 Diagnostics 反馈

`apps/vscode/src/hosts/vscode/hostbridge/workspace/getDiagnostics.ts` 调用 `vscode.languages.getDiagnostics()`，把 URI、Range、Severity、Source 和 Message 转为公共 Proto。

`DiffViewProvider` 在编辑前后各取一次快照，`apps/vscode/src/integrations/diagnostics/` 计算增量，只把新增 Error 放入工具结果。这样模型不会因工作区既有 Warning 或无关错误偏离当前任务。

### 8.5 后台编辑例外

Task 构造时会读取 `backgroundEditEnabled`：

```text
false → HostProvider.createDiffViewProvider() → VscodeDiffViewProvider
true  → new FileEditProvider()               → Node fs，无 VS Code Diff
```

因此“写文件工具一定调用 VS Code API”并不准确。只有前台编辑模式使用 VS Code 编辑器、WorkspaceEdit 和 Diagnostics 可视化链路；后台编辑更适合隐藏执行或子智能体，但用户看不到逐步 Diff。

## 9. `execute_command` 怎样使用 VS Code Terminal

### 9.1 主链路

```text
execute_command / attempt_completion.command
  → ExecuteCommandToolHandler 审批
  → Task.executeCommandTool()
  → CommandExecutor
  → VscodeTerminalManager.getOrCreateTerminal(cwd)
  → VscodeTerminalRegistry.createTerminal()
  → vscode.window.createTerminal()
  → Terminal.show()
  → shellIntegration.executeCommand(command)
  → execution.read() 流式读取输出
  → line/completed/continue 事件
  → 工具结果和后续环境详情返回模型
```

创建的终端名为 `Cline`，使用 `cline-icon`，并设置环境变量 `CLINE_ACTIVE=true`。Registry 自己记录 ID、busy、CWD、Shell、lastCommand 和 lastActive，因为 VS Code Terminal API 不能可靠判断任意终端是否正在运行命令。

`apps/vscode/src/utils/shell.ts` 还通过 `workspace.getConfiguration("terminal.integrated")` 读取当前平台的 `defaultProfile.*` 和 `profiles.*`。默认 Profile 优先沿用 VS Code 配置；读取不到时才依次回退到 `os.userInfo().shell`、`SHELL`/`COMSPEC` 和平台默认 Shell。

### 9.2 Shell Integration

`apps/vscode/src/hosts/vscode/terminal/VscodeTerminalManager.ts` 和 `VscodeTerminalProcess.ts` 使用：

- `window.createTerminal()`；
- `Terminal.shellIntegration.cwd`；
- `Terminal.shellIntegration.executeCommand()`；
- `TerminalShellExecution.read()` 的异步输出流；
- `window.onDidStartTerminalShellExecution`；
- `window.onDidChangeTerminalState`。

输出处理会清除 ANSI 和 VS Code OSC 633 标记、检测完成标记中的退出码、分行推送、限制内存和上下文长度，并允许用户选择“Proceed While Running”，让模型继续而不强制终止长任务。

### 9.3 兼容回退

清单最低版本仍是 VS Code 1.84，而完整 Shell Integration API 出现得更晚，所以源码通过 TypeScript Module Augmentation 声明新 API，并在运行时检测能力：

```text
有 Shell Integration
  → executeCommand() + read()，可获得实时输出和较可靠退出码

无 Shell Integration
  → terminal.sendText(command, true)
  → 等待后通过“全选终端 + 复制到剪贴板”尝试抓取快照
  → 无法可靠判断长命令何时真正退出
```

剪贴板快照实现位于 `apps/vscode/src/hosts/vscode/terminal/get-latest-output.ts`，执行 `terminal.selectAll`、`copySelection`、`clearSelection`，并恢复用户原剪贴板。

### 9.4 命令超时

命令超时时，`CommandExecutor` 返回已捕获输出并让对应 VS Code Terminal 继续运行。它不会把命令迁移到隐藏的 Node 子进程。

## 10. 工作区、标签页、文件和环境上下文

### 10.1 HostBridge 到 VS Code API 的映射

| 公共调用 | VS Code 实现 | 作用 |
| --- | --- | --- |
| `getWorkspacePaths` | `workspace.workspaceFolders` | 获取多根工作区路径 |
| `saveOpenDocumentIfDirty` | `workspace.textDocuments` + `document.save()` | 编辑前保存未落盘内容 |
| `getOpenTabs` | `window.tabGroups.all` | 获取所有打开的文本 Tab |
| `getVisibleTabs` | `window.visibleTextEditors` | 获取当前可见编辑器 |
| `getActiveEditor` | `window.activeTextEditor` | 获取当前文件 |
| `showTextDocument` | `window.showTextDocument()` | 显示文件并控制 preview/focus/column |
| `openFile` | `vscode.open` | 用 VS Code 打开文件 |
| `openFolder` | `vscode.openFolder` | 当前窗或新窗打开工作区 |
| `openInFileExplorerPanel` | `revealInExplorer` | 在 Explorer 定位路径 |
| `openProblemsPanel` | `workbench.actions.view.problems` | 打开 Problems |
| `openTerminalPanel` | `workbench.action.terminal.focus` | 聚焦终端 |
| `openClineSidebarPanel` | `<SidebarViewId>.focus` | 聚焦 Cline |
| `openSettings` | `workbench.action.openSettings` | 打开设置并支持查询过滤 |

### 10.2 每轮模型环境详情

`apps/vscode/src/core/task/index.ts` 的 `getEnvironmentDetails()` 通过 HostProvider 和 Task Terminal Manager 组装：

- Workspace Roots；
- Visible Files；
- Open Tabs；
- Active Terminals；
- Inactive Terminals；
- 尚未取走的终端新输出；
- 可选的最近修改文件详情。

路径还会经过 `.clineignore` 和 Workspace Resolver 过滤。该机制使模型知道用户正在查看什么、哪些命令仍在运行，但它不等于把整个 VS Code 内部状态都暴露给模型。

### 10.3 文件监听

VS Code API 参与两类监听：

- `HookDiscoveryCache` 在 `extension.ts` 中被适配到 `workspace.createFileSystemWatcher()` 和 `workspace.onDidChangeWorkspaceFolders()`；
- 开发模式使用同一 Watcher 能力触发整窗重载。

需要区分：`FileContextTracker` 的常规文件变化跟踪主要使用 `chokidar`，不是 VS Code FileSystemWatcher。项目大部分普通磁盘读写也使用 Node `fs`，只有需要编辑器状态、虚拟文档、Notebook 或 WorkspaceEdit 时才必须调用 VS Code 文件 API。

### 10.4 使用 VS Code 自带 ripgrep

`setupHostProvider()` 注入的 `getBinaryLocation()` 从 `vscode.env.appRoot` 下探测 `@vscode/ripgrep-universal`、`@vscode/ripgrep` 等新旧目录。文件搜索工具因此可复用 VS Code 安装包中的 `rg`，但真正启动进程和解析结果仍是项目自己的搜索服务，不是 VS Code Search UI API。

## 11. Jupyter Notebook 集成

### 11.1 Notebook 命令

`extension.ts` 使用 `window.activeNotebookEditor` 读取当前 Notebook 和 Cell Index，再由 `apps/vscode/src/hosts/vscode/commandUtils.ts` 从 `.ipynb` JSON 中取对应 Cell，并清理大图片输出。

三类命令：

- Generate Cell：先用 `window.createQuickPick()` 接收自由文本提示，再创建插入 Cell 的任务；
- Explain Cell：把当前 Cell JSON 作为上下文创建解释任务；
- Improve Cell：接收改进要求，把 Cell JSON 发送到新 Task 或当前 Task。

模型实际修改的仍是 `.ipynb` JSON，因此 Prompt 会强调 Cell `source` 数组、转义换行和逗号格式。

### 11.2 Notebook Diff

`apps/vscode/src/hosts/vscode/NotebookDiffView.ts`：

1. 用 `extensions.getExtension("ms-toolsai.jupyter")` 检查 Jupyter 扩展；
2. 未激活时调用 `activate()`；
3. 把修改后的 Notebook JSON 写入系统临时文件；
4. 执行 `vscode.diff`，让 VS Code/Jupyter 渲染 Cell 级 Diff；
5. 用 `workspace.createFileSystemWatcher()` 监听临时修改文件；
6. 用户在 Notebook Diff 中编辑后，用 `workspace.fs.readFile()` 和 `WorkspaceEdit` 同步回真实编辑文档；
7. 结束后删除临时文件和 Watcher。

文件保存后，`VscodeDiffViewProvider.showFile()` 还会执行 `vscode.openWith(uri, "jupyter-notebook")`，回到 Notebook 专用编辑器。若未安装 Jupyter，则显示错误或退回普通文本编辑。

## 12. Git SCM 集成

`apps/vscode/src/hosts/vscode/commit-message-generator.ts` 没有自行实现 VS Code Source Control Provider，而是调用内置 Git 扩展 API：

```text
extensions.getExtension("vscode.git").exports
  → getAPI(1)
  → repositories / getRepository(scm.rootUri)
  → repository.inputBox
```

执行步骤：

1. 读取工作区 Git 仓库；
2. 优先取得 staged diff，没有 staged 内容时回退全部 diff；
3. 多仓库时用 `window.showQuickPick()` 让用户选择单个或全部；
4. 用 `window.withProgress({ location: SourceControl })` 在 SCM 区显示可取消进度；
5. 使用当前 Act 模式模型 Provider 流式生成 Conventional Commit Message；
6. 持续更新 `repository.inputBox.value`；
7. 用 `setContext("cline.isGeneratingCommit", true/false)` 控制生成/停止按钮显隐。

这里的 Git Diff 本身由项目的 Git 工具读取，VS Code API 主要负责仓库发现、SCM Input Box、进度 UI 和上下文菜单状态。

## 13. Comments API 和 Explain Changes

`apps/vscode/src/hosts/vscode/review/VscodeCommentReviewController.ts` 使用：

- `vscode.comments.createCommentController()`；
- `CommentController.createCommentThread()`；
- `MarkdownString`；
- `CommentMode.Preview`；
- `CommentThread.comments/canReply/collapsibleState`；
- `workspace.openTextDocument()`、`window.showTextDocument()`、`revealRange()`；
- `window.tabGroups` 关闭 Review Diff。

Explain Changes 的链路是：

```text
Checkpoint 计算多文件 before/after
  → HostProvider.diff.openMultiFileDiff()
  → VS Code 执行 vscode.changes
  → 模型流式生成 FILE + LINE + 评论正文
  → VscodeCommentReviewController 创建行级 CommentThread
  → 用户 Reply
  → Reply 连同文件、行号和旧评论再次请求模型
  → AI 回复流式更新同一线程
```

“Add to Cline Chat”会把整条评论会话、文件路径和行号格式化后放进主聊天输入。Controller 还把全局 `comments.openView` 设置为 `never`，避免每次添加评论都自动弹出 Comments 面板；这是一个会修改用户全局 VS Code 设置的行为，二次开发时应明确评估。

## 14. VS Code Language Model API

### 14.1 模型发现

`apps/vscode/src/core/controller/models/getVsCodeLmModels.ts` 调用：

```ts
const models = await vscode.lm.selectChatModels({})
```

返回的 `id/name/vendor/family/version/maxInputTokens` 会转换为前端可展示的 Proto Model。用户保存的 Selector 可按 vendor、family、version、id 选择模型。

### 14.2 请求适配

`apps/vscode/src/core/api/providers/vscode-lm.ts` 实现 `ApiHandler`：

```text
ClineStorageMessage（Anthropic 风格内部消息）
  → convertToVsCodeLmMessages()
  → LanguageModelChatMessage.User/Assistant
  → LanguageModelTextPart
  → LanguageModelToolCallPart / LanguageModelToolResultPart
  → client.sendRequest(messages, options, CancellationToken)
  → response.stream
  → Cline ApiStream text / usage
```

使用的 VS Code API 包括：

- `vscode.lm.selectChatModels(selector)`；
- `LanguageModelChat.sendRequest()`；
- `LanguageModelChatMessage.User/Assistant()`；
- `LanguageModelTextPart`；
- `LanguageModelToolCallPart` / `LanguageModelToolResultPart`；
- `CancellationTokenSource` 和 `CancellationError`；
- `workspace.onDidChangeConfiguration()`，LM 配置变化时清空客户端。

请求会附带 justification，VS Code 可以向用户显示模型访问授权提示。

### 14.3 当前限制

- 当前 Handler 没有调用 `vscode.lm.registerTool()`，也没有在请求 Options 中注册 Cline 工具清单；收到 `LanguageModelToolCallPart` 时会校验后序列化为文本流。不能把它描述为“Cline 工具已经注册成 VS Code LM Tool”。
- 图片不会原样传入 VS Code LM，而会转换成“不支持图片”的文本占位；`getModel()` 也声明 `supportsImages: false`。
- Token 用量使用字符数除以 4 的启发式估算，没有调用精确 tokenizer 或 `client.countTokens()`；价格设置为 0。
- System Prompt 被放入一条 Assistant Message，而不是独立 System Role；这是该适配器当前的协议选择。
- 源码为了保持 `engines.vscode` 兼容，通过 Module Augmentation 声明较新的 LM 类型，运行时仍取决于实际 VS Code/衍生 IDE 是否实现该 API。

## 15. URI、OAuth、外部浏览器和远程工作区

### 15.1 URI Handler

`extension.ts` 调用 `window.registerUriHandler({ handleUri })`。`apps/vscode/src/services/uri/SharedUriHandler.ts` 按 Path 分发：

| Path | 用途 |
| --- | --- |
| `/auth/oca` | OCA OAuth 回调 |
| `/openrouter` | OpenRouter 授权码 |
| `/requesty` | Requesty 授权码 |
| `/hicap` | HiCap 授权码 |
| `/mcp-auth/callback/<hash>` | MCP Server OAuth |
| `/task` | Deep Link 创建 Task |
| `/lg-task` | 从规范文件和 Webhook 参数创建 Task |

Task Deep Link 会先执行 `<SidebarViewId>.focus` 并等待可见 Webview，防止首次初始化和 URI 到达发生竞态。

### 15.2 回调 URL

Desktop VS Code：

```text
${vscode.env.uriScheme}://${context.extension.id}/<path>
```

VS Code Web、Codespaces 或 `code serve-web`：

```text
vscode.Uri → vscode.env.asExternalUri() → 可从浏览器访问的 HTTPS 回调
```

打开授权页统一经 HostBridge 的 `openExternal`，VS Code 实现使用 `vscode.env.openExternal()`。在 SSH、Dev Container 等远程 Extension Host 中，这个 API 会把 URL 路由到用户本机浏览器，而不是远端服务器的浏览器。

### 15.3 宿主和远程信息

`getHostVersion()` 返回：

- `vscode.env.appName`；
- `vscode.version`；
- Cline Extension Version；
- `vscode.env.remoteName`，如 `ssh-remote`、`dev-container`、`codespaces`。

`getIdeRedirectUri()` 在 Desktop 返回 VS Code Scheme，在 Web 环境返回空值，让 HTTP 回调留在当前浏览器。当前该函数仍硬编码 `saoudrizwan.claude-dev`，而 `setupHostProvider().getCallbackUrl()` 使用 `context.extension.id`；独立改名时必须同时检查这处差异。

Walkthrough 贡献、命令和控制器已删除；独立插件改名时无需处理该入口。

## 16. 通知、对话框、剪贴板、设置和日志

HostBridge 把常用 VS Code UI 统一成公共服务：

| 功能 | VS Code API | 实现位置 |
| --- | --- | --- |
| 信息/警告/错误消息 | `showInformationMessage` / `showWarningMessage` / `showErrorMessage` | `apps/vscode/src/hosts/vscode/hostbridge/window/showMessage.ts` |
| 文本输入 | `window.showInputBox()` | `apps/vscode/src/hosts/vscode/hostbridge/window/showInputBox.ts` |
| 打开文件/目录对话框 | `window.showOpenDialog()` | `apps/vscode/src/hosts/vscode/hostbridge/window/showOpenDialogue.ts` |
| 保存对话框 | `window.showSaveDialog()` | `apps/vscode/src/hosts/vscode/hostbridge/window/showSaveDialog.ts` |
| 剪贴板 | `env.clipboard.readText/writeText` | `apps/vscode/src/hosts/vscode/hostbridge/env/` |
| 外部浏览器 | `env.openExternal()` | `apps/vscode/src/hosts/vscode/hostbridge/env/openExternal.ts` |
| Output Channel | `window.createOutputChannel("Cline")` | `apps/vscode/src/hosts/vscode/hostbridge/env/debugLog.ts` |

## 17. 存储、ExtensionContext 和多窗口同步

### 17.1 启动迁移

老版本依赖：

- `context.globalState`；
- `context.workspaceState`；
- `context.secrets`；
- `context.globalStorageUri`。

当前启动时先运行旧结构清理，再由 `apps/vscode/src/hosts/vscode/vscode-to-file-migration.ts` 把普通设置、Workspace State 和 Secrets 一次性导出到共享文件存储。迁移原则是“文件存储已有值优先”，并保留 VS Code 原数据以支持降级。

### 17.2 当前共享文件位置

`apps/vscode/src/shared/storage/storage-context.ts` 创建：

```text
~/.cline/data/globalState.json
~/.cline/data/secrets.json                 # 0600
~/.cline/data/workspaces/<hash>/workspaceState.json
```

密钥文件只有文件权限保护，内容仍是明文 JSON，并非 VS Code SecretStorage 的系统钥匙串加密。StateManager 之后主要读写这些共享文件。

### 17.3 仍依赖 VS Code 托管目录的数据

`HostProvider.globalStorageFsPath` 仍来自 `context.globalStorageUri.fsPath`。Task History 文件、Task 数据、Checkpoint 和部分缓存仍以该目录为根，尚未全部迁到 `~/.cline/data`。因此“项目已经完全脱离 VS Code 存储”也是不准确的。

### 17.4 多窗口与模型凭据

通用 Cline Account 的跨窗口登录/登出监听已删除。模型 API Key 仍写入共享 `secrets.json`，其他窗口在重新读取状态或重载扩展后可看到相同凭据；OCA、OpenAI Codex、OpenRouter、Requesty、HiCap 和 MCP 的专属授权流程各自管理 Token/回调，不经过 Cline Account。

## 18. 对其他 VS Code 扩展的边界

`activate()` 当前返回 `undefined`，原 `src/exports`、`ClineAPI` 和对应测试已经删除。其他扩展若需联动，只能使用当前明确贡献的 VS Code Commands；项目不再承诺扩展间 JavaScript API。

## 19. 智能体工具/功能与 VS Code 能力对照

| 智能体工具或产品功能 | 中间层 | VS Code 调用 | 最终效果 |
| --- | --- | --- | --- |
| `write_to_file` | WriteToFile Handler → DiffViewProvider | `vscode.diff`、WorkspaceEdit、TextDocument.save、Diagnostics | 可视化流式编辑、允许用户手改、反馈新增错误 |
| `replace_in_file` | WriteToFile/Diff 链 | 同上 | 修改现有文件 |
| `apply_patch` | ApplyPatch Handler → DiffViewProvider | 同上 | 一个补丁可预览并应用多文件修改 |
| `new_rule` | 复用写文件 Handler | 同上 | 创建规则文件并显示 Diff |
| `execute_command` | ExecuteCommand Handler → CommandExecutor | createTerminal、Shell Integration、sendText | 显示命令、实时输出、退出状态 |
| `attempt_completion.command` | Task Command 执行链 | 同 execute_command | 完成前运行最终命令 |
| Generate/Explain Changes | Checkpoint + Comment Controller | `vscode.changes`、Comments API | 多文件 Diff 和行级 AI 讲解 |
| Add/Fix/Explain/Improve Code | commandUtils | Selection、Range、CodeAction、Diagnostics | 把编辑器上下文送入聊天/Task |
| Jupyter Generate/Explain/Improve | Notebook 命令 | activeNotebookEditor、QuickPick | 把当前 Cell 上下文送给模型 |
| Git Commit Message | Commit Generator | 内置 Git Extension API、SCM InputBox、Progress | 生成提交说明 |
| `@problems`/编辑后问题 | Diagnostics 集成 | `languages.getDiagnostics()` | 把 VS Code 语言服务问题送给模型 |
| 打开文件/设置/面板 | HostProvider Window/Workspace | `vscode.open`、showTextDocument、内置命令 | 在 IDE 中定位资源 |
| Workspace/Tab 环境详情 | Task.getEnvironmentDetails | workspaceFolders、tabGroups、visibleTextEditors | 补充每轮模型上下文 |
| VS Code LM Provider | VsCodeLmHandler | `vscode.lm` | 使用 IDE 已授权的模型 |
| OAuth/MCP OAuth | SharedUriHandler | registerUriHandler、asExternalUri、openExternal | 浏览器授权返回扩展 |

不直接依赖 VS Code 的典型工具包括普通文件读取、目录列举、文本搜索的进程执行、浏览器自动化、MCP Server 调用和大部分 Skill/Hook 逻辑。它们运行在 Extension Host 的 Node 环境中，只会在需要路径、UI、终端、编辑器或宿主信息时通过 HostProvider 间接触达 VS Code。

## 20. 三条关键运行时序

### 20.1 用户从侧栏发送消息

```text
Webview Chat Input
  → grpc_request(TaskService)
  → VscodeWebviewProvider.onDidReceiveMessage
  → core/controller/grpc-handler
  → Controller.initTask / Task Ask Response
  → Task Agent Loop
  → ApiHandler
  → 模型流式响应
  → grpc_response / Task Event
  → webview.postMessage
  → React 更新聊天 UI
```

VS Code 在这条链路中负责 Webview 容器和消息通道；智能体循环本身在项目的 Core/Task 中执行。

### 20.2 模型写文件

```text
模型 tool_call(write/replace/patch)
  → ToolExecutor + Approval
  → DiffViewProvider
  → VS Code 保存 Dirty 文档、获取前置 Diagnostics
  → vscode.diff 打开原文/真实文件
  → WorkspaceEdit 流式写入
  → 用户批准/编辑
  → document.save
  → 获取后置 Diagnostics
  → 工具结果返回模型
  → 下一轮模型请求
```

### 20.3 模型执行命令

```text
模型 tool_call(execute_command)
  → ToolExecutor + Approval
  → CommandExecutor
  → VscodeTerminalManager
  → create/reuse Cline Terminal
  → Shell Integration execute/read
  → 输出流同时送 Webview 和工具结果
  → 完成、继续后台或用户中止
  → 下一轮模型请求
```

## 21. 直接调用 VS Code API 的源码分布

直接导入 `vscode` 的生产源码主要集中在以下区域：

| 区域 | 文件/目录 | 直接依赖原因 |
| --- | --- | --- |
| 扩展生命周期 | `apps/vscode/src/extension.ts` | 注册所有 VS Code Contribution 的运行时实现 |
| Webview | `apps/vscode/src/hosts/vscode/VscodeWebviewProvider.ts` | WebviewView、URI、消息、可见性 |
| 编辑器/Diff | `apps/vscode/src/hosts/vscode/VscodeDiffViewProvider.ts`、`DecorationController.ts`、`NotebookDiffView.ts` | Diff、WorkspaceEdit、Decoration、Tab、Notebook |
| 编辑器命令 | `apps/vscode/src/hosts/vscode/commandUtils.ts` | Selection、Active Editor、Notebook |
| Terminal | `apps/vscode/src/hosts/vscode/terminal/` | Terminal、Shell Integration、剪贴板回退 |
| HostBridge | `apps/vscode/src/hosts/vscode/hostbridge/` | Workspace、Window、Env、Diff 的宿主实现 |
| Comments | `apps/vscode/src/hosts/vscode/review/` | CommentController 和 CommentThread |
| Git SCM | `apps/vscode/src/hosts/vscode/commit-message-generator.ts` | 内置 Git Extension、SCM InputBox、Progress |
| VS Code LM | `apps/vscode/src/core/api/providers/vscode-lm.ts`、`apps/vscode/src/core/api/transform/vscode-lm-format.ts` | LM Model、Message、Stream、Cancellation |
| 模型列表 | `apps/vscode/src/core/controller/models/getVsCodeLmModels.ts` | 发现 VS Code 模型 |
| 旧存储迁移 | `apps/vscode/src/core/storage/state-migrations.ts`、`apps/vscode/src/hosts/vscode/vscode-to-file-migration.ts` | 读取旧 ExtensionContext 状态和 Secrets |
| 少量公共类型/兼容 | `apps/vscode/src/shared/vsCodeSelectorUtils.ts`、`apps/vscode/src/shared/storage/state-keys.ts`、`apps/vscode/src/utils/shell.ts` | VS Code 类型或终端配置兼容 |

新的宿主相关功能应优先放在 `hosts/vscode` 并通过 HostProvider/Proto 暴露。即使当前只保留 VS Code，也不要让 `vscode` 依赖扩散到整个 Core；VS Code LM 和遗留存储迁移属于有明确平台原因的例外。

## 22. 构建、打包和集成测试

### 22.1 构建

`apps/vscode/esbuild.mjs`：

- 入口是 `src/extension.ts`；
- 输出是 `dist/extension.js`；
- `platform: "node"`、`format: "cjs"`；
- `vscode` 被标记为 external，由 Extension Host 运行时提供；
- 代码定义查询在运行时复用 VS Code Document Symbol Provider，不复制 Tree-sitter/WASM；
- 生产构建压缩，开发构建生成 Source Map；

`apps/vscode/package.json` 中：

```text
npm run protos       → 生成 Proto/Service 客户端和路由配置
npm run build:webview → 构建 React Webview
npm run package      → 类型检查 + Webview + Lint + esbuild production
vscode:prepublish    → 调用 package
```

VSIX 由 `@vscode/vsce` 打包，安装后 VS Code 根据 `package.json.main` 加载扩展入口。

### 22.2 测试

- Unit Test 会 Mock 部分 VS Code API；
- Integration Test 使用 `vscode-test`；
- E2E 使用 `@vscode/test-electron` 下载/启动真实 VS Code，并安装测试 VSIX；
- Playwright 操作实际 Extension UI；

涉及 Webview、菜单、命令、Diff、Terminal、Notebook 或 URI 的改造，只有 Node 单元测试通常不够，至少应在 Extension Development Host 或打包 VSIX 中验证一次。

## 23. 改造 VS Code 集成时最容易踩的坑

1. **命令和 View ID 必须多处一致。** `package.json`、`registry.ts`、运行时 `registerCommand()`、菜单 `when` 条件和测试都可能依赖同一个 ID。
2. **不要把 Webview Proto 消息当成网络 gRPC。** 修改消息协议要重新生成前后端客户端，但 VS Code 内的传输仍是 `postMessage`。
3. **不要直接调用未实现的 VS Code DiffService 单文件方法。** 前台文件编辑应继续走 `VscodeDiffViewProvider`，或先补齐 HostBridge 实现和生命周期管理。
4. **后台文件编辑不会出现 Diff。** 排查文件修改为何没有可视化 Diff 时检查 `backgroundEditEnabled`；命令始终使用 VS Code Terminal。
5. **VS Code LM 不是完整替代所有 Provider。** 当前图片、工具注册、精确 Token 和价格统计都有限制。
6. **远程开发要区分本地浏览器与远程 Extension Host。** URL 应走 `env.openExternal`；文件路径、Node 进程和终端通常运行在远程 Host。
7. **Notebook 修改的是 JSON，同时又依赖 Jupyter 扩展渲染。** 文本 Diff、Cell Diff 和最终 `openWith` 是三个不同阶段。
8. **Comments Controller 会更新全局 `comments.openView`。** 若不希望插件改变用户设置，需要重构这段策略。
9. **Storage 已迁移但没有完全统一。** 普通配置在 `~/.cline/data`，Task/Checkpoint 仍可能在 VS Code Global Storage；迁移或改扩展 ID 时必须同时考虑两处。
10. **部分模型 OAuth 回调仍可能包含 Publisher/扩展 ID。** 独立插件改名时不能只修改 `package.json`。
11. **最低 Engine 和实际可选 API 不相同。** Shell Integration 与 LM API 都采用运行时能力检测/类型补充，必须在目标 VS Code、Cursor 或 Web 环境实测。
12. **资源必须经过 Webview URI 和 CSP。** 直接把本地绝对路径写进 HTML 不会正常加载，也会破坏安全边界。

## 24. 关键源码索引

| 主题 | 关键源码 |
| --- | --- |
| 扩展清单 | `apps/vscode/package.json` |
| 扩展入口 | `apps/vscode/src/extension.ts` |
| 公共初始化/销毁 | `apps/vscode/src/common.ts` |
| ID Registry | `apps/vscode/src/registry.ts` |
| Host 依赖注入 | `apps/vscode/src/hosts/host-provider.ts`、`apps/vscode/src/hosts/host-provider-types.ts` |
| HostBridge Proto | `apps/vscode/proto/host/` |
| HostBridge VS Code 实现 | `apps/vscode/src/hosts/vscode/hostbridge/` |
| HostBridge 进程内路由 | `apps/vscode/src/hosts/vscode/hostbridge-grpc-handler.ts`、`apps/vscode/src/hosts/vscode/hostbridge-grpc-service.ts` |
| Proto 构建 | `apps/vscode/scripts/build-proto.mjs`、`apps/vscode/scripts/generate-host-bridge-client.mjs` |
| Webview 宿主 | `apps/vscode/src/hosts/vscode/VscodeWebviewProvider.ts` |
| Webview 公共层 | `apps/vscode/src/core/webview/WebviewProvider.ts` |
| Webview 请求路由 | `apps/vscode/src/core/controller/grpc-handler.ts` |
| 编辑器命令上下文 | `apps/vscode/src/hosts/vscode/commandUtils.ts` |
| 文件 Diff 公共层 | `apps/vscode/src/integrations/editor/DiffViewProvider.ts` |
| VS Code Diff | `apps/vscode/src/hosts/vscode/VscodeDiffViewProvider.ts` |
| 后台文件编辑 | `apps/vscode/src/integrations/editor/FileEditProvider.ts` |
| Notebook Diff | `apps/vscode/src/hosts/vscode/NotebookDiffView.ts` |
| Diagnostics | `apps/vscode/src/hosts/vscode/hostbridge/workspace/getDiagnostics.ts`、`apps/vscode/src/integrations/diagnostics/` |
| Terminal Manager | `apps/vscode/src/hosts/vscode/terminal/VscodeTerminalManager.ts` |
| Terminal Process | `apps/vscode/src/hosts/vscode/terminal/VscodeTerminalProcess.ts` |
| Terminal Registry | `apps/vscode/src/hosts/vscode/terminal/VscodeTerminalRegistry.ts` |
| 公共命令执行 | `apps/vscode/src/integrations/terminal/CommandExecutor.ts` |
| Git Commit | `apps/vscode/src/hosts/vscode/commit-message-generator.ts` |
| Comments Review | `apps/vscode/src/hosts/vscode/review/VscodeCommentReviewController.ts` |
| Explain Changes | `apps/vscode/src/core/controller/task/explainChanges.ts`、`explainChangesShared.ts` |
| VS Code LM | `apps/vscode/src/core/api/providers/vscode-lm.ts`、`apps/vscode/src/core/api/transform/vscode-lm-format.ts` |
| VS Code 模型发现 | `apps/vscode/src/core/controller/models/getVsCodeLmModels.ts` |
| URI 分发 | `apps/vscode/src/services/uri/SharedUriHandler.ts` |
| 共享存储 | `apps/vscode/src/shared/storage/storage-context.ts` |
| VS Code 存储迁移 | `apps/vscode/src/hosts/vscode/vscode-to-file-migration.ts`、`apps/vscode/src/core/storage/state-migrations.ts` |
| 扩展构建 | `apps/vscode/esbuild.mjs` |

## 25. 最终总结

Cline 与 VS Code 的关系可以概括为：**VS Code 提供宿主外壳和 IDE 能力，Cline Core 提供智能体业务，HostProvider/HostBridge 负责把二者连接起来。**

VS Code 具体承担了：

- 扩展激活、命令、菜单和快捷键；
- Activity Bar 中的 React Webview 容器及消息通道；
- 编辑器选择、Code Action、文件 Tab、可编辑 Diff 和 Decorations；
- Terminal 与 Shell Integration；
- 工作区、Diagnostics、可见文件和打开标签页；
- Notebook/Jupyter 专用显示；
- Git SCM Input Box 和进度 UI；
- Comments 行级审查；
- VS Code Language Model API；
- URI/OAuth 回调、外部浏览器、剪贴板、通知和对话框；
- ExtensionContext 提供的安装路径、Global Storage 和资源生命周期。

而模型请求循环、工具审批、文件内容算法、MCP、浏览器自动化、Checkpoint、规则、Skill、Hook 和多数持久化逻辑属于 Cline 自己。改造时守住这条边界，把新的 IDE 依赖放进 `hosts/vscode` 并通过公共接口暴露，可以保持核心代码清晰且便于测试。
