# @sora-soft/etcd-component

基于 etcd3 的 etcd 组件，封装了 etcd 客户端连接、Lease 管理、分布式锁和 Leader 选举等功能，作为 sora 框架的基础设施组件使用。

## 安装

```bash
sora add:component @sora-soft/etcd-component
```

## 功能说明

- 封装 etcd3 客户端，提供统一的生命周期管理（`loadOptions` → `start` → `stop`）
- 内置 Lease 管理，支持自动续约和断线重连后重新注册
- 提供分布式锁（`lock`），基于 etcd 原生锁实现
- 提供 `persistPut` / `persistDel` 等持久化 KV 操作
- 提供 `EtcdElection` 用于基于 etcd 的 Leader 选举
- 支持可配置的 key 前缀，方便多环境隔离

## 使用方法

### 注册并启动组件

```typescript
import { EtcdComponent } from '@sora-soft/etcd-component';
import { Runtime } from '@sora-soft/framework';

const etcd = new EtcdComponent();
Runtime.registerComponent('etcd', etcd);
etcd.loadOptions({
  etcd: { hosts: 'http://127.0.0.1:2379' },
  ttl: 30,
  prefix: '/myapp',
});
await etcd.start();
```

### KV 操作

```typescript
await etcd.persistPut('/config/key', 'value');
const value = await etcd.client.get('/myapp/config/key').string();
await etcd.persistDel('/config/key');
```

### 使用 Key 前缀

```typescript
const fullKey = etcd.keys('config', 'database', 'host');
// 结果: /myapp/config/database/host
```

### 分布式锁

```typescript
await etcd.lock('my-lock', async (lock) => {
  // 临界区操作
}, 5000);
```

### Leader 选举

```typescript
import { EtcdElection } from '@sora-soft/etcd-component';

const election = new EtcdElection(etcd);
await election.campaign('node-1');
const isLeader = election.leader();
election.observer().subscribe((leader) => {
  console.log('当前 Leader:', leader);
});
```
