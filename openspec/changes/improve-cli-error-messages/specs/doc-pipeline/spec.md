## MODIFIED Requirements

### 需求:SchemaResolver 为类型转换唯一真相源
系统必须使用 SchemaResolver 作为 doc 导出管线中唯一的类型到 JSON Schema 转换逻辑来源。DocTransformer 的 `getFirstParamType` 和 `getReturnType` 方法必须委托给 SchemaResolver 而非自己实现转换逻辑。

#### 场景:DocTransformer 使用 SchemaResolver 进行类型转换
- **当** DocTransformer 处理路由方法的参数类型和返回类型时
- **那么** 调用 `resolver.resolveType(type)` 获取 JSON Schema，而非内部 `typeToJsonSchema` 方法

#### 场景:单一 SchemaResolver 实例贯穿整个 doc 管线
- **当** export:doc 命令执行时
- **那么** 创建一个 SchemaResolver 实例，同时传给 DocTransformer.transform() 和 OpenApiEmitter.emit()，确保 pathItems 中的 $ref 与 components/schemas 中的定义一致

### 需求:删除 DocTransformer 中的重复和死代码
系统必须从 DocTransformer 中删除以下方法：`typeToJsonSchema`、`collectNamedSchemas`、`collectNestedTypes`、`unwrapPromise`、`getTypeName`、`isNamedType`、`isBuiltInGeneric`。

#### 场景:DocTransformer 不再包含类型转换逻辑
- **当** 检查 DocTransformer 的代码
- **那么** 不存在 `typeToJsonSchema`、`collectNamedSchemas`、`collectNestedTypes`、`unwrapPromise`、`getTypeName`、`isNamedType`、`isBuiltInGeneric` 方法

#### 场景:DocTransformer 保留路由检测和 OpenAPI 构建逻辑
- **当** 检查 DocTransformer 的代码
- **那么** 仍然包含 `transform`、`isRouteMethod`、`isRouteNotify`、`buildRouteMethodImportMap`、`buildPath`、`readSummary`、`readDescription`、`readAndValidateHttpMethod`、`shouldIgnoreMember`、`findClassDeclaration` 方法

### 需求:OpenApiEmitter 接收外部 SchemaResolver 并过滤 route methods
OpenApiEmitter.emit() 必须接收 SchemaResolver 参数而非自己创建。collectAllSchemas 必须只收集 route method 的类型（过滤掉非 route method 和被 @soraIgnore 忽略的 method）。

#### 场景:OpenApiEmitter 不自己创建 SchemaResolver
- **当** 检查 OpenApiEmitter.emit() 的实现
- **那么** 接收 `resolver: SchemaResolver` 参数，不调用 `new SchemaResolver()`

#### 场景:collectAllSchemas 只收集 route method 的类型
- **当** 路由类中有一个 route method（带 `@Route.method()` 装饰器）和一个非 route method（无装饰器）
- **那么** collectAllSchemas 只收集 route method 的参数类型和返回类型，非 route method 的类型不出现在 components/schemas 中

### 需求:提取 buildRouteMethodImportMap 和 findClassDeclaration 为共享工具
`buildRouteMethodImportMap` 和 `findClassDeclaration` 必须从 DocTransformer 和 Transformer 中提取到共享位置，避免 OpenApiEmitter 中的重复实现。

#### 场景:共享工具被多处使用
- **当** DocTransformer 和 OpenApiEmitter 都需要检测 route method
- **那么** 两者使用同一个 `buildRouteMethodImportMap` 实现，不存在重复代码
