## 新增需求

### 需求:Transformer 工厂函数导出
`typia-decorator/transform` 模块必须导出一个符合 `ts.CustomTransformerFactory` 接口的工厂函数。该函数必须接受 `ts.Program`（或 `ts.Program` + `ts.CompilerOptions`）作为参数，并返回一个 `ts.CustomTransformer` 实例。

#### 场景:通过 ts-patch 加载
- **当** 用户在 `tsconfig.json` 中配置 `plugins` 指向 `typia-decorator/transform`
- **那么** TypeScript 编译过程中 Transformer 被正确加载并执行

#### 场景:通过 ttypescript 加载
- **当** 用户在 `tsconfig.json` 的 `compilerOptions.plugins` 中配置 Transformer
- **那么** 使用 `ttsc` 编译时 Transformer 被正确加载并执行

### 需求:遍历方法声明并识别 guard 装饰器
Transformer 必须遍历 AST 中所有的 `MethodDeclaration` 节点，检查其参数列表中是否存在装饰器。对于每个带装饰器的参数，必须进一步验证该装饰器是否为 `@guard`。

#### 场景:发现带 @guard 的方法参数
- **当** Transformer 遇到包含 `@guard` 装饰器的方法参数
- **那么** Transformer 识别该参数为目标参数，准备进行后续处理

#### 场景:忽略无装饰器的参数
- **当** Transformer 遇到没有装饰器的方法参数
- **那么** Transformer 必须跳过该参数，不做任何修改

### 需求:Symbol 溯源校验装饰器来源
Transformer 必须使用 `TypeChecker` 获取装饰器表达式标识符的 `Symbol`，追溯其原始声明文件，确认该装饰器确实从 `typia-decorator/runtime` 模块导出。禁止仅通过字符串名称 `"guard"` 来判定。

#### 场景:匹配正确的 guard 来源
- **当** 装饰器标识符通过 Symbol 溯源指向 `typia-decorator/runtime` 模块的导出
- **那么** Transformer 确认该装饰器为有效的 `@guard`，继续处理

#### 场景:拒绝同名但不同来源的装饰器
- **当** 用户定义了自己的名为 `guard` 的装饰器（非来自 `typia-decorator/runtime`）
- **那么** Transformer 必须忽略该装饰器，不注入校验代码，不擦除装饰器

#### 场景:处理 re-export 场景
- **当** 用户通过中间模块 re-export `guard`（如 `export { guard } from 'typia-decorator/runtime'`）
- **那么** Symbol 溯源必须能穿透 re-export 链，最终追溯到 `typia-decorator/runtime`

### 需求:提取参数类型并注入 typia.assert 校验
对于确认有效的 `@guard` 参数，Transformer 必须提取该参数的 TypeScript 类型，并在方法体的第一条语句位置注入 `typia.assert<Type>(parameterName)` 调用语句。

#### 场景:基本类型校验注入
- **当** 方法参数类型为 `string`、`number` 或自定义接口类型，且标记了 `@guard`
- **那么** Transformer 在方法体顶端注入 `typia.assert<Type>(paramName)` 语句

#### 场景:校验注入位于方法体最顶端
- **当** 方法体已有其他语句
- **那么** `typia.assert` 语句必须作为第一条语句插入，确保在所有用户代码之前执行

#### 场景:多参数分别注入
- **当** 方法有多个参数都标记了 `@guard`
- **那么** 每个参数必须各自注入一条 `typia.assert<Type>(paramName)` 语句，按参数声明顺序依次排列在方法体顶端

### 需求:擦除 @guard 装饰器节点
Transformer 在完成校验代码注入后，必须从参数的 AST 节点上移除 `@guard` 装饰器。擦除必须确保输出代码中不包含任何对 `guard` 装饰器的调用或导入残留。

#### 场景:编译输出无装饰器残留
- **当** Transformer 处理完一个带 `@guard` 的方法
- **那么** 输出的 JavaScript 代码中该参数不再有任何装饰器

#### 场景:guard 的 import 语句保留或清理
- **当** 擦除装饰器后，`guard` 的导入语句变为未使用
- **那么** TypeScript 编译器自带的 elision 机制应自动移除未使用的类型导入

### 需况:保留原始 SourceMap 和注释
Transformer 必须正确处理 AST 节点的位置信息，确保 SourceMap 准确，并且不丢失方法体中原有的注释。

#### 场景:注入代码后的 SourceMap
- **当** Transformer 注入 `typia.assert` 语句后
- **那么** 原有代码行的 SourceMap 映射必须保持准确
