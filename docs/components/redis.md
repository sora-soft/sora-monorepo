# Redis 组件

`@sora-soft/redis-component` 封装了 Redis 客户端和分布式锁功能。

## 安装

```bash
pnpm add @sora-soft/redis-component
```

## 配置

```typescript
import { RedisComponent } from '@sora-soft/redis-component';

const redis = new RedisComponent();
redis.loadOptions({
  url: 'redis://localhost:6379',
  database: 0,
  password: 'your-password',
});
Runtime.registerComponent('redis', redis);
```

**配置项（`IRedisComponentOptions`）：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `url` | `string` | 是 | Redis 连接 URL |
| `database` | `number` | 是 | 数据库编号 |
| `username` | `string` | 否 | 用户名 |
| `password` | `string` | 否 | 密码 |
| `name` | `string` | 否 | 客户端名称 |
| `commandsQueueMaxLength` | `number` | 否 | 命令队列最大长度 |
| `disableOfflineQueue` | `boolean` | 否 | 禁用离线队列 |
| `readonly` | `boolean` | 否 | 只读模式 |
| `legacyMode` | `boolean` | 否 | 兼容模式 |
| `pingInterval` | `number` | 否 | 心跳间隔（毫秒） |

## 基本使用

### 连接

在 Worker/Service 中连接组件：

```typescript
await this.connectComponent(Com.redis);
```

### Redis 客户端

组件内部使用 `redis` v4 客户端：

```typescript
const redis = Com.redis;

// 基本操作
await redis.client.set('key', 'value');
const value = await redis.client.get('key');

// 过期时间
await redis.client.set('key', 'value', { EX: 3600 });

// Hash
await redis.client.hSet('user:1', { name: 'Alice', age: '30' });
const user = await redis.client.hGetAll('user:1');

// List
await redis.client.lPush('queue', 'item1', 'item2');
const items = await redis.client.lRange('queue', 0, -1);

// Sorted Set
await redis.client.zAdd('scores', [{ score: 100, value: 'player1' }]);
```

### JSON 序列化

组件提供便捷的 JSON 序列化方法：

```typescript
// 存储 JSON 对象（自动序列化）
await redis.setJSON('user:1', { name: 'Alice', age: 30 });

// 设置过期时间
await redis.setJSON('user:1', { name: 'Alice', age: 30 }, NodeTime.hour(1));

// 读取 JSON 对象（自动反序列化）
const user = await redis.getJSON<{ name: string; age: number }>('user:1');
// { name: 'Alice', age: 30 }
```

### 分布式锁

基于 Redlock 实现的分布式锁：

```typescript
const redis = Com.redis;

const lock = redis.createLock({
  retryCount: 3,
  retryDelay: NodeTime.second(0.2),
});

// 获取锁
const resource = 'lock:order:123';
const ttl = NodeTime.second(5);

await lock.using([resource], ttl, async (signal) => {
  // 在锁保护下执行操作
  // signal.aborted 可检查锁是否已被释放

  await processOrder('123');

  // 如果操作超过 ttl，锁会自动释放
});
```

## 导出

组件包同时导出底层库，可以直接使用：

```typescript
import { RedisComponent, redis, redlock } from '@sora-soft/redis-component';

// redis - re-exports redis v4
// redlock - re-exports redlock
```
