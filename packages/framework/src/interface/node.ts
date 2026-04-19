import type {IDiscoveryInfo} from '../lib/discovery/Discovery.js';
import type {Service} from '../lib/Service.js';
import type {Worker} from '../lib/Worker.js';
import type {IComponentMetaData} from './component.js';
import type {IServiceOptions, IWorkerOptions} from './config.js';
import type {INodeMetaData} from './discovery.js';
import type {IProviderMetaData} from './rpc.js';

export interface INodeRunData {
  providers: IProviderMetaData[];
  node: INodeMetaData;
  components: IComponentMetaData[];
  discovery: IDiscoveryInfo;
}

export type ServiceBuilder<T extends IServiceOptions> = (options: T) => Service;
export type WorkerBuilder<T extends IWorkerOptions> = (options: T) => Worker;
