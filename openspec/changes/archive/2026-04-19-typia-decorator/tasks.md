## 1. 项目初始化

- [x] 1.1 在 `packages/typia-decorator` 下创建 `package.json`，配置双入口（`typia-decorator/runtime` 和 `typia-decorator/transform`），声明 `typescript` 和 `typia` 为 peer dependencies，配置 ESM/CJS 双格式输出
- [x] 1.2 创建 `tsconfig.json`，配置 `experimentalDecorators: true`、`emitDecoratorMetadata: false`，目标 ES2020+
- [x] 1.3 创建项目目录结构：`src/runtime/index.ts`、`src/transform/index.ts`、`src/transform/visitor.ts`

## 2. Runtime 模块实现

- [x] 2.1 实现 `src/runtime/index.ts`：导出符合 `ParameterDecorator` 类型签名的空函数 `guard`，无任何运行时逻辑
- [x] 2.2 验证 runtime 模块零外部依赖，确认导出类型正确

## 3. Transformer 核心框架

- [x] 3.1 实现 `src/transform/index.ts`：导出 `ts.CustomTransformerFactory` 工厂函数，接收 `ts.Program`，创建 `TypeChecker` 实例，返回包含 `before`/`after` 钩子的 transformer 对象
- [x] 3.2 实现工厂函数中 `before` 钩子的 AST 遍历逻辑：遍历 `SourceFile` 中的所有 `ClassDeclaration`，对每个类的 `MethodDeclaration` 调用 visitor
- [x] 4.1 实现 `src/transform/visitor.ts`：遍历方法参数，检测 `ParameterDeclaration` 上的装饰器节点
- [x] 4.2 实现 Symbol 溯源逻辑：通过 `TypeChecker.getSymbolAtLocation()` 获取装饰器标识符的 Symbol，追溯声明文件路径，确认是否来自 `typia-decorator/runtime`
- [x] 4.3 处理边界情况：re-export 链穿透、别名导入（`import { guard as g }`）、无装饰器参数直接跳过
- [x] 5.1 实现类型提取：使用 `TypeChecker.getTypeAtLocation()` 获取 `@guard` 参数的 TypeScript 类型
- [x] 5.2 使用 `ts.factory` 构建 `typia.assert<Type>(paramName)` 表达式语句 AST 节点
- [x] 5.3 将校验语句注入到方法体 `statements` 数组的最前端，支持多参数按声明顺序排列
- [x] 5.4 实现装饰器擦除：更新参数节点，移除匹配的 `@guard` 装饰器，保留其他装饰器

## 6. 构建与导出配置

- [x] 6.1 配置构建脚本：确保 `src/runtime` 和 `src/transform` 分别输出到 `dist/runtime` 和 `dist/transform`
- [x] 6.2 验证 `package.json` 的 `exports` 字段正确映射子路径导入
- [x] 6.3 编写基本使用示例或 README 说明如何在 tsconfig.json 中配置 Transformer 插件
