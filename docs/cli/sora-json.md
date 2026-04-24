# sora.json 配置

`sora.json` 是 sora CLI 的项目配置文件，定义了代码生成、API 导出等命令所需的路径和引用信息。

## 文件位置

放在项目根目录下。

## 完整配置示例

```json
{
  "root": "src",
  "dist": "dist",
  "serviceDir": "app/service",
  "serviceNameEnum": "app/service/common/ServiceName#ServiceName",
  "serviceRegister": "app/service/common/ServiceRegister#ServiceRegister.init",
  "handlerDir": "app/handler",
  "workerDir": "app/worker",
  "workerNameEnum": "app/worker/common/WorkerName#WorkerName",
  "workerRegister": "app/worker/common/WorkerRegister#WorkerRegister.init",
  "componentNameEnum": "lib/Com#ComponentName",
  "comClass": "lib/Com#Com",
  "apiDeclarationOutput": "../dist-api/api",
  "docOutput": "../dist-api/doc",
  "configTemplates": [
    { "type": "server", "path": "run/config.template.yml" }
  ]
}
```

## 字段说明

### 基础路径

| 字段 | 类型 | 说明 |
|------|------|------|
| `root` | `string` | 源码根目录（相对于项目根目录） |
| `dist` | `string` | 编译输出目录（相对于项目根目录） |

### Service 相关

| 字段 | 类型 | 说明 |
|------|------|------|
| `serviceDir` | `string` | Service 文件目录（相对于 root） |
| `serviceNameEnum` | `string` | Service 名称枚举的引用路径 |
| `serviceRegister` | `string` | Service 注册函数的引用路径 |
| `handlerDir` | `string` | Handler 文件目录（相对于 root） |

### Worker 相关

| 字段 | 类型 | 说明 |
|------|------|------|
| `workerDir` | `string` | Worker 文件目录（相对于 root） |
| `workerNameEnum` | `string` | Worker 名称枚举的引用路径 |
| `workerRegister` | `string` | Worker 注册函数的引用路径 |

### Component 相关

| 字段 | 类型 | 说明 |
|------|------|------|
| `componentNameEnum` | `string` | Component 名称枚举的引用路径 |
| `comClass` | `string` | Com 类的引用路径 |

### 导出相关

| 字段 | 类型 | 说明 |
|------|------|------|
| `apiDeclarationOutput` | `string` | API 声明文件输出目录（相对于 root） |
| `docOutput` | `string` | OpenAPI 文档输出目录（相对于 root） |

### 配置模板

| 字段 | 类型 | 说明 |
|------|------|------|
| `configTemplates` | `array` | 配置模板列表 |

`configTemplates` 数组中每个元素：

| 字段 | 类型 | 说明 |
|------|------|------|
| `type` | `string` | 模板类型标识 |
| `path` | `string` | 模板文件路径（相对于 root） |

## 引用格式

多个字段使用 `路径#导出名` 的格式引用代码中的标识符：

```
app/service/common/ServiceName#ServiceName
│                                │
│  相对于 root 的文件路径          │  导出的标识符名称
│  (不含 .ts 扩展名)              │
```

例如 `serviceNameEnum` 的值 `app/service/common/ServiceName#ServiceName` 表示：

- 文件：`{root}/app/service/common/ServiceName.ts`
- 导出：`ServiceName` 枚举

## 各命令依赖的字段

| 命令 | 依赖字段 |
|------|----------|
| `generate service` | `root`, `serviceDir`, `handlerDir`, `serviceNameEnum`, `serviceRegister` |
| `generate worker` | `root`, `workerDir`, `workerNameEnum`, `workerRegister` |
| `generate command` | `root`, `workerDir` |
| `add component` | `componentNameEnum`, `comClass` |
| `export api` | `root`, `apiDeclarationOutput` |
| `export doc` | `root`, `docOutput` |
| `config` | `root`, `configTemplates` |
