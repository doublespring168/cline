---
title: "企业 API 参考"
sidebarTitle: "API 参考"
description: "用于管理用户、组织、计费、套餐和 API 密钥的 REST API 端点。"
---

企业 API 提供用于账户管理、组织管理、计费和 API 密钥管理的 REST 端点。这些端点与处理模型推理的 [Chat Completions API](/api/overview) 相互独立。

## 基础 URL

```
https://api.cline.bot
```

## 身份验证

所有端点都要求在 `Authorization` 标头中提供 Bearer 令牌：

```bash
Authorization: Bearer YOUR_AUTH_TOKEN
```

请使用[公共 API 参考](/api/authentication)中所述的同一 API 密钥或账户身份验证令牌。

## 快速示例

```bash
# Get your user profile
curl https://api.cline.bot/api/v1/users/me \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

```json
{
  "id": "user_abc123",
  "email": "you@company.com",
  "name": "Your Name",
  "active_account_id": "org_xyz789"
}
```

---

## 用户

管理用户账户、接受条款、查看余额、查看用量以及配置付款方式。

| 方法 | 端点 | 描述 |
|--------|----------|-------------|
| `GET` | `/api/v1/users/me` | 获取当前用户资料 |
| `PATCH` | `/api/v1/users/me` | 更新当前用户资料 |
| `DELETE` | `/api/v1/users/me` | 删除当前用户账户 |
| `POST` | `/api/v1/users/me/accept-terms` | 接受服务条款 |
| `GET` | `/api/v1/users/me/remote-config` | 获取当前用户的远程配置 |
| `PUT` | `/api/v1/users/active-account` | 切换活跃账户（个人或组织） |
| `GET` | `/api/v1/users/{id}/balance` | 获取积分余额 |
| `GET` | `/api/v1/users/{id}/usages` | 获取用量历史记录 |

### 付款和积分

| 方法 | 端点 | 描述 |
|--------|----------|-------------|
| `GET` | `/api/v1/users/{id}/payments` | 列出付款历史记录 |
| `GET` | `/api/v1/users/{id}/payments/{paymentId}` | 获取付款详情 |
| `GET` | `/api/v1/users/{id}/payments/{paymentId}/status` | 检查付款状态 |
| `GET` | `/api/v1/users/{id}/payments/provider/{paymentId}` | 获取提供商端的付款详情 |
| `POST` | `/api/v1/users/credits/checkout` | 开始积分购买结账流程 |
| `POST` | `/api/v1/users/{id}/credits/purchase` | 直接购买积分 |

### 计费配置

| 方法 | 端点 | 描述 |
|--------|----------|-------------|
| `GET` | `/api/v1/users/{id}/auto-top-up` | 获取自动充值设置 |
| `PUT` | `/api/v1/users/{id}/auto-top-up` | 配置自动充值 |
| `GET` | `/api/v1/users/{id}/payment-method/default` | 获取默认付款方式 |
| `POST` | `/api/v1/users/{id}/payment-method/setup-session` | 开始付款方式设置 |
| `GET` | `/api/v1/users/{id}/promotions` | 列出有效促销活动 |

---

## 组织

创建和管理组织。组织管理员可以配置远程设置、管理成员和控制计费。

| 方法 | 端点 | 描述 |
|--------|----------|-------------|
| `POST` | `/api/v1/organizations` | 创建新组织 |
| `GET` | `/api/v1/organizations/{id}` | 获取组织详情 |
| `PUT` | `/api/v1/organizations/{id}` | 更新组织设置 |
| `DELETE` | `/api/v1/organizations/{id}` | 删除组织 |
| `GET` | `/api/v1/organizations/{id}/api-keys` | 列出组织 API 密钥 |
| `GET` | `/api/v1/organizations/{id}/remote-config` | 获取组织的远程配置 |
| `GET` | `/api/v1/organizations/{orgId}/metrics` | 获取组织用量指标 |

---

## 组织成员

管理谁有权访问组织以及他们拥有的角色。

| 方法 | 端点 | 描述 |
|--------|----------|-------------|
| `GET` | `/api/v1/organizations/{orgId}/members` | 列出所有成员 |
| `DELETE` | `/api/v1/organizations/{orgId}/members` | 移除成员 |
| `GET` | `/api/v1/organizations/{orgId}/members/available-roles` | 列出可分配的角色 |
| `PUT` | `/api/v1/organizations/{orgId}/members/{memberId}/role` | 更改成员角色 |
| `GET` | `/api/v1/organizations/{orgId}/members/{memberId}/usages` | 获取成员用量 |

<Tip>
  如需了解 UI 中的成员管理操作流程，请参阅[管理成员](/enterprise-solutions/team-management/managing-members)。
</Tip>

---

## 组织邀请

邀请新成员加入您的组织。

| 方法 | 端点 | 描述 |
|--------|----------|-------------|
| `GET` | `/api/v1/organizations/{orgId}/invites` | 列出待处理邀请 |
| `POST` | `/api/v1/organizations/{orgId}/invites` | 发送新邀请 |
| `GET` | `/api/v1/organizations/{orgId}/invites/count` | 获取邀请数量 |
| `DELETE` | `/api/v1/organizations/{orgId}/invites/{inviteId}` | 撤销邀请 |
| `POST` | `/api/v1/invites/accept` | 接受邀请（由受邀者调用） |

---

## 组织余额和付款

在组织层级管理积分和付款。这些端点与用户层级的付款端点相对应，但操作的是组织账户。

| 方法 | 端点 | 描述 |
|--------|----------|-------------|
| `GET` | `/api/v1/organizations/{orgId}/balance` | 获取组织积分余额 |
| `GET` | `/api/v1/organizations/{orgId}/payments` | 列出付款历史记录 |
| `GET` | `/api/v1/organizations/{orgId}/payments/{paymentId}` | 获取付款详情 |
| `GET` | `/api/v1/organizations/{orgId}/payments/{paymentId}/status` | 检查付款状态 |
| `GET` | `/api/v1/organizations/{orgId}/payments/provider/{paymentId}` | 提供商端的付款详情 |
| `POST` | `/api/v1/organizations/{orgId}/credits/checkout` | 开始积分结账流程 |
| `POST` | `/api/v1/organizations/{orgId}/credits/purchase` | 购买积分 |
| `GET` | `/api/v1/organizations/{orgId}/auto-top-up` | 获取自动充值配置 |
| `PUT` | `/api/v1/organizations/{orgId}/auto-top-up` | 配置自动充值 |
| `GET` | `/api/v1/organizations/{orgId}/payment-method/default` | 获取默认付款方式 |
| `POST` | `/api/v1/organizations/{orgId}/payment-method/setup-session` | 开始付款方式设置 |
| `GET` | `/api/v1/organizations/{id}/promotions` | 列出有效促销活动 |

---

## 组织套餐

订阅、升级或取消套餐。管理团队的席位数量。

| 方法 | 端点 | 描述 |
|--------|----------|-------------|
| `GET` | `/api/v1/plans` | 列出所有可用套餐 |
| `GET` | `/api/v1/organizations/{orgId}/plan` | 获取当前套餐 |
| `GET` | `/api/v1/organizations/{orgId}/plan/history` | 查看套餐变更历史记录 |
| `GET` | `/api/v1/organizations/{orgId}/plan/{planId}` | 获取特定套餐详情 |
| `POST` | `/api/v1/organizations/{orgId}/plan` | 订阅套餐 |
| `PUT` | `/api/v1/organizations/{orgId}/plan/seats` | 更新席位数量 |
| `DELETE` | `/api/v1/organizations/{orgId}/plan/{planId}` | 取消套餐 |

---

## 组织用量

跟踪整个组织的令牌消耗和成本。

| 方法 | 端点 | 描述 |
|--------|----------|-------------|
| `GET` | `/api/v1/organizations/{orgId}/usages` | 获取汇总用量数据 |

<Tip>
  有关仪表板和监控的信息，请参阅[监控概述](/enterprise-solutions/monitoring/overview)和[遥测](/enterprise-solutions/monitoring/telemetry)。
</Tip>

---

## API 密钥

创建和管理用于编程访问的 API 密钥。在此处创建的密钥既可用于 [Chat Completions API](/api/overview)，也可用于本页的端点。

| 方法 | 端点 | 描述 |
|--------|----------|-------------|
| `GET` | `/api/v1/api-keys` | 列出您的 API 密钥 |
| `POST` | `/api/v1/api-keys` | 创建新 API 密钥 |
| `DELETE` | `/api/v1/api-keys/{key_id}` | 删除 API 密钥 |

---

## 相关内容

<CardGroup cols={2}>
  <Card title="Chat Completions API" icon="code" href="/api/overview">
    用于发送提示并接收补全结果的公共推理 API。
  </Card>
  <Card title="SSO 设置" icon="key" href="/enterprise-solutions/sso-setup">
    为您的组织配置单点登录。
  </Card>
  <Card title="管理成员" icon="users" href="/enterprise-solutions/team-management/managing-members">
    在 UI 中添加、移除成员和管理成员角色。
  </Card>
  <Card title="监控" icon="chart-line" href="/enterprise-solutions/monitoring/overview">
    跟踪整个组织的用量、成本和遥测数据。
  </Card>
</CardGroup>
