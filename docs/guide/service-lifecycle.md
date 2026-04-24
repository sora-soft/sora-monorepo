# 服务生命周期

本文详细描述 sora 框架从启动到关闭的完整时序，以及各个阶段的状态流转。

## 状态机

Worker 和 Service 共享相同的基础状态流转：

```
Init ──▶ Pending ──▶ Ready ──▶ Stopping ──▶ Stopped
           │                      ▲
           │                      │
           └──▶ Error ────────────┘
```

| 状态 | 值 | 含义 |
|------|---|------|
| `Init` | 1 | 已创建，未启动 |
| `Pending` | 2 | 正在启动中 |
| `Ready` | 3 | 已就绪，可正常工作 |
| `Stopping` | 4 | 正在停止中 |
| `Stopped` | 5 | 已完全停止 |
| `Error` | 100 | 发生错误 |

## 启动时序

```
Application
│
├── 1. Com.register()                    注册组件到 Runtime
│       Runtime.registerComponent('redis', redis)
│       Runtime.registerComponent('database', db)
│
├── 2. Runtime.loadConfig(options)        加载运行时配置（设置 scope）
│
├── 3. new Discovery(...)                创建服务发现后端
│
├── 4. new Node(options, listeners)       创建进程根节点
│
├── 5. Runtime.startup(node, discovery)   启动运行时
│       │
│       ├── 5a. 注册 SIGINT/SIGTERM 处理器
│       │
│       ├── 5b. discovery.connect()       连接服务发现后端
│       │
│       ├── 5c. new ProviderManager(discovery)  创建 Provider 管理器
│       │
│       ├── 5d. Runtime.installService(node)    安装 Node 作为根服务
│       │       │
│       │       ├── discovery.registerService(node.metaData)
│       │       │
│       │       └── node.start()
│       │           ├── State: Init → Pending
│       │           ├── node.startup()           安装所有 Listeners
│       │           │   ├── listener.startListen()
│       │           │   ├── service.registerEndpoint(listener)
│       │           │   └── discovery.registerEndpoint(...)
│       │           └── State: Pending → Ready
│       │
│       └── 5e. discovery.registerNode(...)     注册节点元数据
│
├── 6. ServiceRegister.init()             注册 Service 工厂函数
│       Node.registerService('http', (opts) => new HttpService('http', opts))
│
├── 7. WorkerRegister.init()              注册 Worker 工厂函数
│       Node.registerWorker('sync', (opts) => new SyncWorker('sync', opts))
│
├── 8. Pvd.registerSenders()              注册传输协议 Connector 工厂
│       TCPConnector.register()
│       WebSocketConnector.register()
│
└── 9. 创建并安装 Service/Worker
        for each service in config.services:
          service = Node.serviceFactory(name, config)
          Runtime.installService(service)
            ├── State: Init → Pending
            ├── service.startup()           用户代码：创建 Handler、安装 Listener
            ├── State: Pending → Ready
            └── discovery.registerService(metaData)

        for each worker in config.workers:
          worker = Node.workerFactory(name, config)
          Runtime.installWorker(worker)
            ├── State: Init → Pending
            ├── worker.startup()            用户代码：连接组件、注册 Provider
            └── State: Pending → Ready
```

## Service.startup() 内部流程

当用户实现 `startup()` 方法时，通常会：

```typescript
protected async startup(): Promise<void> {
  // 1. 创建 Route 处理器
  const handler = new MyHandler();

  // 2. 创建 Listener（可以有多个）
  const httpListener = new HTTPListener(
    { host: '0.0.0.0', port: 3000 },
    koaApp,
    Route.callback(handler),
  );

  // 3. 安装 Listener
  await this.installListener(httpListener);

  // 4. 连接组件
  await this.connectComponent(Runtime.getComponent('redis'));
}
```

`installListener()` 做了什么：
1. 调用 `listener.startListen()` 开始监听端口
2. 订阅 Listener 的 weight 和 state 变化
3. 调用 `discovery.registerEndpoint()` 注册端点到发现服务

## Worker.start() 内部流程

```
worker.start()
├── State: Init → Pending
├── 启动 executor
├── worker.startup()                   ← 用户实现
│   ├── connectComponent(...)
│   ├── registerProvider(...)
│   └── doJobInterval(...)
├── State: Pending → Ready
```

## 关闭时序

`Runtime.shutdown()` 按以下顺序停止所有组件：

```
Runtime.shutdown()
│
├── 1. 停止所有 Worker（逆序）
│       for each worker:
│         worker.stop(reason)
│           ├── State: Stopping
│           ├── 清除定时器
│           ├── executor.stop()         等待所有进行中的任务完成
│           ├── worker.shutdown(reason)  ← 用户清理代码
│           ├── 注销所有 Provider
│           └── 断开所有 Component（引用计数 -1）
│           State: Stopped
│
├── 2. 停止所有 Service（逆序，跳过 Node）
│       for each service:
│         service.stop(reason)
│           ├── State: Stopping
│           ├── 卸载所有 Listener
│           │   ├── listener.stopListen()
│           │   └── discovery.unregisterEndpoint(id)
│           ├── executor.stop()
│           ├── service.shutdown(reason) ← 用户清理代码
│           ├── 注销所有 Provider
│           └── 断开所有 Component
│           State: Stopped
│
├── 3. 停止 Node（根服务）
│       node.stop(reason)
│         └── 同 Service 停止流程
│
├── 4. discovery.disconnect()           断开服务发现连接
│
└── 5. 等待 1 秒                         确保所有资源释放
```

## 组件引用计数

组件使用引用计数机制，`start()` 和 `stop()` 可以安全地被多次调用：

```
                    引用计数
Component.start()      0 → 1    实际执行 connect()
Component.start()      1 → 2    不重复连接
Component.stop()       2 → 1    不断开
Component.stop()       1 → 0    实际执行 disconnect()
```

这确保了多个 Worker 共享同一个组件时，组件在所有 Worker 停止后才会断开连接。

## 优雅关闭

框架在 `Runtime.startup()` 时自动注册进程信号处理：

```typescript
process.on('SIGINT', () => Runtime.shutdown());
process.on('SIGTERM', () => Runtime.shutdown());
```

`Runtime.shutdown()` 的停止顺序保证了：
1. 先停止业务 Worker（不再接受新任务，等待进行中的任务完成）
2. 再停止 Service（不再接受新请求，等待进行中的请求完成）
3. 最后停止 Node 和 Discovery
