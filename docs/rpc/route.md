# 路由 (Route)

Route 是 RPC 请求的服务端处理器。通过装饰器注册方法，将 RPC 请求分发到对应的处理函数。

## 基本用法

### 创建 Route

继承 `Route` 类，使用 `@Route.method` 装饰器注册请求处理方法：

```typescript
import { Route } from '@sora-soft/framework';

class UserHandler extends Route {
  @Route.method
  async getUser(body: { id: string }): Promise<{ name: string; email: string }> {
    const user = await this.userService.findById(body.id);
    return { name: user.name, email: user.email };
  }
}
```

`@Route.method` 会将方法注册为 Request/Response 模式的处理器。方法名即为 RPC 方法名。

### 注册 Notify 处理器

使用 `@Route.notify` 装饰器注册单向通知处理器：

```typescript
class UserHandler extends Route {
  @Route.notify
  async syncUserData(body: { userId: string }): Promise<void> {
    await this.syncService.sync(body.userId);
  }
}
```

Notify 处理器不返回响应，调用方不会等待结果。

### 绑定到 Listener

Route 需要通过 `Route.callback()` 绑定到 Listener：

```typescript
const handler = new UserHandler();
const listener = new TCPListener(
  { host: '0.0.0.0', port: 4000 },
  Route.callback(handler),
  [Codec.get('json')],
);
await service.installListener(listener);
```

## 组合多个 Route

使用 `Route.compose()` 将多个 Route 组合到一个 Listener 上：

```typescript
const userHandler = new UserHandler();
const orderHandler = new OrderHandler();

const listener = new TCPListener(
  { host: '0.0.0.0', port: 4000 },
  Route.compose([userHandler, orderHandler]),
  [Codec.get('json')],
);
```

`Route.compose()` 按顺序查找第一个匹配方法名的 Route 来处理请求。

## 中间件

使用 `Route.registerMiddleware()` 为特定方法添加中间件。中间件采用 Koa 风格的 `next()` 模式：

```typescript
import { Route, RPCMiddleware } from '@sora-soft/framework';

class UserHandler extends Route {
  @Route.method
  async getUser(body: { id: string }): Promise<User> {
    // ...
  }
}

// 注册中间件
const authMiddleware: RPCMiddleware<UserHandler> = async (route, body, req, res, connector, next) => {
  // 前置处理：验证权限
  const token = req.headers['authorization'];
  if (!token) {
    throw new ExError('AUTH_FAILED', 'AuthFailed', 'Missing token', ErrorLevel.Expected, {});
  }

  // 调用下一个中间件或处理器
  await next();
};

Route.registerMiddleware(UserHandler.prototype, 'getUser', authMiddleware);
```

中间件参数说明：

| 参数 | 类型 | 说明 |
|------|------|------|
| `route` | `Route` | 当前 Route 实例 |
| `body` | `Req` | 请求载荷（已解码） |
| `req` | `Request` / `Notify` | 请求对象，包含 headers |
| `res` | `Response` / `null` | 响应对象（Notify 模式下为 null） |
| `connector` | `Connector` | 当前连接 |
| `next` | `() => Promise` | 调用下一个中间件或处理器 |

## 参数注入

使用 `Route.registerProvider()` 为处理方法注入自定义参数：

```typescript
import { Route, MethodPramBuilder } from '@sora-soft/framework';

class UserHandler extends Route {
  @Route.method
  async getUser(body: { id: string }, user: IUser): Promise<User> {
    // user 参数由注入器提供
    // ...
  }
}

// 注册参数注入器
const userProvider: MethodPramBuilder<IUser, UserHandler> = async (route, body, req, res, connector) => {
  const token = req.headers['authorization'];
  return verifyToken(token);
};

Route.registerProvider(UserHandler.prototype, 'getUser', IUser, userProvider);
```

`buildCallParams()` 解析参数的规则：

1. 第一个参数始终是 `request.payload`（即 body）
2. 类型为 `Connector` 的参数注入当前连接
3. 类型为 `Request` 或 `Notify` 的参数注入请求对象
4. 类型为 `Response` 的参数注入响应对象
5. 其余类型通过 `registerProvider` 注册的注入器提供

## Request 和 Response

RPC 处理器中的 `Request` 和 `Response` 对象：

```typescript
import { Route, Request, Response } from '@sora-soft/framework';

class UserHandler extends Route {
  @Route.method
  async getUser(body: { id: string }, req: Request<{ id: string }>, res: Response<User>): Promise<User> {
    // req.headers - 请求头
    // req.payload - 请求载荷（等同于 body）
    // req.method - RPC 方法名
    // req.service - 目标服务名

    // 设置响应头
    res.setHeader('x-cache', 'miss');

    return user;
  }
}
```

## 错误处理

在处理器中抛出 `ExError`，框架会自动将其序列化为错误响应返回给调用方：

```typescript
import { Route, ExError, ErrorLevel } from '@sora-soft/framework';

class UserHandler extends Route {
  @Route.method
  async getUser(body: { id: string }): Promise<User> {
    const user = await this.findById(body.id);
    if (!user) {
      throw new ExError(
        'USER_NOT_FOUND',     // code
        'UserNotFound',       // name
        'User not found',     // message
        ErrorLevel.Expected,  // level
        { id: body.id },      // args
      );
    }
    return user;
  }
}
```

错误响应格式：

```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "name": "UserNotFound",
    "message": "User not found",
    "level": 2,
    "args": { "id": "123" }
  },
  "result": null
}
```
