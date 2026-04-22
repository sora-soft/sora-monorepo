## 为什么

sora-cli 依赖的 `libnpmconfig` 已被标记为 deprecated（官方建议使用 `@npmcli/config`，但该库是 npm CLI 内部基础设施，不适合第三方工具使用）。其间接依赖 `figgy-pudding` 也已 deprecated。这些废弃依赖会在安装时产生警告，且不会收到安全修复。

当前 `libnpmconfig.read()` 仅用于读取 npm 配置传递给 `pacote.extract()`，目的是支持私有 registry。可以用显式的 CLI flags 替代这一隐式配置读取。

## 变更内容

- 移除 `libnpmconfig` 直接依赖（自动移除 `figgy-pudding` 间接依赖）
- 删除 `src/types/libnpmconfig.d.ts` 类型声明文件
- 新增 `--registry` flag：允许用户指定 npm registry URL
- 新增 `--token` flag：允许用户指定 registry auth token
- 简化 `pacote.extract()` 调用，仅传递用户显式提供的选项

## 功能 (Capabilities)

### 新增功能
- `cli-registry-flags`: sora-cli 的 `new` 命令新增 `--registry` 和 `--token` CLI flags，用于指定 npm registry URL 和认证 token

### 修改功能

（无现有功能规范需要变更）

## 影响

- `packages/sora-cli/package.json`：移除 `libnpmconfig` 依赖
- `packages/sora-cli/src/commands/new.ts`：重写配置传递逻辑，新增 flags
- `packages/sora-cli/src/types/libnpmconfig.d.ts`：删除
- `pnpm-lock.yaml`：减少 2 个依赖项（libnpmconfig + figgy-pudding）
- 用户体验变化：私有 registry 用户需通过 `--registry` / `--token` 显式指定，而非依赖 `.npmrc` 隐式读取
