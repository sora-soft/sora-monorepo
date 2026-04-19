## 上下文

当前项目为 monorepo 结构（`packages/` 目录）。需要新增 `typia-decorator` 包，实现基于 TypeScript AST Transformer 的编译时参数校验。该包分为两个子模块：`runtime`（装饰器标记）和 `transform`（AST 转换）。底层校验依赖 `typia` 的 `assert<T>()` 函数。

**约束**：
- 必须使用 `ts.factory` API（现代 API，非废弃的 `ts.createXxx`）
- Transformer 需兼容 `ts-patch` 和 `ttypescript` 两种加载方式
- 装饰器溯源必须通过 `TypeChecker` Symbol 追溯，不能仅凭字符串名称匹配

## 目标 / 非目标

**目标：**
- 提供声明式 `@guard` 参数装饰器，零运行时开销
- Transformer 在编译时自动注入 `typia.assert<T>(param)` 校验代码
- 通过 Symbol 溯源确保只处理从 `typia-decorator/runtime` 导出的 `@guard`，防止误伤同名装饰器
- 编译后擦除 `@guard` 装饰器，避免运行时异常

**非目标：**
- 不支持属性装饰器或类装饰器（仅方法参数）
- 不提供运行时校验逻辑（纯 AOT）
- 不处理 `typia` 的安装/配置（假设目标项目已安装）
- 不支持 JavaScript 源文件（仅 TypeScript）

## 决策

### D1: 装饰器形态 — 参数装饰器

**选择**: 使用 TypeScript 参数装饰器 `@guard`（而非方法装饰器或自定义语法）

**理由**: 参数装饰器天然绑定到具体参数上，可以直接标记哪个参数需要校验，无需额外配置。替代方案——方法装饰器需要在元数据中指定参数索引，更冗余且易错。

### D2: Symbol 溯源策略

**选择**: 通过 `TypeChecker.getSymbolAtLocation()` 获取装饰器表达式的 Symbol，再追溯其声明位置，比对源文件路径是否匹配 `typia-decorator/runtime` 包

**替代方案**:
- 纯字符串匹配 `"guard"`：太宽泛，会误伤其他同名标识符
- 正则匹配导入路径：脆弱，无法处理 re-export 和别名

**理由**: Symbol 溯源是 TypeScript 编译器提供的权威机制，可以准确追踪标识符的真实来源，即使经过 re-export 或重命名也能正确识别。

### D3: 校验注入位置 — 方法体顶端

**选择**: 将 `typia.assert<T>(param)` 语句作为方法体的第一条语句注入

**理由**: 确保在方法逻辑执行前完成参数校验，尽早暴露无效输入。如果参数无效，`typia.assert` 会抛出 `TypeError`，阻止后续逻辑执行。

### D4: 包结构 — 单包双入口

**选择**: 单个 `packages/typia-decorator` 包，通过 `exports` 字段提供 `typia-decorator/runtime` 和 `typia-decorator/transform` 两个入口

**替代方案**: 拆成两个独立包 `@typia-decorator/runtime` 和 `@typia-decorator/transform`

**理由**: 两个模块紧密耦合，版本需同步发布。单包管理更简单，且 `package.json` 的 `exports` 字段可以很好地支持子路径导入。

### D5: Transformer 注册方式

**选择**: 导出符合 `ts.CustomTransformerFactory` 接口的工厂函数

**理由**: 这是 TypeScript 官方的 Transformer 插件标准接口，兼容 `ts-patch` 和 `ttypescript`。

## 风险 / 权衡

- **TypeScript 版本兼容性** → `ts.factory` API 在 TypeScript 4.x 引入，需在 `peerDependencies` 中声明最低版本要求
- **typia 版本兼容性** → 生成的 `typia.assert<T>()` 调用依赖 typia 的 API 稳定性，需声明为 peer dependency
- **Symbol 溯源的性能开销** → 每个 `@guard` 装饰器都需要一次 Symbol 查找，但在编译阶段开销可忽略
- **ESM/CJS 双格式** → 需同时输出 ESM 和 CJS 两种格式，确保兼容不同模块系统
