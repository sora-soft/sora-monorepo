---
layout: home
hero:
  name: Sora
  text: 渐进式微服务框架
  tagline: 基于 TypeScript 的 RPC 微服务框架，内置服务发现、组件管理和分布式追踪
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 设计理念
      link: /guide/design-philosophy
features:
  - title: 渐进式基础设施
    details: 服务发现、RPC 传输协议、编解码器均可按需替换，从零依赖的单进程到分布式集群，切换只需一行代码
  - title: 服务发现
    details: 内置 RamDiscovery（零依赖）和 ETCDDiscovery（分布式），随业务成长按需切换，业务代码无需修改
  - title: 组件系统
    details: 可插拔的组件架构，内置 Redis、Database、etcd 组件，引用计数自动管理生命周期，按需引入零负担
  - title: 类型安全
    details: 基于 typia AOT 编译时校验，结合 @guard 装饰器实现零运行时开销的参数验证
---
