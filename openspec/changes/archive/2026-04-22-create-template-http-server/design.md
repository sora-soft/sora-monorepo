## Context

`apps/example` 是当前 sora framework 的完整示例项目，包含 account/auth 系统、数据库迁移、AliCloud 集成、ForwardRoute 转发网关等。它功能完整但对外部中间件依赖重（MySQL、Redis、Etcd、AliCloud），不适合作为 `sora new` 的轻量入门模板。

`packages/sora-cli` 的 `sora new` 命令已支持通过 npm 包下载模板项目。当前 TEMPLATES 常量仅有 `@sora-soft/example-template` 一个条目。

框架提供了 `@sora-soft/ram-discovery`（纯内存 Discovery 实现），无需 Etcd 即可运行 Runtime。

## Goals / Non-Goals

**Goals:**
- 创建 `apps/template-http-server` 作为极简 HTTP 服务模板
- 零外部中间件依赖：不需要 MySQL、Redis、Etcd
- 使用 RamDiscovery 替代 ETCDDiscovery
- 保留 framework 核心模式：Service、Worker、Route、Provider、Component 骨架
- 提供 HttpService + TestHandler 示例，开箱即可 `pnpm dev` 运行
- 注册到 sora-cli TEMPLATES 供 `sora new` 使用

**Non-Goals:**
- 不实现任何业务逻辑（账号、认证、权限等）
- 不提供数据库能力（用户按需自行添加 database-component）
- 不提供集群服务发现（RamDiscovery 仅进程内有效）
- 不修改 framework 核心代码

## Decisions

### D1: 基于 example 做减法而非从零开始

**选择**: 复制 `apps/example` 并删除不需要的模块
**理由**: 保持项目结构与 example 一致（sora.json 配置、bin/cli.js、Application 启动模式），用户从模板起步后可以参考 example 学习完整模式
**替代方案**: 从零搭建 → 风格可能不一致，遗漏 sora.json 等关键配置

### D2: HttpService 直接挂载 Route，无 ForwardRoute

**选择**: `new HTTPListener(options, koa, Route.callback(handler), labels)`
**理由**: 模板定位是单服务 HTTP，不需要 RPC 转发层。参考 AuthService 中 `Route.callback(route)` 的直接用法
**替代方案**: 保留 ForwardRoute 架构 → 增加不必要的复杂度，与模板目标相悖

### D3: RamDiscovery 替代 ETCDDiscovery

**选择**: `new RamDiscovery()` 作为 discovery，无构造参数
**理由**: 零外部依赖，`startup()`/`shutdown()` 为空操作，适合开发和单实例场景
**替代方案**: 保留 Etcd → 违背零外部依赖的目标

### D4: Com.register() 为空骨架

**选择**: Com 类保留结构但 register() 不注册任何组件，ComponentName enum 为空
**理由**: 用户后续可按需添加 Redis/DB 等组件，保留架构模式
**替代方案**: 完全删除 Com → 丢失组件注册模式示例

### D5: Worker 保留空骨架

**选择**: WorkerName enum 空、WorkerRegister.init() 空调用
**理由**: 保持 sora.json 中 workerDir 配置有效，用户可按需添加 Worker

### D6: 保留依赖最小集

保留的依赖及理由：
- `@sora-soft/framework` — 核心
- `@sora-soft/http-support` — HTTPListener / Koa
- `@sora-soft/ram-discovery` — 内存 discovery
- `@sora-soft/typia-decorator` — @guard 装饰器
- `typia` — 类型校验
- `axios` — ConfigLoader 远程配置加载
- `js-yaml` — ConfigLoader YAML 解析
- `mkdirp` — FileLogger 目录创建
- `moment` — FileLogger 时间格式化
- `reflect-metadata` — 装饰器元数据
- `source-map-support` — 错误堆栈
- `commander` — CLI

### D7: Application.startup() 适配 RamDiscovery

`IApplicationOptions.discovery` 简化为仅保留 `scope` 字段（作为服务命名空间），去掉 `etcdComponentName`。`Runtime.loadConfig` 仍需要 scope。

### D8: HttpService 不调用 connectComponents

由于 Com 中没有注册任何组件，HttpService.startup() 中不需要 `this.connectComponents()` 调用。

## Risks / Trade-offs

**[模板用户后续加组件成本]** → 保留 Com/Worker/Provider 骨架和注释，降低添加成本
**[RamDiscovery 无法跨进程发现]** → 模板定位就是单实例入门，生产环境用户应切换到 etcd-discovery
**[与 example 结构差异可能导致混淆]** → 目录结构保持一致，去除的模块位置留空（如 com/ 不创建），handler/ 有新文件
