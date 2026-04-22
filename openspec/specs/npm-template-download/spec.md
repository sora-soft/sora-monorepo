### 需求:从 npm registry 下载模板
`sora new` 命令必须使用 `pacote.extract()` 从 npm registry 下载指定的模板包并解压到目标目录，替代原有的 `isomorphic-git` git clone 方式。

#### 场景:使用默认 registry 下载
- **当** 用户执行 `sora new my-app @sora-soft/example-template`
- **那么** 系统使用 pacote 从默认 npm registry 下载 `@sora-soft/example-template@latest` 并解压到 `./my-app` 目录

#### 场景:使用版本范围下载
- **当** 用户执行 `sora new my-app @sora-soft/example-template@^1.0.0`
- **那么** 系统解析 semver range，下载符合版本约束的最新版本并解压

#### 场景:使用 scoped package 下载
- **当** 用户指定 `@some-org/custom-template` 作为模板
- **那么** 系统正确解析 scoped package 名称并从对应 registry 下载

### 需求:目标目录验证
系统必须在下载前验证目标目录不存在，防止覆盖已有项目。

#### 场景:目录已存在
- **当** 用户指定的项目名对应的目录已存在
- **那么** 系统显示错误提示并中止，不执行任何文件操作

### 需求:package.json 后处理
下载完成后，系统必须修改目标目录中的 `package.json`：覆盖 name、description、version、author、license 字段为用户输入的值，并删除 repository、bugs、homepage 字段以及 scripts.test、scripts.link 字段。

#### 场景:元数据替换
- **当** 模板包解压完成且用户确认了项目元信息
- **那么** 目标目录的 `package.json` 中 name/description/version/author/license 被用户输入替换，repository/bugs/homepage/scripts.test/scripts.link 被删除

### 需求:移除 isomorphic-git 依赖
`sora-cli` 必须移除 `isomorphic-git` 依赖，不再使用 git clone 作为模板获取方式。

#### 场景:无 git 依赖
- **当** 变更完成后的 `sora-cli` package.json
- **那么** dependencies 中不包含 `isomorphic-git`，新增 `pacote` 依赖
