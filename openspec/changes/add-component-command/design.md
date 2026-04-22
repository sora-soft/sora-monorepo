## Context

sora-cli 是基于 oclif v4 的 CLI 工具，当前提供 `generate:*`（service/worker/command）和 `export:*`（api/doc）命令。`sora.json` 已预留 `componentNameEnum` 和 `comClass` 字段但从未被消费。

现有的 code generation 模式：`BaseCommand.loadConfig()` → `FileTree` 加载 → `CodeInserter` AST 操作 → `fileTree.commit()` 批量提交。`ConfigTemplateInserter` 目前只支持 `services` 和 `workers` section。

组件包（database-component、redis-component、etcd-component）各自导出 `Component` 子类，应用通过 `Com.ts` 手动注册。

## Goals / Non-Goals

**Goals:**
- `sora add:component <package>` 一条命令完成组件的全部接入
- 组件包拥有完全控制权——自己决定问什么、做什么
- 所有文件操作通过 FileTree 提供事务保证（commit/rollback）
- 接口约定极简——组件包只需新增 `sora-component.json` + 一个 install script 文件

**Non-Goals:**
- 不做 oclif 插件机制——install script 不是 plugin，无需 `@oclif/core` 依赖
- 不做独立的 `@sora-soft/cli-helper` 包——类型约定通过 monorepo 内部引用或文档解决
- 不支持同一包多次安装——检测到重复直接报错
- install script 的执行不提供沙箱隔离——基于信任模型

## Decisions

### D1: 两阶段初始化（prepare + action）

组件包提供两个函数：
- `prepare(ctx)` → 返回 `InstallQuestion[]`，CLI 用 inquirer 渲染
- `action(answers, ctx, helpers)` → 执行所有文件变更

**理由**: 将交互定义与执行逻辑分离，CLI 控制询问流程，script 控制操作内容。这比纯声明式模板更灵活——`DatabaseComponent` 需要问数据库类型并据此生成不同的 config，纯模板做不到条件逻辑。

**替代方案**: 纯声明式 `sora-component.json`（只有 templates + initArgs）→ 放弃，因为无法表达条件逻辑和复杂交互。

### D2: helpers 通过参数注入，非 import

`InstallHelpers` 的所有方法由 sora-cli 构造，作为 `action()` 的第三个参数传入。install script 不 import 任何 sora-cli 代码。

**理由**: 避免组件包依赖 sora-cli（方向反转），install script 编译后是自包含 JS，运行时零额外依赖。

### D3: FileTree 事务模型

所有 helpers 操作写入 FileTree 缓冲。`action()` 正常返回后统一 commit；抛异常则丢弃所有变更（rollback）。script 可以绕过 helpers 直接操作文件系统，但无法享受事务保证。

**理由**: 与现有 `generate:*` 命令的 FileTree 模式一致，提供原子性。

### D4: `addComponentToCom` 高度封装

一次调用完成 Com.ts 的四项修改：add import → insert enum member → add static field → insert register call。同时暴露 `addImport`、`insertEnumMember`、`insertStaticField`、`insertRegisterCall` 等原子操作作为 escape hatch。

**理由**: 所有组件的 Com.ts 修改模式完全一致（import + enum + static + register），没必要每个 script 重复组合四步。

### D5: ConfigTemplateInserter 扩展

现有 `insertSectionEntry` 和 `checkDuplicate` 方法支持任意 section 名（已经是字符串参数），但 `checkDuplicate` 的类型签名只允许 `'services' | 'workers'`。需要扩展为接受 `'components'` 以及通用字符串。

`appendToConfigTemplate` helper 同时接受 `defines[]` 和 `content`，处理 `#define` 追加（去重）和 YAML section 追加。

### D6: 重复安装检测

在加载 install script 之前，读取 Com.ts 内容检查是否已包含该包名的 import 语句（匹配 `from '<packageName>'`）。已存在则直接 error 退出。

### D7: 摘要输出

commit 后输出 git-diff 风格摘要：
```
 M  src/lib/Com.ts            +8
 A  src/app/database/migration/business-database/.gitkeep
```
遍历 FileTree 中被修改/新增的文件，统计变更行数。

## Risks / Trade-offs

**[install script 执行任意代码]** → 信任模型。与 postinstall 脚本风险同级，npm 生态已接受此模式。可在文档中提示用户审查。

**[install script 直接操作文件系统绕过 FileTree]** → helpers 提供完整操作集且带事务保证，文档引导使用 helpers。绕过是 script 作者的有意选择，自行承担后果。

**[sora-component.json installScript 路径指向不存在的文件]** → 在加载前检查路径是否存在，不存在则给出明确错误提示。

**[action 执行到一半的 script 自身错误]** → FileTree 未 commit 自动 rollback。但如果 script 已绕过 helpers 写入了文件，那些文件不会被回滚——在错误信息中提示此情况。

**[组件包版本与 CLI 版本不匹配导致的接口变更]** → 接口约定尽量稳定，初期不做版本协商。后续可考虑在 `sora-component.json` 中添加 `cliVersion` 字段。
