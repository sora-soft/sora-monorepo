# 调用方 (Provider)

Provider 是 RPC 的客户端。它通过 Discovery 自动发现目标服务的端点，管理连接，并提供类型安全的 RPC 调用接口。

## 创建 Provider

```typescript
import { Provider, LabelFilter } from '@sora-soft/framework';

// 基本创建
const userProvider = new Provider('user-service');

// 使用标签过滤
const filteredProvider = new Provider(
  'user-service',
  LabelFilter.include({ region: 'cn-east' }),
);

// 使用自定义策略
const provider = new Provider(
  'user-service',
  undefined,
  new ProviderAllConnectStrategy(),
);
```

### 构造参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `name` | `string` | 目标服务名称 |
| `filter` | `LabelFilter` | 可选，标签过滤器 |
| `strategy` | `ProviderStrategy` | 可选，连接和路由策略 |
| `manager` | `ProviderManager` | 可选，Provider 管理器 |
| `callback` | `ListenerCallback` | 可选，回调函数 |

## 注册和使用

Provider 需要在 Worker 中注册：

```typescript
class MyWorker extends Worker {
  protected async startup(): Promise<void> {
    const userProvider = new Provider('user-service');
    await this.registerProvider(userProvider);

    // 现在 userProvider 已启动，会自动监听 Discovery 中的服务变化
  }
}
```

注册后 Provider 会：
1. 订阅 Discovery 的 `listenerSubject`，监听目标服务的端点变化
2. 根据策略创建 `RPCSender` 连接到匹配的端点
3. 端点上下线时自动创建或移除连接

## RPC 调用

### 请求/响应 — `provider.rpc()`

发送请求并等待响应。返回类型安全的 Proxy 对象：

```typescript
// 调用远程方法
const result = await userProvider.rpc().getUser({ id: '123' });

// 指定目标实例 ID
const result = await userProvider.rpc('service-instance-id').getUser({ id: '123' });
```

`provider.rpc()` 返回一个 Proxy，属性访问会被拦截为 RPC 方法调用。方法名即 Route 中注册的方法名。

调用签名：`proxy.methodName(body, options?, rawResponse?)`

| 参数 | 类型 | 说明 |
|------|------|------|
| `body` | `any` | 请求载荷 |
| `options` | `object` | 可选，超时等配置 |
| `rawResponse` | `boolean` | 可选，是否返回完整响应对象 |

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

广播仅在策略允许时可用（`ProviderAllConnectStrategy` 默认支持）。

## 标签过滤

通过 `LabelFilter` 选择目标服务的特定实例：

```typescript
import { LabelFilter } from '@sora-soft/framework';

// 包含特定标签的实例
const filter = LabelFilter.include({ region: 'cn-east', tier: 'premium' });

// 排除特定标签的实例
const filter = LabelFilter.exclude({ env: 'test' });

// 组合使用
const filter = LabelFilter.include({ region: 'cn-east' }).exclude({ tier: 'free' });
```

标签在 Service 的 `IServiceOptions.labels` 中配置，并在注册到 Discovery 时携带。

## 路由策略

`ProviderStrategy` 决定了如何选择 Listener 和 Sender：

### ProviderAllConnectStrategy（默认）

连接所有匹配的 Listener，按权重选择 Sender 发送请求。

```typescript
import { ProviderAllConnectStrategy } from '@sora-soft/framework';

const provider = new Provider('user-service', undefined, new ProviderAllConnectStrategy());
```

行为：
- `selectListener()` — 连接所有标签匹配的端点
- `selectSender()` — 按权重随机选择可用的 Sender
- `isBroadcastEnabled()` — 返回 `true`

## Sender 状态

每个 `RPCSender` 管理一个到远程端点的连接：

```
Idle ──▶ Connecting ──▶ Ready
                              │
                              ├──▶ NotAvailable (连接失败)
                              │
                              └──▶ (重连) ──▶ Connecting ──▶ Ready
```

Provider 自动处理 Sender 的连接和重连。当 Sender 状态变为不可用时，会自动从可用列表中移除，并在端点重新可用时重连。

## 分布式追踪

RPC 调用自动注入 W3C `traceparent` 头，实现跨服务的分布式追踪：

```
调用方                                  服务方
  │                                       │
  │  Request + traceparent header         │
  │  ──────────────────────────────────▶  │
  │                                       │  解析 traceparent
  │                                       │  创建子 Span
  │  Response                             │
  │  ◀──────────────────────────────────  │
```

无需手动配置，框架自动传播追踪上下文。
