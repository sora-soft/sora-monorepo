# 服务发现

服务发现是 sora 框架中服务自动注册和发现的核心机制。它允许服务实例在启动时注册自己的信息，在关闭时自动注销，其他服务可以动态感知这些变化。

## 工作原理

```
┌──────────┐  注册   ┌──────────┐  订阅   ┌──────────┐
│ Service A │ ──────▶ │          │ ◀────── │ Provider  │
│ (端口4000) │        │Discovery │         │ (调用方)  │
└──────────┘         │          │         └──────────┘
                     │          │
┌──────────┐  注册   │          │  订阅   ┌──────────┐
│ Service B │ ──────▶ │          │ ◀────── │ Service C │
│ (端口5000) │        │          │         │ (同进程)  │
└──────────┘         └──────────┘         └──────────┘
```

Discovery 维护四类元数据：

| 类型 | 说明 | RxJS Subject |
|------|------|-------------|
| **Service** | 服务实例信息（名称、ID、标签） | `serviceSubject` |
| **Endpoint** | 端点信息（协议、地址、权重、标签） | `listenerSubject` |
| **Worker** | 工作单元信息 | `workerSubject` |
| **Node** | 节点信息（主机、PID、版本） | `nodeSubject` |

其他组件通过订阅这些 Subject 实时感知变化。例如 Provider 订阅 `listenerSubject`，当目标服务的新端点注册时自动创建连接，端点注销时自动断开。

## 可替换的底层实现

sora 框架**只定义了服务发现的抽象接口**，不负责具体实现。核心理念是通过规范化的接口，让开发者能够根据需求自由选择底层方案——etcd、Redis、Zookeeper 等都可以作为实现。切换时只需替换 Discovery 实例，业务代码无需任何改动。

典型的演进路径：

```
项目初期          单进程部署           RamDiscovery      无需外部依赖，开箱即用
    │
    ▼
项目成长          多进程集群           ETCDDiscovery     引入 etcd，跨进程发现
    │
    ▼
按需扩展          自定义实现           YourDiscovery     实现 Discovery 抽象类
```

切换过程几乎无缝——只需修改创建 Discovery 的那一行代码。

## 官方实现

### RamDiscovery

纯内存实现，所有元数据存储在进程内，仅限同进程内的服务互相发现。

```typescript
import { Runtime } from '@sora-soft/framework';
import { RamDiscovery } from '@sora-soft/ram-discovery';

const discovery = new RamDiscovery();
await Runtime.startup(node, discovery);
```

| 特性 | 说明 |
|------|------|
| 依赖 | 无 |
| 跨进程 | 不支持 |
| 持久化 | 无（进程退出即丢失） |
| 选举 | 简单先到先得 |
| 适用场景 | 单元测试、简单项目、本地开发 |

### ETCDDiscovery

基于 etcd 的分布式实现，支持跨进程服务发现和选举。

```typescript
import { Runtime } from '@sora-soft/framework';
import { ETCDDiscovery } from '@sora-soft/etcd-discovery';

// etcd 组件需要提前注册
Runtime.registerComponent('etcd', etcdComponent);

const discovery = new ETCDDiscovery({
  etcdComponentName: 'etcd',
  prefix: '/my-app/discovery',
});
await Runtime.startup(node, discovery);
```

| 特性 | 说明 |
|------|------|
| 依赖 | etcd 服务 |
| 跨进程 | 支持 |
| 持久化 | 基于 etcd Lease（进程退出后自动清理） |
| 实时感知 | 基于 etcd Watch |
| 选举 | 分布式选举 |
| 适用场景 | 生产集群、多进程部署 |

**配置项（`IETCDDiscoveryOptions`）：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `etcdComponentName` | `string` | EtcdComponent 在 Runtime 中的注册名称 |
| `prefix` | `string` | etcd 中的键前缀 |

**etcd 键结构：**

```
{prefix}/service/{serviceId}     → IServiceMetaData (JSON)
{prefix}/worker/{workerId}       → IWorkerMetaData (JSON)
{prefix}/endpoint/{endpointId}   → IListenerMetaData (JSON)
{prefix}/node/{nodeId}           → INodeMetaData (JSON)
```
