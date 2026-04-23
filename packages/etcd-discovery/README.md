# @sora-soft/etcd-discovery

基于 etcd 的 Sora 服务发现组件。通过 etcd watch 机制实时同步集群内的 Service、Worker、Endpoint 和 Node 元数据，支持选主（Election）。

## 安装

```bash
npm install @sora-soft/etcd-discovery
```

## 初始化

```typescript
import { Runtime } from '@sora-soft/framework';
import { EtcdComponent } from '@sora-soft/etcd-component';
import { ETCDDiscovery } from '@sora-soft/etcd-discovery';

const etcdComponent = new EtcdComponent({
  hosts: ['http://127.0.0.1:2379'],
});

Runtime.registerComponent(etcdComponent);

const discovery = new ETCDDiscovery({
  etcdComponentName: etcdComponent.name,
  prefix: '/sora/discovery',
});

await discovery.startup();
```
