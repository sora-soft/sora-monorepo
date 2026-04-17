import {BehaviorSubject, Subject} from 'rxjs';
import {v4 as uuid} from 'uuid';

import {ConnectorCommand, ConnectorState, ListenerState} from '../../Enum.js';
import type {ILabels} from '../../interface/config.js';
import type {IListenerInfo, IRawReqPacket, IRawResPacket} from '../../interface/rpc.js';
import {type ExError} from '../../utility/ExError.js';
import {LifeCycle} from '../../utility/LifeCycle.js';
import {SubscriptionManager} from '../../utility/SubscriptionManager.js';
import {Context} from '../context/Context.js';
import type {Scope} from '../context/Scope.js';
import {Logger} from '../logger/Logger.js';
import {Runtime} from '../Runtime.js';
import type {Codec} from './Codec.js';
import type {Connector} from './Connector.js';
import {PacketHandler} from './PacketHandler.js';

export enum ListenerConnectionEventType {
  NewConnection = 'new-connection',
  LostConnection = 'lost-connection',
}

export interface IListenerConnectionEvent {
  type: ListenerConnectionEventType;
  connector: Connector;
  session: string;
}

export type ListenerCallback<Req=unknown, Res=unknown> = (data: IRawReqPacket<Req>, session: string | undefined, connector: Connector) => Promise<IRawResPacket<Res> | null>;

@Context.scopeClass
abstract class Listener {
  constructor(callback: ListenerCallback, codecs: Codec<any>[], labels: ILabels = {}) {
    this.callback_ = callback;
    this.id_ = uuid();
    this.codecs_ = codecs;
    this.labels_ = labels;
    this.weight_ = 100;
    this.weightSubject_ = new BehaviorSubject(this.weight);
    this.subManager_ = new SubscriptionManager();
  }

  protected abstract listen(): Promise<IListenerInfo>;

  public async startListen() {
    this.scope_ = Context.current();
    this.lifeCycle_.setState(ListenerState.Pending);
    this.info_ = await this.listen().catch((err: ExError) => {
      this.onError(err);
      throw err;
    });
    this.lifeCycle_.setState(ListenerState.Ready);
  }

  protected abstract shutdown(): Promise<void>;

  public async stopListen() {
    this.lifeCycle_.setState(ListenerState.Stopping);
    this.closeAllConnector();
    await this.shutdown();
    this.lifeCycle_.setState(ListenerState.Stopped);
    this.subManager_.destroy();
    this.lifeCycle_.destroy();
  }

  protected newConnector(session:string, connector: Connector) {
    connector.session = session;
    this.connectors_.set(session, connector);

    const dataSub = connector.dataSubject.subscribe(async (data) => {
      if (!this.connectors.has(session)) {
        return;
      }

      await PacketHandler.handleNetPacket(data, connector, this.callback_);
    });

    const stateSub = connector.stateSubject.subscribe((state) => {
      switch (state) {
        case ConnectorState.Error:
        case ConnectorState.Stopped: {
          if (!connector.session)
            return;
          if (this.connectors_.delete(connector.session)) {
            stateSub.unsubscribe();
            dataSub.unsubscribe();
            connector.off().catch((err: ExError) => {
              Runtime.rpcLogger.error('listener', err, {event: 'listener-connector-off-error', error: Logger.errorMessage(err)});
            });
            this.connectionSubject_.next({
              type: ListenerConnectionEventType.LostConnection,
              connector,
              session,
            });
          }
          break;
        }
      }
    });

    this.connectionSubject.next({
      type: ListenerConnectionEventType.NewConnection,
      connector,
      session,
    });
  }

  protected closeAllConnector() {
    for (const [_, connector] of [...this.connectors_]) {
      connector.sendCommand(ConnectorCommand.Off, {}).catch(() => {});
    }
  }

  public getConnector(session: string) {
    return this.connectors_.get(session);
  }

  public setWeight(weight: number) {
    if (weight < 0)
      throw TypeError('listener weight should larger than 0');
    this.weight_ = weight;
    this.weightSubject_.next(weight);
  }

  private onError(err: Error) {
    void this.lifeCycle_.setState(ListenerState.Error);
    throw err;
  }

  get info() {
    return this.info_;
  }

  get stateSubject() {
    return this.lifeCycle_.stateSubject;
  }

  get weightSubject() {
    return this.weightSubject_;
  }

  get state() {
    return this.lifeCycle_.state;
  }

  get weight() {
    return this.weight_;
  }

  get id() {
    return this.id_;
  }

  get labels() {
    const protocol = this.info_ ? this.info_.protocol : null;
    if (protocol)
      return {
        protocol,
        ...this.labels_,
      };
    else
      return this.labels_;
  }

  get connectionSubject() {
    return this.connectionSubject_;
  }

  get connectors() {
    return this.connectors_;
  }

  get scope() {
    return this.scope_;
  }

  abstract get version(): string;

  abstract get metaData(): IListenerInfo;

  protected connectionSubject_: Subject<IListenerConnectionEvent> = new Subject();
  protected codecs_: Codec<any>[];
  protected lifeCycle_ = new LifeCycle<ListenerState>(ListenerState.Init, false);
  protected weightSubject_: BehaviorSubject<number>;
  protected connectors_: Map<string, Connector> = new Map();
  protected callback_: ListenerCallback;
  private info_?: IListenerInfo;
  private id_: string;
  private labels_: ILabels;
  private weight_: number;
  private subManager_: SubscriptionManager;
  private scope_?: Scope<unknown>;
}

export {Listener};
