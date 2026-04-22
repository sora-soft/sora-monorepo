# @sora-soft/cli 开发者指南

本文档面向 @sora-soft/cli 的开发者，介绍代码架构、核心模块和内部管线。

---

## 代码架构

```
src/
├── Base.ts                        命令基类，提供 loadConfig()、soraConfig、fileTree
├── commands/                      命令层（用户入口）
│   ├── new.ts                     pacote 下载 npm 模板 + 重写 package.json
│   ├── config.ts                  从 sora.json configTemplates 读取模板，生成配置文件
│   ├── add/
│   │   └── component.ts           安装组件包，加载并执行 install script
│   ├── generate/
│   │   ├── service.ts             生成 Service + Handler + AST 注册 + 配置注入
│   │   ├── worker.ts              生成 Worker + AST 注册 + 配置注入
│   │   └── command.ts             生成 CommandWorker + AST 注册 + 配置注入
│   └── export/
│       ├── api.ts                 export:api 命令入口
│       └── doc.ts                 export:doc 命令入口
├── lib/
│   ├── Config.ts                  读取 sora.json + tsconfig.json
│   ├── Utility.ts                 camelize, dashlize, resolveImportPath
│   ├── ComponentInstallerTypes.ts 组件安装相关类型定义（InstallHelpers 接口等）
│   ├── InstallHelpers.ts          install script 可用的 helper 方法集合
│   ├── ConfigTemplateInserter.ts  向配置模板注入 service/worker 配置片段
│   ├── ast/
│   │   └── CodeInserter.ts        TS AST 操作：插枚举成员、加 import、插代码到类方法
│   ├── fs/
│   │   ├── FileNode.ts            文件节点基类
│   │   ├── ScriptFileNode.ts      可修改的脚本文件节点（内存中的文件内容）
│   │   └── FileTree.ts            虚拟文件树 + 批量提交
│   ├── exporter/                  export:api 管线
│   │   ├── ProgramBuilder.ts      用 tsconfig 创建 ts.Program
│   │   ├── Collector.ts           扫描源码，收集 @soraExport 声明
│   │   ├── AnnotationReader.ts    读取 JSDoc 注解（@soraExport, @soraTargets 等）
│   │   ├── Transformer.ts         AST 转换（class → interface）
│   │   ├── TypeResolver.ts        递归解析类型依赖
│   │   ├── Emitter.ts             打印并写入 .ts 文件
│   │   ├── JSDocUtils.ts          清理 sora 专用 JSDoc 标签
│   │   └── Types.ts               类型定义（ExportPlan, ExportClassInfo 等）
│   └── doc/                       export:doc 管线
│       ├── DocCollector.ts        收集路由类 + 读取 @soraPrefix
│       ├── DocTransformer.ts      路由方法 → OpenAPI PathItem
│       ├── SchemaResolver.ts      TypeScript 类型 → JSON Schema
│       └── OpenApiEmitter.ts      组装 OpenAPI 文档 + 写入文件

template/                          art-template 模板文件（包根目录）
├── service/Service.ts.art
├── handler/Handler.ts.art
├── worker/Worker.ts.art
└── command/CommandWorker.ts.art
```

---

## 核心模块

### Config

读取并解析两个配置文件：

- `sora.json` — 项目结构配置（通过 `import()` 动态加载）
- `tsconfig.json` — TypeScript 编译选项（通过 `ts.convertCompilerOptionsFromJson` 解析）

`soraRoot` 属性将 `sora.json` 所在目录与 `root` 字段拼接，得到源码根目录的绝对路径。

ISoraConfig 接口包含 `configTemplates` 可选字段（数组格式），声明项目使用的配置模板文件路径。各命令通过 `getConfigTemplatePath(type)` 按 type 查找对应模板路径。

### FileTree / ScriptFileNode

FileTree 维护一棵虚拟文件树，支持：

- `getFile(path)` — 获取已有文件
- `newFile(path)` — 创建新的 ScriptFileNode（注意：同名路径会覆盖已有节点）
- `commit()` — 批量写入所有修改

ScriptFileNode 表示一个可修改的 TypeScript 文件，维护一个修改列表（`modify({start, end, content})`），在 `load()` 时从磁盘读取内容，`commit()` 时一次性应用所有修改并写入磁盘。

### CodeInserter

基于 TypeScript Compiler API 的 AST 操作工具，提供三个核心方法：

| 方法 | 功能 |
|---|---|
| `insertEnum(enumName, key, value)` | 向指定枚举追加成员。空枚举时不添加前导逗号，非空时自动处理上一个成员末尾的逗号 |
| `addImport(importName, importFrom, isDefault)` | 添加 import 声明（已有同路径 import 时追加到花括号内）。无已有 import 时在文件头部插入并带换行 |
| `insertCodeInClassMethod(className, method, code)` | 向指定类方法的 body 末尾插入代码。空方法体时追加换行缩进，确保 `}` 独立成行 |
| `insertStaticField(className, fieldName, expression)` | 向类中插入 static 字段。空类时追加换行 |

所有操作通过 `ScriptFileNode.modify()` 记录修改，不直接操作文件。

### ComponentInstallerTypes

定义组件安装相关的所有类型接口：

| 接口 | 用途 |
|---|---|
| `ComponentInstallContext` | 传递给 install script 的上下文（projectRoot, soraRoot, soraConfig, packageDir 等） |
| `ComponentInstallScript` | install script 的 `prepare()` + `action()` 接口 |
| `InstallHelpers` | install script 可调用的 helper 方法接口 |
| `ComponentInfo` | 组件注册信息（import 语句、枚举键值、静态字段、注册调用） |
| `ConfigTemplateEntry` | 配置模板条目（defines 数组 + content 对象） |
| `SoraComponentManifest` | 组件清单（sora-component.json 的结构） |

### InstallHelpers

InstallHelpersImpl 实现 `InstallHelpers` 接口，提供给 install script 的 `action()` 阶段使用。所有文件操作通过 FileTree 缓冲，支持事务回滚。

| 方法 | 功能 |
|---|---|
| `addComponentToCom(info)` | 向 Com.ts 添加 import、枚举成员、静态字段和 register 调用 |
| `appendToConfigTemplate(entry)` | 向 server 配置模板（从 configTemplates 的 `server` 类型读取）追加 #define 和 YAML 内容 |
| `appendToCommandConfigTemplate(entry)` | 向 command 配置模板追加内容。文件不存在时询问用户是否创建；新建时包含完整的 defines + components + workers |
| `addWorkerToProject(options)` | 渲染 Worker 模板 → 写入文件 → 插入 WorkerName 枚举 → 插入 WorkerRegister import + register 调用 |
| `mergePackageScripts(scripts)` | 向 package.json 的 scripts 字段合并。冲突时 warn 跳过 |
| `mergePackageDependencies(deps)` | 向 package.json 的 dependencies 合并。已存在于 dependencies 或 devDependencies 的跳过 |
| `mergeJSON(targetPath, data)` | 深度合并 JSON 文件（冲突字段 warn 跳过） |
| `copyFile / writeFile / ensureDir` | 基础文件操作 |
| `camelize / dashlize / log / warn` | 工具方法 |

package.json 操作通过 `readPackageJson()` / `writePackageJson()` 内部方法实现，优先从 FileTree 缓存读取，避免多次调用 `newFile()` 互相覆盖。

### ConfigTemplateInserter

向 art-template 配置文件注入 service/worker 配置片段：

1. `extractDefines()` — 分离 `#define` 行和 YAML 内容
2. `checkDuplicate()` — 检查 section 下是否已存在该 key
3. `buildServiceConfigFragment()` / `buildWorkerConfigFragment()` — 构建配置片段
4. `insertSectionEntry()` — 将 0 缩进的单行片段插入到 YAML 的对应 section 中（添加 `  ` 前缀）
5. `insertSectionEntryRaw()` — 将已有正确缩进的多行片段插入到 section 中（不添加前缀）
6. `appendToConfigTemplateEntry()` — 完整的追加流程：去重检查 → 追加 defines → 逐 section 插入
7. `dedent()` — 计算多行文本的最小缩进并去除

Service 配置片段根据 listeners 生成监听器块（含 portRange、host、exposeHost），Worker 配置片段为空对象。

### AnnotationReader

从 AST 节点的 JSDoc 注解中读取 sora 专用标签：

| 方法 | 读取的注解 |
|---|---|
| `readDeclaration(node)` | `@soraExport`（值：`route`/`entity`/无值）+ `@soraTargets` |
| `readMemberIgnore(node)` | `@soraIgnore` + `@soraTargets`（注：当前实现存在设计问题） |
| `readPrefix(node)` | `@soraPrefix`（逗号分隔多值） |
| `readHttpMethod(node)` | `@method` |
| `readModes(tags)` | `@soraTargets`（逗号分隔） |

### Utility

| 方法 | 功能 |
|---|---|
| `camelize(str, upperFirst)` | 转驼峰命名（如 `task-processor` → `TaskProcessor`） |
| `dashlize(str)` | 转短横线命名（如 `TaskProcessor` → `task-processor`） |
| `resolveImportPath(from, to)` | 计算从 `from` 到 `to` 的相对 import 路径 |

---

## config 命令流程

```
┌─────────────────────────────────────────────────────────────┐
│                    sora config 流程                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. loadConfig()                                            │
│     └── 读取 sora.json + tsconfig.json                      │
│                                                             │
│  2. 读取 configTemplates 数组                               │
│     └── 遍历所有 {type, path} 条目                          │
│                                                             │
│  3. 对每个条目：                                            │
│     ├── 校验 path 包含 '.template.'                         │
│     ├── 计算输出路径：去掉 '.template.'                     │
│     ├── 如果输出路径与模板路径相同则报错                    │
│     └── 如果模板文件不存在则 warn 跳过                      │
│                                                             │
│  4. generateConfigFile()                                    │
│     ├── 读取模板文件                                        │
│     ├── 提取 #define 变量声明                               │
│     ├── 用 inquirer 交互式收集变量值                        │
│     ├── art-template 渲染最终配置                           │
│     ├── 缓存变量值到 .var.json                              │
│     └── 写入输出文件                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 代码生成流程（generate:*）

以 `generate:service` 为例，完整流程如下：

```
┌─────────────────────────────────────────────────────────────┐
│                  generate:service 流程                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. loadConfig()                                            │
│     └── 读取 sora.json + tsconfig.json                      │
│                                                             │
│  2. 交互式获取参数                                          │
│     ├── name（位置参数或 inquirer）                          │
│     ├── listeners（--listeners 或 inquirer checkbox）       │
│     └── standalone（--standalone 或 inquirer confirm）      │
│                                                             │
│  3. 计算路径                                                │
│     ├── Service 文件：serviceDir/PascalNameService.ts       │
│     ├── Handler 文件：handlerDir/PascalNameHandler.ts       │
│     ├── 枚举文件：serviceNameEnum 指向的文件                │
│     └── 注册文件：serviceRegister 指向的文件                │
│                                                             │
│  4. 用 art-template 渲染 Service 文件                       │
│     └── template/service/Service.ts.art                     │
│                                                             │
│  5. AST 注册（如有 listeners 则生成 Handler）               │
│     ├── CodeInserter.insertEnum() → 插入枚举成员            │
│     ├── CodeInserter.addImport() → 添加 import              │
│     └── CodeInserter.insertCodeInClassMethod()              │
│         → 插入 ClassName.register() 调用                   │
│                                                             │
│  6. fileTree.commit() → 批量写入所有文件                    │
│                                                             │
│  7. ConfigTemplateInserter.insertConfig()                   │
│     └── 向配置模板注入 service 配置片段                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

`generate:worker` 和 `generate:command` 流程类似，但不生成 Handler。

### 生成的文件结构

**Service**（`template/service/Service.ts.art`）：

```typescript
import {type IServiceOptions, Node, Service} from '@sora-soft/framework';
// 根据 listeners 额外导入: JsonBufferCodec, Route, TCPListener, WebSocketListener, HTTPListener, Koa
import typia from 'typia';
// 根据 listeners 导入 Handler
import {ServiceName} from './ServiceName.js';

export interface I{Name}Options extends IServiceOptions {
  // 根据 listeners 添加: tcpListener, websocketListener, httpListener
}

class {Name}Service extends Service { // 或 SingletonService
  static register() {
    Node.registerService(ServiceName.{Name}, (options: I{Name}Options) => {
      return new {Name}Service(ServiceName.{Name}, options);
    });
  }

  constructor(name: string, options: I{Name}Options) {
    typia.assert<I{Name}Options>(options);
    super(name, options);
  }

  protected async startup() {
    // 根据 listeners 安装对应 Listener
  }

  protected async shutdown() {}
  declare protected options_: I{Name}Options;
}
```

**Handler**（`template/handler/Handler.ts.art`）：

```typescript
import {Route} from '@sora-soft/framework';
import {guard} from '@sora-soft/typia-decorator';

/**
 * @soraExport route
 * @soraTargets web
 */
class {Name}Handler extends Route {
  @Route.method
  async test(@guard body: void) {
    return { test: true };
  }
}
```

**Worker**（`template/worker/Worker.ts.art`）：

```typescript
import {type IWorkerOptions, Node, Worker} from '@sora-soft/framework';
import typia from 'typia';
import {WorkerName} from './WorkerName.js';

export interface I{Name}WorkerOptions extends IWorkerOptions {}

class {Name}Worker extends Worker { // 或 SingletonWorker
  static register() {
    Node.registerWorker(WorkerName.{Name}, (options: I{Name}WorkerOptions) => {
      return new {Name}Worker(WorkerName.{Name}, options);
    });
  }

  constructor(name: string, options: I{Name}WorkerOptions) {
    typia.assert<I{Name}WorkerOptions>(options);
    super(name, options);
  }

  protected async startup() {}
  protected async shutdown() {}
  declare protected options_: I{Name}WorkerOptions;
}
```

**CommandWorker**（`template/command/CommandWorker.ts.art`）：

```typescript
import {type IWorkerOptions, Node, Worker} from '@sora-soft/framework';
import typia from 'typia';
import {WorkerName} from './WorkerName.js';

export interface I{Name}CommandWorkerOptions extends IWorkerOptions {}

class {Name}CommandWorker extends Worker {
  static register() {
    Node.registerWorker(WorkerName.{Name}Command, (options) => {
      return new {Name}CommandWorker(WorkerName.{Name}Command, options);
    });
  }

  constructor(name: string, options: I{Name}CommandWorkerOptions) {
    typia.assert<I{Name}CommandWorkerOptions>(options);
    super(name, options);
  }

  protected async startup() {}
  protected async shutdown() {}

  async runCommand(commands: string[]) {
    const [action] = commands;
    switch (action) {
      // TODO: 实现 action 指令
    }
    return true;
  }

  declare protected options_: I{Name}CommandWorkerOptions;
}
```

---

## export:api 管线

```
源码目录
   │
   ▼
ProgramBuilder.build()
   │  用 tsconfig.json 创建 ts.Program
   ▼
Collector.collect(program)
   │  遍历所有源文件，AnnotationReader.readDeclaration() 识别 @soraExport
   │  输出 ExportPlan { routes, entities, simple }
   ▼
Collector.filterByTarget(plan, targets)
   │  按 @soraTargets 过滤（无 target 参数时不过滤）
   ▼
Transformer.transform(program, routes, entities, simple, targets)
   │  route 类 → interface（保留 @Route.method 方法，取第一个参数 + 返回类型）
   │  entity 类 → interface（保留公共非静态属性）
   │  无 @soraExport 值的类 → interface（保留公共非静态属性，不含方法）
   │  enum / interface / type alias → 确保 export 关键字
   │  @soraIgnore 标记的成员被过滤
   ▼
TypeResolver.resolve(program, declarations)
   │  递归解析声明中引用的自定义类型
   │  确保所有依赖类型都被收集
   ▼
Emitter.emitFile(declarations, [], typeDeps, suffix?)
   │  ts.createPrinter() 打印 AST 节点
   │  stripSoraTagsFromOutput() 清理 sora 专用 JSDoc 标签
   │  写入 {apiDeclarationOutput}/api.ts 或 api.{target}.ts
   ▼
输出文件
```

---

## export:doc 管线

```
源码目录
   │
   ▼
ProgramBuilder.build()
   │
   ▼
DocCollector.collect(program)
   │  复用 Collector 收集 route 类
   │  额外读取 @soraPrefix（逗号分隔，默认 ['/']）
   │  输出 DocExportPlan { routes: DocRouteInfo[] }
   ▼
DocCollector.filterByTarget(plan, targets)
   │
   ▼
DocTransformer.transform(program, routes, targets)
   │  遍历每个 route 类的方法：
   │  ├── 仅收集 @Route.method（排除 @Route.notify）
   │  ├── @soraIgnore 标记的方法被过滤
   │  ├── readSummary() 读取 JSDoc 摘要
   │  ├── readDescription() 读取 @description
   │  ├── readAndValidateHttpMethod() 读取 @method（默认 POST）
   │  ├── getFirstParamType() → requestBody JSON Schema
   │  └── getReturnType() → response JSON Schema（自动 unwrap Promise）
   │  为每个 @soraPrefix 生成 PathItem
   │  输出 DocTransformResult { pathItems }
   ▼
OpenApiEmitter.emit(pathItems, program, routes, targets, format)
   │
   ├── SchemaResolver.collectFromType()
   │   递归收集所有引用类型的 JSON Schema
   │   放入 components/schemas
   │
   ├── readInfo()
   │   向上查找 package.json 读取 name + version
   │
   └── 写入 {docOutput}/api.yml 或 api.json
```

---

## sora.json 与代码的映射

| sora.json 字段 | 消费者 | 用途 |
|---|---|---|
| `root` | `Config.soraRoot` | 拼接为源码根目录绝对路径 |
| `dist` | `Config.ts` | 加载 tsconfig 时使用 |
| `serviceDir` | `generate:service` | Service 文件生成路径 |
| `serviceNameEnum` | `generate:service` | 解析为 `filepath#EnumName`，定位枚举文件和名称 |
| `serviceRegister` | `generate:service` | 解析为 `filepath#Class.method`，定位注册方法 |
| `handlerDir` | `generate:service` | Handler 文件生成路径 |
| `workerDir` | `generate:worker`, `generate:command`, `add:component` | Worker/CommandWorker 文件生成路径 |
| `workerNameEnum` | `generate:worker`, `generate:command`, `add:component` | 解析为 `filepath#EnumName` |
| `workerRegister` | `generate:worker`, `generate:command`, `add:component` | 解析为 `filepath#Class.method` |
| `databaseDir` | — | 暂未被 CLI 命令消费 |
| `componentNameEnum` | `add:component` | 组件名枚举的符号引用 |
| `comClass` | `add:component` | Com 组件管理类的符号引用 |
| `migration` | — | 供 framework 运行时消费，CLI 不使用 |
| `apiDeclarationOutput` | `export:api` | 类型声明输出路径（相对于 soraRoot） |
| `docOutput` | `export:doc` | OpenAPI 文档输出路径（相对于 soraRoot） |
| `configTemplates` | `config`, `generate:*`, `add:component` | 配置模板声明数组，按 type 查找路径 |

### configTemplates 格式

```json
"configTemplates": [
  { "type": "server", "path": "run/config.template.yml" },
  { "type": "command", "path": "run/config-command.template.yml" }
]
```

各消费者按 `type` 字段查找：
- `sora config` — 遍历所有条目，输出文件名去掉 `.template.`
- `generate:service` / `generate:worker` — 查找 `type: "server"`，作为 `--config-template` 的默认值
- `generate:command` — 查找 `type: "command"`
- `add:component` (InstallHelpers) — `appendToConfigTemplate` 用 `server`，`appendToCommandConfigTemplate` 用 `command`

---

## add:component 流程

```
┌─────────────────────────────────────────────────────────────┐
│                  add:component 流程                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 解析包名，定位 node_modules 中的包根目录                │
│     └── resolvePackageRoot() 尝试 pnpm/node_modules 路径    │
│                                                             │
│  2. 加载 sora-component.json                                │
│     └── 获取 installScript 路径                             │
│                                                             │
│  3. 动态 import install script                              │
│     └── 提取 prepare() 和 action() 导出                     │
│                                                             │
│  4. 检查重复安装                                            │
│     └── Com.ts 中是否已有该包的 import                      │
│                                                             │
│  5. prepare 阶段                                            │
│     └── 调用 script.prepare(ctx) 获取问题列表               │
│     └── inquirer 渲染交互式问题，收集回答                   │
│                                                             │
│  6. action 阶段（FileTree 事务）                            │
│     ├── 创建 InstallHelpersImpl 实例                        │
│     ├── 调用 script.action(answers, ctx, helpers)           │
│     ├── install script 通过 helpers 执行所有文件变更        │
│     └── 异常时 FileTree rollback，不写入任何文件            │
│                                                             │
│  7. fileTree.commit() → 批量写入所有文件                    │
│                                                             │
│  8. 输出变更摘要（git-diff 风格）                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

install script 的典型执行阶段（以 database-component 为例）：

```
Phase 1: 组件注册
  ├── addComponentToCom()        → Com.ts import + enum + static + register
  ├── ensureDir()                → migration 目录
  ├── mergeJSON(sora.json)       → migration/databaseDir 字段
  └── appendToConfigTemplate()   → server config #define + components 段

Phase 2: Worker 生成
  └── addWorkerToProject()       → 渲染模板 + WorkerName enum + WorkerRegister

Phase 3: 脚本与依赖
  ├── mergePackageScripts()      → 5 个 migrate npm scripts
  ├── mergePackageDependencies() → camelcase, mkdirp, moment
  └── appendToCommandConfigTemplate() → command config components + workers
```

---

## 注解解析机制

注解定义见 README 的 JSDoc 注解参考。以下是解析实现细节。

AnnotationReader 从 AST 节点的 `jsDoc` 属性中读取 JSDoc 标签。`@soraExport` 标签的注释文本决定类型：`route`、`entity` 或无值。一个声明只允许一个 `@soraExport`，否则报错。

`@soraPrefix` 支持逗号分隔的多个前缀，DocCollector 会为每个前缀生成独立的 PathItem。

JSDocUtils 中的 `stripSoraTagsFromComment()` 负责在输出时清理所有 sora 专用标签，保留有意义的文档注释。
