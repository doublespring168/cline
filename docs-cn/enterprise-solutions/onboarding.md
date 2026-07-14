---
title: "入门"

description: "本指南介绍管理员如何在 Cline Enterprise 中配置 SSO 预配和用户管理。"
---

## 概述
Cline Enterprise 通过 WorkOS 与您现有的身份提供商 (IdP) 集成，提供安全的 SSO 和零接触用户生命周期管理。在本指南中，您将连接自己的 IdP（Okta、Azure AD、Google Workspace 或任何 SAML/OIDC 提供商），启用即时 (JIT) 预配，以便新用户首次登录时自动创建，并配置角色映射，使权限始终与您的目录保持一致——无需手动邀请或核对席位。


## 前提条件

- [Cline Enterprise 许可证](https://cline.bot/contact-sales)
- 访问您的身份提供商 (IdP) 配置（例如 Okta、Azure AD、Google Workspace）的权限
- 了解您组织的 SSO 要求

## 配置步骤

### 第 1 步：启用 Cline Enterprise 许可证

在入门期间，您的 IdP 管理员将收到一封电子邮件，其中包含一个链接，用于向 WorkOS 注册其组织。

### 第 2 步：配置您的身份提供商

<Info>
有关 SSO 配置所在位置（Cline 仪表板、WorkOS 与您的 IdP）的简要概述，请参阅 [SSO 设置](/enterprise-solutions/sso-setup)。
</Info>

将您的身份提供商 (IdP) 连接到 WorkOS：

1. 在 WorkOS 仪表板中，转到 **AuthKit → Connections**
2. 点击 **Add Connection**
3. 选择您的身份提供商（例如 Okta、Azure AD、Google Workspace、Generic SAML/OIDC）
4. 按照特定于提供商的设置说明操作

每个身份提供商 (IdP) 都有自己的设置流程和必填字段。请务必按照 WorkOS 仪表板中针对所选提供商的具体说明操作。
有关连接 IdP 的更明确说明，请参阅 [WorkOS SSO 文档](https://workos.com/docs/authkit/sso)

### 第 3 步：配置用户预配

Cline Enterprise 使用可自动运行的**即时预配**：

- **自动创建组织**
- **用户在首次通过 SSO 登录时自动获得访问权限**，前提是 IdP 管理员已配置其凭据。
- **角色自动从您的 IdP 同步**（Admin/Owner → Admin，Member → Member）
- **无需手动邀请用户或管理席位**

无需额外配置。用户通过 SSO 登录时会被自动预配。

### 第 4 步：配置用户属性映射

用户角色会从您的 IdP 自动映射：

- IdP 中的 **Admin** → Cline 中的 **Admin** 角色（注意：组织的第一位 Owner 在入门期间手动创建）
- IdP 中的 **Member** → Cline 中的 **Member** 角色

<Info>
    有关每个角色可以访问的内容，请参阅[角色和权限](/enterprise-solutions/team-management/managing-members)页面。
</Info>

如有需要，您可以在 Cline Admin 控制台中配置其他用户属性：

1. 转到 **Settings → Authentication → User Attributes**
2. 根据您的 IdP 配置映射电子邮件和姓名等属性

有关可用用户属性的信息，请参阅 [WorkOS 用户对象文档](https://workos.com/docs/authkit/user-management)。

### 第 5 步：测试 SSO 连接

在允许用户登录之前，请测试 SSO 流程，以确保一切配置正确。

**测试连接：**

1. 在 WorkOS 仪表板中（或 Cline Admin 控制台，如果可用），找到并点击 **Test SSO Connection**
2. 您将被重定向到 IdP 的登录页面
3. 输入测试用户的有效凭据
4. 成功通过身份验证后，您应被重定向回来
5. 确认用户的信息（姓名、电子邮件、角色）显示正确

**预期结果：** 测试用户通过身份验证，其账户详情可见，并且其角色与您在 IdP 中配置的角色一致。

**如果测试失败：** 请仔细检查您的 IdP 配置（重定向 URI、SAML 证书、属性映射）。有关故障排除指导，请参阅 [WorkOS SSO 文档](https://workos.com/docs/authkit/sso)。

### 用户访问

配置 SSO 后，您 IdP 中的用户无需手动邀请或设置账户即可自动访问 Cline。

**首次登录流程：**

1. 用户前往 Cline 并点击 **Sign in with SSO**
2. 用户通过组织的 IdP 进行身份验证
3. Cline 自动在您的组织中创建其账户
4. 根据其 IdP 角色分配角色（请参阅[第 4 步](#%E7%AC%AC-4-%E6%AD%A5%EF%BC%9A%E9%85%8D%E7%BD%AE%E7%94%A8%E6%88%B7%E5%B1%9E%E6%80%A7%E6%98%A0%E5%B0%84)）
5. 用户被重定向到 Cline 并可以开始工作

**自动执行的操作：**
- 创建账户并正确分配组织
- 分配角色和权限
- 使用 IdP 中的信息填充基本资料（姓名、电子邮件）

**无需操作：** 用户无需请求访问权限或等待批准。成功通过 IdP 身份验证后会立即获得访问权限。

### 管理访问权限

目前，所有用户访问权限的管理和撤销均由您的 IdP 处理：

- 添加用户 → 首次登录时自动授予访问权限
- 更改角色 → 下次登录时更新
- 移除用户 → 自动撤销访问权限

<Info>
角色变更会在用户下次登录时自动同步。
</Info>

### 更改您的 IdP

如需更换为其他 IdP，请联系支持团队，我们将指导您完成此流程。

---

## 验证

验证配置成功的步骤：

1. **测试用户登录**：让测试用户通过 SSO 流程登录（首次登录时自动授予访问权限）
2. **验证用户预配**：确认用户已自动创建并拥有适当的角色权限
3. **检查用户属性**：验证用户信息（姓名、电子邮件、组织）是否正确填充
4. **测试角色变更**：在 IdP 中更新用户的角色，并验证该角色是否在用户下次登录时同步
5. **测试用户取消预配**：从 IdP 中移除用户，并验证他们在下次尝试登录时是否失去 Cline 访问权限
6. **查看审计日志**：检查 WorkOS 审计日志，确保身份验证事件正在被记录

---
