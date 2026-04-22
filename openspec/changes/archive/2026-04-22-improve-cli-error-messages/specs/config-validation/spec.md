## ADDED Requirements

### 需求:按命令验证必需配置字段
系统必须在每个命令执行前验证该命令声明的必需配置字段。每个命令必须通过 `requiredConfigFields()` 声明自己需要的字段列表和格式要求。验证必须在 `loadConfig()` 中执行。

#### 场景:export:api 缺少 apiDeclarationOutput
- **当** 用户执行 `sora export:api` 且 sora.json 中缺少 `apiDeclarationOutput` 字段
- **那么** 系统立即报错 `"Missing required field 'apiDeclarationOutput' in sora.json. This field is required by the 'export:api' command."` 并停止执行

#### 场景:generate:service 的 serviceNameEnum 缺少 # 分隔符
- **当** 用户执行 `sora generate:service` 且 sora.json 中 `serviceNameEnum` 值为 `"src/enums/ServiceName"`（缺少 `#`）
- **那么** 系统报错 `"Invalid format for field 'serviceNameEnum' in sora.json: value must contain '#' separator (expected format: 'path/to/file#EnumName'). Got: 'src/enums/ServiceName'"` 并停止执行

#### 场景:generate:service 的 serviceRegister 缺少 . 分隔符
- **当** sora.json 中 `serviceRegister` 值为 `"src/register#ServiceRegister"`（`#` 后缺少 `.`）
- **那么** 系统报错 `"Invalid format for field 'serviceRegister' in sora.json: part after '#' must contain '.' separator (expected format: 'path/to/file#ClassName.methodName'). Got: 'ServiceRegister'"` 并停止执行

### 需求:验证配置文件存在和可解析
系统必须在加载配置文件时验证文件存在且可解析，报告清晰的错误信息。

#### 场景:sora.json 不存在
- **当** 用户在项目根目录执行命令但 sora.json 不存在
- **那么** 系统报错 `"Configuration file 'sora.json' not found in the current directory. Run this command from the project root, or create a sora.json configuration file."` 并停止执行

#### 场景:sora.json JSON 语法错误
- **当** sora.json 包含 JSON 语法错误
- **那么** 系统报错 `"Failed to parse 'sora.json': <原始错误信息>. Please check for JSON syntax errors."` 并停止执行

#### 场景:tsconfig.json 不存在
- **当** tsconfig.json 不存在
- **那么** 系统报错 `"TypeScript configuration file 'tsconfig.json' not found in the current directory."` 并停止执行

#### 场景:tsconfig.json 包含无效编译选项
- **当** tsconfig.json 的 compilerOptions 无效
- **那么** 系统报错包含具体编译错误详情的错误信息并停止执行

### 需求:验证引用文件存在
系统必须验证配置字段引用的文件实际存在。

#### 场景:serviceNameEnum 引用的文件不存在
- **当** `serviceNameEnum` 配置为 `"src/enums/ServiceName#ServiceNameEnum"` 但 `src/enums/ServiceName.ts` 文件不存在
- **那么** 系统报错 `"File referenced by 'serviceNameEnum' not found: 'src/enums/ServiceName.ts'. Check the path in your sora.json."` 并停止执行

### 需求:各命令声明自己的必需字段
每个需要配置的命令必须声明自己必需的字段和格式。

#### 场景:export:api 必需字段
- **当** 查看 export:api 命令的必需字段声明
- **那么** 包含 `root`（string）和 `apiDeclarationOutput`（string）

#### 场景:export:doc 必需字段
- **当** 查看 export:doc 命令的必需字段声明
- **那么** 包含 `root`（string）和 `docOutput`（string）

#### 场景:generate:service 必需字段
- **当** 查看 generate:service 命令的必需字段声明
- **那么** 包含 `root`、`serviceDir`、`handlerDir`（string），以及 `serviceNameEnum`（path#name 格式）和 `serviceRegister`（path#class.method 格式）

#### 场景:generate:worker 必需字段
- **当** 查看 generate:worker 命令的必需字段声明
- **那么** 包含 `root`、`workerDir`（string），以及 `workerNameEnum`（path#name 格式）和 `workerRegister`（path#class.method 格式）

#### 场景:generate:command 必需字段
- **当** 查看 generate:command 命令的必需字段声明
- **那么** 包含 `root`、`workerDir`（string），以及 `workerNameEnum`（path#name 格式）和 `workerRegister`（path#class.method 格式）
