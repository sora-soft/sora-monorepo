<h1 align="center">Sora</h1>

<p align="center">
  <strong>高性能 TypeScript RPC 微服务框架</strong>
</p>

<p align="center">
  内置服务发现、组件管理、分布式追踪和类型安全的参数校验
</p>

<p align="center">
  <a href="https://framework.sorasoftware.com/">📄 文档</a>
  <span> · </span>
  <a href="https://framework.sorasoftware.com/guide/getting-started">🚀 快速开始</a>
  <span> · </span>
  <a href="https://github.com/sora-soft/sora-monorepo/issues">🐛 提交 Issue</a>
</p>

---

## 特性

- **RPC 通信** — 支持 TCP、HTTP、WebSocket 多种传输协议，提供请求/响应、单向通知、广播三种通信模式
- **服务发现** — 内置服务注册与发现机制，支持内存发现和 etcd 分布式发现，自动感知服务上下线
- **组件系统** — 可插拔的组件架构，内置 Redis、Database、etcd 组件，引用计数自动管理生命周期
- **类型安全** — 基于 [typia](https://github.com/samchon/typia) AOT 编译时校验
- **分布式追踪** — W3C Trace Context 兼容，RPC 调用自动传播追踪上下文
- **CLI 工具** — 脚手架生成项目、Service、Worker、Command 等代码模板

## 快速开始

```bash
# 安装 CLI
npm install -g @sora-soft/sora-cli

# 从模板创建项目
sora new my-project
```

详见 [快速开始](https://framework.sorasoftware.com/guide/getting-started)。

## 包结构

| 包 | 说明 |
|---|---|
| `@sora-soft/framework` | 核心框架：RPC、生命周期、组件、追踪等 |
| `@sora-soft/sora-cli` | CLI 脚手架工具 |
| `@sora-soft/typia-decorator` | `@guard` 参数校验装饰器 |
| `@sora-soft/redis-component` | Redis 组件 |
| `@sora-soft/database-component` | Database 组件 |
| `@sora-soft/etcd-component` | etcd 组件 |
| `@sora-soft/etcd-discovery` | etcd 服务发现 |
| `@sora-soft/ram-discovery` | 内存服务发现 |
| `@sora-soft/http-support` | HTTP 传输支持 |

## 文档

完整文档请访问 [sora-soft.github.io/sora-monorepo](https://framework.sorasoftware.com/)

- [指南](https://framework.sorasoftware.com/guide/getting-started)
- [微服务架构](https://framework.sorasoftware.com/microservice/core-concepts)
- [RPC 通信](https://framework.sorasoftware.com/rpc/overview)
- [工具](https://framework.sorasoftware.com/tools/validation)
- [API 参考](https://framework.sorasoftware.com/api/)

## 开发

```bash
# 克隆仓库
git clone https://github.com/sora-soft/sora-monorepo.git
cd sora-monorepo

# 安装依赖
pnpm install

# 构建所有包
pnpm -r run build
```

## 许可证

[WTFPL](LICENSE)
