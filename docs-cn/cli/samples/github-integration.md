---
title: "GitHub Actions 集成"
description: "通过在评论中提及 @cline，使用 GitHub Actions 中的 Cline CLI 自动回复 GitHub Issue。"
---

使用 AI 自动执行 GitHub Issue 分析。在任何 Issue 评论中提及 `@cline`，即可触发自主调查：读取文件、分析代码并提供可执行的见解——全部在 GitHub Actions 中自动运行。


<Note>
**刚开始使用 Cline CLI？** 本示例假设你了解 Cline CLI 基础知识，并且已完成[安装指南](/getting-started/installing-cline)。如果你刚开始使用 Cline CLI，建议先从 [GitHub RCA 示例](./github-issue-rca)开始，因为它更简单，可帮助你在设置 GitHub Actions 之前了解基础知识。
</Note>

## 工作流

在任何 Issue 评论中提及 `@cline` 来触发 Cline：

<Frame>
  <img src="https://storage.googleapis.com/cline_public_images/ss0a-comment.png" alt="提及 @cline 的 Issue 评论" width="600" />
</Frame>

Cline 的自动分析会作为一条新评论出现，其中包含从你的实际代码库得出的见解：

<Frame>
  <img src="https://storage.googleapis.com/cline_public_images/ss0b-final.png" alt="Cline 的自动分析回复" width="600" />
</Frame>

从文件探索到发布结果，整个调查过程都在 GitHub Actions 中自主运行。

让我们配置你的仓库。

## 前置要求

开始之前，你需要：

- **Cline CLI 知识**——已完成[安装指南](/getting-started/installing-cline)并了解基本用法
- **GitHub 仓库**——拥有配置 Actions 和密钥的管理员权限
- **熟悉 GitHub Actions**——对工作流和 CI/CD 有基本了解
- **API 提供商账号**——OpenRouter、Anthropic 或类似服务的 API 密钥

## 设置

### 1. 复制工作流文件



将此示例中的工作流文件复制到你的仓库。工作流文件必须放在仓库根目录的 `.github/workflows/` 目录中，GitHub Actions 才能检测并运行它。在本例中，我们将其命名为 `cline-responder.yml`。

```bash
# In your repository root
mkdir -p .github/workflows
curl -o .github/workflows/cline-responder.yml https://raw.githubusercontent.com/cline/cline/main/src/samples/cli/github-integration/cline-responder.yml
```

或者，你可以将完整工作流文件直接复制到 `.github/workflows/cline-responder.yml`：

<Accordion title="点击查看完整的 cline-responder.yml 工作流">
```yaml
name: Cline Issue Assistant

on:
  issue_comment:
    types: [created, edited]

permissions:
  issues: write

jobs:
  respond:
    runs-on: ubuntu-latest
    environment: cline-actions
    steps:
      - name: Check for @cline mention
        id: detect
        uses: actions/github-script@v7
        with:
          script: |
            const body = context.payload.comment?.body || "";
            const isPR = !!context.payload.issue?.pull_request;
            const hit = body.toLowerCase().includes("@cline");
            core.setOutput("hit", (!isPR && hit) ? "true" : "false");
            core.setOutput("issue_number", String(context.payload.issue?.number || ""));
            core.setOutput("issue_url", context.payload.issue?.html_url || "");
            core.setOutput("comment_body", body);

      - name: Checkout repository
        if: steps.detect.outputs.hit == 'true'
        uses: actions/checkout@v4

      # Node v20+ is needed for Cline CLI on GitHub Actions Linux
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install Cline CLI
        if: steps.detect.outputs.hit == 'true'
        run: npm install -g cline

      - name: Configure Cline Authentication
        if: steps.detect.outputs.hit == 'true'
        env:
          CLINE_DIR: ${{ runner.temp }}/cline
        run: |
          # Configure API key using the auth command
          cline auth --provider openrouter --apikey "${{ secrets.OPENROUTER_API_KEY }}"

      - name: Download analyze script
        if: steps.detect.outputs.hit == 'true'
        run: |
          export GITORG="YOUR-GITHUB-ORG"
          export GITREPO="YOUR-GITHUB-REPO"

          curl -L https://raw.githubusercontent.com/${GITORG}/${GITREPO}/refs/heads/main/git-scripts/analyze-issue.sh -o analyze-issue.sh
          chmod +x analyze-issue.sh

      - name: Run analysis
        if: steps.detect.outputs.hit == 'true'
        id: analyze
        env:
          ISSUE_URL: ${{ steps.detect.outputs.issue_url }}
          COMMENT: ${{ steps.detect.outputs.comment_body }}
        run: |
          set -euo pipefail
          
          RESULT=$(./analyze-issue.sh "${ISSUE_URL}" "Analyze this issue. The user asked: ${COMMENT}")
          
          {
            echo 'result<<EOF'
            printf "%s\n" "$RESULT"
            echo 'EOF'
          } >> "$GITHUB_OUTPUT"

      - name: Post response
        if: steps.detect.outputs.hit == 'true'
        uses: actions/github-script@v7
        env:
          ISSUE_NUMBER: ${{ steps.detect.outputs.issue_number }}
          RESULT: ${{ steps.analyze.outputs.result }}
        with:
          script: |
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: Number(process.env.ISSUE_NUMBER),
              body: process.env.RESULT || "(no output)"
            });
```
</Accordion>

<Warning>
**提交前，你必须编辑工作流文件！**

打开 `.github/workflows/cline-responder.yml`，更新工作流中的“Download analyze script（下载分析脚本）”步骤，指定存储分析脚本的 GitHub 组织和仓库：

```yaml
export GITORG="YOUR-GITHUB-ORG"      # Change this!
export GITREPO="YOUR-GITHUB-REPO"    # Change this!
```

**示例：** 如果你的仓库是 `github.com/acme/myproject`，请设置：
```yaml
export GITORG="acme"
export GITREPO="myproject"
```

这会告诉工作流在你于步骤 3 提交分析脚本后，应从仓库中的哪个位置下载该脚本。
</Warning>

该工作流会查找新建或更新的 Issue，检查是否提及 `@cline`，然后
启动 Cline CLI 深入调查 Issue，并以 Issue 回复的形式提供反馈。

### 2. 配置 API 密钥

将 AI 提供商 API 密钥添加为仓库密钥：

1. 前往你的 GitHub 仓库
2. 导航至 **Settings（设置）** → **Environment（环境）** 并添加新环境。

   <Frame>
     <img src="https://storage.googleapis.com/cline_public_images/ss01-environment.png" alt="导航到 Actions 密钥" width="600" />
   </Frame>

   请确保将其命名为“cline-actions”，使其与 `environment`
   值（位于 `cline-responder.yml` 文件顶部）匹配。

3. 点击 **New repository secret（新建仓库密钥）**
4. 添加名为 `OPENROUTER_API_KEY` 的密钥，值为来自
   [openrouter.com](https://openrouter.com) 的 API 密钥。

   <Frame>
     <img src="https://storage.googleapis.com/cline_public_images/ss02-api-key.png" alt="添加 API 密钥" width="600" />
   </Frame>

5. 验证密钥已配置：

   <Frame>
     <img src="https://storage.googleapis.com/cline_public_images/ss03-ready.png" alt="API 密钥已配置" width="600" />
   </Frame>

现在，你已准备好为 GitHub Action 提供 Cline 所需的凭据。

### 3. 添加分析脚本

将 `github-issue-rca` 示例中的分析脚本添加到你的仓库。**首先，你需要在仓库根目录中创建脚本所在的 `git-scripts` 目录。** 选择以下选项之一：

**选项 A：直接下载（推荐）**

```bash
# In your repository root, create the directory and download the script
mkdir -p git-scripts
curl -o git-scripts/analyze-issue.sh https://raw.githubusercontent.com/cline/cline/main/src/samples/cli/github-issue-rca/analyze-issue.sh
chmod +x git-scripts/analyze-issue.sh
```

**选项 B：手动复制粘贴**

手动创建目录和文件，然后粘贴脚本内容：

```bash
# In your repository root
mkdir -p git-scripts
# Create and edit the file with your preferred editor
nano git-scripts/analyze-issue.sh  # or use vim, code, etc.
```

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

粘贴脚本内容后，使其可执行：
```bash
chmod +x git-scripts/analyze-issue.sh
```
</Accordion>

此分析脚本会调用 Cline 对 GitHub Issue 执行提示词，
汇总输出以填充对 Issue 的回复。

### 4. 提交并推送

```bash
git add .github/workflows/cline-responder.yml
git add git-scripts/analyze-issue.sh
git commit -m "Add Cline issue assistant workflow"
git push
```

## 用法

设置完成后，只需在任何 Issue 评论中提及 `@cline`：

```text
@cline what's causing this error?

@cline analyze the root cause

@cline what are the security implications?
```

GitHub Actions 将：
1. 检测提及的 `@cline`
2. 启动 Cline CLI 实例
3. 下载分析脚本
4. 使用启用了自动批准的 Act（执行）模式分析 Issue
5. 将 Cline 的分析作为新评论发布

**注意**：该工作流仅由 Issue 评论触发，不会由拉取请求
评论触发。

## 工作原理

该工作流（`cline-responder.yml`）：

1. 由 Issue 评论（创建或编辑）**触发**
2. **检测**是否提及 `@cline`（不区分大小写）
3. 使用 npm 全局**安装** Cline CLI
4. 使用 `cline auth --provider openrouter --apikey ...` **配置**身份验证
6. **下载**可复用的 `analyze-issue.sh` 脚本，该脚本来自
   `github-issue-rca` 示例
7. 在 Cline CLI 中**运行**分析
8. 将分析结果作为评论**发布**

## 相关示例

- **[github-issue-rca](./github-issue-rca)**：支持此集成的可复用脚本
