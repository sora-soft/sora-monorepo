## Why

`export:api` 命令在生成类型声明时存在两个问题：

1. **JSDoc 完全丢失**：所有通过 `@soraExport` 标注导出的类型声明（class / enum / interface / type alias），以及被依赖收集到的类型，在输出时其 JSDoc 注释全部被丢弃。这意味着使用者无法看到原始代码中的文档说明。
2. **Class 输出不适合纯类型消费**：当前所有 class 都以 `declare class` 形式输出，包含方法和属性。但对于 API 声明文件来说，消费者只需要类型签名，不需要运行时行为。尤其是非 route 的 class 暴露方法没有意义。

## What Changes

- **保留 JSDoc**：所有导出类型的 JSDoc（顶层声明 + 每个 member）将被完整保留到输出文件中，仅删除 `@soraExport`、`@soraTargets`、`@soraIgnore` 三个 sora 专属 tag。
- **Class → Interface**：所有进入输出的 class 声明将转为 interface：
  - **Route class**：转为 interface，保留 route 方法签名（`MethodSignature`），其余方法删除。
  - **Entity class / Simple class / 依赖 class**：转为 interface，只保留属性（`PropertySignature`），所有方法删除。
  - `extends` heritage 保留，`implements` 丢弃。
  - `declare` modifier 移除（interface 不需要）。

## Capabilities

### New Capabilities

- `export-jsdoc-preservation`: export:api 输出中保留 JSDoc 注释（过滤 sora tags）
- `export-class-to-interface`: export:api 将所有 class 输出转为 interface

### Modified Capabilities

（无现有 specs）

## Impact

- **`packages/sora-cli/src/lib/exporter/transformer.ts`**：6 个 transform 方法需添加 JSDoc 转移逻辑；3 个 class transform 方法改为输出 interface。
- **`packages/sora-cli/src/lib/exporter/type-resolver.ts`**：`collectResolvedDeclaration` 中 class 分支改为 interface；所有分支添加 JSDoc 转移。
- **`packages/sora-cli/src/lib/exporter/emitter.ts`**：无逻辑变更，但输出内容会改变（interface 替代 declare class，含 JSDoc）。
- **下游消费者**：所有使用 `export:api` 生成文件的下游项目，导入类型从 `declare class` 变为 `interface`——这是 **BREAKING** 变更，如果有代码在运行时 `instanceof` 检查将失效，但纯类型消费无影响。
