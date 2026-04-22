### 需求:检测未知 @sora* 标签
系统必须检测所有以 `@sora` 开头但不属于已知标签列表的 JSDoc 标签，并发出 Warning。

#### 场景:检测 @soraTypo 未知标签
- **当** 源代码中类声明上存在 `@soraTypo` 标签
- **那么** 系统发出 Warning `"Unknown annotation '@soraTypo' on 'ClassName' in src/file.ts:42. Known annotations: @soraExport, @soraTargets, @soraIgnore, @soraPrefix"`

#### 场景:已知标签不报 Warning
- **当** 源代码中使用 `@soraExport`、`@soraTargets`、`@soraIgnore`、`@soraPrefix` 中的任何一个
- **那么** 系统不发出未知标签 Warning

### 需求:验证 @soraExport 值
系统必须验证 `@soraExport` 的值。有效值为空、`route`、`entity`。其他值必须报错。

#### 场景:@soraExport 值拼写错误
- **当** 源代码中存在 `@soraExport rout`
- **那么** 系统报错 `"Invalid @soraExport value 'rout' on 'ClassName' in src/file.ts:42. Valid values: 'route', 'entity', or leave empty for simple export."` 并停止执行

#### 场景:@soraExport 值为空（简单导出）
- **当** 源代码中存在 `@soraExport`（无值）
- **那么** 系统正常处理为简单导出，不报错

#### 场景:@soraExport 值为 route
- **当** 源代码中存在 `@soraExport route`
- **那么** 系统正常处理为路由导出

#### 场景:@soraExport 值为 entity
- **当** 源代码中存在 `@soraExport entity`
- **那么** 系统正常处理为实体导出

### 需求:检测匿名类上的 @soraExport
系统必须检测 `@soraExport` 出现在匿名类声明上的情况并报错。

#### 场景:匿名类使用 @soraExport
- **当** 源代码中存在 `export default class { ... }` 带有 `@soraExport` 注解
- **那么** 系统报错 `"@soraExport cannot be used on anonymous class in src/file.ts:42. Please give the class a name."` 并停止执行

### 需求:检测多个 @soraExport
系统必须检测同一声明上出现多个 `@soraExport` 的情况并报错，包含文件路径和行号。

#### 场景:同一类上多个 @soraExport
- **当** 源代码中类 `UserService` 上同时有 `@soraExport route` 和 `@soraExport entity`
- **那么** 系统报错 `"Multiple @soraExport annotations on 'UserService' in src/services/UserService.ts:15. Only one @soraExport is allowed per declaration."` 并停止执行

### 需求:警告空值 @soraTargets
系统必须在 `@soraTargets` 注解存在但值为空时发出 Warning。

#### 场景:@soraTargets 无值
- **当** 源代码中方法上存在 `@soraTargets` 但无值
- **那么** 系统发出 Warning `"@soraTargets on 'MethodName' in src/file.ts:42 has no value. The declaration will be included in all targets. Did you mean to specify target names like @soraTargets web,admin?"`

### 需求:警告空值 @soraIgnore
系统必须在 `@soraIgnore` 注解存在但值为空时发出 Warning。

#### 场景:@soraIgnore 无值
- **当** 源代码中属性上存在 `@soraIgnore` 但无值
- **那么** 系统发出 Warning `"@soraIgnore on 'propertyName' in src/file.ts:42 has no target specified. The member will be excluded from all targets."`

### 需求:检测跨文件重名声明
系统必须检测不同文件中 `@soraExport` 标记的同名类声明并发出 Warning。

#### 场景:两个文件有同名 @soraExport 类
- **当** `src/v1/UserService.ts` 和 `src/v2/UserService.ts` 中都有 `@soraExport route` 的 `UserService` 类
- **那么** 系统发出 Warning `"Duplicate export name 'UserService' found in both src/v1/UserService.ts and src/v2/UserService.ts. Only the first occurrence will be exported."`
