## Why

`sora new` 当前通过 `isomorphic-git` 从一个硬编码的 GitHub 仓库 (`backend-example-project`) clone 生成项目。这限制了模板的灵活性——无法选择不同类型的模板，也无法支持私有 registry 或公司内部网络环境。将模板来源从 git 仓库切换为 npm 包，可以复用 npm 生态的 registry、auth、缓存等基础设施，实现"只要 `npm install` 能装，`sora new` 就能拿"。

## What Changes

- `sora new <name> [template]` 命令的 template 参数改为 npm 包名（如 `@sora-soft/example-template`），支持 semver range（如 `@sora-soft/example-template@^1.0.0`）
- template 参数可选，省略时展示内置模板列表供用户选择（含 Custom 选项）
- 使用 `pacote.extract()` 下载并解压 npm 包到目标目录，替代 `isomorphic-git` 的 `git.clone()`
- 使用 `libnpmconfig.read()` 读取 `.npmrc` 配置（registry、auth token、proxy 等），透传给 pacote，自动适配用户的 npm 环境
- 内置模板列表（包名 + 描述）hardcode 在 CLI 内
- 移除 `isomorphic-git` 依赖，新增 `pacote` 和 `libnpmconfig` 依赖
- 后处理逻辑（覆盖 package.json 元信息、删除无关字段）保持不变

## Capabilities

### New Capabilities
- `npm-template-download`: 通过 pacote 从 npm registry 下载模板包并解压到目标目录，自动读取 .npmrc 配置
- `template-selection`: 交互式模板选择（内置列表 + 自定义包名），支持 semver range

### Modified Capabilities

## Impact

- **代码**: `packages/sora-cli/src/commands/new.ts` 重写
- **依赖**: 移除 `isomorphic-git`，新增 `pacote`、`libnpmconfig`
- **CLI 接口**: `sora new <name>` → `sora new <name> [template]`，新增可选参数
- **用户体验**: 新增模板选择步骤；下载方式从 git clone 变为 npm 包下载
- **模板发布**: 模板项目（`apps/` 下）需独立维护 tsconfig.json 和 eslint.config.mjs，添加 `.npmignore`，package.json name 改为 `@sora-soft/xxx-template`（后续统一处理，不阻塞本次变更）
