import {BehaviorSubject} from 'rxjs';

import type {IListenerMetaData, INodeMetaData, IServiceMetaData, IWorkerMetaData} from '../../interface/discovery.js';
import type {Election} from '../Election.js';

export interface IDiscoveryInfo {
  version: string;
  type: string;
}

abstract class Discovery {
  constructor() {}

  // 获取所有节点信息（本地与远端）
  abstract getAllServiceList(): Promise<IServiceMetaData[]>;
  abstract getServiceList(name: string): Promise<IServiceMetaData[]>;
  abstract getAllEndpointList(): Promise<IListenerMetaData[]>;
  abstract getEndpointList(service: string): Promise<IListenerMetaData[]>;
  abstract getNodeList(): Promise<INodeMetaData[]>;
  abstract getAllWorkerList(): Promise<IWorkerMetaData[]>;
  abstract getWorkerList(worker: string): Promise<IWorkerMetaData[]>;

  // 获取单个节点信息（本地与远端）
  abstract getServiceById(id: string): Promise<IServiceMetaData | undefined>;
  abstract getWorkerById(id: string): Promise<IWorkerMetaData | undefined>;
  abstract getNodeById(id: string): Promise<INodeMetaData | undefined>;
  abstract getEndpointById(id: string): Promise<IListenerMetaData | undefined>;

  // 注册本地信息
  abstract registerWorker(worker: IWorkerMetaData): Promise<void>;
  abstract registerService(service: IServiceMetaData): Promise<void>;
  abstract registerEndpoint(info: IListenerMetaData): Promise<void>;
  abstract registerNode(node: INodeMetaData): Promise<void>;
  abstract unregisterWorker(id: string): Promise<void>;
  abstract unregisterService(id: string): Promise<void>;
  abstract unregisterEndPoint(id: string): Promise<void>;
  abstract unregisterNode(id: string): Promise<void>;

  // 创建选举机
  abstract createElection(name: string): Election;

  protected abstract startup(): Promise<void>;
  protected abstract shutdown(): Promise<void>;

  async connect() {
    await this.startup();
  }

  async disconnect() {
    await this.shutdown();
    this.nodeSubject_.complete();
    this.workerSubject_.complete();
    this.serviceSubject_.complete();
    this.listenerSubject_.complete();
  }

  get serviceSubject() {
    return this.serviceSubject_;
  }

  get listenerSubject() {
    return this.listenerSubject_;
  }

  get workerSubject() {
    return this.workerSubject_;
  }

  get nodeSubject() {
    return this.nodeSubject_;
  }

  abstract get version(): string;

  abstract get info(): IDiscoveryInfo;
  protected serviceSubject_ = new BehaviorSubject<IServiceMetaData[]>([]);
  protected listenerSubject_ = new BehaviorSubject<IListenerMetaData[]>([]);
  protected nodeSubject_ = new BehaviorSubject<INodeMetaData[]>([]);
  protected workerSubject_ = new BehaviorSubject<IWorkerMetaData[]>([]);
}

export {Discovery};
