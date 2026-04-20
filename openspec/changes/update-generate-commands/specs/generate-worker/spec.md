## ADDED Requirements

### Requirement:generate-worker-accepts-name-arg
`generate:worker` MUST 接受 `<name>` 作为位置参数。当提供时直接使用；未提供时 MUST 进入交互模式。

#### Scenario:name-provided-via-arg
- **When** 用户执行 `sora generate:worker Test`
- **Then** 命令使用 "Test" 作为 worker 名称

#### Scenario:name-missing-enters-interactive
- **When** 用户执行 `sora generate:worker`（无位置参数）
- **Then** 命令显示 "Worker name?" 提示

### Requirement:generate-worker-accepts-standalone-flag
`generate:worker` MUST 接受 `--standalone` 布尔 flag。提供时生成 SingletonWorker 子类；未提供时进入交互模式询问。

#### Scenario:standalone-provided-via-flag
- **When** 用户执行 `sora generate:worker Test --standalone`
- **Then** 生成的类继承 SingletonWorker

#### Scenario:standalone-missing-enters-interactive
- **When** 用户未提供 --standalone
- **Then** 命令显示 "Standalone mode?" 是/否 选择提示

### Requirement:generate-worker-ast-registration
`generate:worker` MUST 将新 worker 注册到 `workerNameEnum` 指定的 enum 和 `workerRegister` 指定的注册方法中。

#### Scenario:enum-and-register-updated
- **When** worker 生成成功
- **Then** WorkerName enum 添加新成员，WorkerRegister.init() 添加 `{Name}Worker.register()` 调用

### Requirement:generate-worker-template-typia
`generate:worker` 的模板 MUST 使用 `typia.assert()` 进行类型校验，MUST NOT 使用 `typescript-is`。

#### Scenario:template-uses-typia
- **When** 生成 Worker 文件
- **Then** 构造函数中使用 `typia.assert<IWorkerOptions>(options)`，无 `@AssertType` 或 `@ValidateClass`

### Requirement:generate-worker-full-registration
`generate:worker` 生成的 Worker 类 MUST 包含完整的 `static register()` 方法、构造函数、`startup()` 和 `shutdown()` 生命周期方法。

#### Scenario:worker-has-full-structure
- **When** 生成 Worker 文件
- **Then** 包含 static register()、constructor（typia.assert）、startup()、shutdown()、declare protected options_
