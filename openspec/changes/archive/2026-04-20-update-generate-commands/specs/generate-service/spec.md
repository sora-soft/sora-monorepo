## ADDED Requirements

### Requirement:generate-service-accepts-name-arg
`generate:service` MUST 接受 `<name>` 作为位置参数。当提供时，直接使用该值作为 service 名称；当未提供时，MUST 进入交互模式询问用户输入。

#### Scenario:name-provided-via-arg
- **When** 用户执行 `sora generate:service Auth`
- **Then** 命令使用 "Auth" 作为 service 名称，不询问

#### Scenario:name-missing-enters-interactive
- **When** 用户执行 `sora generate:service`（无位置参数）
- **Then** 命令显示 "Service name?" 提示，等待用户输入

### Requirement:generate-service-accepts-listeners-flag
`generate:service` MUST 接受 `--listeners` flag，值为逗号分隔的 listener 类型列表，支持 `none`、`tcp`、`websocket`、`http`。`none` 与其他选项互斥。当未提供时，MUST 进入交互模式。

#### Scenario:listeners-provided-via-flag
- **When** 用户执行 `sora generate:service Auth --listeners tcp,websocket`
- **Then** 命令使用 tcp 和 websocket listeners，不询问

#### Scenario:listeners-none-via-flag
- **When** 用户执行 `sora generate:service Auth --listeners none`
- **Then** 命令不生成任何 listener 相关代码

#### Scenario:listeners-missing-enters-interactive
- **When** 用户执行 `sora generate:service Auth`（未提供 --listeners）
- **Then** 命令显示 "Which listeners should be installed?" 多选提示，选项为 none、tcp、websocket、http

#### Scenario:listeners-none-exclusive
- **When** 用户在交互模式中选择了 "none"
- **Then** 系统禁止同时选择 tcp、websocket 或 http

### Requirement:generate-service-accepts-standalone-flag
`generate:service` MUST 接受 `--standalone` 布尔 flag。当提供时，生成的 Service 类继承 `SingletonService`；未提供时继承 `Service`。当未提供时，MUST 进入交互模式询问。

#### Scenario:standalone-provided-via-flag
- **When** 用户执行 `sora generate:service Auth --standalone`
- **Then** 生成的类继承 SingletonService，导入 `SingletonService` 而非 `Service`

#### Scenario:standalone-missing-enters-interactive
- **When** 用户执行 `sora generate:service Auth`（未提供 --standalone）
- **Then** 命令显示 "Standalone mode?" 是/否 选择提示

### Requirement:generate-service-conditional-handler
当 listeners 包含 tcp、websocket 或 http 任一项时，`generate:service` MUST 自动在 `handlerDir` 下生成 `{Name}Handler`（Route 子类）。当 listeners 为 none 或空时，MUST NOT 生成 Handler。

#### Scenario:listeners-triggers-handler
- **When** 用户选择 listeners 包含 tcp
- **Then** 在 `handlerDir` 下生成 `{Name}Handler.ts`，包含继承 Route 的类骨架

#### Scenario:no-listeners-no-handler
- **When** 用户选择 listeners 为 none
- **Then** 不生成任何 Handler 文件

### Requirement:generate-service-ast-registration
`generate:service` MUST 将新 service 注册到 `serviceNameEnum` 指定的 enum 和 `serviceRegister` 指定的注册方法中。

#### Scenario:enum-and-register-updated
- **When** 服务生成成功
- **Then** ServiceName enum 添加新成员，ServiceRegister.init() 添加 `{Name}Service.register()` 调用

### Requirement:generate-service-template-typia
`generate:service` 的模板 MUST 使用 `typia.assert()` 进行类型校验，MUST NOT 使用 `typescript-is`（`@AssertType`、`@ValidateClass`）。

#### Scenario:template-uses-typia
- **When** 生成 Service 文件
- **Then** 构造函数中使用 `typia.assert<IOptions>(options)`，无 `@AssertType` 或 `@ValidateClass` 装饰器

### Requirement:generate-service-listeners-in-startup
当 listeners 非空时，生成的 Service 模板的 `startup()` 方法 MUST 包含创建对应 Listener 实例并调用 `installListener()` 的代码。当 listeners 为 none 时，`startup()` MUST 为空（仅包含 TODO 注释或空实现）。

#### Scenario:tcp-listener-in-startup
- **When** listeners 包含 tcp
- **Then** startup() 中包含创建 TCPListener 并 installListener 的代码

#### Scenario:http-listener-in-startup
- **When** listeners 包含 http
- **Then** startup() 中包含创建 HTTPListener 并 installListener 的代码

#### Scenario:websocket-listener-in-startup
- **When** listeners 包含 websocket
- **Then** startup() 中包含创建 WebSocketListener 并 installListener 的代码

#### Scenario:empty-startup-when-none
- **When** listeners 为 none
- **Then** startup() 方法体为空，无 listener 或 handler 相关代码
