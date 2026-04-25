# 分布式追踪

sora 实现了 W3C Trace Context 规范，支持跨服务的分布式追踪。

## 自动传播

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
