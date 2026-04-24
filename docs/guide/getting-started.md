# 快速开始

本指南帮助你使用 `sora` CLI 快速创建一个基于 HTTP 的微服务项目，并编写第一个 RPC 处理器。

## 前置条件

- Node.js >= 22.0.0
- pnpm

## 安装 CLI

```bash
npm install -g @sora-soft/cli
```

安装完成后，你可以通过 `sora` 命令使用 CLI 工具。

## 创建项目

```bash
sora new my-first-service
```

CLI 会交互式地让你选择项目模板。sora 提供以下模板：

- **http-server-template** — 单进程 HTTP 服务，适合独立 API 服务
- **base-cluster-template** — 集群模板，包含网关和业务服务，使用 etcd 服务发现
- **account-cluster-template** — 完整账户系统集群模板

选择 **http-server-template** 进行快速体验。

创建完成后进入项目目录并安装依赖：

```bash
cd my-first-service
pnpm install
```

## 项目结构

```
src/
├── index.ts                 # 入口文件
├── app/
│   ├── Application.ts       # 应用启动编排
│   ├── AppLogger.ts         # 日志配置
│   ├── AppError.ts          # 应用错误定义
│   ├── ErrorCode.ts         # 错误码
│   ├── handler/             # RPC 处理器
│   │   └── HttpHandler.ts
│   ├── service/             # 服务定义
│   │   ├── HttpService.ts
│   │   └── common/
│   │       ├── ServiceName.ts    # 服务名称枚举
│   │       └── ServiceRegister.ts # 服务注册
│   └── worker/              # Worker 定义
│       └── common/
│           ├── WorkerName.ts
│           └── WorkerRegister.ts
└── lib/
    ├── Com.ts               # 组件注册
    ├── Provider.ts          # Provider 注册
    └── ConfigLoader.ts      # 配置加载
```

## 编写第一个处理器

处理器（Handler）是 RPC 请求的入口。它继承自 `Route` 类，使用 `@Route.method` 装饰器注册方法。

编辑 `src/app/handler/HttpHandler.ts`：

```typescript
import { Route } from '@sora-soft/framework';

export class HttpHandler extends Route {
  @Route.method
  async hello(body: { name: string }): Promise<{ message: string }> {
    return { message: `Hello, ${body.name}!` };
  }
}
```

## 启动服务

```bash
pnpm start
```

服务启动后，HTTP 监听器会监听配置文件中指定的端口。

## 调用 RPC 方法

sora 的 HTTP 传输层将 URL 映射为 `{service}/{method}` 的格式。假设服务名称为 `http`：

```bash
curl -X POST http://localhost:3000/http/hello \
  -H "Content-Type: application/json" \
  -d '{"name": "sora"}'
```

响应：

```json
{ "result": { "message": "Hello, sora!" } }
```

## 下一步

- [核心概念](/guide/core-concepts) — 理解 Runtime、Node、Service、Worker、Component 的层级关系
- [服务生命周期](/guide/service-lifecycle) — 了解服务启动和关闭的完整时序
- [路由 (Route)](/rpc/route) — 深入了解 RPC 处理器的编写方式
