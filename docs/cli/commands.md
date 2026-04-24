# 命令手册

`sora` CLI 提供项目脚手架、代码生成、API 导出等功能。

## 安装

```bash
npm install -g @sora-soft/cli
```

## sora new

创建新的 sora 项目。

```bash
sora new <name> [template] [options]
```

**参数：**

| 参数 | 必填 | 说明 |
|------|------|------|
| `name` | 是 | 项目名称 |
| `template` | 否 | 模板 npm 包名（不提供则交互选择） |

**选项：**

| 选项 | 说明 |
|------|------|
| `--registry <url>` | npm registry 地址 |
| `--token <token>` | npm 认证 token |

**可用模板：**

| 模板包 | 说明 |
|--------|------|
| `@sora-soft/http-server-template` | 单进程 HTTP 服务 |
| `@sora-soft/base-cluster-template` | 集群模板（网关 + 业务服务） |
| `@sora-soft/account-cluster-template` | 完整账户系统集群 |

**示例：**

```bash
# 交互式选择模板
sora new my-project

# 指定模板
sora new my-project @sora-soft/http-server-template

# 使用私有 registry
sora new my-project --registry https://npm.my-company.com
```

## sora generate service

生成 Service 脚手架代码。

```bash
sora generate:service <name> [options]
```

**参数：**

| 参数 | 必填 | 说明 |
|------|------|------|
| `name` | 是 | 服务名称（PascalCase） |

**选项：**

| 选项 | 说明 |
|------|------|
| `--listeners <types>` | 监听器类型：tcp,websocket,http,none（逗号分隔） |
| `--standalone` | 是否为独立模式 |
| `--config-template` | 是否生成配置模板 |

**生成的文件：**

- Service 类文件（`{serviceDir}/{Name}Service.ts`）
- Handler 文件（`{handlerDir}/{Name}Handler.ts`，仅当指定了 listeners 时）
- 在 ServiceName 枚举中插入值
- 在 ServiceRegister 中注册工厂函数
- 在配置模板中插入条目（可选）

**依赖的 `sora.json` 字段：** `root`, `serviceDir`, `handlerDir`, `serviceNameEnum`, `serviceRegister`

**示例：**

```bash
sora generate:service Order --listeners http,tcp
```

## sora generate worker

生成 Worker 脚手架代码。

```bash
sora generate:worker <name> [options]
```

**参数：**

| 参数 | 必填 | 说明 |
|------|------|------|
| `name` | 是 | Worker 名称（PascalCase） |

**选项：**

| 选项 | 说明 |
|------|------|
| `--standalone` | 是否为独立模式 |
| `--config-template` | 是否生成配置模板 |

**生成的文件：**

- Worker 类文件（`{workerDir}/{Name}Worker.ts`）
- 在 WorkerName 枚举中插入值
- 在 WorkerRegister 中注册工厂函数
- 在配置模板中插入条目（可选）

**依赖的 `sora.json` 字段：** `root`, `workerDir`, `workerNameEnum`, `workerRegister`

**示例：**

```bash
sora generate:worker Sync
```

## sora generate command

生成 Command Worker 脚手架代码（用于一次性命令执行）。

```bash
sora generate:command <name> [options]
```

**参数：**

| 参数 | 必填 | 说明 |
|------|------|------|
| `name` | 是 | 命令名称（PascalCase） |

**选项：**

| 选项 | 说明 |
|------|------|
| `--config-template` | 是否生成配置模板 |

**生成的文件：**

- Command Worker 类文件（`{workerDir}/{Name}CommandWorker.ts`）

**示例：**

```bash
sora generate:command Migrate
```

## sora add component

安装组件包并自动注册。

```bash
sora add:component <package>
```

**参数：**

| 参数 | 必填 | 说明 |
|------|------|------|
| `package` | 是 | 组件 npm 包名 |

命令会：
1. 安装指定的 npm 包
2. 读取包中的 `sora-component.json` 清单文件
3. 执行清单中的 `installScript`（自动注册组件到项目）
4. 检查是否已安装（防止重复）

**示例：**

```bash
sora add:component @sora-soft/redis-component
```

## sora export api

从 Route 处理器导出 TypeScript API 声明。

```bash
sora export:api [options]
```

**选项：**

| 选项 | 说明 |
|------|------|
| `--target <names>` | 导出目标（可指定多个，如 web,admin） |

**依赖的 `sora.json` 字段：** `root`, `apiDeclarationOutput`

命令会扫描源码中的 Route 类，收集方法和类型信息，生成 `.d.ts` 声明文件。

**示例：**

```bash
sora export:api --target web --target admin
```

## sora export doc

从 Route 处理器导出 OpenAPI 文档。

```bash
sora export:doc [options]
```

**选项：**

| 选项 | 说明 |
|------|------|
| `--format <format>` | 输出格式：`yaml` 或 `json` |
| `--target <names>` | 导出目标 |

**依赖的 `sora.json` 字段：** `root`, `docOutput`

**示例：**

```bash
sora export:doc --format yaml
sora export:doc --format json --target web
```

## sora config

从模板生成配置文件。

```bash
sora config
```

读取 `sora.json` 中的 `configTemplates`，交互式地收集变量值并生成配置文件。

模板中使用 `#define(key, type, hint)` 语法定义变量：

```yaml
# config.template.yml
server:
  host: #define(host, string, 服务器地址)
  port: #define(port, number, 端口号)
```

运行 `sora config` 后会提示输入 `host` 和 `port`，生成最终的配置文件。
