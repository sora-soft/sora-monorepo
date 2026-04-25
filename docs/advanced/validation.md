# 参数验证

sora 库使用 [typia](https://github.com/samchon/typia) 作为类型检测工具，通过 AOT（Ahead-of-Time）编译实现零运行时开销的类型校验，推荐在项目中也使用 typia。

sora 提供了 `@sora-soft/typia-decorator` 包，其中的 `@guard` 装饰器可以自动校验函数参数：

```typescript
import { guard } from '@sora-soft/typia-decorator';

function handler(@guard params: IType) {
  // params 已通过类型校验
}
```

## 工作原理

```
┌────────────────────────────────────────────────────────────────┐
│                      编译时                                    │
│                                                                │
│  @guard options: IRedisOptions                                 │
│       │                                                        │
│       ▼  TypeScript Transform Plugin (ts-patch)               │
│       │                                                        │
│       ▼  typia.assert<IRedisOptions>()                         │
│       │  生成类型校验代码                                       │
│       │                                                        │
│       ▼  移除 @guard 装饰器                                    │
│                                                                │
│  编译输出:                                                      │
│  protected setOptions(options: IRedisOptions) {                │
│    typia.assert<IRedisOptions>(options);  // 自动插入           │
│    // ... 原始方法体                                            │
│  }                                                              │
└────────────────────────────────────────────────────────────────┘
```

**关键点：**
- `@guard` 在运行时是一个空操作（空函数）
- 编译时，TypeScript transform 插件扫描所有 `@guard` 装饰的参数
- 使用 typia 的 `AssertProgrammer` 生成运行时类型校验代码
- 校验代码插入到方法体开头，`@guard` 装饰器从输出中移除
- 生成的校验代码比手写 `if` 检查更高效（无反射开销）

## 使用方式

### 在 Component 的 setOptions 中

框架中所有 Component 的 `setOptions()` 方法都使用了 `@guard`：

```typescript
import { Component } from '@sora-soft/framework';
import { guard } from '@sora-soft/typia-decorator';

interface IMyOptions {
  url: string;
  timeout: number;
}

class MyComponent extends Component {
  protected setOptions(@guard options: IMyOptions): void {
    this.options_ = options;
  }

  // ...
}
```

调用 `loadOptions()` 时，如果传入的配置不符合类型定义，会抛出 typia 校验错误：

```typescript
myComponent.loadOptions({ url: 123 }); // 编译时通过，运行时抛出校验错误
```

### 在 Route 处理器中

你也可以在自定义 RPC 处理器中使用参数校验：

```typescript
import { Route } from '@sora-soft/framework';
import { guard } from '@sora-soft/typia-decorator';

interface ICreateUserReq {
  name: string;
  email: string;
  age: number;
}

class UserHandler extends Route {
  @Route.method
  async createUser(@guard body: ICreateUserReq): Promise<{ id: string }> {
    // body 已通过类型校验
    const user = await this.userService.create(body);
    return { id: user.id };
  }
}
```

## 校验能力

typia 支持丰富的 TypeScript 类型校验：

```typescript
interface IAdvancedOptions {
  // 基本类型
  url: string;
  port: number;
  enabled: boolean;

  // 字面量类型
  mode: 'development' | 'production';

  // 可选属性
  timeout?: number;

  // 数组
  tags: string[];

  // 枚举
  level: LogLevel;

  // 嵌套对象
  database: {
    host: string;
    port: number;
  };

  // 联合类型
  cache: RedisCache | MemoryCache;

  // 元组
  range: [number, number];
}
```

所有这些类型约束在运行时都会被校验，确保传入参数完全符合 TypeScript 类型定义。


