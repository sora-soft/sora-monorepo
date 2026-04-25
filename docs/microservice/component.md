# 组件系统

Component 是 sora 框架的可插拔依赖抽象。它封装外部服务（Redis、Database、etcd 等）的连接和生命周期管理，通过引用计数机制安全地支持多 Worker 共享。

## 核心抽象

```
                    Component (抽象类)
                    ┌────────────────────┐
                    │ loadOptions()      │  加载配置
                    │ start()            │  启动（引用计数 +1）
                    │ stop()             │  停止（引用计数 -1）
                    │                    │
                    │ abstract:          │
                    │   setOptions()     │  解析配置
                    │   connect()        │  建立连接
                    │   disconnect()     │  断开连接
                    │   get version      │  组件版本
                    └────────────────────┘
```

## 使用流程

### 第一步：安装组件

使用 CLI 指令安装组件包，自动完成依赖引入、注册代码和配置文件的添加：

```bash
sora add:component @sora-soft/redis-component
```

指令会交互式询问组件名称（默认 `redis`），然后自动：
- 引入依赖包
- 在 `Com.ts` 中添加 import、枚举、静态属性和 `registerComponent()` 调用
- 在配置文件模板中添加对应的配置字段

对于 `database-component`，还会额外创建数据库迁移 Command Worker 和相关的 npm scripts。

### 第二步：在 Worker/Service 中连接

在 `startup()` 中通过 `connectComponent()` 连接组件：

```typescript
class MyService extends Service {
  protected async startup(): Promise<void> {
    await this.connectComponent(Com.redis);
  }
}
```

### 第三步：使用组件

直接通过 `Com` 访问组件实例：

```typescript
const redis = Com.redis;
await redis.client.set('key', 'value');
```

## 生命周期

组件通过引用计数决定何时实际建立和断开连接：

```
               引用计数    组件状态
注册到 Com        0        未连接
Worker A 连接     0 → 1    执行 connect()
Worker B 连接     1 → 2    不重复连接（已连接）
Worker A 断开     2 → 1    不断开（Worker B 还在用）
Worker B 断开     1 → 0    执行 disconnect()
```

- **`connectComponent()`**：引用计数 +1，首次（0→1）时执行 `connect()`
- **`disconnectComponent()`**：引用计数 -1，最后一次（1→0）时执行 `disconnect()`

当 `Runtime.shutdown()` 关闭 Worker 和 Service 时，会自动断开它们连接的组件。最后一个使用者断开后，组件才真正关闭。

## 官方组件

| 包名 | 说明 |
|------|------|
| `@sora-soft/redis-component` | Redis 客户端，支持分布式锁（Redlock） |
| `@sora-soft/database-component` | 数据库组件，基于 TypeORM，支持 MySQL |
| `@sora-soft/etcd-component` | etcd 客户端，支持持久化键值、分布式锁和 Lease 管理 |
