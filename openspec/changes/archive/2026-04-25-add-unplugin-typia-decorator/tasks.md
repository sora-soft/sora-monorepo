## 1. 项目结构搭建

- [x] 1.1 创建 `packages/typia-decorator/src/unplugin/` 目录及子文件结构（index.ts, transform.ts, cache.ts, options.ts, utils.ts）
- [x] 1.2 创建 `packages/typia-decorator/src/unplugin/tsconfig.json`，继承 base 配置，输出到 `dist/unplugin`
- [x] 1.3 更新 `packages/typia-decorator/package.json`：新增 `./unplugin` 和 `./unplugin/vite` 和 `./unplugin/esbuild` exports，新增 peerDependencies（unplugin, magic-string, diff-match-patch-es, @rollup/pluginutils, pathe, pkg-types, consola, find-cache-dir）
- [x] 1.4 更新 build 脚本，增加 unplugin 目录的 tsc 编译步骤

## 2. 核心 transform 实现

- [x] 2.1 实现 `src/unplugin/transform.ts`：读 tsconfig 获取 compilerOptions（带缓存），使用 `ts.createSourceFile` 创建内存 SourceFile，自定义 `ts.createCompilerHost`（当前文件走内存，其他走磁盘+sourceCache），调用 `ts.createProgram` 获取 Program
- [x] 2.2 在 transform 中调用现有的 `processSourceFile`（从 `../transform/visitor.js` 导入），使用 `ts.transform` 执行 AST 变换，用 `ts.Printer` 输出结果
- [x] 2.3 实现快速路径过滤：检查 `source.includes('@guard')` 和 `source.includes('typia-decorator')`，不匹配则返回 null

## 3. 缓存系统

- [x] 3.1 实现 `src/unplugin/cache.ts`：基于 `(id, source)` 的 MD5 hash 作为缓存 key，存储到 `node_modules/.cache/unplugin_typia_decorator/`
- [x] 3.2 缓存写入时附加版本标记注释，读取时校验标记以检测缓存有效性
- [x] 3.3 在 transform 流程中集成缓存：先查缓存，命中则跳过 Program 创建，未命中则 transform 后写入缓存

## 4. Unplugin 集成

- [x] 4.1 实现 `src/unplugin/options.ts`：定义 Options 类型（include, exclude, enforce, tsconfig, cache, log），实现 resolveOptions 合并默认值
- [x] 4.2 实现 `src/unplugin/utils.ts`：日志工具函数（使用 consola）
- [x] 4.3 实现 `src/unplugin/index.ts`：使用 `createUnplugin` 创建插件实例，注册 transform hook，集成 diff-match-patch-es + magic-string 生成 sourcemap
- [x] 4.4 验证 `./unplugin/vite` 和 `./unplugin/esbuild` 导出路径正确解析

## 5. 构建验证

- [x] 5.1 执行 `pnpm build` 确认 unplugin 代码正确编译到 `dist/unplugin/`
- [x] 5.2 确认 `./transform` 和 `./runtime` 导出行为不变（无回归）
- [x] 5.3 确认 package.json 的 exports 路径与 dist 目录结构匹配
