---
title: "本地模型"
sidebarTitle: "本地模型"
description: "使用 Ollama 或 LM Studio，通过本地模型运行 Cline。"
---

在你的机器上使用本地推理运行 Cline。

## 快速开始

1. 安装本地运行时（**Ollama** 或 **LM Studio**）
2. 启动本地服务器
3. 在 Cline 设置中，选择对应的提供商
4. 选择一个本地模型
5. 在 Cline 设置 → 功能中启用**使用精简提示词**

## 硬件要求

| 内存 | 典型本地配置 |
| --- | --- |
| 16-32GB | 小型/量化模型 |
| 32-64GB | 中型编程模型 |
| 64GB+ | 更大的模型和更大的上下文窗口 |

## 运行时选项

<Tabs>
  <Tab title="Ollama">
    ### 1) 安装
    - 从 [ollama.com](https://ollama.com) 下载
    - 安装适用于你操作系统的版本

    ### 2) 查找热门本地模型
    - 浏览 Ollama 模型目录：[ollama.com/search](https://ollama.com/search)
    - 按热度、模型大小和最近更新时间排序/筛选
    - 打开任意模型页面并复制 `ollama pull` 命令

    ### 3) 拉取并运行模型
    ```bash
    ollama pull <model-name>
    ollama run <model-name>
    ```

    ### 4) 配置 Cline
    1. 打开 Cline 设置
    2. 选择提供商：**Ollama**
    3. 基础 URL：`http://localhost:11434`
    4. 从下拉列表中选择你的模型

    ### 5) 故障排除
    - 发送提示词前，请确保 Ollama 正在运行
    - 如果连接失败，请检查 `http://localhost:11434`
    - 如果缺少模型，请运行 `ollama pull <model-name>`
  </Tab>

  <Tab title="LM Studio">
    ### 1) 安装
    - 从 [lmstudio.ai](https://lmstudio.ai) 下载
    - 安装并启动应用

    ### 2) 查找本地模型
    - 浏览 LM Studio 模型目录：[lmstudio.ai/models](https://lmstudio.ai/models)
    - 按模型系列、大小和能力进行筛选
    - 选择与你的硬件匹配的模型

    ### 3) 下载模型
    - 打开**发现**并下载一个模型

    ### 4) 启动服务器
    - 打开**开发者**选项卡
    - 启动服务器（默认：`http://localhost:1234`）

    ### 5) 配置 Cline
    1. 打开 Cline 设置
    2. 选择提供商：**LM Studio**
    3. 将基础 URL 保持为 `http://localhost:1234`
    4. 从下拉列表中选择你的模型

    ### 6) 故障排除
    - 确保 LM Studio 服务器正在运行
    - 确保已加载模型
    - 如果连接失败，请检查 `http://localhost:1234`
  </Tab>
</Tabs>

## 本地推理的推荐 Cline 设置

- 启用**使用精简提示词**
- 让任务保持聚焦（上下文越小，响应越快）
- 当上下文变得过大时，开始一个新任务
