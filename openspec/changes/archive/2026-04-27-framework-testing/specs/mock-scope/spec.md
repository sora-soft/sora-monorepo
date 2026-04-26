## ADDED Requirements

### 需求:MockScope 继承 Scope 提供最小 Context 上下文
MockScope 必须继承 `Scope` 抽象类，提供 ID 和空 store。用于测试依赖 `Context.run(scope, callback)` 的模块（如 Executor、QueueExecutor），不引入 RootScope/WorkerScope 等完整 scope 的依赖。

#### 场景:创建 MockScope 实例
- **当** 使用 `new MockScope()` 创建实例
- **那么** 实例拥有唯一 ID，store 为空，无 parent scope

#### 场景:在 MockScope 内执行回调
- **当** 调用 `Context.run(mockScope, callback)`
- **那么** callback 内 `Context.current()` 返回 mockScope，`Context.find(MockScope)` 找到该 scope

### 需求:MockScope 支持设置 store 数据
MockScope 必须允许通过 `setStore(data)` 存储测试所需的任意数据，支持 `Context.find()` 查找时读取。

#### 场景:存取数据
- **当** 调用 `mockScope.setStore({ key: 'value' })` 后在 scope 内执行回调
- **那么** 回调内可通过 scope 的 store 读取到 `{ key: 'value' }`

### 需求:MockScope 可选设置 parent scope
MockScope 必须支持通过构造选项指定 parent scope，用于测试 scope 链查找（`Context.find()` 沿 parent chain 向上查找）。

#### 场景:parent chain 查找
- **当** 创建 `mockScope` 时指定 `parentScope` 为另一个 scope
- **那么** `Context.find(ParentScopeClass)` 在 mockScope 的回调内能找到 parentScope
