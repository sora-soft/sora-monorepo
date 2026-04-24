# 服务发现

服务发现是 sora 框架中服务自动注册和发现的核心机制。它允许服务实例在启动时注册自己的信息，在关闭时自动注销，其他服务可以动态感知这些变化。

## 工作原理

```
┌──────────┐  注册   ┌──────────┐  watch  ┌──────────┐
│ Service A │ ──────▶ │          │ ◀────── │ Service B │
│ (端口4000) │        │Discovery │         │ (端口5000) │
└──────────┘         │          │         └──────────┘
                     │          │
┌──────────┐  注册   │          │  watch  ┌──────────┐
│ Worker C  │ ──────▶ │          │ ◀────── │ Provider  │
│ (后台任务) │        │          │         │ (调用方)   │
└──────────┘         └──────────┘         └──────────┘
```

Discovery 维护四类元数据：

| 类型 | 说明 | RxJS Subject |
|------|------|-------------|
| **Service** | 服务实例信息（名称、ID、标签） | `serviceSubject` |
| **Endpoint** | 端点信息（协议、地址、权重、标签） | `listenerSubject` |
| **Worker** | 工作单元信息 | `workerSubject` |
| **Node** | 节点信息（主机、PID、版本） | `nodeSubject` |

其他组件（如 Provider）通过订阅这些 Subject 实时感知服务变化。

## 实现对比

| 特性 | RamDiscovery | ETCDDiscovery |
|------|-------------|---------------|
| **存储** | 进程内存 | etcd 集群 |
| **持久化** | 无（进程退出即丢失） | 有（etcd 存储） |
| **跨进程** | 不支持 | 支持 |
| **服务发现** | 仅同进程内 | 跨进程/跨节点 |
| **选举** | 简单先到先得 | 基于 etcd 的分布式选举 |
| **实时感知** | 内存 Map，即时 | etcd Watch，准实时 |
| **依赖** | 无 | 需要 etcd 服务 |
| **适用场景** | 单进程开发、测试 | 生产集群 |

## RamDiscovery

纯内存实现，无需外部依赖。适合单进程场景。

```typescript
import { Runtime } from '@sora-soft/framework';
import { RamDiscovery } from '@sora-soft/ram-discovery';

const discovery = new RamDiscovery();
await Runtime.startup(node, discovery);
```

**特点：**
- 零配置，开箱即用
- 所有元数据存储在进程内存中
- 选举为简单的先到先得（第一个 `campaign()` 的成为 leader）
- 适合本地开发和单元测试

## ETCDDiscovery

基于 etcd 的分布式实现，支持跨进程服务发现和选举。

### 安装

```bash
pnpm add @sora-soft/etcd-discovery @sora-soft/etcd-component
```

### 配置

```typescript
import { Runtime } from '@sora-soft/framework';
import { EtcdComponent } from '@sora-soft/etcd-component';
import { ETCDDiscovery } from '@sora-soft/etcd-discovery';

// 1. 创建并注册 etcd 组件
const etcdComponent = new EtcdComponent();
etcdComponent.loadOptions({
  etcd: {
    hosts: ['http://127.0.0.1:2379'],
  },
  ttl: 30,
  prefix: '/my-app',
});
Runtime.registerComponent('etcd', etcdComponent);

// 2. 创建 etcd 服务发现
const discovery = new ETCDDiscovery({
  etcdComponentName: 'etcd',
  prefix: '/my-app/discovery',
});

// 3. 启动
await Runtime.startup(node, discovery);
```

**配置项（`IETCDDiscoveryOptions`）：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `etcdComponentName` | `string` | EtcdComponent 在 Runtime 中的注册名称 |
| `prefix` | `string` | etcd 中的键前缀 |

**特点：**
- 基于 etcd Lease 实现临时注册（进程退出后自动清理）
- 基于 etcd Watch 实现实时变更感知
- Lease 断连后自动重连并重新注册所有元数据
- 支持分布式选举

### etcd 键结构

```
{prefix}/service/{serviceId}     → IServiceMetaData (JSON)
{prefix}/worker/{workerId}       → IWorkerMetaData (JSON)
{prefix}/endpoint/{endpointId}   → IListenerMetaData (JSON)
{prefix}/node/{nodeId}           → INodeMetaData (JSON)
```

## 选举

Discovery 提供 `createElection()` 创建选举实例。选举用于 SingletonService 和 SingletonWorker。

```typescript
const election = discovery.createElection('scheduler');

// 竞选
await election.campaign('my-instance-id');

// 查询当前 leader
const leaderId = await election.leader();

// 观察领导权变化
election.observer().subscribe((leaderId) => {
  console.log('Current leader:', leaderId);
});

// 退出
await election.resign();
```

通常不直接使用 Election，而是通过 [SingletonService](/advanced/singleton) 间接使用。
