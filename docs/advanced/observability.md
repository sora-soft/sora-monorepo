# 可观测性

sora 框架内置了日志系统和 W3C 兼容的分布式追踪，为服务的可观测性提供基础支持。

## Logger

### 基本使用

```typescript
import { Logger, LogLevel } from '@sora-soft/framework';

const logger = new Logger({ identify: 'my-service' });

logger.info('startup', 'Service started successfully');
logger.warn('config', 'Using default timeout');
logger.error('database', err, 'Connection failed');
logger.fatal('runtime', err, 'Critical error');
logger.debug('request', { method: 'GET', path: '/api/users' });
logger.success('health', 'Health check passed');
```

日志级别：

| 级别 | 值 | 说明 |
|------|---|------|
| `Debug` | 1 | 调试信息 |
| `Info` | 2 | 一般信息 |
| `Success` | 3 | 成功操作 |
| `Warn` | 4 | 警告 |
| `Error` | 5 | 错误 |
| `Fatal` | 6 | 致命错误 |

### CategoryLogger

`logger.category` 返回一个 CategoryLogger，自动从当前 Scope 解析日志分类：

```typescript
// 在 Worker 上下文中调用
logger.category.info('Processing request');
// 自动使用 Worker 的 logCategory
```

### 输出管道

Logger 通过 `pipe()` 支持多个输出目标：

```typescript
import { Logger, ConsoleOutput } from '@sora-soft/framework';

const logger = new Logger({ identify: 'my-service' })
  .pipe(new ConsoleOutput());
```

框架内置 `ConsoleOutput`，使用 chalk 提供彩色输出。你可以通过继承 `LoggerOutput` 实现自定义输出：

```typescript
import { LoggerOutput, ILoggerData, LogLevel } from '@sora-soft/framework';

class FileOutput extends LoggerOutput {
  protected async write(data: ILoggerData): Promise<void> {
    const line = `[${data.timeString}] [${data.level}] [${data.category}] ${data.content}\n`;
    fs.appendFileSync('app.log', line);
  }
}

logger.pipe(new FileOutput(LogLevel.Info));
```

### FrameworkLogger 和 RPCLogger

框架提供两个预配置的 Logger 实例：

```typescript
Runtime.frameLogger  // identify = 'framework'，框架内部日志
Runtime.rpcLogger    // identify = 'rpc'，RPC 通信日志
```

## 分布式追踪

sora 实现了 W3C Trace Context 规范，支持跨服务的分布式追踪。

### 自动传播

RPC 调用自动注入和解析 `traceparent` 头：

```
调用方 Service A                     服务方 Service B
     │                                    │
     │  生成 TraceContext                 │
     │  traceparent: 00-{traceId}-{spanId}-{flags}
     │  ──────────────────────────────────▶
     │                                    │  解析 traceparent
     │                                    │  创建子 Span
     │                                    │  处理请求
     │  ◀──────────────────────────────────
     │                                    │
```

无需手动配置，Provider 发送 RPC 请求时自动创建 `RpcClientTraceContext`，Listener 接收请求时自动解析为 `RpcServerTraceContext`。

### Trace API

```typescript
import { Trace, TraceContext } from '@sora-soft/framework';

// 获取当前追踪上下文
const ctx = Trace.current();
if (ctx) {
  console.log('Trace ID:', ctx.traceId);        // 32 位十六进制
  console.log('Span ID:', ctx.spanId);          // 16 位十六进制
  console.log('Parent Span ID:', ctx.parentSpanId);
  console.log('Trace parent header:', ctx.toRPCTraceParentHeader());
  // "00-{traceId}-{spanId}-{flags}"
}

// 在自定义上下文中创建新的追踪
await Trace.run(new InnerTraceContext(), async () => {
  // 在此回调中，Trace.current() 返回新的 TraceContext
  await doSomething();
});
```

### TraceContext 类型

| 类型 | 说明 |
|------|------|
| `InnerTraceContext` | 内部 Span，继承当前 Trace 的 traceId，创建新的 spanId |
| `RpcClientTraceContext` | 客户端 RPC Span，创建子 spanId 用于出站请求 |
| `RpcServerTraceContext` | 服务端 RPC Span，从 traceparent 头解析上下文 |

### TraceState

支持 W3C TraceState 头，用于传递厂商特定的追踪信息：

```typescript
const ctx = Trace.current();
if (ctx) {
  const state = ctx.traceState;

  // 读取
  const vendorValue = state.get('vendor-id');

  // 写入
  state.set('my-vendor', 'value');

  // 序列化
  const header = state.serialize();
  // "vendor-id=value,my-vendor=value"
}
```

### diagnostics_channel

TraceContext 通过 Node.js 的 `diagnostics_channel` 发布事件，可用于集成 APM 系统：

```typescript
import { diagnostics_channel } from 'node:diagnostics_channel';

const startChannel = diagnostics_channel.channel('sora:trace-context:start');
const endChannel = diagnostics_channel.channel('sora:trace-context:end');

startChannel.subscribe((ctx: TraceContext) => {
  // 追踪开始
  apm.startSpan(ctx.traceId, ctx.spanId);
});

endChannel.subscribe((ctx: TraceContext) => {
  // 追踪结束
  apm.endSpan(ctx.traceId, ctx.spanId, ctx.endNanoTime - ctx.startNanoTime);
});
```

### 自定义属性

可以在 TraceContext 上附加自定义属性：

```typescript
const ctx = Trace.current();
if (ctx) {
  ctx.attribute.set('user.id', '123');
  ctx.attribute.set('request.path', '/api/users');
}
```
