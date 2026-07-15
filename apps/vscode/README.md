# coderX

coderX is an independent AI coding agent for Visual Studio Code. It can coexist with Cline and uses separate extension commands, views, OAuth callbacks, state, secrets, rules, hooks, skills, and workspace configuration files.

## Local isolation

- Extension ID: `coderx.coderx`
- Data: `~/.coderx/data`
- Endpoint override: `~/.coderx/endpoints.json`
- Global configuration: `~/Documents/coderX`
- Workspace rules: `.coderxrules`
- Workspace ignore file: `.coderxignore`
- Workspace skills: `.coderx/skills`

No data is automatically imported from the official Cline extension.

## Development

```bash
nvm use 22
npm run install:all
npm run check-types
npm run lint
npm run test:unit
npm run test:webview
npm run package
npx vsce package --out dist/coderx-4.0.8.vsix
```

## Attribution and license

coderX is an independent distribution based on the open-source Cline project and is not the official Cline extension. It is distributed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
