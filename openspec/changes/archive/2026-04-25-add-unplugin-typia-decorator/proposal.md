## 为什么

`@sora-soft/typia-decorator` 当前只能通过 `ts-patch` (tspc) 作为 TypeScript compiler plugin 运行。这导致整个 monorepo 的 10 个包全部锁定在 `tspc` 编译管线中，无法使用 vite 生态的工具——包括 vitest 测试框架。

`@typia/typia` 官方已提供 `@typia/unplugin` 解决 typia transform 在 vite/esbuild 下的运行问题。但 `typia-decorator` 的 `@guard` 装饰器 transform 没有对应的 unplugin 适配，成为 monorepo 全面转入 vite 编译的最后一块拼图。

## 变更内容

- 为 `@sora-soft/typia-decorator` 包新增 unplugin 导出，支持在 vite/esbuild 管线中执行 `@guard` 装饰器的 AST transform
- 新增 `./unplugin` 导出路径，提供 vite 和 esbuild 适配
- 实现基于文件内容 hash 的磁盘缓存，避免重复创建 `ts.Program`
- 新增 `unplugin` 作为 peerDependency

## 功能 (Capabilities)

### 新增功能
- `unplugin-guard-transform`: 基于 unplugin 的 `@guard` 装饰器 AST transform 插件，支持 vite 和 esbuild。在 bundler 管道中创建临时 `ts.Program` 获取 `TypeChecker`，执行现有的 `processSourceFile` 逻辑，完成 `@guard` 参数验证代码的注入

### 修改功能

## 影响

- **`packages/typia-decorator`**: 新增 `src/unplugin/` 目录，package.json 新增 `./unplugin` exports 和 peerDependencies
- **依赖**: 新增 `unplugin`, `magic-string`, `diff-match-patch-es`, `@rollup/pluginutils`, `pathe`, `pkg-types`, `consola`, `find-cache-dir` 作为 peerDependencies
- **构建脚本**: package.json build 脚本需扩展以编译 unplugin 目录
- **下游消费者**: framework 及其他包可通过 unplugin 方式使用 typia-decorator transform，为后续 vite 迁移铺路
