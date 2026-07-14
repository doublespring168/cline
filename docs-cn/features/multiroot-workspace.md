---
title: "多根工作区"
sidebarTitle: "多根工作区"
---

Cline 支持 VS Code 的多根工作区，让你可以在单个窗口中管理多个项目文件夹或仓库。无论你使用的是 monorepo 还是相互独立的 Git 仓库，Cline 都可以跨越所有这些位置读取文件、编写代码和运行命令。

<Frame>
  <video
    src="https://storage.googleapis.com/cline_public_images/multiworkspace.mp4"
    autoPlay
    muted
    loop
    playsInline
    controls
  />
</Frame>

<Warning>
多根工作区有两项限制：
- **Cline 规则**仅在主工作区文件夹中生效
- **[检查点](/core-workflows/checkpoints)**会被禁用（返回单文件夹工作区后恢复）

详情请参阅[当前限制](#%E5%BD%93%E5%89%8D%E9%99%90%E5%88%B6)。
</Warning>

## 了解多根工作区

开始之前，先了解组织相关项目的两种常见模式会很有帮助。

### 为什么使用多根工作区？

Cline 可以完成横跨多个项目或仓库的任务：

- **重构**：更新 API 契约，并修复跨仓库的所有使用方
- **功能开发**：实现涉及前端、后端和共享代码的功能
- **依赖项更新**：协调相关项目之间的版本升级
- **文档**：生成引用多个仓库中代码的文档

**示例提示词：**
```text
Update the User type in the contracts repo, then update both the frontend 
and backend to use the new fields. Make sure the API validates the new 
required field.
```
## 设置多根工作区

### Monorepo 与多个仓库

**Monorepo**：一个包含多个项目或软件包的 Git 仓库。所有代码共享相同的版本历史记录。

<Files>
  <Folder name="my-company" defaultOpen>
    <Folder name=".git" />
    <Folder name="packages" defaultOpen>
      <Folder name="web" icon="react">
        <File name="..." />
      </Folder>
      <Folder name="api" icon="node-js">
        <File name="..." />
      </Folder>
      <Folder name="shared">
        <File name="..." />
      </Folder>
    </Folder>
    <File name="package.json" />
  </Folder>
</Files>

**多个仓库**：相互独立的 Git 仓库，每个仓库都有自己的历史记录，并在同一个 VS Code 工作区中一起打开。

```text
~/projects/
├── fullstack.code-workspace   # Workspace config file
├── frontend/                  # git@github.com:acme/frontend.git
│   └── .git/
├── backend/                   # git@github.com:acme/backend.git
│   └── .git/
└── contracts/                 # git@github.com:acme/api-contracts.git
    └── .git/
```

Cline 支持这两种模式，也支持某些文件夹是 Git 仓库而其他文件夹不是的混合设置。关键区别在于：使用多个仓库时，每个文件夹都有自己的 `.git` 目录，Cline 会独立跟踪它们。

### 将文件夹添加到工作区

你可以通过多种方式将文件夹添加到工作区：

- **File（文件）菜单**：在 VS Code 中使用 `File > Add Folder to Workspace`
- **拖放**：将文件夹直接拖入 VS Code 的文件资源管理器
- **工作区文件**：创建 `.code-workspace` 文件（推荐团队使用）
- **命令面板**：运行 `Workspaces: Add Folder to Workspace`

有关详细说明，请参阅 [Microsoft 的多根工作区指南](https://code.visualstudio.com/docs/editor/multi-root-workspaces)。

## 使用多个仓库

当你在一个工作区中打开多个独立的 Git 仓库时，Cline 会将每个仓库视为拥有自己版本控制的独立项目。

### Cline 为每个仓库跟踪的内容

对于每个工作区文件夹，Cline 会检测：

| 属性 | 描述 |
|----------|-------------|
| **路径** | 文件夹的绝对路径 |
| **名称** | 派生自文件夹名称或工作区文件 |
| **VCS 类型** | Git、Mercurial 或无版本控制 |
| **提交哈希** | 当前 HEAD 提交（适用于 Git/Mercurial 仓库） |

这意味着 Cline 明白你的前端和后端可能处于不同提交、不同分支，甚至使用不同的版本控制系统。

<Note>
虽然 Cline 会检测所有工作区文件夹的 VCS 信息，但某些功能仅使用**主工作区**（第一个文件夹）：[Cline 规则](/customization/cline-rules)、[技能](/customization/skills#%E4%BD%BF%E7%94%A8%E6%96%9C%E6%9D%A0%E5%91%BD%E4%BB%A4%E8%A7%A6%E5%8F%91%E6%8A%80%E8%83%BD)，以及 `@git` 提及等 [Git 相关功能](/core-workflows/working-with-files)。
</Note>

## 跨工作区引用文件

### 自然语言引用

Cline 能理解对工作区的自然引用：

```text
"Read the package.json in the frontend folder"
```

```text
"Compare the user model in backend with the TypeScript types in contracts"
```

```text
"Search for TODO comments across all workspaces"
```

### 工作区提示语法

如需明确引用，请使用 `@workspace:path` 语法：

| 语法 | 描述 |
|--------|-------------|
| `@frontend:src/App.tsx` | “frontend”工作区中的文件 |
| `@backend:server.ts` | “backend”工作区中的文件 |
| `@contracts:types/` | “contracts”工作区中的文件夹 |

此语法在以下情况下特别有用：
- 多个工作区中存在同名文件
- 你希望明确指出所指的项目
- Cline 需要消除歧义

### 工作区名称的工作方式

工作区名称来自：
1. `name` 字段，位于 `.code-workspace` 文件中（如果指定）
2. 文件夹名称（默认）

如果两个文件夹名称相同，请附加数字，或使用工作区文件为它们指定唯一名称。

## 常见配置

### Monorepo 开发

```text
~/projects/my-app/
├── my-app.code-workspace      # Workspace config file
├── web/          (React frontend)
├── api/          (Node.js backend)  
├── mobile/       (React Native)
└── shared/       (Common utilities)
```

所有文件夹共享一份 Git 历史记录。跨软件包的更改是原子性的。

**示例提示词：** *“更新 web 和 mobile 应用中的 API 端点，使其与新的后端路由匹配”*

### 使用独立仓库的微服务

```text
~/projects/services/
├── services.code-workspace    # Workspace config file
├── user-service/       (git: github.com/acme/user-service)
├── payment-service/    (git: github.com/acme/payment-service)
├── gateway/            (git: github.com/acme/api-gateway)
└── proto/              (git: github.com/acme/service-protos)
```

每个服务都有自己的仓库。Cline 可以更新 proto 定义，并在所有服务中重新生成客户端。

**示例提示词：** *“在 proto 的 UserProfile 消息中添加一个新字段，然后更新 user-service 和 gateway 以处理该字段”*

### 使用共享契约的全栈项目

```text
~/projects/fullstack/
├── fullstack.code-workspace   # Workspace config file
├── client/         (git: github.com/acme/web-client)
├── server/         (git: github.com/acme/api-server)
└── types/          (git: github.com/acme/shared-types)
```

types 仓库定义 client 和 server 都会使用的接口。当你更新某个类型时，Cline 可以修复这两个使用方。

### 混合设置

```text
~/projects/project/
├── project.code-workspace     # Workspace config file
├── main-app/       (git: github.com/acme/main-app)
├── vendor/         (no VCS - vendored dependencies)
└── scripts/        (no VCS - local automation)
```

仓库与普通文件夹混合使用。Cline 会适应每个文件夹的配置。

## 当前限制

在多根工作区模式下，有两项功能受到限制：

### Cline 规则

[Cline 规则](/customization/cline-rules)（`.clinerules/` 目录）仅在**主工作区**（工作区中的第一个文件夹）中生效。其他工作区文件夹中的规则会被忽略。

**解决方法：**将共享规则放在主工作区中，或使用全局规则（`~/Documents/Cline/Rules/`），它们会应用于所有位置。

### 检查点

多根工作区模式下会禁用[检查点](/core-workflows/checkpoints)。发生这种情况时，Cline 会显示警告。

**原因：**检查点使用影子 Git 仓库来跟踪更改。面对多个仓库时，要跨越相互独立的 Git 历史记录协调检查点会增加复杂性，目前尚不支持。

**解决方法：**使用你常规的 Git 工作流。频繁提交，或为实验性工作创建分支。

当你返回单文件夹工作区时，这两项限制都会解除。

## 最佳实践

### 组织工作区

1. **将相关项目分组**，尤其是经常需要协调更改的项目
2. **使用工作区文件**，以便在团队中实现可复现的设置
3. **清晰命名文件夹**，使工作区提示直观易懂
4. **考虑主工作区**，以便放置 Cline 规则

### 有效的提示方式

- **在重要时明确说明**：*“更新 backend 工作区中的用户模型”*
- **引用关系**：*“frontend 使用 contracts 工作区中的类型”*
- **描述跨工作区更改**：*“这需要同时更新 web 和 mobile”*
- **为大型代码库限定搜索范围**：*“仅在 frontend 工作区中搜索 'TODO'”*

### 使用大型工作区

- 尽可能将大型任务拆分为特定于工作区的操作
- 使用[规划模式](/core-workflows/plan-and-act)，让 Cline 先了解结构
- 添加 `.clineignore` 文件以减少干扰、加快扫描速度，并让 Cline 专注于源代码：

```text
# Dependencies
**/node_modules/

# Build outputs
**/dist/
**/build/

# VCS metadata
**/.git/
```

有关更多模式和注意事项，请参阅 [.clineignore 文件指南](/customization/clineignore)。
