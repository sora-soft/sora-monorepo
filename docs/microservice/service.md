# Service

**Service** 继承自 `Worker`，是可接收 RPC 调用的服务单元。它与 Worker 的核心区别是拥有 **Listener 池**，可以监听外部请求。

核心职责：
- 安装和管理 Listener（TCP、HTTP、WebSocket）
- 向 Discovery 注册端点信息
- 处理 RPC 请求

## 创建 Service

继承 `Service` 类，实现 `startup()` 和 `shutdown()` 方法：

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

## 安装 Listener

通过 `installListener()` 将 Listener 注册到 Service，框架会自动：
- 将端点信息注册到 Discovery
- 监听 Listener 状态和权重变化
- 在 Service 停止时自动卸载所有 Listener

```typescript
const listener = new TCPListener(
  { host: '0.0.0.0', port: 4000 },
  Route.callback(handler),
  [new JsonBufferCodec()],
  { env: 'prod' },  // 可选 labels
);
await this.installListener(listener);
```

详见 [消息监听 (Listener)](/rpc/listener)。

## 注册到 Node

通过 `Node.registerService()` 注册工厂函数，后续可通过 `Node.serviceFactory()` 动态创建：

```typescript
Node.registerService('user-service', (options: IServiceOptions) => {
  return new UserService('user-service', options);
});

const service = Node.serviceFactory('user-service', config);
await Runtime.installService(service);
```

Service 继承自 `Worker`，因此也支持 [注册 Provider](/microservice/worker#注册-provider)、[连接组件](/microservice/worker#连接组件)、[注册到 Node](/microservice/worker#注册到-node) 等 Worker 提供的能力。
