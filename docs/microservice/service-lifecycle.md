# 生命周期

本文描述 Service 和 Worker 的状态流转、启动保证、错误行为和关闭顺序。

## 状态流转

所有 Service 和 Worker 共享相同的状态机：

```
Init ──▶ Pending ──▶ Ready ──▶ Stopping ──▶ Stopped
            │                      ▲
            │                      │
            └──▶ Error ───────────┘
```

| 状态 | 含义 |
|------|------|
| `Init` | 已创建，未启动 |
| `Pending` | `startup()` 正在执行 |
| `Ready` | 已就绪，可正常工作 |
| `Stopping` | 正在停止，`shutdown()` 和清理执行中 |
| `Stopped` | 已完全停止 |
| `Error` | 启动或运行期间发生错误 |

## startup() 能依赖什么

当你的 `startup()` 执行时，以下基础设施**已经就绪**：

- **Discovery** — 已连接，可以注册和发现服务
- **ProviderManager** — 已创建，Provider 可以正常工作
- **Node** — 已启动，Listeners 已安装
- **Component 注册表** — 组件已注册到 Runtime，可通过 `getComponent()` 获取

以下**需要你自己初始化**：

- **Component 连接** — 组件只是注册了，需要调用 `connectComponent()` 才会实际连接
- **Provider 注册** — 需要调用 `registerProvider()` 启动 RPC 调用方
- **Listener 安装** — Service 需要调用 `installListener()` 开始监听

## startup() 中可以做什么

`startup()` 是你完成初始化工作的地方。以下操作都可以安全地在 `startup()` 中调用：

| 操作 | 适用 | 说明 |
|------|------|------|
| `connectComponent()` | Service, Worker | 连接外部依赖（Redis、Database 等） |
| `registerProvider()` | Service, Worker | 注册 RPC 调用方，开始发现目标服务 |
| `installListener()` | Service | 安装 Listener，开始监听 RPC 请求 |
| `doJobInterval()` | Service, Worker | 启动定时任务，状态为 Ready 时才会执行 |

典型的 `startup()` 示例：

```typescript
protected async startup(): Promise<void> {
  await this.connectComponent(Com.redis);
  await this.registerProviders([Pvd.userService]);
  await this.installListener(listener);
}
```

## startup() 抛异常会怎样

如果 `startup()` 抛出异常：

1. Worker / Service 状态变为 **Error**
2. 异常向上抛出给调用方（`Runtime.installService()` / `Runtime.installWorker()`）

在 `Application.startServer()` 模式下，一个 Service 启动失败**不会影响**其他 Service 和 Worker 的启动——框架会捕获错误并继续安装后续服务。

## 关闭顺序

`Runtime.shutdown()` 的停止顺序：

```
Runtime.shutdown()
│
├── 1. Worker + Service（并行停止，跳过 Node）
│     └── 每个 worker/service.stop():
│           ├── State: Stopping
│           ├── 清除定时器
│           ├── executor.stop()         等待进行中的任务完成
│           ├── shutdown(reason)         用户清理代码
│           ├── 注销所有 Provider
│           └── 断开所有 Component
│           State: Stopped
│
├── 2. Node
│     └── 同 Service 停止流程
│
├── 3. discovery.disconnect()
│
└── 4. 等待 1s
```

关键保证：

- **Service 和 Worker 并行停止**，不保证先后顺序
- **Node 最后停止**，确保远程管理接口在整个关闭过程中可用
- **executor 会等待**进行中的 `doJob()` / `doJobInterval()` 任务完成后才继续关闭
- **Provider 自动注销**，远程服务不会再路由请求到本实例
- **Component 引用计数递减**，最后一个使用者断开时才实际释放连接

## 优雅关闭

框架在 `Runtime.startup()` 时自动注册进程信号处理：

- `SIGINT` / `SIGTERM` → 触发 `Runtime.shutdown()`
- `uncaughtException` / `unhandledRejection` → 记录日志（不会自动关闭）

`Runtime.shutdown()` 是幂等的——多次调用等价于一次调用，不会重复执行关闭流程。
