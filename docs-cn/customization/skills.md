---
title: "技能"
sidebarTitle: "技能"
description: "针对特定任务扩展 Cline 功能的模块化指令集。"
---

技能是针对特定任务扩展 Cline 功能的模块化指令集。每个技能都封装了详细指南、流程和可选资源，Cline 仅在它们与你的请求相关时加载。

安装多个技能后，Cline 只会加载所需内容。部署技能会保持休眠，直到你询问部署相关问题。与始终处于活动状态的[规则](/customization/cline-rules)不同，技能按需加载，因此当你处理无关工作时，它们不会占用上下文。

<Note>
技能是一项实验性功能。请在 **设置 → 功能 → 启用技能** 中启用它。
</Note>

## 技能的工作原理

技能使用渐进式加载来最大限度提高效率：

| 级别 | 加载时机 | token 成本 | 内容 |
|-------|-------------|------------|---------|
| 元数据 | 始终（启动时） | 每个技能约 100 个 token | YAML frontmatter 中的 `name` 和 `description` |
| 指令 | 技能被触发时 | 少于 5k token | 包含指令和指南的 SKILL.md 正文 |
| 资源 | 按需 | 实际上无限制 | 通过 `read_file` 访问的捆绑文件或执行的脚本 |

当你发送消息时，Cline 会看到可用技能及其描述的列表。如果你的请求与某个技能的描述匹配，Cline 会使用 `use_skill` 工具激活它，该工具会从 SKILL.md 加载完整指令。

## 使用斜杠命令触发技能

你也可以在聊天输入框中使用斜杠命令显式调用已启用的技能。

1. 在聊天中输入 `/` 以打开命令建议。
2. 选择要运行的技能命令（例如 `/aws-deploy`）。
3. Cline 会触发该技能并加载其 `SKILL.md` 指令。

当你希望立即强制使用某个特定技能，而不是等待系统基于描述自动匹配时，这很有用。

## 技能结构

每个技能都是一个包含带 YAML frontmatter 的 `SKILL.md` 文件的目录。

```text title="Skill directory structure"
my-skill/
├── SKILL.md          # Required: main instructions
├── docs/             # Optional: additional documentation
│   └── advanced.md
└── scripts/          # Optional: utility scripts
    └── helper.sh
```

`SKILL.md` 文件包含两部分：元数据和指令。

```markdown title="SKILL.md"
---
name: my-skill
description: Brief description of what this skill does and when to use it.
---

# My Skill

Detailed instructions for Cline to follow when this skill is activated.

## Steps
1. First, do this
2. Then do that
3. For advanced usage, see [advanced.md](docs/advanced.md)
```

必填字段：
- `name` 必须与目录名称完全匹配
- `description` 告诉 Cline 何时使用此技能（最多 1024 个字符）

## 创建技能

<Steps>
  <Step title="打开技能菜单">
    单击 Cline 面板底部、模型选择器左侧的天平图标。切换到技能选项卡。
  </Step>
  <Step title="创建新技能">
    单击“新建技能...”并输入技能名称（例如 `aws-deploy`）。Cline 会创建一个包含模板 `SKILL.md` 文件的技能目录。
  </Step>
  <Step title="编写技能指令">
    编辑 `SKILL.md` 文件：
    - 更新 `description` 字段以指定应在何时触发此技能
    - 在正文中添加详细指令
    - 可选择在 `docs/`、`templates/` 或 `scripts/` 子目录中添加支持文件
  </Step>
</Steps>

你也可以通过在文件系统中创建目录结构来手动创建技能。将技能目录放入 `.cline/skills/`（工作区）或 `~/.cline/skills/`（全局），Cline 会自动检测它们。

将重要信息放在 SKILL.md 的开头。Cline 会按顺序读取文件，因此请将常见情况置于前部。使用清晰的章节标题，例如“## 错误处理”或“## 配置”，以便 Cline 可以扫描相关章节。

### 切换技能

每个技能都有一个切换开关，可用于启用或禁用它。这样你无需删除技能目录即可控制哪些技能处于活动状态。技能被发现时默认启用。

例如，在进行本地开发时，你可能会禁用 CI/CD 技能；或者仅在处理某个客户的项目时启用特定于该客户的技能。

## 编写你的 SKILL.md

### 命名约定

技能名称显示在 `name` 字段中，并且必须与目录名称完全匹配。使用带连字符的小写形式（kebab-case），并以描述性的方式说明技能的作用。

好的名称：
- `aws-cdk-deploy`
- `pr-review-checklist`
- `database-migration`
- `api-client-generator`

应避免：
- `aws`（过于模糊）
- `my_skill`（使用下划线，描述性不足）
- `DeployToAWS`（使用 kebab-case，而不是 PascalCase）
- `misc-helpers`（过于宽泛）

### 编写有效的描述

描述决定 Cline 何时激活技能。模糊的描述意味着技能不会在你预期时触发。

好的描述具体且可操作：

```yaml
description: Deploy applications to AWS using CDK. Use when deploying, updating infrastructure, or managing AWS resources.

description: Generate release notes from git commits. Use when preparing releases, writing changelogs, or summarizing recent changes.

description: Analyze CSV and Excel data files. Use when exploring datasets, generating statistics, or creating visualizations from tabular data.
```

较差的描述留下了太多歧义：

```yaml
description: Helps with AWS stuff.

description: Data analysis helper.

description: Useful for releases.
```

先说明技能的作用（使用动作动词），加入用户可能会说的触发短语，并提及特定的文件类型、工具或领域。尝试使用不同的请求表述来测试你的描述，看看技能是否会触发。

### 保持技能聚焦

将 SKILL.md 保持在 5k token 以内。如果你的技能需要更多内容，请将其拆分为 `docs/` 目录中的单独文件，并从主指令中引用它们。Cline 仅在需要时加载引用的文件。

加入实际示例。展示要运行的命令、预期输出以及结果应有的样子。与具体示例相比，抽象指令更难遵循。

## 技能的存放位置

技能可以存储在全局位置或项目工作区中。有关何时使用每种位置的指导，请参阅[存储位置](/getting-started/config#%E5%93%AA%E4%BA%9B%E9%85%8D%E7%BD%AE%E6%94%BE%E5%9C%A8%E5%93%AA%E9%87%8C%EF%BC%9F)。

项目技能：
- `.cline/skills/`（推荐）
- `.clinerules/skills/`
- `.claude/skills/`

全局技能：
- `~/.cline/skills/`（macOS/Linux）
- `C:\Users\USERNAME\.cline\skills\`（Windows）

当全局技能和项目技能同名时，全局技能优先。这让你可以将通用技能保存在全局位置，同时在 `.cline/skills/` 中使用项目特定技能，以便整个团队都能使用它们。

通过提交 `.cline/skills/` 对你的项目技能进行版本控制。你的团队可以共同共享、审查和改进这些技能。

## 捆绑支持文件

技能可以包含 Cline 仅在需要时访问的其他文件。

```text title="Directory structure"
complex-skill/
├── SKILL.md
├── docs/
│   ├── setup.md
│   └── troubleshooting.md
├── templates/
│   └── config.yaml
└── scripts/
    └── validate.py
```

### docs/

将 docs 用于对 SKILL.md 而言过于详细或仅与特定情形相关的信息：
- 高级配置选项
- 针对边缘情况的故障排除指南
- 参考资料（API schema、数据库 schema）
- 特定于平台的指令

部署技能可能包含 `docs/aws.md`、`docs/gcp.md` 和 `docs/azure.md`。Cline 会根据你的请求，仅加载相关的平台指南。

### templates/

当你的技能创建配置文件、样板代码或结构化文档时，请使用模板：
- 配置文件（Terraform、Docker Compose、CI/CD 流水线）
- 代码脚手架（组件模板、测试夹具）
- 文档模板（README、API 文档）

项目设置技能可以包含 `templates/dockerfile`、`templates/docker-compose.yml` 和 `templates/.env.example`，Cline 会为每个新项目自定义这些文件。

### scripts/

对于希望获得一致行为的确定性操作，请使用脚本：
- 验证（lint 配置、检查先决条件）
- 数据处理（解析、格式化、转换）
- 复杂计算（成本估算、资源规模调整）
- API 交互（获取数据、运行健康检查）

脚本具有很高的 token 效率，因为只有它们的输出会进入上下文，代码本身不会。一个 500 行的验证脚本可以生成简单的 "Passed" 或详细错误消息，而不会为脚本逻辑消耗任何上下文。

### 引用捆绑文件

在你的 SKILL.md 指令中引用这些文件：

```markdown title="SKILL.md (referencing bundled files)"
For initial setup, follow [setup.md](docs/setup.md).
Use the config template at `templates/config.yaml` as a starting point.
Run the validation script to check your configuration:

python scripts/validate.py
```

当指令引用文档文件时，Cline 会使用 `read_file` 读取它们。脚本可以直接执行，只有脚本输出会进入上下文窗口。

| 脚本适用于 | 指令适用于 |
|-----------------|---------------------|
| 确定性操作（验证、格式化） | 可根据上下文调整的灵活指南 |
| 复杂计算 | 决策流程 |
| 需要可靠性的操作 | 可能因情况而异的步骤 |
| 你不愿消耗 token 进行解释的任何内容 | 最佳实践和模式 |

## 示例：数据分析技能

以下是一个用于数据分析任务的实用技能。创建一个名为 `data-analysis/` 的目录，并添加以下 `SKILL.md`：

```markdown title="data-analysis/SKILL.md"
---
name: data-analysis
description: Analyze data files and generate insights. Use when working with CSV, Excel, or JSON data files that need exploration, cleaning, or visualization.
---

# Data Analysis

When analyzing data files, follow this process:

## 1. Understand the Data
- Read a sample of the file to understand its structure
- Identify column types and data quality issues
- Note any missing values or anomalies

## 2. Ask Clarifying Questions
Before diving in, ask the user:
- What specific insights are they looking for?
- Are there any known data quality issues?
- What format do they want for the output?

## 3. Perform Analysis
Use pandas for data manipulation:

import pandas as pd

# Load and explore
df = pd.read_csv("data.csv")
print(df.head())
print(df.describe())
print(df.info())

For visualization, prefer matplotlib or seaborn depending on complexity.
```

技能将 Cline 从通用助手转变为了解你所在领域的专家。从一个用于你经常重复执行的任务的技能开始，进行测试，并迭代改进描述，直到它能够可靠触发。
