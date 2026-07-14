---
title: "OpenTelemetry 集成"
sidebarTitle: "OpenTelemetry"
description: "使用 OpenTelemetry Protocol (OTLP) 将 Cline 遥测数据导出到你的可观测性平台"
---

Cline 提供可选择启用的 OpenTelemetry 支持，可使用 OpenTelemetry Protocol (OTLP) 将指标和日志导出到你自己的可观测性基础设施。

<Note>
OpenTelemetry 集成是**可选的**，面向已有可观测性基础设施的高级用户。大多数用户不需要此功能。
</Note>

## 什么是 OpenTelemetry？

[OpenTelemetry](https://opentelemetry.io/) 是一种行业标准的可观测性框架，提供统一的方式来收集和导出遥测数据（指标、日志和追踪）。

Cline 的 OpenTelemetry 支持让你可以：
- 将遥测数据导出到你自己的系统
- 与 Datadog、New Relic、Grafana Cloud 等可观测性平台集成
- 完全掌控你的监控数据
- 使用你所在组织现有的监控基础设施

## 支持的功能

Cline 支持通过 **OTLP (OpenTelemetry Protocol)** 导出以下内容：

<CardGroup cols={2}>
  <Card title="指标导出" icon="chart-bar">
    导出有关 Cline 使用情况、性能和错误的指标
  </Card>
  
  <Card title="日志导出" icon="file-lines">
    导出结构化日志，以便调试和分析
  </Card>
</CardGroup>

### 导出格式

Cline 支持三种 OTLP 导出协议：

- **gRPC**（默认，推荐）
- **HTTP/protobuf**
- **HTTP/JSON**

## 配置

OpenTelemetry 使用[远程配置](/enterprise-solutions/configuration/remote-configuration/overview#%E8%BF%9C%E7%A8%8B%E9%85%8D%E7%BD%AE%E7%9A%84%E5%B7%A5%E4%BD%9C%E5%8E%9F%E7%90%86)进行配置，该配置可从[控制面板](https://app.cline.bot/dashboard/organization?tab=settings)访问。

### 基本设置

启用 OpenTelemetry，配置 OTLP 端点并选择协议：

<Frame>
	<img
		src="https://assets.int.cline.bot/assets/open_telemetry_main_options.png"
	/>
</Frame>

如果你使用 gRPC，可以选择停用 TLS。

配置好收集器后，你可以启用日志和/或指标收集。至少需要启用其中一项。

仅当你需要高级配置时，才需要进一步配置。

### 高级配置

你可以分别为日志和指标添加自定义协议和端点。还可以配置指标导出间隔，以及日志批次大小、批次超时时间和最大队列大小。

<Frame>
	<img
		src="https://assets.int.cline.bot/assets/open_telemetry_metrics_and_logs.png"
	/>
</Frame>

**用于身份验证的自定义标头：**

最后，如果你的收集器需要身份验证标头，可以在标头部分添加键值对。

<Frame>
	<img
		src="https://assets.int.cline.bot/assets/open_telemetry_headers.png"
	/>
</Frame>

## 集成示例

### Datadog

使用 Datadog 的 OTLP 端点导出到 Datadog：

<Frame>
	<img
		src="https://assets.int.cline.bot/assets/open_telemetry_datadog_example.png"
	/>
</Frame>

### New Relic

导出到 New Relic：

<Frame>
	<img
		src="https://assets.int.cline.bot/assets/open_telemetry_relic_example.png"
	/>
</Frame>

### Grafana Cloud

导出到 Grafana Cloud：

<Frame>
	<img
		src="https://assets.int.cline.bot/assets/open_telemetry_grafana_example.png"
	/>
</Frame>

## 测试配置

要测试你的配置，请登录账户，在任务中执行一些操作，等待一个导出间隔，然后确认数据已到达你的收集器。

## 故障排除

如果收集器未收到任何数据，验证集成的最简单方法是在编辑器中启用开发者工具。

为此，请打开 [webview 开发者工具](https://code.visualstudio.com/api/extension-guides/webview#inspecting-and-debugging-webviews)。

完成后，如果你执行了一些会触发指标和/或日志的操作（例如使用 Cline 执行任务）， 
在向收集器发送数据时如有任何错误，你将看到错误日志。

如果没有看到任何日志，请启用[调试模式](#%E8%B0%83%E8%AF%95%E6%A8%A1%E5%BC%8F)。

### 连接错误

1. **确认端点可访问：**
   ```bash
   curl -v https://your-otlp-endpoint:4317
   ```

2. 选择停用 TLS，以**检查是否需要不安全模式**

3. **验证身份验证标头：**
   再次检查你的 API 密钥和身份验证标头是否正确

### 调试模式

启用调试日志记录以查看详细的 OpenTelemetry 信息：

```bash
TEL_DEBUG_DIAGNOSTICS=true code .
```

这将输出以下内容的详细信息：
- 正在使用的配置
- 正在创建的导出器
- 连接尝试
- 导出成功/失败

## 导出的内容

启用 OpenTelemetry 后，Cline 会导出：

### 指标
- 功能使用次数
- 任务执行指标 
- 错误率和错误类型
- 性能测量数据

### 日志
- 系统事件
- 包含上下文的错误日志
- 运行信息

<Warning>
导出的数据已经过匿名化处理，不包含代码内容、文件路径或敏感信息。但是，数据导出到你的系统后，确保其安全是你的责任。
</Warning>

## 限制

Cline 当前的 OpenTelemetry 支持情况：
- ✅ OTLP 指标导出（gRPC、HTTP）
- ✅ OTLP 日志导出（gRPC、HTTP）
- ✅ 通过[远程配置](/enterprise-solutions/configuration/remote-configuration/overview#%E8%BF%9C%E7%A8%8B%E9%85%8D%E7%BD%AE%E7%9A%84%E5%B7%A5%E4%BD%9C%E5%8E%9F%E7%90%86)进行基本配置
- ❌ 分布式追踪（尚未实现）
- ❌ 自定义插桩 API（尚未开放）
- ❌ 采样配置（使用默认值）

## 最佳实践

1. **先测试**：在发送到生产环境之前，始终先使用控制台导出器进行测试
2. **保护凭证**：切勿硬编码 API 密钥；请使用安全的环境变量管理方式
3. **监控成本**：留意可观测性平台的数据摄取成本
4. **从简单开始**：先仅启用指标，需要时再添加日志
5. **使用压缩**：OTLP 支持压缩；检查你的端点是否要求使用压缩

## 后续步骤

<CardGroup cols={3}>
  <Card title="事件参考" icon="list" href="/enterprise-solutions/monitoring/opentelemetry-events">
    所有已发出 OTel 事件的完整目录
  </Card>
  
  <Card title="Cline 遥测" icon="chart-simple" href="/enterprise-solutions/monitoring/telemetry">
    配置简单的内置遥测
  </Card>
  
  <Card title="OpenTelemetry 文档" icon="book" href="https://opentelemetry.io/docs/">
    进一步了解 OpenTelemetry
  </Card>
</CardGroup>
