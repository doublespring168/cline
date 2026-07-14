---
title: "配置 Google Vertex AI 提供商（管理员）"
sidebarTitle: "配置 Google Vertex（管理员）"
description: "本指南说明管理员如何将 Google Vertex AI 配置为 Cline 的组织级 LLM 提供商。"
---


作为管理员，你可以通过托管式管理控制台，将 Google Vertex AI 添加为供所有 Cline 用户使用的组织级 LLM 提供商。这种集中式方法既能确保用户以一致的方式访问 Google 的 Gemini 模型，又能维护组织的项目边界和区域设置。

## 开始之前

要开始将 Google Vertex AI 设置为组织的 LLM 提供商，你需要先准备好几项内容。

**Cline 管理控制台的管理员访问权限**  
你需要管理员权限，才能在整个组织内强制实施提供商设置。如果你可以在 [app.cline.bot](https://app.cline.bot) 的管理控制台中导航至**设置 → Cline 设置**，就说明你拥有正确的访问级别。


**已启用 Vertex AI 的 Google Cloud 项目**  
你需要一个已启用 Vertex AI API 且可访问相应模型的 Google Cloud 项目。

<Note>
如果你尚未设置 Google Cloud 或 Vertex AI，请与云团队合作启用 Vertex AI API，并确保已配置必要的配额。
</Note>

**项目配置详细信息**  
你需要 Google Cloud 项目 ID，以及访问 Vertex AI 模型时首选的区域。

<Tip>
为遵循安全最佳实践，服务账号应仅拥有访问 Vertex AI 所需的最低 IAM 权限。
</Tip>

## 配置步骤

<Steps>
<Step title="访问 Cline 设置">
导航至 [app.cline.bot](https://app.cline.bot)，使用管理员账号登录。前往**设置 → Cline 设置**。

<Info>
如果你拥有正确的管理员访问级别，应该会看到提供商配置选项。
</Info>
</Step>

<Step title="启用远程提供商配置">
开启**启用设置**，以显示远程提供商配置选项。这样，你便可以在整个组织内强制实施提供商设置。
</Step>

<Step title="选择 Google Vertex AI 作为 API 提供商">
打开 **API 提供商**下拉菜单，然后选择 **Google Vertex AI**。这将打开 Vertex AI 配置面板，你可以在其中配置所有组织级设置。
</Step>

<Step title="配置 Vertex AI 设置">
配置面板包含用于控制 Vertex AI 在组织中工作方式的设置：

<AccordionGroup>
<Accordion title="项目 ID（必填）">
输入已启用 Vertex AI 的 Google Cloud 项目 ID。此项目将用于组织成员发出的所有 AI 模型请求。

<Tip>
使用专门用于 AI 工作负载的项目，以便更好地跟踪用量和成本。确保该项目有足够的配额来满足团队的预期用量。
</Tip>
</Accordion>

<Accordion title="区域（必填）">
选择应访问 Vertex AI 模型的 Google Cloud 区域。常见选项包括 `us-central1`、`us-east4` 或 `europe-west4`。

[查看 Google Cloud 区域](https://cloud.google.com/docs/geography-and-regions)

<Note>
选择靠近团队所在地的区域，以获得最佳性能。某些模型可能并非在所有区域都可用。
</Note>
</Accordion>
</AccordionGroup>
</Step>

<Step title="保存配置">
配置完设置后，关闭提供商配置面板，然后点击设置页面上的**保存**以保留更改。

保存后，所有已登录 Cline 扩展的组织成员都将自动使用采用你所配置设置的 Google Vertex AI。他们将无法选择其他提供商，也无法切换到个人 Cline 账号。

<Warning>
启用远程配置后，成员无法切换到个人 Cline 账号或加入其他组织。这可确保整个团队使用一致的提供商。
</Warning>
</Step>
</Steps>

## 验证

要验证配置：

1. 检查已启用的提供商字段中是否显示 "Google Vertex AI"
2. 确认刷新页面后设置仍然保留
3. 使用成员账号进行测试，确保他们只能看到 Vertex AI 这一个提供商
4. 验证模型下拉菜单中是否提供 Gemini 模型

## 故障排除

**成员看不到已配置的提供商**  
确保关闭配置面板后点击了保存。验证成员账号属于正确的组织，并且 Google Cloud 项目已启用 Vertex AI API。

**项目访问错误**  
验证项目 ID 是否正确，以及是否已启用 Vertex AI API。检查项目是否配置了适当的结算账号，以及是否已超出配额。

**区域可用性问题**  
确认所选区域支持你想要使用的 Gemini 模型。某些较新的模型可能仅在特定区域可用。

**配置更改未保留**  
确保点击主设置页面上的保存按钮，而不是仅关闭配置面板。

**之后需要更改项目或区域**  
你可以随时更新这些设置。成员需要确保其本地 Google Cloud 凭据有权访问新的项目/区域。

有关更多详细信息，请参阅 [Google Cloud Vertex AI 文档](https://cloud.google.com/vertex-ai/docs)，并与你的内部云团队协调。
