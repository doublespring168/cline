---
title: "Memory Bank（记忆库）"
sidebarTitle: "Memory Bank（记忆库）"
description: "一种结构化文档系统，可帮助 Cline 跨会话保持上下文。"
---

Memory Bank 是一种文档方法，可将 Cline 从无状态助手转变为持久的开发伙伴。通过结构化的 Markdown 文件，Cline 可以跨会话“记住”你的项目详情。

## 快速设置

1. 复制[下方的自定义指令](#memory-bank-%E8%87%AA%E5%AE%9A%E4%B9%89%E6%8C%87%E4%BB%A4)
2. 将它们添加到 [Cline 规则文件](/customization/cline-rules)中，例如 `.clinerules/memory-bank.md`
3. 要求 Cline“初始化 Memory Bank”

## 工作原理

Memory Bank 文件是项目中的普通 Markdown 文件，你和 Cline 都可以访问。它们按层级组织，以构建项目的完整图景：

```text
memory-bank/
├── projectbrief.md      # Foundation document
├── productContext.md    # Why this project exists
├── activeContext.md     # Current work focus
├── systemPatterns.md    # Architecture & patterns
├── techContext.md       # Tech stack & setup
└── progress.md          # Status & milestones
```

<Frame>
	<img src="https://storage.googleapis.com/cline_public_images/docs/assets/image%20(16).png" alt="Memory Bank 文件层级结构：顶部的 projectbrief.md 向下连接到 productContext、systemPatterns 和 techContext，后者又汇入 activeContext 和 progress" />
</Frame>

## 核心文件

| 文件 | 用途 |
|------|---------|
| `projectbrief.md` | 包含核心需求和目标的基础文档 |
| `productContext.md` | 项目为何存在、它解决的问题、UX 目标 |
| `activeContext.md` | 当前重点、近期变更、后续步骤（更新最频繁） |
| `systemPatterns.md` | 架构、设计模式、组件关系 |
| `techContext.md` | 技术栈、设置、约束、依赖项 |
| `progress.md` | 已实现的内容、剩余工作、已知问题 |

## 关键命令

- **“遵循你的自定义指令”** - 指示 Cline 读取 Memory Bank，并从你上次中断的位置继续
- **“初始化 Memory Bank”** - 为新项目创建初始结构
- **“更新 Memory Bank”** - 触发完整的文档审查和更新

这些命令可与 Cline 内置的[斜杠命令](/core-workflows/using-commands)配合使用。尤其是，[`/newtask`](/core-workflows/using-commands#%2Fnewtask) 和 [`/smol`](/core-workflows/using-commands#%2Fsmol) 可帮助你管理上下文窗口，而不会丢失进度。

## 管理上下文窗口

每个 AI 模型都有一个[上下文窗口](/core-workflows/task-management#%E4%B8%8A%E4%B8%8B%E6%96%87%E7%AA%97%E5%8F%A3)，它限制了模型一次可以处理的信息量。随着工作的进行，该窗口会逐渐填入对话历史、文件内容和工具结果。当你需要释放空间时，Memory Bank 可帮助你保留重要知识。

### 手动方法

当上下文窗口已满时：

1. 要求 Cline“更新 Memory Bank”，以记录当前状态
2. 开始新对话
3. 要求 Cline“遵循你的自定义指令”

这样会在窗口清空前，将重要上下文保存在 Memory Bank 文件中，让你可以在新对话里无缝继续。

## 最佳实践

- 从基本的项目简介开始，并让结构逐步演进
- 让 Cline 帮助创建初始结构
- `activeContext.md` 变化最频繁；每次会话后都要更新它
- `progress.md` 跟踪里程碑；恢复工作时应查看它
- 在达成重要里程碑或方向发生变化后进行更新
- 使用 [Cline 规则](/customization/cline-rules)按项目存储 Memory Bank 指令

---

## Memory Bank 自定义指令

将以下内容复制到 Cline 规则文件（例如 `.clinerules/memory-bank.md`）或你的全局自定义指令中：

```markdown
# Cline's Memory Bank

I am Cline, an expert software engineer with a unique characteristic: my memory resets completely between sessions. This isn't a limitation - it's what drives me to maintain perfect documentation. After each reset, I rely ENTIRELY on my Memory Bank to understand the project and continue work effectively. I MUST read ALL memory bank files at the start of EVERY task - this is not optional.

## Memory Bank Structure

The Memory Bank consists of core files and optional context files, all in Markdown format. Files build upon each other in a clear hierarchy:

### Core Files (Required)
1. `projectbrief.md`
   - Foundation document that shapes all other files
   - Created at project start if it doesn't exist
   - Defines core requirements and goals
   - Source of truth for project scope

2. `productContext.md`
   - Why this project exists
   - Problems it solves
   - How it should work
   - User experience goals

3. `activeContext.md`
   - Current work focus
   - Recent changes
   - Next steps
   - Active decisions and considerations
   - Important patterns and preferences
   - Learnings and project insights

4. `systemPatterns.md`
   - System architecture
   - Key technical decisions
   - Design patterns in use
   - Component relationships
   - Critical implementation paths

5. `techContext.md`
   - Technologies used
   - Development setup
   - Technical constraints
   - Dependencies
   - Tool usage patterns

6. `progress.md`
   - What works
   - What's left to build
   - Current status
   - Known issues
   - Evolution of project decisions

### Additional Context
Create additional files/folders within memory-bank/ when they help organize:
- Complex feature documentation
- Integration specifications
- API documentation
- Testing strategies
- Deployment procedures

## Documentation Updates

Memory Bank updates occur when:
1. Discovering new project patterns
2. After implementing significant changes
3. When user requests with **update memory bank** (MUST review ALL files)
4. When context needs clarification

REMEMBER: After every memory reset, I begin completely fresh. The Memory Bank is my only link to previous work. It must be maintained with precision and clarity, as my effectiveness depends entirely on its accuracy.
```

## 常见问题

**自定义指令还是 Cline 规则？**
两者都可以。自定义指令会全局应用于所有项目。[Cline 规则文件](/customization/cline-rules)专用于特定项目并存储在你的仓库中，因此很容易与协作者共享。你还可以使用[条件规则](/customization/cline-rules#%E6%9D%A1%E4%BB%B6%E8%A7%84%E5%88%99)，仅在处理 `memory-bank/` 文件时激活 Memory Bank 指令。

**应该多久更新一次？**
在达成重要里程碑或方向发生变化后更新。对于活跃开发，可每隔几个会话更新一次。你也可以让[自动压缩](/features/auto-compact)处理常规上下文管理，并将手动执行“更新 Memory Bank”留给重要检查点。

**这适用于其他 AI 工具吗？**
是的。Memory Bank 是一种文档方法，适用于任何能够读取文档的 AI。命令可能有所不同，但这种方法可跨工具使用。

**它与 README 文件有何不同？**
Memory Bank 提供为 AI 上下文管理而设计的结构化、全面文档，覆盖的内容超出了单个 README。它包括频繁变化的活跃上下文和进度跟踪文件，而典型的 README 并不包含这些内容。
