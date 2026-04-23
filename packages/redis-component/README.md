# @sora-soft/redis-component

基于 node-redis 的 Redis 组件，封装了 Redis 客户端连接、JSON 序列化存储和分布式锁等功能，作为 sora 框架的基础设施组件使用。

## 安装

```bash
sora add:component @sora-soft/redis-component
```

## 功能说明

- 封装 node-redis v4 客户端，提供统一的生命周期管理（`loadOptions` → `start` → `stop`）
- 提供 `setJSON` / `getJSON` 方法，自动进行 JSON 序列化与反序列化，支持 TTL 过期时间
- 内置 Redlock 分布式锁支持，通过 `createLock` 创建锁实例
- 支持用户名、密码、数据库选择等完整的 Redis 连接配置

## 使用方法

### 注册并启动组件

```typescript
import { RedisComponent } from '@sora-soft/redis-component';
import { Runtime } from '@sora-soft/framework';

const redis = new RedisComponent();
Runtime.registerComponent('redis', redis);
redis.loadOptions({
  url: 'redis://127.0.0.1:6379',
  database: 0,
});
await redis.start();
```

### 基础操作

```typescript
const client = redis.client;
await client.set('key', 'value');
const value = await client.get('key');
```

### JSON 存储

```typescript
interface User { name: string; age: number; }

await redis.setJSON<User>('user:123', { name: 'Alice', age: 30 }, 60000);
const user = await redis.getJSON<User>('user:123');
```

### 分布式锁

```typescript
const lock = redis.createLock({ retryCount: 3, retryDelay: 200 });

await lock.using(['my-resource'], 5000, async () => {
  // 临界区操作，最多持有 5 秒
});
```
