import typia from 'typia';

import {RPCHeader} from '../../Const.js';
import {OPCode} from '../../Enum.js';
import {RPCErrorCode} from '../../ErrorCode.js';
import type {IRawNetPacket, IRawReqPacket, IRawResPacket} from '../../interface/rpc.js';
import {ErrorLevel, ExError} from '../../utility/ExError.js';
import {Utility} from '../../utility/Utility.js';
import type {Waiter} from '../../utility/Waiter.js';
import {Context} from '../context/Context.js';
import {WorkerScope} from '../context/scope/WorkerScope.js';
import {Logger} from '../logger/Logger.js';
import {Runtime} from '../Runtime.js';
import {RpcServerTraceContext} from '../trace/context/RpcServerTraceContext.js';
import {Trace} from '../trace/Trace.js';
import type {Connector} from './Connector.js';
import type {ListenerCallback} from './Listener.js';
import {RouteError} from './RouteError.js';
import {RPCError} from './RPCError.js';

export class PacketHandler {
  static async handleNetPacket(data: IRawNetPacket, connector: Connector, callback?: ListenerCallback, responseWaiter?: Waiter<IRawResPacket<unknown>>) {
    switch (data.opcode) {
      case OPCode.Request: {
        const fromId = data.headers[RPCHeader.RpcFromIdHeader] as string | undefined;
        const traceParent = data.headers[RPCHeader.RPCTraceParent] as string | undefined;
        const traceState = data.headers[RPCHeader.RPCTraceState] as string | undefined;

        const context = RpcServerTraceContext.create(traceParent, traceState);
        await Trace.run(context, async () => {
          if (!callback) {
            Runtime.frameLogger.warn('connector', {event: 'connector-response-not-enabled', session: connector.session});
            return;
          }

          const rpcId = data.headers[RPCHeader.RpcIdHeader] as string | undefined;
          const headers: Record<string, any> = {
            [RPCHeader.RpcIdHeader]: rpcId,
          };

          const workerScope = Context.find(WorkerScope);
          if (workerScope) {
            headers[RPCHeader.RpcServiceId] = workerScope.id;
          }

          const createErrorResPacket = (err: ExError) => {
            return {
              opcode: OPCode.Response,
              headers,
              payload: {
                error: {
                  code: err.code || RPCErrorCode.ErrRpcUnknown,
                  level: err.level || ErrorLevel.Unexpected,
                  name: err.name,
                  message: err.message,
                  args: err.args,
                },
                result: null,
              },
            } as IRawResPacket<null>;
          };
          try {
            let ret: IRawResPacket<unknown> | null = null;

            if (!typia.is<IRawReqPacket>(data)) {
              ret = createErrorResPacket(new RouteError(RPCErrorCode.ErrRpcBodyParseFailed, 'invalid request packet format', ErrorLevel.Expected));
              await connector.send(ret);
              return;
            }

            ret = await callback(data, connector.session, connector);

            if (ret === null)
              return;

            if (ret) {
              ret.headers = {
                ...ret.headers,
                ...headers,
              };
              await connector.send(ret);
            } else {
              throw new RPCError(RPCErrorCode.ErrRpcEmptyResponse, 'rpc empty response');
            }
          } catch (e) {
            const err = ExError.fromError(e as Error);
            Runtime.frameLogger.error('connector', err, {event: 'event-handle-data', fromServiceId: fromId, error: Logger.errorMessage(err)});
            await connector.send(createErrorResPacket(err));
          }
        });

        break;
      }
      case OPCode.Notify: {
        const traceParent = data.headers[RPCHeader.RPCTraceParent] as string | undefined;
        const traceState = data.headers[RPCHeader.RPCTraceState] as string | undefined;

        const scope = RpcServerTraceContext.create(traceParent, traceState);

        await Trace.run(scope, async () => {
          if (!callback) {
            Runtime.frameLogger.warn('connector', {event: 'connector-response-not-enabled', session: connector.session});
            return;
          }
          if (!typia.is<IRawReqPacket>(data)) {
            Runtime.frameLogger.warn('connector', {event: 'parse-body-failed', data});
            return;
          }
          await callback(data, connector.session, connector).catch((err) => {
            Runtime.frameLogger.error('connector', err, {event: 'handle-notify-error', error: Logger.errorMessage(err)});
          });
        });
        break;
      }
      case OPCode.Response: {
        if (!typia.is<IRawResPacket>(data)) {
          Runtime.frameLogger.warn('connector', {event: 'parse-body-failed', data});
          return;
        }

        if (!responseWaiter) {
          Runtime.frameLogger.warn('connector', {event: 'receive-response-without-response-waiter', session: connector.session});
          return;
        }

        if (!data.headers[RPCHeader.RpcIdHeader])
          return;

        let rpcId = data.headers[RPCHeader.RpcIdHeader] as number | string | undefined;
        if (Utility.isUndefined(rpcId))
          throw new RPCError(RPCErrorCode.ErrRpcIdNotFound, 'rpc id not found');

        if (typia.is<string>(rpcId)) {
          rpcId = parseInt(rpcId, 10);
        }

        responseWaiter.emit(rpcId, data);
        break;
      }
    }
  }
}
