# @sora-soft/http-support

基于 Koa 和 WebSocket 的 HTTP/WebSocket 传输层实现，为 sora 框架提供 HTTP 和 WebSocket 协议的 Listener 与 Connector，支持 RPC 通信。

## 安装

```bash
sora add:component @sora-soft/http-support
```

## 功能说明

- 提供 `HTTPListener` / `HTTPConnector`，基于 Koa 实现 HTTP 协议的 RPC 通信
- 提供 `WebSocketListener` / `WebSocketConnector`，实现 WebSocket 协议的 RPC 通信
- 支持端口范围配置，自动选择可用端口
- 内置 `HTTPBodyParser`，支持 JSON、XML、URL-encoded 等多种请求体解析
- 提供 `HTTPCookieManager` 用于 Cookie 的解析与序列化
- WebSocket Connector 支持自动重连

## 使用方法

### HTTP Listener（服务端）

```typescript
import Koa from '@sora-soft/http-support/koa';
import { HTTPListener } from '@sora-soft/http-support';

const app = new Koa();
const listener = new HTTPListener(
  { host: '0.0.0.0', port: 8080 },
  app,
  Route.callback(handler),
);
```

### HTTP Connector（客户端）

```typescript
import { HTTPConnector } from '@sora-soft/http-support';

HTTPConnector.register();
```

### WebSocket Listener（服务端）

```typescript
import { WebSocketListener } from '@sora-soft/http-support';

const wsListener = new WebSocketListener(
  { host: '0.0.0.0', port: 9090, entryPath: '/ws' },
  Route.callback(handler),
);
```

### WebSocket Connector（客户端）

```typescript
import { WebSocketConnector } from '@sora-soft/http-support';

WebSocketConnector.register();
```

### 请求体解析

```typescript
import { HTTPBodyParser } from '@sora-soft/http-support';

const body = await HTTPBodyParser.parse(ctx);
```
