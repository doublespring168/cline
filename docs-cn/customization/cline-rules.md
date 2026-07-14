---
title: "规则"
sidebarTitle: "规则"
description: "为 Cline 定义具体指令和编码标准。"
---

规则是 Markdown 文件，可在所有对话中提供持久指令。你无需在每次开始新任务时重复相同的偏好设置，规则让你只需定义一次，Cline 就会自动遵循。

当你希望 Cline 执行以下操作时，请使用规则：
- 遵循团队的编码标准（命名约定、文件组织、错误处理模式）
- 理解项目特定的上下文（技术栈、架构决策、依赖项）
- 应用一致的文档或测试要求
- 记住诸如“不要修改 /legacy 中的文件”或“始终使用 TypeScript”等约束

<Tip>
  **刚接触规则？** 观看 [Cline 规则详解](https://youtu.be/xQwsy2vkK5M)，了解实际应用方式。
</Tip>


## 支持的规则类型

Cline 能够识别来自多个来源的规则，因此你可以使用其他工具的现有规则文件：

| 规则类型 | 位置 | 描述 |
|-----------|----------|-------------|
| Cline 规则 | `.clinerules/` | 主要规则格式 |
| Cursor 规则 | `.cursorrules` | 自动检测 |
| Windsurf 规则 | `.windsurfrules` | 自动检测 |
| AGENTS.md | `AGENTS.md`, `~/.agents/AGENTS.md` | 用于跨工具兼容的[标准格式](https://agents.md/) |

所有检测到的规则类型都会显示在规则面板中，你可以分别切换它们。


## 规则的存放位置

规则可以存储在两个位置：项目工作区中或系统全局位置。

**工作区规则**放在项目根目录下的 `.clinerules/` 中。将其用于团队标准、项目特定约束，以及你希望通过版本控制与协作者共享的任何内容。

**全局规则**放在系统的 Cline 规则目录中。将其用于适用于所有项目的个人偏好。Cline 还会从 `~/.agents/AGENTS.md` 读取跨工具的全局 AGENTS 指令。

```text
your-project/
├── .clinerules/              # Workspace rules
│   ├── coding.md             # Coding standards
│   ├── testing.md            # Test requirements
│   └── architecture.md       # Structural decisions
├── src/
└── ...
```

Cline 会处理所有 `.md` 和 `.txt` 文件（位于 `.clinerules/` 中），并将它们合并成一组统一的规则。数字前缀（如 `01-coding.md`）有助于组织文件，但并非必需。

当工作区规则和全局规则同时存在时，Cline 会将它们合并。发生冲突时，工作区规则优先于全局规则。有关更多指导，请参阅[存储位置](/getting-started/config#%E5%93%AA%E4%BA%9B%E9%85%8D%E7%BD%AE%E6%94%BE%E5%9C%A8%E5%93%AA%E9%87%8C%EF%BC%9F)。

### 全局规则目录

| 操作系统 | 默认位置 |
|------------------|------------------|
| Windows | `Documents\Cline\Rules` |
| macOS | `~/Documents/Cline/Rules` |
| Linux/WSL | `~/Documents/Cline/Rules` |

<Note>
Linux/WSL 用户：如果在 `~/Documents/Cline/Rules` 中找不到全局规则，请检查 `~/Cline/Rules`。
</Note>


## 创建规则

<Steps>
  <Step title="打开规则菜单">
    单击 Cline 面板底部、模型选择器左侧的天平图标。
  </Step>
  <Step title="创建新规则文件">
    单击“新建规则文件...”并输入文件名（例如 `coding-standards`）。该文件将以 `.md` 扩展名创建。
  </Step>
  <Step title="编写规则">
    以 Markdown 格式添加指令。让每个规则文件专注于单一关注点。
  </Step>
</Steps>

你也可以使用 [`/newrule` 斜杠命令](/core-workflows/using-commands#%2Fnewrule)，让 Cline 以交互方式创建规则。

### 切换规则

每条规则都有一个切换开关，可用于启用或禁用它。这样你无需删除规则文件，就可以精细控制将哪些规则应用于当前任务。

例如，你可能有一条严格的测试规则，但希望在制作原型时禁用它；或者有一条特定于客户的规则，只需在处理该客户的功能时使用。

## 编写有效的规则

### 结构

规则易于浏览且具体明确时效果最佳。使用 Markdown 结构来组织指令：

```markdown
# Rule Title

Brief context about why this rule exists (optional but helpful).

## Category 1
- Specific instruction
- Another instruction with example: `like this`
- Reference to file: see /src/utils/example.ts

## Category 2
- More instructions
- Include the "why" when it's not obvious
```

Cline 将规则作为上下文读取，因此格式很重要。标题可帮助 Cline 理解每条指令的作用域。项目符号可让各项要求清晰明确。代码示例则准确展示你想要的内容。

### 最佳实践

**具体明确，不要含糊。** “使用描述性变量名”过于宽泛。“变量使用 camelCase，类使用 PascalCase，常量使用 UPPER_SNAKE”则为 Cline 提供了可具体遵循的规则。

**说明原因。** 当一条规则可能显得武断时，请解释原因。“不要修改 /legacy 中的文件（此代码计划在第二季度移除）”有助于 Cline 在边缘情况下做出更好的决定。

**指向示例。** 如果你的代码库已经展示了所需模式，请引用它。“遵循 /src/utils/errors.ts 中的错误处理模式”比从头描述该模式更有效。

**保持规则为最新状态。** 过时的规则会让 Cline 困惑并浪费上下文。如果某项约束不再适用，请将其移除。如果技术栈发生变化，请更新规则。

**每个文件一个关注点。** 按主题拆分规则：`coding.md` 用于样式，`testing.md` 用于测试要求，`architecture.md` 用于结构决策。这使得开启或关闭特定规则变得容易。

<Warning>
规则会消耗上下文 token。请避免冗长解释或粘贴完整的风格指南。保持规则简洁，并在需要详细参考时链接到外部文档。
</Warning>

## 示例

```markdown
# Project Guidelines

## Code Style
- Use TypeScript for all new files
- Prefer composition over inheritance
- Use repository pattern for data access
- Follow error handling pattern in /src/utils/errors.ts

## Documentation
- Update relevant docs when modifying features
- Keep README.md in sync with new capabilities

## Testing
- Unit tests required for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
```


## 条件规则

条件规则允许你将规则限定在代码库的特定部分。只有当你正在处理匹配的文件时，规则才会激活，从而使上下文保持专注且相关。

- **无条件规则**：每条规则都会针对每个请求加载。
- **有条件规则**：仅当当前文件与其定义的作用域匹配时，规则才会激活。

例如，文档样式规则应仅在编辑文档时出现，而不应在编写应用程序代码或测试时出现。

随着规则库不断增长，为每个请求加载每条规则会浪费上下文 token，并可能削弱 Cline 的专注度。条件规则通过只向 Cline 提供与实际处理文件相关的指令来解决这个问题。这意味着响应更快、更准确。当你深入处理后端代码时，前端规则不会争夺注意力；当你编写测试时，测试标准会恰好出现。这就像是向某人递交整本政策手册，和只递交他们当前需要的那一页之间的区别。

### 工作原理

条件规则在规则文件顶部使用 YAML frontmatter。Cline 处理请求时，会从你的当前工作中收集上下文（打开的文件、可见选项卡、提及的路径、编辑过的文件），评估每条规则的条件，并激活匹配的规则。

<Note>
当条件规则激活时，你会看到通知：**“已应用条件规则：workspace:frontend-rules.md”**
</Note>

### 编写条件规则

在 `.clinerules/` 目录中任何规则文件的顶部添加 YAML frontmatter：

```yaml
---
paths:
  - "src/components/**"
  - "src/hooks/**"
---

# React Component Guidelines

When creating or modifying React components:
- Use functional components with React hooks
- Extract reusable logic into custom React hooks
- Keep components focused on a single responsibility
```

`---` 标记用于界定 frontmatter。结束的 `---` 之后的所有内容都是你的规则内容。

#### `paths` 条件

目前，`paths` 是受支持的条件。它接受一个 glob 模式数组：

```yaml
---
paths:
  - "src/**"           # All files under src/
  - "*.config.js"      # Config files in root
  - "packages/*/src/"  # Monorepo package sources
---
```

**Glob 模式语法：**

- `*` 匹配除 `/` 之外的任意字符
- `**` 匹配包括 `/` 在内的任意字符（递归）
- `?` 匹配单个字符
- `[abc]` 匹配方括号中的任意字符
- `{a,b}` 匹配任一模式

| 模式 | 匹配项 |
|---------|---------|
| `src/**/*.ts` | `src/` 下的所有 TypeScript 文件 |
| `*.md` | 仅根目录中的 Markdown 文件 |
| `**/*.test.ts` | 项目中任意位置的测试文件 |
| `packages/{web,api}/**` | web 或 api 包中的文件 |
| `src/components/*.tsx` | components 中直接包含的 TSX 文件（不包括嵌套文件） |

#### 行为详情

**多个模式**：如果任意模式与上下文中的任意文件匹配，规则就会激活。

```yaml
---
paths:
  - "frontend/**"
  - "mobile/**"
---
# Activates when working in frontend OR mobile
```

**无 frontmatter**：不含 frontmatter 的规则始终处于活动状态。

**空 paths 数组**：`paths: []` 表示规则永不激活。可使用此方式暂时禁用规则。

**无效 YAML**：如果无法解析 frontmatter，Cline 会采用失效开放策略。规则会激活并显示原始内容，以帮助调试。

### 哪些内容属于“当前上下文”

Cline 根据以下内容评估规则：

1. **你的消息**：提示词中提及的文件路径（例如“更新 `src/App.tsx`”）
2. **打开的选项卡**：编辑器中当前打开的文件
3. **可见文件**：活动编辑器窗格中可见的文件
4. **编辑过的文件**：Cline 在任务期间创建、修改或删除的文件
5. **待处理操作**：Cline 即将编辑的文件

条件规则可以在你的第一条消息中、相关文件打开时，或者 Cline 开始处理匹配文件的任务中途激活。

<Tip>
在提示词中明确说明文件路径。“更新 `src/services/user.ts`”能可靠触发基于路径的规则；“更新用户服务”则可能无法触发。
</Tip>

### 实用示例

复制这些模式，并根据你的项目结构进行调整。

#### 前端与后端规则

将前端和后端规则分开以避免干扰。前端规则仅在处理 UI 代码时加载，后端规则仅在处理 API 或服务代码时加载。

```yaml
# .clinerules/frontend.md
---
paths:
  - "src/components/**"
  - "src/pages/**"
  - "src/hooks/**"
---

# Frontend Guidelines

- Use Tailwind CSS for styling
- Prefer server components where possible
- Keep client components small and focused
```

```yaml
# .clinerules/backend.md
---
paths:
  - "src/api/**"
  - "src/services/**"
  - "src/db/**"
---

# Backend Guidelines

- Use dependency injection for services
- All database queries go through repositories
- Return typed errors, not thrown exceptions
```

#### 测试文件规则

自动强制执行测试标准。此规则仅在你编写或修改测试时激活，因此测试指南会在你需要时恰好出现。

```yaml
# .clinerules/testing.md
---
paths:
  - "**/*.test.ts"
  - "**/*.spec.ts"
  - "**/__tests__/**"
---

# Testing Standards

- Use descriptive test names: "should [expected behavior] when [condition]"
- One assertion per test when possible
- Mock external dependencies, not internal modules
- Use factories for test data, not fixtures
```

#### 文档规则

仅在编辑文档时应用文档标准。防止在编写代码时样式规则使上下文变得杂乱。

```yaml
# .clinerules/docs.md
---
paths:
  - "docs/**"
  - "**/*.md"
  - "**/*.mdx"
---

# Documentation Guidelines

- Use sentence case for headings
- Include code examples for all features
- Keep paragraphs short (3-4 sentences max)
- Link to related documentation
```

### 与规则切换结合使用

条件规则与规则切换 UI 配合使用。关闭条件规则可将其完全禁用（即使路径匹配也不会激活）。开启后，它会在条件匹配时激活。

这提供了两个层级的控制：手动切换和基于条件的自动激活。

### 有效使用条件规则的技巧

**先宽泛，再缩小。** 从较宽泛的模式开始，并随着你逐渐了解哪些模式有效而进行细化：

```yaml
# Start here
paths:
  - "src/**"

# Then narrow down
paths:
  - "src/features/auth/**"
```

**使用描述性文件名。** 为规则文件命名时表明其作用域：

```text
.clinerules/
├── api-endpoints.md      # Rules for API code
├── database-models.md    # Rules for DB layer
├── react-components.md   # Rules for React
└── universal.md          # No frontmatter = always active
```

**将通用规则分开。** 将始终开启的规则（编码标准、项目约定）放在没有 frontmatter 的文件中。将条件规则留给特定于上下文的指南。

**测试你的模式。** 不确定模式是否匹配？创建一条简单的测试规则：

```yaml
---
paths:
  - "your/pattern/here/**"
---
TEST: This rule should activate for your/pattern/here files.
```

然后处理该路径中的文件，并检查是否看到激活通知。

### 条件规则故障排除

**规则未激活：**
- 检查上下文中的文件路径是否与 glob 模式匹配
- 验证规则是否在规则面板中开启
- 确保 YAML frontmatter 使用了正确的 `---` 分隔符

**规则意外激活：**
- 检查 glob 模式。`**` 是递归的，可能会匹配比预期更多的内容
- 检查是否有与模式匹配的打开文件
- 消息中提及的文件路径也算作上下文

**输出中显示 frontmatter：**
- 无法解析 YAML
- 检查语法错误（未加引号的特殊字符、缩进不正确）
