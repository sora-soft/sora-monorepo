# 日志

sora 框架的日志系统采用 **Logger 与 Output 分离**的设计。Logger 负责产生结构化的日志数据，Output 负责将这些数据输出到具体的目的地。一个 Logger 可以没有 Output（静默），也可以挂载多个 Output（同时输出到控制台和文件）。

## 架构

```
Logger (产生日志数据)
  │
  │  ILoggerData (固定结构)
  │  ┌──────────────────────────────────┐
  │  │ time, timeString, identify,     │
  │  │ category, level, error,         │
  │  │ content, position, stack,       │
  │  │ raw, pid                         │
  │  └──────────────────────────────────┘
  │
  ├── pipe(ConsoleOutput)  ──▶ console.log (彩色)
  ├── pipe(FileOutput)     ──▶ 文件 (按日期轮转)
  └── pipe(YourOutput)     ──▶ 数据库、消息队列...
```

Logger 产出的数据格式（`ILoggerData`）是固定的，Output 可以自由决定如何组织和展示这些内容。

## Logger

框架内置三个 Logger 实例：

| Logger | identify | 用途 |
|--------|----------|------|
| `Runtime.frameLogger` | `framework` | 框架内部日志（启动、关闭、状态变更等） |
| `Runtime.rpcLogger` | `rpc` | RPC 通信日志（请求、响应、连接等） |
| `AppLogger` | `app` | 应用业务日志（模板项目中自定义） |

### 日志方法

```typescript
Runtime.frameLogger.info('runtime', { event: 'load-config', config: options });
Runtime.frameLogger.success('framework', { event: 'start-runtime-success' });
Runtime.frameLogger.warn('connector', { event: 'connector-response-not-enabled' });
Runtime.frameLogger.error('listener', err, { event: 'listener-connector-off-error' });
Runtime.frameLogger.debug('runtime', { event: 'service-state-change', state });
Runtime.frameLogger.fatal('runtime', err, { event: 'connect-discovery' });
```

| 方法 | 说明 |
|------|------|
| `debug(category, content)` | 调试信息，需开启 debug 模式 |
| `info(category, content)` | 一般信息 |
| `success(category, content)` | 成功信息 |
| `warn(category, content)` | 警告 |
| `error(category, error, content)` | 错误，自动根据 `ExError.level` 路由到合适的日志级别 |
| `fatal(category, error, content)` | 致命错误 |

### category 自动推断

通过 `logger.category` 访问的 `CategoryLogger` 会自动从当前的 Context 中推断 category，无需手动传递：

```typescript
// 在 Worker/Service 内部使用
this.logger_.category.info({ event: 'sync-completed', count: 100 });
// category 自动推断为当前作用域的名称
```

## Output

Output 通过 `pipe()` 挂载到 Logger，支持链式调用：

```typescript
Runtime.frameLogger.pipe(consoleOutput).pipe(fileOutput);
Runtime.rpcLogger.pipe(consoleOutput).pipe(fileOutput);
appLogger.pipe(consoleOutput).pipe(fileOutput);
```

每个 Output 可以通过 `levels` 选项过滤只接收特定级别的日志：

```typescript
const consoleOutput = new ConsoleOutput({
  levels: [LogLevel.Info, LogLevel.Success, LogLevel.Warn, LogLevel.Error, LogLevel.Fatal],
});
```

### ConsoleOutput

框架内置，输出到控制台并使用 chalk 着色：

```typescript
import { ConsoleOutput } from '@sora-soft/framework';

const consoleOutput = new ConsoleOutput({
  levels: [LogLevel.Info, LogLevel.Success, LogLevel.Warn, LogLevel.Error, LogLevel.Fatal],
});
```

输出格式：

```
2024-01-15T10:30:00+08:00,2,framework,runtime,Runtime.ts:38,{"event":"load-config"}
```

### FileOutput

模板项目内置，按日期自动轮转日志文件：

```typescript
import { FileOutput } from './lib/FileLogger.js';

const fileOutput = new FileOutput({
  levels: logLevels,
  fileFormat: 'logs/app-YYYY-MM-DD.log',
});
```

### 自定义 Output

继承 `LoggerOutput` 实现 `output()` 和 `end()` 方法即可：

```typescript
import { LoggerOutput, type ILoggerData } from '@sora-soft/framework';

class DatabaseOutput extends LoggerOutput {
  protected async output(log: ILoggerData): Promise<void> {
    await db.insert('logs', {
      time: log.time,
      level: log.level,
      identify: log.identify,
      category: log.category,
      content: log.content,
    });
  }

  async end(): Promise<void> {
    // 关闭数据库连接等清理操作
  }
}
```

> **提示：** 每个 Output 内部使用队列执行器（QueueExecutor）序列化写入，确保即使在高并发场景下日志也不会交错。
