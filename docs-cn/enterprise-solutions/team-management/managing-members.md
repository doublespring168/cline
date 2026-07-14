---
title: "管理成员"
sidebarTitle: "管理成员"
description: "在 Cline Enterprise 组织中管理团队成员、角色和权限的完整指南"
---

有效的成员管理对于维护安全和帮助团队高效工作至关重要。本指南涵盖您需要了解的关于角色、权限和日常成员管理的一切内容。

## 了解角色

为每位团队成员选择适当的角色，以平衡安全性和工作效率。以下是每个角色的设计用途：

<CardGroup cols={3}>
  <Card title="所有者" icon="crown" color="#9D4EDD">
    **主要账户持有者**
    
    可不受限制地访问所有设置，包括计费、安全和所有权转移。请将此角色限制为 1-2 名关键负责人。
  </Card>
  
  <Card title="管理员" icon="user-gear" color="#7209B7">
    **团队负责人和 IT 经理**
    
    可以管理用户和配置提供商。适合需要运营控制权但无需计费访问权限的可信管理者。
  </Card>
  
  <Card title="成员" icon="user" color="#560BAD">
    **开发者和贡献者**
    
    可以使用 Cline 和共享资源，但无法更改设置。对于大多数团队成员而言，这是最安全的默认角色。
  </Card>
</CardGroup>

## 权限矩阵

通过这份全面的权限明细，准确了解每个角色可以执行的操作：

| 权限 | Member | Admin | Owner |
| :--- | :---: | :---: | :---: |
| **一般使用** | | | |
| 使用 Cline | ✅ | ✅ | ✅ |
| 访问共享 API 提供商 | ✅ | ✅ | ✅ |
| | | | |
| **成员管理** | | | |
| 查看成员 | ❌ | ✅ | ✅ |
| 邀请新成员 | ❌ | ✅ | ✅ |
| 编辑成员角色 | ❌ | ✅ | ✅ |
| 移除成员 | ❌ | ✅ | ✅ |
| 移除 Admin | ❌ | ❌ | ✅ |
| | | | |
| **配置** | | | |
| 配置 API 提供商 | ❌ | ✅ | ✅ |
| 管理安全设置 | ❌ | ❌ | ✅ |
| | | | |
| **计费和所有权** | | | |
| 查看计费信息 | ❌ | ❌ | ✅ |
| 管理订阅 | ❌ | ❌ | ✅ |
| 转移所有权 | ❌ | ❌ | ✅ |

<Note>
**快速参考：** 大多数用户应为 **Member**。只向管理用户或配置的人员授予 **Admin**。将 **Owner** 保留给 1-2 名账户负责人。
</Note>

## 成员管理任务

<Tabs>
  <Tab title="添加成员">
    ### 邀请新团队成员
    
    1. **前往成员页面**
       - 前往 app.cline.bot 上的组织仪表板
       - 点击侧边栏中的 "Members"
    
    2. **发送邀请**
       - 点击 "Invite Member"
       - 输入用户的电子邮件地址（必须来自您已验证的域名）
       - 选择适当的角色（Member、Admin 或 Owner）
       - 点击 "Send Invite"
    
    3. **邀请状态**
       - 受邀用户将收到一封包含加入链接的电子邮件
       - 待处理邀请会显示在成员列表中，并带有 "Pending" 状态
       - 每个待处理邀请都会占用许可证中的一个席位
    
    <Tip>
    **批量邀请：** 需要添加多个用户？请联系 support@cline.bot，获取批量邀请 CSV 导入方面的帮助。
    </Tip>
  </Tab>
  
  <Tab title="编辑角色">
    ### 更改成员权限
    
    1. **找到成员**
       - 前往 Members 页面
       - 找到您想要修改的用户
    
    2. **更改角色**
       - 点击其当前角色旁边的下拉菜单
       - 从菜单中选择新角色
       - 确认更改
    
    3. **立即生效**
       - 角色变更会立即生效
       - 用户可能需要退出并重新登录，才能看到更新后的权限
    
    <Warning>
    **Admin 降级为 Member：** 将 Admin 降级为 Member 会立即撤销其管理用户和配置的能力。请确保他们不再需要这些权限。
    </Warning>
  </Tab>
  
  <Tab title="移除成员">
    ### 团队成员离职处理
    
    1. **访问成员列表**
       - 前往您组织的 Members 页面
       - 找到要移除的用户
    
    2. **移除用户**
       - 点击其姓名旁边的菜单图标 (⋮)
       - 选择 "Remove from Organization"
       - 确认移除
    
    3. **即时影响**
       - 用户会立即失去对组织的访问权限
       - 其席位会被释放，可以分配给其他人
       - 审计日志会保留以满足合规要求
    
    <Info>
    **数据保留：** 移除成员不会删除其历史活动日志。所有审计轨迹都会完整保留以满足合规要求。
    </Info>
  </Tab>
  
  <Tab title="撤销邀请">
    ### 取消待处理邀请
    
    如果受邀用户尚未接受邀请，您可以撤销邀请：
    
    1. 在 Members 列表中找到待处理邀请
    2. 点击 "Revoke Invitation"
    3. 该席位会立即释放给其他用户
    
    此功能适用于以下情况：
    - 使用了错误的电子邮件地址
    - 用户不再需要访问权限
    - 您需要紧急重新分配席位
  </Tab>
</Tabs>

## 身份和访问要求

用户要成功加入您的组织，必须满足两个条件：

<Steps>
  <Step title="已验证的身份提供商">
    您的组织必须使用已验证的**身份提供商 (IDP)**，例如：
    - Microsoft Entra ID (Azure AD)
    - Okta
    - Google Workspace
    - AWS IAM Identity Center
    
    用户必须通过您的 IDP 进行身份验证，才能访问组织。
  </Step>
  
  <Step title="域名验证">
    您的组织必须拥有一个**已验证域名**。您需要通过域名提供商（例如 Google、Microsoft、Cloudflare）验证域名所有权。
    
    只有电子邮件地址来自已验证域名的用户才能加入。
  </Step>
</Steps>

<Note>
这些要求可确保只有来自贵公司的已通过身份验证的用户才能访问您的 Cline 组织，从而防止未经授权的访问。
</Note>

## 席位管理

了解席位的工作方式有助于您有效管理许可证：

<AccordionGroup>
  <Accordion title="席位的计算方式" icon="chair">
    - 每位用户（Owner、Admin 或 Member）占用**一个席位**
    - 待处理邀请也会占用一个席位
    - 移除成员或撤销邀请会立即释放席位
    - 您的许可证决定可用席位的最大数量
  </Accordion>
  
  <Accordion title="何时使用席位" icon="user-plus">
    席位在以下情况下被占用：
    - 您发送邀请（标记为 "pending"）
    - 受邀用户接受邀请并加入
    - 现有用户通过 SSO 获得访问权限
  </Accordion>
  
  <Accordion title="释放席位" icon="user-minus">
    要释放席位：
    - 从组织中移除活跃成员
    - 撤销待处理邀请
    - 等待待处理邀请过期（如果已配置）
  </Accordion>
  
  <Accordion title="升级许可证" icon="arrow-up">
    需要更多席位？
    - **Enterprise 套餐：** 包含无限席位，不受按用户限制。请联系您的客户经理或访问 app.cline.bot/settings/billing 进行升级。
  </Accordion>
</AccordionGroup>

## 安全最佳实践

请遵循以下准则来维护组织安全：

<CardGroup cols={2}>
  <Card title="最小权限原则" icon="shield-check">
    始终分配满足需要的最低角色。大多数用户应为 Member。仅在工作职责需要时授予 Admin 或 Owner 权限。
  </Card>
  
  <Card title="限制 Owner 角色" icon="user-lock">
    将 Owner 限制为 1-2 名负责计费和安全的关键人员。这种集中管理可防止意外或恶意更改关键设置。
  </Card>
  
  <Card title="定期审计" icon="clipboard-check">
    每季度审查您的成员列表。及时移除非活跃用户，并确认每位用户的 Admin/Owner 角色是否仍然适当。
  </Card>
  
  <Card title="离职流程" icon="door-open">
    创建标准离职检查清单：从 Cline 中移除、撤销 IDP 访问权限、记录到审计日志，并重新分配所有关键职责。
  </Card>
</CardGroup>

<Warning>
**Owner 问责：** 由于 Owner 控制计费并且可以转移所有权，请谨慎选择这些人员，并在组织的安全策略中记录选择结果。
</Warning>

## 高级场景

<AccordionGroup>
  <Accordion title="转移所有权" icon="exchange">
    只有当前 Owner 可以转移所有权：
    
    1. 前往 Organization Settings
    2. 转到 "Ownership" 部分
    3. 从成员列表中选择新的 Owner
    4. 通过身份验证确认转移
    5. 新 Owner 立即获得控制权
    
    **重要提示：** 前任 Owner 无法撤销此操作。如有需要，必须由新 Owner 发起反向转移。
  </Accordion>
  
  <Accordion title="管理多个 Admin" icon="users-gear">
    当您有多个 Admin 时：
    
    - 记录每位 Admin 的职责范围
    - 使用审计日志跟踪配置更改
    - 对于大型团队，考虑制定轮值计划
    - 为需要 Owner 决策的事项建立升级路径
  </Accordion>
  
  <Accordion title="临时访问" icon="clock">
    对于承包商或临时员工：
    
    - 将其创建为 Member，并设置到期日历提醒
    - 在内部系统中记录其访问期限
    - 设置日历提醒，在合同结束时将其移除
    - 如果您的 IDP 支持，请考虑使用有时间限制的 IDP 账户
  </Accordion>
</AccordionGroup>

## 故障排除

<AccordionGroup>
  <Accordion title="用户无法接受邀请" icon="circle-exclamation">
    **常见原因：**
    - 电子邮件域名与已验证域名不匹配
    - 尚未授予用户 IDP 访问权限
    - 邀请链接已过期
    
    **解决方案：** 验证域名验证是否已完成，并重新发送邀请。
  </Accordion>
  
  <Accordion title="无法移除 Admin" icon="user-slash">
    **原因：** 只有 Owner 可以移除 Admin。
    
    **解决方案：** 请让 Owner 执行移除；如果您需要移除组织中唯一的 Owner，请联系 support@cline.bot。
  </Accordion>
  
  <Accordion title="席位不足" icon="triangle-exclamation">
    **达到许可证限制时：**
    - 移除非活跃成员以释放席位
    - 撤销不再需要的待处理邀请
    - 升级许可证以增加更多席位
  </Accordion>
</AccordionGroup>

## 后续步骤

现在您已经了解成员管理，接下来请配置您的组织：

<CardGroup cols={2}>
  <Card 
    title="配置提供商" 
    icon="plug" 
    href="/enterprise-solutions/configuration/remote-configuration/overview"
  >
    设置供团队使用的 API 提供商
  </Card>
  
  <Card 
    title="监控用量" 
    icon="chart-line" 
    href="/enterprise-solutions/monitoring/overview"
  >
    跟踪团队活动和资源消耗
  </Card>
</CardGroup>

<Tip>
**想快速开始？** 最快的路径是：1) 以 Member 角色邀请您的团队；2) 配置一个 API 提供商；3) 让团队开始使用 Cline。之后您可以再优化角色和设置。
</Tip>
