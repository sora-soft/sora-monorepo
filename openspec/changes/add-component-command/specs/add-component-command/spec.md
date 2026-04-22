## ADDED Requirements

### Requirement:Add component command
系统 MUST 提供 `sora add:component <package>` 命令，接受一个 npm 包名作为参数。命令 MUST 自动执行 `npm install --save <package>` 安装该包，然后读取包内的 `sora-component.json` 文件，加载并运行组件包提供的 install script。

#### Scenario:Basic invocation
- **When** 用户执行 `sora add:component @sora-soft/database-component`
- **Then** 系统 MUST 执行 `npm install --save @sora-soft/database-component`，然后从 `node_modules` 中读取 `sora-component.json`

#### Scenario:Package not found
- **When** 用户提供的包名在 npm registry 中不存在
- **Then** 系统 MUST 输出错误信息并退出，不执行任何文件变更

### Requirement:Load sora-component.json
命令 MUST 从已安装包的根目录读取 `sora-component.json`。该文件 MUST 包含 `installScript` 字段，指向编译后的 JS 文件路径（相对于包根目录）。如果该文件或字段不存在，系统 MUST 报错退出。

#### Scenario:Valid sora-component.json
- **When** 包根目录包含 `sora-component.json` 且有 `installScript: "dist/cli/install.js"`
- **Then** 系统 MUST 加载 `<packageRoot>/dist/cli/install.js` 并提取 `prepare` 和 `action` 导出

#### Scenario:Missing sora-component.json
- **When** 包根目录不包含 `sora-component.json`
- **Then** 系统 MUST 报错 "Package <name> does not contain sora-component.json" 并退出

#### Scenario:Invalid installScript path
- **When** `sora-component.json` 存在但 `installScript` 指向的文件不存在
- **Then** 系统 MUST 报错 "Install script not found: <path>" 并退出

### Requirement:Duplicate installation prevention
在加载 install script 前，系统 MUST 读取项目 Com.ts 的内容，检查是否已包含从该包名的 import 语句（匹配 `from '<packageName>'`）。如果已存在，系统 MUST 报错退出，不执行安装。

#### Scenario:Package already installed
- **When** Com.ts 中已包含 `import {...} from '@sora-soft/database-component'`
- **Then** 系统 MUST 报错 "<package> already installed" 并退出

#### Scenario:Different package same component class
- **When** Com.ts 中有 `@sora-soft/redis-component` 但用户安装的是 `@sora-soft/database-component`
- **Then** 系统 MUST 正常继续，因为不是同一个包

### Requirement:Two-phase initialization
命令 MUST 以两阶段方式运行 install script：
1. **prepare 阶段**：调用 `script.prepare(ctx)`，获取 `InstallQuestion[]`，CLI 用 inquirer 渲染交互式问题，收集用户回答
2. **action 阶段**：调用 `script.action(answers, ctx, helpers)`，传入用户回答、项目上下文、以及操作 helpers

#### Scenario:Prepare returns questions
- **When** `prepare()` 返回包含 `componentName` 和 `enumKey` 两个问题的数组
- **Then** 系统 MUST 依次用 inquirer 渲染这些问题并收集回答

#### Scenario:Prepare returns empty array
- **When** `prepare()` 返回空数组
- **Then** 系统 MUST 跳过交互阶段，直接调用 `action({}, ctx, helpers)`

### Requirement:FileTree transaction guarantee
所有通过 helpers 执行的文件操作 MUST 通过 FileTree 缓冲。`action()` 正常返回后，系统 MUST 调用 `fileTree.commit()` 统一提交所有变更。如果 `action()` 抛出异常，系统 MUST 丢弃 FileTree 中的所有变更（rollback），不写入任何文件。

#### Scenario:Successful action
- **When** `action()` 正常返回
- **Then** 系统 MUST 提交 FileTree 中的所有文件变更

#### Scenario:Action throws error
- **When** `action()` 执行过程中抛出异常
- **Then** 系统 MUST 丢弃所有通过 helpers 进行的文件操作，不写入磁盘

### Requirement:Summary output
commit 成功后，系统 MUST 输出 git-diff 风格的摘要，列出所有被修改/新增的文件及变更行数。格式为 ` M <path> +N`（修改）或 ` A <path>`（新增）。摘要后 MUST 附带 install script 返回的 `postMessage`（如有）。

#### Scenario:Successful installation summary
- **When** `add:component` 成功完成，修改了 Com.ts（+8行）和 config.template.yml（+12行），新增了 .gitkeep 文件
- **Then** 系统 MUST 输出类似以下格式的摘要：
  ```
   M  src/lib/Com.ts            +8
   M  run/config.template.yml   +12
   A  src/app/database/migration/database/.gitkeep
  ```

### Requirement:Config field validation
命令 MUST 要求 `sora.json` 中存在 `root`、`componentNameEnum`（format: `path#name`）和 `comClass`（format: `path#class.method`）字段。缺少任何必要字段时 MUST 报错退出。

#### Scenario:Missing componentNameEnum
- **When** `sora.json` 中没有 `componentNameEnum` 字段
- **Then** 系统 MUST 报错 "Missing required field 'componentNameEnum' in sora.json" 并退出

#### Scenario:All required fields present
- **When** `sora.json` 包含 `root`、`componentNameEnum`、`comClass` 字段
- **Then** 系统 MUST 正常继续执行
