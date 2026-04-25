## Why

项目所有包和 apps 依赖 `ts-patch` 补丁 `tsc` 来支持 TypeScript compiler plugins（typia AOT transform、typia-decorator @guard transform、__VERSION__ transform）。`ts-patch` 是一个侵入式方案——它修改全局 `tsc` 二进制文件，在 monorepo 中容易产生版本冲突，且与 Vite 等现代构建工具不兼容。typia 官方已提供 `@typia/unplugin`，`typia-decorator` 包内也已实现完整的 unplugin 支持（vite/esbuild），但从未被使用。PoC 已在 `framework` 包上验证了 Vite 构建管线的可行性。

## What Changes

- **移除** `ts-patch` 和 `tspc` 作为构建工具，所有包改用 `vite build`（lib 模式）
- **替换** typia AOT transform：从 `tsconfig plugins` + `ts-patch` → `@typia/unplugin/vite`
- **替换** @guard decorator transform：从 `tsconfig plugins` + `ts-patch` → 已有的 `@sora-soft/typia-decorator/unplugin/vite`
- **替换** `__VERSION__` transform：从自定义 TS transformer → Vite `define()` 配置
- **替换** decorator metadata emit：从 `tsc --emitDecoratorMetadata` → `vite-plugin-swc-transform`（SWC `decoratorMetadata: true`）
- **替换** 声明文件生成：从 `tsc --declaration` → `vite-plugin-dts`
- **移除** 根 `package.json` 的 `prepare: "ts-patch install"` 和各子包的 `prepare: "ts-patch install -s"`
- **移除** `tsconfig.base.json` 中的 `plugins` 数组
- **移除** `transformer/VersionTransformer.cjs`

## Capabilities

### New Capabilities

- `vite-lib-build`: 基于 Vite 的库模式构建管线，集成 SWC decorator metadata、typia unplugin、typia-decorator unplugin 和 vite-plugin-dts，替代 ts-patch/tspc 构建流程

### Modified Capabilities

（无——本次变更是构建工具替换，不改变任何运行时行为或 API）

## Impact

- **受影响的包（需迁移）**: `framework`, `database-component`, `http-support`, `redis-component`, `etcd-component`, `etcd-discovery`, `ram-discovery`
- **受影响的 apps（需迁移）**: `base-cluster-template`, `account-cluster-template`, `http-server-template`
- **不受影响的包**: `sora-cli`（使用 plain `tsc`，无 ts-patch）、`typia-decorator`（使用 plain `tsc`，无 plugins）
- **依赖变更**: 新增 `vite`、`vite-plugin-dts`、`vite-plugin-swc-transform`、`@typia/unplugin`、`@swc/core`；移除 `ts-patch`
- **根配置**: `tsconfig.base.json` 移除 plugins、`package.json` 移除 ts-patch 依赖和 prepare 脚本
- **构建脚本**: 所有受影响包的 `build` 从 `tspc` → `vite build`，`prepare` 移除 `ts-patch install -s`
- **产物结构**: 需确保 Vite 输出的 `dist/` 目录结构与现有 tsc 输出一致，以维持 `exports` map 兼容性
