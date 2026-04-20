## ADDED Requirements

### 需求:@soraPrefix 注解读取
AnnotationReader 必须支持从类级别 JSDoc 中读取 `@soraPrefix` tag，返回其注释文本按逗号分隔后的路径数组（去除首尾空格）。

#### 场景:读取单个前缀
- **当** 类的 JSDoc 包含 `@soraPrefix /api/auth`
- **那么** `readPrefix()` 返回 `["/api/auth"]`

#### 场景:读取多个前缀
- **当** 类的 JSDoc 包含 `@soraPrefix /api/v1/auth, /api/v2/auth`
- **那么** `readPrefix()` 返回 `["/api/v1/auth", "/api/v2/auth"]`

#### 场景:无前缀注解
- **当** 类的 JSDoc 不包含 `@soraPrefix`
- **那么** `readPrefix()` 返回 `null`

### 需求:@method 注解读取
AnnotationReader 必须支持从方法级别 JSDoc 中读取 `@method` tag，返回其注释文本（去除首尾空格）。

#### 场景:读取 HTTP 方法
- **当** 方法的 JSDoc 包含 `@method GET`
- **那么** `readHttpMethod()` 返回 `"GET"`

#### 场景:无方法注解
- **当** 方法的 JSDoc 不包含 `@method`
- **那么** `readHttpMethod()` 返回 `null`

## MODIFIED Requirements

### 需求:sora 标签白名单扩展
jsdoc-utils.ts 中的 `SORA_TAGS` 集合必须新增 `soraPrefix` 和 `method`，确保这些标签在 `export:api` 输出时被正确剥离。

#### 场景:新标签被剥离
- **当** JSDoc 包含 `@soraPrefix /api/auth` 和 `@method GET`
- **那么** 在 `export:api` 生成的 .ts 文件中这些 tag 不出现
