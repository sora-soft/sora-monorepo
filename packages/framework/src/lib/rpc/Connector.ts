import {interval, Subject, type Subscription} from 'rxjs';
import typia from 'typia';

import {RPCHeader} from '../../Const.js';
import {ConnectorCommand, ConnectorState, OPCode} from '../../Enum.js';
import {FrameworkErrorCode, RPCErrorCode} from '../../ErrorCode.js';
import type {IConnectorOptions, IListenerInfo, IRawCommandPacket, IRawNetPacket} from '../../interface/rpc.js';
import {ErrorLevel, type ExError} from '../../utility/ExError.js';
import {FrameworkError} from '../../utility/FrameworkError.js';
import {LifeCycle} from '../../utility/LifeCycle.js';
import {SubscriptionManager} from '../../utility/SubscriptionManager.js';
import {NodeTime} from '../../utility/Utility.js';
import {Waiter} from '../../utility/Waiter.js';
import {Context} from '../context/Context.js';
import type {Scope} from '../context/Scope.js';
import {Logger} from '../logger/Logger.js';
import {Runtime} from '../Runtime.js';
import {Codec} from './Codec.js';
import {ConnectorError} from './ConnectorError.js';
import type {Notify} from './packet/Notify.js';
import {RPCError} from './RPCError.js';

@Context.scopeClass
abstract class Connector {
  constructor(options: IConnectorOptions) {
    this.options_ = options;
    this.subManager_ = new SubscriptionManager();
    this.dataSubject_ = new Subject();
    this.scope_ = Context.current();

    this.subManager_.register(this.lifeCycle_.stateSubject.subscribe((state) => {
      switch(state) {
        case ConnectorState.Ready: {
          this.enablePingPong();
          break;
        }
        case ConnectorState.Stopping: {
          this.disablePingPong();
          break;
        }
        case ConnectorState.Stopped: {
          // this.executor_.stop().catch(Utility.null);
          break;
        }
        case ConnectorState.Error: {
          this.disablePingPong();
          // this.executor_.stop().catch(Utility.null);
          break;
        }
      }
    }));
  }

  abstract isAvailable(): boolean;
  abstract get protocol(): string;

  async waitForReady(ttlMs: number) {
    return this.lifeCycle_.waitFor(ConnectorState.Ready, ttlMs);
  }

  protected abstract connect(target: IListenerInfo): Promise<void>;
  public async start(target: IListenerInfo, codec: Codec<any>) {
    if (this.lifeCycle_.state > ConnectorState.Init)
      return;

    this.codec_ = codec;
    this.target_ = target;
    this.lifeCycle_.setState(ConnectorState.Connecting);
    await this.connect(target).catch((err: ExError) => {
      this.onError(err);
      throw err;
    });
    this.lifeCycle_.setState(ConnectorState.Pending);
    // 由主动发起链接方选择 codec
    await this.selectCodec(codec.code);
    this.lifeCycle_.setState(ConnectorState.Ready);
  }

  abstract selectCodec(code: string): Promise<void>;
  async onCodecSelected(code: string) {
    const codec = Codec.get(code);
    if (!codec) {
      this.onError(new FrameworkError(FrameworkErrorCode.ErrCodecNotFound, 'codec not found', {code}));
      return;
    }

    if (!this.target_?.codecs.includes(code)) {
      this.target_?.codecs.push(code);
      await this.selectCodec(code);
    }

    this.codec_ = codec;
  }

  protected abstract disconnect(): Promise<void>;
  public async off() {
    const invalidState = [ConnectorState.Stopping, ConnectorState.Stopped];
    if (invalidState.includes(this.state))
      return;

    if (this.state < ConnectorState.Stopping)
      this.lifeCycle_.setState(ConnectorState.Stopping);

    await this.disconnect().catch((err: ExError) => {
      this.onError(err);
    });

    if (this.state < ConnectorState.Stopped)
      this.lifeCycle_.setState(ConnectorState.Stopped);

    this.lifeCycle_.destroy();
    this.subManager_.destroy();
  }

  private onError(err: Error) {
    this.lifeCycle_.setState(ConnectorState.Error);
    this.lifeCycle_.destroy();
    this.subManager_.destroy();
    Runtime.frameLogger.error('connector', err, {event: 'connector-error', error: Logger.errorMessage(err)});
  }

  abstract send<RequestPayload>(request: IRawNetPacket<RequestPayload>): Promise<void>;
  abstract sendRaw(request: object): Promise<void>;

  public async sendNotify(notify: Notify, fromId?: string | null): Promise<void> {
    if (fromId)
      notify.setHeader(RPCHeader.RpcFromIdHeader, fromId);
    await this.send(notify.toPacket());
  }

  public async sendCommand(command: ConnectorCommand, args?: unknown) {
    await this.send({
      opcode: OPCode.Command,
      command,
      args,
    });
  }

  protected async sendPing(id: number) {
    await this.sendCommand(ConnectorCommand.Ping, {id});
  }

  protected async sendPong(id: number) {
    await this.sendCommand(ConnectorCommand.Pong, {id});
  }

  protected enablePingPong() {
    if (this.pingSub_)
      return;

    if (!this.options_.ping.enabled)
      return;

    this.pingSub_ = interval(this.options_.ping.interval || NodeTime.second(10)).subscribe(async () => {
      if (!this.options_.ping.enabled)
        return;

      if (this.state !== ConnectorState.Ready)
        return;

      const {id, promise} = this.pongWaiter_.wait(this.options_.ping.timeout || NodeTime.second(5));
      await this.sendPing(id).catch((err: ExError) => {
        this.pongWaiter_.emitError(id, err);
      });
      await promise.catch((err: ExError) => {
        this.onPingError(err);
      });
    });
  }

  protected onPingError(err: ExError) {
    if (this.state !== ConnectorState.Ready)
      return;
    const error = new ConnectorError(RPCErrorCode.ErrRpcPingError, 'connector ping error', ErrorLevel.Unexpected, {message: err.message});
    this.onError(error);
  }

  protected disablePingPong() {
    if (!this.pingSub_)
      return;

    this.pingSub_.unsubscribe();
    this.pongWaiter_.clear();
    this.pingSub_ = null;
  }

  protected async handleIncomeMessage(data: IRawNetPacket) {
    switch (data.opcode) {
      case OPCode.Request:
      case OPCode.Response:
      case OPCode.Notify: {
        this.dataSubject_.next(data);
        break;
      }
      case OPCode.Command: {
        if (!typia.is<IRawCommandPacket>(data)) {
          Runtime.frameLogger.warn('connector', {event: 'parse-body-failed', data});
          return;
        }
        this.handleCommand(data.command as ConnectorCommand, data.args).catch((err: ExError) => {
          Runtime.frameLogger.error('connector', err, {event: 'handle-command-error', error: Logger.errorMessage(err)});
        });

        break;
      }
      default: {
        const error = new RPCError(RPCErrorCode.ErrRpcNotSupportOpcode, 'unsupported opcode');
        Runtime.frameLogger.error('connector', error, {event: 'opcode-not-support', opCode: (data as any).opcode});
        break;
      }
    }
  }

  protected async handleCommand(command: ConnectorCommand, args: unknown) {
    const logBlackList = [ConnectorCommand.Ping, ConnectorCommand.Pong];
    if (!logBlackList.includes(command))
      Runtime.frameLogger.info('connector', {event: 'connector-command', command, args});
    switch(command) {
      case ConnectorCommand.Error:
        const error = args as ExError;
        this.onError(error);
        break;
      case ConnectorCommand.Off:
        this.off().catch((err: ExError) => {
          Runtime.frameLogger.error('connector', err, {event: 'connect-off-error', error: Logger.errorMessage(err)});
        });
        break;
      case ConnectorCommand.Ping: {
        const data = args as {id: number};
        this.sendPong(data.id).catch((err: ExError) => {
          Runtime.frameLogger.error('connector', err, {event: 'send-pong-error', error: Logger.errorMessage(err), target: this.target_});
        });
        break;
      }
      case ConnectorCommand.Pong: {
        const data = args as {id: number};
        if (this.pongWaiter_)
          this.pongWaiter_.emit(data.id);
        break;
      }
      default:
        break;
    }
  }

  get state() {
    return this.lifeCycle_.state;
  }

  get stateSubject() {
    return this.lifeCycle_.stateSubject;
  }

  get session() {
    return this.session_;
  }

  set session(value: string | undefined) {
    this.session_ = value;
  }

  get target() {
    return this.target_;
  }

  get dataSubject() {
    return this.dataSubject_;
  }

  get scope() {
    return this.scope_;
  }

  protected lifeCycle_: LifeCycle<ConnectorState> = new LifeCycle<ConnectorState>(ConnectorState.Init, false);
  protected target_?: IListenerInfo;
  protected codec_?: Codec<any>;
  protected session_: string | undefined;
  private scope_: Scope<unknown>;
  private pongWaiter_: Waiter<void> = new Waiter();
  private pingSub_: Subscription | null = null;
  private options_: IConnectorOptions;
  private subManager_: SubscriptionManager;
  private dataSubject_: Subject<IRawNetPacket>;
}

export {Connector};

