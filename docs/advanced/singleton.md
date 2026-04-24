# 单例服务与选举

在分布式系统中，某些任务只需要一个实例执行（如定时任务、数据清理）。sora 提供了基于选举机制的单例服务，确保集群中只有一个实例运行。

## SingletonService

`SingletonService` 继承自 `Service`，在启动前会先通过 Discovery 的 Election 机制竞选领导权。只有赢得选举的实例才会启动服务。

```typescript
import { SingletonService, IServiceOptions } from '@sora-soft/framework';

class SchedulerService extends SingletonService {
  constructor(name: string, options: IServiceOptions) {
    super(name, options);
  }

  protected async startup(): Promise<void> {
    // 只有赢得选举的实例会执行到这里
    await this.doJobInterval(async () => {
      await this.runScheduledTasks();
    }, 60_000);
  }

  protected async shutdown(reason: string): Promise<void> {
    // 清理资源
  }

  private async runScheduledTasks(): Promise<void> {
    // 定时任务逻辑
  }
}
```

### 生命周期

```
                     竞选成功？        启动服务
                        │                │
start() ──▶ campaign() ─┤── 是 ──▶ super.start() ──▶ startup()
                        │
                        └── 否 ──▶ 等待/观察

                     停止服务        退出选举
                        │                │
stop() ──▶ super.stop() ──▶ resign()
```

当领导者实例发生错误或被停止时，会自动退出选举，其他实例可以通过 `observer()` 感知领导权变化并重新竞选。

## SingletonWorker

`SingletonWorker` 与 `SingletonService` 相同的选举机制，但不包含 Listener 池。适合不需要接收 RPC 请求的后台任务：

```typescript
import { SingletonWorker, IWorkerOptions } from '@sora-soft/framework';

class CleanupWorker extends SingletonWorker {
  constructor(name: string, options: IWorkerOptions) {
    super(name, options);
  }

  protected async startup(): Promise<void> {
    await this.connectComponent(Runtime.getComponent('database'));

    await this.doJobInterval(async () => {
      await this.cleanupExpiredRecords();
    }, 300_000);
  }

  protected async shutdown(reason: string): Promise<void> {
    // 清理资源
  }
}
```

## Election 机制

选举是 SingletonService/SingletonWorker 的底层机制。框架提供两种实现：

| 实现 | 选举策略 | 适用场景 |
|------|----------|----------|
| `RamElection` | 先到先得 | 单进程开发/测试 |
| `EtcdElection` | 基于 etcd 选举 | 生产集群 |

### 直接使用 Election

通常通过 SingletonService 间接使用，但你也可以直接操作 Election：

```typescript
// 通过 Discovery 创建选举
const election = Runtime.discovery.createElection('scheduler');

// 竞选 leader
await election.campaign('my-instance-id');

// 查询当前 leader
const leaderId = await election.leader();

// 观察领导权变化
election.observer().subscribe((id) => {
  if (id === 'my-instance-id') {
    console.log('I am the leader');
  } else {
    console.log('Leader is:', id);
  }
});

// 退出选举
await election.resign();
```

### 选举名称约定

SingletonService 和 SingletonWorker 自动创建选举名称：

- SingletonService: `service/{serviceName}`
- SingletonWorker: `worker/{workerName}`

## 多实例行为

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│    实例 A         │     │    实例 B         │     │    实例 C         │
│                  │     │                  │     │                  │
│  campaign()      │     │  campaign()      │     │  campaign()      │
│     │            │     │     │            │     │     │            │
│     ▼            │     │     ▼            │     │     ▼            │
│  ★ Leader        │     │  等待             │     │  等待             │
│  startup()       │     │                  │     │                  │
│  执行定时任务     │     │                  │     │                  │
│                  │     │                  │     │                  │
│  (崩溃)          │     │  observer()      │     │  observer()      │
│                  │     │  触发变化         │     │  触发变化         │
│                  │     │  campaign() ──▶  │     │                  │
│                  │     │  ★ Leader        │     │                  │
│                  │     │  startup()       │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

当 Leader 实例崩溃或停止时：
1. etcd Lease 过期或主动 resign
2. 其他实例的 `observer()` 收到领导权变更通知
3. 新的实例通过 `campaign()` 竞选成为新 Leader
4. 新 Leader 的 `startup()` 被调用，开始执行任务
