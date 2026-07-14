---
title: "远程访问"
description: "使用隧道、VPN 和云服务，从网络中的其他设备或任何地方访问 Kanban"
---

默认情况下，Kanban 绑定到 `127.0.0.1:3484`，只能从运行它的机器上访问。本指南介绍如何为移动设备、远程机器或团队协作启用远程访问。

<Warning>
将 Kanban 暴露到 localhost 之外时，请确保你信任所有拥有访问权限的设备和用户。Kanban 提供对你的 git 仓库和终端的完全访问权限。
</Warning>

## 本地网络访问

要让本地网络中的其他设备（例如同一 WiFi 下的手机或平板电脑）能够访问 Kanban，请绑定到 `0.0.0.0` 而不是 `127.0.0.1`。

### 使用 CLI 标志

```bash
kanban --host 0.0.0.0
```

这样一来，网络中的任何设备都可以通过 `http://<your-machine-ip>:3484` 访问 Kanban。

### 使用环境变量

```bash
KANBAN_RUNTIME_HOST=0.0.0.0 cline
```

运行 `cline` 时，它将启动绑定到 `0.0.0.0` 的 Kanban。

<Warning>
**安全提示**：绑定到 `0.0.0.0` 会将 Kanban 暴露给整个本地网络。仅在你信任的网络（例如家庭 WiFi）中使用此设置。
</Warning>

## Tailscale（推荐用于远程访问）

Tailscale 无需向互联网暴露端口，即可提供安全的远程访问。配置完成后，无论在路上、咖啡店还是其他任何地方，你都可以通过手机访问 Kanban。

### 设置

1. 在你的开发机器和手机/远程设备上都**安装 Tailscale**
2. 在两台设备上**登录**同一个 Tailscale 账户
3. 使用网络绑定**启动 Kanban**：

```bash
KANBAN_RUNTIME_HOST=0.0.0.0 cline
```

4. **从手机访问**：在 3484 端口导航到你的机器的 Tailscale 主机名：

```
http://your-machine-name.tail1234.ts.net:3484
```

你的 Tailscale 主机名可在 Tailscale 应用或管理控制台中查看。

<Tip>
Tailscale 会创建安全的网状 VPN，因此连接经过加密，并且无需打开任何防火墙端口。这是远程访问最安全的选项。
</Tip>

## Docker 部署

在 Docker 容器中运行 Kanban，以实现隔离部署或用于服务器环境。

### Dockerfile

```dockerfile
FROM node:22

WORKDIR /app

EXPOSE 3484

CMD ["npx", "--yes", "kanban@latest", "--host", "0.0.0.0"]
```

### 构建并运行

```bash
docker build -t npx-kanban .
docker run -it -p 3484:3484 npx-kanban
```

然后在浏览器中导航到 `http://localhost:3484`。

<Tip>
要从网络中的其他机器访问 Kanban 容器，请使用 `http://<docker-host-ip>:3484`。
</Tip>

## SSH 隧道

SSH 隧道会在本地机器和远程服务器之间创建安全连接。这要求你拥有运行 Kanban 的远程机器的 SSH 访问权限。

### 设置

**在远程机器上**，正常运行 Kanban（它可以绑定到 `127.0.0.1`）：

```bash
kanban
```

**在本地机器上**，创建 SSH 隧道：

```bash
ssh -L 3484:localhost:3484 user@remote-hostname
```

然后在本地浏览器中导航到 `http://localhost:3484`。SSH 隧道会将连接安全地转发到远程机器。

<Tip>
将 `user` 替换为你的 SSH 用户名，将 `remote-hostname` 替换为远程机器的 IP 地址或主机名。如果使用 SSH 密钥，请在用户名之前添加 `-i /path/to/key.pem`。
</Tip>

## Ngrok

Ngrok 会创建一个隧道到本地 Kanban 实例的公共 HTTPS URL。适合快速演示或与协作者共享。

### 设置

```bash
# Install ngrok (macOS)
brew install ngrok

# Add your auth token (create a free account at ngrok.com)
ngrok config add-authtoken $YOUR_AUTHTOKEN

# Start Kanban
kanban

# In another terminal, create the tunnel
ngrok http 3484
```

Ngrok 会显示一个类似 `https://1234-5678-9012.ngrok-free.app` 的公共 URL。共享此 URL 即可让其他人访问你的 Kanban 看板。

<Warning>
Ngrok URL 可在互联网上公开访问。任何拥有该 URL 的人都可以访问你的 Kanban 看板。仅将其用于临时访问，并在完成后停止隧道。
</Warning>

## Cloudflare 隧道

Cloudflare Tunnels 提供生产级远程访问，支持自定义域名、访问控制和 HTTPS。

### 设置

按照 [Cloudflare Tunnel 指南](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-remote-tunnel/)创建隧道。然后使用以下设置配置应用程序路由：

- **Hostname.subdomain**：选择任意子域名（例如 `kanban`）
- **Hostname.Domain**：你在 Cloudflare 中配置的域名
- **Hostname.Path**：留空
- **Service.Type**：`HTTP`
- **Service.URL**：`localhost:3484`

### AWS CDK 示例

使用 AWS CDK 在 EC2 上部署带有 Cloudflare Tunnel 的 Kanban：

```typescript
import * as cdk from "aws-cdk-lib/core";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export class KanbanEc2Stack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Tunnel token from env or CDK context
        const tunnelToken =
            process.env.TUNNEL_TOKEN || this.node.tryGetContext("tunnelToken");
        if (!tunnelToken) {
            throw new Error(
                "Missing tunnel token. Set TUNNEL_TOKEN env var or pass -c tunnelToken=xxx",
            );
        }

        // VPC + Security Group
        const vpc = ec2.Vpc.fromLookup(this, "DefaultVpc", { isDefault: true });

        const sg = new ec2.SecurityGroup(this, "KanbanSg", {
            vpc,
            allowAllOutbound: true,
            description: "Kanban EC2 security group",
        });
        sg.addIngressRule(ec2.Peer.myIp(), ec2.Port.tcp(22), "SSH access");

        // User data script
        const userData = ec2.UserData.forLinux();
        userData.addCommands(
            "set -x",
            "exec > >(tee /var/log/user-data.log) 2>&1",

            // 1) Install git and cloudflared first for tunnel connectivity
            "sudo dnf install -y git",
            "curl -L --output /tmp/cloudflared.rpm https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-x86_64.rpm",
            "sudo yum localinstall -y /tmp/cloudflared.rpm",

            // 2) Start cloudflared tunnel so the instance is reachable
            `sudo cloudflared service install ${tunnelToken}`,

            // 3) Install Node.js 22 via NodeSource
            "curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -",
            "sudo dnf install -y nodejs",

            // 4) Clone and build the app
            "git clone -b main https://github.com/cline/kanban.git /opt/kanban",

            // 5) Create systemd service for the kanban app
            `cat > /etc/systemd/system/kanban.service << 'UNIT'
[Unit]
Description=Kanban App
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/kanban
ExecStart=/usr/bin/kanban
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=HOME=/root
Environment=PATH=/usr/bin:/usr/local/bin

[Install]
WantedBy=multi-user.target
UNIT`,
            "systemctl daemon-reload",
            "systemctl enable --now kanban.service",
        );

        // IAM role with SSM access
        const role = new iam.Role(this, "KanbanInstanceRole", {
            assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName(
                    "AmazonSSMManagedInstanceCore",
                ),
            ],
        });

        // EC2 Instance
        const instance = new ec2.Instance(this, "KanbanInstance", {
            vpc,
            instanceType: ec2.InstanceType.of(
                ec2.InstanceClass.T3,
                ec2.InstanceSize.SMALL,
            ),
            machineImage: ec2.MachineImage.latestAmazonLinux2023(),
            securityGroup: sg,
            vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
            associatePublicIpAddress: true,
            userData,
            role,
        });

        // Outputs
        new cdk.CfnOutput(this, "InstanceId", { value: instance.instanceId });
        new cdk.CfnOutput(this, "PublicIp", {
            value: instance.instancePublicIp,
        });
    }
}
```

使用以下命令部署：

```bash
TUNNEL_TOKEN=<your_tunnel_token> cdk deploy
```

## 总结

| 方法 | 安全性 | 复杂度 | 使用场景 |
|--------|----------|------------|----------|
| **本地网络** | 低（仅限 LAN） | 简单 | 同一 WiFi 下的手机/平板电脑 |
| **Tailscale** | 高（加密 VPN） | 简单 | 从任何地方远程访问 |
| **Docker** | 中等（隔离） | 中等 | 服务器部署 |
| **SSH 隧道** | 高（加密） | 中等 | 安全的远程访问 |
| **Ngrok** | 低（公共 URL） | 简单 | 临时演示/共享 |
| **Cloudflare** | 高（自定义域名） | 复杂 | 生产部署 |

<Tip>
对于个人远程访问，**Tailscale** 在安全性和易用性之间提供了最佳平衡。对于生产环境中的团队访问，请考虑使用带访问控制的 **Cloudflare Tunnels**。
</Tip>
