# 快速开始

本指南帮助你使用 `sora` CLI 快速创建一个基于 HTTP 的微服务项目，并编写第一个 RPC 处理器。

## 前置条件

- Node.js >= 22.0.0

## 安装 CLI

```bash
npm install -g @sora-soft/cli
```

安装完成后，你可以通过 `sora` 命令使用 CLI 工具。

## 创建项目

```bash
sora new my-first-service
```

sora 框架提供了丰富的项目快速开始模板以适应不同的场景，可以根据自己的需求进行选择，这里我们先选择 `@sora-soft/http-server-template` 进行快速体验，该模板会基于内存服务发现（ram-discovery）创建一个单节点 HTTP 服务器：

```
$ sora new my-first-service
? Select a template @sora-soft/http-server-template - 单进程简单 HTTP 服务器
? Project name? my-first-service
? Description? 单进程示例 http 服务器
? Version? 1.0.0
? Author? yaya
? License? MIT
? OK? Yes
Project generated successfully
cd my-first-service && npm install
```

创建完成后进入项目目录并安装依赖：

```bash
cd my-first-service
npm install
```

## 生成配置文件

sora 框架提供了交互式模板配置文件生成功能，模板文件位于 `run/config.template.yml`。运行 `npm run config` 开始配置文件生成：

```
$ npm run config

> my-first-service@1.0.0 config
> sora config

生成 server 配置: run/config.template.yml -> run/config.yml
? project scope? my-first-service
? host ip? 127.0.0.1(Loopback Pseudo-Interface 1)
? port expose ip? 127.0.0.1(Loopback Pseudo-Interface 1)
? listen port? 8088
生成 command 配置: run/config-command.template.yml -> run/config-command.yml
```

## 启动服务

执行 `npm run dev` 启动服务：

```bash
npm run dev
```

服务器成功启动后，试试调用测试接口：

```bash
curl http://127.0.0.1:8088/http/test
```

响应：

```json
{"error":null,"result":{"result":"sora is here!"}}
```

恭喜你，第一个 HTTP 服务已经成功启动了！

## 添加一个 HTTP 接口

模板生成的 `HttpHandler` 中已经包含了 `test` 和 `paramsValid` 两个接口。我们在它基础上添加一个 `hello` 接口。

编辑 `src/app/handler/HttpHandler.ts`，在类中添加 `hello` 方法：

```typescript
import {Route} from '@sora-soft/framework';
import {guard} from '@sora-soft/typia-decorator';

// 在这里定义请求 payload 结构
export interface IReqHello {
  name: string;
}

/**
 * @soraExport route
 */
class HttpHandler extends Route {
  /**
   * 新增 hello 接口
   */
  @Route.method
  async hello(@guard body: IReqHello) {
    return { message: `Hello, ${body.name}!` };
  }
}

export {HttpHandler};
```

重启服务器（重新运行 `npm run dev`），然后调用新接口：

```bash
curl -X POST http://127.0.0.1:8088/http/hello \
  -H "Content-Type: application/json" \
  -d '{"name": "sora"}'
```

响应：

```json
{"error":null,"result":{"message":"Hello, sora!"}}
```

## 下一步

- [核心概念](/guide/core-concepts) — 理解 Runtime、Node、Service、Worker、Component 的层级关系
- [生命周期](/microservice/service-lifecycle) — 了解服务启动和关闭的完整时序
- [使用组件](/guide/components) — 添加和使用 Redis、Database 等外部服务组件
- [路由 (Route)](/rpc/route) — 深入了解 RPC 处理器的编写方式
