## ADDED Requirements

### 需求:用户可以指定 npm registry URL

`sora new` 命令必须接受 `--registry` 可选参数，用于指定下载模板包的 npm registry URL。未指定时必须使用 pacote 的默认 registry（`https://registry.npmjs.org`）。

#### 场景:使用自定义 registry 下载模板
- **当** 用户执行 `sora new my-app --registry https://npm.mycompany.com`
- **那么** 系统必须从 `https://npm.mycompany.com` 下载模板包

#### 场景:未指定 registry
- **当** 用户执行 `sora new my-app`（不带 `--registry`）
- **那么** 系统必须使用 pacote 的默认 registry（`https://registry.npmjs.org`）

### 需求:用户可以指定 registry auth token

`sora new` 命令必须接受 `--token` 可选参数，用于向 registry 提供认证 token。token 必须通过 `Authorization: Bearer <token>` header 传递。`--token` 可以与 `--registry` 独立使用。

#### 场景:使用 token 访问私有 registry
- **当** 用户执行 `sora new my-app --registry https://npm.mycompany.com --token abc123`
- **那么** 系统必须使用指定的 registry 并携带 Bearer token 进行认证

#### 场景:仅使用 token（默认 registry）
- **当** 用户执行 `sora new my-app --token abc123`
- **那么** 系统必须使用默认 registry 并携带 Bearer token

#### 场景:不使用 token
- **当** 用户执行 `sora new my-app`（不带 `--token`）
- **那么** 系统必须不附加任何认证信息

## MODIFIED Requirements

（无）

## REMOVED Requirements

（无）
