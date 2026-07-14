---
title: "模型编排"
description: "策略性地使用多个 AI 模型：在工作流中优化成本、减少偏差并利用特定模型的优势"
---

Cline CLI 的 `--config` 和 `--thinking` 标志可支持复杂的多模型工作流。你不必为所有任务使用单一模型，而是可以根据成本、能力和专长，将不同工作路由给不同模型。

## 为什么要编排多个模型？

**成本优化**

通过将工作路由给最适合该任务的模型，你可以大幅降低 API 成本。Haiku 和 Gemini Flash 等快速、低成本的模型可处理摘要之类的简单任务，而 Opus 和 O1 等昂贵模型则留给复杂推理和规划。这种方法可将常规操作的成本降低 10-100 倍。

**减少偏差**

不同模型会发现不同的问题，因此通过多个 AI 视角交叉验证解决方案，有助于减少依赖单一模型所产生的盲点。尤其在代码审查中，结合多种观点能够揭示任何单一模型都可能遗漏的问题。

**专业化**

某些模型在特定领域表现出色：Codex 和 DeepSeek 擅长代码生成，而 GPT-4 和 Claude 则在文档和文章写作方面表现优异。安全分析尤其能从结合多个模型的观点中受益，因为每个模型都会带来不同的训练数据和启发式方法。

## 模式 1：CI/CD 代码审查

请参阅我们使用 Cline CLI 进行自动化 PR 审查的生产级 GitHub Actions 工作流：[cline-pr-review.yml](https://github.com/cline/cline/blob/main/.github/workflows/cline-pr-review.yml)

**展示的关键能力：**
- **自动内联建议**：创建 GitHub 建议块，作者只需点击一下即可提交
- **主题专家识别**：分析 git 历史记录，为每个文件寻找主题专家
- **相关 Issue 发现**：从过去的 Issue 和 PR 中搜索上下文
- **安全优先的权限**：仅有代码库读取权限，只能发布审查意见
- **深入代码分析**：理解意图、比较方法并识别边缘情况

该工作流会在每个 PR 上运行，并为维护者提供全面的上下文，以便更快地做出更明智的决策。

## 模式 2：任务阶段优化

针对不同工作阶段使用不同模型。将简单任务路由给低成本模型，将复杂推理路由给高级模型。

### 示例：Issue 分析流水线

```bash
# Get latest issue content
ISSUE_CONTENT=$(gh issue view $(gh issue list -L 1 | awk '{print $1}'))

# Phase 1: Quick summary with cheap model
SUMMARY=$(echo "$ISSUE_CONTENT" | cline --auto-approve true --config ~/.cline-haiku \
  "summarize this issue in 2-3 sentences")

# Phase 2: Detailed plan with expensive model + thinking
PLAN=$(echo "$SUMMARY" | cline --auto-approve true --thinking high --config ~/.cline-opus \
  "create detailed implementation plan with edge cases")

# Phase 3: Execute with mid-tier model
echo "$PLAN" | cline --auto-approve true --config ~/.cline-sonnet \
  "implement the plan from above"
```

<Note>
每次 `cline` 调用都需要完成后，才能将输出传递给下一阶段。请使用 shell 变量存储中间结果，而不要直接通过管道连接 `cline` 命令。
</Note>

**成本影响：**
- Haiku：每百万输入 token $0.80
- Opus：每百万输入 token $15  
- Sonnet：每百万输入 token $3

此模式仅在复杂推理需要时使用 Opus，与所有任务都使用 Opus 相比，可节省约 10 倍的 API 成本。

### 设置模型配置

为每个模型创建单独的配置目录：

```bash
# Create config directories
mkdir -p ~/.cline-haiku ~/.cline-sonnet ~/.cline-opus

# Configure each with different models
cline --config ~/.cline-haiku auth anthropic --modelid claude-haiku-4-20250514
cline --config ~/.cline-sonnet auth anthropic --modelid claude-sonnet-4-20250514  
cline --config ~/.cline-opus auth anthropic --modelid claude-opus-4-5-20251101

# Or use different providers entirely
cline --config ~/.cline-gemini auth gemini --modelid gemini-2.0-flash-exp
cline --config ~/.cline-codex auth openai-codex --modelid gpt-5-latest
```

现在，你可以使用 `--config` 为每项任务切换模型：

```bash
cline --config ~/.cline-haiku "quick task"
cline --config ~/.cline-opus "complex reasoning task"
```

## 模式 3：多模型审查与共识

针对同一项更改获取多个 AI 的观点，然后综合它们的反馈。

### 示例：差异审查流水线

```bash
# Get the latest commit
DIFF=$(git show)

# Review 1: Gemini's perspective
echo "$DIFF" | cline --auto-approve true --config ~/.cline-gemini \
    "review this diff and write your analysis to gemini-review.md"

# Review 2: Codex's perspective
echo "$DIFF" | cline --auto-approve true --config ~/.cline-codex \
    "review this diff and write your analysis to codex-review.md"

# Review 3: Opus's perspective
echo "$DIFF" | cline --auto-approve true --config ~/.cline-opus \
    "review this diff and write your analysis to opus-review.md"

# Synthesize all reviews into a consensus
cat gemini-review.md codex-review.md opus-review.md | cline --auto-approve true \
    "summarize these 3 reviews and identify: 1) issues all models agree on, 2) issues only one model caught, 3) your final recommendation"
```

**此方法有效的原因：**
- **冗余性**：所有 3 个模型都发现的问题具有较高可信度
- **覆盖范围**：每个模型都有盲点；结合起来可以覆盖更多方面
- **优先级排序**：应优先修复达成共识的问题
- **学习**：了解哪类模型会发现哪类问题

### 高级用法：并行审查

并行运行审查以更快获得反馈：

```bash
# Run all reviews simultaneously
git show | cline --auto-approve true --config ~/.cline-gemini "review and save to gemini-review.md" &
git show | cline --auto-approve true --config ~/.cline-codex "review and save to codex-review.md" &
git show | cline --auto-approve true --config ~/.cline-opus "review and save to opus-review.md" &

# Wait for all to complete
wait

# Synthesize
cat *-review.md | cline --auto-approve true "create consensus review"
```

<Note>
并行执行需要管理多个 Cline 实例。有关详细信息，请参阅[多实例工作流](/usage/cli-overview#%E8%87%AA%E5%8A%A8%E5%8C%96%E6%A8%A1%E5%BC%8F)。
</Note>

## 对复杂任务使用扩展思考

当 Cline 需要分析多种方法时，请使用 `--thinking` 标志：

```bash
# Without thinking: Fast but may miss nuances
cline --auto-approve true "refactor this codebase"

# With thinking: Slower but more thorough
cline --auto-approve true --thinking high \
    "refactor this codebase - consider: performance, maintainability, backward compatibility"
```

`--thinking <level>` 标志用于设置推理投入程度。当你希望模型在复杂权衡上投入更多精力时，请使用 `--thinking high` 或 `--thinking xhigh`。最适合：
- 架构决策
- 安全分析
- 复杂重构
- 多步骤规划

## 最佳实践

1. **分析你的工作负载**：跟踪哪些任务简单、哪些任务复杂
2. **让模型匹配任务**：使用快速模型进行摘要，使用强大模型进行推理
3. **自动切换**：根据任务类型编写模型选择脚本
4. **监控成本**：不同模型的价格相差 10-100 倍
5. **验证重要决策**：对关键更改使用多模型共识

## 生产环境示例

### 成本优化的 PR 审查

```bash
# Haiku: Quick summary and issue identification
gh pr view $PR | cline --auto-approve true --config ~/.cline-haiku \
    "list all issues to fix, output as JSON"

# Opus with thinking: Deep analysis only if issues found
if [ -s issues.json ]; then
    cline --auto-approve true --thinking high --config ~/.cline-opus \
        "analyze these issues and recommend fixes"
fi
```

### 注重安全的多模型扫描

```bash
# Different models have different security perspectives
git diff main | cline --auto-approve true --config ~/.cline-gemini "security review" > gemini-sec.md &
git diff main | cline --auto-approve true --config ~/.cline-opus "security review" > opus-sec.md &
git diff main | cline --auto-approve true --config ~/.cline-codex "security review" > codex-sec.md &
wait

# High-priority: Issues all 3 models found
cat *-sec.md | cline --auto-approve true "find security issues all 3 reviews mentioned"
```

## 相关文档

<Columns cols={2}>
  <Card title="CLI 参考" icon="terminal" href="/cli/cli-reference">
    --config 和 --thinking 标志的完整文档
  </Card>
  
  <Card title="无头模式" icon="robot" href="/usage/cli-overview#%E6%97%A0%E5%A4%B4%E6%A8%A1%E5%BC%8F">
    在脚本、CI/CD 流水线和自动化工作流中自主运行 Cline。
  </Card>
  
  <Card title="Cline 提供商" icon="brain" href="/getting-started/cline-provider">
    最快捷的内置模型访问设置和账户工作流
  </Card>
  
  <Card title="CI/CD 集成" icon="github" href="/cli/samples/github-integration">
    使用 Cline CLI 自动执行 GitHub 工作流
  </Card>
</Columns>
