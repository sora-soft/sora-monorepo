## MODIFIED Requirements

### Requirement:Auto-insert service config on generate
When `generate:service` completes successfully (TS files generated), the system MUST automatically insert a corresponding entry into the specified config template file's `services:` section. The entry key MUST be the dash-case service name. The entry content MUST include listener config fragments for each selected listener type (tcp, http, websocket), or be `{}` if no listeners were selected.

#### Scenario:Service with tcp listener
- **When** `generate:service auth --listeners tcp` completes
- **Then** the config template file's `services:` section MUST contain an entry `auth:` with a `tcpListener:` sub-key containing `portRange`, `host`, and `exposeHost` fields using `$(variable)` template syntax

#### Scenario:Service with no listeners
- **When** `generate:service scheduler --listeners none` completes
- **Then** the config template file's `services:` section MUST contain an entry `scheduler: {}`

#### Scenario:Service with multiple listeners
- **When** `generate:service gateway --listeners tcp,http,websocket` completes
- **Then** the config template file's `services:` section MUST contain an entry with `tcpListener:`, `httpListener:`, and `websocketListener:` sub-keys, where `websocketListener` MUST include `entryPath: '/ws'`

### Requirement:Auto-insert worker config on generate
When `generate:worker` completes successfully, the system MUST automatically insert an entry `{}` into the specified config template file's `workers:` section. The entry key MUST be the dash-case worker name.

#### Scenario:Worker generation inserts empty config
- **When** `generate:worker email-sender` completes
- **Then** the config template file's `workers:` section MUST contain an entry `email-sender: {}`

### Requirement:Auto-insert command worker config on generate
When `generate:command` completes successfully, the system MUST automatically insert an entry `{}` into the specified config template file's `workers:` section. The entry key MUST be the dash-case command name with `-command` suffix.

#### Scenario:Command generation inserts empty config
- **When** `generate:command auth` completes
- **Then** the config template file's `workers:` section MUST contain an entry `auth-command: {}`

### Requirement:Duplicate detection
Before inserting a new config entry, the system MUST parse the YAML content (excluding `#define` lines) using js-yaml and check whether the target key already exists under the target section. If it exists, the system MUST output a warning and skip insertion without erroring. The `checkDuplicate` 方法 MUST 接受任意 section 名称（不限于 `services` 和 `workers`）。

#### Scenario:Service already exists in config
- **When** `generate:service auth` is run but `services.auth` already exists in the config template
- **Then** the system MUST log a warning message and MUST NOT modify the config template

#### Scenario:Worker already exists in config
- **When** `generate:worker email-sender` is run but `workers.email-sender` already exists in the config template
- **Then** the system MUST log a warning message and MUST NOT modify the config template

#### Scenario:Component already exists in config
- **When** install script 插入 `components.database` 但该 key 已存在
- **Then** 系统 MUST 输出警告并跳过插入

### Requirement:Preserve original file format
The config template insertion MUST use string matching and text splicing, NOT YAML round-trip serialization. The `#define` macro lines, blank lines, quoting style, and indentation of the original file MUST be preserved. Only the target insertion point MUST be modified.

#### Scenario:Format preservation after insertion
- **When** a new service entry is inserted into a config template containing `#define` macros
- **Then** all `#define` lines MUST remain unchanged and in their original positions, blank lines between top-level keys MUST be preserved, and only the `services:` section MUST contain the new entry

### Requirement:Handle section variants
The system MUST handle three forms of config template sections: inline empty (`xxx: {}`), block with existing entries (`xxx:` on its own line with indented children), and absent (section not present in file). For inline empty, the entire line MUST be replaced. For block form, the new entry MUST be inserted as the first child. For absent, the section MUST be appended at file end. 这 MUST 适用于任意 section 名称，不仅限于 `services` 和 `workers`。

#### Scenario:Inline empty workers
- **When** config template contains `workers: {}` and a worker is generated
- **Then** the `workers: {}` line MUST be replaced with `workers:\n  name: {}`

#### Scenario:Block form services
- **When** config template contains `services:` with existing entries and a new service is generated
- **Then** the new service entry MUST be inserted as the first child under `services:`

#### Scenario:Missing section
- **When** config template has no `workers:` section and a worker is generated
- **Then** `workers:\n  name: {}` MUST be appended at the end of the file

#### Scenario:Missing components section
- **When** install script 向 `components` section 插入内容但文件中没有 `components:` section
- **Then** `components:\n  <content>` MUST be追加到文件末尾

## ADDED Requirements

### Requirement:Append define statements
系统 MUST 支持向 config template 追加新的 `#define` 语句。追加前 MUST 检查变量名是否已存在（通过 `defineKeys` Set）。已存在的同名变量 MUST 被跳过，不重复添加。

#### Scenario:New define variables added
- **When** install script 提供 `defines: ["#define(db-host,string,数据库地址)", "#define(db-port,number,数据库端口)"]` 且这些变量名不存在
- **Then** 这些 `#define` 行 MUST 被追加到文件顶部的 define 区域

#### Scenario:Duplicate define skipped
- **When** install script 提供 `defines: ["#define(host,string,...)"]` 但 `host` 变量已存在
- **Then** 该 `#define` 行 MUST 被跳过，不重复添加

### Requirement:appendToConfigTemplate helper method
`ConfigTemplateInserter` MUST 提供 `appendToConfigTemplate(templatePath, entry, log)` 静态方法。该方法 MUST 接受 `ConfigTemplateEntry`（包含 `section`、`defines`、`content`），自动处理 `#define` 追加（去重）和 YAML section 追加。

#### Scenario:Helper called from install script
- **When** 通过 helpers 调用 `appendToConfigTemplate({section: "components", defines: [...], content: "..."})`
- **Then** 文件 MUST 同时包含新增的 `#define` 行和新增的 section 内容
