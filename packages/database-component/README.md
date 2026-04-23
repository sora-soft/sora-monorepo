# @sora-soft/database-component

基于 TypeORM 的数据库组件，封装了数据库连接管理、查询构建和条件构造等功能，作为 sora 框架的基础设施组件使用。

## 安装

```bash
sora add:component @sora-soft/database-component
```

## 功能说明

- 封装 TypeORM `DataSource`，提供统一的数据库连接生命周期管理（`loadOptions` → `start` → `stop`）
- 提供 `WhereBuilder` 用于声明式构建复杂查询条件，支持多种运算符（`$eq`、`$ne`、`$lt`、`$gt`、`$in`、`$like`、`$between`、`$isNull` 等）
- 提供 `buildSQL` 方法支持关联查询、分页、排序等高级查询场景
- 提供 `SQLUtility` 用于将占位符参数化 SQL 转换为 TypeORM 命名参数格式
- 安装后自动生成 `DatabaseMigrateCommandWorker`，提供数据库迁移（generate / migrate / revert / sync / drop）命令行支持

## 安装后的变更

执行 `sora add:component @sora-soft/database-component` 后，项目中会发生以下变更：

1. **组件注册** — `Com.ts` 中自动注册 `DatabaseComponent`
2. **配置模板** — 自动注入数据库连接配置项（type、host、port、username、password、database）
3. **Worker 生成** — 在 worker 目录下生成 `DatabaseMigrateCommandWorker.ts`
4. **sora.json** — 写入 `migration` 和 `databaseDir` 路径配置
5. **npm scripts** — 向 `package.json` 中注入以下迁移相关命令

### 添加的 npm scripts

| 命令 | 说明 |
|---|---|
| `npm run migrate:generate` | 根据实体定义与数据库的差异，自动生成迁移文件 |
| `npm run migrate` | 执行所有未运行的迁移（需指定组件名） |
| `npm run migrate:revert` | 回滚最近一次执行的迁移（需指定组件名） |
| `npm run migrate:sync` | 直接同步实体定义到数据库（开发用，跳过迁移文件） |
| `npm run migrate:drop` | 删除整个数据库（需指定组件名，不可逆） |

## 使用方法

### 注册并启动组件

```typescript
import { DatabaseComponent } from '@sora-soft/database-component';
import { Runtime } from '@sora-soft/framework';
import { UserEntity } from './database/entity/UserEntity';

const db = new DatabaseComponent([UserEntity]);
Runtime.registerComponent('database', db);
db.loadOptions({
  database: {
    type: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    username: 'root',
    password: 'password',
    database: 'myapp',
    synchronize: false,
  },
});
await db.start();
```

### 基础查询

```typescript
const repository = db.manager.getRepository(UserEntity);
const users = await repository.find();
```

### 使用 WhereBuilder 构建条件

```typescript
const where = WhereBuilder.build(UserEntity, {
  age: { $gt: 18 },
  status: { $in: ['active', 'pending'] },
  name: { $like: '%alice%' },
});
const users = await repository.find({ where });
```

### 使用 buildSQL 进行关联查询

```typescript
const result = await db.buildSQL(UserEntity, {
  select: ['id', 'name'],
  relations: ['orders'],
  where: { age: { $gte: 18 } },
  order: { id: 'DESC' },
  offset: 0,
  limit: 10,
});
```

### 获取原生 DataSource

```typescript
const dataSource = db.dataSource;
```

## 数据库迁移

### 生成迁移文件

根据实体定义与当前数据库 schema 的差异，自动生成迁移文件到 `src/app/database/migration/{componentName}/` 目录：

```bash
npm run migrate:generate
```

生成的迁移文件为 TypeScript 类，包含 `up()` 和 `down()` 方法，文件名格式为 `{日期}{组件名}{时间戳}.ts`。

### 执行迁移

运行指定组件的所有未执行迁移（生产环境推荐）：

```bash
npm run migrate -- <组件名>
# 例如：npm run migrate -- database
```

### 回滚迁移

撤销最近一次执行的迁移：

```bash
npm run migrate:revert -- <组件名>
# 例如：npm run migrate:revert -- database
```

可重复执行以依次回滚多个迁移。

### 同步 Schema（开发用）

直接将实体定义同步到数据库，不生成迁移文件：

```bash
npm run migrate:sync
```

> **注意**：此命令会直接修改数据库结构，仅适用于开发环境，生产环境请使用 `migrate`。

### 删除数据库

删除整个数据库（不可逆）：

```bash
npm run migrate:drop -- <组件名>
# 例如：npm run migrate:drop -- database
```
