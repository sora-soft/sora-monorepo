# Database 组件

`@sora-soft/database-component` 封装了 TypeORM 数据库访问，提供类型安全的查询构建器。

## 安装

```bash
pnpm add @sora-soft/database-component
```

## 配置

```typescript
import { DatabaseComponent } from '@sora-soft/database-component';
import { User } from './entity/User';

const database = new DatabaseComponent([User]);
database.loadOptions({
  database: {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'password',
    database: 'my_app',
    synchronize: false,
  },
});
Runtime.registerComponent('database', database);
```

构造函数接受 Entity 类数组，`loadOptions` 中的 `database` 字段直接传递给 TypeORM 的 `DataSource` 配置。

**配置项（`IDatabaseComponentOptions`）：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `database` | `DataSourceOptions` | TypeORM DataSource 配置 |

## 基本使用

### 连接

```typescript
await this.connectComponent(Com.database);
```

### EntityManager

通过 `manager` 访问 TypeORM 的 EntityManager：

```typescript
const db = Com.database;

// 查询
const user = await db.manager.findOne(User, { where: { id: '123' } });

// 创建
await db.manager.save(User, { name: 'Alice', email: 'alice@example.com' });

// 更新
await db.manager.update(User, { id: '123' }, { name: 'Bob' });

// 删除
await db.manager.delete(User, { id: '123' });
```

### DataSource

直接访问 TypeORM DataSource：

```typescript
const db = Com.database;

// 获取 DataSource
const dataSource = db.dataSource;

// 原始查询
const result = await dataSource.query('SELECT * FROM users WHERE id = ?', ['123']);
```

### Entity 列表

获取注册的 Entity 类数组：

```typescript
const entities = db.entities; // [User, Order, ...]
```

## WhereBuilder

`WhereBuilder` 提供类型安全的条件构建，同时支持 TypeORM FindOptions 和原始 SQL 两种输出。

### 支持的操作符

| 操作符 | 说明 | 示例 |
|--------|------|------|
| `$eq` | 等于 | `{ name: { $eq: 'Alice' } }` |
| `$ne` | 不等于 | `{ status: { $ne: 'deleted' } }` |
| `$gt` | 大于 | `{ age: { $gt: 18 } }` |
| `$gte` | 大于等于 | `{ age: { $gte: 18 } }` |
| `$lt` | 小于 | `{ age: { $lt: 65 } }` |
| `$lte` | 小于等于 | `{ age: { $lte: 65 } }` |
| `$in` | 包含 | `{ status: { $in: ['active', 'pending'] } }` |
| `$like` | 模糊匹配 | `{ name: { $like: '%alice%' } }` |
| `$iLike` | 不区分大小写模糊匹配 | `{ name: { $iLike: '%alice%' } }` |
| `$between` | 范围 | `{ age: { $between: [18, 65] } }` |
| `$isNull` | 为空 | `{ deletedAt: { $isNull: true } }` |
| `$not` | 取反 | `{ status: { $not: { $eq: 'deleted' } } }` |
| `$raw` | 原始 SQL | `{ createdAt: { $raw: 'NOW() - INTERVAL 1 DAY' } }` |

### 构建 TypeORM FindOptions

```typescript
import { WhereBuilder } from '@sora-soft/database-component';

const where = WhereBuilder.build<User>({
  status: { $eq: 'active' },
  age: { $gte: 18 },
});

const users = await db.manager.find(User, { where });
```

多条件 OR 查询：

```typescript
const where = WhereBuilder.build<User>([
  { status: { $eq: 'active' } },
  { role: { $eq: 'admin' } },
]);

const users = await db.manager.find(User, { where });
```

### 构建原始 SQL

```typescript
const { sql, parameters } = WhereBuilder.buildSQL<User>(
  {
    status: { $eq: 'active' },
    age: { $gte: 18 },
  },
  'users', // 表名
);

// sql: "users.status = ? AND users.age >= ?"
// parameters: ['active', 18]
```

## buildSQL 方法

组件提供便捷的 SQL 构建方法：

```typescript
const queryBuilder = db.buildSQL(User, {
  where: { status: { $eq: 'active' } },
  order: { createdAt: 'DESC' },
  limit: 10,
  offset: 0,
});

const results = await queryBuilder.getMany();
```

## 导出

组件包同时导出 TypeORM：

```typescript
import { DatabaseComponent, WhereBuilder, typeorm } from '@sora-soft/database-component';

// typeorm - re-exports TypeORM
```
