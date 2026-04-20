## Context

sora-cli 已有一套完整的 `export:api` 管线（ProgramBuilder → Collector → Transformer → TypeResolver → Emitter），将 `@soraExport route` 标注的类转换为 TypeScript 类型声明文件。`generate:doc` 命令需要复用这条管线的前半段（文件扫描、注解读取、目标过滤），但后半段的输出目标完全不同：从 TypeScript AST 变为 OpenAPI 3.0 JSON/YAML。

## Goals / Non-Goals

**Goals:**
- 从 `@soraExport route` 标注的类自动生成 OpenAPI 3.0 文档
- 复用现有的 `@soraTargets` / `@soraIgnore` 过滤机制
- 通过 TypeScript TypeChecker 将参数类型和返回类型转换为 JSON Schema
- 支持 YAML 和 JSON 两种输出格式
- 新增 `@soraPrefix`（类级别，支持逗号分隔的多个路径）和 `@method`（方法级别）注解
- 只处理 `@Route.method`，忽略 `@Route.notify`

**Non-Goals:**
- 不生成鉴权（security）字段
- 不支持 WebSocket 或 streaming 端点
- 不生成代码示例或 markdown 渲染文档
- 不修改现有 `export:api` 管线的行为

## Decisions

### D1: 复用 ProgramBuilder + Collector，新建 Doc 专用管线

**选择**: 在 `src/lib/doc/` 下新建四个模块（DocCollector / DocTransformer / SchemaResolver / OpenApiEmitter），复用 ProgramBuilder。

**替代方案**: 扩展现有 Transformer 输出双格式。拒绝原因：Transformer 将类转为 interface AST，与 OpenAPI 的 JSON Schema 结构差异太大，强行复用会导致代码耦合严重。

### D2: TypeScript Type → JSON Schema：基于 TypeChecker 的自定义递归遍历器

**选择**: 使用 `TypeChecker` API（`type.getProperties()`、`type.getNumberIndexType()` 等）递归遍历类型，自行生成 JSON Schema。

**替代方案 A**: 引入 `typescript-json-schema` 库。拒绝原因：额外依赖，且其创建独立 Program 的方式可能与现有管线冲突。

**替代方案 B**: 引入 `@typeserverless/json-schema-from-ts`。拒绝原因：类似问题，且覆盖面不确定。

自写 SchemaResolver 可以精确控制映射规则，且项目中的类型使用相对规范（interface + enum + 基本泛型），复杂度可控。

### D3: 命名类型 → $ref，匿名类型 → inline

**选择**: 命名的 interface/type 提取到 `components/schemas` 并以 `$ref` 引用；匿名类型（如推断出的字面量返回 `{ id: number }`）直接 inline 到 response schema 中。

**理由**: 与 OpenAPI 最佳实践一致，减少重复定义，同时避免为匿名类型生成不自然的合成名称。

### D4: OpenAPI info 字段从 package.json 读取

**选择**: `info.title` ← `package.json` 的 `name` 字段，`info.version` ← `version` 字段。若缺失则 fallback 为 `"Sora API"` / `"1.0.0"`。package.json 从 sora.json 所在目录向上查找。

### D5: @method 校验策略

**选择**: `@method` 值必须为 `GET | POST | PUT | DELETE | PATCH | HEAD | OPTIONS` 之一（大小写不敏感），非法值直接报错终止命令。

## Risks / Trade-offs

- **[复杂类型覆盖不全]** 自写 SchemaResolver 可能无法覆盖所有 TypeScript 高级类型（Mapped Types、Conditional Types、模板字面量类型等）→ 初期只覆盖项目实际使用的模式（interface、enum、Array、Record、union、optional），后续按需扩展
- **[匿名返回类型的结构丢失]** 推断返回值时，TypeChecker 可能展开泛型导致结构扁平化 → 对于已命名类型使用 $ref 可规避此问题
- **[js-yaml 依赖]** 新增运行时依赖 → js-yaml 是最成熟的 YAML 库，体积小、稳定
