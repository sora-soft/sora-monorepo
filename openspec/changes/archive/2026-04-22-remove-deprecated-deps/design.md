## 上下文

sora-cli 的 `new` 命令使用 `libnpmconfig.read()` 读取用户 npm 配置（registry、auth token 等），传递给 `pacote.extract()` 下载模板包。`libnpmconfig` 及其唯一依赖 `figgy-pudding` 均已标记为 deprecated。

实际使用仅三行代码（`src/commands/new.ts:107-110`），功能单一：把 npm 配置序列化后传给 pacote。

## 目标 / 非目标

**目标：**
- 移除 `libnpmconfig` 和 `figgy-pudding` 两个 deprecated 依赖
- 通过显式 CLI flags（`--registry`、`--token`）支持私有 registry 场景
- 保持向后兼容：不传 flags 时使用 pacote 默认行为（npmjs.org 公共 registry）

**非目标：**
- 不自动读取 `.npmrc` 文件（用户需显式传参）
- 不引入新的依赖替代 `libnpmconfig`
- 不支持 proxy、ca、cert 等高级 npm 配置（可后续按需添加）

## 决策

### 1. 用 CLI flags 替代隐式 npm 配置读取

**选择**：新增 `--registry` 和 `--token` 两个可选 flags。

**理由**：
- 显式优于隐式——用户清楚知道用了什么 registry
- 零依赖方案，不引入替代库
- 覆盖主要使用场景（公共 registry + 私有 registry + auth token）

**考虑过的替代方案**：
- `@npmcli/config`：npm 内部库，API 重，需 `npmPath`，引入 8 个直接依赖，得不偿失
- `ini` 读 `.npmrc`：轻量但增加解析复杂度，且不处理环境变量替换
- 零依赖手写 `.npmrc` 解析器：增加维护负担

### 2. pacote options 构建方式

```typescript
const opts: Record<string, unknown> = {};
if (flags.registry) opts.registry = flags.registry;
if (flags.token) opts.token = flags.token;
await pacote.extract(spec, dir, opts);
```

`opts.token` 是 `npm-registry-fetch`（pacote 的底层库）原生支持的 option，自动设置 `Authorization: Bearer <token>` header。无需使用 nerf dart 格式的 scoped key。

### 3. 删除类型声明文件

`src/types/libnpmconfig.d.ts` 是为 `libnpmconfig` 提供的 手写类型声明。移除库后该文件不再有意义，一并删除。

## 风险 / 权衡

- **[用户体验]** 依赖 `.npmrc` 隐式配置的私有 registry 用户需改为显式传参 → 影响面小，`sora new` 是低频命令，且大多数用户使用公共 registry
- **[功能缺失]** 不支持 proxy、ca 等高级 npm 配置 → 当前无需求，可后续按需添加新 flags
