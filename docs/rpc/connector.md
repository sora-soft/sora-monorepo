# 连接器 (Connector)

Connector 是 RPC 通信的传输层抽象，负责底层协议的连接建立与数据收发。框架提供三种内置实现：

| Connector | 包 | 协议 | 连接模式 |
|-----------|-----|------|---------|
| **TCPConnector** | `@sora-soft/framework` | TCP | 长连接 |
| **HTTPConnector** | `@sora-soft/http-support` | HTTP | 每请求独立 |
| **WebSocketConnector** | `@sora-soft/http-support` | WebSocket | 长连接 |

> **提示：** 大多数场景下开发者不需要直接操作 Connector。通过 [Provider](/rpc/provider) 发起 RPC 调用时，框架会自动管理 Connector 的创建、连接和销毁。

## 注册 Connector

在使用 Provider 之前，需要先注册要用到的 Connector。注册是将 Connector 工厂绑定到协议标识，Provider 在连接远程 Listener 时会根据协议自动选择对应的 Connector：

```typescript
import { TCPConnector } from '@sora-soft/framework';
import { HTTPConnector, WebSocketConnector } from '@sora-soft/http-support';

class Pvd {
  static registerSenders() {
    TCPConnector.register();
    HTTPConnector.register();
    WebSocketConnector.register();
  }

  static business = new Provider<BusinessHandler>(ServiceName.Business);
}
```

只需注册应用需要用到的协议，不需要的可以不注册。

在 Application 启动时调用注册：

```typescript
class MyApplication extends Application {
  async startup() {
    Pvd.registerSenders();
  }
}
```

## 手动使用

Connector 可以脱离 Provider 直接使用，适合测试或点对点通信场景：

```typescript
import { TCPConnector, Request, JsonBufferCodec } from '@sora-soft/framework';

const connector = new TCPConnector();
await connector.start(listener.metaData, new JsonBufferCodec());

connector.dataSubject.subscribe((data) => {
  console.log('received:', data);
});

const request = new Request({
  method: 'echo',
  service: 'test',
  headers: {},
  payload: { message: 'hello' },
});
await connector.send(request.toPacket());

await connector.off();
```

> **提示：** 上例直接操作 Connector 以演示底层通信。实际开发中推荐通过 [Provider](/rpc/provider) 发起调用。

## Session

每个 Connector 拥有一个 `session` 属性，作为该连接的**唯一标识**。在服务端由 Listener 创建 Connector 时自动分配（UUID），调用端由框架内部管理：

```typescript
connector.session;  // 'a1b2c3d4-...'
```

通过 session 可以在 Listener 的连接池中查找对应的 Connector：

```typescript
const connector = listener.getConnector(session);
```

## 生命周期

Connector 的状态变化可以通过 `stateSubject`（RxJS Observable）监听：

```typescript
connector.stateSubject.subscribe((state) => {
  switch (state) {
    case ConnectorState.Ready:
      console.log('连接就绪:', connector.session);
      break;
    case ConnectorState.Stopping:
      console.log('正在断开:', connector.session);
      break;
    case ConnectorState.Stopped:
      console.log('已断开:', connector.session);
      break;
    case ConnectorState.Error:
      console.log('连接异常:', connector.session);
      break;
  }
});
```

| 状态 | 说明 |
|------|------|
| `Init` | 初始状态 |
| `Connecting` | 正在建立连接 |
| `Pending` | 连接已建立，等待 Codec 协商 |
| `Ready` | 就绪，可以收发数据 |
| `Stopping` | 正在断开 |
| `Stopped` | 已断开 |
| `Error` | 连接异常 |

## 下一步

- [调用方 (Provider)](/rpc/provider) — 通过 Provider 自动管理 Connector
- [编码器 (Codec)](/rpc/codec) — 学习编解码与协商机制
- [消息监听 (Listener)](/rpc/listener) — 服务端监听与连接管理
