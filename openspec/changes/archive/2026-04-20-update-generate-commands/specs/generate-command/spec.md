## ADDED Requirements

### Requirement:generate-command-accepts-name-arg
`generate:command` MUST 接受 `<name>` 作为位置参数。未提供时 MUST 进入交互模式询问。

#### Scenario:name-provided-via-arg
- **When** 用户执行 `sora generate:command Auth`
- **Then** 命令使用 "Auth" 作为 command 名称

#### Scenario:name-missing-enters-interactive
- **When** 用户执行 `sora generate:command`（无位置参数）
- **Then** 命令显示 "Command name?" 提示

### Requirement:generate-command-creates-command-worker
`generate:command` MUST 在 `workerDir` 下创建 `{Name}CommandWorker.ts` 文件，类名为 `{Name}CommandWorker`。

#### Scenario:file-created
- **When** 用户执行 `sora generate:command Auth`
- **Then** 在 workerDir 下创建 `AuthCommandWorker.ts`

### Requirement:generate-command-run-command-method
生成的 CommandWorker MUST 包含 `async runCommand(commands: string[])` 方法，方法体包含 `const [action] = commands;` 和 `switch (action)` 骨架，switch 内包含 `// TODO: 实现不同 action 指令` 注释。

#### Scenario:run-command-method-skeleton
- **When** 生成 CommandWorker 文件
- **Then** 包含以下 runCommand 实现：
  ```typescript
  async runCommand(commands: string[]) {
    const [action] = commands;

    switch (action) {
      // TODO： 实现不同 action 指令
    }
  }
  ```

### Requirement:generate-command-ast-registration
`generate:command` MUST 将新 command worker 注册到 `workerNameEnum`（key 为 `{Name}Command`）和 `workerRegister` 指定的注册方法中。

#### Scenario:enum-and-register-updated
- **When** command worker 生成成功
- **Then** WorkerName enum 添加 `{Name}Command` 成员，WorkerRegister.init() 添加 `{Name}CommandWorker.register()` 调用

### Requirement:generate-command-template-typia
`generate:command` 的模板 MUST 使用 `typia.assert()` 进行类型校验，MUST NOT 使用 `typescript-is`。

#### Scenario:template-uses-typia
- **When** 生成 CommandWorker 文件
- **Then** 构造函数中使用 `typia.assert()`，无 `@AssertType` 或 `@ValidateClass`

### Requirement:generate-command-full-registration
生成的 CommandWorker 类 MUST 包含完整的 `static register()` 方法，注册到 `Node.registerWorker`。

#### Scenario:register-method
- **When** 生成 CommandWorker 文件
- **Then** static register() 调用 `Node.registerWorker(WorkerName.{Name}Command, builder)`
