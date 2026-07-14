---
title: "GitHub Issue 根本原因分析示例"
description: "使用 Cline CLI 自动分析 GitHub Issue，以确定根本原因。"
---

使用 Cline CLI 自动分析 GitHub Issue。此脚本利用 Cline 的自主 AI 能力来获取、分析 GitHub Issue 并确定其根本原因，输出整洁、可解析的结果，以便轻松集成到你的开发工作流中。

<Note>
**刚开始使用 Cline CLI？** 本示例假设你已完成[安装指南](/getting-started/installing-cline)，并已使用 `cline auth` 完成身份验证。如果你尚未设置 Cline CLI，请先从这里开始。
</Note>

<Frame>
  <img src="https://storage.googleapis.com/cline_public_images/cli-rca.gif" alt="CLI 根本原因分析演示" width="600" />
</Frame>

## 前置要求

本示例假设你已经：

- 安装 **Cline CLI** 并完成身份验证（[安装指南](/getting-started/installing-cline)）
- 配置了**至少一个 AI 模型提供商**（例如 OpenRouter、Anthropic、OpenAI）
- **基本熟悉** Cline CLI 命令

此外，你还需要：

- 安装 **GitHub CLI**（`gh`）并完成身份验证
- 安装 **jq** 以解析 JSON
- **bash** shell（或兼容的 shell）

### 安装说明

#### macOS

<Note>
这些说明要求安装 [Homebrew](https://brew.sh/)。如果你没有 Homebrew，请先运行以下命令安装：
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
</Note>

```bash
# Install GitHub CLI
brew install gh

# Install jq
brew install jq

# Authenticate with GitHub
gh auth login
```

#### Linux

```bash
# Install GitHub CLI (Debian/Ubuntu)
sudo apt install gh

# Or for other Linux distributions, see: https://cli.github.com/manual/installation

# Install jq (Debian/Ubuntu)
sudo apt install jq

# Authenticate with GitHub
gh auth login
```

## 获取脚本

**选项 1：使用 curl 直接下载**
```bash
curl -O https://raw.githubusercontent.com/cline/cline/main/src/samples/cli/github-issue-rca/analyze-issue.sh
```

**选项 2：复制完整脚本**

<Accordion title="点击查看完整的 analyze-issue.sh 脚本">

```bash
#!/bin/bash
# Analyze a GitHub issue using Cline CLI

if [ -z "$1" ]; then
    echo "Usage: $0 <github-issue-url> [prompt]"
    echo "Example: $0 https://github.com/owner/repo/issues/123"
    echo "Example: $0 https://github.com/owner/repo/issues/123 'What is the root cause of this issue?'"
    exit 1
fi

# Gather the args
ISSUE_URL="$1"
PROMPT="${2:-What is the root cause of this issue?}"
# Ask Cline for its analysis, showing only the summary
cline --auto-approve true --json "$PROMPT: $ISSUE_URL" | \
    jq -r 'select(.type == "agent_event" and .event.type == "done") | .event.text' | \
    sed 's/\\n/\n/g'
```

</Accordion>

<Note>
**下载或创建脚本后**，请运行以下命令使其可执行：
```bash
chmod +x analyze-issue.sh
```
</Note>

## 快速使用示例

### 基本用法

在保存脚本的目录中，从终端运行此命令，使用默认的根本原因提示词分析 Issue：

```bash
./analyze-issue.sh https://github.com/owner/repo/issues/123
```

这将：
- 从仓库获取 Issue #123
- 分析 Issue 以确定根本原因
- 提供包含建议的详细分析

### 自定义分析提示词

针对 Issue 提出具体问题：

```bash
./analyze-issue.sh https://github.com/owner/repo/issues/456 "What is the security impact?"
```

<Note>
该脚本会自动处理所有内容：获取 Issue、使用 Cline 分析它并显示结果。根据 Issue 的复杂程度，分析通常需要 30-60 秒。
</Note>

## 工作原理

让我们分析脚本的每个组成部分，以了解其工作原理。

### 参数验证

该脚本会验证输入并提供使用说明：

```bash
if [ -z "$1" ]; then
    echo "Usage: $0 <github-issue-url> [prompt]"
    echo "Example: $0 https://github.com/owner/repo/issues/123"
    echo "Example: $0 https://github.com/owner/repo/issues/123 'What is the root cause?'"
    exit 1
fi
```

**要点：**
- 验证必需的 GitHub Issue URL
- 展示清晰的使用示例
- 支持可选的自定义提示词

### 参数解析

该脚本提取并设置参数：

```bash
# Gather the args
ISSUE_URL="$1"
PROMPT="${2:-What is the root cause of this issue?}"
```

**说明：**
- `ISSUE_URL="$1"` - 第一个参数始终是 Issue URL
- `PROMPT="${2:-...}"` - 第二个参数可选，默认执行根本原因分析
- Cline CLI 会直接运行任务，因此不需要地址标志。

### 核心分析流水线

奇妙之处就在这里：

```bash
# Ask Cline for its analysis, showing only the summary
cline --auto-approve true --json "$PROMPT: $ISSUE_URL" | \
    jq -r 'select(.type == "agent_event" and .event.type == "done") | .event.text' | \
    sed 's/\\n/\n/g'
```

<Accordion title="流水线详解：了解每个组件">

**1. `cline --auto-approve true --json "$PROMPT: $ISSUE_URL"`**
   - `cline` 是 Cline CLI 二进制文件
   - 对于提示词运行，Act（执行）模式是默认模式
   - `--auto-approve true` 允许使用工具而无需交互式提示
   - `--json` 输出以换行符分隔的 JSON，以便解析
   - 使用 Issue URL 构建提示词

**2. `jq -r 'select(.type == "agent_event" and .event.type == "done") | .event.text'`**
   - 筛选最终的智能体 `done` 事件
   - 提取最终文本字段
   - `-r` 输出原始字符串（无 JSON 引号）

**3. `sed 's/\\n/\n/g'`**
   - 将转义的换行符转换为实际换行符
   - 使输出易于阅读

</Accordion>

## 示例输出

以下是分析一个真实 Flutter Issue 的示例：

```bash
$ ./analyze-issue.sh https://github.com/csells/flutter_counter/issues/2
```

**输出：**

```markdown
**Root Cause Analysis of Issue #2: "setState isn't cutting it"**

After examining the GitHub issue and analyzing the Flutter counter codebase, 
I've identified the root cause of why setState() is insufficient for this 
project's needs:

## Current Implementation Problems

The current Flutter counter app uses setState() for state management, which 
has several limitations:

1. **Local State Only**: setState() only works within a single widget, making 
   it difficult to share state across the app
2. **Rebuild Overhead**: Every setState() call rebuilds the entire widget tree, 
   causing performance issues with complex UIs
3. **No State Persistence**: State is lost when the widget is disposed
4. **Testing Challenges**: setState-based logic is tightly coupled to the UI, 
   making unit testing difficult

## Why This Matters

As the app grows beyond a simple counter, these limitations become critical:
- Multiple screens need to access the count
- State needs to persist across navigation
- Business logic should be testable independently
- UI should only rebuild when necessary

## Recommended Solutions

The issue mentions "Provider or Bloc" - both are excellent alternatives:

1. **Provider**: Simple, lightweight state management using InheritedWidget
   - Easy migration path from setState
   - Good for small to medium apps
   - Official Flutter recommendation

2. **Bloc**: More structured approach with clear separation between events, 
   states, and business logic
   - Better for complex apps
   - Excellent testability
   - Clear architectural patterns

3. **Riverpod**: Modern alternative to Provider with better performance and 
   developer experience
   - Compile-time safety
   - Better testing support
   - More flexible than Provider

4. **GetX**: Full-featured solution with state management, routing, and 
   dependency injection
   - Minimal boilerplate
   - Fast and lightweight
   - All-in-one solution

## Next Steps

The current codebase needs refactoring to implement proper state management 
architecture to handle more complex state scenarios effectively. Provider 
would be the easiest migration path while Bloc provides better long-term 
scalability.
```

## 何时使用此模式

此脚本模式非常适合各种开发场景，在这些场景中，自动化 GitHub Issue 分析可以加速你的工作流。

### 缺陷调查

快速分析缺陷报告并确定根本原因，无需手动探索代码：

```bash
./analyze-issue.sh https://github.com/project/repo/issues/123 \
    "What is the root cause of this bug?"
```

### 功能请求分析

了解功能请求的上下文和影响：

```bash
./analyze-issue.sh https://github.com/project/repo/issues/456 \
    "What are the implementation challenges?"
```

### 安全审计

评估所报告 Issue 的安全影响：

```bash
./analyze-issue.sh https://github.com/project/repo/issues/789 \
    "What are the security implications?"
```

### 文档生成

根据 Issue 生成详细的技术文档：

```bash
./analyze-issue.sh https://github.com/project/repo/issues/654 \
    "Provide detailed technical documentation for this issue"
```

### 代码审查辅助

针对提议的更改获取第二意见：

```bash
./analyze-issue.sh https://github.com/project/repo/issues/987 \
    "Review the proposed solution approach"
```

## 总结

本示例演示了如何使用 Cline CLI 构建自主 GitHub Issue 分析工具：

1. 使用 Cline 的能力**构建自主 CLI 工具**
2. **解析 Cline CLI 的结构化 JSON 输出**
3. 通过自定义提示词**创建灵活的自动化脚本**
4. **与 GitHub 集成**以分析 Issue
5. 有效**处理命令行参数**

此模式可适用于许多其他自动化场景，从拉取请求审查到文档生成，再到代码质量分析。

## 相关资源

- [CLI 安装指南](/getting-started/installing-cline)
- [CLI 参考文档](/cli/cli-reference)
- [无头模式](/usage/cli-overview#%E6%97%A0%E5%A4%B4%E6%A8%A1%E5%BC%8F)
