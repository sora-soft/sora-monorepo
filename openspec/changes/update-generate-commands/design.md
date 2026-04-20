## Context

sora-cli 是基于 oclif v1.x 的 CLI 工具，使用 art-template 模板引擎和 TypeScript Compiler API（CodeInserter）进行 AST 操作。当前 generate 命令有三个问题：

1. 模板使用已废弃的 `typescript-is`（`@AssertType`、`@ValidateClass`），项目已迁移到 `typia`
2. generate:service 不支持 listeners 和 standalone，generate:worker 不支持 standalone
3. 缺少 generate:command，所有 generate 命令无交互模式

现有基础设施：
- **oclif**：约定式路由，`dist/commands/` 目录结构映射命令
- **art-template**：`<%- %>` 语法，模板文件在 `template/` 目录
- **inquirer v8**：已安装，在 `new` 和 `config` 命令中使用
- **CodeInserter**：支持 `insertEnum`、`addImport`、`insertCodeInClassMethod`
- **FileTree**：虚拟文件系统，staged changes + `commit()`
- **sora.json**：定义路径和符号引用（`filepath#Symbol` 格式）

## Goals / Non-Goals

**Goals:**
- 重写三个 generate 命令，支持新参数和交互模式
- 重写模板，与实际代码风格一致（typia）
- 条件性模板渲染：根据 standalone/listeners 选择生成不同内容
- listeners 选项触发 Handler 自动生成
- generate:command 作为新增命令完整实现

**Non-Goals:**
- 不改动 `generate:handler`、`generate:database` 命令
- 不改动 `new`、`config`、`export:api` 命令
- 不改动 oclif 框架或 CodeInserter 的实现
- 不改动 `sora.json` 配置结构
- 不实现模板的运行时组合（使用 art-template 条件渲染，不引入新模板引擎）

## Decisions

### D1: 参数格式 — 位置参数 + 逗号分隔 flags

**选择**：`sora generate:service <name> --listeners tcp,ws --standalone`
**替代方案**：全 flags（`--name Xxx --listeners tcp --listeners ws`）
**理由**：name 作为位置参数更自然，与 `sora new <name>` 风格一致。listeners 逗号分隔比重复 flag 更简洁。oclif 支持 `args` 作为位置参数。

### D2: 模板策略 — 单一模板 + 条件渲染

**选择**：每个生成目标使用一个 `.art` 模板文件，通过 art-template 的 `<% if %>` 条件渲染 standalone/listeners 部分。
**替代方案**：多个模板文件（Service.art、SingletonService.art、ServiceWithListeners.art 等）
**理由**：组合爆炸（2 × 4 = 8 种 Service 模板）。单模板更易维护，art-template 的条件语法足够处理。

### D3: listeners "none" 与其他选项互斥

**选择**：在交互模式中，"none" 是一个显式选项，与 tcp/websocket/http 互斥。命令行模式下 `--listeners none` 或不传 `--listeners` 都表示无 listener。
**理由**：用户明确选择"不需要 listener"与"忘记传参数"语义不同。交互模式中让用户显式确认。

### D4: Handler 自动生成触发条件

**选择**：当 listeners 包含 tcp/websocket/http 任一项时，自动在 `handlerDir` 下生成 `{Name}Handler`（Route 子类），并在 Service 模板的 startup() 中创建关联。
**理由**：参照 AuthService 模式——listener 必须关联一个 Route 回调。生成空 Handler 骨架是合理的默认行为。

### D5: Worker 命名与注册

**选择**：
- `generate:worker` → `{Name}Worker`，注册为 `WorkerName.{Name}`
- `generate:command` → `{Name}CommandWorker`，注册为 `WorkerName.{Name}Command`
**理由**：与 AuthCommandWorker 一致。Command worker 的 enum key 带 `Command` 后缀，文件名带 `CommandWorker` 后缀，避免与普通 Worker 冲突。

### D6: 交互模式实现

**选择**：在每个 generate 命令的 `run()` 方法中，先 parse flags/args，然后检查缺失参数，缺失时用 inquirer 补全。将交互逻辑封装在命令类内部。
**替代方案**：抽取交互逻辑到 BaseCommand 或独立 helper。
**理由**：三个命令的交互流程各不相同，强行抽象增加复杂度。保持内聚更简单。

## Risks / Trade-offs

- **[模板复杂度]** 单模板 + 条件渲染在 listeners 组合较多时可能难以阅读 → 通过清晰的注释和格式化缓解
- **[向后兼容]** 重写 generate:service 和 generate:worker 的 flags 接口，旧用法（如 `--name`）将不可用 → 这是 BREAKING CHANGE，但 CLI 是内部工具，影响可控
- **[Handler 覆盖]** 如果 Handler 文件已存在，会报错中断 → 与当前行为一致，不额外处理
- **[inquirer 类型安全]** inquirer 的类型推断较弱 → 使用类型断言确保安全
