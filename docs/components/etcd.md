# etcd 组件

`@sora-soft/etcd-component` 封装了 etcd 客户端，提供持久化键值存储、分布式锁和选举功能。

## 安装

```bash
pnpm add @sora-soft/etcd-component
```

## 配置

```typescript
import { EtcdComponent } from '@sora-soft/etcd-component';

const etcd = new EtcdComponent();
etcd.loadOptions({
  etcd: {
    hosts: ['http://127.0.0.1:2379'],
  },
  ttl: 30,
  prefix: '/my-app',
});
Runtime.registerComponent('etcd', etcd);
```

**配置项（`IEtcdComponentOptions`）：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `etcd` | `IOptions` | 是 | etcd3 连接选项（hosts、auth 等） |
| `ttl` | `number` | 是 | Lease TTL（秒） |
| `prefix` | `string` | 是 | 键前缀 |

## 基本使用

### 连接

```typescript
await this.connectComponent(Runtime.getComponent('etcd'));
```

连接时组件会自动创建 Lease，所有键值操作默认绑定到 Lease 上。当组件断开连接时，Lease 下的所有键自动清理。

### etcd 客户端

直接访问底层 `etcd3` 客户端：

```typescript
const etcd = Runtime.getComponent<EtcdComponent>('etcd');

// 基本操作
await etcd.client.put('key', 'value');
const value = await etcd.client.get('key').string();
await etcd.client.delete().key('key');
```

### 持久化键值

`persistPut` 和 `persistDel` 操作绑定到组件的 Lease 上，连接断开时自动清理：

```typescript
const etcd = Runtime.getComponent<EtcdComponent>('etcd');

// 写入（绑定 Lease）
await etcd.persistPut('service-info', JSON.stringify({ host: '10.0.0.1', port: 4000 }));

// 删除
await etcd.persistDel('service-info');
```

### 键前缀

`keys()` 方法生成带前缀的完整键名：

```typescript
const etcd = Runtime.getComponent<EtcdComponent>('etcd');

const fullKey = etcd.keys('service-info');
// 返回 '/my-app/service-info'（prefix + '/' + key）
```

## Lease 管理

组件自动管理 Lease 生命周期：

```typescript
const etcd = Runtime.getComponent<EtcdComponent>('etcd');

// 获取当前 Lease
const lease = etcd.lease;

// 手动续约 Lease
await etcd.grantLease();
```

### 自动重连

当 etcd 连接断开时，组件会自动重连并重新创建 Lease。重连后，之前通过 `persistPut` 注册的键值会自动重新写入。事件通过 `emitter` 发布：

```typescript
etcd.emitter.on('lease-reconnect', () => {
  console.log('Lease reconnected, keys re-persisted');
});
```

## 分布式锁

基于 etcd 实现的分布式锁：

```typescript
const etcd = Runtime.getComponent<EtcdComponent>('etcd');

// 使用锁
const result = await etcd.lock(
  'order:123',                    // 锁的键
  async (lock) => {               // 在锁保护下执行的回调
    const order = await processOrder('123');
    return order;
  },
  10,                             // TTL（秒），可选
);

// 锁会在回调完成后自动释放
// 如果执行超过 TTL，锁会自动过期
```

## 选举

`EtcdElection` 实现了框架的 `Election` 抽象，通常通过 Discovery 间接使用：

```typescript
import { EtcdElection } from '@sora-soft/etcd-component';

const election = new EtcdElection(etcd.client, 'scheduler-election');

// 竞选 leader
await election.campaign('my-instance-id');

// 查询当前 leader
const leaderId = await election.leader();

// 观察领导权变化
election.observer().subscribe((id) => {
  console.log('Leader changed:', id);
});

// 退出
await election.resign();
```

通常使用 [SingletonService](/advanced/singleton) 封装，无需直接操作 Election。

## 导出

组件包同时导出底层库：

```typescript
import { EtcdComponent, EtcdElection, etcd3 } from '@sora-soft/etcd-component';

// etcd3 - re-exports etcd3
```
