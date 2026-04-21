## Context

sora-cli 是基于 oclif v1 的 CLI 工具，提供 `export:api`、`export:doc`、`generate:service`、`generate:worker`、`generate:command` 等命令。当前错误处理存在两个根本性问题：

1. **配置层无验证**：`Config.load()` 只做 `import()` 不检查字段，缺失配置在命令深层以 `TypeError` 或 `undefined` 形式爆发
2. **Pipeline 层静默失败**：AnnotationReader、Collector、Transformer、TypeResolver 等库代码在遇到异常情况时 `continue` 跳过或返回空值，无任何诊断输出
3. **Doc 管线代码重复**：`DocTransformer.typeToJsonSchema()` 和 `SchemaResolver.resolveInline()` 是两套几乎相同的类型→JSON Schema 转换逻辑，且 DocTransformer 中有大量死代码

oclif v1 提供 `this.error(msg)` (致命) 和 `this.warn(msg)` (非致命)。库代码无法访问这些方法，需要一种机制将诊断信息从库层传递到命令层。

## Goals / Non-Goals

**Goals:**
- 配置缺失或格式错误时，立即报告清晰的错误信息（含字段名、期望格式、修复建议）
- Pipeline 处理中遇到异常时，发出 file:line 级别的 Warning 或 Error
- 所有 Error 立即停止执行，所有 Warning 收集后在命令结束时统一输出
- 消除 doc 管线中的代码重复，SchemaResolver 成为唯一类型转换源
- 不引入新的外部依赖

**Non-Goals:**
- 不修改 CLI 的输入输出接口（不改变 flag 名、参数格式等）
- 不重构整体架构（保留 oclif v1、保留现有的 Collector→Transformer→TypeResolver→Emitter 流程）
- 不做 i18n（错误信息保持英文）
- 不添加 `--verbose` 或 `--quiet` 模式（可作为后续改进）

## Decisions

### Decision 1: 全局 DiagnosticCollector 而非回调/返回值携带

**选择**：创建全局 `DiagnosticCollector` 类，所有库代码接收其实例并调用 `addError()` / `addWarning()`。

**备选方案**：
- A) 回调模式：每个库方法接收 `onWarning` 回调 — 需要到处传递回调，签名复杂
- B) 返回值携带：每个方法返回 `{ result, warnings }` — 需要修改所有方法签名，且嵌套调用时 warning 需要手动合并
- C) 全局收集器（选择）— 一个实例传入所有组件，干净简单

**理由**：Pipeline 是多层的（Command → Collector → Transformer → TypeResolver），回调或返回值在多层传递时非常笨重。全局收集器只需创建一次、传递一次、输出一次。

### Decision 2: 按命令配置验证（方案 3）

**选择**：每个命令通过 `requiredConfigFields()` 声明自己需要的配置字段和格式，`BaseCommand.loadConfig()` 根据当前命令的声明进行验证。

**备选方案**：
- A) 集中验证：Config.load() 中检查所有字段 — 过度，因为不同命令需要不同字段
- B) Schema 验证（Zod/Joi）— 引入新依赖，过度工程化
- C) 按命令验证（选择）— 精确，错误信息可以上下文化

**字段格式定义**：
```typescript
interface ConfigFieldRequirement {
  field: string;                          // e.g. 'serviceNameEnum'
  format?: 'path#name' | 'path#class.method';  // 格式验证
}
```

**验证逻辑**：
1. 检查字段值是否为非空字符串
2. 如果有 `format`，验证分隔符存在且解构后两部分都非空
3. 对于 `path#name` 格式，检查文件（`<path>.ts`）是否存在于 FileTree
4. 第一个错误即停止（fail-fast）

### Decision 3: SchemaResolver 作为 doc 管线唯一真相源

**选择**：保留 `SchemaResolver`，删除 `DocTransformer` 中的重复逻辑。

**理由**：
- SchemaResolver 更完整（有 enum 处理、默认值处理、交叉类型收集）
- SchemaResolver 架构更清晰（`resolveType` 返回 `$ref`，`resolveInline` 展开匿名类型）
- DocTransformer 中的 `collectNamedSchemas()` 和 `collectNestedTypes()` 是死代码

**具体改动**：
- `DocTransformer.transform()` 接收 `SchemaResolver` 参数
- `getFirstParamType()` / `getReturnType()` 改用 `resolver.resolveType()`
- 删除 DocTransformer 中：`typeToJsonSchema`、`collectNamedSchemas`、`collectNestedTypes`、`unwrapPromise`、`getTypeName`、`isNamedType`、`isBuiltInGeneric`
- `OpenApiEmitter.emit()` 接收 `SchemaResolver` 参数（不自己创建）
- `OpenApiEmitter.collectAllSchemas()` 加上 route method 过滤
- 提取 `buildRouteMethodImportMap()` 和 `findClassDeclaration()` 到共享位置

### Decision 4: 错误信息格式

**错误信息必须包含三要素**：
1. 哪个文件 → `src/services/UserService.ts`
2. 哪个位置 → `:42`（行号）或类名/方法名
3. 什么问题 + 怎么修 → `@soraExport value "rout" is not recognized. Use "route", "entity", or leave empty.`

**工具函数**：`formatNodeLocation(node, sourceFile)` → `"src/services/UserService.ts:42"`

### Decision 5: Error vs Warning 边界

**Error（致命，停止执行）**：
- 配置文件不存在/无法解析
- 必需配置字段缺失或格式错误
- 引用的文件不存在（如 serviceNameEnum 指向的文件）
- 多个 `@soraExport` 在同一声明上
- `@soraExport` 在匿名类上
- `@soraExport` 值无效（非 route/entity/空）
- enum/class 找不到（CodeInserter）
- 文件写入失败
- `@method` 值无效

**Warning（非致命，继续执行）**：
- 未知 `@sora*` 标签
- `@soraTargets` / `@soraIgnore` 空值
- 跨文件重名声明
- Pipeline 中源文件/类声明找不到（静默跳过改为 Warning）
- 空 export 结果
- 属性无类型注解
- 引用的类型无法解析
- 外部包类型被引用
- 重复类型名被丢弃
- 无 TypeScript 源文件

## Risks / Trade-offs

**[风险] DiagnosticCollector 作为可变状态传递** → 所有组件共享同一个实例。缓解：在命令层创建，pipeline 结束后立即输出并丢弃，不跨命令复用。

**[风险] 配置验证增加 loadConfig() 复杂度** → 验证逻辑集中在 BaseCommand.validateConfig() 中，每个命令只声明字段列表，不重复验证逻辑。

**[风险] Doc 管线去重可能引入回归** → 去重后 SchemaResolver 同时服务于 pathItems 中的 inline schema 和 components/schemas，确保一致性。缓解：使用 example 项目做端到端验证。

**[风险] 大量 Warning 可能被用户忽略** → 首次只添加最关键的 Warning，后续可根据反馈调整。所有 Warning 以 `Warning:` 前缀开头，易于识别。

**[Trade-off] 第一个 Error 即停止（fail-fast）而非收集所有错误** → 用户需要多次运行才能修复所有问题。选择简单实现，避免复杂的错误恢复机制。后续可考虑切换为收集所有错误。
