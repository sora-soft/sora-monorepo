## Why

sora-cli 已有 `export:api` 命令将 Route 类导出为 TypeScript 类型声明，但缺少从 `@soraExport route` 标注的类自动生成 OpenAPI 文档的能力。团队需要手动编写或使用第三方工具维护 API 文档，导致文档与代码容易脱节。通过新增 `generate:doc` 命令，可直接从代码注解和类型信息生成 OpenAPI 3.0 规范文档，保持文档与实现的单一数据源。

## What Changes

- 新增 sora-cli 命令 `generate:doc`，扫描代码中所有 `@soraExport route` 标注的类，生成 OpenAPI 3.0 格式文档
- 新增 JSDoc 注解 `@soraPrefix`（类级别），定义 API 路径前缀，支持逗号分隔的多个路径，每个方法为每个 prefix 各生成一条文档路径
- 新增 JSDoc 注解 `@method`（方法级别），指定 HTTP 方法（默认 POST），非法值报错
- 新增 `js-yaml` 依赖用于 YAML 输出
- 复用现有的 `@soraTargets` 和 `@soraIgnore` 过滤机制
- `sora.json` 新增 `docOutput` 配置字段

## Capabilities

### New Capabilities
- `openapi-generation`: 从 `@soraExport route` 标注的类自动生成 OpenAPI 3.0 文档，包括路径生成、TypeScript 类型到 JSON Schema 的转换、YAML/JSON 输出

### Modified Capabilities
- `annotation-reading`: 扩展 AnnotationReader 以支持 `@soraPrefix` 和 `@method` 两个新注解的读取

## Impact

- **代码**: `packages/sora-cli/src/` — 新增 `commands/generate/doc.ts` 和 `lib/doc/` 目录下的四个模块；修改 `lib/exporter/annotation-reader.ts` 和 `lib/exporter/jsdoc-utils.ts`
- **配置**: `sora.json` 新增 `docOutput` 字段
- **依赖**: `packages/sora-cli/package.json` 新增 `js-yaml` 及其类型声明
- **无破坏性变更**: 现有 `export:api` 管线不受影响
