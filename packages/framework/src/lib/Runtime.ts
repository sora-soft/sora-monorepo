
import {WorkerState} from '../Enum.js';
import {FrameworkErrorCode} from '../ErrorCode.js';
import type {IRuntimeOptions} from '../interface/config.js';
import type {ExError} from '../utility/ExError.js';
import {FrameworkError} from '../utility/FrameworkError.js';
import {Time} from '../utility/Time.js';
import {UnixTime} from '../utility/Utility.js';
import type {Component} from './Component.js';
import type {Discovery} from './discovery/Discovery.js';
import {FrameworkLogger} from './FrameworkLogger.js';
import {Logger} from './logger/Logger.js';
import type {Node} from './Node.js';
import {ProviderManager} from './rpc/provider/ProviderManager.js';
import {RPCLogger} from './rpc/RPCLogger.js';
import type {Service} from './Service.js';
import type {Worker} from './Worker.js';

class Runtime {
  static version = __VERSION__;
  static appVersion = '0.0.0';
  static startTime = UnixTime.now();
  static root = process.cwd();

  static get frameLogger() {
    return this.frameLogger_;
  }

  private static frameLogger_: FrameworkLogger = new FrameworkLogger();

  static get rpcLogger() {
    return this.rpcLogger_;
  }
  private static rpcLogger_: RPCLogger = new RPCLogger();

  static async loadConfig(options: IRuntimeOptions) {
    this.scope_ = options.scope;
    this.frameLogger.success('runtime', {event: 'load-config', config: options});
  }

  static async startup(node: Node, discovery: Discovery) {
    process.on('uncaughtException', (err: ExError) => {
      this.frameLogger_.error('runtime', err, {event: 'uncaught-exception', error: Logger.errorMessage(err)});
    });

    process.on('unhandledRejection', (err: ExError) => {
      this.frameLogger_.error('runtime', err, {event: 'uncaught-rejection', error: Logger.errorMessage(err)});
    });

    process.on('SIGINT', async () => {
      this.frameLogger_.info('process', {event: 'process-command', command: 'SIGINT'});
      await this.shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      this.frameLogger_.info('process', {event: 'process-command', command: 'SIGTERM'});
      await this.shutdown();
      process.exit(0);
    });

    this.discovery_ = discovery;
    await this.discovery_.connect().catch((err: ExError) => {
      this.frameLogger_.fatal('runtime', err, {event: 'connect-discovery', error: Logger.errorMessage(err)});
      process.exit(1);
    });

    this.pvdManager_ = new ProviderManager(discovery);

    this.node_ = node;
    await this.installService(node).catch((err: ExError) => {
      this.frameLogger_.fatal('runtime', err, {event: 'install-node', error: Logger.errorMessage(err)});
      process.exit(1);
    });

    await this.discovery_.registerNode(this.node_.nodeStateData).catch((err: ExError) => {
      this.frameLogger_.fatal('runtime', err, {event: 'register-node', error: Logger.errorMessage(err)});
      process.exit(1);
    });

    this.frameLogger_.success('framework', {event: 'start-runtime-success', discovery: discovery.info, node: node.metaData});
  }

  static async shutdown() {
    if (this.shutdownPromise_) {
      return this.shutdownPromise_;
    }

    this.shutdownPromise_ = new Promise(async (resolve) => {
      const servicePromises: Promise<unknown>[] = [];
      for (const [id, service] of [...this.services_]) {
        if (id === this.node_.id)
          continue;
        const promise = this.uninstallService(id, 'runtime_shutdown').catch((err: ExError) => {
          this.frameLogger_.error('runtime', err, {event: 'uninstall-service', error: Logger.errorMessage(err), id: service.id});
        });
        servicePromises.push(promise);
      }
      const servicePromise = Promise.all(servicePromises).then(() => {
        this.frameLogger_.info('runtime', {event: 'all-service-closed'});
      });

      const workerPromises: Promise<unknown>[] = [];
      for (const [id, worker] of [...this.workers_]) {
        const promise = this.uninstallWorker(id, 'runtime_shutdown').catch((err: ExError) => {
          this.frameLogger_.error('runtime', err, {event: 'uninstall-worker', error: Logger.errorMessage(err), id: worker.id});
        });
        workerPromises.push(promise);
      }
      const workerPromise = Promise.all(workerPromises).then(() => {
        this.frameLogger_.info('runtime', {event: 'all-worker-closed'});
      });

      await Promise.all([servicePromise, workerPromise]);

      await this.uninstallService(this.node_.id, 'runtime_shutdown').catch((err: ExError) => {
        this.frameLogger_.error('runtime', err, {event: 'uninstall-service', error: Logger.errorMessage(err), id: this.node.id});
      });

      await this.discovery_.disconnect();

      await Time.timeout(1000);

      this.frameLogger_.info('runtime', {event: 'discovery-disconnected'});

      resolve();
    });

    return this.shutdownPromise_;
  }

  static async installService(service: Service) {
    if (this.services_.has(service.id))
      return;
    this.services_.set(service.id, service);

    this.frameLogger.info('runtime', {event: 'service-starting', name: service.name, id: service.id});

    service.stateSubject.subscribe((state) => {
      if (state === WorkerState.Stopped) {
        this.discovery_.unregisterService(service.id).catch((err: ExError) => {
          Runtime.frameLogger.error('runtime', err, {event: 'discovery-unregister-worker', error: Logger.errorMessage(err), name: service.name, id: service.id});
        });
        return;
      }

      this.discovery_.registerService(service.metaData).catch((err: ExError) => {
        Runtime.frameLogger.error('runtime', err, {event: 'discovery-register-service', error: Logger.errorMessage(err), name: service.name, id: service.id});
      });
    });

    await this.discovery_.registerService(service.metaData);
    await service.start().catch((err: ExError) => {
      this.frameLogger_.error('runtime', err, {event: 'install-service-start', error: Logger.errorMessage(err), name: service.name, id: service.id});
      throw err;
    });

    this.frameLogger.success('runtime', {event: 'service-started', name: service.name, id: service.id});
  }

  static async installWorker(worker: Worker) {
    if (this.workers_.has(worker.id))
      return;

    this.workers_.set(worker.id, worker);

    this.frameLogger.info('runtime', {event: 'worker-starting', name: worker.name, id: worker.id});

    worker.stateSubject.subscribe((state) => {
      if (state === WorkerState.Stopped) {
        this.discovery_.unregisterWorker(worker.id).catch((err: ExError) => {
          Runtime.frameLogger.error('runtime', err, {event: 'discovery-unregister-worker', error: Logger.errorMessage(err), name: worker.name, id: worker.id});
        });
        return;
      }
      this.discovery_.registerWorker(worker.metaData).catch((err: ExError) => {
        Runtime.frameLogger.error('runtime', err, {event: 'discovery-register-worker', error: Logger.errorMessage(err), name: worker.name, id: worker.id});
      });
    });

    await this.discovery_.registerWorker(worker.metaData);
    await worker.start().catch((err: ExError) => {
      this.frameLogger_.error('runtime', err, {event: 'install-worker-start', error: Logger.errorMessage(err), name: worker.name, id: worker.id});
      throw err;
    });

    this.frameLogger.success('runtime', {event: 'worker-started', name: worker.name, id: worker.id});
  }

  static async uninstallWorker(id: string, reason: string) {
    const worker = this.workers_.get(id);
    if (!worker)
      return;

    this.frameLogger.info('runtime', {event: 'worker-stopping', name: worker.name, id: worker.id});

    this.workers_.delete(id);

    if (worker.state < WorkerState.Stopping)
      await worker.stop(reason).catch((err: ExError) => {
        this.frameLogger_.error('runtime', err, {event: 'uninstall-worker', error: Logger.errorMessage(err), name: worker.name, id: worker.id});
      });

    if (worker.state === WorkerState.Stopped)
      this.frameLogger.success('runtime', {event: 'worker-stopped', name: worker.name, id: worker.id, reason});
  }

  static async uninstallService(id: string, reason: string) {
    const service = this.services_.get(id);
    if (!service)
      return;

    this.frameLogger.info('runtime', {event: 'service-stopping', name: service.name, id: service.id});

    this.services_.delete(id);
    if (service.state < WorkerState.Stopping)
      await service.stop(reason).catch((err: ExError) => {
        this.frameLogger_.error('runtime', err, {event: 'uninstall-service', error: Logger.errorMessage(err), name: service.name, id: service.id});
      });

    if (service.state === WorkerState.Stopped)
      this.frameLogger.success('runtime', {event: 'service-stopped', name: service.name, id: service.id, reason});
  }

  static registerComponent(name: string, component: Component) {
    if (this.components_.has(name)) {
      const error = new FrameworkError(FrameworkErrorCode.ErrDuplicatedComponent, 'duplicated component', {name});
      this.frameLogger.error('runtime', error, {error: Logger.errorMessage(error)});
    }

    this.components_.set(name, component);
    component.name = name;
  }

  static getComponent<T extends Component>(name: string) {
    return this.components_.get(name) as T;
  }

  static get node() {
    return this.node_;
  }

  static get discovery() {
    return this.discovery_;
  }

  static get pvdManager() {
    return this.pvdManager_;
  }

  static get scope() {
    return this.scope_;
  }

  static get services() {
    return [...this.services_].map(([_, service]) => service);
  }

  static get workers() {
    return [...this.workers_].map(([_, worker]) => worker);
  }

  static get components() {
    return [...this.components_].map(([_, component]) => component);
  }

  private static node_: Node;
  private static discovery_: Discovery;
  private static pvdManager_: ProviderManager;
  private static scope_: string;
  private static services_: Map<string, Service> = new Map();
  private static workers_: Map<string, Worker> = new Map();
  private static components_: Map<string, Component> = new Map();
  private static shutdownPromise_: Promise<void>;
}

export {Runtime};
