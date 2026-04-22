### 需求:交互式模板选择
当用户执行 `sora new <name>` 且未提供 template 参数时，系统必须展示内置模板列表供用户选择。列表项显示包名和描述，最后一项为 "Custom" 选项允许用户输入自定义包名。

#### 场景:从内置列表选择
- **当** 用户执行 `sora new my-app`（无 template 参数）
- **那么** 系统使用 inquirer 展示模板选择列表，每项显示包名和描述，用户选择后进入项目信息收集

#### 场景:选择自定义模板
- **当** 用户在模板列表中选择 "Custom" 选项
- **那么** 系统提示用户输入自定义 npm 包名，随后使用该包名继续流程

### 需求:提供 template 参数时跳过选择
当用户在命令行中提供了 template 参数时，系统必须跳过模板选择步骤，直接使用该参数作为 npm 包名。

#### 场景:通过 CLI 参数指定模板
- **当** 用户执行 `sora new my-app @sora-soft/example-template`
- **那么** 系统跳过模板选择，直接进入项目信息收集，使用 `@sora-soft/example-template` 作为下载目标

### 需求:内置模板列表
系统必须维护一个内置模板列表，每个条目包含 `pkg`（npm 包名）和 `desc`（描述）两个字段，硬编码在 CLI 源码中。

#### 场景:模板列表内容
- **当** 系统展示模板选择列表
- **那么** 列表包含所有内置条目，每项显示包名作为标题、desc 作为副标题

### 需求:CLI 参数签名
`sora new` 命令的参数签名必须为 `<name> [template]`，其中 name 为必填的项目名称，template 为可选的 npm 包名。

#### 场景:仅提供 name
- **当** 用户执行 `sora new my-app`
- **那么** 系统解析 name="my-app"，template=undefined，进入交互式模板选择

#### 场景:提供 name 和 template
- **当** 用户执行 `sora new my-app @sora-soft/example-template@^1.0.0`
- **那么** 系统解析 name="my-app"，template="@sora-soft/example-template@^1.0.0"，跳过模板选择

### 需求:TEMPLATES 常量包含可用模板列表
`sora new` 命令的 TEMPLATES 常量必须在现有 `@sora-soft/example-template` 基础上新增 `@sora-soft/http-server-template` 条目，描述为极简 HTTP 服务模板。

#### 场景:用户交互选择模板
- **当** 用户运行 `sora new my-project` 未指定 template 参数
- **那么** 交互列表中显示 `@sora-soft/http-server-template - Sora minimal HTTP server template` 选项

#### 场景:用户直接指定模板
- **当** 用户运行 `sora new my-project @sora-soft/http-server-template`
- **那么** 直接下载该模板包，不进入交互选择
