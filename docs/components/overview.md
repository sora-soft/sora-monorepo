# 组件系统

Component 是 sora 框架的可插拔依赖抽象。它封装外部服务（Redis、Database、etcd 等）的连接和生命周期管理。

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

## 注册/连接/使用三步流程

### 第一步：创建并注册到 Runtime

```typescript
const redis = new RedisComponent();
redis.loadOptions({ url: 'redis://localhost:6379', database: 0 });
Runtime.registerComponent('redis', redis);
```

`Runtime.registerComponent()` 将组件存入全局注册表，此时组件尚未连接。

### 第二步：在 Worker/Service 中连接

```typescript
class MyService extends Service {
  protected async startup(): Promise<void> {
    await this.connectComponent(Com.redis);
  }
}
```

`connectComponent()` 调用 `component.start()`，组件引用计数 +1。首次 start 时实际执行 `connect()`。

### 第三步：使用组件

```typescript
const redis = Com.redis;
await redis.client.set('key', 'value');
```

## 引用计数机制

组件使用 `LifeRef` 实现引用计数，确保多 Worker 安全共享：

```
              引用计数    组件状态
注册组件         0        未连接
Worker A 连接    0 → 1    执行 connect()
Worker B 连接    1 → 2    不重复连接（已连接）
Worker A 断开    2 → 1    不断开（还有引用）
Worker B 断开    1 → 0    执行 disconnect()
```

当 `Runtime.shutdown()` 关闭 Worker 和 Service 时，会自动断开它们连接的组件。最后一个 Worker 断开后，组件才真正关闭。

## 自定义组件

实现自定义组件需要继承 `Component` 并实现抽象方法：

```typescript
import { Component, IComponentOptions } from '@sora-soft/framework';
import { guard } from '@sora-soft/typia-decorator';

interface IMyComponentOptions extends IComponentOptions {
  url: string;
  timeout: number;
}

class MyComponent extends Component {
  private client_: MyClient | null = null;

  @guard
  protected setOptions(options: IMyComponentOptions): void {
    this.options_ = options;
  }

  protected async connect(): Promise<void> {
    this.client_ = new MyClient(this.options_.url, { timeout: this.options_.timeout });
    await this.client_.connect();
  }

  protected async disconnect(): Promise<void> {
    if (this.client_) {
      await this.client_.close();
      this.client_ = null;
    }
  }

  get version(): string {
    return '1.0.0';
  }

  get client(): MyClient {
    return this.client_!;
  }
}
```

注意 `setOptions` 使用了 `@guard` 装饰器，编译时 typia 会自动生成参数校验代码。

## 组件元数据

每个组件提供元数据用于运行时检查：

```typescript
interface IComponentMetaData {
  name: string;          // 注册名称
  ready: boolean;        // 是否已连接
  version: string;       // 组件版本
  options: IComponentOptions;  // 配置项
}

const meta = redis.meta;
// { name: 'redis', ready: true, version: '1.0.0', options: {...} }
```
