import 'reflect-metadata';

import {afterEach, describe, expect, it} from 'vitest';

import {WorkerState} from '../../Enum.js';
import {RamDiscovery} from '../../test/RamDiscovery.js';
import {MockListener} from '../../test/tools/mock/MockListener.js';
import {Component} from '../Component.js';
import {Node} from '../Node.js';
import {Runtime} from '../Runtime.js';
import {Service} from '../Service.js';
import {Worker} from '../Worker.js';

class TestService extends Service {
  protected async startup() {}
  protected async shutdown() {}
  get version() { return '1.0.0-test'; }
}

class TestWorker extends Worker {
  protected async startup() {}
  protected async shutdown() {}
  get version() { return '1.0.0-test'; }
}

class TestComponent extends Component {
  connected = false;
  protected async connect() { this.connected = true; }
  protected async disconnect() { this.connected = false; }
  protected setOptions() {}
  get version() { return '1.0.0-test'; }
}

async function resetRuntime() {
  const rt = Runtime as any;
  for (const [id] of [...(rt.workers_ || [])]) {
    const w = rt.workers_.get(id);
    if (w && w.state < WorkerState.Stopping) {
      await w.stop('reset').catch(() => {});
    }
  }
  for (const [id] of [...(rt.services_ || [])]) {
    if (id === rt.node_?.id) continue;
    const s = rt.services_.get(id);
    if (s && s.state < WorkerState.Stopping) {
      await s.stop('reset').catch(() => {});
    }
  }
  if (rt.node_ && rt.node_.state < WorkerState.Stopping) {
    await rt.node_.stop('reset').catch(() => {});
  }
  if (rt.discovery_) {
    await rt.discovery_.disconnect().catch(() => {});
  }
  rt.shutdownPromise_ = undefined;
  rt.services_ = new Map();
  rt.workers_ = new Map();
  rt.components_ = new Map();
  rt.node_ = undefined;
  rt.discovery_ = undefined;
  rt.pvdManager_ = undefined;
}

async function setupRuntime() {
  const discovery = new RamDiscovery();
  await discovery.connect();

  const callback = async () => null as any;
  const listener = new MockListener(callback, []);

  const node = new Node({alias: 'test-node'}, [listener]);
  await Runtime.loadConfig({scope: 'test'});
  await Runtime.startup(node, discovery);

  return {discovery, node};
}

describe('RuntimeShutdown', () => {
  afterEach(async () => {
    await resetRuntime();
  });

  it('should stop services and workers in parallel, node last', async () => {
    const {node} = await setupRuntime();

    const service = new TestService('svc-1', {alias: 's1'});
    await Runtime.installService(service);

    const worker = new TestWorker('wrk-1', {alias: 'w1'});
    await Runtime.installWorker(worker);

    expect(Runtime.services.length).toBeGreaterThanOrEqual(2);
    expect(Runtime.workers.length).toBe(1);

    await Runtime.shutdown();

    expect(service.state).toBe(WorkerState.Stopped);
    expect(worker.state).toBe(WorkerState.Stopped);
    expect(node.state).toBe(WorkerState.Stopped);
  });

  it('should be idempotent', async () => {
    await setupRuntime();

    await Runtime.shutdown();
    await Runtime.shutdown();

    const rt = Runtime as any;
    expect(rt.shutdownPromise_).toBeDefined();
  });

  it('should clear services and workers maps after shutdown', async () => {
    await setupRuntime();

    const service = new TestService('svc-clear', {alias: 'sc'});
    await Runtime.installService(service);

    const worker = new TestWorker('wrk-clear', {alias: 'wc'});
    await Runtime.installWorker(worker);

    await Runtime.shutdown();

    const rt = Runtime as any;
    expect(rt.services_.size).toBe(0);
    expect(rt.workers_.size).toBe(0);
  });

  it('should register and unregister components', async () => {
    await setupRuntime();

    const comp = new TestComponent();
    comp.loadOptions({});
    Runtime.registerComponent('db', comp);

    expect(Runtime.components.length).toBe(1);
    expect(Runtime.components[0].name).toBe('db');
    expect(comp.connected).toBe(false);
  });
});
