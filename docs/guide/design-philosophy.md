# 设计理念

Sora 是一个**渐进式 TypeScript 微服务框架**——从零依赖的单进程开发到分布式集群部署，业务代码无需重写，只需替换基础设施实现。

## 渐进式基础设施抽象

Sora 的核心设计哲学是**抽象先行，实现可选**。框架只定义接口契约，具体实现按需引入：

```
┌─────────────────────────────────────────────────────┐
│                  可替换的抽象层                       │
├──────────────┬──────────────────────────────────────┤
│ 服务发现      │ RamDiscovery → ETCDDiscovery → 自定义 │
│ 传输协议      │ TCP → HTTP → WebSocket → 自定义       │
│ 编解码器      │ JsonBuffer → 自定义 Codec             │
│ 组件          │ Redis / Database / etcd / 自定义      │
└──────────────┴──────────────────────────────────────┘
```

不是一开始就要面对所有选择——默认配置（RamDiscovery + TCP + JsonBuffer）零依赖、开箱即用。当业务需要分布式能力时，切换只需改一行代码：

::: code-group

```typescript [开发阶段 — 零依赖]
import { RamDiscovery } from '@sora-soft/ram-discovery';

const discovery = new RamDiscovery();
await Runtime.startup(node, discovery);
```

```typescript [生产环境 — etcd 集群]
import { ETCDDiscovery } from '@sora-soft/etcd-discovery';

const discovery = new ETCDDiscovery({
  etcdComponentName: 'etcd',
  prefix: '/my-app/discovery',
});
await Runtime.startup(node, discovery);
```

:::

业务代码中的 Provider 调用、Listener 监听、Service 注册——全部不变。

详见 [服务发现](/microservice/discovery)、[RPC 概览](/rpc/overview)。

## 从 MVP 到生产

渐进式抽象让同一个项目在不同阶段自然演进，无需架构重写：

```
 MVP 阶段                成长阶段                 规模化阶段
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ 单进程部署    │      │ 多服务协作    │      │ 分布式集群    │
│              │      │              │      │              │
│ RamDiscovery │ ───▶ │ ETCDDiscovery│ ───▶ │ 负载均衡     │
│ 内存数据     │      │ Redis 缓存   │      │ 分布式追踪   │
│ 零运维成本   │      │ Database     │      │ etcd 选举    │
│              │      │ 按需引入组件  │      │ 多节点部署   │
└──────────────┘      └──────────────┘      └──────────────┘
   零依赖               引入基础设施            完整分布式能力
```

**关键点：每一阶段的业务代码完全相同。** 变的只是配置和基础设施实现。

## CLI 驱动的开发体验

Sora CLI 处理所有业务之外的样板工作，让开发者专注于业务逻辑：

```bash
# 从模板创建完整项目
sora new my-project

# 生成 Service + Handler + 注册代码 + 配置条目
sora generate:service Order --listeners http,tcp

# 一键安装组件（自动注册到项目）
sora add:component @sora-soft/redis-component

# 自动导出 TypeScript API 声明
sora export:api --target web

# 交互式配置文件生成
sora config
```

| 命令 | 做了什么 | 你省了什么 |
|------|---------|-----------|
| `sora new` | 从模板生成完整项目结构 | 手动配置构建工具、目录结构、启动流程 |
| `sora generate:service` | Service 类 + Handler + 枚举注册 + 工厂函数 | 手写注册代码、配置条目 |
| `sora generate:worker` | Worker 类 + 注册 + 配置 | 同上 |
| `sora generate:command` | 一次性命令 Worker | 手写命令行入口 |
| `sora add:component` | 安装包 + 读取清单 + 自动注册 | 手动安装、配置、注册 |
| `sora export:api` | 扫描 Route → 生成 `.d.ts` | 手动维护类型声明 |
| `sora export:doc` | 扫描 Route → 生成 OpenAPI 文档 | 手写 API 文档 |
| `sora config` | 模板变量 → 交互式生成配置文件 | 手动复制修改配置 |

详见 [命令手册](/cli/commands)。

## 开箱即用的工程基础设施

Sora 不是只提供 RPC 通信胶水，而是一套完整的微服务工程方案：

| 能力 | 说明 | 文档 |
|------|------|------|
| **编译时类型校验** | `@guard` 装饰器 + typia AOT，编译时生成校验代码，零运行时开销 | [参数验证](/tools/validation) |
| **分布式追踪** | W3C Trace Context，RPC 调用自动传播追踪上下文，`diagnostics_channel` 集成 APM | [分布式追踪](/tools/observability) |
| **结构化日志** | Logger/Output 分离，Console + File + 自定义输出，队列保证有序 | [日志](/tools/logging) |
| **上下文传播** | 基于 `AsyncLocalStorage` 的作用域链，日志 category 自动推断，RPC 自动传播 | [上下文与作用域](/tools/context-scope) |
| **配置管理** | YAML 模板系统，敏感字段自动屏蔽（`*` 后缀），支持本地和远程加载 | [配置文件](/tools/config) |

每个能力都有独立文档，按需深入了解。

## 下一步

- [快速开始](/guide/getting-started) — 用 `sora new` 创建第一个项目
- [核心概念](/microservice/core-concepts) — 理解 Runtime、Node、Service、Worker、Component 的层级关系
- [RPC 概览](/rpc/overview) — 了解协议无关的 RPC 通信系统
- [组件系统](/microservice/component) — 了解可插拔的组件架构
