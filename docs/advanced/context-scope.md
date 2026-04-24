# 上下文与作用域

sora 框架通过 Node.js 的 `AsyncLocalStorage` 实现了隐式的上下文传播机制，允许在异步调用链中自动传递作用域信息。

## Scope 层级

框架维护一个层级作用域链：

```
RootScope (始终存在)
  │
  └── WorkerScope (每个 Worker/Service 实例)
        │
        └── ComponentScope (每个 Component 实例)
```

| 作用域 | 创建者 | 提供的信息 |
|--------|--------|-----------|
| `RootScope` | 框架自动创建 | `logCategory = 'runtime'` |
| `WorkerScope` | Worker 构造函数 | `workerId`, `name`, `hasProvider()`, `hasComponent()` |
| `ComponentScope` | Component 构造函数 | `componentId`, `name` |

## Context API

### Context.scopeClass

类装饰器，使用 Proxy 包装类实例。所有方法调用自动在实例的作用域中执行：

```typescript
// Worker 和 Component 类自动应用此装饰器
@Context.scopeClass
abstract class Worker { ... }
```

这意味着在 Worker 的任何方法中，`Context.current()` 都会返回该 Worker 的 WorkerScope。

### Context.current()

获取当前作用域：

```typescript
import { Context } from '@sora-soft/framework';

const scope = Context.current();
// WorkerScope { workerId: '...', name: 'user-service' }
```

### Context.find()

沿作用域链向上查找特定类型的 Scope：

```typescript
import { Context, WorkerScope, ComponentScope } from '@sora-soft/framework';

// 在任何异步上下文中查找当前 WorkerScope
const workerScope = Context.find(WorkerScope);
if (workerScope) {
  console.log('Current worker:', workerScope.name);
}

// 查找 ComponentScope
const componentScope = Context.find(ComponentScope);
if (componentScope) {
  console.log('Current component:', componentScope.name);
}
```

查找从当前作用域开始，沿 parent 链向上直到 RootScope。如果找不到匹配类型，返回 `null`。

### Context.run()

在指定作用域中执行回调：

```typescript
import { Context } from '@sora-soft/framework';

const workerScope = worker.scope;

const result = Context.run(workerScope, () => {
  // 在此回调中，Context.current() 返回 workerScope
  const currentScope = Context.current();
  return doSomething();
});
```

如果已经在该作用域中，直接执行回调，不嵌套创建新的存储。

### Context.bind()

将函数绑定到指定作用域，之后无论在什么上下文中调用，都在绑定的作用域中执行：

```typescript
const boundFunc = Context.bind(worker.scope, async () => {
  // 始终在 worker.scope 中执行
  const scope = Context.current();
  return scope.name;
});

// 即使在另一个 Worker 的上下文中调用
Context.run(otherWorker.scope, () => {
  boundFunc(); // 仍然在 worker.scope 中执行
});
```

### Context.wrap()

将函数绑定到**当前**作用域。常用于将回调传递给不维护 AsyncLocalStorage 的第三方库：

```typescript
const wrappedCallback = Context.wrap(async (data) => {
  // 在 wrap() 调用时的作用域中执行
  const scope = Context.current();
});

// 传递给第三方库
thirdPartyLib.onData(wrappedCallback);
```

### Context.chain()

获取完整的作用域链（从 RootScope 到当前 Scope）：

```typescript
const chain = Context.chain();
// [RootScope, WorkerScope, ComponentScope]
```

## 作用域自动传播

框架在关键位置自动传播作用域：

```
Provider.rpc().method()
  │
  ├── 作用域自动传播到 RPCSender
  │
  ▼  Connector 发送请求
  │
  ─── 网络传输 ───
  │
  ▼  Listener 接收请求
  │
  ├── Connector 的 scope 自动设置
  │
  ▼  Route 处理器
  │
  Context.find(WorkerScope) → 当前 Service 的 Scope
```

## 与 Logger 集成

Logger 的 `category` 属性自动从当前 Scope 的 `logCategory` 解析：

```typescript
import { Logger } from '@sora-soft/framework';

const logger = new Logger({ identify: 'my-service' });

// 在 Worker 上下文中
logger.category.info('Processing request');
// 日志 category 自动解析为 Worker 的 logCategory
```

CategoryLogger 无需手动指定 category，它会从当前作用域链中自动获取。
