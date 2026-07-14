---
title: "SSO 设置"
sidebarTitle: "SSO 设置"
description: "通过 WorkOS AuthKit 为 Cline Enterprise 配置单点登录 (SSO)。"
---

## 概述
Cline Enterprise 通过 **WorkOS AuthKit** 与您的身份提供商 (IdP) 集成以实现 SSO。

本页从较高层面介绍如何使用 WorkOS AuthKit 为 Cline Enterprise 设置 SSO。

如果您尚未完成初始入门流程，请从[入门](/enterprise-solutions/onboarding)开始。

### 视频演示

<Frame>
  <iframe
    src="https://www.youtube.com/embed/QC7mzXLjIH8"
    title="使用 WorkOS 设置 SSO"
    width="100%"
    style={{ aspectRatio: "16/9" }}
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
  />
</Frame>

## 设置在哪里进行
SSO 设置涉及两个位置：

1) **Cline 仪表板 (app.cline.bot)**
- 您在此登录并验证 SSO 是否适用于您的组织。

2) **WorkOS 仪表板**
- 您在此配置 IdP 连接 (AuthKit → Connections)。您的指定管理员会在企业入门期间获得访问权限。

## 使用 Cline 仪表板
使用位于 https://app.cline.bot 的 Cline 仪表板来：
- 完成登录和入门流程
- 验证用户能否通过 SSO 进行身份验证

## 在 WorkOS 中配置您的 IdP 连接

在企业入门期间，您的指定管理员将收到 WorkOS 的邀请电子邮件，其中包含访问您组织的 WorkOS 仪表板的链接。

<Frame>
  <img src="/assets/workos-invite-email.png" alt="WorkOS 邀请电子邮件示例" />
</Frame>

要将您的 IdP 连接到 Cline Enterprise，请在 **WorkOS AuthKit** 中配置您的身份提供商：

1. 在 WorkOS 仪表板中，转到 **AuthKit → Connections**
2. 点击 **Add Connection**
3. 选择您的身份提供商（例如 Okta、Microsoft Entra ID/Azure AD、Google Workspace、Generic SAML/OIDC）
4. 按照 WorkOS 中特定于提供商的说明操作

WorkOS 的 UI 和必填字段因提供商而异。有关详细信息，请遵循 WorkOS 文档：
- https://workos.com/docs/authkit/sso

## Keycloak 说明（IdP 兼容性）
Cline Enterprise 的默认 SSO 集成**通过 WorkOS** 实现。

如果您使用 **Keycloak** 作为 IdP，受支持的方式是在 WorkOS 中将 Keycloak 配置为 **Generic SAML** 或 **Generic OIDC** 提供商（使用 WorkOS 针对这些提供商类型要求的设置）。

## 验证
配置 WorkOS 后：

1) 从 https://app.cline.bot 尝试通过 SSO 登录。
2) 确认登录已完成（您已成功重定向回来）。

## 故障排除
- **重定向 URI 不匹配**：确认 WorkOS 中配置的重定向/回调 URL 与 Cline Enterprise 入门期间提供的 URL 一致。

有关其他故障排除指导，请参阅 WorkOS 文档：
- https://workos.com/docs/authkit/sso
