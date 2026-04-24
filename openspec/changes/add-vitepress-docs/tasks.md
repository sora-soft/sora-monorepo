## 1. VitePress 站点搭建

- [x] 1.1 在 monorepo 根目录创建 `docs/` 目录，添加 `package.json`（声明 vitepress@1.6.4 依赖和 scripts：docs:dev、docs:build、docs:api）
- [x] 1.2 创建 `docs/.vitepress/config.ts`，配置站点标题、描述、导航栏和完整侧边栏结构（指南/RPC 通信/服务发现/组件/高级/CLI/API Reference）
- [x] 1.3 创建 `docs/index.md` 首页，配置 frontmatter hero 布局（框架名称、描述、快速开始按钮）
- [x] 1.4 创建 `docs/.gitignore`，排除 `api/` 目录

## 2. 指南文档

- [x] 2.1 编写 `docs/guide/getting-started.md` — 快速开始：安装 CLI → sora new 创建项目 → 项目结构 → 编写第一个 Route → 启动服务
- [x] 2.2 编写 `docs/guide/core-concepts.md` — 核心概念：Runtime/Node/Service/Worker/Component 层级关系与职责
- [x] 2.3 编写 `docs/guide/service-lifecycle.md` — 服务生命周期：启动时序和关闭时序，状态流转图

## 3. RPC 通信文档

- [x] 3.1 编写 `docs/rpc/overview.md` — RPC 概览：三种通信模式（Request/Response、Notify、Broadcast）和四个核心角色
- [x] 3.2 编写 `docs/rpc/route.md` — 路由：@Route.method、@Route.notify、中间件、参数注入
- [x] 3.3 编写 `docs/rpc/provider.md` — Provider 调用方：rpc()、notify()、broadcast()、标签过滤、策略
- [x] 3.4 编写 `docs/rpc/transport.md` — 传输层：TCP、HTTP、WebSocket 的配置和选型

## 4. 服务发现文档

- [x] 4.1 编写 `docs/discovery/overview.md` — 服务发现概览：RamDiscovery vs ETCDDiscovery 对比与配置
- [x] 5.1 编写 `docs/components/overview.md` — 组件系统：Component 抽象、注册/连接/使用流程、引用计数
- [x] 5.2 编写 `docs/components/redis.md` — Redis 组件：安装、配置、client 使用、分布式锁
- [x] 5.3 编写 `docs/components/database.md` — Database 组件：安装、配置、Entity、WhereBuilder
- [x] 5.4 编写 `docs/components/etcd.md` — etcd 组件：安装、配置、持久化键值、锁、选举

## 6. 高级文档

- [x] 6.1 编写 `docs/advanced/singleton.md` — 单例服务与选举：SingletonService/SingletonWorker、Election 机制
- [x] 6.2 编写 `docs/advanced/validation.md` — 参数验证：@guard 装饰器、typia AOT、ts-patch 配置
- [x] 6.3 编写 `docs/advanced/context-scope.md` — 上下文与作用域：AsyncLocalStorage、Scope 层级、Context API
- [x] 6.4 编写 `docs/advanced/observability.md` — 可观测性：Logger 系统、W3C 分布式追踪

## 7. CLI 文档

- [x] 7.1 编写 `docs/cli/commands.md` — 命令手册：所有 sora 命令的用法、参数和示例
- [x] 7.2 编写 `docs/cli/sora-json.md` — sora.json 配置：每个字段的说明和引用格式

## 8. API Reference 集成

- [x] 8.1 在 `docs/package.json` 中添加 typedoc 和 typedoc-plugin-markdown 依赖
- [x] 8.2 配置 typedoc（typedoc.json 或内联配置），指定 framework 入口和 `docs/api/` 输出目录
- [x] 8.3 在 VitePress 侧边栏中配置 API Reference 分组，自动扫描 `docs/api/` 目录
- [x] 8.4 验证 typedoc 生成输出与 VitePress 渲染的兼容性，调整配置解决格式问题

## 9. 项目模板链接页

- [x] 9.1 创建 `docs/templates.md`，列出三个项目模板名称及其 GitHub 仓库 README 链接

## 10. GitHub Pages 部署

- [x] 10.1 创建 `.github/workflows/deploy-docs.yml`，配置 CI 工作流（安装依赖 → 构建 framework → 运行 typedoc → 运行 vitepress build → 部署到 gh-pages）
- [x] 10.2 更新根目录 `.gitignore`，排除 `docs/api/` 和 `docs/.vitepress/dist/`
- [x] 10.3 验证完整构建流程（本地运行 docs:api → docs:build），确保文档站正确构建
