## ADDED Requirements

### 需求:顶层声明的 JSDoc 保留
所有导出类型（route class / entity class / simple class / enum / interface / type alias / 依赖收集的类型）的顶层 JSDoc 注释必须被完整保留到输出文件中。

#### 场景:class 带有 JSDoc 注释
- **当** 一个 class 声明带有 JSDoc 注释 `/** 用户实体类 */` 且标注了 `@soraExport`
- **那么** 输出的 interface 声明前必须包含 `/** 用户实体类 */`

#### 场景:enum 带有 JSDoc 注释
- **当** 一个 enum 声明带有 JSDoc 注释 `/** 状态枚举 */` 且标注了 `@soraExport`
- **那么** 输出的 enum 声明前必须包含 `/** 状态枚举 */`

#### 场景:interface 带有 JSDoc 注释
- **当** 一个 interface 声明带有 JSDoc 注释 `/** 配置接口 */` 且标注了 `@soraExport`
- **那么** 输出的 interface 声明前必须包含 `/** 配置接口 */`

#### 场景:type alias 带有 JSDoc 注释
- **当** 一个 type alias 声明带有 JSDoc 注释 `/** 用户 ID 类型 */` 且标注了 `@soraExport`
- **那么** 输出的 type alias 声明前必须包含 `/** 用户 ID 类型 */`

#### 场景:依赖收集的类型带有 JSDoc
- **当** TypeResolver 因参数/返回值类型引用收集到一个未标注 `@soraExport` 的 interface/class/enum/type
- **那么** 输出的类型声明前必须保留其原始 JSDoc 注释

### 需求:成员级 JSDoc 保留
导出类型的每个成员（属性、方法）上的 JSDoc 注释必须被完整保留到输出文件中。

#### 场景:属性上的 JSDoc
- **当** 一个 entity class 的属性 `name` 带有 JSDoc `/** 用户名 */`
- **那么** 输出的 interface 中对应属性签名前必须包含 `/** 用户名 */`

#### 场景:方法上的 JSDoc
- **当** 一个 route class 的 route 方法带有 JSDoc `/** 获取用户信息 */`
- **那么** 输出的 interface 中对应方法签名前必须包含 `/** 获取用户信息 */`

#### 场景:enum 成员的 JSDoc
- **当** 一个 enum 的成员 `Active` 带有 JSDoc `/** 活跃状态 */`
- **那么** 输出的 enum 中对应成员前必须包含 `/** 活跃状态 */`

### 需求:过滤 sora 专属 tag
输出的 JSDoc 注释中必须删除 `@soraExport`、`@soraTargets`、`@soraIgnore` 三个 tag，其余所有内容必须保留。

#### 场景:仅包含 sora tag 的行被删除
- **当** 原始 JSDoc 为 `/** @soraExport entity */`
- **那么** 输出的 JSDoc 为空（该注释不输出）

#### 场景:sora tag 与其他内容混合
- **当** 原始 JSDoc 为 `/** 用户实体\n * @soraExport entity\n * @description 用户信息 */`
- **那么** 输出为 `/** 用户实体\n * @description 用户信息 */`

#### 场景:sora tag 带参数值
- **当** 原始 JSDoc 包含 `@soraTargets web,admin`
- **那么** 该行被完整删除

#### 场景:非 sora tag 保留
- **当** 原始 JSDoc 包含 `@param`、`@returns`、`@deprecated` 等标准 tag
- **那么** 这些 tag 必须被完整保留

### 需求:无 JSDoc 时不添加空注释
如果原始声明或成员没有 JSDoc 注释，输出中禁止添加空注释。

#### 场景:声明无 JSDoc
- **当** 一个标注了 `@soraExport` 的 class 没有任何 JSDoc 注释
- **那么** 输出的 interface 前不添加任何注释
