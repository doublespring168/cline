---
title: "企业监控"
sidebarTitle: "概述"
description: "为您的 Cline 部署提供可选的遥测与可观测性功能"
---

Cline 为希望跟踪使用情况并与其可观测性基础设施集成的组织提供可选的监控功能。

## 监控选项

<CardGroup cols={2}> 
  <Card title="Cline 遥测" icon="chart-simple" href="/enterprise-solutions/monitoring/telemetry">
    内置匿名使用情况跟踪，有助于改进 Cline（选择加入）
  </Card>

  <Card title="提示词存储" icon="database" href="/enterprise-solutions/monitoring/prompt-storage">
    将对话历史备份到 S3/R2，以用于合规和分析
  </Card>

  <Card title="OpenTelemetry" icon="chart-line" href="/enterprise-solutions/monitoring/opentelemetry">
    将指标和日志导出到您自己的可观测性后端
  </Card>

  <Card title="OpenTelemetry 覆盖配置" icon="chart-line" href="/enterprise-solutions/monitoring/opentelemetry_override">
    通过环境变量导出到您自己的可观测性后端（高级）
  </Card>
</CardGroup>

## Cline 遥测

Cline 提供选择加入的遥测功能，用于匿名跟踪使用情况：

- 功能使用模式
- 任务完成率  
- 错误发生情况
- 性能指标

用户可在 Cline 设置中启用或禁用遥测。所有数据均为匿名，不包含代码内容、文件路径或敏感信息。

有关配置详情，请参阅 [Cline 遥测](/enterprise-solutions/monitoring/telemetry)。

## OpenTelemetry 集成

对于高级监控需求，Cline 支持通过 OpenTelemetry 的 OTLP (OpenTelemetry Protocol) 将指标和日志导出到您自己的基础设施。

这使您能够：
- 将遥测数据导出到您现有的可观测性平台
- 与 Datadog、New Relic 或 Grafana Cloud 等工具集成
- 保持对监控数据的完全控制
- 汇总整个组织的指标

<Note>
OpenTelemetry 集成是**可选的**，需要额外配置。大多数用户不需要此功能。
</Note>

有关设置说明，请参阅 [OpenTelemetry](/enterprise-solutions/monitoring/opentelemetry)。

## 使用场景

### 何时使用 Cline 遥测
- 您希望通过匿名使用数据帮助改进 Cline
- 无需额外设置
- 适合大多数用户

### 何时使用 OpenTelemetry
- 您需要在自己的系统中获得细粒度指标
- 您正在与现有的可观测性基础设施集成
- 您希望获得用于调试的详细日志和指标
- 您需要自定义仪表板或告警

## 开始使用

<Steps>
<Step title="选择您的方案">
决定基本遥测还是 OpenTelemetry 集成更符合您的需求
</Step>

<Step title="启用遥测">
对于基本遥测，请在 Cline 设置中启用。对于 OpenTelemetry，请参阅配置指南。
</Step>

<Step title="验证数据收集">
确认遥测数据正按预期收集
</Step>
</Steps>

## 隐私与安全

所有 Cline 监控功能在设计时都充分考虑了隐私：

<CardGroup cols={2}>
  <Card title="匿名" icon="user-secret">
    不收集个人信息
  </Card>
  
  <Card title="可选" icon="toggle-on">
    用户可随时禁用
  </Card>
  
  <Card title="本地优先" icon="laptop">
    代码绝不会离开您的计算机
  </Card>
  
  <Card title="透明" icon="code">
    开源 - 查看收集了哪些内容
  </Card>
</CardGroup>

## 后续步骤

<CardGroup cols={2}>
  <Card title="配置遥测" icon="gear" href="/enterprise-solutions/monitoring/telemetry">
    配置基本遥测设置
  </Card>
  
  <Card title="OpenTelemetry 设置" icon="chart-line" href="/enterprise-solutions/monitoring/opentelemetry">
    使用 OpenTelemetry 进行高级监控
  </Card>
</CardGroup>
