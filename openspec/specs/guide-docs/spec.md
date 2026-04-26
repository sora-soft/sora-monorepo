## 新增需求

### 需求:快速开始文档
文档站必须提供 `/guide/getting-started` 页面，引导用户通过 `sora new` 脚手架创建项目并运行第一个服务。内容必须包含：安装 sora CLI、创建项目、理解项目结构、编写第一个 Route、启动服务并发起 RPC 调用。

#### 场景:新用户跟随快速开始
- **当** 新用户阅读快速开始页面并按步骤操作
- **那么** 用户能够安装 sora CLI、创建一个 http-server 项目、编写一个带 `@Route.method` 的处理器、启动服务并通过 HTTP 请求调用

### 需求:核心概念文档
文档站必须提供 `/guide/core-concepts` 页面，系统阐述框架的核心抽象层级：Runtime（全局运行时）> Node（进程节点）> Service（服务）> Worker（工作单元）> Component（组件），以及它们之间的 ownership 和依赖关系。

#### 场景:理解框架架构
- **当** 用户阅读核心概念页面
- **那么** 用户能够理解 Runtime 是单例入口、Node 是进程根服务、Service 通过 Listener 接收 RPC、Worker 是通用工作单元、Component 是可插拔依赖

### 需求:设计理念文档
文档站必须提供 `/guide/design-philosophy` 页面，作为指南部分的首要页面（在快速开始之前），阐述 Sora 的四个核心设计理念。该页面必须包含渐进式基础设施抽象、MVP 到生产演进、CLI 开发体验、开箱即用的工程基础设施四个章节，并提供到对应详细文档的链接。

#### 场景:从指南导航到设计理念
- **当** 用户浏览指南侧边栏
- **那么** 侧边栏在"快速开始"之前显示"设计理念"条目，链接到 `/guide/design-philosophy`

### 需求:服务生命周期文档
文档站必须提供 `/guide/service-lifecycle` 页面，详细描述从 `Runtime.startup()` 到 `Runtime.shutdown()` 的完整启动和关闭时序，包括各阶段的状态流转（Init → Pending → Ready → Stopping → Stopped）。

#### 场景:理解启动流程
- **当** 用户阅读服务生命周期页面
- **那么** 用户能够理解启动顺序（加载配置 → 创建 Discovery → 创建 Node → 启动 Node → 注册 Service/Worker）和关闭顺序（停止 Service → 停止 Worker → 停止 Node → 断开 Discovery）
