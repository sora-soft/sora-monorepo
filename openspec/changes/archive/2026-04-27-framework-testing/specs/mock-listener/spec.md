## ADDED Requirements

### 需求:MockListener 继承 Listener 并模拟监听行为
MockListener 必须继承 `Listener` 抽象类，实现 `listen()` 和 `shutdown()` 方法。`startListen()` 调用后状态进入 Listening，但不监听任何真实端口。`stopListen()` 调用后状态进入 Stopped。

#### 场景:启动监听无端口
- **当** 调用 `startListen(callback)`
- **那么** 状态进入 Listening，不创建 net.Server，不绑定端口

#### 场景:停止监听
- **当** 调用 `stopListen()`
- **那么** 状态进入 Stopped，所有已连接的 Connector 关闭

### 需求:MockListener 支持手动注入 Connector 模拟新连接
MockListener 必须提供 `injectConnection(connector)` 方法，将一个已准备好的 Connector 注入到 Listener 的连接池中，触发 `new-connection` 事件，使 Listener 的路由回调能够处理该 Connector 上的 RPC 请求。

#### 场景:注入 Connector 触发连接事件
- **当** 调用 `injectConnection(mockConnector)`
- **那么** connectionSubject 发出 `new-connection` 事件，Connector 被加入 Listener 的连接池

#### 场景:注入的 Connector 可以处理 RPC 请求
- **当** 通过注入的 Connector 发送 Request 包
- **那么** Listener 的路由回调正确处理请求并通过同一 Connector 返回 Response

### 需求:MockListener 支持权重和标签
MockListener 必须支持通过构造选项设置 weight 和 labels，这些元数据必须与真实 Listener 行为一致，可被 Discovery 注册和 Provider 过滤。

#### 场景:设置权重和标签
- **当** 使用 `{ weight: 200, labels: { region: 'us-east' } }` 创建 MockListener
- **那么** `metaData.weight` 为 200，`metaData.labels` 包含 `region: 'us-east'`
