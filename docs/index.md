---
layout: home
hero:
  name: sora
  text: 高性能微服务框架
  tagline: 基于 TypeScript 的 RPC 微服务框架，内置服务发现、组件管理和分布式追踪
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 核心概念
      link: /guide/core-concepts
features:
  - title: RPC 通信
    details: 支持 TCP、HTTP、WebSocket 多种传输协议，提供请求/响应、单向通知、广播三种通信模式
  - title: 服务发现
    details: 内置服务注册与发现机制，支持内存发现和 etcd 分布式发现，自动感知服务上下线
  - title: 组件系统
    details: 可插拔的组件架构，内置 Redis、Database、etcd 组件，引用计数自动管理生命周期
  - title: 类型安全
    details: 基于 typia AOT 编译时校验，结合 @guard 装饰器实现零运行时开销的参数验证
---
