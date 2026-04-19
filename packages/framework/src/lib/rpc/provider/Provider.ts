import {BehaviorSubject, map} from 'rxjs';
import {v4} from 'uuid';

import {ConnectorState, ListenerState} from '../../../Enum.js';
import {RPCErrorCode} from '../../../ErrorCode.js';
import type {ILabels} from '../../../interface/config.js';
import type {IListenerMetaData} from '../../../interface/discovery.js';
import {type IListenerInfo, type IProviderMetaData, RPCSenderStatus} from '../../../interface/rpc.js';
import type {ExError} from '../../../utility/ExError.js';
import {LabelFilter} from '../../../utility/LabelFilter.js';
import {LifeRef} from '../../../utility/LifeRef.js';
import {QueueExecutor} from '../../../utility/QueueExecutor.js';
import {SubscriptionManager} from '../../../utility/SubscriptionManager.js';
import {NodeTime, Utility} from '../../../utility/Utility.js';
import {Context} from '../../context/Context.js';
import {WorkerScope} from '../../context/scope/WorkerScope.js';
import {Logger} from '../../logger/Logger.js';
import {Runtime} from '../../Runtime.js';
import type {ListenerCallback} from '../Listener.js';
import {Notify} from '../packet/Notify.js';
import {Request} from '../packet/Request.js';
import {Response} from '../packet/Response.js';
import type {Route} from '../Route.js';
import {RPCError} from '../RPCError.js';
import {ProviderAllConnectStrategy} from './ProviderAllConnectStrategy.js';
import type {ConvertRouteMethod, ConvertRPCRouteMethod, IRequestOptions, ProviderManager} from './ProviderManager.js';
import type {ProviderStrategy} from './ProviderStrategy.js';
import {RPCSender} from './RPCSender.js';

class Provider<T extends Route = Route> {
  constructor(name: string, filter: LabelFilter = new LabelFilter([]), strategy?: ProviderStrategy, manager: ProviderManager | null = null, callback?: ListenerCallback) {
    this.id_ = v4();
    this.name_ = name;
    this.filter_ = filter;
    this.routeCallback_ = callback;
    this.pvdManager_ = manager;
    this.strategy_ = strategy || new ProviderAllConnectStrategy();
    this.strategy_.init(this);
  }

  async shutdown() {
    await this.executor_.stop();

    await this.ref_.minus(async () => {
      this.subManager_.destroy();
      await Promise.all([...this.senders_].map(async ([_, sender]) => {
        await sender.destroy().catch((err: ExError) => {
          Runtime.frameLogger.error(`provider.${this.name_}`, err, {event: 'connector-off', error: Logger.errorMessage(err)});
        });
      }));

      this.pvdManager.removeProvider(this);
      this.senderSubject_.complete();
    }).catch((err: ExError) => {
      if (err.code === 'ERR_REF_NEGATIVE') {
        Runtime.frameLogger.warn(`provider.${this.name_}`, {event: 'duplicate-stop'});
        return;
      }
      throw err;
    });
  }

  async startup() {
    this.executor_.start();

    await this.ref_.add(async () => {
      this.pvdManager.addProvider(this);

      const sub = this.pvdManager.discovery.listenerSubject.pipe(
        map(listeners => listeners.filter((listener) => {
          return listener.targetName == this.name && this.filter_.isSatisfy(listener.labels);
        }))
      ).subscribe(async (listeners) => {
        await this.executor_.doJob(async () => {
          const keepListeners = listeners.filter((listener) =>{
            return [ListenerState.Ready, ListenerState.Stopping].includes(listener.state);
          });

          for (const listener of keepListeners) {
            const sender = this.getSenderByListenerId(listener.id);
            if (!sender) {
              await this.createSender(listener);
            } else {
              sender.updateTarget(listener);
            }
          }

          for (const sender of this.senderList_) {
            if (keepListeners.every(listener => listener.id !== sender.listenerId)) {
              await this.removeSender(sender);
            }
          }

          const availableListeners = listeners.filter((listener) => {
            return [ListenerState.Ready].includes(listener.state);
          });
          const selectedListeners = await this.strategy_.selectListener(this, availableListeners, this.senderList_).catch((err: ExError) => {
            Runtime.frameLogger.error(this.logCategory, err, {event: 'select-listener-error', error: Logger.errorMessage(err), name: this.name});
            return [];
          });

          for (const listener of selectedListeners) {
            const sender = this.getSenderByListenerId(listener.id);
            if (!sender)
              continue;

            sender.setStatus(RPCSenderStatus.Connect).catch(err => {
              Runtime.frameLogger.error(this.logCategory, err, {event: 'set-sender-status-error', error: Logger.errorMessage(err), id: sender.id, name: this.name});
            });
          }

          for (const sender of this.senderList_) {
            if (selectedListeners.every(l => l.id !== sender.listenerId)) {
              sender.setStatus(RPCSenderStatus.Disconnect).catch(err => {
                Runtime.frameLogger.error(this.logCategory, err, {event: 'set-sender-status-error', error: Logger.errorMessage(err), id: sender.id, name: this.name});
              });
            }
          }
        });
      });
      this.subManager_.register(sub);
    });
  }

  get name() {
    return this.name_;
  }

  get senders() {
    return this.senders_;
  }

  get isStarted() {
    const scope = Context.find(WorkerScope);
    if (scope && !scope.hasProvider(this.id))
      return false;
    return this.ref_.count > 0;
  }

  get rpc() {
    return (toId?: string | null) => {
      return new Proxy<ConvertRPCRouteMethod<T>>({} as ConvertRPCRouteMethod<T>, {
        get: (target, prop: string) => {
          if (!this.isStarted)
            throw new RPCError(RPCErrorCode.ErrRpcProviderNotAvailable, 'provider not available');

          return async (body: unknown, options: IRequestOptions = {}, rawResponse = false) => {
            const sender = await this.selectSender(toId);
            const request = new Request({
              service: this.name_,
              method: prop,
              payload: body || {},
              headers: options.headers || {},
            });
            const res = await sender.callRpc(
              request,
              options.timeout
            );
            const response = new Response(res);
            if (rawResponse) return response;
            return response.payload.result;
          };
        },
      });
    };
  }

  get notify() {
    return (toId?: string | null) => {
      return new Proxy<ConvertRouteMethod<T>>({} as ConvertRPCRouteMethod<T>, {
        get: (target, prop: string) => {
          if (!this.isStarted)
            throw new RPCError(RPCErrorCode.ErrRpcProviderNotAvailable, 'provider not started');

          return async (body: unknown, options: IRequestOptions = {}) => {
            const sender = await this.selectSender(toId);
            const notify = new Notify({
              service: this.name,
              method: prop,
              payload: body,
              headers: options.headers || {},
            });
            await sender.connector.sendNotify(notify);
          };
        },
      });
    };
  }

  get broadcast() {
    return () => {
      return new Proxy<ConvertRouteMethod<T>>({} as ConvertRouteMethod<T>, {
        get: (target, prop: string) => {
          if (!this.isStarted)
            throw new RPCError(RPCErrorCode.ErrRpcProviderNotAvailable, 'provider not available');

          return async (body: unknown, options?: IRequestOptions) => {
            const senders = [...this.senders_].map(([_, s]) => {
              return s;
            }).filter(s => s.isAvailable());

            await Promise.all(
              senders.map((s) => {
                if (!options) options = {};

                const notify = new Notify({
                  service: this.name,
                  method: prop,
                  payload: body,
                  headers: options.headers || {},
                });
                return s.connector.sendNotify(notify);
              })
            );
          };
        },
      });
    };
  }

  private async createSender(endpoint: IListenerMetaData) {
    const existed = this.getSenderByListenerId(endpoint.id);
    if (existed)
      return existed;

    const sender = new RPCSender(this, endpoint, this.routeCallback_);

    Runtime.frameLogger.success(this.logCategory, {
      event: 'sender-created',
      id: sender.id,
      listener: this.formatLogListener(endpoint),
      targetId: sender.targetId,
      name: this.name_,
    });

    this.senders_.set(sender.id, sender);
    this.senderSubject_.next([...this.senders_].map(([_, s]) => s));

    return sender;
  }

  private async selectSender(toId?: string | null): Promise<RPCSender> {
    const availableSenders = this.senderList_.filter(s => s.isAvailable());
    // 没有可用的 sender，看看是不是有正在连接的，等他连接完
    if (!availableSenders.length) {
      const connecting = this.senderList_.filter(s => s.connector.state === ConnectorState.Connecting);
      if (connecting.length) {
        await Promise.race(connecting.map(async (s) => {
          await s.connector.waitForReady(NodeTime.second(5));
          return s;
        })).catch(err => {
          throw new RPCError(RPCErrorCode.ErrRpcSenderNotFound, 'sender not found');
        });
        return this.selectSender(toId);
      }
    }

    const sender = await this.strategy_.selectSender(this, availableSenders, toId);
    if (!sender)
      throw new RPCError(RPCErrorCode.ErrRpcSenderNotFound, 'sender not found');

    return sender;
  }

  private async removeSender(sender: RPCSender) {
    Runtime.frameLogger.info(this.logCategory, {event: 'remove-sender', name: this.name_, id: sender.id, listenerId: sender.listenerId, targetId: sender.targetId});
    this.senders_.delete(sender.id);

    await sender.destroy();
  }

  isSatisfy(labels: ILabels) {
    return this.filter_.isSatisfy(labels);
  }

  getSender(targetId: string) {
    for (const sender of this.senderList_) {
      if (sender.targetId === targetId)
        return sender;
    }
    return null;
  }

  async randomSender() {
    const availableSenders = this.senderList_.filter(s => s.isAvailable());
    const sender = await this.strategy_.selectSender(this, availableSenders);
    if (!sender)
      throw new RPCError(RPCErrorCode.ErrRpcSenderNotFound, 'sender not found');

    return sender;
  }

  get metaData(): IProviderMetaData {
    return Utility.deepCopy({
      name: this.name,
      filter: this.filter_.filter,
      senders: this.senderList_.map(sender => sender.metaData),
    });
  }

  get senderSubject() {
    return this.senderSubject_;
  }

  private getSenderByListenerId(listenerId: string): RPCSender | null {
    for (const [, sender] of this.senders_) {
      if (sender.listenerId === listenerId) return sender;
    }
    return null;
  }

  private get senderList_() {
    return [...this.senders_].map(([_, sender]) => sender);
  }

  get logCategory() {
    return `provider.${this.name_}`;
  }

  private formatLogListener(listener: IListenerInfo) {
    return {protocol: listener.protocol, endpoint: listener.endpoint};
  }

  get pvdManager() {
    return this.pvdManager_ || Runtime.pvdManager;
  }

  get id() {
    return this.id_;
  }

  private id_: string;
  private name_: string;
  private senders_: Map<string /* sender id */, RPCSender> = new Map();
  private subManager_: SubscriptionManager = new SubscriptionManager();
  private filter_: LabelFilter;
  private routeCallback_: ListenerCallback | undefined;
  private ref_ = new LifeRef<void>();
  private pvdManager_: ProviderManager | null;
  protected strategy_: ProviderStrategy;
  protected senderSubject_ = new BehaviorSubject<RPCSender[]>([]);
  protected executor_ = new QueueExecutor();
}

export {Provider};
