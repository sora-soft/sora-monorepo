# Singleton

框架提供 **SingletonService** 和 **SingletonWorker** 用于在集群中保证只有一个实例运行。它们通过 **Election**（选举）机制实现。

当集群中存在多个同名 SingletonService（或 SingletonWorker）实例时，仅有一个实例能赢得选举进入 **Ready** 状态，其余实例将保持在 **Pending** 状态。若 Ready 实例因故障或主动退出而释放领导权，Pending 实例会自动参与新一轮选举并接管服务，从而实现高可用故障转移。

## SingletonService

用于需要唯一实例的 RPC 服务：

```typescript
import { SingletonService } from '@sora-soft/framework';

class SchedulerService extends SingletonService {
  protected async startup(): Promise<void> {
    // 只有赢得选举的实例才会执行到这里
  }

  protected async shutdown(reason: string): Promise<void> {}
}
```

## SingletonWorker

用于需要唯一实例的后台任务：

```typescript
import { SingletonWorker, NodeTime } from '@sora-soft/framework';

class DataSyncWorker extends SingletonWorker {
  protected async startup(): Promise<void> {
    await this.doJobInterval(async () => {
      // 只有赢得选举的实例执行定时任务
    }, NodeTime.minute(1));
  }

  protected async shutdown(reason: string): Promise<void> {}
}
```

## Election 机制

SingletonService 和 SingletonWorker 的底层实现基于 Discovery 提供的 **Election**（选举）机制。

### 工作原理

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│    实例 A         │     │    实例 B         │     │    实例 C         │
│                  │     │                  │     │                  │
│  campaign()      │     │  campaign()      │     │  campaign()      │
│     │            │     │     │            │     │     │            │
│     ▼            │     │     ▼            │     │     ▼            │
│  ★ Leader        │     │  Pending         │     │  Pending         │
│  startup()       │     │                  │     │                  │
│  执行任务        │     │                  │     │                  │
│                  │     │                  │     │                  │
│  (崩溃)          │     │  observer()      │     │  observer()      │
│                  │     │  触发变化         │     │  触发变化         │
│                  │     │  campaign() ──▶  │     │                  │
│                  │     │  ★ Leader        │     │                  │
│                  │     │  startup()       │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

- 多个实例同时竞选，仅一个成为 Leader 并进入 `Ready` 状态执行 `startup()`
- 其余实例保持 `Pending`，通过 `observer()` 监听领导权变化
- Leader 崩溃或停止时自动 `resign()`，Pending 实例重新竞选并接管

### 选举实现

Election 的具体实现由 Discovery 后端决定：

| Discovery | 选举实现 | 策略 |
|-----------|---------|------|
| RamDiscovery | RamElection | 先到先得 |
| ETCDDiscovery | EtcdElection | 基于 etcd 分布式选举 |

### 直接使用 Election

通常通过 SingletonService/SingletonWorker 间接使用，但也可以直接操作：

```typescript
const election = Runtime.discovery.createElection('my-resource');

// 竞选 leader
await election.campaign('my-instance-id');

// 查询当前 leader
const leaderId = await election.leader();

// 观察领导权变化
election.observer().subscribe((id) => {
  console.log('Current leader:', id);
});

// 退出选举
await election.resign();
```

### 选举名称约定

SingletonService 和 SingletonWorker 自动创建选举名称：

- SingletonService: `service/{serviceName}`
- SingletonWorker: `worker/{workerName}`
