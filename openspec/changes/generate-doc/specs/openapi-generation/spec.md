## ADDED Requirements

### 需求:generate:doc 命令扫描 Route 类
系统必须提供 `sora generate:doc` 命令，扫描代码中所有 `@soraExport route` 标注的类，将其方法生成为 OpenAPI 3.0 路径条目。

#### 场景:成功扫描并生成文档
- **当** 存在标注了 `@soraExport route` 的类，且类中有 `@Route.method` 装饰的方法
- **那么** 这些方法必须出现在生成的 OpenAPI 文档的 `paths` 中

#### 场景:无 Route 类时生成空文档
- **当** 代码中不存在任何 `@soraExport route` 标注的类
- **那么** 生成只包含 `openapi`、`info`、空 `paths` 和空 `components` 的有效 OpenAPI 文档

### 需求:只处理 Route.method 忽略 Route.notify
系统必须只为 `@Route.method` 装饰的方法生成文档，`@Route.notify` 装饰的方法禁止出现在文档中。

#### 场景:notify 方法不生成文档
- **当** 类中某个方法使用了 `@Route.notify` 装饰器
- **那么** 该方法不出现在 OpenAPI 文档的 paths 中

### 需求:@soraPrefix 定义路径前缀
系统必须读取类级别 `@soraPrefix` 注解作为该类所有方法的 API 路径前缀。`@soraPrefix` 支持逗号分隔的多个路径（如 `@soraPrefix /api/v1/auth, /api/v2/auth`），每个方法必须为每个 prefix 各生成一条完整的 OpenAPI 路径条目。完整路径由 `prefix + "/" + methodName` 拼接。`@soraPrefix` 缺失时默认为 `["/"]`。

#### 场景:使用单个前缀
- **当** 类标注了 `@soraPrefix /api/auth`，方法名为 `register`
- **那么** 生成的路径为 `/api/auth/register`

#### 场景:使用多个前缀
- **当** 类标注了 `@soraPrefix /api/v1/auth, /api/v2/auth`，方法名为 `register`
- **那么** 同时生成路径 `/api/v1/auth/register` 和 `/api/v2/auth/register`，两者指向相同的 operation

#### 场景:无前缀时使用默认值
- **当** 类未标注 `@soraPrefix`
- **那么** 路径前缀为 `["/"]`

#### 场景:前缀去重斜杠
- **当** `@soraPrefix` 以 `/` 开头且方法名不含斜杠
- **那么** 拼接时禁止出现双斜杠（如 `//register`）

### 需求:@method 指定 HTTP 方法
系统必须读取方法级别 `@method` JSDoc tag 指定 HTTP 方法。未标注时默认为 `POST`。`@method` 值必须为 `GET | POST | PUT | DELETE | PATCH | HEAD | OPTIONS` 之一（大小写不敏感），非法值必须导致命令报错终止。

#### 场景:指定 GET 方法
- **当** 方法标注了 `@method GET`
- **那么** 该路径的操作为 `get`

#### 场景:未标注默认 POST
- **当** 方法未标注 `@method`
- **那么** 该路径的操作为 `post`

#### 场景:非法方法值报错
- **当** 方法标注了 `@method FOOBAR`
- **那么** 命令必须报错并终止，提示合法值列表

### 需求:@description 作为接口描述
系统必须读取方法的 JSDoc `@description` tag 或主注释文本作为 OpenAPI 操作的 `summary` 字段。优先读取 `@description` tag，无则 fallback 到 JSDoc 主注释。均无则为空字符串。

#### 场景:显式 description tag
- **当** 方法 JSDoc 包含 `@description 注册账号`
- **那么** 操作的 `summary` 为 `"注册账号"`

#### 场景:主注释文本
- **当** 方法 JSDoc 主注释为 `获取用户信息` 且无 `@description` tag
- **那么** 操作的 `summary` 为 `"获取用户信息"`

#### 场景:无描述
- **当** 方法无任何 JSDoc
- **那么** 操作的 `summary` 为空字符串

### 需求:参数类型转换为 requestBody
系统必须将方法的第一个参数的类型转换为 OpenAPI `requestBody`。参数为 `void` 或方法无参数时禁止生成 `requestBody`。命名的 interface/type 必须提取到 `components/schemas` 并以 `$ref` 引用。

#### 场景:命名类型参数
- **当** 第一个参数类型为 `IReqRegister`（命名 interface）
- **那么** requestBody 的 schema 为 `{ "$ref": "#/components/schemas/IReqRegister" }`，且 `IReqRegister` 的完整 JSON Schema 出现在 `components/schemas` 中

#### 场景:void 参数
- **当** 第一个参数类型为 `void`
- **那么** 不生成 `requestBody`

#### 场景:无参数方法
- **当** 方法没有参数（如 `async fetchAll()`）
- **那么** 不生成 `requestBody`

### 需求:返回类型转换为 response schema
系统必须将方法的返回类型转换为 OpenAPI `responses.200` 的 content schema。返回值为 `void` 时生成空 response schema。命名的 interface/type 必须提取到 `components/schemas` 并以 `$ref` 引用，匿名类型 inline。必须自动解包 `Promise<T>` 外层。

#### 场景:命名返回类型
- **当** 方法返回类型为 `IAuthInfo`
- **那么** response schema 为 `{ "$ref": "#/components/schemas/IAuthInfo" }`

#### 场景:匿名返回类型
- **当** 方法返回推断类型 `{ id: number }`
- **那么** response schema 直接 inline 为 `{ "type": "object", "properties": { "id": { "type": "number" } } }`

#### 场景:void 返回
- **当** 方法无返回值或返回 `void`
- **那么** `responses.200` 生成空 schema（`description: ""`，无 content）

#### 场景:Promise 解包
- **当** 返回类型为 `Promise<IResult>`
- **那么** 系统必须解包为 `IResult` 再转换

### 需求:@soraTargets 过滤
`generate:doc` 命令必须受 `--target` 参数和 `@soraTargets` 注解的影响，过滤规则与 `export:api` 一致。

#### 场景:target 过滤
- **当** 类标注了 `@soraTargets web`，命令传入 `--target admin`
- **那么** 该类的所有方法不出现在文档中

### 需求:@soraIgnore 跳过方法
被 `@soraIgnore` 标注的方法禁止出现在文档中。

#### 场景:方法被忽略
- **当** 方法标注了 `@soraIgnore`
- **那么** 该方法不出现在 OpenAPI 文档中

### 需求:输出格式
系统必须支持通过 `--format` 参数指定输出格式，可选 `yaml`（默认）或 `json`。输出路径由 `sora.json` 的 `docOutput` 字段决定，文件扩展名根据格式自动添加。

#### 场景:默认 YAML 输出
- **当** 不传 `--format` 参数
- **那么** 输出文件为 `yaml` 格式，路径为 `<docOutput>.yml`

#### 场景:JSON 输出
- **当** 传入 `--format json`
- **那么** 输出文件为 `json` 格式，路径为 `<docOutput>.json`

### 需求:OpenAPI info 字段
系统必须从 `sora.json` 所在目录向上查找 `package.json`，读取 `name` 作为 `info.title`、`version` 作为 `info.version`。缺失时 fallback 为 `"Sora API"` / `"1.0.0"`。

#### 场景:从 package.json 读取
- **当** `sora.json` 同级目录存在 `package.json` 且包含 `{ "name": "my-app", "version": "2.1.0" }`
- **那么** `info.title` 为 `"my-app"`，`info.version` 为 `"2.1.0"`

#### 场景:package.json 缺失
- **当** 找不到 `package.json`
- **那么** `info.title` 为 `"Sora API"`，`info.version` 为 `"1.0.0"`

### 需求:多 Route 类合并
所有 `@soraExport route` 标注的类必须合并到单个 OpenAPI 文档中。

#### 场景:多个 handler 合并
- **当** 存在 `AuthHandler`（prefix `/api/auth`）和 `UserHandler`（prefix `/api/user`）
- **那么** 生成的文档 `paths` 中同时包含两个 handler 的路径

### 需求:tags 按类名分组
每个 path operation 的 `tags` 必须设置为所属 Route 类的类名。

#### 场景:类名作为 tag
- **当** `AuthHandler` 类的方法 `register`
- **那么** 该 operation 的 `tags` 为 `["AuthHandler"]`
