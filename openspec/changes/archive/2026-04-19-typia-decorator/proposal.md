## 为什么

在 TypeScript 项目中，运行时类型校验通常依赖手动编写校验逻辑或使用反射库（如 `class-validator`），前者冗余易错，后者依赖装饰器元数据且性能较差。`typia` 提供了基于 AOT 的极速校验能力，但目前缺少一种声明式的方式将其集成到类方法的参数校验中。此变更引入 `typia-decorator` 库，通过 `@guard` 参数装饰器标记 + TypeScript AST Transformer 在编译时自动注入 `typia.assert<T>()` 调用，实现零运行时开销的声明式参数校验。

## 变更内容

- **新增** `packages/typia-decorator` 包，包含两个子模块：
  - `typia-decorator/runtime`：导出无逻辑的 `@guard` 参数装饰器，仅用作 AST 标记
  - `typia-decorator/transform`：基于 `ts-patch`/`ttypescript` 规范的 TypeScript AST Transformer 插件
- Transformer 在编译阶段扫描所有带 `@guard` 装饰器的方法参数，通过 `TypeChecker` Symbol 溯源确认装饰器来源，注入 `typia.assert<Type>(param)` 校验语句，并擦除装饰器节点

## 功能 (Capabilities)

### 新增功能
- `guard-decorator`: 无逻辑的 `@guard` 参数装饰器，用作编译时 AST 标记和 IDE 类型提示
- `ast-transformer`: TypeScript AST Transformer 插件，负责遍历方法声明、Symbol 溯源校验装饰器来源、提取参数类型、注入 typia.assert 语句、擦除装饰器

### 修改功能

（无现有功能被修改）

## 影响

- **新增依赖**: `typescript`（peer dependency）、`typia`（peer dependency，目标项目需安装）
- **新增包**: `packages/typia-decorator`（monorepo 内新增子包）
- **构建集成**: 使用方需通过 `ts-patch` 或 `ttypescript` 加载 Transformer 插件
- **TypeScript 版本要求**: 需支持 `ts.factory` API（TypeScript 4.x+）
