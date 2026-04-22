## 1. 移除废弃依赖

- [x] 1.1 从 `packages/sora-cli/package.json` 的 dependencies 中移除 `libnpmconfig`
- [x] 1.2 删除 `packages/sora-cli/src/types/libnpmconfig.d.ts` 类型声明文件
- [x] 1.3 运行 `pnpm install` 更新 lockfile，确认 `libnpmconfig` 和 `figgy-pudding` 已从依赖树中移除

## 2. 添加 CLI flags

- [x] 2.1 在 `src/commands/new.ts` 的 `static flags` 中添加 `--registry`（string，可选，描述 "npm registry URL"）
- [x] 2.2 在 `src/commands/new.ts` 的 `static flags` 中添加 `--token`（string，可选，描述 "auth token for private registry"）

## 3. 重写 pacote 调用逻辑

- [x] 3.1 移除 `src/commands/new.ts` 中的 `import libnpmconfig` 语句
- [x] 3.2 删除 `libnpmconfig.read()` 和 `JSON.parse(JSON.stringify(config))` 相关代码
- [x] 3.3 构建 pacote options 对象：仅当 `--registry` 或 `--token` 有值时传入对应 key
- [x] 3.4 更新 `pacote.extract()` 调用，传入构建的 options（可能为 undefined）

## 4. 验证

- [x] 4.1 运行 `pnpm build` 确认 TypeScript 编译通过
- [x] 4.2 运行 `pnpm lint` 确认 lint 通过
- [x] 4.3 验证 `sora new --help` 输出中包含 `--registry` 和 `--token` flags
