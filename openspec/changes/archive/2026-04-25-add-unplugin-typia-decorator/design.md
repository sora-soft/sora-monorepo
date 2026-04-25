## 上下文

`@sora-soft/typia-decorator` 是一个编译时 AST transform 库，它通过 `@guard` 参数装饰器在方法体开头注入 typia `assert()` 调用。当前仅能通过 ts-patch 的 compiler plugin 机制运行，这要求所有使用者必须使用 `tspc` 编译。

`@typia/unplugin` 已经证明了在 vite/esbuild 管线中执行 typia transform 的可行性——其核心方法是：在 transform hook 中临时创建 `ts.Program`（自定义 `CompilerHost`，当前文件从内存加载，其他文件从磁盘读取并缓存），获取 `TypeChecker`，然后执行与 tsc plugin 完全相同的 AST transform。

本设计复用这一模式，为 `typia-decorator` 的 `processSourceFile` 提供 unplugin 适配。

## 目标 / 非目标

**目标：**
- 在 `packages/typia-decorator` 包内新增 unplugin 导出，支持 vite 和 esbuild
- 在 unplugin transform hook 中创建临时 `ts.Program` 并调用现有的 `processSourceFile` 逻辑
- 实现基于文件内容 hash 的磁盘缓存，与 `@typia/unplugin` 的缓存策略对齐
- 不修改现有的 transform 逻辑（`src/transform/`），完全复用

**非目标：**
- 不合并 typia transform 和 decorator transform 为一个 plugin（各自独立，通过 `@typia/unplugin` + 本插件配合使用）
- 不支持 Svelte 或其他非 TS 文件
- 不修改 `tsconfig.base.json` 或任何下游包的编译配置（那是后续迁移变更的范围）
- 不替代现有的 tsc plugin 导出（`./transform` 路径保持不变）

## 决策

### D1: unplugin 代码放在 typia-decorator 包内而非独立包

**选择**: 在 `packages/typia-decorator/src/unplugin/` 新增代码，通过 `./unplugin` export 暴露

**替代方案**: 创建独立的 `@sora-soft/unplugin-typia-decorator` 包

**理由**: typia 官方也是将 unplugin 放在 typia mono-repo 内作为 `@typia/unplugin` 包，但那是因为 typia 本身是独立仓库。在我们的场景下，typia-decorator 的 transform 逻辑和 unplugin 胶水层紧密耦合，放在同一个包里更便于维护和版本同步。通过 `exports` 字段实现 tree-shaking 友好的分包导出。

### D2: 复用 @typia/unplugin 的 getProgramAndSource 模式

**选择**: 参照 `@typia/unplugin` 的 `core/typia.ts`，自行实现 `ts.Program` 创建逻辑

**替代方案 A**: 直接依赖 `@typia/unplugin` 并调用其 `transformTypia` 导出
**替代方案 B**: 使用 ts-morph 等 higher-level API

**理由**: 方案 A 会引入不必要的耦合（typia unplugin 的版本升级可能破坏 decorator 的使用），且 `transformTypia` 内部硬编码了 typia 的 transform 调用，不可扩展。方案 B 引入过重的依赖。自实现的代码量约 100 行，且逻辑清晰（读 tsconfig → 创建 SourceFile → 自定义 Host → 创建 Program → transform），完全可控。

### D3: 磁盘缓存策略

**选择**: 与 `@typia/unplugin` 一致——基于 `(id, source)` 的 MD5 hash 作为缓存 key，存储到 `node_modules/.cache/unplugin_typia_decorator/` 目录

**理由**: `ts.createProgram()` 是重量级操作（需要解析所有类型依赖）。在 dev 模式下文件未变更时跳过 transform 可大幅提升性能。选择与 typia unplugin 相同的缓存目录命名模式（`unplugin_typia_decorator`），便于用户统一清理缓存。

### D4: 新增依赖作为 peerDependencies

**选择**: `unplugin`, `typescript`, `typia`, `@typia/core`, `magic-string`, `diff-match-patch-es`, `@rollup/pluginutils`, `pathe`, `pkg-types`, `consola`, `find-cache-dir` 全部作为 peerDependencies

**理由**: 这些库在 monorepo 中通常被提升到 root，作为 peerDependencies 可以避免重复安装，也符合 unplugin 生态的惯例。使用者的项目（如 framework 包的测试配置）本身已安装 vite/esbuild，会自动满足 unplugin 的 peer 要求。

### D5: 快速路径过滤

**选择**: transform hook 先检查 `source.includes('@guard')` 和 `source.includes('typia-decorator')`，不匹配则直接跳过

**理由**: 大多数 .ts 文件不使用 `@guard`，跳过可避免不必要的 `ts.createProgram()` 调用。`@typia/unplugin` 也使用类似策略（检查 `source.includes('typia')`）。

### D6: SourceMap 生成方式

**选择**: 使用 `magic-string` + `diff-match-patch-es` 对比源码和变换后代码，生成 sourcemap

**理由**: 与 `@typia/unplugin` 完全相同的方案。`ts.Printer` 输出的代码与原始源码差异较大（会重新格式化），直接使用 printer 输出的 sourcemap 质量不好。通过 diff + magic-string 可以精确追踪每个字符的变换位置。

## 风险 / 权衡

**[性能] 每个文件 transform 都创建 ts.Program** → 通过磁盘缓存缓解。首次 transform 后，后续命中缓存时直接读取，不创建 Program。生产构建是 cold start 但可接受。

**[内存] sourceCache 在 dev 模式下可能膨胀** → 设置 Map 上限或使用 LRU 策略。但 typia unplugin 同样没有做这个优化，暂且对齐。

**[兼容性] 自定义 CompilerHost 可能遗漏某些模块解析场景** → `@typia/unplugin` 已在生产环境验证了这一模式。我们的实现几乎完全复用其 Host 逻辑，风险可控。

**[耦合] unplugin 代码与 typia-decorator transform 紧密耦合** → transform 核心逻辑（`processSourceFile`）不变，unplugin 只是胶水层。如果未来 transform 接口变化，只需更新胶水层。
