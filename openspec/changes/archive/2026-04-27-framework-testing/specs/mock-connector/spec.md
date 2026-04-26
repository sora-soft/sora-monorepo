## ADDED Requirements

### 需求:MockConnector 继承 Connector 并模拟完整生命周期
MockConnector 必须继承 `Connector` 抽象类，实现 `connect()` 和 `disconnect()` 方法，通过状态机模拟 Connector 的完整生命周期：Init → Connecting → Pending → Ready → Stopping → Stopped。创建和销毁时必须不产生任何网络 I/O。

#### 场景:创建 MockConnector 实例
- **当** 使用 `new MockConnector()` 创建实例
- **那么** 初始状态为 `ConnectorState.Init`，不监听任何端口，不创建任何 socket

#### 场景:connect 转换到 Ready 状态
- **当** 调用 `start(target, codec)` 方法
- **那么** 状态依次经过 Connecting → Pending → Ready，Codec 通过 negotiate 选定

#### 场景:disconnect 转换到 Stopped 状态
- **当** 调用 `off()` 方法
- **那么** 状态经过 Stopping → Stopped

### 需求:MockConnector 使用 PassThrough Stream 模拟双向通讯
MockConnector 必须使用 Node.js `stream.PassThrough` 作为内部通讯管道。两个 MockConnector 通过 pipe 互连后，一端的 `send()` 必须在另一端触发 `data` 事件。数据必须不经过网络传输。

#### 场景:两个 MockConnector 互连后通讯
- **当** MockConnector A 的 readable pipe 到 MockConnector B 的 writable，反之亦然
- **那么** A 调用 `send()` 发送的数据，B 通过 `data` 事件接收到相同内容

#### 场景:单端发送 Notify
- **当** A 调用 `sendNotify()` 发送 Notify 包
- **那么** B 接收到对应 Notify 数据

### 需求:MockConnector 支持 Codec 协商
MockConnector 必须支持 Codec 选择流程。必须在 Pending 状态时接受对方发来的 codec code 字符串，并通过 `onCodecSelected()` 完成协商进入 Ready 状态。

#### 场景:Codec 协商成功
- **当** 两个 MockConnector 互连后，一端发送 codec code（如 `"json\n"`）
- **那么** 接收端调用 `onCodecSelected()` 注册 codec，状态进入 Ready

#### 场景:静态方法 pair 创建互连对
- **当** 调用 `MockConnector.pair()` 静态方法
- **那么** 返回两个已互连的 MockConnector 实例，Codec 协商完成，双方均为 Ready 状态

### 需求:MockConnector 产生唯一 session ID
每个 MockConnector 实例必须拥有唯一的 `session` 标识（UUID），与其他实例不重复。

#### 场景:多个实例 session 不同
- **当** 创建两个 MockConnector 实例
- **那么** 两者的 `session` 属性值不同
