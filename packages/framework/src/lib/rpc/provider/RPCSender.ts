import {TimeoutError} from 'rxjs';
import {v4} from 'uuid';

import {RPCHeader} from '../../../Const.js';
import {ConnectorState} from '../../../Enum.js';
import {RPCErrorCode} from '../../../ErrorCode.js';
import type {IListenerMetaData} from '../../../interface/discovery.js';
import {type IRawNetPacket, type IRawResPacket, type ISenderMetaData, RPCSenderState, RPCSenderStatus} from '../../../interface/rpc.js';
import {ErrorTracer} from '../../../utility/ErrorTracer.js';
import {LifeCycle} from '../../../utility/LifeCycle.js';
import {QueueExecutor} from '../../../utility/QueueExecutor.js';
import {Ref} from '../../../utility/Ref.js';
import {Utility} from '../../../utility/Utility.js';
import {Waiter} from '../../../utility/Waiter.js';
import {Context} from '../../context/Context.js';
import {WorkerScope} from '../../context/scope/WorkerScope.js';
import {Logger} from '../../logger/Logger.js';
import {Runtime} from '../../Runtime.js';
import {RpcClientTraceContext} from '../../trace/context/RpcClientTraceContext.js';
import {Trace} from '../../trace/Trace.js';
import {TraceContext} from '../../trace/TraceContext.js';
import type {Codec} from '../Codec.js';
import type {Connector} from '../Connector.js';
import type {ListenerCallback} from '../Listener.js';
import {type Request} from '../packet/Request.js';
import {PacketHandler} from '../PacketHandler.js';
import {RPCError, RPCResponseError} from '../RPCError.js';
import type {Provider} from './Provider.js';

export class RPCSender {
  constructor(provider: Provider, target: IListenerMetaData, routeCallback?: ListenerCallback) {
    this.id_ = v4();
    this.target_ = Utility.deepCopy(target);
    this.provider_ = provider;
    this.statusExecutor_ = new QueueExecutor();
    this.statusExecutor_.start();

    this.ref_ = new Ref();
    this.status_ = RPCSenderStatus.Disconnect;
    this.lifeCycle_ = new LifeCycle<RPCSenderState>(RPCSenderState.Idle);
    this.connector_ = this.createConnector();
    this.codec_ = this.provider_.pvdManager.findAvailableCodec(target.codecs);
    this.routeCallback_ = routeCallback;

    if (!this.connector_ || !this.codec_) {
      this.lifeCycle_.setState(RPCSenderState.NotAvailable);
    }
  }

  updateTarget(target: IListenerMetaData) {
    this.target_ = Utility.deepCopy(target);
  }

  isAvailable() {
    if (this.lifeCycle_.state === RPCSenderState.NotAvailable)
      return false;

    if (![ConnectorState.Ready].includes(this.connector.state))
      return false;

    return !!this.connector_?.isAvailable();
  }

  addRef() {
    this.ref_.add();
  }

  minusRef() {
    this.ref_.minus();
  }

  getRefCount() {
    return this.ref_.count;
  }

  async setStatus(value: RPCSenderStatus) {
    if (this.status_ === value)
      return;

    this.status_ = value;
    await this.statusExecutor_.doJob(async () => {
      // 轮到执行的时候 status 已经被修改了就不执行了
      if (this.status_ !== value)
        return;

      switch(value) {
        case RPCSenderStatus.Connect: {
          this.connect().catch(err => {
            Runtime.rpcLogger.error('rpc.sender', err, {event: 'connect-error', error: Logger.errorMessage(err)});
          });
          break;
        }
        case RPCSenderStatus.Disconnect: {
          await this.ref_.waitFor(0);
          this.disconnect().catch(err => {
            Runtime.rpcLogger.error('rpc.sender', err, {event: 'disconnect-error', error: Logger.errorMessage(err)});
          });
          break;
        }
      }
    });
  }

  async destroy() {
    this.ref_.set(0);
    this.status_ = RPCSenderStatus.Disconnect;
    this.lifeCycle_.setState(RPCSenderState.Idle);
    await this.disconnect();
  }

  @ErrorTracer.trace
  public async callRpc<ResponsePayload>(request: Request, timeout = 10 * 1000): Promise<IRawResPacket<ResponsePayload>> {
    return Trace.run(RpcClientTraceContext.create(), async () => {
      const wait = this.resWaiter_.wait(timeout);
      request.setHeader(RPCHeader.RpcIdHeader, wait.id.toString());
      const workerScope = Context.find(WorkerScope);
      if (workerScope) {
        request.setHeader(RPCHeader.RpcFromIdHeader, workerScope.workerId);
      }
      // 符合 W3C 规范的 trace-context
      // https://www.w3.org/TR/trace-context/
      const traceScope = Context.find(TraceContext);
      if (traceScope) {
        request.setHeader(RPCHeader.RPCTraceParent, traceScope.toRPCTraceParentHeader());
        request.setHeader(RPCHeader.RPCTraceState, traceScope.toRPCTraceStateHeader());
      }

      await this.connector.send(request.toPacket());

      const res = await wait.promise.catch((err: Error) => {
        if (err instanceof TimeoutError)
          throw new RPCError(RPCErrorCode.ErrRpcTimeout, 'rpc timeout', {method: request.method, endpoint: this.target_?.endpoint || 'unknown'});
        throw err;
      });

      if (res.payload.error) {
        throw new RPCResponseError(res.payload.error, request.method);
      }

      return res as IRawResPacket<ResponsePayload>;
    });
  }

  private async connect() {
    if (!this.connector_)
      throw new RPCError(RPCErrorCode.ErrRpcConnectorNull, 'rpc sender connector is null');
    if (!this.codec_)
      throw new RPCError(RPCErrorCode.ErrRpcCodecNotFound, 'rpc sender codec is null');

    await this.connector_.start(this.target_, this.codec_);
  }

  private async disconnect() {
    if (!this.connector_)
      return;

    if (this.disconnectingPromise)
      return this.disconnectingPromise;

    const connector = this.connector_;
    this.disconnectingPromise = connector.off().finally(() => {
      this.disconnectingPromise = undefined;
    });

    return this.disconnectingPromise;
  }

  private reconnect() {
    this.recreateConnector();

    if (this.status_ === RPCSenderStatus.Connect || this.ref_.count > 0) {
      this.connect().catch(err => {
        Runtime.rpcLogger.error('rpc.sender', err, {event: 'connect-error', error: Logger.errorMessage(err)});
      });
    }
  }

  private recreateConnector() {
    this.connector_ = this.createConnector();
    this.lifeCycle_.setState(RPCSenderState.Idle);
  }

  private createConnector() {
    const connector = this.provider_.pvdManager.connectorFactory(this.target_);

    if (connector) {
      this.lifeCycle_.setState(RPCSenderState.Idle);

      const dataSub = connector.dataSubject.subscribe(async (packet) => {
        await this.handlePacket(packet, connector);
      });

      const stateSub = connector.stateSubject.subscribe(state => {
        if (this.connector_ !== connector)
          return;

        switch(state) {
          case ConnectorState.Pending:
          case ConnectorState.Connecting: {
            this.lifeCycle_.setState(RPCSenderState.Connecting);
            break;
          }
          case ConnectorState.Init: {
            this.lifeCycle_.setState(RPCSenderState.Idle);
            break;
          }

          case ConnectorState.Ready: {
            this.lifeCycle_.setState(RPCSenderState.Ready);
            break;
          }
          case ConnectorState.Stopping: {
            break;
          }
          case ConnectorState.Stopped:
          case ConnectorState.Error: {
            dataSub.unsubscribe();
            stateSub.unsubscribe();
            this.reconnect();
            break;
          }
        }
      });
    }

    return connector;
  }

  protected async handlePacket(data: IRawNetPacket, connector: Connector) {
    if (connector !== this.connector)
      return;

    await PacketHandler.handleNetPacket(data, connector, this.routeCallback_, this.resWaiter_);
  }

  get connector() {
    if (!this.connector_)
      throw new RPCError(RPCErrorCode.ErrRpcConnectorNull, 'rpc sender connector is null');
    return this.connector_;
  }

  get id() {
    return this.id_;
  }

  get listenerId() {
    return this.target_.id;
  }

  get targetId() {
    return this.target_.targetId;
  }

  get weight() {
    return this.target_.weight;
  }

  get metaData(): ISenderMetaData {
    return {
      id: this.id_,
      listenerId: this.target_.id,
      targetId: this.target_.targetId,
      weight: this.target_.weight,
      state: this.lifeCycle_.state,
      protocol: this.connector_?.protocol,
      codec: this.codec_?.code,
      status: this.status_,
    };
  }

  private id_: string;
  private target_: IListenerMetaData;
  private connector_: Connector | null;
  private provider_: Provider;
  private lifeCycle_: LifeCycle<RPCSenderState>;
  private codec_: Codec<any> | null;
  private ref_: Ref;
  private status_: RPCSenderStatus;
  private disconnectingPromise?: Promise<void>;
  private statusExecutor_: QueueExecutor;
  private routeCallback_?: ListenerCallback;
  private resWaiter_: Waiter<IRawResPacket> = new Waiter();
}
