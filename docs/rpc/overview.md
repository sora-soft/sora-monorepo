# RPC 概览

sora 框架提供了一套**协议无关**的 RPC 通信系统。底层传输协议通过可插拔组件实现，开发者可根据场景自由选择或替换。框架官方提供以下传输组件：

| 传输协议 | 包名 |
|----------|------|
| **TCP** | `@sora-soft/framework` |
| **HTTP** | `@sora-soft/http-support` |
| **WebSocket** | `@sora-soft/http-support` |

框架遵循**模块化设计**原则：各组件充分解耦，开发者可以随时替换 RPC 链路中的任意环节（传输协议、编解码器、连接策略等），以适应不同业务需求。

## 通信模式

sora 框架提供三种通信模式：

### Request / Response

最基础的 RPC 请求模式。调用方发送请求，等待服务端返回响应。

```
调用方                                  服务方
  │                                       │
  │  provider.rpc().methodName(body)      │
  │  ──────────────────────────────────▶  │
  │         Request (等待响应)             │
  │                                       │  handler 处理请求
  │  ◀──────────────────────────────────  │
  │         Response (返回结果)            │
  │                                       │
```

适用于需要返回值的场景，如查询数据、执行操作并获取结果。

### Notify（单向通知）

调用方发送通知，不等待响应。服务端收到后异步处理。

```
调用方                                  服务方
  │                                       │
  │  provider.notify().methodName(body)   │
  │  ──────────────────────────────────▶  │
  │         Notify (无响应)               │
  │                                       │  handler 异步处理
  │  (继续执行，不等待)                    │
```

适用于事件通知、日志上报等不需要返回值的场景。

### Broadcast（广播）

向目标服务的所有实例发送通知。

```
调用方                              服务方实例 A
  │                                        │
  │  provider.broadcast().methodName(body) │
  │  ──────────────────────────────────▶  │  实例 A 处理
  │                                        │
  │                              服务方实例 B
  │                                        │
  │  ──────────────────────────────────▶  │  实例 B 处理
  │                                        │
  │                              服务方实例 C
  │                                        │
  │  ──────────────────────────────────▶  │  实例 C 处理
```

适用于配置重载、缓存刷新等需要通知所有实例的场景。

## 核心角色

RPC 链路由调用方和服务方两侧的多个角色协同工作：

```
         调用方                                           服务方

    ┌───────────┐                                   ┌───────────┐
    │ Provider  │                                   │ Listener  │
    │ (调用发起) │                                   │ (监听接入) │
    └────┬──────┘                                   └────┬──────┘
         │                                              │
         │ 管理生命周期 / 服务发现                        │ 管理连接
         ▼                                              ▼
    ┌──────────┐     Connector        Connector    ┌──────────┐
    │RPCSender │────────────────────────────────▶  │ Connector│
    │ (发送管理) │     (双向通信通道)                │ (连接抽象)│
    └────┬─────┘                                   └────┬─────┘
         │                                              │
         │ 编解码                                         │ 编解码
         ▼                                              ▼
    ┌──────────┐                                   ┌──────────┐
    │  Codec   │                                   │  Route   │
    │ (序列化)  │                                  │ (路由分发) │
    └──────────┘                                   └──────────┘
```

### 调用方角色

| 角色 | 框架提供 | 职责 |
|------|:--------:|------|
| **Provider** | ✅ | RPC 调用发起方。通过 Discovery 自动发现目标服务端点，管理 RPCSender 的生命周期，提供 `rpc()`/`notify()`/`broadcast()` 调用接口 |
| **RPCSender** | ✅ | 每个远程端点对应一个 RPCSender，负责管理 Connector 的连接状态和请求分发 |
| **Connector** |   | 通信连接的实际 Socket 抽象，协议相关实现（TCP / HTTP / WebSocket），可替换 |
| **Codec** |   | 编解码器，负责 Connector 之间的消息序列化与反序列化，可替换 |

### 服务方角色

| 角色 | 框架提供 | 职责 |
|------|:--------:|------|
| **Listener** |   | 通讯协议的监听者，负责接受连接并创建对应的 Connector 实例，可替换 |
| **Connector** |   | 服务端 Socket 抽象，与调用方 Connector 一一对应 |
| **Codec** |   | 本 Listener 支持的编解码器列表 |
| **Route** | ✅ | 消息路由与分发，使用装饰器将 RPC 请求映射到处理函数 |

> **提示：** Listener 与 Connector 是一一对应的关系。在没有服务发现的情况下，它们也可以独立使用。

## 快速示例

以下示例展示了如何使用 TCP 组件直接搭建一个最小的 RPC 通信（不依赖服务发现和 Provider）：

```typescript
import { TCPListener, TCPConnector, Route, Request, JsonBufferCodec } from '@sora-soft/framework';

interface ITestReq {
  message: number;
}

// 1. 定义路由处理器
class ServiceHandler extends Route {
  @Route.method
  async test(body: ITestReq, request: Request) {
    console.log('serviceHandler.test called', body);
    return { echo: body.message };
  }
}

async function start() {
  // 2. 创建 TCPListener 并启动监听
  const tcpListener = new TCPListener(
    { port: 8089, host: '127.0.0.1' },
    Route.callback(new ServiceHandler()),
    [new JsonBufferCodec()],
  );
  await tcpListener.startListen();

  // 3. 创建 Connector 连接到 Listener
  const connector = new TCPConnector();
  await connector.start(tcpListener.metaData, new JsonBufferCodec());

  // 4. 订阅响应
  connector.dataSubject.subscribe((response) => {
    console.log('receive response: ', response);
  });

  // 5. 构造并发送请求
  const request = new Request({
    method: 'test',
    service: 'test',
    headers: {},
    payload: { message: 42 },
  });
  connector.send(request.toPacket());
}

start();
```

> **提示：** 上例直接操作 Connector 以演示底层通信流程。实际开发中，推荐通过 [Provider](/rpc/provider) 发起调用，框架会自动处理包体构造、连接管理和回包解析。

## 下一步

- [路由 (Route)](/rpc/route) — 学习如何编写 RPC 处理器
- [消息监听 (Listener)](/rpc/listener) — 学习服务端监听与连接管理
- [调用方 (Provider)](/rpc/provider) — 学习如何发起 RPC 调用
- [编码器 (Codec)](/rpc/codec) — 学习编解码与协商机制
