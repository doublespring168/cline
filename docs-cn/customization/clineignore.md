---
title: ".clineignore"
sidebarTitle: ".clineignore"
description: "控制 Cline 可以访问项目中的哪些文件和目录。"
---

`.clineignore` 文件用于告知 Cline 在分析代码库时应跳过哪些文件和目录。它的工作方式类似于 `.gitignore`：在项目根目录创建一个名为 `.clineignore` 的文件，添加要排除的文件模式，Cline 就会忽略它们。

## 为什么它很重要

如果没有 `.clineignore`，Cline 可能会将整个项目加载到上下文中，包括依赖项、构建产物和生成的文件。这会浪费 token、增加成本，并可能将有用的上下文挤出窗口。

添加 `.clineignore` 可以将初始上下文从 200k+ token 降至 50k 以下。这意味着响应更快、成本更低，并且能够有效使用更小、更便宜的模型。

## 创建 .clineignore

在项目根目录创建一个名为 `.clineignore` 的文件：

```text
# Dependencies
node_modules/
**/node_modules/

# Build outputs
/build/
/dist/
/.next/
/out/

# Testing artifacts
/coverage/

# Environment variables
.env
.env.*

# Large data files
*.csv
*.xlsx
*.sqlite

# Generated/minified code
*.min.js
*.map
```

## 模式语法

`.clineignore` 使用与 `.gitignore` 相同的模式语法：

| 模式 | 匹配项 |
|---------|---------|
| `node_modules/` | `node_modules` 目录 |
| `**/node_modules/` | 任意深度的 `node_modules` |
| `*.csv` | 所有 CSV 文件 |
| `/build/` | 仅项目根目录下的 `build` 目录 |
| `*.env.*` | 类似 `.env.local`、`.env.production` 的文件 |
| `!important.csv` | 例外：不要忽略此文件 |

以 `#` 开头的行是注释。空行会被忽略。

## 要排除的内容

从以下类别开始，并根据你的项目进行调整：

**几乎总是要排除：**
- 包管理器目录（`node_modules/`、`vendor/`、`.venv/`）
- 构建输出（`dist/`、`build/`、`.next/`、`out/`）
- 覆盖率报告（`coverage/`）
- 较大的锁文件（`package-lock.json`、`yarn.lock`）

**如果存在则排除：**
- 大型数据文件（`.csv`、`.xlsx`、`.sqlite`、`.parquet`）
- 二进制资源（图像、字体、视频）
- 生成的代码（API 客户端、protobuf 输出、压缩后的 bundle）
- 包含机密信息的环境文件（`.env`、`.env.local`）

**保持可访问：**
- 你正在处理的源代码
- Cline 理解项目所需的配置文件（`tsconfig.json`、`package.json`）
- 文档和 README
- 测试文件（Cline 经常需要这些文件作为上下文）

## 工作原理

当 Cline 扫描项目以构建上下文时，它会根据你的 `.clineignore` 模式检查每个文件路径。匹配的文件会从以下内容中排除：

- Cline 开始任务时看到的文件列表
- 对话期间自动收集的上下文
- Cline 查找相关代码时的搜索结果

你仍然可以使用 [@ 提及](/core-workflows/working-with-files)显式引用被忽略的文件。如果你输入 `@/node_modules/some-package/index.js`，即使 `node_modules/` 位于你的 `.clineignore` 中，Cline 也会读取该特定文件。忽略规则控制的是自动加载，而不是显式访问。

<Note>
`.clineignore` 与 `.gitignore` 相互独立。由 Git 跟踪但与 Cline 无关的文件（例如大型测试夹具或数据文件）应放入 `.clineignore`，即使它们不在 `.gitignore` 中。
</Note>

## 提示

- 尽早在项目中添加 `.clineignore`。先进行广泛排除再缩小范围，比以后调试上下文为何臃肿要容易。
- 添加 `.clineignore` 后，检查任务标题中的 token 使用量。差异通常非常显著。
- 如果 Cline 似乎缺少某个文件的上下文，请检查它是否被你的忽略模式排除。
- 对于 monorepo 或多根工作区，每个工作区根目录都可以有自己的 `.clineignore`。详情请参阅[多根工作区](/features/multiroot-workspace)。

## 相关内容

- [Cline 规则](/customization/cline-rules) - 为 Cline 定义持久指令
- [任务管理](/core-workflows/task-management#%E4%B8%8A%E4%B8%8B%E6%96%87%E7%AA%97%E5%8F%A3) - 了解上下文窗口的工作原理
- [自动压缩](/features/auto-compact) - 在长时间任务期间自动压缩上下文
