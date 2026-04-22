# @sora-soft/cli 注解参考

@sora-soft/cli 通过 JSDoc 注解控制代码的导出行为和文档生成。本文档详细说明每个注解的用途、影响范围和生成结果。

## 注解总览

| 注解 | 位置 | 影响范围 |
|---|---|---|
| `@soraExport` | 类、枚举、接口、类型别名 | `export:api`、`export:doc` |
| `@soraTargets` | 类、枚举、接口、类型别名 | `export:api`、`export:doc` |
| `@soraIgnore` | 方法、属性 | `export:api`、`export:doc` |
| `@soraPrefix` | 类（仅 route） | `export:doc` |
| `@method` | 方法 | `export:doc` |
| `@description` | 方法 | `export:doc` |

此外，以下框架装饰器影响导出行为（不是 JSDoc 注解，但与注解配合使用）：

| 装饰器 | 来源 | 影响范围 |
|---|---|---|
| `@Route.method` | `@sora-soft/framework` | `export:api`、`export:doc` |
| `@Route.notify` | `@sora-soft/framework` | `export:api`、`export:doc` |

---

## `@soraExport`

**位置**：类、枚举、接口、类型别名

**作用**：标记此声明需要被 `export:api` 和 `export:doc` 处理。没有此注解的声明会被完全忽略。

**值**：

| 值 | 含义 |
|---|---|
| `route` | 路由类。`export:api` 转为接口（保留 `@Route.method` 方法的参数和返回类型）；`export:doc` 为每个方法生成 OpenAPI PathItem |
| `entity` | 实体类。`export:api` 转为接口（保留公共非静态属性） |
| （无值） | 通用类。`export:api` 转为接口（保留公共非静态属性） |

对于枚举、`interface`、`type alias`，`@soraExport` 不需要值，声明会被直接导出。

**影响范围**：

| 命令 | 行为 |
|---|---|
| `export:api` | 决定声明是否被收集，以及转换为接口的方式 |
| `export:doc` | 仅 `route` 值的类会被收集生成文档 |

### 示例：route

```typescript
/**
 * @soraExport route
 */
class AuthHandler extends Route {
  @Route.method
  async login(@guard body: IReqLogin): Promise<IRespLogin> { ... }

  @Route.method
  async register(@guard body: IReqRegister): Promise<IRespRegister> { ... }
}
```

`export:api` 生成：

```typescript
export interface AuthHandler {
  login(body: IReqLogin): Promise<IRespLogin>;
  register(body: IReqRegister): Promise<IRespRegister>;
}
```

`export:doc` 生成（片段）：

```yaml
paths:
  /login:
    post:
      summary: ""
      tags: [AuthHandler]
      requestBody: ...
      responses: ...
  /register:
    post:
      summary: ""
      tags: [AuthHandler]
      requestBody: ...
      responses: ...
```

### 示例：entity

```typescript
/**
 * @soraExport entity
 */
class UserEntity {
  public id: string;
  public name: string;
  private internalState: any;
  static create(): UserEntity { ... }
}
```

`export:api` 生成：

```typescript
export interface UserEntity {
  id: string;
  name: string;
}
```

私有属性和静态方法被过滤，仅保留公共非静态属性。

### 示例：枚举和类型

```typescript
/** @soraExport */
enum UserRole {
  Admin = "admin",
  User = "user",
}

/** @soraExport */
interface IApiResponse<T> {
  code: number;
  data: T;
}
```

`export:api` 直接导出，确保有 `export` 关键字：

```typescript
export enum UserRole {
  Admin = "admin",
  User = "user",
}

export interface IApiResponse<T> {
  code: number;
  data: T;
}
```

---

## `@soraTargets`

**位置**：类、枚举、接口、类型别名（与 `@soraExport` 配合使用）

**作用**：声明级的目标环境过滤。使用 `--target` 参数运行 `export:api` 或 `export:doc` 时，只有匹配的声明会被处理。不指定 `@soraTargets` 的声明在所有 target 下都会被导出。

**值**：逗号分隔的目标名称，如 `web`、`admin`、`web,admin`。

**影响范围**：

| 命令 | 行为 |
|---|---|
| `export:api` | 不带 `--target` 时导出全部；带 `--target web` 时仅导出 `@soraTargets` 包含 `web` 的声明（以及没有 `@soraTargets` 的声明） |
| `export:doc` | 同上 |

### 示例

```typescript
/**
 * @soraExport route
 * @soraTargets web
 */
class WebHandler extends Route { ... }

/**
 * @soraExport route
 * @soraTargets admin
 */
class AdminHandler extends Route { ... }

/**
 * @soraExport route
 */
class CommonHandler extends Route { ... }
```

运行 `sora export:api --target web`：

```typescript
// api.web.ts
export interface WebHandler { ... }
export interface CommonHandler { ... }
// AdminHandler 被过滤
```

运行 `sora export:api`（不带 target）：

```typescript
// api.ts
export interface WebHandler { ... }
export interface AdminHandler { ... }
export interface CommonHandler { ... }
// 全部导出
```

---

## `@soraPrefix`

**位置**：类（仅 `@soraExport route` 的类）

**作用**：为路由类中的所有方法指定 URL 路径前缀。支持逗号分隔的多个前缀，每个前缀会为每个方法生成独立的路径。

**值**：路径字符串，逗号分隔多个。

**默认值**：`/`

**影响范围**：

| 命令 | 行为 |
|---|---|
| `export:api` | 不影响 |
| `export:doc` | 决定 OpenAPI path 的前缀部分 |

### 示例

```typescript
/**
 * @soraExport route
 * @soraPrefix /api/v1/auth
 */
class AuthHandler extends Route {
  @Route.method
  async login() { ... }

  @Route.method
  async register() { ... }
}
```

`export:doc` 生成：

```yaml
paths:
  /api/v1/auth/login:
    post: ...
  /api/v1/auth/register:
    post: ...
```

### 多前缀示例

```typescript
/**
 * @soraExport route
 * @soraPrefix /api/v1/user,/api/v2/user
 */
class UserHandler extends Route {
  @Route.method
  async getProfile() { ... }
}
```

`export:doc` 为每个前缀生成独立路径：

```yaml
paths:
  /api/v1/user/getProfile:
    post: ...
  /api/v2/user/getProfile:
    post: ...
```

---

## `@soraIgnore`

**位置**：方法、属性

**作用**：从导出中排除该成员。可以指定 target 参数控制仅在某些 target 下忽略。

**值**：可选。逗号分隔的 target 名称。无参数时在所有 target 下忽略。

**影响范围**：

| 命令 | 行为 |
|---|---|
| `export:api` | 被忽略的方法/属性不会出现在生成的接口中 |
| `export:doc` | 被忽略的方法不会出现在 OpenAPI 文档中 |

### 示例：全部忽略

```typescript
/**
 * @soraExport route
 */
class AuthHandler extends Route {
  @Route.method
  async login() { ... }

  /**
   * @soraIgnore
   */
  @Route.method
  async internalDebug() { ... }
}
```

`export:api` 生成：

```typescript
export interface AuthHandler {
  login(): Promise<void>;
  // internalDebug 不出现
}
```

`export:doc` 生成：

```yaml
paths:
  /login:
    post: ...
  # /internalDebug 不出现
```

### 示例：指定 target 忽略

```typescript
/**
 * @soraExport route
 * @soraTargets web,admin
 */
class UserHandler extends Route {
  @Route.method
  async getProfile() { ... }

  /**
   * @soraIgnore admin
   */
  @Route.method
  async deleteUser() { ... }
}
```

运行 `sora export:api --target web`：

```typescript
export interface UserHandler {
  getProfile(): Promise<void>;
  deleteUser(): Promise<void>;  // web target 下保留
}
```

运行 `sora export:api --target admin`：

```typescript
export interface UserHandler {
  getProfile(): Promise<void>;
  // deleteUser 在 admin target 下被忽略
}
```

---

## `@method`

**位置**：方法

**作用**：指定 HTTP 方法，用于 OpenAPI 文档生成。

**值**：`GET`、`POST`、`PUT`、`DELETE`、`PATCH`、`HEAD`、`OPTIONS`

**默认值**：`POST`

**影响范围**：

| 命令 | 行为 |
|---|---|
| `export:api` | 不影响（API 类型声明不区分 HTTP 方法），`@method` 标签保留在输出中 |
| `export:doc` | 决定 OpenAPI path item 的 HTTP verb |

### 示例

```typescript
/**
 * @soraExport route
 */
class UserHandler extends Route {
  /**
   * 获取用户信息
   * @method GET
   */
  @Route.method
  async getUser() { ... }

  /** 创建用户 */
  @Route.method
  async createUser() { ... }
}
```

`export:doc` 生成：

```yaml
paths:
  /getUser:
    get:                    # @method GET 生效
      summary: 获取用户信息
      ...
  /createUser:
    post:                   # 无 @method，默认 POST
      summary: 创建用户
      ...
```

---

## `@description`

**位置**：方法

**作用**：为方法添加详细描述，映射到 OpenAPI 的 `description` 字段。与 JSDoc 摘要（第一行注释）不同，`@description` 用于更长的说明文字。

**值**：自由文本

**影响范围**：

| 命令 | 行为 |
|---|---|
| `export:api` | 不影响 |
| `export:doc` | 映射到 OpenAPI operation 的 `description` 字段 |

**注意**：JSDoc 注释的第一行文本映射到 `summary`，`@description` 映射到 `description`，两者是独立的。

### 示例

```typescript
/**
 * @soraExport route
 */
class AuthHandler extends Route {
  /**
   * 用户登录                          ← 这行变成 summary
   * @description 使用用户名和密码进行身份验证，返回 JWT token。
   *              支持邮箱和手机号登录。   ← @description 变成 description
   */
  @Route.method
  async login() { ... }
}
```

`export:doc` 生成：

```yaml
paths:
  /login:
    post:
      summary: 用户登录
      description: 使用用户名和密码进行身份验证，返回 JWT token。支持邮箱和手机号登录。
```

---

## `@Route.method` 与 `@Route.notify`

这两个是框架装饰器（不是 JSDoc 注解），但它们直接影响 `export:api` 和 `export:doc` 的行为。

### `@Route.method`

标记方法为请求-响应处理器。

**对 `export:api`**：被标记的方法会被转为接口方法签名（保留第一个参数 + 返回类型）。

**对 `export:doc`**：被标记的方法会生成 OpenAPI PathItem。

### `@Route.notify`

标记方法为单向通知处理器。

**对 `export:api`**：被标记的方法**也会**被转为接口方法签名（与 `@Route.method` 行为一致）。

**对 `export:doc`**：被标记的方法**不会**出现在文档中。

### 示例

```typescript
/**
 * @soraExport route
 */
class NotificationHandler extends Route {
  @Route.method
  async getData() { ... }

  @Route.notify
  async onDataChanged() { ... }
}
```

`export:api` 生成（两个方法都保留）：

```typescript
export interface NotificationHandler {
  getData(): Promise<void>;
  onDataChanged(): Promise<void>;
}
```

`export:doc` 生成（仅 `@Route.method`）：

```yaml
paths:
  /getData:
    post: ...
  # onDataChanged 不出现
```

---

## 输出清理

`export:api` 生成的 `.ts` 文件中，所有以 `@sora` 开头的 JSDoc 标签会被自动移除：

- `@soraExport`
- `@soraTargets`
- `@soraIgnore`
- `@soraPrefix`

非 sora 前缀的标签（如 `@method`、`@description`、`@param`、`@returns` 等）会保留在输出的 JSDoc 注释中。

---

## 完整示例

以下是一个综合使用所有注解的 Handler：

```typescript
/**
 * @soraExport route
 * @soraTargets web,admin
 * @soraPrefix /api/v1/auth
 */
class AuthHandler extends Route {
  /**
   * 用户登录
   * @description 使用用户名和密码进行身份验证
   * @method POST
   */
  @Route.method
  async login(@guard body: IReqLogin): Promise<IRespLogin> { ... }

  /**
   * 注册账号
   * @description 创建新用户账号
   */
  @Route.method
  async register(@guard body: IReqRegister): Promise<IRespRegister> { ... }

  /**
   * 验证 token
   * @soraIgnore web
   */
  @Route.method
  async verifyToken(@guard body: IReqVerify): Promise<IRespVerify> { ... }

  /**
   * @soraIgnore
   */
  @Route.method
  async internalDebug() { ... }

  @Route.notify
  async onUserLogin() { ... }
}
```

运行 `sora export:api --target web`：

```typescript
export interface AuthHandler {
  /** 用户登录 */
  login(body: IReqLogin): Promise<IRespLogin>;
  /** 注册账号 */
  register(body: IReqRegister): Promise<IRespRegister>;
  // verifyToken: 在 web target 下被 @soraIgnore 忽略
  // internalDebug: 无参 @soraIgnore，全部 target 下忽略
  // onUserLogin: @Route.notify 也被保留在 API 类型中
  onUserLogin(): Promise<void>;
}
```

运行 `sora export:api --target admin`：

```typescript
export interface AuthHandler {
  /** 用户登录 */
  login(body: IReqLogin): Promise<IRespLogin>;
  /** 注册账号 */
  register(body: IReqRegister): Promise<IRespRegister>;
  /** 验证 token */
  verifyToken(body: IReqVerify): Promise<IRespVerify>;
  // internalDebug: 仍然被忽略
  onUserLogin(): Promise<void>;
}
```

运行 `sora export:doc --target web`：

```yaml
paths:
  /api/v1/auth/login:
    post:
      summary: 用户登录
      description: 使用用户名和密码进行身份验证
      tags: [AuthHandler]
      requestBody: ...
      responses: ...
  /api/v1/auth/register:
    post:
      summary: 注册账号
      description: 创建新用户账号
      tags: [AuthHandler]
      requestBody: ...
      responses: ...
  # verifyToken: 在 web 下被忽略
  # internalDebug: 无参忽略
  # onUserLogin: @Route.notify 不生成文档
```
