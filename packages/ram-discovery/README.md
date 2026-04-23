# @sora-soft/ram-discovery

基于内存的 Sora 服务发现组件。将 Service、Worker、Endpoint 和 Node 元数据存储在进程内存中，适用于单节点或测试场景，支持选主（RamElection）。

## 安装

```bash
npm install @sora-soft/ram-discovery
```

## 初始化

```typescript
import { RamDiscovery } from '@sora-soft/ram-discovery';

const discovery = new RamDiscovery();
await discovery.startup();
```
