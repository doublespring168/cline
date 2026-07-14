---
title: "OpenTelemetry 环境变量"
sidebarTitle: "OpenTelemetry 覆盖配置"
description: "使用环境变量配置 OpenTelemetry，以适用于高级场景"
---

<Note>
这是一种**高级配置方法**。大多数用户应改为通过仪表板使用[远程配置](/enterprise-solutions/monitoring/opentelemetry)。
</Note>

环境变量提供了另一种配置 OpenTelemetry 的方式，适用于自托管部署、本地开发、CI/CD 流水线，或需要覆盖组织设置的情况。

## 何时使用

- **自托管部署**且无法访问仪表板
- **本地开发和测试**，使用你自己的收集器
- **需要可观测性的 CI/CD 流水线**
- **覆盖组织设置**，使用用户特定的配置

<Warning>
环境变量配置会绕过用户遥测设置，并且无论个人偏好如何都会导出数据。
</Warning>

## 环境变量

### 核心配置

| 变量 | 说明 | 值 |
|----------|-------------|--------|
| `CLINE_OTEL_TELEMETRY_ENABLED` | 启用 OpenTelemetry 导出 | `"true"` 或 `"false"` |
| `CLINE_OTEL_METRICS_EXPORTER` | 指标导出器（以逗号分隔） | `"console"`、`"otlp"` |
| `CLINE_OTEL_LOGS_EXPORTER` | 日志导出器（以逗号分隔） | `"console"`、`"otlp"` |

### OTLP 配置

| 变量 | 说明 | 值 |
|----------|-------------|--------|
| `CLINE_OTEL_EXPORTER_OTLP_PROTOCOL` | OTLP 协议 | `"grpc"`、`"http/json"` 或 `"http/protobuf"` |
| `CLINE_OTEL_EXPORTER_OTLP_ENDPOINT` | OTLP 收集器端点（同时应用于指标和日志） | 可带可选端口的 URL |
| `CLINE_OTEL_EXPORTER_OTLP_HEADERS` | 身份验证标头（以逗号分隔的 `key=value` 对） | `"key=value,key2=value2"` |
| `CLINE_OTEL_EXPORTER_OTLP_INSECURE` | 为 gRPC 禁用 TLS（仅限本地开发） | `"true"` |

### 高级 OTLP 配置

为指标和日志分别配置端点：

| 变量 | 说明 |
|----------|-------------|
| `CLINE_OTEL_EXPORTER_OTLP_METRICS_PROTOCOL` | 指标专用协议覆盖配置 |
| `CLINE_OTEL_EXPORTER_OTLP_METRICS_ENDPOINT` | 指标专用端点 |
| `CLINE_OTEL_EXPORTER_OTLP_LOGS_PROTOCOL` | 日志专用协议覆盖配置 |
| `CLINE_OTEL_EXPORTER_OTLP_LOGS_ENDPOINT` | 日志专用端点 |

### 导出调优

| 变量 | 说明 | 默认值 |
|----------|-------------|---------|
| `CLINE_OTEL_METRIC_EXPORT_INTERVAL` | 指标导出的间隔毫秒数 | 60000 |
| `CLINE_OTEL_LOG_BATCH_SIZE` | 日志记录的最大批次大小 | 512 |
| `CLINE_OTEL_LOG_BATCH_TIMEOUT` | 导出日志前的最长等待时间（ms） | 5000 |
| `CLINE_OTEL_LOG_MAX_QUEUE_SIZE` | 日志记录的最大队列大小 | 2048 |

## 快速入门示例

### 使用 gRPC 的 Datadog

```bash
export CLINE_OTEL_TELEMETRY_ENABLED=true
export CLINE_OTEL_METRICS_EXPORTER=otlp
export CLINE_OTEL_LOGS_EXPORTER=otlp
export CLINE_OTEL_EXPORTER_OTLP_PROTOCOL=grpc
export CLINE_OTEL_EXPORTER_OTLP_ENDPOINT=https://api.datadoghq.com:4317
export CLINE_OTEL_EXPORTER_OTLP_HEADERS="dd-api-key=YOUR_API_KEY"

code .
```

<Note>
上面显示的端点适用于 Datadog 的 **US1 区域**。如果你位于其他区域（EU、US3、US5、AP1 等），请将 `api.datadoghq.com` 替换为你所在区域的特定主机名（例如，EU 使用 `api.datadoghq.eu`）。请参阅 [Datadog 的 OTLP 文档](https://docs.datadoghq.com/opentelemetry/)以获取你所在区域的端点。
</Note>

### 使用 HTTP 的 New Relic

```bash
export CLINE_OTEL_TELEMETRY_ENABLED=true
export CLINE_OTEL_METRICS_EXPORTER=otlp
export CLINE_OTEL_LOGS_EXPORTER=otlp
export CLINE_OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export CLINE_OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp.nr-data.net:4318
export CLINE_OTEL_EXPORTER_OTLP_HEADERS="api-key=YOUR_LICENSE_KEY"

code .
```

### 本地开发（不安全）

```bash
export CLINE_OTEL_TELEMETRY_ENABLED=true
export CLINE_OTEL_METRICS_EXPORTER=otlp
export CLINE_OTEL_LOGS_EXPORTER=otlp
export CLINE_OTEL_EXPORTER_OTLP_PROTOCOL=grpc
export CLINE_OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
export CLINE_OTEL_EXPORTER_OTLP_INSECURE=true

code .
```

### 控制台输出（测试）

```bash
export CLINE_OTEL_TELEMETRY_ENABLED=true
export CLINE_OTEL_METRICS_EXPORTER=console
export CLINE_OTEL_LOGS_EXPORTER=console

code .
```

## 调试

启用详细的 OpenTelemetry 诊断日志记录：

```bash
export TEL_DEBUG_DIAGNOSTICS=true
code .
```

这会输出：
- 正在使用的配置
- 正在创建的导出器
- 连接尝试
- 导出成功/失败

请在 VS Code 开发人员工具控制台（Help > Toggle Developer Tools）中查看诊断输出。

## 配置优先级

当存在多种配置方法时，Cline 使用以下优先级顺序：

1. **环境变量**（最高优先级）- 此方法
2. **远程配置** - 仪表板设置
3. **默认设置** - 内置默认值

环境变量配置将覆盖仪表板设置。

## 另请参阅

<CardGroup cols={2}>
  <Card title="仪表板配置" icon="globe" href="/enterprise-solutions/monitoring/opentelemetry">
    通过 Web 仪表板配置 OpenTelemetry
  </Card>
  
  <Card title="远程配置" icon="server" href="/enterprise-solutions/configuration/remote-configuration/overview">
    了解远程配置系统
  </Card>
</CardGroup>
