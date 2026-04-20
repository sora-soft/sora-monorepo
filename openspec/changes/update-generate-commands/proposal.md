## Why

sora-cli 的 generate 命令存在两个核心问题：

1. **模板过时**：当前模板使用 `typescript-is`（`@AssertType`、`@ValidateClass`），但项目已迁移到 `typia`（`typia.assert`）。生成的代码与实际代码风格严重脱节。
2. **功能缺失**：generate:service 不支持 listeners（TCP/WebSocket/HTTP）和 standalone（单例模式）的生成，generate:worker 不支持 standalone，且缺少 generate:command 指令。此外，所有参数都是 required flags，缺少交互模式，用户体验差。

## What Changes

- **重写 `generate:service`**：接受 `<name>` 位置参数 + `--listeners`（可选，逗号分隔：tcp,websocket,http）+ `--standalone`（布尔 flag）。缺少参数时进入 inquirer 交互模式。根据 listeners 选择自动生成对应 Handler（Route 子类）。
- **重写 `generate:worker`**：接受 `<name>` 位置参数 + `--standalone`（布尔 flag）。缺少参数时进入交互模式。
- **新增 `generate:command`**：接受 `<name>` 位置参数，生成 `{Name}CommandWorker`，包含 `runCommand` 方法骨架。注册到 WorkerName enum 和 WorkerRegister。
- **重写所有模板**：从 `typescript-is` 迁移到 `typia`，参考实际代码（AuthService、TestWorker、AuthCommandWorker）。
- **新增交互模式**：基于 inquirer，当参数不完整时以问答形式引导用户完成配置。

## Capabilities

### New Capabilities
- `generate-service`: 重写 service 生成命令，支持 listeners（tcp/websocket/http）、standalone 模式、交互式参数输入
- `generate-worker`: 重写 worker 生成命令，支持 standalone 模式、交互式参数输入
- `generate-command`: 新增 command worker 生成命令，生成包含 runCommand 骨架的 CommandWorker

### Modified Capabilities
<!-- 无现有规范需要修改 -->

## Impact

- **代码**：`packages/sora-cli/src/commands/generate/service.ts`、`worker.ts` 重写；新增 `command.ts`
- **模板**：`packages/sora-cli/template/service/Service.ts.art`、`worker/Worker.ts.art` 重写；新增 `template/command/CommandWorker.ts.art`；可能微调 `handler/Handler.ts.art`
- **依赖**：已有 `inquirer`，无需新增依赖
- **配置**：`sora.json` 结构不变，现有字段（handlerDir、workerDir、serviceDir 等）继续使用
