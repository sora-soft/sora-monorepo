# 核心概念

sora 框架围绕一套清晰的抽象层级构建。理解这些核心概念是使用框架的基础。

## 层级关系

```
┌─────────────────────────────────────────────────┐
│                   Runtime                        │
│                 (全局单例)                        │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │                  Node                     │   │
│  │            (进程根服务)                    │   │
│  │                                          │   │
│  │  ┌────────────┐  ┌────────────┐          │   │
│  │  │  Service A  │  │  Service B  │          │   │
│  │  │ (RPC 服务)  │  │ (RPC 服务)  │          │   │
│  │  │             │  │             │          │   │
│  │  │ Listeners   │  │ Listeners   │          │   │
│  │  │ Providers   │  │ Providers   │          │   │
│  │  │ Components  │  │ Components  │          │   │
│  │  └────────────┘  └────────────┘          │   │
│  │                                          │   │
│  │  ┌────────────┐  ┌────────────┐          │   │
│  │  │  Worker A   │  │  Worker B   │          │   │
│  │  │ (工作单元)  │  │ (工作单元)  │          │   │
│  │  │             │  │             │          │   │
│  │  │ Providers   │  │ Components  │          │   │
│  │  │ Components  │  │             │          │   │
│  │  └────────────┘  └────────────┘          │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  Component Registry (全局组件注册表)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │  Redis   │ │ Database │ │   etcd   │        │
│  └──────────┘ └──────────┘ └──────────┘        │
│                                                  │
│  Discovery (服务发现后端)                         │
│  ProviderManager (RPC 调用管理)                   │
└─────────────────────────────────────────────────┘
```

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
const redis = Runtime.getComponent<RedisComponent>('redis');
```

## Node

**Node** 继承自 `Service`，代表进程本身。它是所有 Service 和 Worker 的容器。

核心职责：
- 作为进程的根服务
- 注册 Service 和 Worker 的工厂函数
- 通过 `serviceFactory()` / `workerFactory()` 动态创建实例

```typescript
// 注册工厂
Node.registerService('user-service', (options) => new UserService('user-service', options));
Node.registerWorker('sync-worker', (options) => new SyncWorker('sync-worker', options));

// 动态创建
const service = Node.serviceFactory('user-service', config);
await Runtime.installService(service);
```

## Service

**Service** 继承自 `Worker`，是可接收 RPC 调用的服务单元。它与 Worker 的核心区别是拥有 **Listener 池**，可以监听外部请求。

核心职责：
- 安装和管理 Listener（TCP、HTTP、WebSocket）
- 向 Discovery 注册端点信息
- 处理 RPC 请求

```typescript
import { Service } from '@sora-soft/framework';

class UserService extends Service {
  protected async startup(): Promise<void> {
    const handler = new UserHandler();
    const listener = new TCPListener(
      { host: '0.0.0.0', port: 4000 },
      Route.callback(handler),
      [Codec.get('json')],
    );
    await this.installListener(listener);
  }

  protected async shutdown(reason: string): Promise<void> {
    // 清理资源
  }
}
```

## Worker

**Worker** 是通用的工作单元基类。它不监听 RPC 请求，适合执行后台任务、定时任务等。

核心职责：
- 管理生命周期（startup / shutdown）
- 连接和管理 Component
- 注册和管理 Provider
- 通过 `doJob()` 和 `doJobInterval()` 执行异步任务

```typescript
import { Worker } from '@sora-soft/framework';

class SyncWorker extends Worker {
  protected async startup(): Promise<void> {
    // 连接组件
    await this.connectComponent(Runtime.getComponent('database'));

    // 注册 Provider 调用其他服务
    await this.registerProvider(userProvider);

    // 定时任务
    await this.doJobInterval(async () => {
      // 执行同步逻辑
    }, 60_000);
  }

  protected async shutdown(reason: string): Promise<void> {
    // 清理资源
  }
}
```

## Component

**Component** 是可插拔的外部依赖抽象（如 Redis、Database、etcd）。组件通过引用计数管理生命周期，多个 Worker 可以安全地共享同一个组件。

生命周期：
1. `loadOptions(options)` — 加载配置
2. `start()` — 连接（引用计数 +1，首次连接时实际执行 `connect()`）
3. `stop()` — 断开（引用计数 -1，最后一次断开时实际执行 `disconnect()`）

```typescript
// 1. 创建并注册组件
const redis = new RedisComponent();
redis.loadOptions({ url: 'redis://localhost:6379', database: 0 });
Runtime.registerComponent('redis', redis);

// 2. 在 Worker 中连接（自动引用计数）
await this.connectComponent(Runtime.getComponent('redis'));

// 3. 使用组件
const client = Runtime.getComponent<RedisComponent>('redis').client;
await client.set('key', 'value');
```

## SingletonService / SingletonWorker

框架提供 **SingletonService** 和 **SingletonWorker** 用于在集群中保证只有一个实例运行。它们通过 **Election**（选举）机制实现。

```typescript
import { SingletonService } from '@sora-soft/framework';

class SchedulerService extends SingletonService {
  protected async startup(): Promise<void> {
    // 只有赢得选举的实例才会执行到这里
  }

  protected async shutdown(reason: string): Promise<void> {}
}
```

## Discovery

**Discovery** 是服务发现的抽象层，管理节点、服务、Worker 和端点的元数据注册与查询。框架提供两种实现：

| 实现 | 适用场景 | 依赖 |
|------|----------|------|
| **RamDiscovery** | 单进程开发/测试 | 无 |
| **ETCDDiscovery** | 生产集群 | etcd 服务 |

```typescript
import { RamDiscovery } from '@sora-soft/ram-discovery';

const discovery = new RamDiscovery();
await Runtime.startup(node, discovery);
```

## Provider

**Provider** 是 RPC 调用方，用于向远程服务发起调用。它通过 Discovery 自动发现目标服务的端点，建立连接并路由请求。

```typescript
const userProvider = new Provider('user-service');

// 请求/响应
const result = await userProvider.rpc().getUser({ id: '123' });

// 单向通知
await userProvider.notify().syncData({ key: 'value' });

// 广播（发送给所有实例）
await userProvider.broadcast().reload({ module: 'config' });
```

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

详见 [服务生命周期](/guide/service-lifecycle)。
