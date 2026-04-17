import {FrameworkErrorCode} from '../../ErrorCode.js';
import type {IServiceOptions, IWorkerOptions} from '../../interface/config.js';
import type {ExError} from '../../utility/ExError.js';
import {FrameworkError} from '../../utility/FrameworkError.js';
import {Logger} from '../logger/Logger.js';
import {Node} from '../Node.js';
import {Route} from '../rpc/Route.js';
import {Runtime} from '../Runtime.js';

export interface IReqCreateService {
  name: string;
  options: IServiceOptions;
}

export interface IReqCreateWorker {
  name: string;
  options: IWorkerOptions;
}

export interface IReqRemoveWorker {
  id: string;
  reason: string;
}

class NodeHandler extends Route {
  constructor(node: Node) {
    super();
    this.node_ = node;
  }

  @Route.method
  async createService(body: IReqCreateService) {
    if (body.name === 'node')
      throw new FrameworkError(FrameworkErrorCode.ErrNodeServiceCannotBeCreated, 'node service cannot be created');

    const service = Node.serviceFactory(body.name, body.options);
    if (!service)
      throw new FrameworkError(FrameworkErrorCode.ErrServiceNotFound, 'service not found in factory', {name: body.name});
    await Runtime.installService(service);
    return {id: service.id};
  }

  @Route.method
  async createWorker(body: IReqCreateWorker) {
    const worker = Node.workerFactory(body.name, body.options);
    if (!worker)
      throw new FrameworkError(FrameworkErrorCode.ErrWorkerNotFound, 'worker not found', {name: body.name});
    await Runtime.installWorker(worker);
    return {id: worker.id};
  }

  @Route.method
  async removeService(body: IReqRemoveWorker) {
    if (body.id === this.node_.id)
      throw new FrameworkError(FrameworkErrorCode.ErrNodeServiceCannotBeClosed, 'node service cannot be closed');
    Runtime.uninstallService(body.id, body.reason).catch((err: ExError) => {
      Runtime.frameLogger.error(`${this.node_.name}.handler`, err, {event: 'uninstall-service-error', error: Logger.errorMessage(err)});
    });
    return {};
  }

  @Route.method
  async removeWorker(body: IReqRemoveWorker) {
    Runtime.uninstallWorker(body.id, body.reason).catch((err: ExError) => {
      Runtime.frameLogger.error(`${this.node_.name}.handler`, err, {event: 'uninstall-worker-error', error: Logger.errorMessage(err)});
    });
    return {};
  }

  @Route.method
  async shutdown() {
    Runtime.shutdown().catch((err: ExError) => {
      Runtime.frameLogger.error(`${this.node_.name}.handler`, err, {event: 'shutdown-error', error: Logger.errorMessage(err)});
    });
    return {};
  }

  @Route.method
  async fetchRunningData() {
    return this.node_.nodeRunData;
  }

  private node_: Node;
}

export {NodeHandler};
