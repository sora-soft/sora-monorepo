## Context

`sora new` 命令当前使用 `isomorphic-git` 从硬编码的 GitHub 仓库 `https://github.com/sora-soft/backend-example-project.git` clone 生成项目。模板来源单一，无法支持多种项目类型，也无法在无法访问 GitHub 的内网环境使用。

现有代码位于 `packages/sora-cli/src/commands/new.ts`（107 行），使用 oclif 框架。核心流程为：inquirer 收集元信息 → git clone → 修改 package.json。

pacote 是 npm CLI 内部使用的包下载库，底层通过 `npm-registry-fetch` → `make-fetch-happen` 处理 registry 请求。它接受一个普通 opts 对象，其中包含 `registry`、`//host/:_authToken` 等 nerf-darted key，以及 `proxy`、`strictSSL`、`ca` 等网络配置。

`libnpmconfig`（1.2.1，依赖仅 figgy-pudding + find-up + ini）自动读取 `~/.npmrc`、项目 `.npmrc`、全局 `.npmrc` 和 `NPM_CONFIG_*` 环境变量，返回包含所有配置 key-value 的对象，恰好匹配 `npm-registry-fetch` 的 `auth.js` 对 opts 的预期格式（通过 `opts["//registry.example.com/:_authToken"]` 查找 auth）。

模板项目（如 `apps/example`）在 monorepo 内作为 workspace 存在，`pnpm publish` 时自动将 `workspace:*` 替换为真实版本号。

## Goals / Non-Goals

**Goals:**
- 用 npm 包取代 git 仓库作为模板来源
- 支持用户选择不同模板（内置列表 + 自定义包名）
- 自动读取 .npmrc 配置，使私有 registry / auth token / proxy 等透明工作
- 支持语义化版本范围（`@scope/pkg@^1.0.0`）
- 保持现有的后处理逻辑（覆盖 package.json 元信息）基本不变

**Non-Goals:**
- 不在本次变更中修改模板项目（apps/example）的 tsconfig.json、eslint.config.mjs、package.json name、.npmignore 等（后续统一处理）
- 不创建模板注册中心 / 模板发现服务
- 不支持模板包内的 post-install hook 或脚手架生成脚本
- 不在模板元数据中使用自定义字段（`sora-template` 等），内置列表硬编码在 CLI

## Decisions

### 1. 使用 pacote.extract() 而非手动 registry API 调用

**选择**: pacote
**替代方案**: 直接调用 npm registry HTTP API 下载 tarball + tar 解压
**理由**: pacote 处理了版本解析、缓存、重试、完整性校验等所有边缘情况。它是 npm CLI 的内部库，成熟稳定。`pacote.extract(spec, dest, opts)` 一个调用完成下载+解压。

### 2. 使用 libnpmconfig 读取 npm 配置

**选择**: libnpmconfig
**替代方案 A**: `@npmcli/config`（npm CLI 内部配置加载器）
**替代方案 B**: 手动用 `ini` 解析 `~/.npmrc`
**理由**: `@npmcli/config` 需要依赖 npm 包的内部结构，过于重量级。手动解析 `ini` 无法处理环境变量、全局配置、项目级配置的合并。libnpmconfig 虽然自 2018 年未更新，但其功能（读 ini 文件 + 环境变量 + 层级合并）非常稳定，依赖极轻（3 个包）。返回的 figgy-pudding 对象通过 spread (`{...opts}`) 可转为 pacote 接受的 plain object。

### 3. 内置模板列表硬编码在 CLI

**选择**: 硬编码 `TEMPLATES` 数组
**替代方案**: 从 npm registry 查询、维护模板注册中心包
**理由**: 框架早期模板数量少，硬编码最简单。自定义包名已提供了扩展性。后期模板增多时再引入发现机制也很容易。

### 4. 使用 .npmignore 控制模板包发布内容

**选择**: .npmignore（黑名单）
**替代方案**: `files` 字段（白名单）
**理由**: 模板项目通常"大部分内容都需要发布，只排除少数目录"。.npmignore 更直观，排除 `node_modules/`、`dist/`、`.git/` 即可。

### 5. CLI args 设计：`sora new <name> [template]`

**选择**: template 作为可选 positional arg
**理由**: 省略时进入交互式选择；提供时跳过选择直接下载。比 `--template` flag 更简洁。pacote 原生支持 `@scope/pkg@version` 格式的 spec，无需额外解析。

## Risks / Trade-offs

**libnpmconfig 维护风险** → 2018 年后未更新，依赖 ini@^1.3.5（当前 ini 已到 v4），figgy-pudding 可能与 pacote 21 的 Node 20+ 要求存在兼容性问题。→ 缓解：在实施时做 spike 验证 `libnpmconfig.read()` + spread + `pacote.extract()` 在当前 Node 版本下能正常工作。如果有问题，降级为手动 ini 解析。

**模板项目未准备好** → 当前 `apps/example` 的 tsconfig.json 和 eslint.config.mjs 依赖 monorepo 根，发布到 npm 后用户无法独立使用。→ 缓解：CLI 侧变更不依赖模板项目改造。模板项目改造作为后续独立变更处理。当前阶段可先用一个已准备好的模板包进行测试。

**pacote 体积** → pacote 21 依赖约 15 个子包（cacache、npm-registry-fetch、sigstore 等），会增加 sora-cli 的安装体积。→ 缓解：移除 isomorphic-git 可抵消部分体积增加。pacote 是标准的 npm 生态工具，值得引入。

**figgy-pudding 对象 → plain object 转换** → spread 操作符可能无法获取 figgy-pudding 的 prototype getter 属性。→ 缓解：使用 `JSON.parse(JSON.stringify(opts))` 或在实施时验证 spread 是否足够。
