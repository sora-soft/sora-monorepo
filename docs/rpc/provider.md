# 调用方 (Provider)

Provider 是 RPC 的客户端。它通过 Discovery 自动发现目标服务的端点，管理连接，并提供类型安全的 RPC 调用接口。

## 创建 Provider

Provider 是 RPC 的客户端。它通过 Discovery 自动发现目标服务的端点，管理连接，并提供类型安全的 RPC 调用接口。

sora 推荐使用 Provider 静态类进行全局管理，各个服务按需加载不同 Provider：

```typescript
class Pvd {
  static registerSenders() {
    TCPConnector.register();
    WebSocketConnector.register();
  }

  static business = new Provider<BusinessHandler>(ServiceName.Business);
}

export {Pvd};
```

## 注册和使用

Provider 需要在 Service 中注册，通常在 `startup` 阶段调用 `registerProviders` 完成注册：

```typescript
class MyService extends Service {
  async startup() {
    await this.registerProviders([Pvd.business]);

    // 使用 Pvd.business 发送 rpc 请求
  }
}
```

## RPC 调用

### 请求/响应 — `provider.rpc()`

发送请求并等待响应。返回类型安全的 Proxy 对象：

```typescript
// 调用远程方法
const result = await userProvider.rpc().getUser({ id: '123' });

// 指定目标实例 ID
const result = await userProvider.rpc('service-instance-id').getUser({ id: '123' });
```

调用签名：`provider.rpc(targetId).methodName(body, options?, rawResponse?)`

| 参数 | 类型 | 说明 |
|------|------|------|
| `body` | `any` | 请求载荷 |
| `options` | `object` | 可选，超时等配置 |
| `rawResponse` | `boolean` | 可选，是否返回`Response`对象，默认为 false，由 Provider 自动解析，处理错误，并返回 Response.payload.result |

### 单向通知 — `provider.notify()`

发送通知，不等待响应：

```typescript
await userProvider.notify().syncData({ key: 'value' });

// 指定目标实例
await userProvider.notify('instance-id').syncData({ key: 'value' });
```

### 广播 — `provider.broadcast()`

向目标服务的所有连接实例发送通知：

```typescript
await userProvider.broadcast().reload({ module: 'config' });
```

广播仅在Provider连接策略允许时可用（`ProviderAllConnectStrategy` 默认支持）。

## 标签筛选 (LabelFilter)

Provider 通过 **LabelFilter** 对服务发现中的 Listener 进行筛选，只连接满足条件的端点。标签筛选发生在连接建立之前——Provider 订阅 Discovery 的 Listener 列表，先按服务名匹配，再按标签过滤，最后才创建连接。

```
  服务方                                Provider
  ────────                             ─────────

  Listener A                           new Provider('order', filter)
  labels: { env: 'prod', region: 'us' }    │
                                            │ 订阅 discovery.listenerSubject
  Listener B                                │
  labels: { env: 'staging', region: 'us' }  │
                                            ▼
  Listener C                           1. targetName == 'order'
  labels: { env: 'prod', region: 'eu' } 2. filter.isSatisfy(listener.labels)
                                            │
                                            ├── Listener A ✓  连接
                                            ├── Listener B ✗  跳过
                                            └── Listener C ✓  连接
```

### FilterOperator

LabelFilter 支持两种操作符：

| 操作符 | 含义 |
|--------|------|
| `FilterOperator.INCLUDE` | 标签值**必须**在指定列表中 |
| `FilterOperator.EXCLUDE` | 标签值**不能**在指定列表中 |

多条规则之间是 **AND** 关系——所有规则都满足才匹配。

### 创建 LabelFilter

```typescript
import { Provider, LabelFilter, FilterOperator } from '@sora-soft/framework';

const filter = new LabelFilter([
  // env 必须是 'prod'
  { label: 'env', operator: FilterOperator.INCLUDE, values: ['prod'] },
  // protocol 不能是 'ws'
  { label: 'protocol', operator: FilterOperator.EXCLUDE, values: ['ws'] },
]);
```

### 与 Provider 搭配

将 LabelFilter 传入 Provider 构造函数的第二个参数：

```typescript
class Pvd {
  static order = new Provider<OrderHandler>(
    ServiceName.Order,
    new LabelFilter([
      { label: 'env', operator: FilterOperator.INCLUDE, values: ['prod'] },
      { label: 'protocol', operator: FilterOperator.EXCLUDE, values: ['ws'] },
    ]),
  );
}
```

不传 LabelFilter 或传入空数组时，Provider 会连接目标服务的所有 Listener：

```typescript
// 等价：连接所有 Listener
new Provider<OrderHandler>(ServiceName.Order);
new Provider<OrderHandler>(ServiceName.Order, new LabelFilter([]));
```

### 与 Listener 标签配合

标签在 **Listener 构造时**定义。框架会自动合并 Service 级别和 Listener 级别的标签，并自动添加 `protocol` 标签：

```typescript
// 服务方：Service 级别标签
class OrderService extends Service {
  constructor() {
    super('order', { labels: { env: 'prod', region: 'us' } });
  }

  async startup() {
    // Listener 级别标签 + 自动添加 protocol: 'tcp'
    const listener = new TCPListener(
      { port: 4000, host: '0.0.0.0' },
      Route.callback(new OrderHandler()),
      [new JsonBufferCodec()],
      { tier: 'api' },  // Listener 级别标签
    );
    await this.installListener(listener);
  }
}
```

注册到 Discovery 的最终标签为：

```typescript
{
  env: 'prod',       // 来自 Service
  region: 'us',      // 来自 Service
  protocol: 'tcp',   // 框架自动添加
  tier: 'api',       // 来自 Listener
}
```

Provider 即可基于这些标签筛选：

```typescript
// 只连接生产环境的 TCP Listener
const filter = new LabelFilter([
  { label: 'env', operator: FilterOperator.INCLUDE, values: ['prod'] },
  { label: 'protocol', operator: FilterOperator.EXCLUDE, values: ['ws', 'http'] },
]);

new Provider<OrderHandler>(ServiceName.Order, filter);
```

### 常见筛选场景

**只连接特定区域：**

```typescript
new LabelFilter([
  { label: 'region', operator: FilterOperator.INCLUDE, values: ['us-east'] },
])
```

**排除 WebSocket 端点：**

```typescript
new LabelFilter([
  { label: 'protocol', operator: FilterOperator.EXCLUDE, values: ['ws'] },
])
```

**多条件组合：**

```typescript
new LabelFilter([
  { label: 'env', operator: FilterOperator.INCLUDE, values: ['prod'] },
  { label: 'region', operator: FilterOperator.INCLUDE, values: ['us-east', 'us-west'] },
  { label: 'tier', operator: FilterOperator.EXCLUDE, values: ['internal'] },
])
```

## 路由策略

Provider 通过连接策略（`ProviderStrategy`）决定需要连接目标服务的哪些 Listener。sora 框架默认使用 `ProviderAllConnectStrategy`，连接所有符合条件的 Listener，并按 Listener 权重进行负载均衡请求。

用户可以按需实现以下方法，自定义连接策略以实现不同的负载均衡等功能：

- `selectListener()` — 选择连接哪些 Listener
- `selectSender()` — 实际发送 RPC 请求包时发送给哪个 Listener

使用方法：

```typescript
class MyProviderStrategy extends ProviderStrategy {
  init() {}

  async selectListener(provider: Provider, listeners: IListenerMetaData[]) {
    // 筛选需要连接的 listener
    return selectedListeners;
  }

  async selectSender(provider: Provider, senders: RPCSender[], toId?: string) {
    // 选择一个 sender 并返回
    return sender;
  }

  isBroadcastEnabled() {
    return true;
  }
}

class Provider {
  static myService = new Provider<MyServiceHandler>(ServiceName.MyService, undefined, new MyProviderStrategy())
}
```

