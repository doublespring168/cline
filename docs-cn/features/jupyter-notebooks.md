---
title: "Jupyter Notebooks"
sidebarTitle: "Jupyter Notebooks"
description: "具备单元格级上下文感知能力的 Jupyter notebook AI 辅助编辑"
---

Cline 为 Jupyter notebook（`.ipynb` 文件）提供全面支持，通过完整的单元格级上下文感知能力实现 AI 辅助编辑。此功能由 Cline 与 Amazon 合作开发，旨在将 AI 编程辅助引入数据科学工作流。

## 入门

Jupyter notebook 支持是 Cline 的内置功能。要使用它，你只需在 VS Code 中启用 Jupyter notebook 扩展。打开任意 `.ipynb` 文件后，你会在 notebook 界面中看到 AI 辅助按钮。

## 使用方法

### 生成单元格

点击 notebook 工具栏中的闪光图标，借助 AI 生成新单元格。

<Frame>
  <img src="/assets/jupyter-generate-cell.gif" alt="借助 AI 生成新的 Jupyter 单元格" />
</Frame>

AI 会接收周围单元格的上下文，因此它能理解当前作用域中已有的变量和导入。这意味着你可以引用现有的 DataFrame、函数和其他对象，而无需重新说明它们。

**示例提示词：**“创建一个可视化，用热力图展示数值列的相关矩阵”

该单元格会以正确的 notebook JSON 结构插入，保留元数据并可立即执行。

### 解释单元格

点击任意单元格标题栏中的“解释”按钮，即可获得该单元格功能的详细说明。

这适用于：

- 重访旧 notebook
- 熟悉队友的分析
- 理解复杂的转换

Cline 会提取完整的单元格上下文，包括输出，因此解释可以引用列名、行数和计算值等实际结果。

### 改进单元格

点击任意单元格标题栏中的“改进”按钮，利用 AI 建议增强现有单元格。

<Frame>
  <img src="/assets/jupyter-explain-improve-cell.gif" alt="借助 AI 解释并改进 Jupyter 单元格" />
</Frame>

可用它来：

- 优化缓慢的 pandas 操作
- 添加错误处理
- 重构以提高清晰度
- 将循环转换为向量化操作

Cline 会在保留单元格在 notebook 结构中的位置和元数据的同时提出改进建议。AI 会说明更改了什么以及原因。

## 单元格上下文的工作原理

与传统文件编辑不同，Jupyter notebook 是包含单元格数组的 JSON 文档。每个单元格都有自己的类型、源内容、元数据、执行计数和输出。

使用 Jupyter 命令时，Cline 会提取结构化上下文，其中包括：

- **单元格类型**（代码、Markdown 或 raw）
- **源内容**，以行数组形式表示
- **单元格元数据**和配置
- 代码单元格的**执行计数**
- **输出**，包括数据、文本和错误跟踪

这种结构化表示使 AI 不仅能理解代码，还能理解代码在 notebook 中的上下文及其实际输出。

### 保留 JSON 结构

Cline 经过专门设计，可谨慎处理单元格 JSON 结构，目标是：

- 保持单元格边界完整
- 保留执行计数
- 维护单元格元数据
- 保持输出与其源单元格的关联

AI 会收到专门的提示以保留 notebook 结构，不过你仍应始终审查更改，确保 notebook 格式保持正确。

## 键盘快捷键

你可以将以下任一命令绑定到键盘快捷键，以便更快地访问：

1. 打开 VS Code 键盘快捷键（Cmd/Ctrl + K、Cmd/Ctrl + S）
2. 搜索 `cline.jupyterGenerateCell`、`cline.jupyterExplainCell` 或 `cline.jupyterImproveCell`
3. 分配你偏好的组合键

## 获得最佳结果的技巧

**对于生成单元格：**
- 明确说明你希望单元格执行什么操作
- 按名称引用现有变量（AI 可以看到它们）
- 如果有偏好，请说明首选库（例如“使用 seaborn”或“使用 plotly”）

**对于解释单元格：**
- 对已执行的单元格效果最佳（输出可提供额外上下文）
- 适合 pandas groupby/merge 序列等复杂的链式操作

**对于改进单元格：**
- 说明你想改进哪个方面（性能、可读性、错误处理）
- AI 会解释它建议的更改

## 限制

- Notebook 支持要求在 VS Code 中启用 Jupyter notebook 扩展
- 单元格上下文提取依赖 VS Code 的 notebook API
- 非常大的 notebook 可能需要超出某些模型高效处理能力的上下文

## 相关内容

- [所有 Cline 工具](/tools-reference/all-cline-tools) - Cline 所有工具的概览
- [Cline 提供商](/getting-started/cline-provider) - 通过内置提供商设置快速开始使用
