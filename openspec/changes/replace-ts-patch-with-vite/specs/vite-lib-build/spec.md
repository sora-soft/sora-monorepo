## ADDED Requirements

### Requirement:Vite lib 模式构建管线替代 ts-patch
所有当前使用 `ts-patch` + `tspc` 构建的包 MUST 改用 `vite build`（lib 模式）。构建产物 MUST 保持与现有 `dist/` 目录结构兼容，以维持 `exports` map 的正确性。

#### Scenario:包构建成功
- **当** 对任意受影响的包执行 `vite build`
- **那么** 构建 MUST 成功完成，输出 ES module 格式的 JS 文件到 `dist/` 目录

#### Scenario:产物路径兼容
- **当** 构建完成
- **那么** `dist/` 中的文件路径 MUST 与 `package.json` 中 `exports` map 声明的路径一致（如 `dist/index.js`、`dist/lib/xxx.js`）

### Requirement:typia AOT 代码生成
Vite 构建 MUST 通过 `@typia/unplugin/vite` 插件正确处理所有 `typia.assert<T>()`、`typia.is<T>()`、`typia.validate<T>()` 等调用，生成与 tspc 等价的运行时验证代码。

#### Scenario:typia.assert 展开
- **当** 源码中包含 `typia.assert<IWorkerOptions>(options)`
- **那么** 构建产物中 MUST 包含展开后的运行时类型验证函数，而非原始的 `typia.assert` 调用

#### Scenario:typia.is 展开
- **当** 源码中包含 `typia.is<IRawReqPacket>(packet)`
- **那么** 构建产物中 MUST 包含展开后的运行时类型检查函数

### Requirement:@guard 装饰器代码生成
Vite 构建 MUST 通过 `@sora-soft/typia-decorator/unplugin/vite` 插件正确处理 `@guard` 参数装饰器，生成参数类型验证代码。

#### Scenario:@guard 生成 assert 代码
- **当** 源码中方法参数使用 `@guard` 装饰器
- **那么** 构建产物中该方法体开头 MUST 包含对应参数类型的 assert 验证代码，且 `@guard` 装饰器 MUST 被移除

### Requirement:emitDecoratorMetadata 支持
Vite 构建 MUST 通过 SWC (`vite-plugin-swc-transform`) 正确生成 decorator metadata，使 `Reflect.getMetadata('design:paramtypes', target, key)` 在运行时返回正确的参数类型信息。

#### Scenario:class 类型参数的 metadata
- **当** 装饰的方法参数类型为 class（如 `Request`、`Connector`）
- **那么** 构建产物中 MUST 包含正确的 `_ts_metadata("design:paramtypes", [...])` 调用，其中 class 类型参数为精确引用

#### Scenario:interface 类型参数的 metadata
- **当** 装饰的方法参数类型为 interface（如 `IRequest`）
- **那么** 构建产物中 MUST 包含 `typeof IReq === "undefined" ? Object : IReq` 形式的安全 fallback

### Requirement:__VERSION__ 编译时替换
Vite 构建 MUST 通过 `define` 配置将所有 `__VERSION__` 标识符替换为当前包的 `package.json` 中的 `version` 值。

#### Scenario:版本字符串替换
- **当** 源码中包含 `static version = __VERSION__;`
- **那么** 构建产物中 MUST 为 `static { this.version = "2.0.2"; }`（版本号从 package.json 读取）

### Requirement:声明文件生成
Vite 构建 MUST 通过 `vite-plugin-dts` 为所有公共 API 生成 `.d.ts` 声明文件，路径与 JS 文件对应。

#### Scenario:.d.ts 文件生成
- **当** 构建完成
- **那么** `dist/` 目录中 MUST 包含与 JS 文件路径对应的 `.d.ts` 文件

### Requirement:外部依赖不被内联
Vite 构建 MUST 将所有非 workspace 依赖（`typia`、`rxjs`、`reflect-metadata`、`uuid`、`chalk`、`typeorm`、`redis` 等所有 dependencies）作为 external 处理，禁止内联到产物中。

#### Scenario:typia 不被内联
- **当** 构建完成
- **那么** 产物中的 `import typia` 或 `import * as __typia_transform__` MUST 保持为外部 import，不内联 typia 源码

#### Scenario:uuid 不被内联
- **当** 构建完成
- **那么** 产物中 MUST 保持 `import ... from "uuid"` 而非内联 uuid 的 esm-browser 版本

### Requirement:ts-patch 完全移除
构建系统 MUST 不再依赖 `ts-patch`。根 `package.json` 和所有子包 MUST 移除 `ts-patch` 相关依赖和脚本。

#### Scenario:根 package.json 清理
- **当** 变更完成
- **那么** 根 `package.json` 的 `devDependencies` 中 MUST 不包含 `ts-patch`，`scripts.prepare` MUST 不包含 `ts-patch install`

#### Scenario:子包 prepare 脚本清理
- **当** 变更完成
- **那么** 所有受影响子包的 `scripts.prepare` MUST 不包含 `ts-patch install -s`

### Requirement:tsconfig.base.json plugins 移除
`tsconfig.base.json` 的 `compilerOptions.plugins` 数组 MUST 被清空，因为 transformer 职责已转移给 Vite 插件。

#### Scenario:plugins 清空
- **当** 变更完成
- **那么** `tsconfig.base.json` 中 MUST 不包含 `VersionTransformer.cjs`、`@sora-soft/typia-decorator/transform`、`typia/lib/transform` 的 plugin 配置

### Requirement:VersionTransformer.cjs 移除
`transformer/VersionTransformer.cjs` 文件 MUST 被删除，其功能已由 Vite `define()` 替代。

#### Scenario:文件删除
- **当** 变更完成
- **那么** `transformer/` 目录 MUST 不存在
