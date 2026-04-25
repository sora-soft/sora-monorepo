# 配置文件

sora 项目使用 YAML 模板系统管理配置。通过 `sora config` 指令从模板生成本地配置文件，支持交互式输入和敏感信息自动屏蔽。

## 配置文件模板

模板文件使用 `.template.yml` 后缀，放在 `run/` 目录下。通过 `#define()` 声明交互式变量：

```yaml
# run/config.template.yml
#define(projectScope, string, project scope?)
#define(host, host-ip, host ip?)
#define(port, number, listen port?)
#define(databasePassword, password, database password?)

debug: true
discovery:
  scope: $(projectScope)
services:
  http:
    httpListener:
      port: $(port)
      host: $(host)
components:
  database:
    database:
      username: root
      password*: $(databasePassword)    # * 后缀标记敏感字段
```

`#define()` 支持以下输入类型：

| 类型 | 说明 |
|------|------|
| `string` | 文本输入 |
| `number` | 数字输入 |
| `password` | 隐藏输入 |
| `host-ip` | 本机 IP 选择（自动枚举网卡） |
| `select:[a\|b\|c]` | 选项选择 |

模板中通过 `$(variableName)` 引用 `#define` 声明的变量。

## sora config 指令

```bash
sora config
```

执行流程：

```
sora config
│
├── 1. 读取 sora.json 中的 configTemplates 列表
│
├── 2. 对每个模板：
│       ├── 解析 #define() 指令
│       ├── 交互式收集输入（上次答案保存在 .var.json 中作为默认值）
│       ├── 渲染模板生成配置文件（.template.yml → .yml）
│       └── 保存本次答案到 .var.json
│
└── 3. 输出变更文件列表
```

模板与生成文件的对应关系：

```
run/config.template.yml    →    run/config.yml
run/config-command.template.yml  →  run/config-command.yml
```

## ConfigLoader

应用运行时通过 `ConfigLoader` 加载配置文件，支持本地文件和远程 URL：

```typescript
import { ConfigLoader } from './lib/ConfigLoader.js';

const configLoader = new ConfigLoader<IApplicationOptions>();
await configLoader.load(options.config);  // 支持文件路径或 HTTP(S) URL
const config = configLoader.getConfig();
```

支持的加载方式：

| 协议/格式 | 示例 |
|-----------|------|
| 本地 YAML | `./run/config.yml` |
| 本地 JSON | `./run/config.json` |
| 远程 URL | `http://config-server.local/app/config.yml` |

## 敏感信息屏蔽

配置文件中以 `*` 结尾的 key 标记为敏感字段：

```yaml
components:
  database:
    database:
      username*: root
      password*: my-secret-password
```

ConfigLoader 通过 Proxy 自动处理这些字段：

- **代码访问正常**：`config.components.database.database.username` 返回真实值
- **日志/打印自动屏蔽**：`console.log(config)` 显示 `***`
- **JSON 序列化自动屏蔽**：`JSON.stringify(config)` 显示 `***`
- **Object.keys 自动去星号**：遍历时显示 `username` 而非 `username*`
- **配置只读**：Proxy 拦截 `set` 操作，防止运行时意外修改

```typescript
// 代码中正常使用
await db.connect(config.components.database.database.username);

// 日志中安全输出
console.log(config);
// { components: { database: { database: { username: '***', password: '***' } } } }
```

> **提示：** 无需在代码中做任何特殊处理，ConfigLoader 自动完成屏蔽。只需在配置文件中给敏感字段的 key 加上 `*` 后缀即可。
