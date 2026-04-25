# 编码器 (Codec)

Codec 负责在 RPC 通信中进行消息的序列化与反序列化。它位于 Connector 层之上，将框架内部的 `IRawNetPacket` 对象转换为传输协议所需的底层格式（如 `Buffer`）。

```
               调用方                                        服务方

          ┌──────────┐                                 ┌──────────┐
          │RPCSender │                                 │ Listener │
          └────┬─────┘                                 └────┬─────┘
               │                                            │
               ▼                                            ▼
          ┌──────────┐                                 ┌──────────┐
          │Connector │                                 │Connector │
          └────┬─────┘                                 └────┬─────┘
               │                                            │
               │  encode / decode                           │  encode / decode
               ▼                                            ▼
          ┌──────────┐     网络传输（TCP/HTTP/WS）     ┌──────────┐
          │  Codec   │◀──────────────────────────────▶│  Codec   │
          └──────────┘                                 └──────────┘
```

## Codec 在 RPC 中的作用

Codec 是 RPC 链路中**可替换**的序列化环节。它的职责是：

- **编码 (encode)**：将 `IRawNetPacket` 转换为传输格式（如 JSON 字符串的 `Buffer`）
- **解码 (decode)**：将传输格式还原为 `IRawNetPacket`

通过抽象 Codec 层，框架实现了**传输协议与序列化格式的解耦**——同一个 TCP 连接可以使用不同的 Codec，同一个 Codec 也可以服务于不同的传输协议。

### Codec 基类

所有 Codec 实现都继承自 `Codec<T>` 泛型基类，其中 `T` 是传输层的原始数据类型：

```typescript
// packages/framework/src/lib/rpc/Codec.ts
export abstract class Codec<T> {
  static register(codec: Codec<any>) { ... }  // 注册到全局 Map
  static get(code: string) { ... }             // 按 code 查找
  static has(code: string) { ... }             // 判断是否存在

  abstract get code(): string;                 // 唯一标识符
  abstract decode(raw: T): Promise<IRawNetPacket>;
  abstract encode(packet: IRawNetPacket): Promise<T>;
}
```

`Codec` 类内部维护一个全局的 `Map<string, Codec<any>>` 注册表。每个 Codec 通过唯一的 `code` 字符串标识自身，框架通过 `code` 进行查找和协商。

## 内置 Codec

框架提供以下内置实现：

| Codec | code | 包 | 传输类型 | 说明 |
|-------|------|-----|---------|------|
| **JsonBufferCodec** | `'json'` | `@sora-soft/framework` | `Buffer` | JSON 序列化，适用于 TCP / WebSocket |
| **HTTPCodec** | `'http'` | `@sora-soft/http-support` | `Object` | 透传递（Identity），HTTP 协议本身处理序列化 |

### JsonBufferCodec

最常用的 Codec，使用 `JSON.stringify` / `JSON.parse` 进行序列化：

```typescript
import { JsonBufferCodec } from '@sora-soft/framework';

// JsonBufferCodec 在模块加载时通过 static 块自动注册：
// static { Codec.register(new JsonBufferCodec()); }

const codec = new JsonBufferCodec();
// encode: IRawNetPacket → Buffer (JSON string)
// decode: Buffer → IRawNetPacket
```

### HTTPCodec

HTTP 专用的透传 Codec，不做实际序列化（HTTP 协议本身已处理 JSON body）：

```typescript
// HTTPListener 内部硬编码使用 HTTPCodec，无需手动指定
// encode: IRawNetPacket → Object (直接返回)
// decode: Object → IRawNetPacket (直接返回)
```

## Listener 设置支持的 Codec

Listener 在构造时接收一个 `Codec[]` 数组，声明该监听端点支持的所有编码器。

### TCP Listener

```typescript
import { TCPListener, JsonBufferCodec } from '@sora-soft/framework';

const listener = new TCPListener(
  { port: 8089, host: '127.0.0.1' },
  Route.callback(new ServiceHandler()),
  [new JsonBufferCodec()],  // 支持的 Codec 列表
);
```

可以传入多个 Codec，按优先级排列：

```typescript
const listener = new TCPListener(
  { port: 8089, host: '127.0.0.1' },
  Route.callback(handler),
  [new ProtobufCodec(), new JsonBufferCodec()],  // 优先使用 Protobuf
);
```

### HTTP Listener

HTTPListener 硬编码使用 `HTTPCodec`，构造时无需指定：

```typescript
import { HTTPListener } from '@sora-soft/http-support';

const listener = new HTTPListener(
  { port: 8080, host: '0.0.0.0' },
  koa,
  Route.callback(handler),
);
// 内部自动: super(callback, [new HTTPCodec()], labels)
```

### WebSocket Listener

与 TCP 类似，构造时传入 Codec 列表：

```typescript
import { WebSocketListener, JsonBufferCodec } from '@sora-soft/http-support';

const listener = new WebSocketListener(
  { port: 8080, path: '/ws' },
  Route.callback(handler),
  [new JsonBufferCodec()],
);
```

### Codec 信息与服务发现

Listener 在注册到服务发现时，会将支持的 Codec 列表（`code` 字符串数组）写入元数据：

```
Listener 构造时传入 [Codec1, Codec2]
         │
         ▼
Listener.metaData.codecs = ['protobuf', 'json']   // 提取 code
         │
         ▼
Service.installListener(listener)
         │
         ▼
Discovery.registerEndpoint(listenerMetaData)
         │
         ▼
Provider 通过 Discovery 获取 IListenerMetaData.codecs
```

`IListenerMetaData` 接口定义：

```typescript
interface IListenerInfo {
  protocol: string;
  endpoint: string;
  codecs: string[];   // Codec code 列表，如 ['json']
  labels: ILabels;
}

interface IListenerMetaData extends IListenerInfo {
  id: string;
  state: ListenerState;
  targetId: string;
  targetName: string;
  // ...
}
```

## Provider 设置支持的 Codec

Provider 侧的 Codec 注册是**隐式**的——通过 `Codec.register()` 将 Codec 实例注册到全局注册表即可。Provider 在连接时会自动查找双方都支持的 Codec。

### 全局注册

每个具体 Codec 实现通过 `static` 初始化块自动注册：

```typescript
// JsonBufferCodec 内部
export class JsonBufferCodec extends Codec<Buffer> {
  static {
    Codec.register(new JsonBufferCodec());  // 模块加载时自动注册
  }
  // ...
}
```

只要在应用启动时 `import` 了对应的 Codec 模块，该 Codec 就会自动加入全局注册表。

### 手动注册自定义 Codec

如果开发者实现了自定义 Codec，可以手动注册：

```typescript
import { Codec } from '@sora-soft/framework';
import { MyCustomCodec } from './MyCustomCodec';

Codec.register(new MyCustomCodec());
```

## Codec 协商流程

Codec 协商采用**发起方选择**策略：由 Connector 主动发起连接的一方（即 Provider 侧）根据双方支持的 Codec 列表，选择一个匹配的 Codec 并通知接收方。

```
    Provider (调用方)                              Listener (服务方)
         │                                              │
         │  1. 注册 Codec 列表到服务发现                   │
         │                                              │
         │◀──────── IListenerMetaData ──────────────────│
         │          codecs: ['json']                     │
         │                                              │
         │  2. findAvailableCodec(['json'])              │
         │     Codec.get('json') → JsonBufferCodec      │
         │                                              │
         │  3. 建立传输连接                                │
         │──────────── TCP connect ───────────────────▶│
         │                                              │
         │  4. 发送 codec code                          │
         │─────────── "json\n" ──────────────────────▶│
         │                                              │
         │  5. 接收方确认 codec                          │
         │                     Codec.get('json') → OK  │
         │                                              │
         │  6. 双方使用 JsonBufferCodec 通信              │
         │◀═══════════ RPC 数据 ═════════════════════▶│
```

### 第一步：服务发现广播

Listener 将自身支持的 `codecs` 列表写入 `IListenerMetaData`，通过服务发现组件广播给所有 Provider。

### 第二步：Provider 查找匹配 Codec

RPCSender 创建时，调用 `ProviderManager.findAvailableCodec()` 查找双方都支持的 Codec：

```typescript
// ProviderManager.ts
findAvailableCodec(codes: string[]) {
  for (const code of codes) {
    const codec = Codec.get(code);   // 查找全局注册表
    if (codec) return codec;         // 首个匹配即返回
  }
  return null;                       // 无匹配则返回 null
}
```

采用**首个匹配（first-match-wins）**策略：按 Listener 声明的 Codec 顺序逐一查找，返回第一个在全局注册表中存在的 Codec。

如果找不到匹配的 Codec，RPCSender 将进入 `NotAvailable` 状态，无法建立连接：

```typescript
// RPCSender 构造函数
this.codec_ = this.provider_.pvdManager.findAvailableCodec(target.codecs);
if (!this.connector_ || !this.codec_) {
  this.lifeCycle_.setState(RPCSenderState.NotAvailable);
}
```

### 第三步：连接建立与 Codec 协商

Connector 的连接生命周期分为以下阶段：

```
Init → Connecting → Pending → Ready → Stopping → Stopped
                       ↑                  ↓
                  等待协商              Error
```

| 状态 | 含义 |
|------|------|
| `Connecting` | 正在建立传输连接 |
| `Pending` | 传输连接已建立，等待 Codec 协商 |
| `Ready` | Codec 协商完成，可以收发数据 |

以 TCP 为例，协商协议如下：

#### 发起方（TCPConnector）

```typescript
// Connector.start()
this.codec_ = codec;                         // 设置选中的 Codec
await this.connect(target);                  // 建立 TCP 连接
this.lifeCycle_.setState(ConnectorState.Pending);
await this.selectCodec(codec.code);          // 发送 codec code
this.lifeCycle_.setState(ConnectorState.Ready);
```

`selectCodec` 通过 socket 发送 codec code + 换行符：

```typescript
// TCPConnector.selectCodec()
this.socket_.write(`${code}\n`);  // 发送 "json\n"
```

#### 接收方（TCPListener 创建的 TCPConnector）

Listener 在接受连接后，创建一个服务端 TCPConnector 并进入 `waitForCodecSelected` 状态：

```typescript
// TCPListener.onSocketConnect()
const connector = new TCPConnector(socket);
// 构造函数内部:
//   this.lifeCycle_.setState(ConnectorState.Pending);
//   this.waitForCodecSelected(socket);

// TCPConnector.waitForCodecSelected()
socket.on('data', async (data) => {
  // 缓存数据，查找换行符 (0x0A)
  const index = this.cache_.indexOf(0x0A);
  if (index === -1) return;

  // 提取 codec code
  const code = this.cache_.subarray(0, index).toString('utf-8');

  // 确认 Codec
  await this.onCodecSelected(code);

  // 移除临时监听，绑定正式数据处理器
  socket.removeAllListeners('data');
  this.bindSocketDataEvent(socket);
});
```

#### Codec 确认

接收方通过 `Connector.onCodecSelected()` 确认 Codec：

```typescript
// Connector.onCodecSelected()
async onCodecSelected(code: string) {
  const codec = Codec.get(code);            // 查找全局注册表
  if (!codec) {
    this.onError(new FrameworkError(...));   // Codec 不存在，连接失败
    return;
  }
  this.codec_ = codec;                      // 设置 Codec，连接就绪
}
```

### 不同传输协议的协商差异

| 传输协议 | 协商方式 | 说明 |
|---------|---------|------|
| **TCP** | 发送 `"code\n"` | 完整的换行符分隔协商协议 |
| **WebSocket** | 发送 `"code\n"` | 与 TCP 相同的协议格式 |
| **HTTP** | 无协商 | HTTPCodec 硬编码，构造时自动调用 `onCodecSelected('http')` |

## 自定义 Codec

开发者可以实现自定义 Codec 以支持其他序列化格式（如 Protobuf、MessagePack 等）。

### 实现步骤

1. **继承 `Codec<T>` 基类**

```typescript
import { Codec } from '@sora-soft/framework';
import type { IRawNetPacket } from '@sora-soft/framework';

export class MsgPackCodec extends Codec<Buffer> {
  static {
    Codec.register(new MsgPackCodec());  // 注册到全局注册表
  }

  get code() {
    return 'msgpack';
  }

  async encode(packet: IRawNetPacket): Promise<Buffer> {
    return msgpack.encode(packet);
  }

  async decode(raw: Buffer): Promise<IRawNetPacket> {
    return msgpack.decode(raw);
  }
}
```

2. **在 Listener 中使用**

```typescript
import { MsgPackCodec } from './MsgPackCodec';

const listener = new TCPListener(
  { port: 8089, host: '127.0.0.1' },
  Route.callback(handler),
  [new MsgPackCodec()],
);
```

3. **在 Provider 侧注册**

只要 `import` 了 `MsgPackCodec`，其 `static` 块会自动注册。Provider 在连接时会通过 `Codec.get('msgpack')` 找到它。

### 多 Codec 支持

Listener 可以声明支持多个 Codec（按优先级排序），Provider 会选择第一个双方都支持的：

```typescript
// Listener 侧：声明支持 msgpack 和 json
const listener = new TCPListener(
  options,
  Route.callback(handler),
  [new MsgPackCodec(), new JsonBufferCodec()],
);

// 如果 Provider 只注册了 JsonBufferCodec，
// 则协商结果为 'json'（跳过不认识的 'msgpack'）
```

## 完整示例

以下示例展示了一个使用 `JsonBufferCodec` 的完整 TCP RPC 通信链路：

```typescript
import {
  TCPListener, TCPConnector, Route, Request, JsonBufferCodec,
} from '@sora-soft/framework';

class ServiceHandler extends Route {
  @Route.method
  async echo(body: { message: string }) {
    return { echo: body.message };
  }
}

async function main() {
  // 服务方：创建 TCPListener，声明支持 json codec
  const listener = new TCPListener(
    { port: 8089, host: '127.0.0.1' },
    Route.callback(new ServiceHandler()),
    [new JsonBufferCodec()],
  );
  await listener.startListen();

  // 调用方：创建 TCPConnector，指定使用 json codec
  const connector = new TCPConnector();
  await connector.start(listener.metaData, new JsonBufferCodec());

  // 发送请求
  connector.dataSubject.subscribe((response) => {
    console.log('response:', response);
  });

  const request = new Request({
    method: 'echo',
    service: 'test',
    headers: {},
    payload: { message: 'hello' },
  });
  connector.send(request.toPacket());
}

main();
```

> **提示：** 上例直接操作 Connector 以演示 Codec 的使用。实际开发中，推荐通过 [Provider](/rpc/provider) 发起调用，框架会自动完成 Codec 协商。
