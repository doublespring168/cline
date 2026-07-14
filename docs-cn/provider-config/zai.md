---
title: "Z AI (Zhipu AI)"
description: "了解如何在 Cline 中配置和使用 Z AI 的 GLM 模型。体验经过区域优化的高级混合推理、智能体能力和开源优势。"
---

Z AI（前身为 Zhipu AI）提供 GLM 模型系列，具有混合推理能力和智能体 AI 设计。这些模型擅长统一推理、编码和智能体应用，同时保持 MIT 许可证下的开源可访问性。

**网站：** [https://z.ai/model-api](https://z.ai/model-api)（国际）| [https://open.bigmodel.cn/](https://open.bigmodel.cn/)（中国）

### 获取 API 密钥

#### 国际用户
1.  **注册/登录：** 前往 [https://z.ai/model-api](https://z.ai/model-api)。创建账户或登录。
2.  **前往 API Keys：** 访问你的账户仪表板并找到 API 密钥部分。
3.  **创建密钥：** 为你的应用程序生成新的 API 密钥。
4.  **复制密钥：** 立即复制 API 密钥并安全存储。

#### 中国大陆用户
1.  **注册/登录：** 前往 [https://open.bigmodel.cn/](https://open.bigmodel.cn/)。创建账户或登录。
2.  **前往 API Keys：** 访问你的账户仪表板并找到 API 密钥部分。
3.  **创建密钥：** 为你的应用程序生成新的 API 密钥。
4.  **复制密钥：** 立即复制 API 密钥并安全存储。

**注意：** 国际区域和中国区域的定价有所不同。中国区域的定价大约低 50%。

### 在 Cline 中配置

> 请参阅[授权与模型选择](/getting-started/authorizing-with-cline#%E8%8F%9C%E5%8D%95)。

1.  **打开 Cline 设置：** 点击 Cline 面板中的设置图标（⚙️）。
2.  **选择提供商：** 从 "API Provider" 下拉菜单中选择 "Z AI"。
3.  **选择区域：** 选择你的区域：
    -   "International" 用于全球访问
    -   "China" 用于中国大陆访问
4.  **输入 API 密钥：** 将你的 Z AI API 密钥粘贴到 "Z AI API Key" 字段中。
5.  **选择模型：** 从 "Model" 下拉菜单中选择所需的模型。

### GLM 编码套餐

Z AI 提供专为编码应用设计的订阅套餐。这些套餐通过基于提示词的结构，而非传统的 API 用量计费方式，以较低成本提供对 GLM 系列模型的访问。

#### 设置 GLM 编码套餐

要在 Cline 中使用 GLM 编码套餐：

1. **订阅：** 前往 [https://z.ai/subscribe](https://z.ai/subscribe)并选择你的套餐。

2. **创建 API 密钥：** 订阅后，登录你的 zAI 仪表板，为编码套餐创建 API 密钥。

3. **在 Cline 中配置：** 打开 Cline 设置，选择 "Z AI" 作为提供商，然后将 API 密钥粘贴到 "Z AI API Key" 字段中。

<Frame>
  <img src="https://storage.googleapis.com/cline_public_images/docs/assets/zAI-provider.png" alt="Cline 设置中已选择 zAI 提供商并突出显示 API 密钥字段" />
</Frame>

此设置将你的订阅直接连接到 Cline，让你可以使用针对编码工作流优化的 GLM-4.5 工具调用能力。

### 区域优化

#### API 端点
- **国际：** 使用 `https://api.z.ai/api/paas/v4`
- **中国：** 使用 `https://open.bigmodel.cn/api/paas/v4`

#### 模型可用性
区域设置同时决定 API 端点和可用模型，并会自动筛选，以确保与你选择的区域兼容。
