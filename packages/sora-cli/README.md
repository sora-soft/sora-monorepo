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

CLI 会先让你选择项目模板，然后依次询问项目名称、描述、版本、作者和许可证。确认后从 npm 下载模板并用你提供的信息重写 `package.json`。

进入项目目录：

```bash
cd my-app
```

> **注意**：`sora new` 不需要在已有 sora 项目中运行。

## 生成运行时配置

`sora config` 从 `sora.json` 的 `configTemplates` 读取所有模板文件，生成为去掉 `.template.` 的同名文件：

```bash
sora config
```

例如 `run/config.template.yml` → `run/config.yml`，`run/config-command.template.yml` → `run/config-command.yml`。

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
sora config
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

## 添加组件

`sora add:component` 从 npm 包安装预构建的组件到项目中，自动完成注册、配置、文件生成等脚手架工作：

```bash
sora add:component @sora-soft/database-component
```

这个命令做了什么？

1. 从 `node_modules` 中加载包的 `sora-component.json`，执行其 install script
2. Install script 通常会：向 `Com.ts` 注册组件、向 `sora.json` 写入配置、向配置模板注入变量、生成 Worker 和 npm scripts

Install script 分两阶段运行：
- **prepare 阶段**：收集用户输入（组件名、枚举键等）
- **action 阶段**：执行所有文件变更（通过 FileTree 事务保证，失败时全部回滚）

完成后输出变更摘要。如果 install script 添加了新依赖，需要手动执行 `npm install`。

### 组件包结构

组件包需要包含以下文件：

```
your-component/
├── sora-component.json        # 清单文件
├── bin/
│   ├── install.js             # install script
│   └── templates/             # 模板文件（可选）
└── package.json
```

`sora-component.json`：

```json
{
  "installScript": "bin/install.js"
}
```

### Install Script 接口

```typescript
// bin/install.js
export async function prepare(ctx) {
  // ctx: { projectRoot, soraRoot, soraConfig, packageVersion, packageName, packageDir }
  return [
    { type: 'input', name: 'componentName', message: 'Component name?' },
  ];
}

export async function action(answers, ctx, helpers) {
  // helpers 提供以下方法：
  // addComponentToCom(info)               — 注册组件到 Com.ts
  // appendToConfigTemplate(entry)          — 向 server 配置模板追加内容
  // appendToCommandConfigTemplate(entry)   — 向 command 配置模板追加内容
  // addWorkerToProject(options)            — 生成 Worker 并注册
  // mergePackageScripts(scripts)           — 合并 npm scripts
  // mergePackageDependencies(deps)         — 合并 dependencies
  // mergeJSON(targetPath, data)            — 合并 JSON 文件
  // copyFile(from, to) / writeFile / ensureDir
  // camelize / dashlize / log / warn
}
```

---

## 命令参考

```
sora
├── new <name>                      创建新项目
├── config                          从模板生成配置文件
├── add:component <package>         安装组件包
├── generate:service [name]         生成 Service 脚手架
├── generate:worker [name]          生成 Worker 脚手架
├── generate:command [name]         生成 CommandWorker 脚手架
├── export:api                      导出 API 类型声明 (.ts)
└── export:doc                      导出 OpenAPI 文档 (.yml/.json)
```

### `sora new <name>`

| 参数 / Flag | 说明 |
|---|---|
| `<name>` | 项目名称 |
| `[template]` | 模板 npm 包名（可选，跳过交互选择） |
| `--registry <url>` | npm registry URL |
| `--token <token>` | 私有仓库的 auth token |

从 npm 下载模板并交互式配置项目信息（名称、描述、版本、作者、许可证）。不需要在已有项目中运行。

#### 可用模板

| 模板包名 | 描述 |
|---|---|
| `@sora-soft/http-server-template` | 单进程简单 HTTP 服务器 |
| `@sora-soft/account-cluster-template` | 带完整网关与账号登录功能的模板项目 |

如果不在 `[template]` 参数中指定模板，CLI 会交互式列出可用模板供选择，也可以输入自定义包名。

### `sora add:component <package>`

| 参数 | 说明 |
|---|---|
| `<package>` | 组件包名（如 `@sora-soft/database-component`） |

从 `node_modules` 中加载组件包的 install script，自动完成注册、配置注入、文件生成。需要在已有 sora 项目中运行。

### `sora generate:service [name]`

| 参数 / Flag | 说明 |
|---|---|
| `[name]` | 服务名称，未提供时交互式询问 |
| `--listeners <types>` | 监听器类型（逗号分隔）：`tcp`, `websocket`, `http`, `none` |
| `--standalone` | 生成 SingletonService |
| `--config-template <path>` | 配置模板文件路径，默认从 `sora.json` 的 `configTemplates` 中读取 `server` 类型 |

### `sora generate:worker [name]`

| 参数 / Flag | 说明 |
|---|---|
| `[name]` | 工作器名称，未提供时交互式询问 |
| `--standalone` | 生成 SingletonWorker |
| `--config-template <path>` | 配置模板文件路径，默认从 `sora.json` 的 `configTemplates` 中读取 `server` 类型 |

### `sora generate:command [name]`

| 参数 / Flag | 说明 |
|---|---|
| `[name]` | 命令名称，未提供时交互式询问 |
| `--config-template <path>` | 配置模板文件路径，默认从 `sora.json` 的 `configTemplates` 中读取 `command` 类型 |

### `sora config`

从 `sora.json` 的 `configTemplates` 读取所有模板文件路径，逐个生成配置文件。输出文件名由模板文件名去掉 `.template.` 得到（如 `config.template.yml` → `config.yml`）。如果生成的文件名与模板相同则报错。

无需任何参数。

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
  "docOutput": "../dist-api-doc/api",
  "configTemplates": [
    { "type": "server", "path": "run/config.template.yml" },
    { "type": "command", "path": "run/config-command.template.yml" }
  ]
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
| `databaseDir` | `string` | 否 | 数据库相关文件目录，相对于 `root` |
| `componentNameEnum` | `string` | 否 | 组件名枚举的符号引用 |
| `comClass` | `string` | 否 | Com 组件管理类的符号引用 |
| `migration` | `string` | 否 | 数据库迁移文件目录，相对于 `root` |
| `apiDeclarationOutput` | `string` | 是 | API 类型声明输出路径 |
| `docOutput` | `string` | 否 | OpenAPI 文档输出路径 |
| `configTemplates` | `array` | 否 | 配置模板声明，见下文 |

### configTemplates

声明项目使用的配置模板文件路径，供 `sora config --all` 和 `generate:*` 命令使用：

```json
"configTemplates": [
  { "type": "server", "path": "run/config.template.yml" },
  { "type": "command", "path": "run/config-command.template.yml" }
]
```

| 字段 | 说明 |
|---|---|
| `type` | 模板类型标识，`server` 用于应用配置，`command` 用于命令行 Worker 配置。可自定义类型，`sora config --all` 会遍历所有条目 |
| `path` | 模板文件路径，相对于项目根目录 |

`generate:service` 和 `generate:worker` 默认使用 `type: "server"` 的模板路径，`generate:command` 默认使用 `type: "command"` 的模板路径。如果未配置 `configTemplates`，回退到硬编码默认值。

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
