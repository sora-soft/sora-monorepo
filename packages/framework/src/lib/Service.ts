import typia from 'typia';

import {ListenerState, WorkerState} from '../Enum.js';
import type {ILabels, IServiceOptions} from '../interface/config.js';
import type {IServiceMetaData, IServiceRunData} from '../interface/discovery.js';
import type {ExError} from '../utility/ExError.js';
import {QueueExecutor} from '../utility/QueueExecutor.js';
import {SubscriptionManager} from '../utility/SubscriptionManager.js';
import {Utility} from '../utility/Utility.js';
import type {WorkerScope} from './context/scope/WorkerScope.js';
import {Logger} from './logger/Logger.js';
import type {Listener} from './rpc/Listener.js';
import {Runtime} from './Runtime.js';
import {Worker} from './Worker.js';

abstract class Service extends Worker {
  constructor(name: string, options: IServiceOptions) {
    super(name, options);
    typia.assert<IServiceOptions>(options);
    this.serviceOptions_ = options;

    this.subManager_ = new SubscriptionManager();
    this.listenerPool_ = new Map();
    this.discoveryExecutor_ = new QueueExecutor();
    this.discoveryExecutor_.start();

    const sub = this.lifeCycle_.stateSubject.subscribe((state) => {
      Runtime.frameLogger.category.debug({event: 'service-state-change', state});

      switch (state) {
        case WorkerState.Error:
          for (const [id] of this.listenerPool_) {
            this.uninstallListener(id).catch((err: ExError) => {
              Runtime.frameLogger.category.error(err, {event: 'uninstall-listener-error', error: Logger.errorMessage(err)});
            });
          }
          break;
      }
    });
    this.subManager_.register(sub);
  }

  async stop(reason: string) {
    this.lifeCycle_.setState(WorkerState.Stopping);
    this.intervalJobTimer_.clearAll();
    for (const id of this.listenerPool_.keys()) {
      await this.uninstallListener(id).catch((err: ExError) => {
        Runtime.frameLogger.category.error(err, {event: 'service-uninstall-listener', error: Logger.errorMessage(err)});
      });
    }
    await this.executor_.stop();
    await this.shutdown(reason).catch((err: ExError) => {
      this.onError(err);
    });
    this.lifeCycle_.setState(WorkerState.Stopped);
    this.subManager_.destroy();
  }

  public async installListener(listener: Listener) {

    Runtime.frameLogger.category.info({event: 'install-listener', name: this.name, id: this.id, meta: listener.metaData, version: listener.version});

    await this.registerEndpoint(listener);

    const weightSub = listener.weightSubject.subscribe(async () => {
      await this.registerEndpoint(listener);
    });
    this.subManager_.register(weightSub);

    const stateSub = listener.stateSubject.subscribe(async (state) => {
      await this.registerEndpoint(listener);
      switch (state) {
        case ListenerState.Error: {
          Runtime.frameLogger.category.info({event: 'listener-err', name: this.name, id: this.id, listenerId: listener.id});
          this.uninstallListener(listener.id).catch((e: ExError) => {
            Runtime.frameLogger.error('service', e, {event: 'uninstall-listener', error: Logger.errorMessage(e)});
          });
          break;
        }
        case ListenerState.Stopped: {
          this.discoveryExecutor_.doJob(async () => {
            await Runtime.discovery.unregisterEndPoint(listener.id);
          }).catch((e: ExError) => {
            Runtime.frameLogger.category.error(e, {event: 'unregister-listener', error: Logger.errorMessage(e)});
          });
          break;
        }
      }
    });
    this.subManager_.register(stateSub);

    this.listenerPool_.set(listener.id, listener);

    await listener.startListen();

    Runtime.frameLogger.category.success({event: 'listener-started', name: this.name, id: this.id, meta: listener.metaData, version: listener.version});
  }

  public async registerEndpoint(listener: Listener) {
    await this.discoveryExecutor_.doJob(async () => {
      await Runtime.discovery.registerEndpoint(this.getListenerMetaData(listener));
    }).catch((e: ExError) => {
      Runtime.frameLogger.category.error(e, {event: 'register-endpoint', error: Logger.errorMessage(e)});
      throw e;
    });
  }

  public async registerEndpoints() {
    for (const [_, listener] of this.listenerPool_.entries()) {
      this.registerEndpoint(listener).catch(Utility.null);
    }
  }

  public async uninstallListener(id: string) {
    const listener = this.listenerPool_.get(id);
    if (!listener)
      return;

    Runtime.frameLogger.category.info({event: 'uninstall-listener', name: this.name, id: this.id, meta: listener.metaData});

    this.listenerPool_.delete(id);
    await listener.stopListen();

    Runtime.frameLogger.category.success({event: 'listener-stopped', name: this.name, id: this.id, meta: listener.metaData});
  }

  protected getListenerMetaData(listener: Listener) {
    const labels = {
      ...this.metaData.labels,
      ...listener.labels,
    };

    return {
      ...listener.metaData,
      id: listener.id,
      state: listener.state,
      targetId: this.id,
      targetName: this.name,
      weight: listener.weight,
      version: listener.version,
      labels,
    };
  }

  get metaData(): IServiceMetaData {
    return Utility.deepCopy({
      name: this.name,
      alias: this.serviceOptions_.alias,
      id: this.id,
      nodeId: Runtime.node.id,
      state: this.state,
      startTime: this.startTime_,
      labels: this.serviceOptions_.labels || [] as unknown as ILabels,
    });
  }

  get runData(): IServiceRunData {
    return Utility.deepCopy({
      ...this.metaData,
      listeners: [...this.listenerPool_].map(([_, listener]) => {
        return {
          ...listener.metaData,
          id: listener.id,
          state: listener.state,
          weight: listener.weight,
        };
      }),
    });
  }

  protected get listenerPool() {
    return this.listenerPool_;
  }

  private listenerPool_: Map<string/* id*/, Listener>;
  private discoveryExecutor_: QueueExecutor<WorkerScope>;
  private serviceOptions_: IServiceOptions;
  private subManager_: SubscriptionManager;
}

export {Service};
