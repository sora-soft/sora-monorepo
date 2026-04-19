import {v4 as uuid} from 'uuid';

import {WorkerState} from '../Enum.js';
import type {IWorkerOptions} from '../interface/config.js';
import type {IWorkerMetaData} from '../interface/discovery.js';
import type {JobExecutor} from '../utility/Executor.js';
import {Executor} from '../utility/Executor.js';
import type {ExError} from '../utility/ExError.js';
import {LifeCycle} from '../utility/LifeCycle.js';
import {Timer} from '../utility/Timer.js';
import {UnixTime, Utility} from '../utility/Utility.js';
import type {Component} from './Component.js';
import {Context} from './context/Context.js';
import {WorkerScope} from './context/scope/WorkerScope.js';
import {Logger} from './logger/Logger.js';
import type {Provider} from './rpc/provider/Provider.js';
import {Runtime} from './Runtime.js';

@Context.scopeClass
abstract class Worker {
  constructor(name: string, options: IWorkerOptions) {
    this.name_ = name;
    this.id_ = uuid();
    this.workerOptions_ = options;
    this.startTime_ = UnixTime.now();
    this.scope_ = new WorkerScope({worker: this});
    this.executor_ = new Executor(this.scope_);
  }

  // 连接component等准备工作
  protected abstract startup(): Promise<void>;
  async start() {
    this.lifeCycle_.setState(WorkerState.Pending);
    this.executor_.start();
    await this.startup().catch((err: ExError) => {
      this.onError(err);
    });
    this.lifeCycle_.setState(WorkerState.Ready);
  }

  protected abstract shutdown(reason: string): Promise<void>;
  async stop(reason: string) {
    this.lifeCycle_.setState(WorkerState.Stopping);
    this.intervalJobTimer_.clearAll();
    await this.executor_.stop();
    await this.shutdown(reason).catch((err: ExError) => {
      this.onError(err);
    });
    for (const provider of this.providerPool_.keys()) {
      await this.unregisterProvider(provider).catch((err: Error) => {
        Runtime.frameLogger.category.error(err, {event: 'unregister-provider', error: Logger.errorMessage(err)});
      });
    }
    for (const component of this.componentPool_.keys()) {
      await this.disconnectComponent(component).catch((err: Error) => {
        Runtime.frameLogger.category.error(err, {event: 'disconnect-component', error: Logger.errorMessage(err)});
      });
    }
    this.lifeCycle_.setState(WorkerState.Stopped);
  }

  async runCommand(...args: unknown[]) {
    return false;
  }

  protected async doJob<T>(executor: JobExecutor<T>) {
    return this.executor_.doJob<T>(executor);
  }

  protected async doJobInterval(executor: JobExecutor, timeMS: number) {
    while(true) {
      if (this.state > WorkerState.Ready)
        break;

      if (this.state !== WorkerState.Ready) {
        await this.intervalJobTimer_.timeout(timeMS);
        continue;
      }

      const startTime = Date.now();
      await this.doJob(executor).catch((err: Error) => {
        Runtime.frameLogger.category.error(err, {event: 'do-interval-job-error', error: Logger.errorMessage(err)});
      });
      const nextExecuteMS = timeMS + startTime - Date.now();
      if (nextExecuteMS > 0)
        await this.intervalJobTimer_.timeout(nextExecuteMS);
    }
  }

  public async registerProviders(providers: Provider[]) {
    for (const provider of providers) {
      await this.registerProvider(provider);
    }
  }

  public async registerProvider(provider: Provider) {
    Runtime.frameLogger.category.info({event: 'register-provider', id: this.id, name: this.name, provider: provider.name});

    this.providerPool_.set(provider.name, provider);

    await provider.startup();

    Runtime.frameLogger.category.info({event: 'provider-started', id: this.id, name: this.name, provider: provider.name});
  }

  public async unregisterProvider(name: string) {
    const provider = this.providerPool_.get(name);
    if (!provider)
      return;

    Runtime.frameLogger.category.info({event: 'unregister-provider', id: this.id, name: this.name, provider: name});

    await provider.shutdown();

    Runtime.frameLogger.category.info({event: 'provider-unregistered', id: this.id, name: this.name, provider: name});
  }

  public async connectComponents(components: Component[]) {
    for (const component of components) {
      await this.connectComponent(component);
    }
  }

  public async connectComponent(component: Component) {
    Runtime.frameLogger.category.info({event: 'connect-component', id: this.id, name: this.name, component: component.name, version: component.version});

    this.componentPool_.set(component.name, component);

    await component.start();

    Runtime.frameLogger.category.info({event: 'component-connected', id: this.id, name: this.name, component: component.name, version: component.version});
  }

  public async disconnectComponent(name: string) {
    const component = this.componentPool_.get(name);
    if (!component)
      return;

    Runtime.frameLogger.category.info({event: 'disconnect-component', id: this.id, name: this.name, component: name});

    this.componentPool_.delete(name);
    await component.stop();

    Runtime.frameLogger.category.info({event: 'component-disconnected', id: this.id, name: this.name, component: name});
  }

  public hasProvider(id: string) {
    return [...this.providerPool_].values().some(([_, p]) => p.id === id);
  }

  public hasComponent(id: string) {
    return [...this.componentPool_].values().some(([_, c]) => c.id === id);
  }

  protected onError(err: Error) {
    Runtime.frameLogger.category.error(err, {event: 'worker-on-error', error: Logger.errorMessage(err)});
    this.lifeCycle_.setState(WorkerState.Error);
    throw err;
  }

  get name() {
    return this.name_;
  }

  get state() {
    return this.lifeCycle_.state;
  }

  get isIdle() {
    return this.state === WorkerState.Ready && this.executor_.isIdle;
  }

  get stateSubject() {
    return this.lifeCycle_.stateSubject;
  }

  get lifeCycle() {
    return this.lifeCycle_;
  }

  get id() {
    return this.id_;
  }

  get executor() {
    return this.executor_;
  }

  get scope() {
    return this.scope_;
  }

  get metaData(): IWorkerMetaData {
    return Utility.deepCopy<IWorkerMetaData>({
      name: this.name,
      alias: this.workerOptions_.alias,
      state: this.state,
      id: this.id_,
      nodeId: Runtime.node.id,
      startTime: this.startTime_,
    });
  }

  protected lifeCycle_ = new LifeCycle<WorkerState>(WorkerState.Init, true);
  protected executor_: Executor;
  protected intervalJobTimer_: Timer = new Timer();
  protected startTime_: number;
  private name_: string;
  private id_: string;
  private componentPool_: Map<string/* name*/, Component> = new Map();
  private providerPool_: Map<string/* name*/, Provider> = new Map();
  private workerOptions_: IWorkerOptions;
  protected scope_: WorkerScope;
}

export {Worker};
