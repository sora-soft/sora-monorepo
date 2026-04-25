## Context

当前构建管线：每个包使用 `tspc`（ts-patch 补丁后的 tsc）编译，依赖 `tsconfig.base.json` 中的三个 compiler plugins：

```
tspc (patched tsc)
  ├── ① VersionTransformer.cjs     → __VERSION__ 替换为 package.json version
  ├── ② @sora-soft/typia-decorator/transform → @guard 参数装饰器 → typia.assert 代码生成
  └── ③ typia/lib/transform        → typia.assert<T>() / typia.is<T>() AOT 展开
```

所有三个 transformer 在 Vite 生态中都有成熟的替代方案。PoC 已在 `framework` 包上验证成功。

## Goals / Non-Goals

**Goals:**
- 所有使用 ts-patch 的包和 apps 改用 Vite 构建
- 保持 typia AOT 功能完全不变（assert/is/validate 代码生成结果一致）
- 保持 @guard decorator 功能完全不变
- 保持 __VERSION__ 替换功能完全不变
- 保持 emitDecoratorMetadata 功能完全不变（Route 系统依赖）
- 保持产物 dist/ 目录结构与 exports map 兼容
- 移除 ts-patch 全局依赖和各包的 prepare 钩子

**Non-Goals:**
- 不改变任何运行时行为或 API
- 不重构 Route 系统的 decorator metadata 依赖模式
- 不迁移 sora-cli（它使用 plain tsc，不依赖 ts-patch）
- 不迁移 typia-decorator 包本身（它使用 plain tsc，不依赖 plugins）
- 不引入 dev server / HMR 等 Vite 前端特性
- 不优化构建速度（后续可单独处理）

## Decisions

### Decision 1: 使用 Vite lib 模式 + Rolldown

**选择**: `vite build --lib` 配合 `preserveModules: true`

**替代方案**:
- (A) tsup — 基于 esbuild，不支持 emitDecoratorMetadata
- (B) 纯 esbuild — 同样不支持 decoratorMetadata
- (C) 混合管线 (tsc for metadata + vite for JS) — 复杂度高，维护困难

**理由**: Vite lib 模式是 Rolldown (Rollup-compatible) 的标准库打包方式，配合 SWC 处理 decorator metadata，PoC 已验证可行。

### Decision 2: 使用 vite-plugin-swc-transform 处理 decorator metadata

**选择**: `vite-plugin-swc-transform`，配置 `legacyDecorator: true` + `decoratorMetadata: true`

**替代方案**:
- (A) Vite 8 内置 Oxc transformer — 仅部分支持 emitDecoratorMetadata，interface 类型会丢失
- (B) @rollup/plugin-swc — Vite 8 官方推荐，但文档示例仅覆盖新标准装饰器 (2023-11)，不确定是否支持 legacy + metadata
- (C) 自定义 Vite 插件封装 tsc transpileModule — 慢，失去使用 SWC 的意义

**理由**: `vite-plugin-swc-transform` 专为 legacy decorator + metadata 场景设计，PoC 验证了 SWC 正确生成 `_ts_metadata("design:paramtypes", ...)` 辅助调用。对于 interface 类型参数使用 `typeof X === "undefined" ? Object : X` fallback，比 tsc 的直接 `Object` 更精确。

### Decision 3: 插件执行顺序

**选择**: `typiaDecorator(pre)` → `UnpluginTypia(pre)` → `swc(pre)`

**理由**: transform 链需要按依赖顺序执行：
1. typiaDecorator 先处理 @guard 装饰器，生成 `typia.assert<T>(param)` 调用
2. UnpluginTypia 展开 `typia.assert<T>()` 为运行时验证代码
3. SWC 最后处理 decorator metadata + TS → JS 转译

所有三个插件使用 `enforce: 'pre'`，在 Vite 内置 Oxc transformer 之前运行。

### Decision 4: __VERSION__ 使用 Vite define()

**选择**: 在 vite.config.ts 中使用 `define: { __VERSION__: JSON.stringify(pkg.version) }`

**替代方案**:
- (A) 自定义 Vite 插件复刻 VersionTransformer — 过度工程
- (B) import.meta.env — 需要改源码，不是 drop-in 替换

**理由**: `define()` 是 Vite 原生功能，在编译时直接替换标识符，效果与 TS transformer 完全一致。

### Decision 5: Node.js 内置模块 externalization

**选择**: 在 `rollupOptions.external` 中显式列出所有 Node.js 内置模块

**理由**: Vite 8 默认为 browser compatibility 会将 `path`、`net`、`crypto` 等模块替换为空代理。此项目是 Node.js 服务端框架，需要禁用此行为。通过显式 external 列表确保 Node 内置模块保持为外部依赖。

### Decision 6: 声明文件使用 vite-plugin-dts

**选择**: `vite-plugin-dts`，底层调用 tsc 生成 .d.ts

**理由**: .d.ts 生成需要完整的类型信息，SWC/esbuild 都不生成声明文件。vite-plugin-dts 在构建后调用 tsc --emitDeclarationOnly，PoC 验证了路径正确（不受 preserveModulesRoot 问题影响）。

## Risks / Trade-offs

**[preserveModulesRoot 路径问题]** → Rolldown 在 monorepo 绝对路径下 `preserveModulesRoot` 未正确剥离路径前缀，导致 JS 输出为 `dist/packages/framework/src/...` 而非 `dist/...`。.d.ts 不受影响（由 vite-plugin-dts 独立生成）。缓解措施：用 Vite 插件 writeBundle 钩子做后处理重命名，或改用 Rolldown 的 sanitizeFileName 配置。

**[vite-plugin-swc-transform peer dependency]** → 该插件的 peer dependency 声明为 `vite@^5 || ^6 || ^7`，但实际在 Vite 8 上工作正常。如果未来 Vite 升级破坏兼容性，可能需要切换到 `@rollup/plugin-swc`。

**[uuid 包被内联]** → PoC 中 uuid 的 esm-browser 版本被内联到产物中（未正确 external）。需要确保 external 函数覆盖 `uuid`。

**[构建速度]** → SWC transform 占构建时间 52%，typia 占 36%。首次构建与 tspc 基本持平（~5s），可通过启用 cache 优化后续构建。

**[chalk 被 bundle 到产物中]** → `chalk` 等运行时依赖被内联而非 externalized。需要完善 external 规则，将所有非 workspace 的运行时依赖标记为 external。
