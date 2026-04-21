## 1. 基础设施

- [x] 1.1 创建 `src/lib/DiagnosticCollector.ts`：实现 DiagnosticCollector 类（addError、addWarning、getErrors、getWarnings、hasErrors、reportTo 方法和 formatNodeLocation 工具函数）
- [x] 1.2 创建共享工具模块 `src/lib/exporter/RouteUtils.ts`：从 DocTransformer 和 Transformer 中提取 `buildRouteMethodImportMap`、`findClassDeclaration`、`isRouteMethod`、`isRouteNotify`、`shouldIgnoreMember`、`getNodeDecorators` 为共享函数

## 2. 配置验证

- [x] 2.1 修改 `src/lib/Config.ts`：包装 loadSoraConfig() 和 loadTSConfig() 的错误，提供清晰的 "sora.json not found"、"tsconfig.json not found"、JSON 解析失败等信息
- [x] 2.2 修改 `src/Base.ts`：新增 ConfigFieldRequirement 接口、abstract requiredConfigFields() 属性、validateConfig() 方法（检查字段存在性、format 格式、引用文件存在），loadConfig() 中调用验证
- [x] 2.3 修改 `src/commands/export/api.ts`：实现 requiredConfigFields() 声明需要 root 和 apiDeclarationOutput
- [x] 2.4 修改 `src/commands/export/doc.ts`：实现 requiredConfigFields() 声明需要 root 和 docOutput
- [x] 2.5 修改 `src/commands/generate/service.ts`：实现 requiredConfigFields() 声明需要 root、serviceDir、handlerDir、serviceNameEnum(path#name)、serviceRegister(path#class.method)，移除手动的 split('#')/split('.') 解析
- [x] 2.6 修改 `src/commands/generate/worker.ts`：实现 requiredConfigFields() 声明需要 root、workerDir、workerNameEnum(path#name)、workerRegister(path#class.method)，移除手动 split 解析
- [x] 2.7 修改 `src/commands/generate/command.ts`：实现 requiredConfigFields() 声明需要 root、workerDir、workerNameEnum(path#name)、workerRegister(path#class.method)，移除手动 split 解析

## 3. 注解验证

- [x] 3.1 修改 `src/lib/exporter/AnnotationReader.ts`：接收 DiagnosticCollector 参数；readDeclaration 中为多个 @soraExport 加上 file:line 信息，检测无效 @soraExport 值（Error），检测匿名类上的 @soraExport（Error）；readModes 中空 @soraTargets 发 Warning；readMemberIgnore 中空 @soraIgnore 发 Warning；新增 detectUnknownTags 检测未知 @sora* 标签（Warning）
- [x] 3.2 修改 `src/lib/exporter/Collector.ts`：接收 DiagnosticCollector 参数；检测跨文件重名声明（Warning）；collect 结果为空时发 Warning

## 4. Pipeline 错误改进

- [x] 4.1 修改 `src/lib/exporter/Transformer.ts`：接收 DiagnosticCollector 参数；sourceFile/classDecl 找不到时发 Warning（含 filePath 和 className）；transformRouteClass/transformEntityClass/transformGenericClass 结果为空时发 Warning；属性无类型注解时发 Warning；改用 RouteUtils 共享函数
- [x] 4.2 修改 `src/lib/exporter/TypeResolver.ts`：接收 DiagnosticCollector 参数；resolveTypeReference 中 symbol 找不到时发 Warning；外部包类型（node_modules）发 Warning；resolveTypeFromDeclaration 中 getChildren()[0] 安全检查；删除 resolveForTargets() 死代码
- [x] 4.3 修改 `src/lib/exporter/Emitter.ts`：接收 DiagnosticCollector 参数；空输出（entries 为空）发 Warning；fs.writeFileSync 包装 try/catch 并提供文件路径上下文；重名类型发 Warning
- [x] 4.4 修改 `src/lib/exporter/ProgramBuilder.ts`：接收 DiagnosticCollector 参数；collectTsFiles 中根目录不存在报 Error；收集结果为空发 Warning；loadCompilerOptions 中正确序列化 messageText（可能是对象）
- [x] 4.5 修改 `src/lib/ast/CodeInserter.ts`：所有 throw Error 加上文件路径和目标名上下文；修复 key=${key} 模板字符串 bug（缺少反引号）；getEnumStringPair 非字符串初始值安全检查；addImport 中 namedBindings 类型检查（防止 namespace/side-effect import 崩溃）；insertCodeInClassMethod 方法找不到时报 Error

## 5. Doc 管线去重

- [x] 5.1 修改 `src/lib/doc/SchemaResolver.ts`：接收 DiagnosticCollector 参数；resolveType/resolveInline 中外部包类型发 Warning
- [x] 5.2 精简 `src/lib/doc/DocTransformer.ts`：transform() 接收 SchemaResolver 参数；getFirstParamType/getReturnType 改用 resolver.resolveType()；删除 typeToJsonSchema、collectNamedSchemas、collectNestedTypes、unwrapPromise、getTypeName、isNamedType、isBuiltInGeneric 方法；改用 RouteUtils 共享函数和 DiagnosticCollector
- [x] 5.3 修改 `src/lib/doc/OpenApiEmitter.ts`：emit() 接收 SchemaResolver 参数而非自己创建；collectAllSchemas 加上 route method 过滤（使用 RouteUtils 共享函数）；删除重复的 findClassDeclaration；fs.writeFileSync 包装 try/catch
- [x] 5.4 修改 `src/commands/export/doc.ts`：创建共享 SchemaResolver 实例，传给 transformer.transform() 和 emitter.emit()

## 6. 命令层集成

- [x] 6.1 修改 `src/commands/export/api.ts`：创建 DiagnosticCollector 实例，传给所有 pipeline 组件；命令结束时输出所有 Warnings
- [x] 6.2 修改 `src/commands/export/doc.ts`：创建 DiagnosticCollector 实例，传给所有 pipeline 组件；命令结束时输出所有 Warnings
- [x] 6.3 修改 `src/commands/generate/service.ts`：创建 DiagnosticCollector 实例；getFile() 返回 null 时报 Error（含文件路径和配置字段名）；"Service file already exists" 和 "Handler file already exists" 加上文件路径
- [x] 6.4 修改 `src/commands/generate/worker.ts`：同 service.ts 的改动模式
- [x] 6.5 修改 `src/commands/generate/command.ts`：同 service.ts 的改动模式

## 7. 验证

- [x] 7.1 使用 example 项目运行 `sora export:api`，验证正常流程不受影响
- [x] 7.2 使用 example 项目运行 `sora export:doc`，验证 doc 管线去重后输出一致
- [x] 7.3 测试配置缺失场景（删除 sora.json 中的 apiDeclarationOutput），验证错误信息清晰
- [x] 7.4 测试注解错误场景（使用无效 @soraExport 值），验证错误信息包含 file:line
