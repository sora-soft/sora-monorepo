# Worker

**Worker** 是通用的工作单元基类。它不监听 RPC 请求，适合执行后台任务、定时任务等。

核心职责：
- 管理生命周期（startup / shutdown）
- 连接和管理 Component
- 注册和管理 Provider
- 通过 `doJob()` 和 `doJobInterval()` 执行异步任务，这两个方法会通过 executor 执行，在 worker 关闭时会等待所有任务完成后才退出进程

## 创建 Worker

继承 `Worker` 类，实现 `startup()` 和 `shutdown()` 方法：

```typescript
import { Worker, NodeTime } from '@sora-soft/framework';

class SyncWorker extends Worker {
  protected async startup(): Promise<void> {
    // 连接组件
    await this.connectComponent(Com.database);

    // 注册 Provider 调用其他服务
    await this.registerProvider(userProvider);

    // 定时任务
    await this.doJobInterval(async () => {
      // 执行同步逻辑
    }, NodeTime.minute(1));
  }

  protected async shutdown(reason: string): Promise<void> {
    // 清理资源
  }
}
```

## 注册到 Node

通过 `Node.registerWorker()` 注册工厂函数，后续可通过 `Node.workerFactory()` 动态创建：

```typescript
Node.registerWorker('sync-worker', (options: IWorkerOptions) => {
  return new SyncWorker('sync-worker', options);
});

const worker = Node.workerFactory('sync-worker', config);
await Runtime.installWorker(worker);
```

## 注册 Provider

Worker 可以注册 Provider 来调用其他服务：

```typescript
await this.registerProviders([Pvd.business]);
```

详见 [调用方 (Provider)](/rpc/provider)。

## 连接组件

Worker 可以连接共享的外部依赖组件：

```typescript
await this.connectComponent(Com.redis);
```

详见 [组件系统](/microservice/component)。

## CommandWorker

**CommandWorker** 不是独立的类，而是一种使用模式——继承 `Worker` 并重写 `runCommand()` 方法来执行一次性命令行任务（如数据库迁移、初始化数据、管理指令等）。`Worker` 基类提供了默认的 `runCommand()` 实现（返回 `false`），子类只需覆盖此方法即可。

运行时，应用通过 `Application.startCommand()` 以命令模式启动：仅初始化运行时和指定的 Worker，执行完 `runCommand()` 后自动退出进程。

`runCommand()` 的返回值用于标识命令是否成功执行：
- 返回 `true` — 命令执行成功，`Application.startCommand()` 会打印成功日志后退出
- 返回 `false` — 命令未识别或未执行，基类默认实现即返回 `false`

```typescript
import { Worker, Node, Runtime, type IWorkerOptions } from '@sora-soft/framework';

class MigrateCommandWorker extends Worker {
  static register() {
    Node.registerWorker('migrate-command', (options: IWorkerOptions) => {
      return new MigrateCommandWorker('migrate-command', options);
    });
  }

  protected async startup() {
    await this.connectComponent(Com.database);
  }

  protected async shutdown() {}

  async runCommand(commands: string[]) {
    const [action] = commands;

    switch (action) {
      case 'sync':
        // 同步数据库结构
        break;
      case 'seed':
        // 填充初始数据
        break;
      default:
        return false;
    }
    return true;
  }
}
```

可通过 CLI 脚手架快速生成：

```bash
sora generate:command Migrate
```

执行命令时，应用以命令模式启动并自动退出：

```typescript
// Application.startCommand() 内部流程：
// 1. 启动运行时（加载配置、连接组件）
// 2. 创建并安装指定的 Worker
// 3. 调用 worker.runCommand(args)
// 4. 执行完成后自动 shutdown
await Application.startCommand(config, 'migrate-command', ['sync']);
```

详见 [CLI 命令手册](/cli/commands#sora-generate-command)。
