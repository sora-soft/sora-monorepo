import {TypeGuard} from '@sora-soft/type-guard';
import os from 'os';

import type {INodeOptions, IServiceOptions, IWorkerOptions} from '../interface/config.js';
import type {INodeMetaData} from '../interface/discovery.js';
import type {INodeRunData, ServiceBuilder, WorkerBuilder} from '../interface/node.js';
import {Utility} from '../utility/Utility.js';
import type {Listener} from './rpc/Listener.js';
import {Runtime} from './Runtime.js';
import {Service} from './Service.js';

class Node extends Service {
  static registerWorker(name: string, builder: WorkerBuilder) {
    this.workerBuilder_.set(name, builder);
  }

  static workerFactory(name: string, options: IWorkerOptions) {
    const builder = this.workerBuilder_.get(name);
    if (!builder)
      return null;
    return builder(options);
  }

  static registerService(name: string, builder: ServiceBuilder) {
    this.serviceBuilder_.set(name, builder);
  }

  static serviceFactory(name: string, options: IServiceOptions) {
    const builder = this.serviceBuilder_.get(name);
    if (!builder)
      return null;
    return builder(options);
  }

  private static serviceBuilder_: Map<string, ServiceBuilder> = new Map();
  private static workerBuilder_: Map<string, WorkerBuilder> = new Map();

  constructor(options: INodeOptions, listeners: Listener[]) {
    super('node', options);
    TypeGuard.assert<INodeOptions>(options);
    this.nodeOptions_ = options;
    this.listeners_ = listeners;
  }

  async startup() {
    for (const listener of this.listeners_) {
      await this.installListener(listener);
    }
  }

  async shutdown() {}

  get nodeRunData(): INodeRunData {
    return Utility.deepCopy({
      providers: Runtime.pvdManager.getAllProviders().map((provider) => provider.metaData),
      components: Runtime.components.map(component => component.meta),
      node: Runtime.node.nodeStateData,
      scope: Runtime.scope,
      discovery: Runtime.discovery.info,
    });
  }

  get nodeStateData(): INodeMetaData {
    return Utility.deepCopy({
      id: this.id,
      alias: this.nodeOptions_.alias,
      host: os.hostname(),
      pid: process.pid,
      endpoints: this.listeners_.map(listener => listener.metaData),
      state: this.state,
      startTime: Runtime.startTime,
      versions: {
        framework: Runtime.version,
        app: Runtime.appVersion,
      },
    });
  }

  private nodeOptions_: INodeOptions;
  private listeners_: Listener[];
}

export {Node};
