## ADDED Requirements

### 需求:route class 转为 interface 保留 route 方法
标注了 `@soraExport route` 的 class 必须输出为 interface，仅保留带有 route 装饰器的方法签名，删除所有其他方法和构造函数。

#### 场景:route class 输出为 interface
- **当** 一个 class 标注了 `@soraExport route` 且包含 route 方法和普通方法
- **那么** 输出为 `export interface ClassName { ... }`，仅包含 route 方法签名

#### 场景:route 方法保留为 MethodSignature
- **当** route class 有方法 `getUser()` 带有 `@Route.method()` 装饰器
- **那么** 输出的 interface 中包含 `getUser(request: RequestType): Promise<ResponseType>` 方法签名

#### 场景:非 route 方法被删除
- **当** route class 有普通方法 `helper()` 不带 route 装饰器
- **那么** 输出的 interface 中不包含该方法

#### 场景:构造函数被删除
- **当** route class 有 `constructor()`
- **那么** 输出的 interface 中不包含构造函数

### 需求:entity class 转为 interface 只保留属性
标注了 `@soraExport entity` 的 class 必须输出为 interface，只保留 public 非 static 属性，删除所有方法和构造函数。

#### 场景:entity class 输出为 interface
- **当** 一个 class 标注了 `@soraExport entity` 且包含属性和方法
- **那么** 输出为 `export interface ClassName { ... }`，仅包含属性签名

#### 场景:属性转为 PropertySignature
- **当** entity class 有属性 `name: string`
- **那么** 输出的 interface 中包含 `name: string` 属性签名

#### 场景:private/protected/static 属性被删除
- **当** entity class 有 `private internalData: any` 或 `static count: number`
- **那么** 输出的 interface 中不包含这些属性

### 需求:simple class 转为 interface 只保留属性
标注了 `@soraExport`（无 type 参数）的 class 必须输出为 interface，只保留 public 非 static 属性，删除所有方法和构造函数。

#### 场景:simple class 输出为 interface
- **当** 一个 class 标注了 `@soraExport`（无 type 参数）且包含属性和方法
- **那么** 输出为 `export interface ClassName { ... }`，仅包含属性签名

#### 场景:simple class 的方法被删除
- **当** simple class 有方法 `doSomething()`
- **那么** 输出的 interface 中不包含该方法

### 需求:依赖收集的 class 转为 interface
因参数/返回值类型引用被 TypeResolver 收集到的 class 声明必须输出为 interface，只保留 public 非 static 属性，删除所有方法和构造函数。

#### 场景:依赖 class 输出为 interface
- **当** TypeResolver 因类型引用收集到一个未标注 `@soraExport` 的 class
- **那么** 该 class 输出为 `export interface ClassName { ... }`，仅包含 public 非 static 属性

### 需求:heritage clause 处理
class 转为 interface 时，`extends` 子句保留，`implements` 子句丢弃。

#### 场景:extends 保留
- **当** class 声明为 `class Foo extends Bar`
- **那么** 输出为 `export interface Foo extends Bar`

#### 场景:implements 丢弃
- **当** class 声明为 `class Foo extends Bar implements Baz, Qux`
- **那么** 输出为 `export interface Foo extends Bar`（无 implements 部分）

#### 场景:仅有 implements
- **当** class 声明为 `class Foo implements Baz`
- **那么** 输出为 `export interface Foo`（无 extends）

### 需求:declare modifier 移除
class 转为 interface 后，禁止包含 `declare` modifier。

#### 场景:无 declare modifier
- **当** 一个 class 被转为 interface
- **那么** 输出为 `export interface` 而非 `export declare interface`

### 需求:typeParameters 保留
class 转为 interface 时，泛型参数必须保留。

#### 场景:泛型 class 转为 interface
- **当** class 声明为 `class Foo<T, U>`
- **那么** 输出为 `export interface Foo<T, U>`

### 需求:enum/interface/type alias 输出结构不变
enum、interface、type alias 的输出结构不变（仍为原始类型），仅添加 JSDoc。

#### 场景:enum 保持 enum
- **当** 一个 enum 标注了 `@soraExport`
- **那么** 输出仍为 `export enum`

#### 场景:interface 保持 interface
- **当** 一个 interface 标注了 `@soraExport`
- **那么** 输出仍为 `export interface`

#### 场景:type alias 保持 type
- **当** 一个 type alias 标注了 `@soraExport`
- **那么** 输出仍为 `export type`
