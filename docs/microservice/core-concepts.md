# 核心概念

sora 框架围绕一套清晰的抽象层级构建。理解这些核心概念是使用框架的基础。

## 层级关系

```
┌─────────────────────────────────────────────────┐
│                   Runtime                       │
│                   (全局单例)                    │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   Node   │  │Service A │  │Service B │       │
│  │(根服务)  │  │(RPC 服务)│  │(RPC 服务)│       │
│  │          │  │          │  │          │       │
│  │Providers │  │Listeners │  │Listeners │       │
│  │Components│  │Providers │  │Providers │       │
│  │          │  │Components│  │Components│       │
│  └──────────┘  └──────────┘  └──────────┘       │
│                                                 │
│  ┌──────────┐  ┌──────────┐                     │
│  │ Worker A │  │ Worker B │                     │
│  │(工作单元)│  │(工作单元)│                     │
│  │          │  │          │                     │
│  │Providers │  │Components│                     │
│  │Components│  │          │                     │
│  └──────────┘  └──────────┘                     │
│                                                 │
│  Component Registry (全局组件注册表)            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │  Redis   │ │ Database │ │   etcd   │        │
│  └──────────┘ └──────────┘ └──────────┘        │
│                                                 │
│  Discovery (服务发现后端)                       │
│  ProviderManager (RPC 调用管理)                 │
└─────────────────────────────────────────────────┘
```

## Application

**Application** 是模板项目中的全局单例管理类，封装了 Runtime 初始化、组件注册、服务发现配置等启动流程。它提供了三种启动模式：

| 模式 | 方法 | 说明 |
|------|------|------|
| **Container** | `Application.startContainer()` | 只初始化 Runtime 和 Component，不启动任何 Service / Worker。适合运维平台统一管理服务的启停 |
| **Server** | `Application.startServer()` | 读取配置文件中的 services 和 workers 字段，启动所有对应的 Service 和 Worker。适合调试或单进程部署 |
| **Command** | `Application.startCommand()` | 只启动指定的 Worker，执行完 `runCommand()` 后自动退出进程。适合执行一次性命令行任务 |

```typescript
class Application {
  static async startContainer(options: IApplicationOptions) { /* ... */ }
  static async startServer(options: IApplicationOptions) { /* ... */ }
  static async startCommand(options: IApplicationOptions, name: string, args: string[]) { /* ... */ }
}
```

```typescript
// Container 模式 — 仅初始化组件，服务由运维平台按需启动
await Application.startContainer(config);

// Server 模式 — 读取配置启动所有服务
await Application.startServer(config);

// Command 模式 — 执行一次性任务后退出
await Application.startCommand(config, 'migrate-command', ['sync']);
```

> **提示：** Application 是 sora 模板项目推荐的项目启动模式，但不是框架强制规定的。它本质上是对 Runtime、Node、Discovery 等基础设施的封装，开发者完全可以根据自身需求修改或自行编写启动逻辑。

## Runtime

**Runtime** 是框架的全局运行时管理器，一个静态类，管理整个进程的生命周期。

核心职责：
- **启动与关闭**：`Runtime.startup()` 初始化进程，`Runtime.shutdown()` 优雅停止
- **服务管理**：安装和卸载 Service、Worker
- **组件注册表**：全局注册和获取 Component
- **进程信号处理**：自动捕获 SIGINT/SIGTERM，触发优雅关闭

```typescript
import { Runtime } from '@sora-soft/framework';

// 注册组件
Runtime.registerComponent('redis', redisComponent);

// 加载配置
await Runtime.loadConfig({ scope: 'my-app' });

// 启动运行时
await Runtime.startup(node, discovery);

// 获取组件
const redis = Com.redis;
```

## Node

**Node** 继承自 `Service`，代表进程本身。它作为进程的根服务，承载所有 Service 和 Worker 的管理职责。

核心职责：
- 注册 Service 和 Worker 的工厂函数
- 通过 `serviceFactory()` / `workerFactory()` 动态创建实例
- 承载 Node 的 Listener，提供远程管理接口

### 创建 Node

Node 的 Listener 需要在**外部创建**，通过构造函数传入。框架提供了 `NodeHandler` 作为默认的 Route 处理器，暴露了进程管理的 RPC 接口：

```typescript
import { Node, NodeHandler, TCPListener, JsonBufferCodec, Route } from '@sora-soft/framework';

// 使用 NodeHandler 作为 Route，提供远程管理接口
const tcpListener = new TCPListener(
  { host: '0.0.0.0', port: 4000 },
  Route.callback(new NodeHandler(node)),
  [new JsonBufferCodec()],
);

const node = new Node(options.node, [tcpListener]);
await Runtime.startup(node, discovery);
```

### NodeHandler 接口

`NodeHandler` 提供以下 RPC 方法，供运维平台远程调用：

| 方法 | 参数 | 说明 |
|------|------|------|
| `createService` | `{ name, options }` | 动态创建并安装 Service |
| `removeService` | `{ id, reason }` | 卸载指定 Service |
| `createWorker` | `{ name, options }` | 动态创建并安装 Worker |
| `removeWorker` | `{ id, reason }` | 卸载指定 Worker |
| `shutdown` | — | 关闭整个进程 |
| `fetchRunningData` | — | 获取当前进程的运行数据（providers、components、node 状态等） |

> **提示：** `NodeHandler` 是框架提供的默认实现。如果需要自定义管理接口（如添加健康检查、配置热更新等），可以继承 `Route` 编写自己的 Handler。

## 它们如何协作

一个典型的 sora 进程启动流程：

```
1. 注册组件     → Runtime.registerComponent()
2. 加载配置     → Runtime.loadConfig()
3. 创建 Discovery → new RamDiscovery() / new ETCDDiscovery()
4. 创建 Node    → new Node(options, listeners)
5. 启动运行时   → Runtime.startup(node, discovery)
6. 注册工厂     → Node.registerService() / Node.registerWorker()
7. 注册传输协议 → TCPConnector.register() / HTTPConnector.register()
8. 创建并安装   → Node.serviceFactory() → Runtime.installService()
```

详见 [生命周期](/microservice/service-lifecycle)。
