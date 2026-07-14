---
title: "GitHub PR 审查"
description: "在 GitHub Actions 中使用 Cline CLI，通过 AI 自动审查拉取请求。"
---

自动审查每个拉取请求。由在 GitHub Actions 中自主运行的 Cline 提供详细分析、安全检查和代码建议。

## 工作流

当 PR 被打开或标记为可供审查时，此工作流会：
1.  **签出**代码。
2.  **安装** Node.js 和 Cline CLI。
3.  **配置**身份验证（例如 Anthropic、OpenAI）。
4.  **运行 Cline**，使用全面的系统提示词，通过 GitHub CLI（`gh`）分析差异、上下文和相关 Issue。
5.  **发布**包含内联代码建议的详细审查评论。

## 前置要求

-   已启用 Actions 的 **GitHub 仓库**。
-   作为仓库密钥（例如 `ANTHROPIC_API_KEY`）添加的 **AI 提供商 API 密钥**（例如 Anthropic、OpenRouter）。
-   **GitHub Token**（由 Actions 自动以 `GITHUB_TOKEN` 提供）。

## 设置

### 1. 创建工作流文件

在你的仓库中创建名为 `.github/workflows/cline-pr-review.yml` 的文件：

```yaml
name: Cline PR Code Review

on:
  pull_request:
    types: [opened, ready_for_review]
  workflow_dispatch:
    inputs:
      pr_number:
        description: "PR number to review"
        required: true
        type: string

concurrency:
  group: pr-review-${{ github.event.pull_request.number || inputs.pr_number }}
  cancel-in-progress: true

jobs:
  cline-pr-review:
    if: |
      (github.event_name == 'pull_request' && github.event.pull_request.draft == false) ||
      github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    timeout-minutes: 60

    permissions:
      contents: read
      pull-requests: write
      issues: read

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "npm"

      - name: Install Cline CLI
        run: npm install -g cline

      - name: Configure Cline Authentication
        # Replace 'anthropic' with your provider of choice (openai, openrouter, etc.)
        # and ensure the corresponding secret is set in your repo settings.
        run: |
          cline auth --provider anthropic \
            --apikey "${{ secrets.ANTHROPIC_API_KEY }}" \
            --modelid claude-opus-4-5-20251101

      - name: Get PR number
        id: pr
        run: |
          if [ "${{ github.event_name }}" == "workflow_dispatch" ]; then
            echo "number=${{ inputs.pr_number }}" >> $GITHUB_OUTPUT
          else
            echo "number=${{ github.event.pull_request.number }}" >> $GITHUB_OUTPUT
          fi

      - name: Review PR with Cline
        env:
          PR_NUMBER: ${{ steps.pr.outputs.number }}
          GITHUB_REPO: ${{ github.repository }}
          GH_TOKEN: ${{ github.token }}
          # Restrict Cline to only safe, read-only GitHub CLI commands
          CLINE_COMMAND_PERMISSIONS: |
            {
              "allow": [
                "gh pr diff *",
                "gh pr view *",
                "gh pr checks *",
                "gh pr list *",
                "gh issue list *",
                "gh issue view *",
                "git log *",
                "gh pr comment ${{ steps.pr.outputs.number }} *",
                "gh api repos/${{ github.repository }}/pulls/${{ steps.pr.outputs.number }}/comments *",
                "gh api repos/${{ github.repository }}/pulls/${{ steps.pr.outputs.number }}/reviews *"
              ]
            }
        run: |
          cline --auto-approve true 'You are a GitHub PR reviewer for this repository. Your goal is to give the PR author helpful feedback and give maintainers the context they need to review efficiently.

          PR: #'"${PR_NUMBER}"'

          ## Gather context
          Use `gh` commands to fetch the PR diff, details, and checks.
          
          ```bash
          # Get full PR details
          gh pr view '"${PR_NUMBER}"' --json number,title,body,author,createdAt,updatedAt,isDraft,labels,commits,files,additions,deletions,changedFiles,baseRefName,headRefName,mergeable,reviewDecision

          # Get the diff
          gh pr diff '"${PR_NUMBER}"'

          # Check CI status
          gh pr checks '"${PR_NUMBER}"'
          ```

          ## Deep code review
          Analyze the code changes. Look for:
          - Logic errors and edge cases
          - Security vulnerabilities
          - Performance issues
          - adherence to patterns in the codebase

          ## Submit Review
          Post a single comprehensive comment summarizing your review.
          
          If you have specific code suggestions, use the GitHub API to post inline comments:
          
          ```bash
          gh api repos/'"${GITHUB_REPO}"'/pulls/'"${PR_NUMBER}"'/reviews \
            -X POST \
            -f event="COMMENT" \
            -f body="" \
            -F comments='[{"path": "src/file.ts", "line": 10, "body": "Suggestion: ..."}]'
          ```
          
          Start your main comment with "Reviewed by Cline".'
```

### 2. 配置密钥

1.  前往仓库的 **Settings（设置）** -> **Secrets and variables（密钥与变量）** -> **Actions**。
2.  添加一个 **New repository secret（新建仓库密钥）**。
3.  名称：`ANTHROPIC_API_KEY`（或与工作流中使用的密钥一致）。
4.  值：你的实际 API 密钥。

## 关键组件说明

### 权限
```yaml
permissions:
  contents: read
  pull-requests: write
  issues: read
```
我们授予 `pull-requests: write`，使 Cline 可以发布评论和内联审查。`contents: read` 确保它可以分析代码，但**无法直接推送更改**，从而提供安全边界。

### 身份验证
```bash
cline auth --provider anthropic --apikey "..."
```
`auth` 命令可在 CI 环境中配置 Cline，而无需交互式提示。你可以通过更改标志切换提供商（例如 `openai`、`openrouter`）。

### 自主模式（`--auto-approve true`）
```bash
cline --auto-approve true '...'
```
`--auto-approve true` 标志会让 Cline 自主运行，无需等待交互式确认即可执行已批准的工具。提示词运行默认以 Act（执行）模式启动，因此 CI/CD 工作流可以立即执行所请求的工作。

### 命令权限
我们使用 `CLINE_COMMAND_PERMISSIONS` 明确限制 Cline 可以运行的命令。这确保 Cline 只能使用与审查相关的 `gh` 和 `git` 命令，防止任何意外或恶意的系统修改。

## 自定义审查器

最终步骤中传递给 Cline 的“系统提示词”可以完全自定义。你可以修改它以：
-   强制执行特定的风格指南。
-   侧重安全性或性能。
-   要求特定类型的反馈（例如“狠狠吐槽我的代码”或“语气温和些”）。
