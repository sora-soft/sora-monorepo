import 'reflect-metadata';

import {describe, expect, it} from '@jest/globals';

import {MockScope} from '../../../test/tools/mock/MockScope.js';
import {Context} from '../Context.js';
import {Scope} from '../Scope.js';
import {LogScope} from './LogScope.js';
import {WorkerScope} from './WorkerScope.js';

const mockWorker = {
  id: 'worker-abc',
  name: 'my-service',
  hasProvider: (id: string) => id === 'p1',
  hasComponent: (id: string) => id === 'c1',
};

describe('WorkerScope', () => {
  it('should have id from worker.id', () => {
    const scope = new WorkerScope({worker: mockWorker as any});
    expect(scope.id).toBe('worker-abc');
  });

  it('should have logCategory "service.{name}"', () => {
    const scope = new WorkerScope({worker: mockWorker as any});
    expect(scope.logCategory).toBe('service.my-service');
  });

  it('should store worker in store', () => {
    const scope = new WorkerScope({worker: mockWorker as any});
    expect(scope.store.worker).toBe(mockWorker);
  });

  it('should extend LogScope', () => {
    const scope = new WorkerScope({worker: mockWorker as any});
    expect(scope).toBeInstanceOf(LogScope);
  });

  it('should extend Scope', () => {
    const scope = new WorkerScope({worker: mockWorker as any});
    expect(scope).toBeInstanceOf(Scope);
  });

  it('should build chain when used in Context.run', () => {
    const scope = new WorkerScope({worker: mockWorker as any});
    Context.run(scope, () => {
      const chain = Context.chain();
      expect(chain).toHaveLength(2);
      expect(chain[0]).toBe(Context.root);
      expect(chain[1]).toBe(scope);
    });
  });

  it('should nest under another scope', () => {
    const parent = new MockScope();
    const scope = new WorkerScope({worker: mockWorker as any});
    Context.run(parent, () => {
      Context.run(scope, () => {
        const chain = Context.chain();
        expect(chain).toHaveLength(3);
        expect(chain[0]).toBe(Context.root);
        expect(chain[1]).toBe(parent);
        expect(chain[2]).toBe(scope);
      });
    });
  });

  it('should expose workerId', () => {
    const scope = new WorkerScope({worker: mockWorker as any});
    expect(scope.workerId).toBe('worker-abc');
  });

  it('should expose name', () => {
    const scope = new WorkerScope({worker: mockWorker as any});
    expect(scope.name).toBe('my-service');
  });

  it('should delegate hasProvider to worker', () => {
    const scope = new WorkerScope({worker: mockWorker as any});
    expect(scope.hasProvider('p1')).toBe(true);
    expect(scope.hasProvider('p2')).toBe(false);
  });

  it('should delegate hasComponent to worker', () => {
    const scope = new WorkerScope({worker: mockWorker as any});
    expect(scope.hasComponent('c1')).toBe(true);
    expect(scope.hasComponent('c2')).toBe(false);
  });
});
