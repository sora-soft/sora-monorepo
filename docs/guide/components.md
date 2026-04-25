# 使用组件

sora 框架将外部服务（Redis、Database、etcd 等）抽象为 **Component（组件）**，由框架统一管理连接和生命周期。每个组件封装了特定外部服务的客户端，Service/Worker 只需声明依赖，无需关心连接建立和断开的细节。

## 官方组件

| 包名 | 说明 | 文档 |
|------|------|------|
| `@sora-soft/redis-component` | Redis 缓存与分布式锁 | [Redis 组件](/components/redis) |
| `@sora-soft/database-component` | TypeORM 数据库访问 | [Database 组件](/components/database) |
| `@sora-soft/etcd-component` | etcd 键值存储、分布式锁与选举 | [etcd 组件](/components/etcd) |

## 安装组件

`sora add:component` 命令从 npm 安装组件包并自动完成项目注册：

```bash
sora add:component @sora-soft/redis-component
```

命令会提示输入组件名称：

```
$ sora add:component @sora-soft/redis-component
? Component name (e.g., business-redis) redis
```

组件名称用于在项目中唯一标识该组件实例，相同类型的组件可以通过不同名称注册多个实例（参见[组件复用](#组件复用)）。

命令会自动完成以下操作：

1. 安装 npm 包
2. 在 `Com.ts` 中注册组件（添加 import、枚举成员、静态字段和 `register` 调用）
3. 在配置模板中追加 `#define` 变量和 `components` 配置段

## Com 管理类

sora 推荐使用一个静态类 `Com` 集中管理所有组件实例（由 sora.json 中的 comClass 配置决定这个类的位置）。`sora add:component` 会自动修改 `Com.ts`：

```typescript
import { RedisComponent } from '@sora-soft/redis-component';
import { Runtime } from '@sora-soft/framework';

export enum ComponentName {
  Redis = 'redis',
}

class Com {
  static register() {
    Runtime.registerComponent(ComponentName.Redis, this.redis);
  }

  static redis = new RedisComponent();
}

export { Com };
```

**各部分说明：**

| 部分 | 作用 |
|------|------|
| `ComponentName` 枚举 | 定义组件注册名称的常量，避免硬编码字符串 |
| `Com` 静态类 | 持有所有组件实例，提供类型安全的访问入口 |
| `Com.register()` | 将所有组件注册到 Runtime，在应用启动时调用一次 |
| `static` 字段 | 组件实例，通过 `Com.redis` 直接访问，完整类型推导 |

## 配置

组件的连接参数通过配置文件注入。`sora add:component` 会在配置模板中追加对应的 `#define` 变量和 `components` 段：

```yaml
# config.template.yml
#define(redisUrl, string, redis url?)
#define(redisDB, number, redis db?)

# ... 其他配置 ...

components:
  redis:
    url: $(redisUrl)
    database: $(redisDB)
```

运行 `npm run config` 生成配置文件后，应用启动时会自动将配置注入对应的组件实例：

```typescript
// Application.ts（框架模板自动生成）
Com.register();
if (options.components) {
  for (const [name, componentConfig] of Object.entries(options.components)) {
    const component = Runtime.getComponent(name);
    if (!component) continue;
    component.loadOptions(componentConfig);
  }
}
```

## 在 Service/Worker 中使用

### 连接组件

Service 或 Worker 需要在 `startup()` 中显式声明要使用的组件：

```typescript
import { Com } from '../../lib/Com.js';
import { Service } from '@sora-soft/framework';

class AuthService extends Service {
  protected async startup() {
    await this.connectComponent(Com.redis);

    // ... 其他初始化
  }
}
```

也可以使用 `connectComponents()` 批量连接：

```typescript
protected async startup() {
  await this.connectComponents([Com.redis, Com.database, Com.etcd]);
}
```

### 使用组件

连接后，在业务代码中通过 `Com` 的静态属性直接访问组件：

```typescript
import { Com } from '../../lib/Com.js';

// Redis
await Com.redis.client.set('key', 'value');
const value = await Com.redis.client.get('key');

// Database
const user = await Com.database.manager.findOne(User, {
  where: { id: '123' },
});

// etcd
await Com.etcd.persistPut('service-info', JSON.stringify({ host: '10.0.0.1', port: 4000 }));
```

`Com` 的静态属性提供了完整的 TypeScript 类型推导，无需手动类型断言。

### 生命周期

组件使用引用计数管理连接生命周期，多个 Worker 共享同一个组件实例时不会重复连接：

```
                    引用计数    组件状态
注册组件               0        未连接
Worker A 连接          0 → 1    执行 connect()
Worker B 连接          1 → 2    不重复连接
Worker A 断开          2 → 1    不断开
Worker B 断开          1 → 0    执行 disconnect()
```

框架在 Worker/Service 停止时自动断开已连接的组件，无需手动管理。

## 组件复用

同一个组件库可以注册多个不同名称的实例。例如项目需要连接两个不同的数据库：

```typescript
import { DatabaseComponent } from '@sora-soft/database-component';
import { Runtime } from '@sora-soft/framework';

import { Account } from '../database/Account.js';
import { Order } from '../database/Order.js';

export enum ComponentName {
  AccountDB = 'account-database',
  OrderDB = 'order-database',
}

class Com {
  static register() {
    Runtime.registerComponent(ComponentName.AccountDB, this.accountDB);
    Runtime.registerComponent(ComponentName.OrderDB, this.orderDB);
  }

  static accountDB = new DatabaseComponent([Account]);

  static orderDB = new DatabaseComponent([Order]);
}

export { Com };
```

配置模板中分别声明两个组件的连接信息：

```yaml
components:
  account-database:
    database:
      type: mysql
      host: account-db.internal
      port: 3306
      username: root
      password: pass
      database: account
  order-database:
    database:
      type: mysql
      host: order-db.internal
      port: 3306
      username: root
      password: pass
      database: order
```

在 Service 中按需连接：

```typescript
class AuthService extends Service {
  protected async startup() {
    await this.connectComponent(Com.accountDB);
    // ...
  }
}

class OrderService extends Service {
  protected async startup() {
    await this.connectComponents([Com.orderDB, Com.accountDB]);
    // ...
  }
}
```

每个 Service 只连接自己需要的组件。未连接的组件不会占用该 Service 的资源。

## 下一步

- [组件系统](/microservice/component) — 了解 Component 抽象类的内部实现
- [Redis 组件](/components/redis) — Redis 组件的详细配置和 API
- [Database 组件](/components/database) — Database 组件、WhereBuilder 和迁移
- [etcd 组件](/components/etcd) — etcd 键值存储、分布式锁和选举
- [生命周期](/microservice/service-lifecycle) — 组件在启动/关闭时序中的位置
