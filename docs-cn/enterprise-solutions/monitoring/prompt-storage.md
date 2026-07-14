---
title: "提示词存储"
description: "将对话历史备份到 S3 或 Cloudflare R2，用于合规、审计和分析"
---

提示词存储允许企业自动将 Cline 对话历史备份到云存储（AWS S3 或 Cloudflare R2）。这提供了一个用于合规、审计跟踪和使用情况分析的集中式存储库，同时仍将本地存储作为主要事实来源。

## 概述

每个 Cline 任务对话都存储在本地的 `~/.cline/data/tasks/<taskId>/api_conversation_history.json` 中。启用提示词存储后，后台同步工作进程会自动将这些对话文件上传到您配置的 S3 或 R2 存储桶。

<CardGroup cols={2}>
  <Card title="合规就绪" icon="shield-check">
    保留对话记录，以满足监管要求和内部政策。
  </Card>
  
  <Card title="审计跟踪" icon="scroll">
    通过带时间戳的对话日志，跟踪整个组织中的 AI 交互。
  </Card>
  
  <Card title="使用情况分析" icon="chart-line">
    大规模分析对话模式、令牌使用情况和模型性能。
  </Card>
  
  <Card title="灾难恢复" icon="cloud-arrow-up">
    独立于本地存储备份对话历史，以保障业务连续性。
  </Card>
</CardGroup>

## 工作原理

```mermaid
graph LR
    A[User] --> B[Cline Extension]
    B --> C[Local Storage<br/>~/.cline/data/tasks/]
    C --> D[Background Sync Worker]
    D --> E[S3/R2 Bucket]
    E --> F[Compliance/Analytics]
```

1. **本地存储优先**：所有对话都会立即写入本地磁盘
2. **后台同步**：工作进程将对话文件加入上传队列
3. **可靠上传**：具有可配置批次大小的自动重试逻辑
4. **云端备份**：文件以相同的路径结构存储在您的 S3/R2 存储桶中

## 存储架构

### 存储的内容

提示词存储会上传每个任务中的以下文件：

| 文件 | 内容 | 用途 |
|------|---------|---------|
| `api_conversation_history.json` | Anthropic MessageParam 格式的完整对话 | 用于分析的核心对话数据 |
| 任务元数据 | 任务 ID、时间戳、模型信息 | 关联和索引 |

### 不存储的内容

提示词存储**不**包括：

- ❌ Cline 未访问的工作区文件
- ❌ API 密钥或机密  
- ❌ 用户凭据或身份验证令牌

<Warning>
对话历史包括**所有工具输入和输出**。这意味着通过 `write_to_file` 写入的代码、通过 `read_file` 读取的文件内容以及命令输出都会包含在上传的数据中。启用前，请审查您的合规和数据分类要求。
</Warning>

### 存储路径模式

文件会按照以下结构上传到您的存储桶：

```
s3://your-bucket/tasks/{taskId}/api_conversation_history.json
```

这与本地存储结构一致，因此可以轻松关联本地和云端数据。

## 配置

提示词存储通过远程配置中的 `enterpriseTelemetry.promptUploading` 部分进行配置。

### 架构

```json
{
  "enterpriseTelemetry": {
    "promptUploading": {
      "enabled": true,
      "type": "s3_access_keys",
      "s3AccessSettings": {
        "bucket": "your-cline-prompts",
        "accessKeyId": "AKIAIOSFODNN7EXAMPLE",
        "secretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
        "region": "us-east-1",
        "intervalMs": 30000,
        "maxRetries": 5,
        "batchSize": 10,
        "maxQueueSize": 1000,
        "maxFailedAgeMs": 604800000,
        "backfillEnabled": false
      }
    }
  }
}
```

### 配置字段

#### 核心设置

| 字段 | 类型 | 必需 | 描述 |
|-------|------|----------|-------------|
| `enabled` | boolean | 是 | 启用/禁用提示词存储 |
| `type` | string | 是 | 存储类型：`"s3_access_keys"` 或 `"r2_access_keys"` |

#### 访问设置（S3/R2）

| 字段 | 类型 | 必需 | 描述 | 默认值 |
|-------|------|----------|-------------|---------|
| `bucket` | string | 是 | S3/R2 存储桶名称 | - |
| `accessKeyId` | string | 是 | AWS/Cloudflare 访问密钥 ID | - |
| `secretAccessKey` | string | 是 | AWS/Cloudflare 秘密访问密钥 | - |
| `region` | string | 仅 S3 | AWS 区域（例如 `us-east-1`） | - |
| `endpoint` | string | 仅 R2 | Cloudflare R2 端点 URL | - |
| `accountId` | string | 仅 R2 | Cloudflare 账户 ID | - |

#### 同步工作进程设置

| 字段 | 类型 | 描述 | 默认值 |
|-------|------|-------------|---------|
| `intervalMs` | number | 同步尝试之间的毫秒数 | 30000 (30s) |
| `maxRetries` | number | 放弃前的最大重试次数 | 5 |
| `batchSize` | number | 每个时间间隔处理的项目数 | 10 |
| `maxQueueSize` | number | 淘汰前的最大队列大小 | 1000 |
| `maxFailedAgeMs` | number | 丢弃失败项目之前的时间 | 604800000 (7 days) |
| `backfillEnabled` | boolean | 启动时同步现有任务 | false |

## 设置指南

<Tabs>
  <Tab title="AWS S3">
    ### AWS S3 配置

    <Steps>
      <Step title="创建 S3 存储桶">
        为 Cline 对话存储创建专用 S3 存储桶：
        
        ```bash
        aws s3 mb s3://your-cline-prompts --region us-east-1
        ```
        
        启用版本控制和加密：
        
        ```bash
        aws s3api put-bucket-versioning \
          --bucket your-cline-prompts \
          --versioning-configuration Status=Enabled
        
        aws s3api put-bucket-encryption \
          --bucket your-cline-prompts \
          --server-side-encryption-configuration '{
            "Rules": [{
              "ApplyServerSideEncryptionByDefault": {
                "SSEAlgorithm": "AES256"
              }
            }]
          }'
        ```
      </Step>

      <Step title="创建 IAM 策略">
        创建具有最低所需权限的 IAM 策略：
        
        ```json
        {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:GetObject",
                "s3:DeleteObject"
              ],
              "Resource": "arn:aws:s3:::your-cline-prompts/*"
            },
            {
              "Effect": "Allow",
              "Action": [
                "s3:ListBucket"
              ],
              "Resource": "arn:aws:s3:::your-cline-prompts"
            }
          ]
        }
        ```
        
        将其保存为 `cline-prompt-storage-policy.json` 并创建策略：
        
        ```bash
        aws iam create-policy \
          --policy-name ClinePromptStorage \
          --policy-document file://cline-prompt-storage-policy.json
        ```
      </Step>

      <Step title="创建 IAM 用户">
        创建专用 IAM 用户并附加策略：
        
        ```bash
        aws iam create-user --user-name cline-prompt-uploader
        
        aws iam attach-user-policy \
          --user-name cline-prompt-uploader \
          --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/ClinePromptStorage
        
        aws iam create-access-key --user-name cline-prompt-uploader
        ```
        
        保存输出中的 `AccessKeyId` 和 `SecretAccessKey`。
      </Step>

      <Step title="在 Cline Dashboard 中配置">
        在 [app.cline.bot](https://app.cline.bot) 的 Cline 管理控制台中：
        
        1. 导航至 **设置** → **企业遥测**
        2. 启用**提示词上传**
        3. 选择 **S3** 作为存储类型
        4. 输入您的存储桶名称、访问密钥 ID、秘密密钥和区域
        5. 配置同步工作进程设置（或使用默认值）
        6. 保存配置
      </Step>

      <Step title="测试连接">
        使用管理控制台中的“测试连接”按钮验证：
        - 存储桶访问
        - 写入权限
        - 凭据有效性
        
        一个测试文件将上传到您的存储桶，然后从中删除。
      </Step>
    </Steps>

    ### 可选：生命周期策略

    配置保留策略以管理成本：

    ```json
    {
      "Rules": [
        {
          "Id": "ArchiveOldPrompts",
          "Status": "Enabled",
          "Transitions": [
            {
              "Days": 90,
              "StorageClass": "GLACIER"
            }
          ]
        },
        {
          "Id": "DeleteOldPrompts",
          "Status": "Enabled",
          "Expiration": {
            "Days": 2555
          }
        }
      ]
    }
    ```
  </Tab>

  <Tab title="Cloudflare R2">
    ### Cloudflare R2 配置

    <Steps>
      <Step title="创建 R2 存储桶">
        1. 登录 [Cloudflare 控制面板](https://dash.cloudflare.com)
        2. 导航至侧边栏中的 **R2**
        3. 点击**创建存储桶**
        4. 为存储桶命名（例如 `cline-prompts`）
        5. 选择靠近用户的位置
        6. 点击**创建存储桶**
      </Step>

      <Step title="生成 API 令牌">
        1. 在 R2 仪表板中，点击**管理 R2 API 令牌**
        2. 点击**创建 API 令牌**
        3. 配置权限：
           - **令牌名称**：Cline Prompt Storage
           - **权限**：Object Read & Write
           - **存储桶**：选择您的存储桶或使用 All buckets
        4. 点击**创建 API 令牌**
        5. 保存 **Access Key ID** 和 **Secret Access Key**
        6. 记下您的 **Account ID**（显示在 R2 概述中）
      </Step>

      <Step title="获取 R2 端点">
        您的 R2 端点遵循以下格式：
        
        ```
        https://<ACCOUNT_ID>.r2.cloudflarestorage.com
        ```
        
        在 Cloudflare 仪表板的 R2 概述下找到您的账户 ID。
      </Step>

      <Step title="在 Cline Dashboard 中配置">
        在 [app.cline.bot](https://app.cline.bot) 的 Cline 管理控制台中：
        
        1. 导航至**设置** → **企业遥测**
        2. 启用**提示词上传**
        3. 选择 **R2** 作为存储类型
        4. 输入：
           - 存储桶名称
           - 访问密钥 ID
           - 秘密访问密钥
           - 账户 ID
           - 端点 URL
        5. 配置同步工作进程设置（或使用默认值）
        6. 保存配置
      </Step>

      <Step title="测试连接">
        使用“测试连接”按钮验证：
        - 使用所提供凭据的存储桶访问
        - 写入权限
        - 端点连接性
      </Step>
    </Steps>

    ### 成本优势

    与 S3 相比，R2 具有显著的成本优势：
    - **无传出费用**：免费下载数据
    - **更低的存储成本**：约 $0.015/GB，而 S3 约为 $0.023/GB
    - **全球边缘访问**：从任何地方快速访问
  </Tab>
</Tabs>

## 同步工作进程行为

后台同步工作进程管理上传队列，并具有以下特性：

### 队列管理

- **FIFO 顺序**：文件按照创建顺序上传
- **自动批处理**：每个时间间隔最多处理 `batchSize` 个项目
- **队列大小限制**：超过 `maxQueueSize` 时淘汰最早的项目
- **重试逻辑**：失败的上传最多重试 `maxRetries` 次

### 失败处理

当上传失败时：

1. **立即重试**：项目保留在队列中，等待下一个同步时间间隔
2. **指数退避**：各次重试尝试会间隔开来
3. **最大重试次数**：尝试 `maxRetries` 次后，项目会被标记为永久失败
4. **基于时间的清理**：早于 `maxFailedAgeMs` 的失败项目会被丢弃
5. **无数据丢失**：无论同步状态如何，本地文件都保持不变

### 回填模式

当 `backfillEnabled` 设置为 `true` 时：

- 首次启动时，扫描 `~/.cline/data/tasks/` 中的所有现有任务
- 将尚未上传的对话文件加入队列
- 适用于在现有 Cline 部署中启用提示词存储
- 可能产生大量上传数据——请监控队列大小

<Warning>
在大型部署中请谨慎启用回填。可以考虑从 `backfillEnabled: false` 开始，监控稳态队列后再启用回填。
</Warning>

## 监控与可观测性

### 与 OpenTelemetry 集成

尽管提示词存储独立运行，但它与 Cline 的可观测性系统集成：

- **任务生命周期事件**：`task.created`、`task.completed` 跟踪对话何时生成
- **对话事件**：`task.conversation_turn`、`task.tokens` 提供使用情况指标
- **本地监控**：同步工作进程状态会被记录，但尚未导出为 OTel 事件

有关配置指标导出的信息，请参阅 [OpenTelemetry](/enterprise-solutions/monitoring/opentelemetry)。

### CloudWatch 监控（S3）

使用 CloudWatch 监控 S3 上传活动：

```bash
# View PutObject requests (uploads)
aws cloudwatch get-metric-statistics \
  --namespace AWS/S3 \
  --metric-name NumberOfObjects \
  --dimensions Name=BucketName,Value=your-cline-prompts \
  --start-time 2026-03-01T00:00:00Z \
  --end-time 2026-03-08T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

### R2 分析

Cloudflare R2 在仪表板中提供内置分析：

- 请求数量和速率
- 存储使用量随时间的变化
- 带宽利用率
- 错误率

## 安全与合规

### 加密

**静态：**
- S3：启用服务器端加密（SSE-S3 或 SSE-KMS）
- R2：默认启用加密

**传输中：**
- 所有上传均使用 HTTPS/TLS
- 凭据绝不会被记录或暴露

### 访问控制

**推荐的 IAM 策略：**

- 使用专用 IAM 用户/角色
- 如果不需要读取访问权限，请将权限限制为仅写入
- 为凭据生成启用 MFA
- 定期轮换访问密钥

**存储桶策略：**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::your-cline-prompts/*",
        "arn:aws:s3:::your-cline-prompts"
      ],
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      }
    }
  ]
}
```

### 审计日志

**S3 服务器访问日志：**

```bash
aws s3api put-bucket-logging \
  --bucket your-cline-prompts \
  --bucket-logging-status '{
    "LoggingEnabled": {
      "TargetBucket": "your-log-bucket",
      "TargetPrefix": "cline-prompts-access/"
    }
  }'
```

**用于 API 调用的 CloudTrail：**

启用 CloudTrail 以跟踪存储桶上的所有 S3 API 操作。

### 数据保留

根据您的合规要求实施保留策略：

- **GDPR**：考虑删除权
- **SOC 2**：在规定期限内保留审计跟踪
- **HIPAA**：确保适当的保留和处置

## 故障排除

### 常见问题

<AccordionGroup>
  <Accordion title="队列大小持续增长">
    **症状**：达到 `maxQueueSize` 限制，最早的项目被淘汰
    
    **原因**：
    - 上传速率慢于对话创建速率
    - 网络连接问题
    - 批次大小不足或时间间隔不合适
    
    **解决方案**：
    1. 增加 `batchSize`，以便在每个时间间隔处理更多项目
    2. 减小 `intervalMs`，以便更频繁地同步
    3. 检查网络连接和凭据
    4. 调查期间临时增加 `maxQueueSize`
  </Accordion>

  <Accordion title="上传失败并显示 403 Forbidden">
    **症状**：上传反复失败，项目达到 `maxRetries`
    
    **原因**：
    - 凭据无效或已过期
    - IAM 权限不足
    - 存储桶策略拒绝访问
    
    **解决方案**：
    1. 验证远程配置中的凭据是否正确
    2. 检查 IAM 策略是否包含 `s3:PutObject` 权限
    3. 检查存储桶策略中的拒绝规则
    4. 使用 AWS CLI 测试：`aws s3 cp test.txt s3://your-bucket/`
  </Accordion>

  <Accordion title="R2 端点连接超时">
    **症状**：连接超时、上传失败
    
    **原因**：
    - 端点 URL 不正确
    - 防火墙阻止 Cloudflare IP
    - 账户 ID 无效
    
    **解决方案**：
    1. 验证端点格式：`https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
    2. 检查防火墙规则是否允许通过 HTTPS 访问 Cloudflare IP
    3. 在 Cloudflare 仪表板中确认账户 ID
    4. 使用 curl 测试：`curl -I https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
  </Accordion>

  <Accordion title="回填使上传队列不堪重负">
    **症状**：启用回填后队列立即达到最大大小
    
    **原因**：
    - 现有任务数量庞大
    - 回填加入队列的速度快于上传处理速度
    
    **解决方案**：
    1. 临时禁用回填：`"backfillEnabled": false`
    2. 先让稳态队列排空
    3. 增加 `batchSize` 并减小 `intervalMs`
    4. 考虑在回填期间增加 `maxQueueSize`
    5. 队列稳定后重新启用回填
  </Accordion>
</AccordionGroup>

### 调试日志

启用调试日志以诊断同步问题：

1. 检查扩展开发者控制台（Help → Toggle Developer Tools）
2. 查找 `[ClineBlobStorage]` 和 `[SyncWorker]` 日志条目
3. 失败的上传会记录带有详细信息的错误消息

### 测试配置

使用内置的测试连接功能：

```typescript
// Programmatic test (for custom integrations)
import { testPromptUploading } from '@/core/controller/state/testPromptUploading'

await testPromptUploading(controller)
// Returns: { success: boolean, message: string }
```

## 数据格式参考

### 对话文件架构

上传的 `api_conversation_history.json` 文件包含一个消息数组：

```json
[
  {
    "role": "user",
    "content": [
      {
        "type": "text",
        "text": "Create a React component for a todo list"
      }
    ]
  },
  {
    "role": "assistant",
    "content": [
      {
        "type": "text",
        "text": "I'll create a todo list component..."
      },
      {
        "type": "tool_use",
        "id": "toolu_123",
        "name": "write_to_file",
        "input": {
          "path": "TodoList.tsx",
          "content": "..."
        }
      }
    ]
  }
]
```

这遵循 [Anthropic Messages API 格式](https://docs.anthropic.com/claude/reference/messages_post)。

### 元数据架构

任务元数据包括：

```json
{
  "taskId": "1234567890",
  "createdAt": "2026-03-05T10:30:00Z",
  "lastModified": "2026-03-05T11:45:00Z",
  "modelInfo": {
    "id": "claude-sonnet-4",
    "provider": "anthropic"
  },
  "tokensUsed": {
    "input": 1250,
    "output": 3400
  }
}
```

## 最佳实践

<CardGroup cols={2}>
  <Card title="从小规模开始" icon="seedling">
    在整个组织范围内推广之前，先使用单个团队或项目进行测试。
  </Card>
  
  <Card title="监控成本" icon="dollar-sign">
    设置账单提醒，并每月审查存储使用情况。
  </Card>
  
  <Card title="保护凭据" icon="lock">
    使用具有最低权限的专用 IAM 用户，并定期轮换密钥。
  </Card>
  
  <Card title="规划保留策略" icon="calendar">
    根据合规需求定义并实施数据保留策略。
  </Card>
</CardGroup>

## 另请参阅

<CardGroup cols={3}>
  <Card title="OpenTelemetry" icon="chart-line" href="/enterprise-solutions/monitoring/opentelemetry">
    配置指标和日志导出，以实现全面的可观测性
  </Card>
  
  <Card title="遥测" icon="chart-simple" href="/enterprise-solutions/monitoring/telemetry">
    了解 Cline 的内置匿名使用情况跟踪
  </Card>
  
  <Card title="远程配置" icon="gear" href="/enterprise-solutions/configuration/remote-configuration/overview">
    了解远程配置系统
  </Card>
</CardGroup>
