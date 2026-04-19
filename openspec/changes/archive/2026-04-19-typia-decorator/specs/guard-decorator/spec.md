## 新增需求

### 需求:导出 guard 参数装饰器
`typia-decorator/runtime` 模块必须导出一个名为 `guard` 的参数装饰器函数。该函数必须符合 TypeScript `ParameterDecorator` 类型签名 `(target: Object, propertyKey: string | symbol, parameterIndex: number) => void`。函数体必须为空（无运行时逻辑）。

#### 场景:正常导入和使用
- **当** 用户从 `typia-decorator/runtime` 导入 `guard` 并将其作为参数装饰器使用
- **那么** TypeScript 编译必须通过，IDE 必须提供正确的类型提示

#### 场景:运行时调用为空操作
- **当** 未经 Transformer 处理的代码在运行时执行带 `@guard` 装饰器的函数
- **那么** `guard` 函数被调用但不执行任何逻辑，不影响程序行为

### 需求:运行时模块零依赖
`typia-decorator/runtime` 模块禁止包含任何外部依赖（包括 `typescript` 和 `typia`）。该模块必须为纯 TypeScript 代码，仅导出类型安全的空函数。

#### 场景:打包体积检查
- **当** 用户在项目中安装并使用 `typia-decorator/runtime`
- **那么** 打包后该模块的运行时代码体积极小（仅一个空函数）

### 需求:支持多个参数同时装饰
同一个方法中的多个参数可以各自独立使用 `@guard` 装饰器。每个 `@guard` 必须独立标记其对应的参数。

#### 场景:多参数装饰
- **当** 用户在方法声明中对多个参数分别添加 `@guard`
- **那么** 每个参数都被独立标记，Transformer 可以分别处理
