## 1. 测试基础设施 (Test Infrastructure)

- [x] 1.1 实现 MockScope (`src/test/tools/mock/MockScope.ts`)：继承 Scope，提供最小 ID + 空 store + 可选 parent，满足 specs/mock-scope 规范
- [x] 1.2 实现 MockConnector (`src/test/tools/mock/MockConnector.ts`)：继承 Connector，使用 PassThrough stream 模拟双向通讯，支持生命周期状态机和 Codec 协商，提供静态 `pair()` 方法创建互连对，满足 specs/mock-connector 规范
- [x] 1.3 实现 MockListener (`src/test/tools/mock/MockListener.ts`)：继承 Listener，不监听端口，提供 `injectConnection()` 手动注入 Connector，支持 weight/labels，满足 specs/mock-listener 规范

## 2. Layer 0: 纯值类型单元测试

- [x] 2.1 `src/utility/ExError.test.ts`：构造 / fromError / toJson / code/name/level/args 属性 / ErrorLevel 枚举值
- [x] 2.2 `src/utility/FrameworkError.test.ts`：正确 code + name，继承 ExError
- [x] 2.3 `src/utility/TimeoutError.test.ts`：正确 code + name，继承 ExError
- [x] 2.4 `src/utility/LabelFilter.test.ts`：INCLUDE 匹配 / EXCLUDE 排除 / AND 组合 / 空规则边界
- [x] 2.5 `src/utility/Utility.test.ts`：UnixTime/NodeTime/NanoTime / ArrayMap(append/sureGet/remove) / null/isMeaningful/parseInt/randomInt/randomOne/randomOneByWeight/deepCopy/hideKeys/formatLogTimeString/mapToJSON/isUndefined
- [x] 2.6 `src/Enum.test.ts` + `src/ErrorCode.test.ts` + `src/Const.test.ts` + `src/Event.test.ts`：枚举值完整性断言，确保所有值存在且不重复

## 3. Layer 1: 有状态工具单元测试

- [x] 3.1 `src/utility/LifeCycle.test.ts`：状态转换 Init→Pending→Ready→Stopping→Stopped / waitFor(state) resolve / waitFor 超时 reject TimeoutError / BehaviorSubject 通知 / destroy()
- [x] 3.2 `src/utility/Ref.test.ts`
- [x] 3.3 `src/utility/LifeRef.test.ts`
- [x] 3.4 `src/utility/Waiter.test.ts`
- [x] 3.5 `src/utility/Timer.test.ts`
- [x] 3.6 `src/utility/Time.test.ts`
- [x] 3.7 `src/utility/Retry.test.ts`
- [x] 3.8 `src/utility/QueueExecutor.test.ts`
- [x] 3.9 `src/utility/Executor.test.ts`
- [x] 3.10 `src/utility/SubscriptionManager.test.ts`
- [x] 3.11 `src/utility/ErrorTracer.test.ts`

## 4. Layer 2: Context 系统单元测试

- [x] 4.1 `src/lib/context/Context.test.ts`：run()+current() / find() 沿 parent chain / chain() / bind()+wrap() / @Context.scopeClass Proxy 行为（方法调用自动进入 scope、异步边界保持 scope、属性访问不触发 trap） / 嵌套 scope
- [x] 4.2 `src/lib/context/Scope.test.ts`：parent chain / isInChain() / store 存取
- [x] 4.3 `src/lib/context/scope/RootScope.test.ts` + `LogScope.test.ts` + `WorkerScope.test.ts` + `ComponentScope.test.ts`：logCategory 正确 / store 正确 / parent 指向正确

## 5. Layer 3: Trace 系统单元测试

- [x] 5.1 `src/lib/trace/Trace.test.ts`：run()+current() / 嵌套不丢失
- [x] 5.2 `src/lib/trace/TraceContext.test.ts`：traceId 32 hex / spanId 16 hex / traceparent W3C 格式 / tracestate / parentSpanId / duration 计时 / flags / run() AsyncLocalStorage 传播 / diagnostics_channel 事件发布
- [x] 5.3 `src/lib/trace/context/InnerTraceContext.test.ts`：从当前 trace 创建 child / 无当前 trace 创建 root
- [x] 5.4 `src/lib/trace/context/RpcClientTraceContext.test.ts`：创建 RPC 客户端 span 继承当前 trace
- [x] 5.5 `src/lib/trace/context/RpcServerTraceContext.test.ts`：从 traceparent 解析 / 无效格式处理 / tracestate 解析

## 6. Layer 4: Logger 系统单元测试

- [x] 6.1 `src/lib/logger/Logger.test.ts`：各级别产生正确 ILoggerData / category 从 Context 自动推断 / CategoryLogger facade / pipe()+end() / errorMessage()
- [x] 6.2 `src/lib/logger/LoggerOutput.test.ts`：QueueExecutor 保证写入顺序 / level 过滤 / output chain
- [x] 6.3 `src/lib/logger/ConsoleOutput.test.ts`：各级别颜色 / 格式化输出（mock console.log）

## 7. Layer 5: RPC Core 单元测试

- [x] 7.1 `src/lib/rpc/Route.test.ts`：@Route.method 注册 / @Route.notify 注册 / callback() 绑定 / compose() 合并（第一个匹配 + 无匹配错误）/ middleware 洋葱模型（pre/post/短路/多层嵌套顺序）/ registerProvider() 参数注入（Request/Response/Connector 自动注入 + 自定义 Provider）/ ExError 序列化为错误响应 / unknown method → RouteError
- [x] 7.2 `src/lib/rpc/Codec.test.ts`：register/get/has / 重复注册覆盖
- [x] 7.3 `src/lib/rpc/JsonBufferCodec.test.ts`：encode+decode 往返 / 自注册到 Codec / code 为 'json'
- [x] 7.4 `src/lib/rpc/packet/RawPacket.test.ts` + `Request.test.ts` + `Response.test.ts` + `Notify.test.ts`：构造 / header 存取 / payload
- [x] 7.5 `src/lib/rpc/RPCError.test.ts` + `RouteError.test.ts` + `ConnectorError.test.ts`：正确 code/name/继承

## 8. Layer 6: RPC Infrastructure 测试（使用 MockConnector/MockListener）

- [x] 8.1 `src/lib/rpc/PacketHandler.test.ts`：Request 分发 / Notify 分发 / Response Waiter 匹配 / Trace span 创建（使用 MockConnector）
- [x] 8.2 `src/lib/rpc/Provider.test.ts`：自动发现→自动连接→RPC 调用 / LabelFilter 过滤 / weight 负载均衡 / 端点动态上下线 / broadcast()（使用 MockConnector + RamDiscovery）
- [x] 8.3 `src/lib/rpc/RPCSender.test.ts`：callRpc() 请求响应 / 自动重连 / 引用计数 / Trace header 传播（使用 MockConnector）
- [x] 8.4 `src/lib/rpc/Broadcaster.test.ts`：registerConnector / removeConnector / notify() 广播到多个 Connector（使用 MockConnector）

## 9. Layer 7: TCP Transport 集成测试

- [x] 9.1 `src/lib/tcp/TCPUtility.test.ts`：encodeMessage+decodeMessage 往返 / zlib 压缩解压 / 大数据 / 空数据
- [x] 9.2 `src/lib/tcp/test/TCPRoundTrip.int.test.ts`：TCPListener+TCPConnector 完整往返 / 消息编解码(JSON→zlib→length-prefix) / 大消息分帧 / 断线重连 / portRange 自动选择 / 并发连接（使用真实 TCP，portRange 端口隔离）

## 10. Layer 8: Framework Lifecycle 集成测试

- [x] 10.1 `src/lib/Component.test.ts`：引用计数 connect/disconnect / 多 Worker 共享同一 Component / loadOptions+setOptions
- [x] 10.2 `src/lib/test/ServiceLifecycle.int.test.ts`：状态机 Init→Pending→Ready→Stopping→Stopped / startup 失败→Error / shutdown 有序性（in-flight task 等待完成）/ doJobInterval 停止后不触发
- [x] 10.3 `src/lib/test/SingletonFailover.int.test.ts`：RamElection 选举竞争 / Leader 停止后 Follower 接管 / 多实例同时竞选
- [x] 10.4 `src/lib/test/RuntimeShutdown.int.test.ts`：并行停止 Workers/Services / Node 最后停止 / 幂等性 / shutdown 后全局状态清理验证（services/works/components map 清空、disconnection 断开）
- [x] 10.5 `src/lib/test/FullStackRpc.int.test.ts`：Runtime+Node+Service+Worker+Provider 完整微服务生命周期 / RPC 请求响应 / Notify / Trace 自动传播（使用 RamDiscovery + TCPListener + TCPConnector）
- [x] 10.6 `src/lib/handler/NodeHandler.test.ts`：createService/createWorker/removeService/removeWorker/shutdown/fetchRunningData 各 RPC method 行为
