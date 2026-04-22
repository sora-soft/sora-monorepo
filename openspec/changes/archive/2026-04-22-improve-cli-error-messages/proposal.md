## Why

sora-cli 的错误信息极度不友好。配置缺失时报 `TypeError: The "paths[1]" argument must be of type string. Received undefined`；注解写错时静默产出空文件；generate 命令中 `split('#')` 格式错误时产出 `Cannot read properties of undefined`。用户完全不知道如何改正。同时 doc 导出管线存在大量重复代码（`DocTransformer.typeToJsonSchema` 与 `SchemaResolver`），导致维护困难且行为不一致。

## What Changes

- **新增全局 DiagnosticCollector**：统一收集 pipeline 中的 Error 和 Warning，在命令层一次性输出
- **新增配置验证机制**：每个命令声明自己需要的配置字段（方案 3：按命令验证），在 `loadConfig()` 时验证字段存在性、格式（`path#name`、`path#class.method`）和引用文件是否存在
- **改进所有库代码的错误信息**：包含文件路径、行号、声明名称和修复建议
- **改进 AnnotationReader**：检测未知 `@sora*` 标签、无效 `@soraExport` 值、空 `@soraTargets`/`@soraIgnore`、匿名类上的注解
- **改进 Collector/Transformer/TypeResolver/Emitter**：在静默跳过、产出空结果、类型无法解析等场景发出 Warning
- **改进 ProgramBuilder/CodeInserter**：根目录不存在、文件写入失败、enum/class 找不到时给出清晰错误
- **去重 doc 导出管线**：SchemaResolver 作为唯一类型转换真相源，删除 DocTransformer 中的重复逻辑和死代码

## Capabilities

### New Capabilities
- `config-validation`: 按命令验证 sora.json 配置字段的存在性、格式和引用完整性，配置错误时立即报告清晰信息
- `diagnostic-reporting`: 全局 DiagnosticCollector 收集 Error/Warning，库代码通过它报告问题，命令层统一输出；工具函数 `formatNodeLocation` 生成 `file:line` 格式的位置信息
- `annotation-validation`: 检测无效/未知 `@sora*` 注解、空值注解、匿名类注解、跨文件重名声明等，产出 file:line 级别的诊断信息

### Modified Capabilities
- `doc-pipeline`: SchemaResolver 成为类型转换唯一真相源；删除 DocTransformer 中 typeToJsonSchema、collectNamedSchemas（死代码）、collectNestedTypes（死代码）及重复的工具方法；OpenApiEmitter 接收外部 SchemaResolver 并加上 route method 过滤；doc.ts 命令创建并传递共享 resolver 实例

## Impact

- **受影响代码**：packages/sora-cli/src 下 18 个文件修改 + 1 个新文件
  - `Base.ts`、`Config.ts`：配置加载和验证流程
  - `lib/exporter/` 下全部文件：AnnotationReader、Collector、Transformer、TypeResolver、Emitter、ProgramBuilder
  - `lib/ast/CodeInserter.ts`：错误信息改进
  - `lib/doc/` 下全部文件：DocTransformer（大幅精简）、OpenApiEmitter、SchemaResolver
  - `commands/` 下全部 export 和 generate 命令
- **无 API 破坏性变更**：所有改动为错误信息改进和内部重构，不影响 CLI 的输入输出接口
- **依赖**：无新增外部依赖
