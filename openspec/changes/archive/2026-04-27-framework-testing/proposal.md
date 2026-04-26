## Why

`@sora-soft/framework` 包目前零测试覆盖（~70 个源文件，0 个测试文件）。作为分布式微服务框架的核心包，其稳定性直接影响所有上层应用。需要系统性地构建单元测试和集成测试，确保各模块的行为契约正确、回归可控。

## What Changes

- 为 framework 包的 `utility/`、`lib/` 下所有模块添加单元测试（`*.test.ts`）
- 为 RPC、TCP、服务生命周期等跨模块协作添加集成测试（`*.int.test.ts`）
- 新建测试基础设施：`MockConnector`、`MockListener`、`MockScope`，用于在没有网络 I/O 的条件下测试 RPC 层和 Context 层
- 遵循已有的 write-tests skill 规范（co-location、命名、技术栈）

## Capabilities

### New Capabilities
- `mock-connector`: 基于 PassThrough stream 的 MockConnector，模拟 Connector 通讯行为，无网络 I/O，用于 RPC 层单元测试
- `mock-listener`: MockListener，不监听端口，手动注入 Connector 模拟新连接，用于测试 Listener 的连接池管理
- `mock-scope`: MockScope，用于测试依赖 Context 的模块（Executor、QueueExecutor 等），提供最小的 scope 上下文

### Modified Capabilities

（无现有功能需求变更，所有测试均为验证已有行为契约）

## Impact

- **代码范围**: `packages/framework/src/` 下所有模块
- **新增文件**: ~45 个测试文件 + 3 个测试工具文件
- **依赖变更**: 无（vitest 已配置）
- **构建影响**: 无（测试不进入构建产物）
- **CI/CD**: `npm test` 命令已存在，测试将自动纳入 CI 流程
