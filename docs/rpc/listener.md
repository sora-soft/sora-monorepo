# 消息监听 (Listener)

Listener 是 RPC 通信中**服务端**的核心组件。它负责在指定协议上监听接入连接，并将收到的请求分发到 Route 处理器。框架提供三种内置实现：

| Listener | 包 | 协议 | 长连接 |
|----------|-----|------|:------:|
| **TCPListener** | `@sora-soft/framework` | TCP | 是 |
| **HTTPListener** | `@sora-soft/http-support` | HTTP | 否 |
| **WebSocketListener** | `@sora-soft/http-support` | WebSocket | 是 |

## 在 Service 中安装

通过 `Service.installListener()` 安装 Listener，框架会自动处理服务发现注册和生命周期管理：

```typescript
import { Service, TCPListener, JsonBufferCodec, Route } from '@sora-soft/framework';

class MyHandler extends Route {
  @Route.method
  async hello(body: { name: string }) {
    return { message: `Hello, ${body.name}!` };
  }
}

class MyService extends Service {
  async startup() {
    const listener = new TCPListener(
      { port: 4000, host: '0.0.0.0' },
      Route.callback(new MyHandler()),
      [new JsonBufferCodec()],
    );
    await this.installListener(listener);
  }
}
```

## 手动使用

Listener 也可以独立使用，不依赖 Service 和 Discovery：

```typescript
const listener = new TCPListener(
  { port: 8089, host: '127.0.0.1' },
  Route.callback(new ServiceHandler()),
  [new JsonBufferCodec()],
);

await listener.startListen();
console.log('listening on:', listener.metaData.endpoint);

// 停止监听
await listener.stopListen();
```

> **提示：** 手动使用时不涉及服务发现，适合测试或点对点通信场景。实际开发中推荐通过 Service 管理。

## TCPListener

基于 TCP 的长连接监听器：

```typescript
import { TCPListener, JsonBufferCodec } from '@sora-soft/framework';

const listener = new TCPListener(
  {
    host: '0.0.0.0',
    port: 4000,
    // portRange: [4000, 5000],   // 或使用端口范围
    exposeHost: '10.0.0.1',      // 可选，服务发现注册时对外暴露的地址
  },
  Route.callback(handler),
  [new JsonBufferCodec()],
);
```

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `host` | `string` | 监听地址 |
| `port` | `number` | 固定监听端口（与 `portRange` 二选一） |
| `portRange` | `[number, number]` | 端口范围，自动选择可用端口 |
| `exposeHost` | `string` | 对外暴露地址，默认与 `host` 相同 |

## HTTPListener

基于 Koa 的 HTTP 监听器。内部自动使用 `HTTPCodec`，无需手动指定 Codec：

```typescript
import { HTTPListener } from '@sora-soft/http-support';
import Koa from 'koa';

const koa = new Koa();

const listener = new HTTPListener(
  {
    host: '0.0.0.0',
    port: 8080,
    exposeHost: '10.0.0.1',
  },
  koa,
  Route.callback(handler),
);
```

> **提示：** HTTPListener 支持 Cookie 或 Header (`sora-http-session`) 传递 session。

## WebSocketListener

基于 WebSocket 的长连接监听器：

```typescript
import { WebSocketListener, JsonBufferCodec } from '@sora-soft/http-support';

const listener = new WebSocketListener(
  {
    host: '0.0.0.0',
    port: 8080,
    entryPath: '/ws',
    exposeHost: '10.0.0.1',
  },
  Route.callback(handler),
  [new JsonBufferCodec()],
);
```

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `host` | `string` | 监听地址 |
| `port` | `number` | 固定监听端口（与 `portRange` 二选一） |
| `portRange` | `[number, number]` | 端口范围 |
| `entryPath` | `string` | WebSocket 入口路径 |
| `exposeHost` | `string` | 对外暴露地址 |

## 权重

每个 Listener 拥有一个**权重值**（默认 `100`），用于 Provider 侧的负载均衡。权重越高，该 Listener 接收请求的概率越大：

```typescript
listener.setWeight(200);  // 设置权重
listener.weight;           // 读取当前权重
```

权重变化时框架会自动更新服务发现注册信息，Provider 能实时感知。

## 标签 (Labels)

通过 labels 标记 Listener，用于服务发现中的过滤匹配：

```typescript
const listener = new TCPListener(
  { port: 8089, host: '127.0.0.1' },
  Route.callback(handler),
  [new JsonBufferCodec()],
  { region: 'us-east', tier: 'production' },  // labels
);
```

Provider 可以基于 labels 筛选连接哪些 Listener。

## 连接事件

监听连接的接入与断开：

```typescript
listener.connectionSubject.subscribe((event) => {
  if (event.type === 'new-connection') {
    console.log('new connection:', event.session);
  } else {
    console.log('lost connection:', event.session);
  }
});
```

## 下一步

- [路由 (Route)](/rpc/route) — 学习如何编写 RPC 处理器
- [编码器 (Codec)](/rpc/codec) — 学习编解码与协商机制
- [调用方 (Provider)](/rpc/provider) — 学习如何发起 RPC 调用
