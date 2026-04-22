## 1. 项目骨架创建

- [x] 1.1 创建 `apps/template-http-server` 目录结构，从 `apps/example` 复制并去除 `src/com/`、`src/app/account/`、`src/app/database/`、`src/app/traefik/`、`src/lib/route/` 目录
- [x] 1.2 复制并保留 `bin/cli.js`、`.gitignore`、`LICENSE`、`eslint.config.mjs`、`tsconfig.json` 原样不变
- [x] 1.3 复制并精简 `dependence/` 目录，去掉 docker-compose 中与 MySQL、Redis、Etcd 相关的服务定义

## 2. package.json 精简

- [x] 2.1 创建 `apps/template-http-server/package.json`，name 设为 `@sora-soft/http-server-template`，去除 database-component、redis-component、etcd-component、etcd-discovery、@alicloud/pop-core、mysql2、md5、camelcase、class-validator、uuid 依赖
- [x] 2.2 添加 `@sora-soft/ram-discovery` 到 dependencies
- [x] 2.3 精简 scripts，去除 `migrate:*` 和 `auth` 相关命令

## 3. sora.json 配置

- [x] 3.1 创建 `apps/template-http-server/sora.json`，保留 root/dist/serviceDir/handlerDir/workerDir/componentNameEnum/comClass 配置，去除 databaseDir/migration 相关字段

## 4. lib 层精简

- [x] 4.1 创建 `src/lib/Com.ts`：空 ComponentName enum，Com.register() 空方法体
- [x] 4.2 创建 `src/lib/Provider.ts`：保留 registerSenders()（TCPConnector + WebSocketConnector），去除 Pvd.auth 实例
- [x] 4.3 创建 `src/lib/Const.ts`：去除 ForwardRPCHeader 和 AuthRPCHeader 类，保留为空或仅保留通用常量
- [x] 4.4 创建 `src/lib/Enum.ts`：去除 AccountType enum，仅保留 ConfigFileType
- [x] 4.5 保留 `src/lib/ConfigLoader.ts`、`src/lib/FileLogger.ts`、`src/lib/Utility.ts` 原样

## 5. app 层精简

- [x] 5.1 创建 `src/app/Application.ts`：import RamDiscovery 替代 ETCDDiscovery，IApplicationOptions.discovery 去掉 etcdComponentName，start() 中用 `new RamDiscovery()` 替代 `new ETCDDiscovery()`，Com.register() 后无需加载 component options
- [x] 5.2 创建 `src/app/AppError.ts`、`src/app/AppLogger.ts`、`src/app/UserError.ts` 保留原样
- [x] 5.3 创建 `src/app/ErrorCode.ts`：AppErrorCode 保留通用错误码（ErrUnknown/ErrLoadConfig/ErrConfigNotFound/ErrCommandNotFound/ErrServiceNotCreated/ErrWorkerNotCreated/ErrComponentNotFound），去除账号相关错误码；UserErrorCode 保留 ErrParametersInvalid，去除其余
- [x] 5.4 创建 `src/app/Const.ts` 和 `src/app/Types.ts` 保留原样（Types.ts 中 ISoraConfig 去掉 userErrorCodeEnum 可选保留）

## 6. HttpService + TestHandler

- [x] 6.1 创建 `src/app/service/HttpService.ts`：继承 Service，register() 注册到 ServiceName.HttpService，startup() 中创建 Koa + HTTPListener + Route.callback(TestHandler)，无需 connectComponents
- [x] 6.2 创建 `src/app/handler/TestHandler.ts`：继承 Route，@Route.method test() 方法返回 `{ result: 'ok' }`
- [x] 6.3 创建 `src/app/service/common/ServiceName.ts`：enum 仅包含 `HttpService = 'http-service'`
- [x] 6.4 创建 `src/app/service/common/ServiceRegister.ts`：仅注册 HttpService

## 7. Worker 空骨架

- [x] 7.1 创建 `src/app/worker/common/WorkerName.ts`：空 enum
- [x] 7.2 创建 `src/app/worker/common/WorkerRegister.ts`：init() 空方法体

## 8. 入口文件

- [x] 8.1 创建 `src/index.ts`：保留 container/server/command 入口，去除 auth script 相关

## 9. CLI 模板注册

- [x] 9.1 在 `packages/sora-cli/src/commands/new.ts` 的 TEMPLATES 数组中新增 `{pkg: '@sora-soft/http-server-template', desc: 'Sora minimal HTTP server template'}` 条目

## 10. 验证

- [x] 10.1 在 `apps/template-http-server` 目录执行 `pnpm install` 验证依赖安装成功
- [x] 10.2 执行 `pnpm build` 验证 TypeScript 编译通过
- [x] 10.3 执行 `pnpm lint` 验证 ESLint 检查通过
