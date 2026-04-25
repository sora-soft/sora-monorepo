# 微服务

快速开始中演示了如何快速建立一个单进程 HTTP 服务，本篇将演示如何创建一个多服务集群，并在服务间互相通讯。

## 前置条件

- Node.js >= 22.0.0
- etcd（用于服务发现）

## 创建项目

```bash
sora new my-cluster-service
```

选择 `@sora-soft/base-cluster-template` 模板：

```
$ sora new my-cluster-service
? Select a template @sora-soft/base-cluster-template - 多服务集群模板
? Project name? my-cluster-service
? Description? 多服务集群示例
? Version? 1.0.0
? Author? yaya
? License? MIT
? OK? Yes
Project generated successfully
cd my-cluster-service && npm install
```

创建完成后进入项目目录并安装依赖：

```bash
cd my-cluster-service
npm install
```

这个模板包含两个 Service：

- **http-gateway**：对外 HTTP 网关服务，将 HTTP 请求转发至其他服务
- **business**：业务处理服务，模板内只提供了一个 `ping` 接口

## 生成配置文件

运行 `npm run config` 生成配置文件：

```
$ npm run config

生成 server 配置: run/config.template.yml -> run/config.yml
? project scope? test
? host ip? 127.0.0.1(Loopback Pseudo-Interface 1)
? http port? 8088
? min available port? 8000
? max available port? 9000
? etcd host? <填入你的 etcd 节点地址>
```

生成 command 配置: run/config-command.template.yml -> run/config-command.yml

## 启动服务

```bash
npm run dev
```

服务器成功启动后，试试调用测试接口：

```bash
curl http://127.0.0.1:8088/business/ping
```

响应：

```json
{"error":null,"result":{"result":"pong"}}
```

## 增加一个服务

本篇将带你在此基础上增加一个 `auth` 服务，并提供一个 `login` 接口。

### 生成服务

执行 `sora generate:service` 生成服务骨架：

```
$ sora generate:service
? Service name? auth
? Which listeners should be installed? tcp
? Standalone mode? No
Service AuthService generated
Handler AuthHandler generated
? Config template file? run/config.template.yml
Config entry services.auth added to run/config.template.yml
```

### 编写 Handler

编辑 `src/app/handler/AuthHandler.ts`：

```typescript
import {Route} from '@sora-soft/framework';
import {guard} from '@sora-soft/typia-decorator';

interface IReqLogin {
  username: string;
  password: string;
}

/**
 * @soraExport route
 * @soraPrefix /auth
 */
class AuthHandler extends Route {
  /**
   * 登录
   */
  @Route.method
  async login(@guard body: IReqLogin) {
    if (body.username !== 'sora' || body.password !== 'sora') {
      throw new Error('wrong password');
    }
    return {
      message: 'login success!',
    };
  }
}

export {AuthHandler};
```

::: tip 提示
你可能会好奇代码 JSDoc 中的 `@soraExport route` 和 `@soraPrefix /auth`，这两个 tag 用于接口文档生成与类型导出，具体可以查看[文档与类型导出](/guide/export)
:::

### 重新生成配置

重新运行 `npm run config` 生成包含 `auth` 服务的配置文件。

### 验证服务启动

重启服务器，看到以下日志说明 `auth` 服务启动成功：

```
{"event":"service-started","name":"auth","id":"4594a219-173e-48f1-a703-560bc826e928"}
```

## 添加网关转发

此时 `auth` 服务已启动，但还没有在 `http-gateway` 中添加转发规则，暂时无法通过 HTTP 请求访问。我们需要添加转发配置。

### 添加 Provider

编辑 `src/lib/Provider.ts`，添加 `auth` 服务的 Provider：

```typescript
import {Provider, TCPConnector} from '@sora-soft/framework';
import {WebSocketConnector} from '@sora-soft/http-support';

import type {AuthHandler} from '../app/handler/AuthHandler.js';
import {type BusinessHandler} from '../app/handler/BusinessHandler.js';
import {ServiceName} from '../app/service/common/ServiceName.js';

class Pvd {
  static registerSenders() {
    TCPConnector.register();
    WebSocketConnector.register();
  }

  static business = new Provider<BusinessHandler>(ServiceName.Business);
  // 添加 auth Provider
  static auth = new Provider<AuthHandler>(ServiceName.Auth);
}

export {Pvd};
```

### 注册 Provider 并添加路由

编辑 `src/app/service/HttpGatewayService.ts`，在 `startup` 方法中注册 `Pvd.auth` 并添加路由：

```typescript
class HttpGatewayService extends Service {
  // ... 不做改动

  protected async startup() {
    await this.connectComponents([Com.etcd]);
    // 在此添加 Pvd.auth 注册
    await this.registerProviders([Pvd.business, Pvd.auth]);

    const route = new ForwardRoute(this, {
      [ServiceName.Business]: Pvd.business,
      // 添加 auth 服务路由
      [ServiceName.Auth]: Pvd.auth,
    });
    const koa = new Koa();
    if (this.options_.httpListener) {
      this.httpListener_ = new HTTPListener(this.options_.httpListener, koa, ForwardRoute.callback(route), this.options_.httpListener.labels);
      await this.installListener(this.httpListener_);
    }
  }

  // ...不做改动
}
```

重启服务器。

## 测试接口

使用 `curl` 测试 `auth` 服务的 `login` 接口：

```bash
curl -X POST http://127.0.0.1:8088/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "sora", "password": "sora"}'
```

响应：

```json
{"error":null,"result":{"message":"login success!"}}
```

恭喜你已经完成了 `auth` 微服务的搭建！通过这个流程，你可以继续添加更多的微服务来扩展你的系统。

## 下一步

- [路由 (Route)](/rpc/route) — 深入了解 RPC 处理器的编写方式与路由注解
- [调用方 (Provider)](/rpc/provider) — 了解服务间调用的机制
- [服务发现](/discovery/overview) — 了解 etcd 等服务发现组件的选型与配置
