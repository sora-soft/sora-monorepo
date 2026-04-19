import {TypeGuardError} from 'typia';

import {RPCHeader} from '../../Const.js';
import {OPCode} from '../../Enum.js';
import {RPCErrorCode} from '../../ErrorCode.js';
import {type IRawResPacket} from '../../interface/rpc.js';
import {ErrorLevel, ExError} from '../../utility/ExError.js';
import {Logger} from '../logger/Logger.js';
import {Runtime} from '../Runtime.js';
import {Connector} from './Connector.js';
import {type ListenerCallback} from './Listener.js';
import {Notify} from './packet/Notify.js';
import {Request} from './packet/Request.js';
import {Response} from './packet/Response.js';
import {RouteError} from './RouteError.js';

export type RPCHandler<Req=unknown, Res=unknown> = (body: Req, ...args: any) => Promise<Res>;
export type MethodPramBuilder<T=unknown, R extends Route = Route, Req=unknown, Res=unknown> = (route: R, body: Req, req: Request<Req> | Notify<Req>, response: Response<Res> | null, connector: Connector) => Promise<T>;
export interface IRPCHandlerParam<T=unknown, R extends Route = Route, Req=unknown, Res=unknown> {
  type: any;
  provider: MethodPramBuilder<T, R, Req, Res>;
}

export type RPCMiddleware<T extends Route = Route, Req = unknown, Res = unknown> = (
  route: T, body: Req, req: Request<Req> | Notify<Req>,
  response: Response<Res> | null, connector: Connector,
  next: () => Promise<unknown>
) => Promise<unknown>;
export interface IRPCHandler<Req=unknown, Res=unknown> {
  params: any[];
  handler: RPCHandler<Req, Res>;
}

export type NotifyHandler<Req = unknown> = (body: Req, ...args: any) => Promise<void>;
export interface INotifyHandler<Req=unknown> {
  params: any[];
  handler: NotifyHandler<Req>;
}

export enum MiddlewarePosition {
  Before = 'before',
  After = 'after',
}

class RouteSymbol {
  static MethodMapSymbol = Symbol('sora:method');
  static NotifyMapSymbol = Symbol('sora:notify');
  static ProviderSymbol = Symbol('sora:provider');
  static MiddlewareSymbol = Symbol('sora:middleware');
}

class Route {
  protected static method(target: Route, key: string) {
    const types = Reflect.getMetadata('design:paramtypes', target, key) as unknown[];
    Route.registerMethod(target, key, (target as any)[key] as RPCHandler, types);
  }

  protected static notify(target: Route, key: string) {
    const types = Reflect.getMetadata('design:paramtypes', target, key) as unknown[];

    Route.registerNotify(target, key, (target as any)[key] as NotifyHandler, types);
  }

  protected static registerMethod(target: Route, method: string, callback: RPCHandler, types: any[]) {
    let map = Reflect.getMetadata(RouteSymbol.MethodMapSymbol, target) as Map<string, IRPCHandler> | undefined;
    if (!map) {
      map = new Map();
    }
    map.set(method, {
      params: types,
      handler: callback,
    });
    Reflect.defineMetadata(RouteSymbol.MethodMapSymbol, map, target);
  }

  protected static registerNotify(target: Route, method: string, callback: NotifyHandler, types: any[]) {
    let map = Reflect.getMetadata(RouteSymbol.NotifyMapSymbol, target) as Map<string, INotifyHandler> | undefined;
    if (!map) {
      map = new Map();
    }
    map.set(method, {
      params: types,
      handler: callback,
    });
    Reflect.defineMetadata(RouteSymbol.NotifyMapSymbol, map, target);
  }

  protected static registerProvider<T=unknown, R extends Route = Route>(target: R, method: string, type: unknown, provider: MethodPramBuilder<T, R>) {
    let providers = Reflect.getMetadata(RouteSymbol.ProviderSymbol, target, method) as IRPCHandlerParam[] | undefined;
    if (!providers) {
      providers = [];
    }

    providers.push({
      type,
      provider: provider as MethodPramBuilder<unknown, Route>,
    });
    Reflect.defineMetadata(RouteSymbol.ProviderSymbol, providers, target, method);
  }

  protected static registerMiddleware<T extends Route = Route>(target: T, method: string, middleware: RPCMiddleware<T>) {
    let middlewares = Reflect.getMetadata(RouteSymbol.MiddlewareSymbol, target, method) as RPCMiddleware[] | undefined;
    if (!middlewares) {
      middlewares = [];
    }

    middlewares.push(middleware as RPCMiddleware);
    Reflect.defineMetadata(RouteSymbol.MiddlewareSymbol, middlewares, target, method);
  }

  protected static makeErrorRPCResponse(request: Request, response: Response, err: ExError) {
    response.payload = {
      error: {
        code: err.code || RPCErrorCode.ErrRpcUnknown,
        level: err.level || ErrorLevel.Unexpected,
        name: err.name,
        message: err.message,
        args: err.args,
      },
      result: null,
    };
    return response.toPacket();
  }

  static callback(route: Route): ListenerCallback {
    return async (packet, session, connector): Promise<IRawResPacket | null> => {
      switch (packet.opcode) {
        case OPCode.Request: {
          const request = new Request(packet);
          const response = new Response<unknown>({
            headers: {},
            payload: {error: null, result: null},
          });
          try {
            const rpcId = request.getHeader(RPCHeader.RpcIdHeader);
            request.setHeader(RPCHeader.RpcSessionHeader, session);
            Runtime.rpcLogger.category.debug({event: 'receive-rpc-request', method: request.method});

            response.setHeader(RPCHeader.RpcIdHeader, rpcId);

            if (!route.hasMethod(request.method))
              throw new RouteError(RPCErrorCode.ErrRpcMethodNotFound, 'method not found', ErrorLevel.Expected, {method: request.method});

            await route.callMethod(request.method, request, response, connector);
            Runtime.rpcLogger.category.debug({event: 'response-rpc-request', method: request.method});

            return response.toPacket();
          } catch (err) {
            Runtime.rpcLogger.category.error(err as Error, {event: 'rpc-handler-error', error: Logger.errorMessage(err as Error), method: request.method, request: request.payload});
            const exError = ExError.fromError(err as Error);
            return this.makeErrorRPCResponse(request, response, exError);
          }
        }

        case OPCode.Notify: {
          // notify 不需要回复
          const notify = new Notify(packet);
          notify.setHeader(RPCHeader.RpcSessionHeader, session);
          Runtime.rpcLogger.category.debug({event: 'receive-notify', method: notify.method});
          if (!route.hasNotify(notify.method))
            throw new RouteError(RPCErrorCode.ErrRpcMethodNotFound, 'notify not found', ErrorLevel.Expected, {method: notify.method});

          await route.callNotify(notify.method, notify, connector).catch((err: ExError) => {
            Runtime.frameLogger.category.error(err, {event: 'notify-handler', error: Logger.errorMessage(err), method: notify.method, request: notify.payload});
          });
          Runtime.rpcLogger.category.debug({event: 'handled-notify', method: notify.method});
          return null;
        }
        default: {
          // 不应该在路由处收到 rpc 回包消息
          return null;
        }
      }
    };
  }

  static compose(routes: Route[]): ListenerCallback {
    return async (packet, session, connector): Promise<IRawResPacket | null> => {
      switch(packet.opcode) {
        case OPCode.Request: {
          for (const route of routes) {
            if (route.hasMethod(packet.method)) {
              return this.callback(route)(packet, session, connector);
            }
          }
          break;
        }
        case OPCode.Notify: {
          for (const route of routes) {
            if (route.hasNotify(packet.method)) {
              return this.callback(route)(packet, session, connector);
            }
          }
          break;
        }
      }

      throw new RouteError(RPCErrorCode.ErrRpcMethodNotFound, 'method not found', ErrorLevel.Expected, {});
    };
  }

  constructor() {}

  protected async buildCallParams(method: string, paramTypes: any[], request: Request | Notify, response: Response | null, connector: Connector) {
    const params: unknown[] = await Promise.all(paramTypes.slice(1).map(async (type) => {
      switch(type) {
        case Connector:
          return connector;
        case Request:
          return request;
        case Response:
          return response;
        default:
          const prototype = Object.getPrototypeOf(this) as object;
          const providers = Reflect.getMetadata(RouteSymbol.ProviderSymbol, prototype, method) as IRPCHandlerParam[] | undefined;
          if (!providers)
            return null;

          const provider = providers.find(p => p.type === type);
          if (!provider)
            return null;

          return provider.provider(this, request.payload, request, response, connector);
      }
    }));

    params.unshift(request.payload);

    return params;
  }

  private async composeMiddleware(middlewares: RPCMiddleware[], request: Request | Notify, response: Response | null, connector: Connector, handler: () => Promise<unknown>) {
    let index = -1;
    const dispatch = async (i: number): Promise<unknown> => {
      if (i <= index) throw new Error('next() called multiple times');
      index = i;
      if (i >= middlewares.length) return handler();
      await middlewares[i](this, request.payload, request, response, connector, () => dispatch(i + 1));
    };
    await dispatch(0);
  }

  protected async callMethod(method: string, request: Request, response: Response, connector: Connector) {
    const prototype = Object.getPrototypeOf(this) as object;

    const map = Reflect.getMetadata(RouteSymbol.MethodMapSymbol, prototype) as Map<string, IRPCHandler> | undefined;
    if (!map) {
      throw new RouteError(RPCErrorCode.ErrRpcMethodNotFound, 'method not found', ErrorLevel.Expected, {method});
    }

    try {
      const handler = map.get(method);
      if (!handler) {
        throw new RouteError(RPCErrorCode.ErrRpcMethodNotFound, 'method not found', ErrorLevel.Expected, {method});
      }

      const middlewares = Reflect.getMetadata(RouteSymbol.MiddlewareSymbol, prototype, method) as RPCMiddleware[] || [];
      await this.composeMiddleware(middlewares, request, response, connector, async () => {
        const params = await this.buildCallParams(method, handler.params, request, response, connector);
        const result = await ((this as any)[method] as RPCHandler).apply(this, params as Parameters<RPCHandler>);
        response.payload = {
          error: null,
          result,
        };
      });
    } catch(e) {
      if (e instanceof TypeGuardError) {
        throw new RouteError(RPCErrorCode.ErrRpcParameterInvalid, e.message, ErrorLevel.Expected);
      }
      const err = ExError.fromError(e as Error);
      throw err;
    }
  }

  protected async callNotify(method: string, request: Notify, connector: Connector) {
    const prototype = Object.getPrototypeOf(this) as object;

    const map = Reflect.getMetadata(RouteSymbol.NotifyMapSymbol, prototype) as Map<string, INotifyHandler> | undefined;
    if (!map)
      throw new RouteError(RPCErrorCode.ErrRpcMethodNotFound, 'method not found', ErrorLevel.Expected, {method: request.method});

    try {
      const handler = map.get(method);
      if (!handler) {
        throw new RouteError(RPCErrorCode.ErrRpcMethodNotFound, 'method not found', ErrorLevel.Expected, {method: request.method});
      }

      const middlewares = Reflect.getMetadata(RouteSymbol.MiddlewareSymbol, prototype, method) as RPCMiddleware[] || [];
      await this.composeMiddleware(middlewares, request, null, connector, async () => {
        const params = await this.buildCallParams(method, handler.params, request, null, connector);
        await ((this as any)[method] as NotifyHandler).apply(this, params as Parameters<NotifyHandler>);
      });
    } catch (e) {
      if (e instanceof TypeGuardError) {
        throw new RouteError(RPCErrorCode.ErrRpcParameterInvalid, e.message, ErrorLevel.Expected);
      }
      const err = ExError.fromError(e as Error);
      throw err;
    }
  }

  protected hasMethod(method: string) {
    const prototype = Object.getPrototypeOf(this) as object;
    const map = Reflect.getMetadata(RouteSymbol.MethodMapSymbol, prototype) as Map<string, IRPCHandler> | undefined;
    return map?.has(method);
  }

  protected hasNotify(method: string) {
    const prototype = Object.getPrototypeOf(this) as object;
    const map = Reflect.getMetadata(RouteSymbol.NotifyMapSymbol, prototype) as Map<string, INotifyHandler> | undefined;
    return map?.has(method);
  }
}

export {Route};
