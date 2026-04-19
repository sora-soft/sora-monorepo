import {ErrorLevel, ExError, type IRawResPacket, type ListenerCallback, NodeTime, Notify, OPCode, type Provider, Request, Response, Route, RouteError, RPCError, RPCErrorCode, RPCHeader, RPCResponseError, Runtime, type Service} from '@sora-soft/framework';

import {AccountWorld} from '../../app/account/AccountWorld.js';
import {type AccountToken} from '../../app/database/Account.js';
import {AppErrorCode} from '../../app/ErrorCode.js';
import {type ServiceName} from '../../app/service/common/ServiceName.js';
import {AuthRPCHeader, ForwardRPCHeader} from '../Const.js';

type RouteMap = { [key in ServiceName]?: Provider<Route>};

class ForwardRoute<T extends Service = Service> extends Route {
  constructor(service: T, route: RouteMap) {
    super();
    this.service = service;
    this.routeProviderMap_ = new Map();
    for (const [name, value] of Object.entries(route)) {
      if (value) {
        this.routeProviderMap_.set(name, value);
      }
    }
  }

  private routeProviderMap_: Map<string, Provider<Route>>;
  private service: T;

  private getProvider(service: ServiceName) {
    if (!this.routeProviderMap_.has(service))
      throw new RPCError(RPCErrorCode.ErrRpcServiceNotFound, `ERR_RPC_SERVICE_NOT_FOUND, service=${service}`);

    const provider: Provider<Route> | undefined = this.routeProviderMap_.get(service);
    if (!provider)
      throw new RPCError(RPCErrorCode.ErrRpcProviderNotAvailable, `ERR_RPC_PROVIDER_NOT_AVAILABLE, service=${service}`);

    return provider;
  }

  private static async fetchIncomingToken(incoming: Notify | Request) {
    const authorizationHeader = incoming.getHeader('authorization');
    let authorization: string | null = null;
    if (authorizationHeader) {
      const [scheme, headerToken] = authorizationHeader.split(' ');
      if (scheme === 'sora-rpc-authorization' && headerToken) {
        authorization = headerToken;
      }
    }
    if (!authorization)
      authorization = incoming.getHeader(AuthRPCHeader.RPC_AUTHORIZATION) || null;

    let token: AccountToken | null = null;
    if (authorization) {
      token = await AccountWorld.getAccountSession(authorization);
    }

    return token;
  }

  static callback(route: ForwardRoute): ListenerCallback {
    return async (packet, session, connector): Promise<IRawResPacket | null> => {
      const startTime = Date.now();
      switch (packet.opcode) {
        case OPCode.Request: {
          const request = new Request(packet);
          const response = new Response<unknown>({
            headers: {},
            payload: {error: null, result: null},
          });

          try {
            if (!packet.service)
              throw new RouteError(RPCErrorCode.ErrRpcServiceNotFound, 'service is null', ErrorLevel.Expected, {service: packet.service});

            const service = request.service as ServiceName;
            const method = request.method;
            const token = await this.fetchIncomingToken(request);

            const rpcId = request.getHeader(RPCHeader.RpcIdHeader);
            request.setHeader(AuthRPCHeader.RPC_AUTHORIZATION, token?.session);
            request.setHeader(AuthRPCHeader.RPC_ACCOUNT_ID, token?.accountId.toString());
            request.setHeader(RPCHeader.RpcSessionHeader, session);
            Runtime.rpcLogger.debug('forward-route', {service: route.service.name, method: request.method, request: request.payload});

            response.setHeader(RPCHeader.RpcIdHeader, rpcId);
            response.setHeader(RPCHeader.RpcFromIdHeader, route.service.id);

            const provider = route.getProvider(service);


            const res: Response<unknown> = await (provider.rpc(route.service.id) as any)[method](request.payload, {
              headers: {
                [ForwardRPCHeader.RPC_GATEWAY_ID]: route.service.id,
                [ForwardRPCHeader.RPC_GATEWAY_SESSION]: session,
                [AuthRPCHeader.RPC_ACCOUNT_ID]: token ? token.accountId : null,
                [AuthRPCHeader.RPC_AUTHORIZATION]: token?.session,
              },
              timeout: NodeTime.second(60),
            }, true);
            response.payload = res.payload;
            Runtime.rpcLogger.debug('forward-route', {service: route.service.name, method: request.method, duration: Date.now() - startTime});
            return response.toPacket();
          } catch (err) {
            if (err instanceof ExError) {
              switch(err.level) {
                case ErrorLevel.Fatal:
                case ErrorLevel.Unexpected:
                  return this.makeErrorRPCResponse(request, response, new RouteError(AppErrorCode.ErrServerInternal, 'server internal', ErrorLevel.Unexpected, {method: request.method}));
                case ErrorLevel.Expected:
                case ErrorLevel.Silent:
                  return this.makeErrorRPCResponse(request, response, new RPCResponseError(err, request.method));
              }
            }
          }
        }
        case OPCode.Notify: {
          const notify = new Notify(packet);
          const token = await this.fetchIncomingToken(notify);

          notify.setHeader(RPCHeader.RpcSessionHeader, session);
          notify.setHeader(AuthRPCHeader.RPC_ACCOUNT_ID, token?.accountId.toString());
          notify.setHeader(AuthRPCHeader.RPC_AUTHORIZATION, token?.session);
          Runtime.rpcLogger.debug('forward-route', {service: route.service.name, method: notify.method});

          if (!packet.service)
            return null;

          const service = notify.service as ServiceName;
          const method = notify.method;

          const provider = route.getProvider(service);

          await (provider.notify(route.service.id) as any)[method](notify.payload, {
            headers: {
              [ForwardRPCHeader.RPC_GATEWAY_ID]: route.service.id,
              [ForwardRPCHeader.RPC_GATEWAY_SESSION]: session,
              [AuthRPCHeader.RPC_ACCOUNT_ID]: token ? token.accountId : null,
              [AuthRPCHeader.RPC_AUTHORIZATION]: token?.session,
            },
          });
          Runtime.rpcLogger.debug('forward-route', {service: route.service.name, method: notify.method, duration: Date.now() - startTime});
          return null;
        }
        default:
          return null;
      }
    };
  }
}

export {ForwardRoute};
