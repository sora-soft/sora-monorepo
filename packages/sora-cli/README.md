# @sora-soft/cli

sora 框架的命令行脚手架工具，提供项目创建、代码生成、API 类型导出和 OpenAPI 文档生成等功能。

## 安装 CLI

```bash
npm install -g @sora-soft/cli
```

安装后可通过 `sora` 命令使用。

---

## 创建项目

```bash
sora new my-app
```

CLI 会依次询问项目名称、描述、版本、作者和许可证。确认后从模板仓库克隆项目并用你提供的信息重写 `package.json`。

进入项目目录：

```bash
cd my-app
```

> **注意**：`sora new` 不需要在已有 sora 项目中运行。

## 生成运行时配置

`sora config` 从模板文件生成实际的配置文件，通过交互式问答填充变量：

```bash
sora config -t run/config.template.yml -d run/config.yml
```

CLI 会根据模板中定义的变量逐个询问（主机地址、端口号、密码等），首次输入后会缓存到模板同目录的 `.var.json` 中，再次运行时自动填入。

## 启动服务器

```bash
npm run dev
```

服务器启动后，模板项目中的默认服务即可访问。接下来你可以在此基础上添加自己的 Service、Worker 等组件。

## 添加一个 Service

在 sora 中，Service 是承载业务逻辑的核心单元。通过监听器对外提供服务。

```bash
sora generate:service gateway --listeners http,websocket
```

这个命令做了什么？

1. 在 `src/app/service/` 下生成了 `GatewayService.ts`
2. 因为你选了 listeners，还在 `src/app/handler/` 下生成了 `GatewayHandler.ts`
3. 自动将新服务注册到了枚举和注册函数中
4. 自动向配置模板注入了该服务的监听器配置（端口范围、host 等）

现在重新生成配置并重启服务器，新服务就会生效：

```bash
sora config -t run/config.template.yml -d run/config.yml
npm run dev
```

打开生成的 Handler 文件，你会看到类似这样的代码：

```typescript
/**
 * @soraExport route
 */
class GatewayHandler extends Route {
  @Route.method
  async test(@guard body: void) {
    return { test: true };
  }
}
```

`@soraExport route` 标记了这个类是一个路由处理器，`@Route.method` 标记了对外暴露的方法。你可以在此基础上添加自己的路由方法。

### 监听器类型

| 类型 | 用途 |
|---|---|
| `tcp` | 内部 RPC 通信 |
| `websocket` | WebSocket 连接 |
| `http` | HTTP/HTTPS 请求（集成 Koa） |
| `none` | 不安装监听器，与其他类型互斥 |

可以组合使用多个类型（`none` 除外）。如果不传 `--listeners`，CLI 会交互式让你选择。

### 单例模式

加上 `--standalone` 可以生成 SingletonService（单例服务）：

```bash
sora generate:service scheduler --listeners none --standalone
```

## 添加一个 Worker

Worker 用于运行后台任务，不直接对外提供监听。

```bash
sora generate:worker email-sender
```

生成了 `EmailSenderWorker.ts` 并自动注册。同样支持 `--standalone` 生成单例 Worker。

## 添加一个 Command

CommandWorker 用于处理一次性命令行任务（如数据库迁移、数据初始化等）。

```bash
sora generate:command db-migrate
```

生成的 `DbMigrateCommandWorker.ts` 包含一个 `runCommand(commands: string[])` 方法，你可以在这里实现不同的 action 指令。

## 导出 API 类型

当你在 Handler 中添加了路由方法后，可以将类型声明导出给客户端使用：

```bash
sora export:api
```

这会扫描所有带 `@soraExport` 注解的声明，转为纯 TypeScript 接口文件。

用 `--target` 按 `@soraTargets` 过滤：

```bash
sora export:api --target web
```

**输出位置**：`{apiDeclarationOutput}/api.ts`（全量）或 `api.web.ts`（按 target）

### 导出规则

| `@soraExport` 值 | 转换方式 |
|---|---|
| `route` | 转为接口，保留 `@Route.method` 方法（仅第一个参数 + 返回类型） |
| `entity` | 转为接口，保留公共非静态属性 |
| （无值） | 转为接口，保留公共非静态属性 |
| 枚举 / interface / type alias | 直接导出，确保有 `export` 关键字 |

输出文件中所有 sora 专用 JSDoc 标签会被自动移除，仅保留有意义的文档注释。

## 生成 OpenAPI 文档

从路由类自动生成 OpenAPI 3.0 规范文档：

```bash
sora export:doc
sora export:doc --format json
sora export:doc --target web
```

**前提条件**：`sora.json` 中必须配置 `docOutput` 字段。

**输出位置**：`{docOutput}/api.yml` 或 `api.json`

文档的 `info.title` 和 `info.version` 从项目根目录的 `package.json` 读取。

### 从注解到 OpenAPI 的映射

| 源码 | OpenAPI 字段 |
|---|---|
| 方法的 JSDoc 摘要 | `summary` |
| `@description` | `description` |
| `@method` | HTTP verb（默认 `POST`） |
| `@soraPrefix` | path 前缀（默认 `/`） |
| 方法名 | path 的最后一段 |
| 第一个参数类型 | `requestBody` |
| 返回类型 | `response` schema |

> `@Route.notify` 装饰的方法不会出现在文档中。

---

## 命令参考

```
sora
├── new <name>                      创建新项目
├── config                          从模板生成配置文件
├── generate:service [name]         生成 Service 脚手架
├── generate:worker [name]          生成 Worker 脚手架
├── generate:command [name]         生成 CommandWorker 脚手架
├── export:api                      导出 API 类型声明 (.ts)
└── export:doc                      导出 OpenAPI 文档 (.yml/.json)
```

### `sora new <name>`

| 参数 | 说明 |
|---|---|
| `<name>` | 项目名称 |

从模板仓库克隆并交互式配置项目信息（名称、描述、版本、作者、许可证）。不需要在已有项目中运行。

### `sora generate:service [name]`

| 参数 / Flag | 说明 |
|---|---|
| `[name]` | 服务名称，未提供时交互式询问 |
| `--listeners <types>` | 监听器类型（逗号分隔）：`tcp`, `websocket`, `http`, `none` |
| `--standalone` | 生成 SingletonService |
| `--config-template <path>` | 配置模板文件路径，默认 `run/config.template.yml` |

### `sora generate:worker [name]`

| 参数 / Flag | 说明 |
|---|---|
| `[name]` | 工作器名称，未提供时交互式询问 |
| `--standalone` | 生成 SingletonWorker |
| `--config-template <path>` | 配置模板文件路径，默认 `run/config.template.yml` |

### `sora generate:command [name]`

| 参数 / Flag | 说明 |
|---|---|
| `[name]` | 命令名称，未提供时交互式询问 |
| `--config-template <path>` | 配置模板文件路径，默认 `run/config-command.template.yml` |

### `sora config`

| Flag | 缩写 | 说明 |
|---|---|---|
| `--template <path>` | `-t` | 模板文件路径（必填） |
| `--dist <path>` | `-d` | 输出文件路径（必填） |

模板使用 art-template 引擎，支持以下自定义语法：

| 语法 | 说明 | 示例 |
|---|---|---|
| `#define(key,type,hint)` | 声明交互输入变量 | `#define(port,number,端口号)` |
| `$(variable)` | 变量替换 | `host: $(serverHost)` |

变量类型：`string`（文本）、`password`（密码）、`number`（数字）、`select:[opt1|opt2|...]`（列表选择）、`host-ip`（IP 地址选择）。

首次运行后，输入值保存在模板同目录的 `.var.json` 中。再次运行时自动填入之前的值。

示例模板：

```yaml
#define(dbHost,string,数据库主机)
#define(dbPort,number,数据库端口)
#define(dbUser,string,数据库用户)
#define(dbPassword,password,数据库密码)
#define(env,select:[dev|staging|prod],运行环境)

database:
  host: $(dbHost)
  port: $(dbPort)
  user: $(dbUser)
  password: $(dbPassword)
  database: myapp_$(env)
```

### `sora export:api`

| Flag | 说明 |
|---|---|
| `--target <mode>` | 导出目标，可多次使用 |

### `sora export:doc`

| Flag | 说明 |
|---|---|
| `--format <fmt>` | 输出格式：`yaml`（默认）或 `json` |
| `--target <mode>` | 导出目标，可多次使用 |

---

## sora.json 配置参考

`sora.json` 是 sora 项目的核心配置文件，放置在项目根目录下。

### 配置结构

```json
{
  "root": "src",
  "dist": "dist",
  "serviceDir": "app/service",
  "serviceNameEnum": "app/service/common/ServiceName#ServiceName",
  "serviceRegister": "app/service/common/ServiceRegister#ServiceRegister.init",
  "handlerDir": "app/handler",
  "workerDir": "app/worker",
  "workerNameEnum": "app/worker/common/WorkerName#WorkerName",
  "workerRegister": "app/worker/common/WorkerRegister#WorkerRegister.init",
  "databaseDir": "app/database",
  "componentNameEnum": "lib/Com#ComponentName",
  "comClass": "lib/Com#Com",
  "migration": "app/database/migration",
  "apiDeclarationOutput": "../dist-api-declaration/api",
  "docOutput": "../dist-api-doc/api"
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `root` | `string` | 是 | 源码根目录 |
| `dist` | `string` | 是 | 编译输出目录 |
| `serviceDir` | `string` | 是 | Service 文件存放目录，相对于 `root` |
| `serviceNameEnum` | `string` | 是 | 服务名枚举的符号引用 |
| `serviceRegister` | `string` | 是 | 服务注册函数的符号引用 |
| `handlerDir` | `string` | 是 | Handler 文件存放目录，相对于 `root` |
| `workerDir` | `string` | 是 | Worker 文件存放目录，相对于 `root` |
| `workerNameEnum` | `string` | 是 | 工作器名枚举的符号引用 |
| `workerRegister` | `string` | 是 | 工作器注册函数的符号引用 |
| `databaseDir` | `string` | 是 | 数据库相关文件目录，相对于 `root` |
| `componentNameEnum` | `string` | 是 | 组件名枚举的符号引用 |
| `comClass` | `string` | 是 | Com 组件管理类的符号引用 |
| `migration` | `string` | 否 | 数据库迁移文件目录，相对于 `root` |
| `apiDeclarationOutput` | `string` | 是 | API 类型声明输出路径 |
| `docOutput` | `string` | 否 | OpenAPI 文档输出路径 |

### 符号引用格式

部分字段使用 `"filepath#Symbol"` 格式引用代码中的符号：

- **枚举引用** — `"路径/文件名#枚举名"`

  `"app/service/common/ServiceName#ServiceName"` 指向 `src/app/service/common/ServiceName.ts` 中的 `ServiceName` 枚举。

- **注册方法引用** — `"路径/文件名#类名.方法名"`

  `"app/service/common/ServiceRegister#ServiceRegister.init"` 指向 `ServiceRegister` 类的 `init()` 静态方法。

路径均相对于 `root` 目录，不含文件扩展名。

---

## 注解参考

@​sora-soft/cli 通过 JSDoc 注解控制导出行为和文档生成。

### 声明级注解

| 注解 | 说明 | 影响范围 |
|---|---|---|
| `@soraExport` | 标记需要导出，值为 `route`、`entity` 或无值 | `export:api`、`export:doc` |
| `@soraTargets` | 指定目标环境，逗号分隔 | `export:api`、`export:doc` |
| `@soraPrefix` | API 路径前缀（仅 route 类），逗号分隔多个 | `export:doc` |

### 成员级注解

| 注解 | 说明 | 影响范围 |
|---|---|---|
| `@soraIgnore` | 排除此成员，可选 target（逗号分隔），无参则全部忽略 | `export:api`、`export:doc` |
| `@method` | HTTP 方法，默认 `POST` | `export:doc` |
| `@description` | 方法详细描述 | `export:doc` |

### 装饰器

| 装饰器 | 来源 | 作用 |
|---|---|---|
| `@Route.method` | `@sora-soft/framework` | 请求-响应处理器，导出时保留 |
| `@Route.notify` | `@sora-soft/framework` | 通知处理器，`export:api` 保留但 `export:doc` 不生成文档 |

详细的注解说明、影响范围和代码与生成结果对照示例见 [docs/annotations.md](docs/annotations.md)。

## License

WTFPL
