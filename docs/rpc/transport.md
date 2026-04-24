# 传输层

sora 框架支持三种传输协议：TCP、HTTP 和 WebSocket。每种协议都有对应的 Listener 和 Connector 实现。

## 协议对比

| 特性 | TCP | HTTP | WebSocket |
|------|-----|------|-----------|
| 传输方式 | 长连接 | 请求/响应 | 长连接 |
| 数据格式 | JSON + zlib + 长度前缀帧 | JSON | JSON 文本 |
| 适用场景 | 内部服务间高性能 RPC | 对外 API 网关 | 实时双向通信 |
| Codec | `json`（zlib 压缩） | `http`（透传） | `json`（文本） |
| 连接管理 | 自动重连 | 无状态（每次请求创建） | 自动重连 |
| 心跳 | 支持 Ping/Pong | 不支持 | 支持 Ping/Pong |
| Session | 自动分配 | Cookie / Header | 自动分配 |

## TCP

TCP 传输使用 zlib 压缩和 4 字节大端长度前缀进行数据帧化，适合内部服务间的高性能通信。

### TCPListener

```typescript
import { TCPListener, Codec } from '@sora-soft/framework';

const listener = new TCPListener(
  {
    host: '0.0.0.0',
    port: 4000,           // 固定端口
    // 或使用端口范围
    // portRange: [4000, 4100],
  },
  Route.callback(handler),
  [Codec.get('json')],
);

await service.installListener(listener);
```

**配置项（`ITCPListenerOptions`）：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `host` | `string` | 监听地址 |
| `port` | `number` | 固定端口号（与 portRange 二选一） |
| `portRange` | `number[]` | 端口范围 `[min, max]`，自动选择可用端口 |
| `exposeHost` | `string` | 注册到 Discovery 的对外地址（默认使用 host） |

### TCPConnector

```typescript
import { TCPConnector } from '@sora-soft/framework';

// 注册到 ProviderManager（通常在启动时调用一次）
TCPConnector.register();
```

注册后，当 Provider 需要连接 `protocol: 'tcp'` 的端点时，会自动创建 TCPConnector。

**数据帧格式：**
```
┌──────────────┬───────────────────────┐
│ 4 bytes (BE) │ zlib compressed data  │
│ length       │ (JSON payload)        │
└──────────────┴───────────────────────┘
```

**Codec 协商：** 连接建立后，双方发送 Codec 名称（如 `json\n`），协商使用哪种编解码器。

## HTTP

HTTP 传输基于 Koa，将 HTTP 请求映射为 RPC 调用。适合作为对外 API 网关。

### HTTPListener

```typescript
import { HTTPListener } from '@sora-soft/http-support';
import Koa from 'koa';

const koaApp = new Koa();

const listener = new HTTPListener(
  {
    host: '0.0.0.0',
    port: 3000,
    labels: { type: 'api' },
  },
  koaApp,
  Route.callback(handler),
);

await service.installListener(listener);
```

**配置项（`IHTTPListenerOptions`）：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `host` | `string` | 监听地址 |
| `port` | `number` | 固定端口号 |
| `portRange` | `number[]` | 端口范围 |
| `labels` | `ILabels` | 端点标签 |
| `exposeHost` | `string` | 对外地址 |

**URL 映射规则：**

```
POST http://host:port/{service}/{method}
GET  http://host:port/{service}/{method}?key=value
```

- `service` — 目标服务名
- `method` — RPC 方法名
- POST/PUT 请求：body + query 合并作为 payload
- GET 请求：query 参数作为 payload

**Session 管理：**

通过 Cookie `sora-http-session` 或 Header `sora-http-session` 传递 Session ID。

### HTTPConnector

```typescript
import { HTTPConnector } from '@sora-soft/http-support';

HTTPConnector.register();
```

客户端通过 axios 发送 POST 请求到 `http://{endpoint}/{service}/{method}`。

### 自定义 Koa 中间件

由于 HTTPListener 接受一个 Koa 实例，你可以在创建 Listener 之前添加自定义中间件：

```typescript
const koaApp = new Koa();

// 添加 CORS 中间件
koaApp.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  await next();
});

// 添加请求体解析
koaApp.use(bodyParser());

const listener = new HTTPListener(
  { host: '0.0.0.0', port: 3000 },
  koaApp,
  Route.callback(handler),
);
```

## WebSocket

WebSocket 传输基于 `ws` 库，支持双向通信，适合实时推送场景。

### WebSocketListener

```typescript
import { WebSocketListener } from '@sora-soft/http-support';

const listener = new WebSocketListener(
  {
    host: '0.0.0.0',
    port: 5000,
    entryPath: '/ws',
  },
  Route.callback(handler),
  [Codec.get('json')],
);

await service.installListener(listener);
```

**配置项（`IWebSocketListenerOptions`）：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `host` | `string` | 监听地址 |
| `port` | `number` | 固定端口号 |
| `portRange` | `number[]` | 端口范围 |
| `entryPath` | `string` | WebSocket 入口路径 |
| `labels` | `ILabels` | 端点标签 |
| `exposeHost` | `string` | 对外地址 |

**端点格式：** `ws://{host}:{port}{entryPath}`

### WebSocketConnector

```typescript
import { WebSocketConnector } from '@sora-soft/http-support';

WebSocketConnector.register();
```

## 注册传输协议

在应用启动时，需要注册所有使用的传输协议的 Connector 工厂：

```typescript
import { TCPConnector } from '@sora-soft/framework';
import { HTTPConnector, WebSocketConnector } from '@sora-soft/http-support';

// 注册到全局 ProviderManager
TCPConnector.register();
HTTPConnector.register();
WebSocketConnector.register();
```

注册后，Provider 在连接远程端点时，会根据端点的 `protocol` 字段自动选择对应的 Connector 工厂创建连接。

## 选型建议

```
┌──────────────────────────────────────────────────┐
│                                                  │
│   内部服务间通信？                                │
│       │                                          │
│       ├── 是 ──▶ TCP                             │
│       │         高性能、压缩、长连接              │
│       │                                          │
│       ├── 需要对外暴露 HTTP API？                 │
│       │       │                                  │
│       │       └── 是 ──▶ HTTP                    │
│       │               RESTful、无状态、兼容性好   │
│       │                                          │
│       └── 需要实时双向通信？                      │
│               │                                  │
│               └── 是 ──▶ WebSocket               │
│                       长连接、推送、低延迟        │
│                                                  │
└──────────────────────────────────────────────────┘
```

一个 Service 可以同时安装多个不同协议的 Listener，以支持多种接入方式。
