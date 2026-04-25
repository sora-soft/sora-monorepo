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

## 自定义路由

开发者也可以通过自定义路由决定 Listener 的消息处理方法。自定义路由需要继承 `Route` 类并实现自己的 `ListenerCallback`，例如 `ForwardRoute` 提供了一个直接将请求按需转发给其他服务的网关路由：

```typescript
import {
  ErrorLevel, ExError, type IRawResPacket, type ListenerCallback,
  NodeTime, Notify, OPCode, type Provider, Request, Response, Route,
  RouteError, RPCError, RPCErrorCode, RPCHeader, RPCResponseError,
  Runtime, type Service,
} from '@sora-soft/framework';

type RouteMap = { [key: string]?: Provider<Route> };

class ForwardRoute<T extends Service = Service> extends Route {
  constructor(service: T, route: RouteMap) {
    super();
    this.service = service;
    this.routeProviderMap_ = new Map();
    for (const [name, value] of Object.entries(route)) {
      if (value) this.routeProviderMap_.set(name, value);
    }
  }

  private routeProviderMap_: Map<string, Provider<Route>>;
  private service: T;

  private getProvider(service: string) {
    const provider = this.routeProviderMap_.get(service);
    if (!provider)
      throw new RPCError(RPCErrorCode.ErrRpcProviderNotAvailable, `ERR_RPC_PROVIDER_NOT_AVAILABLE, service=${service}`);
    return provider;
  }

  static callback(route: ForwardRoute): ListenerCallback {
    return async (packet, session, connector): Promise<IRawResPacket | null> => {
      switch (packet.opcode) {
        case OPCode.Request: {
          const request = new Request(packet);
          const response = new Response({ headers: {}, payload: { error: null, result: null } });
          if (!packet.service)
            throw new RouteError(RPCErrorCode.ErrRpcServiceNotFound, 'service is null', ErrorLevel.Expected, { service: packet.service });

          const service = request.service as string;
          const method = request.method;

          const provider = route.getProvider(service);
          const res: Response<unknown> = await (provider.rpc(route.service.id) as any)[method](request.payload, {
            timeout: NodeTime.second(60),
          }, true);
          response.payload = res.payload;
          return response.toPacket();
        }
        case OPCode.Notify: {
          const notify = new Notify(packet);
          if (!packet.service) return null;

          const service = notify.service as string;
          const method = notify.method;
          const provider = route.getProvider(service);

          await (provider.notify(route.service.id) as any)[method](notify.payload);
          return null;
        }
        default:
          return null;
      }
    };
  }
}
```

`ForwardRoute` 的核心思路：

1. 构造时接收一个 `RouteMap`，将服务名映射到对应的 `Provider<Route>`
2. `callback()` 静态方法返回 `ListenerCallback`，根据 `OPCode` 区分 Request 和 Notify
3. Request 模式：根据 `packet.service` 查找目标服务的 Provider，通过 `provider.rpc()` 调用远端方法并透传响应
4. Notify 模式：类似 Request，但不返回响应
5. 错误处理：根据 `ErrorLevel` 区分致命错误和预期错误，返回对应的错误响应

使用方式：

```typescript
const route = new ForwardRoute(this, {
  [ServiceName.BusinessService]: businessProvider,
});

const listener = new HTTPListener(options, ForwardRoute.callback(route), [Codec.get('json')]);
await service.installListener(listener);
```

## 中间件

中间件用于在 RPC 方法执行前后插入通用逻辑（如鉴权、日志、限流等）。中间件采用 Koa 风格的洋葱模型，通过 `next()` 调用下一个中间件或最终处理器。

### 装饰器中间件

推荐通过继承 `Route` 并封装装饰器的方式来定义可复用的中间件。装饰器在类声明阶段自动调用 `Route.registerMiddleware()` 完成注册，使用起来更加直观：

```typescript
import { Route, RPCMiddleware } from '@sora-soft/framework';

class AuthRoute extends Route {
  static auth(authName?: string) {
    return (target: AuthRoute, method: string) => {
      Route.registerMiddleware<AuthRoute>(target, method, async (route, body, request, response, connector, next) => {
        const allowed = isAuthPermission(authName);
        if (!allowed) {
          throw new Error('Permission Denied');
        }
        // 必须显式调用 next 进行后续处理
        await next();
        // 请求处理完成后打印日志
        console.log('user permission check finished');
      });
    };
  }
}
```

在子类中通过装饰器将中间件绑定到具体方法：

```typescript
class ServiceHandler extends AuthRoute {
  @AuthRoute.auth('permission:setValue')
  @Route.method
  async setValue(body: unknown) {
    // 确认调用方拥有 permission:setValue 权限
    // 处理具体业务
    return { message: 'ok' };
  }
}
```

### 中间件参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| `route` | `Route` | 当前 Route 实例 |
| `body` | `Req` | 请求载荷（已解码） |
| `req` | `Request` / `Notify` | 请求对象，包含 headers |
| `res` | `Response` / `null` | 响应对象（Notify 模式下为 null） |
| `connector` | `Connector` | 当前连接 |
| `next` | `() => Promise` | 调用下一个中间件或处理器 |

## 参数注入

当多个路由方法需要相同的数据（如当前用户、账户信息等）时，可以通过参数注入将公共逻辑统一抽取，避免在每个方法中重复编写。

### 反面示例：手动获取重复数据

以下写法在每个方法中都重复相同的提取逻辑，不利于维护：

```typescript
class AccountServiceHandler extends Route {
  @Route.method
  async methodA(body: void, request: Request) {
    const accountId = request.getHeader('account-id');
    const account = await db.fetchAccount(accountId);
    // 使用 account...
  }

  @Route.method
  async methodB(body: void, request: Request) {
    const accountId = request.getHeader('account-id');
    const account = await db.fetchAccount(accountId);
    // 使用 account...
  }
}
```

### 推荐写法：装饰器参数注入

与中间件类似，推荐通过继承 `Route` 并封装装饰器的方式定义可复用的参数注入器。装饰器在类声明阶段自动调用 `Route.registerProvider()` 完成注册：

```typescript
class Account {
  id: number;
  // ...
}

class AccountRoute extends Route {
  static account() {
    return (target: AccountRoute, method: string) => {
      Route.registerProvider(target, method, Account, async (route, body, request) => {
        const accountId = request.getHeader('account-id');
        const account = await db.fetchAccount(accountId);
        return account;
      });
    };
  }
}
```

在子类中通过装饰器将参数绑定到方法，处理方法即可直接使用注入的对象：

```typescript
class AccountServiceHandler extends AccountRoute {
  @AccountRoute.account()
  @Route.method
  async methodA(body: void, account: Account) {
    // 直接使用注入的 account
  }
}
```

### 内置注入类型

Sora 框架会自动识别以下类型并完成注入，无需手动注册：

| 类型 | 说明 |
|------|------|
| `Request` / `Notify` | 当前请求对象 |
| `Response` | 当前响应对象 |
| `Connector` | 当前连接 |

Provider 可以注册多个，注入顺序无关——框架会根据参数的类型签名自动匹配对应的注入器。第一个参数始终是 `request.payload`（即 body），其余参数按类型自动解析。

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
