## 新增需求

### 需求:Unplugin 导出必须支持 vite 和 esbuild
包必须通过 `./unplugin` export 路径提供 unplugin 实例，支持 vite（通过 `./unplugin/vite`）和 esbuild（通过 `./unplugin/esbuild`）两种 bundler。

#### 场景:vite 配置中使用
- **当** 用户在 `vite.config.ts` 中 `import UnpluginGuard from '@sora-soft/typia-decorator/unplugin/vite'` 并添加到 `plugins` 数组
- **那么** vite 构建管道中必须对包含 `@guard` 装饰器的 TypeScript 文件执行 AST transform

#### 场景:esbuild 配置中使用
- **当** 用户在 esbuild 配置中 `import UnpluginGuard from '@sora-soft/typia-decorator/unplugin/esbuild'` 并添加到 `plugins` 数组
- **那么** esbuild 构建管道中必须对包含 `@guard` 装饰器的 TypeScript 文件执行 AST transform

### 需求:Transform 必须复用现有 processSourceFile 逻辑
unplugin 的 transform 必须调用 `src/transform/visitor.ts` 中现有的 `processSourceFile` 函数，不得重新实现 `@guard` 装饰器的解析和代码注入逻辑。输出结果必须与 tspc 编译结果一致。

#### 场景:@guard 方法被正确变换
- **当** 源文件包含带 `@guard` 参数装饰器的方法，且该方法参数有类型注解
- **那么** transform 后的方法体开头必须包含 typia `assert()` 调用，`@guard` 装饰器必须被移除，必要的 import 语句必须被注入

#### 场景:无 @guard 的文件被跳过
- **当** 源文件不包含 `@guard` 字符串或不包含 `typia-decorator` 字符串
- **那么** transform 必须立即返回 null，不创建 `ts.Program`

### 需求:必须通过临时 ts.Program 获取 TypeChecker
unplugin 必须在 transform hook 中创建临时 `ts.Program`（使用自定义 `CompilerHost`），当前文件从内存中的 `ts.SourceFile` 加载，其他文件从磁盘读取。必须通过 `program.getTypeChecker()` 获取类型信息以驱动 transform。

#### 场景:类型信息被正确解析
- **当** `@guard` 参数的类型是跨文件引用的 interface（如从 `../interface/index.js` 导入）
- **那么** transform 必须正确解析该类型并生成对应的 assert 代码

### 需求:必须实现磁盘缓存
unplugin 必须实现基于文件路径 + 源码内容的 hash 缓存。缓存必须存储在 `node_modules/.cache/unplugin_typia_decorator/` 目录下。当缓存命中时禁止创建 `ts.Program`。

#### 场景:首次构建无缓存
- **当** 缓存目录不存在或对应文件的缓存条目不存在
- **那么** 必须执行完整的 transform 并将结果写入缓存

#### 场景:缓存命中
- **当** 同一文件路径且源码内容未变更
- **那么** 必须直接从缓存读取 transform 结果，跳过 `ts.Program` 创建

#### 场景:缓存失效
- **当** 文件内容发生变更
- **那么** 旧缓存必须被替换为新 transform 结果

### 需求:必须生成 SourceMap
transform 输出必须包含 sourcemap，使得调试时能正确映射回原始 TypeScript 源码。

#### 场景:sourcemap 正确性
- **当** vite dev server 加载一个经过 transform 的文件
- **那么** 浏览器 devtools 中必须显示原始 TypeScript 源码位置，而非 transform 后的代码位置

### 需求:新增依赖必须声明为 peerDependencies
所有新增的外部依赖（unplugin, magic-string, diff-match-patch-es, @rollup/pluginutils, pathe, pkg-types, consola, find-cache-dir）必须声明在 `peerDependencies` 中，禁止放在 `dependencies` 中。

#### 场景:安装时 peer 依赖警告
- **当** 用户安装 `@sora-soft/typia-decorator` 但未安装 `unplugin`
- **那么** 包管理器必须发出 peer dependency 缺失警告

### 需求:现有 transform 导出必须保持不变
`./transform` 和 `./runtime` 导出路径的行为和接口禁止有任何变更。

#### 场景:tspc 编译继续工作
- **当** 下游包通过 tspc 使用 `@sora-soft/typia-decorator/transform` 作为 compiler plugin
- **那么** 行为必须与添加 unplugin 之前完全一致

## 修改需求

## 移除需求
