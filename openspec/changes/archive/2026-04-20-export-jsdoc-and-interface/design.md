## Context

`export:api` 命令通过 TypeScript AST 解析源代码中的 `@soraExport` 注解，收集需要导出的类型声明，经过 transform 和 type-resolve 后生成 `.ts` 声明文件供下游消费。

当前 pipeline：`ProgramBuilder → Collector → Transformer → TypeResolver → Emitter`

核心问题：
- Transformer 和 TypeResolver 使用 `ts.factory.update*Declaration` / `ts.factory.createClassDeclaration` 创建新 AST 节点时，没有复制原始节点上的 JSDoc 注释。`stripSoraTagsFromComment` 函数已存在但从未被调用。
- 所有 class 声明输出为 `declare class`，包含方法和构造函数。对于纯类型声明文件，interface 更合适。

## Goals / Non-Goals

**Goals:**
- 所有导出类型的 JSDoc（顶层 + member 级别）被完整保留到输出文件
- `@soraExport` / `@soraTargets` / `@soraIgnore` 三个 tag 从输出中删除
- 所有 class 输出转为 interface（route class 保留 route 方法签名）
- 依赖收集（type-resolver）中的 class 也转为 interface

**Non-Goals:**
- 不改变 annotation-reader 的注解读取逻辑
- 不改变 collector 的收集逻辑
- 不改变 emitter 的文件输出逻辑（仅内容自然变化）
- 不处理方法参数内部的 JSDoc
- 不改变 enum / interface / type alias 的输出结构（仅添加 JSDoc）

## Decisions

### Decision 1: JSDoc 转移方式 — `ts.addSyntheticLeadingComment`

**选择**: 使用 `ts.addSyntheticLeadingComment` 将过滤后的 JSDoc 以合成注释形式挂到新节点。

**替代方案**:
- **克隆 JSDoc AST 节点**: 手动 `ts.factory.createJSDoc()` 并过滤 tags。更精确但实现复杂，需要处理 JSDoc 的 `comment` 属性（可能是 `string` 或 `NodeArray<JSDocComment>`）。
- **文本后处理**: emitter 输出后用正则插入注释。脆弱且不可靠。

**理由**: `addSyntheticLeadingComment` 简单可靠，TypeScript printer 能正确输出多行注释。对于 `.d.ts` 风格的声明文件，注释格式不需要精确匹配源文件。

### Decision 2: JSDoc 提取方式

**选择**: 从 `(node as any).jsDoc` 读取原始 JSDoc 数组，构造注释文本时用已有的 `stripSoraTagsFromComment` 过滤 sora tags。

**处理逻辑**:
```
1. 读取 sourceNode.jsDoc（JSDoc[]）
2. 对每个 JSDoc：
   a. 提取完整注释文本（含 description + tags）
   b. 用 stripSoraTagsFromComment 过滤 sora tags
   c. 如果过滤后为空则跳过
3. 将过滤后的注释文本通过 addSyntheticLeadingComment 挂到 targetNode
```

**JSDoc 文本构造**: 需要从 JSDoc AST 节点中提取 `comment` 属性。JSDoc 节点的文本需要包含 `/** ... */` 包裹格式。使用 `sourceFile.text.substring(jsDoc.pos, jsDoc.end)` 获取原始文本是最可靠的方式。

### Decision 3: Class → Interface 的 AST 转换

**选择**: 使用 `ts.factory.createInterfaceDeclaration` 替代 `ts.factory.createClassDeclaration`。

**映射规则**:
| Class 元素 | Interface 元素 | 说明 |
|---|---|---|
| `PropertyDeclaration` | `PropertySignature` | `ts.factory.createPropertySignature` |
| `MethodDeclaration` (route) | `MethodSignature` | `ts.factory.createMethodSignature` |
| `MethodDeclaration` (非 route) | 删除 | — |
| `ConstructorDeclaration` | 删除 | — |
| `extends` heritage | `extends` heritage | 直接传递 |
| `implements` heritage | 丢弃 | interface 无 implements |
| `declare` modifier | 移除 | interface 不需要 |

### Decision 4: JSDoc 转移的统一函数

**选择**: 在 transformer.ts 中创建通用的 `transferJSDoc(sourceNode, targetNode, sourceFile)` 函数，供所有 transform 方法和 type-resolver 复用。

为避免 transformer 和 type-resolver 之间的循环依赖，将该函数提取到独立的工具模块（如 `jsdoc-utils.ts`）。

## Risks / Trade-offs

- **[BREAKING] declare class → interface**: 下游如果有 `instanceof` 检查将编译失败。→ 纯类型声明文件不应被用于运行时检查，这是正确的修正。
- **Synthetic comment 格式**: `addSyntheticLeadingComment` 的输出格式可能与手写 JSDoc 有细微差异（空行、缩进）。→ 对声明文件消费者无影响。
- **Heritage `implements` 丢失**: class 的 `implements` 子句在转为 interface 后被丢弃，可能导致某些类型约束信息丢失。→ interface 的 `extends` 可以表达类型继承关系，但无法表达 class implements 的约束语义。如果下游需要这些约束信息，需要额外处理。目前看来声明文件不需要。
- **JSDoc 文本提取**: 使用 `sourceFile.text.substring(jsDoc.pos, jsDoc.end)` 提取原始注释文本时，可能包含多余的空白。→ `stripSoraTagsFromComment` 已经做了 `trim()` 处理。
