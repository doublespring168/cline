# coderX

coderX is an independent AI coding agent for Visual Studio Code. It can inspect and edit files, run terminal commands, use a browser, work with MCP servers, and help complete multi-step engineering tasks with approval controls.

## Highlights

- Work with multiple model providers, including OpenAI-compatible APIs and local models.
- Review every file edit in VS Code before accepting it.
- Run commands in a dedicated `coderX` terminal.
- Add files, folders, URLs, diagnostics, and terminal output to the conversation.
- Extend the agent with local or remote MCP servers.
- Use checkpoints, rules, workflows, hooks, skills, and worktrees.

## Independent from Cline

coderX uses its own VS Code extension identity and runtime namespaces, so it can be installed alongside Cline. It does not read or write Cline's local state.

| Resource | coderX location or namespace |
| --- | --- |
| Extension ID | `coderx.coderx` |
| Commands and context keys | `coderx.*` |
| User data and secrets | `~/.coderx/data` |
| Endpoint override | `~/.coderx/endpoints.json` |
| Global rules, workflows, MCP and hooks | `~/Documents/coderX` |
| Workspace rules | `.coderxrules` |
| Workspace ignore file | `.coderxignore` |
| Workspace skills | `.coderx/skills` |

No data is automatically imported from `~/.cline`, `.clinerules`, or `.clineignore`.

## Getting started

1. Open the coderX icon in the Activity Bar.
2. Open Settings and select a model provider.
3. Enter the provider credentials required for that provider.
4. Start a task and review requested file or terminal actions before approval.

Provider credentials are stored in coderX's dedicated local data directory. Some providers use their own OAuth flow or remote API and are subject to that provider's terms.

## Self-hosted endpoints

To override the built-in service endpoints, create `~/.coderx/endpoints.json`:

```json
{
  "appBaseUrl": "https://app.example.com",
  "apiBaseUrl": "https://api.example.com"
}
```

Both values must be valid URLs. A bundled `endpoints.json` in the extension takes precedence over the user file.

## Attribution and license

coderX is an independent distribution based on the open-source Cline project and is not the official Cline extension. The original project and applicable notices remain covered by the included Apache License 2.0.

See the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0) for details.
