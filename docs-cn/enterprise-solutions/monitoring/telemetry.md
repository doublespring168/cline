---
title: "Cline 遥测"
sidebarTitle: "Cline 遥测"
description: "配置使用情况分析和事件跟踪"
---

Cline 内置遥测功能，以帮助了解使用模式并改进产品。用户可以控制是否共享这些数据。

## 什么是 Cline 遥测？

遥测会捕获匿名使用事件，例如：

- 使用的功能（所用的工具和命令）
- 任务完成率
- 错误发生情况
- 性能指标

<Info>
所有遥测数据都是**匿名的**，不包含代码内容、文件内容或其他敏感信息。
</Info>

## 用户控制

### 启用/禁用 Cline 遥测

个人用户可以通过 Cline 设置控制遥测：

1. 打开 Cline 设置
2. 找到 "Cline Telemetry" 开关
3. 根据需要启用或禁用

更改会立即生效。

### 收集哪些内容

启用遥测后，Cline 会捕获：

<AccordionGroup>
  <Accordion title="功能使用情况" icon="cursor-click">
    - 执行的工具（例如 read_file、execute_command）
    - 使用的斜杠命令
    - 触发的技能
    - 更改的设置
  </Accordion>
  
  <Accordion title="任务指标" icon="tasks">
    - 任务开始/完成事件
    - 模式切换（计划/执行）
    - 检查点使用情况
    - 任务持续时间
  </Accordion>
  
  <Accordion title="错误事件" icon="triangle-exclamation">
    - API 失败
    - 工具执行错误
    - 系统错误
    - 错误类型和发生频率
  </Accordion>
</AccordionGroup>

### 不收集哪些内容

Cline 遥测**绝不会**包含：

- 你的代码或文件内容
- 文件路径或名称
- 命令参数
- 对话内容
- 个人信息
- API 密钥或凭据

## 企业配置

管理员可以通过远程配置设置遥测的默认状态：

```json
{
  "telemetryEnabled": true
}
```

<Note>
即使存在企业配置，个人用户仍可在本地设置中禁用 Cline 遥测。
</Note>

## 企业监控功能

对于有额外合规或监控要求的组织，Cline 提供：

### 提示词存储
将对话历史记录自动备份到 AWS S3 或 Cloudflare R2，用于：
- 合规与审计追踪
- 使用情况分析与报告
- 灾难恢复

有关配置详情，请参阅[提示词存储](/enterprise-solutions/monitoring/prompt-storage)。

### OpenTelemetry 集成
将详细的指标和日志导出到你自己的可观测性平台，例如 Datadog、New Relic 或 Grafana Cloud。

有关设置说明，请参阅 [OpenTelemetry](/enterprise-solutions/monitoring/opentelemetry)。

## 隐私

Cline 遥测在设计时充分考虑了隐私：

<CardGroup cols={2}>
  <Card title="匿名" icon="user-secret">
    不收集个人信息
  </Card>
  
  <Card title="可选" icon="toggle-on">
    用户可以随时禁用
  </Card>
  
  <Card title="本地优先" icon="laptop">
    代码绝不会离开你的计算机
  </Card>
  
  <Card title="透明" icon="eye">
    开源——准确了解收集了哪些内容
  </Card>
</CardGroup>

## 遥测为何重要

匿名使用数据有助于：

- **识别错误**：发现影响用户的问题
- **确定功能优先级**：专注于最常用的功能
- **提升性能**：发现并修复运行缓慢的操作
- **增强可靠性**：跟踪并降低错误率

## 相关内容

<CardGroup cols={2}>
  <Card title="OpenTelemetry" icon="chart-line" href="/enterprise-solutions/monitoring/opentelemetry">
    企业监控与可观测性
  </Card>
  
  <Card title="事件详情" icon="shield" href="/enterprise-solutions/monitoring/opentelemetry-events">
    查看收集了哪些数据
  </Card>
</CardGroup>
