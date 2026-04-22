### 需求:模板项目零外部中间件依赖
`apps/template-http-server` 必须能够在不启动 MySQL、Redis、Etcd 等外部服务的情况下正常运行。项目禁止引入 `@sora-soft/database-component`、`@sora-soft/redis-component`、`@sora-soft/etcd-component`、`@sora-soft/etcd-discovery`、`@alicloud/pop-core`、`mysql2`、`md5`、`camelcase`、`class-validator`、`uuid` 等依赖。

#### 场景:全新安装后直接运行
- **当** 用户通过 `sora new my-project @sora-soft/http-server-template` 创建项目并执行 `pnpm install && pnpm dev`
- **那么** 服务必须在无需任何外部中间件的情况下成功启动并监听 HTTP 端口

### 需求:使用 RamDiscovery 作为服务发现
模板项目的 Application.startup() 必须使用 `RamDiscovery`（来自 `@sora-soft/ram-discovery`）替代 `ETCDDiscovery`。`IApplicationOptions.discovery` 配置禁止包含 `etcdComponentName` 字段。

#### 场景:启动时创建 RamDiscovery
- **当** Application.start() 被调用
- **那么** 创建 `new RamDiscovery()` 实例（无构造参数）并传入 `Runtime.startup(node, discovery)`

### 需求:HttpService 直接处理 HTTP 请求
模板必须提供 `HttpService`，通过 `HTTPListener` 直接挂载 `Route.callback(handler)` 处理请求，禁止使用 `ForwardRoute` 转发层。

#### 场景:HttpService 启动流程
- **当** HttpService.startup() 被调用
- **那么** 创建 Koa 实例，实例化 TestHandler，创建 HTTPListener 挂载 `Route.callback(handler)`，并安装监听器

#### 场景:HttpService 无需连接组件
- **当** HttpService.startup() 被调用
- **那么** 不调用 `this.connectComponents()`，因为 Com 中未注册任何组件

### 需求:TestHandler 提供 test 方法
模板必须提供 `TestHandler` 类（继承 `Route`），使用 `@Route.method` 装饰器暴露 `test()` 方法，返回 `{ result: 'ok' }`。

#### 场景:调用 test 方法
- **当** 客户端向 HTTP 端点发送请求调用 test 方法
- **那么** 返回 JSON 响应 `{ result: 'ok' }`

### 需求:Com 为空骨架
`lib/Com.ts` 必须保留类结构和 `register()` 方法，但 `ComponentName` enum 为空，`register()` 方法体为空。禁止注册任何组件实例。

#### 场景:Com.register() 调用
- **当** Application.start() 调用 Com.register()
- **那么** 不注册任何组件到 Runtime

### 需求:Worker 保留空骨架
模板必须保留 `app/worker/common/WorkerName.ts`（空 enum）和 `app/worker/common/WorkerRegister.ts`（init() 空调用）。

#### 场景:WorkerRegister.init() 调用
- **当** Application.start() 调用 WorkerRegister.init()
- **那么** 不注册任何 Worker

### 需求:去除 account/auth/alicloud 相关代码
模板禁止包含以下目录和文件：`app/account/*`、`app/database/*`、`app/traefik/*`、`com/alicloud/*`、`app/service/AuthService.ts`、`app/handler/AuthHandler.ts`、`app/worker/AuthCommandWorker.ts`、`lib/route/ForwardRoute.ts`、`lib/route/AuthRoute.ts`、`lib/route/AccountRoute.ts`。

#### 场景:目录结构验证
- **当** 检查模板项目目录
- **那么** 上述文件和目录不存在

### 需求:Provider 只注册连接器
`lib/Provider.ts` 必须保留 `registerSenders()` 方法注册 TCPConnector 和 WebSocketConnector，但禁止包含任何具体 Provider 实例（如 `Pvd.auth`）。

#### 场景:Provider.registerSenders() 调用
- **当** Application.start() 调用 Pvd.registerSenders()
- **那么** 注册 TCPConnector 和 WebSocketConnector，不创建任何 Provider 实例
