## ADDED Requirements

### Requirement:Download template from npm registry
`sora new` 命令必须使用 `pacote.extract()` 从 npm registry 下载指定的模板包并解压到目标目录，替代原有的 `isomorphic-git` git clone 方式。

#### Scenario:Download with default registry
- **WHEN** 用户执行 `sora new my-app @sora-soft/example-template`
- **THEN** 系统使用 pacote 从默认 npm registry 下载 `@sora-soft/example-template@latest` 并解压到 `./my-app` 目录

#### Scenario:Download with version range
- **WHEN** 用户执行 `sora new my-app @sora-soft/example-template@^1.0.0`
- **THEN** 系统解析 semver range，下载符合版本约束的最新版本并解压

#### Scenario:Download with scoped package
- **WHEN** 用户指定 `@some-org/custom-template` 作为模板
- **THEN** 系统正确解析 scoped package 名称并从对应 registry 下载

### Requirement:Read npm configuration automatically
系统必须通过 `libnpmconfig.read()` 自动读取用户的 npm 配置（`.npmrc` 文件和环境变量），并将配置透传给 pacote，使私有 registry、auth token、proxy 等 settings 自动生效。

#### Scenario:Private registry with auth token
- **WHEN** 用户的 `~/.npmrc` 包含 `//my-registry.com/:_authToken=xxx` 和 `registry=https://my-registry.com/`
- **THEN** 系统自动使用该 registry URL 和 auth token 下载模板包，无需额外参数

#### Scenario:Corporate proxy
- **WHEN** 用户的 npm 配置包含 `https-proxy=http://proxy.company.com:8080`
- **THEN** 系统通过该代理发起下载请求

### Requirement:Target directory validation
系统必须在下载前验证目标目录不存在，防止覆盖已有项目。

#### Scenario:Directory already exists
- **WHEN** 用户指定的项目名对应的目录已存在
- **THEN** 系统显示错误提示并中止，不执行任何文件操作

### Requirement:Package.json post-processing
下载完成后，系统必须修改目标目录中的 `package.json`：覆盖 name、description、version、author、license 字段为用户输入的值，并删除 repository、bugs、homepage 字段以及 scripts.test、scripts.link 字段。

#### Scenario:Metadata replacement
- **WHEN** 模板包解压完成且用户确认了项目元信息
- **THEN** 目标目录的 `package.json` 中 name/description/version/author/license 被用户输入替换，repository/bugs/homepage/scripts.test/scripts.link 被删除

### Requirement:Remove isomorphic-git dependency
`sora-cli` 必须移除 `isomorphic-git` 依赖，不再使用 git clone 作为模板获取方式。

#### Scenario:No git dependency
- **WHEN** 变更完成后的 `sora-cli` package.json
- **THEN** dependencies 中不包含 `isomorphic-git`，新增 `pacote` 和 `libnpmconfig`
