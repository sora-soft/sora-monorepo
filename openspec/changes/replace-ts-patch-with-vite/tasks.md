## 1. 根配置清理

- [ ] 1.1 根 `package.json` 移除 `ts-patch` 依赖（devDependencies）和 `prepare: "ts-patch install"` 脚本
- [ ] 1.2 `tsconfig.base.json` 清空 `compilerOptions.plugins` 数组（移除 VersionTransformer、typia-decorator/transform、typia/lib/transform 三项）
- [ ] 1.3 删除 `transformer/VersionTransformer.cjs` 和 `transformer/` 目录
- [ ] 1.4 根 `package.json` 添加 `vite`、`@typia/unplugin` 到 devDependencies（作为 monorepo 共享构建工具）

## 2. Vite 构建模板建立（以 framework 包为基准）

- [ ] 2.1 在 `packages/framework` 安装构建依赖：`vite`、`vite-plugin-dts`、`vite-plugin-swc-transform`、`@swc/core`
- [ ] 2.2 创建 `packages/framework/vite.config.ts`，配置：typiaDecorator(enforce:pre) → UnpluginTypia(enforce:pre) → swc(enforce:pre, legacyDecorator+decoratorMetadata+useDefineForClassFields:false) → dts → define(__VERSION__)
- [ ] 2.3 配置 `rollupOptions.external` 覆盖所有 Node.js 内置模块、workspace 依赖（@sora-soft/*）、typia、rxjs、reflect-metadata 以及所有 package.json dependencies
- [ ] 2.4 解决 `preserveModulesRoot` 路径问题，确保 JS 输出路径为 `dist/lib/xxx.js` 而非 `dist/packages/framework/src/lib/xxx.js`
- [ ] 2.5 修改 `packages/framework/package.json`：`build` 脚本从 `tspc` 改为 `vite build`，移除 `prepare: "ts-patch install -s"`，移除 `ts-patch` 依赖
- [ ] 2.6 执行 `vite build` 并验证：typia AOT 展开、@guard 代码生成、__VERSION__ 替换、decorator metadata、.d.ts 生成、external 依赖未内联
- [ ] 2.7 对比 Vite 产物与 tspc 产物的 `exports` map 兼容性（文件路径、模块解析）

## 3. 其余 packages 迁移

- [ ] 3.1 迁移 `packages/database-component`：创建 vite.config.ts，更新 package.json 脚本，构建验证
- [ ] 3.2 迁移 `packages/http-support`：创建 vite.config.ts，更新 package.json 脚本，构建验证
- [ ] 3.3 迁移 `packages/redis-component`：创建 vite.config.ts，更新 package.json 脚本，构建验证
- [ ] 3.4 迁移 `packages/etcd-component`：创建 vite.config.ts，更新 package.json 脚本，构建验证
- [ ] 3.5 迁移 `packages/etcd-discovery`：创建 vite.config.ts，更新 package.json 脚本，构建验证
- [ ] 3.6 迁移 `packages/ram-discovery`：创建 vite.config.ts，更新 package.json 脚本，构建验证

## 4. Apps 迁移

- [ ] 4.1 迁移 `apps/base-cluster-template`：创建 vite.config.ts（多入口需包含所有 exports），更新 package.json 脚本，构建验证
- [ ] 4.2 迁移 `apps/account-cluster-template`：创建 vite.config.ts，更新 package.json 脚本，构建验证
- [ ] 4.3 迁移 `apps/http-server-template`：创建 vite.config.ts，更新 package.json 脚本，构建验证

## 5. 最终验证

- [ ] 5.1 在根目录执行完整 `pnpm build`，确认所有包和 apps 构建成功
- [ ] 5.2 确认 `ts-patch` 已从整个项目完全移除（grep 验证无残留引用）
- [ ] 5.3 确认 `pnpm install` 后不再执行 `ts-patch install`（无 prepare 钩子）
- [ ] 5.4 清理 PoC 遗留的 `packages/framework/vite.config.ts`（如果是临时文件则重新创建正式版本）
