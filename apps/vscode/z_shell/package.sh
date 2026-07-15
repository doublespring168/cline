#!/bin/bash
###
 # @Author: darcy.zhang , tech.darcy.zhang@outlook.com
 # @Date: 2026-07-15 10:26:42
 # @LastEditors: darcy.zhang , tech.darcy.zhang@outlook.com
 # @LastEditTime: 2026-07-15 10:44:21
 # @FilePath: /vscode/z_shell/package.sh
 # @Description: 
 # 
 # Copyright (c) 2026 by 【 tech.darcy.zhang@outlook.com 】, All Rights Reserved. 
### 

source ~/cg/sh/common_util.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

cd "$PROJECT_DIR"

dir=`pwd`
logh "打包目录"
log ${dir}

logh "打包环境"
nvm use 22
node --version
npm --version

logh "安装依赖"
npm run install:all

logh "清理旧的构建物"
npm run clean:build

logh "生成 Proto"
npm run protos

logh "类型检查、代码检查和测试"
npm run check-types

rm -rf coverage-unit
npm run lint

npm run test:unit
npm run test:webview
npm run test:integration


logh "源码打包"
npm run package

logh "源码打包输出构建物"
test -f dist/extension.js
test -f webview-ui/build/assets/index.js
test -f webview-ui/build/assets/index.css
ls -lh dist/extension.js
ls -lh webview-ui/build/assets/index.js webview-ui/build/assets/index.css


logh "检查 VSIX 将包含哪些文件"
npx vsce ls 2>&1 | head -n 30

logh "本地 VSCE 版本号"
npx vsce --version

logh "生成安装包"
mkdir -p dist
package_version=$(node -p "require('./package.json').version")
npx vsce package --allow-missing-repository --out "dist/coderx-${package_version}-${time_second}.vsix"

logh "安装包文件列表"
ls -lh dist/*.vsix

cp dist/*.vsix ~/Downloads
ls -lh ~/Downloads/*.vsix
