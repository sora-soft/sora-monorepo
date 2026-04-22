## ADDED Requirements

### Requirement:sora-component.json format
组件包 MUST 在包根目录提供 `sora-component.json` 文件，包含 `installScript` 字段。该字段 MUST 指向一个编译后的 JS 文件路径（相对于包根目录），该文件 MUST 导出 `prepare` 和 `action` 两个 async 函数。

#### Scenario:Minimal valid sora-component.json
- **When** 组件包包含 `{"installScript": "dist/cli/install.js"}`
- **Then** sora-cli MUST 从该路径加载 JS 文件并提取 `prepare` 和 `action` 导出

### Requirement:prepare function signature
install script MUST 导出 `prepare(ctx: ComponentInstallContext)` async 函数，返回 `InstallQuestion[]`。每个 question MUST 包含 `type`（`input` | `number` | `confirm` | `select` | `password`）、`name`、`message` 字段。`select` 类型 MUST 同时提供 `choices` 数组。

#### Scenario:Database component prepare
- **When** `prepare()` 返回包含 `componentName`(input)、`enumKey`(input)、`databaseType`(select)、`enableMigration`(confirm) 的问题
- **Then** CLI MUST 按 inquirer 格式渲染这些问题并收集回答

#### Scenario:Simple component prepare
- **When** `prepare()` 返回只包含 `componentName` 和 `enumKey` 两个问题
- **Then** CLI MUST 只渲染这两个问题

### Requirement:action function signature
install script MUST 导出 `action(answers, ctx, helpers)` async 函数。`answers` 为 prepare 阶段收集的用户回答对象。`ctx` 为 `ComponentInstallContext`，MUST 包含 `projectRoot`、`soraRoot`、`soraConfig`、`packageVersion`、`packageName`。`helpers` 为 `InstallHelpers` 实例。

#### Scenario:Action receives all parameters
- **When** CLI 调用 `action(answers, ctx, helpers)`
- **Then** `answers` MUST 包含 prepare 阶段收集的所有回答，`ctx` MUST 包含完整项目信息，`helpers` MUST 包含所有操作方法

### Requirement:addComponentToCom helper
`InstallHelpers` MUST 提供 `addComponentToCom(info: ComponentInfo)` 方法，一次性完成 Com.ts 的四项修改：
1. 添加 import 语句
2. 在 `ComponentName` enum 中插入成员
3. 在 `Com` class 中添加 static field
4. 在 `Com.register()` 方法中插入 register 调用

`ComponentInfo` MUST 包含：`importStatement`、`enumKey`、`enumValue`、`staticFieldName`、`staticFieldExpression`、`registerCall`。

#### Scenario:Database component registration
- **When** script 调用 `helpers.addComponentToCom({importStatement: "import {DatabaseComponent} from '...'", enumKey: "BusinessDB", enumValue: "business-database", staticFieldName: "businessDB", staticFieldExpression: "new DatabaseComponent([])", registerCall: "Runtime.registerComponent(...)"})`
- **Then** Com.ts MUST 被修改为包含对应的 import、enum 成员 `BusinessDB = 'business-database'`、static 字段 `static businessDB = new DatabaseComponent([])`、以及 register 中的调用

#### Scenario:Simple component registration
- **When** script 调用 `addComponentToCom` 且 `staticFieldExpression` 为 `"new RedisComponent()"`
- **Then** Com.ts 中 MUST 添加 `static <fieldName> = new RedisComponent()` 字段

### Requirement:appendToConfigTemplate helper
`InstallHelpers` MUST 提供 `appendToConfigTemplate(entry: ConfigTemplateEntry)` 方法。`ConfigTemplateEntry` MUST 包含 `section`（string）、`defines`（string[]）、`content`（string）。方法 MUST 将 `#define` 行追加到文件顶部的 define 区域（去重），将 `content` 追加到指定 section 内。

#### Scenario:Component config insertion
- **When** script 调用 `appendToConfigTemplate({section: "components", defines: ["#define(db-host,string,数据库地址)"], content: "database:\n  host: $(db-host)"})`
- **Then** config template 中 MUST 包含新的 `#define(db-host,...)` 行，且 `components:` section 下 MUST 包含 `database:` 条目

#### Scenario:Define deduplication
- **When** script 追加的 `#define` 变量名已存在于 config template 中
- **Then** 该 `#define` 行 MUST 被跳过，不重复添加

### Requirement:mergeJSON helper
`InstallHelpers` MUST 提供 `mergeJSON(targetPath: string, data: object)` 方法，对目标 JSON 文件进行 deep merge。现有字段 MUST 保留不变，只添加新字段。如果目标字段已存在且值相同，MUST 跳过。如果目标字段已存在且值不同，MUST 输出警告。

#### Scenario:Merge new fields into sora.json
- **When** script 调用 `mergeJSON("sora.json", {migration: "app/database/migration", databaseDir: "app/database"})`
- **Then** sora.json MUST 包含新字段，已有字段不变

#### Scenario:Conflicting field value
- **When** sora.json 已有 `"migration": "other/path"` 但 script 尝试合并 `"migration": "app/database/migration"`
- **Then** 系统 MUST 输出警告 "Field 'migration' already exists with different value" 并保留原值

### Requirement:File operation helpers
`InstallHelpers` MUST 提供 `copyFile(from, to)`、`writeFile(path, content)`、`ensureDir(path)` 方法，所有操作 MUST 通过 FileTree 执行以获得事务保证。

#### Scenario:Ensure directory creation
- **When** script 调用 `helpers.ensureDir("app/database/migration/business-database")`
- **Then** 对应目录 MUST 在 commit 时被创建

### Requirement:Utility helpers
`InstallHelpers` MUST 提供 `camelize(str, upper?)` 和 `dashlize(str)` 工具方法，行为与 sora-cli 内部 Utility 一致。

#### Scenario:Camelize helper
- **When** script 调用 `helpers.camelize("business-database", true)`
- **Then** MUST 返回 `"BusinessDatabase"`

### Requirement:Output helpers
`InstallHelpers` MUST 提供 `log(message)` 和 `warn(message)` 方法，用于 install script 输出信息。这些消息 MUST 与 CLI 的日志输出集成。

#### Scenario:Script logs message
- **When** script 调用 `helpers.log("请添加 entities")`
- **Then** 该消息 MUST 出现在 CLI 输出中

### Requirement:ComponentInstallContext
`ComponentInstallContext` MUST 包含以下只读字段：`projectRoot`（项目根目录绝对路径）、`soraRoot`（src 根目录绝对路径）、`soraConfig`（sora.json 解析后的对象）、`packageVersion`（安装的组件版本）、`packageName`（组件包名）。

#### Scenario:Context provides project info
- **When** script 的 `prepare()` 或 `action()` 接收 ctx
- **Then** `ctx.projectRoot` MUST 指向项目根目录，`ctx.soraRoot` MUST 指向 `projectRoot/soraConfig.root`
