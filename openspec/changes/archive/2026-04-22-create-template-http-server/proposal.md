## Why

`sora new` 目前只有 `@sora-soft/example-template` 一个模板，该模板包含完整的 account/auth 系统、数据库、AliCloud 组件等，对于只想搭建一个简单 HTTP 服务的用户来说过于复杂。需要一个零外部中间件依赖（无 MySQL、Redis、Etcd）的极简 HTTP 服务模板，让用户通过 `sora new` 即可开箱运行。

## What Changes

- **新增** `apps/template-http-server` 目录，基于 `apps/example` 精简而来
- **新增** `HttpService`：直接用 `Route.callback()` 处理 HTTP 请求，无 ForwardRoute 转发层
- **新增** `TestHandler`：继承 `Route`，提供一个 `test()` 方法作为示例
- **去除** 所有 account 相关模块（AccountWorld、AccountPermission、AccountType 等）
- **去除** 所有 auth 相关代码（AuthService、AuthHandler、AuthCommandWorker）
- **去除** AliCloud 组件（`com/alicloud/*`）
- **去除** ForwardRoute、AuthRoute、AccountRoute
- **去除** database-component、redis-component、etcd-component 依赖
- **替换** discovery：从 `ETCDDiscovery` 改为 `RamDiscovery`（零配置，纯内存）
- **精简** Com 只保留空的 register() 骨架
- **精简** Provider 只保留 TCP/WS Connector 注册
- **保留** Worker 空骨架（WorkerName + WorkerRegister）
- **注册** 新模板到 `packages/sora-cli` 的 TEMPLATES 常量中

## Capabilities

### New Capabilities
- `http-service-template`: 极简 HTTP 服务模板项目，基于 sora framework，使用 RamDiscovery，零外部中间件依赖，提供 TestHandler 示例

### Modified Capabilities
- `template-selection`: 在 sora-cli 的 TEMPLATES 常量中新增 `@sora-soft/http-server-template` 条目

## Impact

- **新增目录**: `apps/template-http-server/`（完整项目）
- **修改文件**: `packages/sora-cli/src/commands/new.ts`（TEMPLATES 数组增加条目）
- **新增依赖**: `apps/template-http-server/package.json` 引入 `@sora-soft/ram-discovery`
- **去除依赖**: 相比 example，不引入 database-component、redis-component、etcd-component、etcd-discovery、@alicloud/pop-core、mysql2、md5、camelcase、class-validator、uuid
