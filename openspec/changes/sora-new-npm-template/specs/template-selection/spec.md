## ADDED Requirements

### Requirement:Interactive template selection
当用户执行 `sora new <name>` 且未提供 template 参数时，系统必须展示内置模板列表供用户选择。列表项显示包名和描述，最后一项为 "Custom" 选项允许用户输入自定义包名。

#### Scenario:Select from built-in list
- **WHEN** 用户执行 `sora new my-app`（无 template 参数）
- **THEN** 系统使用 inquirer 展示模板选择列表，每项显示包名和描述，用户选择后进入项目信息收集

#### Scenario:Select custom template
- **WHEN** 用户在模板列表中选择 "Custom" 选项
- **THEN** 系统提示用户输入自定义 npm 包名，随后使用该包名继续流程

### Requirement:Skip selection when template provided
当用户在命令行中提供了 template 参数时，系统必须跳过模板选择步骤，直接使用该参数作为 npm 包名。

#### Scenario:Template specified via CLI argument
- **WHEN** 用户执行 `sora new my-app @sora-soft/example-template`
- **THEN** 系统跳过模板选择，直接进入项目信息收集，使用 `@sora-soft/example-template` 作为下载目标

### Requirement:Built-in template list
系统必须维护一个内置模板列表，每个条目包含 `pkg`（npm 包名）和 `desc`（描述）两个字段，硬编码在 CLI 源码中。

#### Scenario:Template list content
- **WHEN** 系统展示模板选择列表
- **THEN** 列表包含所有内置条目，每项显示包名作为标题、desc 作为副标题

### Requirement:CLI argument signature
`sora new` 命令的参数签名必须为 `<name> [template]`，其中 name 为必填的项目名称，template 为可选的 npm 包名。

#### Scenario:Name only
- **WHEN** 用户执行 `sora new my-app`
- **THEN** 系统解析 name="my-app"，template=undefined，进入交互式模板选择

#### Scenario:Name and template
- **WHEN** 用户执行 `sora new my-app @sora-soft/example-template@^1.0.0`
- **THEN** 系统解析 name="my-app"，template="@sora-soft/example-template@^1.0.0"，跳过模板选择
