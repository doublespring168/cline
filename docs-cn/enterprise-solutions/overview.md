---
title: "Cline Enterprise"
sidebarTitle: "概述"
description: "为数百万开发者信赖的编码智能体提供企业级安全、治理和可观测性"
---

Cline Enterprise 为数百万开发者已经使用的同一开源架构带来集中式治理。您的代码保留在自己的环境中，您按协商费率使用自己的推理服务，同时获得平台团队在整个组织部署时所需的安全和可观测性能力。

<Card title="了解有关 Enterprise 的更多信息" icon="building" href="https://cline.bot/enterprise">
  访问我们的网站，详细了解企业功能、定价和部署选项。
</Card>

## 您将获得什么

它提供平台团队在生产部署中所需的五项核心能力。每项能力都对应在整个组织中扩展 AI 编码的特定要求。

### 设计即安全

您的代码绝不会离开您的环境。Cline 在本地处理一切——不会上传、不会建立索引，也不会使用您的数据进行训练。

<CardGroup cols={2}>
  <Card title="客户端执行" icon="computer">
    所有处理都在您的环境中进行
  </Card>

  <Card title="无数据外泄" icon="shield-check">
    代码和上下文绝不会传输到外部
  </Card>

  <Card title="不为代码库建立索引" icon="database">
    存储库绝不会被建立索引或缓存
  </Card>

  <Card title="不用于模型训练" icon="ban">
    您的代码和提示词不会用于训练
  </Card>
</CardGroup>

### 自带推理服务

使用您现有的云合同和协商费率。大多数 AI 工具强制您通过它们以加价方式购买推理服务。Cline 直接连接到您的提供商。

连接到任何推理提供商：
- AWS Bedrock
- Google Vertex AI
- Azure OpenAI
- 直接连接 Anthropic
- 直接连接 OpenAI
- Cerebras
- 任何 OpenAI 兼容端点

新模型发布时可立即切换。将 Claude Sonnet 4.5 用作日常主力模型，将 GPT-5 用于复杂重构，将开源模型用于简单任务。您现有的云积分和初创企业计划合同现在可以覆盖 AI 编码。我们负责智能体循环。您负责推理服务。没有加价，也没有供应商锁定。

### 规模化治理

当数千名开发者使用 AI 时，平台团队需要集中控制。散落在各台笔记本电脑上的个人 API 密钥会带来安全风险和成本超支。

企业治理提供：
- **SSO 身份验证**：使用公司凭据，而非个人 API 密钥
- **基于角色的访问控制**：三级层次结构（Member/Admin/Owner），具有组织范围的权限
- **模型和工具控制**：管理每个团队可以访问的模型和工具
- **远程配置**：通过一个仪表板管理所有开发者的设置
- **用量跟踪和可观测性**：集成 OpenTelemetry，用于监控用量、成本和性能，并对管理操作进行选择性审计日志记录

一次配置，随处部署。开发者可以按自己偏好的方式工作，而您则保持控制权。

### 完整的可观测性

将日志导出到您现有的可观测性堆栈。跟踪所有团队的用量、成本和性能。

- **OpenTelemetry 导出**：直接集成 Datadog、Grafana、Splunk
- **实时分析**：跟踪采用情况、性能和模式
- **成本明细**：准确查看每个团队在各个模型上的支出
- **JSON 输出**：在您现有的工具中构建自定义仪表板

采用与您对生产系统相同的可观测性标准。

## 部署

Cline Enterprise 安全地连接到您的基础设施。部署在云环境中。配置为与您现有的安全策略和合规要求配合使用。

向您的组织推广：
1. 配置 Cline Core 以连接到您的基础设施
2. 设置 SSO、RBAC 和治理策略
3. 通过您现有的软件分发方式部署给开发者
4. 通过您的可观测性工具监控用量

## 后续步骤

- 查看安全架构
- 配置[云提供商设置](/provider-config/aws-bedrock/api-key)（AWS Bedrock、Vertex AI、Azure）
- 设置 [MCP 服务器](/mcp/mcp-overview)以使用自定义工具
- 为您的代码库添加[自定义指令](/customization/cline-rules)

预约演示，了解 Cline Enterprise 如何适配您的基础设施。我们将配合您的安全和合规要求，在您的环境中进行部署。
