# RPC 概览

sora 框架提供了一套协议无关的 RPC 通信系统，支持多种传输协议和三种通信模式。

## 通信模式

### Request / Response

最常用的模式。客户端发送请求，等待服务端返回响应。

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

客户端发送通知，不等待响应。服务端收到后异步处理。

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
  │                                       │
  │  provider.broadcast().methodName(body) │
  │  ──────────────────────────────────▶  │  实例 A 处理
  │                                       │
  │                              服务方实例 B
  │                                       │
  │  ──────────────────────────────────▶  │  实例 B 处理
  │                                       │
  │                              服务方实例 C
  │                                       │
  │  ──────────────────────────────────▶  │  实例 C 处理
```

适用于配置重载、缓存刷新等需要通知所有实例的场景。

## 核心角色

```
                    ┌──────────────────────────────────────────┐
                    │             RPC 数据流                    │
                    │                                          │
 调用方             │             服务方                        │
                    │                                          │
 Provider ──────────┼──▶ Connector ──▶ Listener ──▶ Route     │
 (选择目标)         │   (建立连接)    (接受连接)   (分发处理)   │
                    │                                          │
 provider.rpc()     │   TCP/HTTP/WS   TCP/HTTP/WS  @Route.method
 provider.notify()  │                                          │
 provider.broadcast()│                                          │
                    └──────────────────────────────────────────┘
```

| 角色 | 职责 |
|------|------|
| **Provider** | RPC 调用方。通过 Discovery 自动发现目标服务的端点，根据策略选择连接，提供 `rpc()`/`notify()`/`broadcast()` 调用接口 |
| **Connector** | 通信连接。协议相关的双向通道，负责数据编解码和传输 |
| **Listener** | 监听器。协议相关的服务端，接受客户端连接，将数据转发给 Route |
| **Route** | 路由处理器。使用装饰器注册方法，分发 RPC 请求到对应的处理函数 |

## Codec（编解码器）

RPC 数据在传输前需要经过编解码。框架内置两种 Codec：

| Codec | 编码格式 | 适用协议 |
|-------|----------|----------|
| `json` | JSON + zlib 压缩 + 长度前缀帧 | TCP |
| `http` | JSON 透传 | HTTP |

编解码器在连接建立时协商选择。

## 数据包类型

| OPCode | 类型 | 说明 |
|--------|------|------|
| `Request (1)` | 请求 | 携带 method、service、headers、payload |
| `Response (2)` | 响应 | 携带 headers、error 或 result |
| `Notify (3)` | 通知 | 携带 method、service、headers、payload，无响应 |
| `Command (4)` | 命令 | 内部控制命令（Off、Error、Ping、Pong、Close） |

## 下一步

- [路由 (Route)](/rpc/route) — 学习如何编写 RPC 处理器
- [调用方 (Provider)](/rpc/provider) — 学习如何发起 RPC 调用
- [传输层](/rpc/transport) — 了解 TCP、HTTP、WebSocket 传输协议
