## 为什么

Sora 文档站目前缺少一个面向技术决策者和开发者的"为什么选择 Sora"页面。现有文档都聚焦于"怎么用"（快速开始、API 参考、命令手册），但没有回答"为什么用"——即 Sora 的设计哲学和核心价值主张。对于评估框架的访客，首页 tagline "高性能微服务框架"没有传达 Sora 最独特的优势：渐进式基础设施抽象。

## 变更内容

1. 新增 `docs/guide/design-philosophy.md` 页面，阐述 Sora 的设计理念，涵盖四个核心要点：
   - 渐进式基础设施抽象：服务发现、RPC 传输、编解码等均可替换，从零依赖到生产集群只换一行代码
   - MVP 到生产的无缝演进：同一套业务代码，随业务成长按需引入 etcd、Redis、Database 等
   - CLI 驱动的开发体验：脚手架生成、代码生成、API 导出、配置管理，消除样板工作
   - 开箱即用的工程基础设施：typia AOT 类型校验、W3C 分布式追踪、结构化日志、AsyncLocalStorage 上下文传播、配置敏感信息屏蔽

2. 更新首页 `docs/index.md`：
   - tagline 从"高性能微服务框架"改为"渐进式微服务框架"
   - hero 新增"设计理念"按钮入口
   - features 四条微调措辞，更突出渐进式理念

3. 更新 `docs/.vitepress/config.ts`：guide sidebar 新增"设计理念"条目

## 功能 (Capabilities)

### 新增功能
- `design-philosophy-doc`: 设计理念文档页面，包含四个核心要点的阐述、代码示例对比、功能概览表格

### 修改功能
- `guide-docs`: 在指南部分新增设计理念页面入口

## 影响

- 文档文件：新增 1 个 md 文件，修改 2 个文件（index.md、config.ts）
- 无代码变更、无 API 变更、无依赖变更
