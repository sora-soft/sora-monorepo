import type {Worker} from '../../Worker.js';
import {LogScope} from './LogScope.js';

export interface IWorkerScopeStore {
  worker: Worker;
}

export class WorkerScope extends LogScope<IWorkerScopeStore> {
  constructor(store: IWorkerScopeStore) {
    super(store.worker.id, store);
  }

  hasProvider(id: string) {
    return this.store_.worker.hasProvider(id);
  }

  hasComponent(id: string) {
    return this.store_.worker.hasComponent(id);
  }

  get name() {
    return this.store_.worker.name;
  }

  get workerId() {
    return this.store_.worker.id;
  }

  get logCategory() {
    return `service.${this.store.worker.name}`;
  }
}
