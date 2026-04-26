## Context

`@sora-soft/framework` 是 sora 微服务框架的核心包，提供 RPC 通信、服务生命周期管理、服务发现、领导者选举、结构化日志和分布式追踪。包内有 ~70 个源文件，分 8 个架构层级，从纯工具类到全局单例 Runtime。

当前状态：零测试覆盖。已有测试工具 `RamDiscovery`（内存 Discovery 实现）和 `RamElection`（内存 Election 实现），以及 vitest 配置。write-tests skill 定义了测试规范（co-location、命名、技术栈）。

约束：
- Runtime 是全局 static 单例，测试间必须通过 `shutdown()` 完全重置
- `@Context.scopeClass` 装饰器产生 Proxy 行为，影响测试中的实例行为
- TCP 测试需要端口隔离，避免并行冲突
- `reflect-metadata` 作为副作用在 `index.ts` 导入时执行

## Goals / Non-Goals

**Goals:**
- 为 framework 包所有模块建立系统性的单元测试和集成测试
- 构建可复用的测试基础设施（MockConnector、MockListener、MockScope），使上层测试不依赖网络 I/O
- 验证核心行为契约：Route 中间件洋葱模型、参数注入、compose 合并、LifeCycle 状态机、Waiter 请求关联、Retry 退避策略
- 验证集成场景：TCP 往返、RPC 完整流程、Provider 自动发现与连接、Service 生命周期、Singleton 选举与故障转移
- 自底向上逐层构建，每层独立可验证，支持中断重启

**Non-Goals:**
- 不追求 100% 行覆盖率，优先覆盖核心行为契约和边界条件
- 不修改任何源码实现（除非发现 bug 需要修复）
- 不引入新的生产依赖
- 不测试其他包（仅 `packages/framework`）
- 不创建 E2E 测试（那是应用层的事）

## Decisions

### Decision 1: MockConnector 使用 PassThrough Stream 模拟通讯

**选择**: MockConnector 内部使用 Node.js `stream.PassThrough` 创建双工管道，两个 MockConnector 通过 pipe 互连模拟通讯。

**理由**: PassThrough 是纯内存操作、无网络 I/O、无端口冲突、确定性高、创建和销毁成本低。对于 RPC 层测试（Route、PacketHandler、Provider），通讯层的细节（编解码、帧分割）不是测试目标，MockConnector 跳过这些直接模拟消息传递。

**替代方案**:
- 真实 TCP 连接：有端口冲突风险，创建/销毁成本高，但测试更真实。保留给 TCP 集成测试（Layer 7）。
- 直接 mock send 方法：过于简单，无法模拟 Connector 的生命周期状态机和 Codec 协商流程。

### Decision 2: MockScope 提供 Minimal Context 上下文

**选择**: 创建 `MockScope extends Scope`，仅提供 ID 和空的 store，用于 Executor/QueueExecutor 等需要 Context.run() 的测试。

**理由**: Executor 在 doJob() 中调用 `Context.run(scope, callback)`，测试时需要合法的 scope 实例。使用 RootScope 也可行，但引入不必要的依赖。MockScope 更轻量、意图更明确。

### Decision 3: 大多数测试使用 MockConnector，仅 TCP 测试使用真实连接

**选择**: RPC 层（Route、PacketHandler、Provider、Broadcaster）的测试统一使用 MockConnector。TCP 层（TCPListener、TCPConnector、TCPUtility）的集成测试使用真实 TCP 连接。

**理由**: MockConnector 使测试更可控、更快、更独立。真实 TCP 连接仅在需要测试编解码、帧分割、断线重连等传输层行为时使用。

### Decision 4: 测试分层与推进顺序

**选择**: 按 Layer 0 → 8 顺序推进。每层完成后标记，支持中断重启。

```
Layer 0: Pure Values         (ExError, LabelFilter, Utility, enums, errors)
Layer 1: Stateful Utilities  (LifeCycle, Ref, LifeRef, Waiter, Timer, Time, Retry, QueueExecutor, Executor, SubscriptionManager)
Layer 2: Context System      (Context, Scope, RootScope, WorkerScope, ComponentScope)
Layer 3: Trace System        (Trace, TraceContext, InnerTrace/RpcClient/RpcServer)
Layer 4: Logger System       (Logger, LoggerOutput, ConsoleOutput)
Layer 5: RPC Core            (Route, Codec, JsonBufferCodec, Packets)
Layer 6: RPC Infrastructure  (需先建 MockConnector/MockListener → PacketHandler, Provider, RPCSender, Broadcaster)
Layer 7: TCP Transport       (TCPUtility, TCPListener + TCPConnector 集成)
Layer 8: Framework Lifecycle (Component, Worker, Service, Node, Singleton*, Runtime, NodeHandler)
```

### Decision 5: Runtime 清理机制需要验证

**选择**: 在 Layer 8 集成测试中重点验证 `Runtime.shutdown()` 是否完全清理全局状态，包括：services/works/components map 清空、process signal handlers 移除、discovery 断开、ProviderManager 销毁。

**理由**: Runtime 是 static 单例，如果 shutdown 不完全，测试间会相互污染。需要先通过测试验证清理行为，发现清理不完全的 bug 时再修复。

## Risks / Trade-offs

- **[Runtime 状态残留]** → Runtime 是 static 单例，shutdown 不完全会导致测试污染。缓解：每个涉及 Runtime 的测试在 afterEach 中强制调用 shutdown 并断言关键状态已清空。如果发现清理不完全，先记录为 bug，在修复后再完善测试。
- **[Proxy 行为干扰]** → `@Context.scopeClass` 装饰器产生的 Proxy 可能影响断言。缓解：测试中注意 Proxy 的 trap 行为，必要时通过 `Reflect.getPrototypeOf()` 或直接访问内部属性绕过 Proxy。
- **[TCP 端口冲突]** → 并行测试可能端口冲突。缓解：TCPListener 使用 portRange 机制自动选择可用端口，避免硬编码端口。
- **[测试工具维护成本]** → MockConnector/MockListener 需要与真实 Connector/Listener 保持行为一致。缓解：Mock 实现只模拟核心行为（状态机、send/receive），不模拟所有细节。通过 TCP 集成测试验证真实行为，确保 Mock 和真实行为不会出现偏差。
