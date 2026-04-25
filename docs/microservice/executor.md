# Executor

每个 Worker 和 Service 内部都有一个 **Executor**（执行器），用于管理和追踪异步任务的执行。当 Worker/Service 进入停止流程时，Executor 会等待所有进行中的任务完成后才继续关闭，确保任务不会被中途打断。

## 工作机制

```
                    Worker / Service
                    
  ┌──────────────────────────────────────────────┐
  │                 Executor                      │
  │                                              │
  │   doJob(task) ──▶ workingPromises[]          │
  │   doJob(task) ──▶ workingPromises[]          │
  │   doJob(task) ──▶ workingPromises[]          │
  │                                              │
  │   stop() → Promise.all(workingPromises)      │
  │             等待所有任务完成后才返回            │
  └──────────────────────────────────────────────┘
```

## doJob 与 doJobInterval

Worker 基类提供了两个方法将任务提交到 Executor 执行：

### doJob

提交一个异步任务。Executor 会追踪其完成状态：

```typescript
await this.doJob(async () => {
  await this.processData();
});
```

### doJobInterval

循环执行定时任务。任务之间按固定间隔执行，只有状态为 `Ready` 时才会触发，进入 `Stopping` 状态后自动退出循环：

```typescript
import { NodeTime } from '@sora-soft/framework';

await this.doJobInterval(async () => {
  await this.syncData();
}, NodeTime.minute(1));
```

> **提示：** `doJobInterval` 不是精确的定时调度器。每次任务执行完毕后才开始计算下一次间隔。

## 停止保证

当 Worker/Service 停止时，关闭流程如下：

```
worker.stop(reason)
│
├── 1. State: Stopping              ← 不再接受新请求
│
├── 2. 清除 doJobInterval 定时器     ← 循环任务停止触发
│
├── 3. executor.stop()              ← 等待进行中的任务完成
│       └── Promise.all(workingPromises)
│
├── 4. shutdown(reason)             ← 用户清理代码
│
├── 5. 注销 Provider / 断开 Component
│
└── 6. State: Stopped
```

关键保证：

- **进行中的任务会执行完毕**，不会被强制中断
- **doJobInterval 在 Stopping 后不再触发**新的任务
- **Service 进入 Stopping 后不再接受新的 RPC 请求**

## 使用建议

- 耗时的异步操作（数据同步、批量处理等）应通过 `doJob()` / `doJobInterval()` 提交到 Executor，而不是直接在 startup 中 `await` 一个无限循环——否则 `shutdown()` 永远不会被调用
- 如果需要在 `shutdown()` 中执行清理逻辑，可以放心地在清理代码中使用组件和 Provider——它们在 `shutdown()` 之后才被注销和断开
