import {Component, Context, ExError, FrameworkError, FrameworkErrorCode, type IComponentOptions, type IEventEmitter, Retry, RetryEvent, Runtime} from '@sora-soft/framework';
import {guard} from '@sora-soft/typia-decorator';
import {Etcd3, type IOptions, Lease, Lock} from 'etcd3';
import Event from 'node:events';
import path from 'node:path';

import {EtcdError, EtcdErrorCode} from './EtcdError.js';
import {EtcdEvent, type IEtcdEvent} from './EtcdEvent.js';

export type EtcdLockCallback<T> = (lock: Lock) => Promise<T>;

export interface IEtcdComponentOptions extends IComponentOptions {
  etcd: IOptions;
  ttl: number;
  prefix: string;
}

class EtcdComponent extends Component {
  constructor() {
    super();
    this.persistValues_ = new Map();
    this.emitter_ = new Event.EventEmitter();
    this.reconnecting_ = false;
    this.destroyed_ = false;
  }

  protected setOptions(@guard options: IEtcdComponentOptions) {
    this.etcdOptions_ = options;
  }

  protected async connect() {
    if (!this.etcdOptions_)
      throw new FrameworkError(FrameworkErrorCode.ErrComponentOptionsNotSet, 'etcd component options not set');

    this.destroyed_ = false;
    await this.createEtcdClient();
    await this.grantLease();
  }

  private async createEtcdClient() {
    this.etcd_?.close();
    this.etcd_ = new Etcd3({
      ...this.etcdOptions_!.etcd,
    });
  }

  async reconnect(err: Error) {
    if (this.reconnecting_ || this.destroyed_) {
      return;
    }
    this.reconnecting_ = true;

    Runtime.frameLogger.category.info({event: 'etcd-reconnecting', error: (err as ExError).code});

    try {
      const retry = new Retry<void>(async () => {
        if (this.destroyed_) {
          return;
        }

        this.lease_?.revoke().catch(() => {});
        this.lease_ = null;
        await this.createEtcdClient();
        await this.grantLease();

        if (!this.lease_) {
          throw new EtcdError(EtcdErrorCode.ErrEtcdLeaseNotFound, 'etcd lease not found');
        }

        const lease = this.lease_ as Lease;
        for (const [key, value] of this.persistValues_) {
          await lease.put(key).value(value).exec();
        }

        Runtime.frameLogger.category.info({event: 'etcd-reconnect-success'});
        this.emitter_.emit(EtcdEvent.LeaseReconnect, lease, err);
      }, {
        maxRetryTimes: 0,
        incrementInterval: true,
        minIntervalMS: 100,
        maxRetryIntervalMS: 30000,
      });

      retry.errorEmitter.on(RetryEvent.Error, (retryErr: Error, nextRetry: number) => {
        Runtime.frameLogger.category.error(ExError.fromError(retryErr), {event: 'etcd-reconnect-retry', nextRetry});
      });

      await retry.doJob();
    } catch (e) {
      Runtime.frameLogger.category.error(ExError.fromError(e as Error), {event: 'etcd-reconnect-failed'});
    } finally {
      this.reconnecting_ = false;
    }
  }

  async grantLease() {
    if (!this.etcdOptions_)
      throw new FrameworkError(FrameworkErrorCode.ErrComponentOptionsNotSet, 'etcd component options not set, may be missed in config');

    if (!this.etcd_)
      throw new FrameworkError(FrameworkErrorCode.ErrComponentNotConnected, 'component not connected');

    this.lease_ = this.etcd_.lease(this.etcdOptions_.ttl);
    await this.lease_.grant();

    this.lease_.on('lost', Context.wrap(async (err: Error) => {
      Runtime.frameLogger.category.warn({event: 'lease-lost', err});
      await this.reconnect(err);
    }));

    return this.lease_;
  }

  protected async disconnect() {
    this.destroyed_ = true;
    if (this.lease_) {
      try {
        await this.lease_.revoke();
      } catch {
        // lease may already be lost
      }
    }
    this.lease_ = null;
    if (this.etcd_) {
      this.etcd_.close();
    }
    this.etcd_ = null;
  }

  async lock<T>(key: string, callback: EtcdLockCallback<T>, ttlSec = 1): Promise<T> {
    if (!this.etcdOptions_)
      throw new FrameworkError(FrameworkErrorCode.ErrComponentOptionsNotSet, 'etcd component options not set');

    if (!this.etcd_)
      throw new FrameworkError(FrameworkErrorCode.ErrComponentNotConnected, 'component not connected');
    const lock = this.etcd_.lock([this.etcdOptions_.prefix, key].join('/')).ttl(ttlSec);
    return lock.do<T>(Context.wrap(() => callback(lock)));
  }

  async persistPut(key: string, value: string) {
    if (!this.lease_)
      throw new EtcdError(EtcdErrorCode.ErrEtcdLeaseNotFound, 'etcd lease not found');

    this.persistValues_.set(key, value);
    return this.lease_.put(key).value(value).exec();
  }

  async persistDel(key: string) {
    this.persistValues_.delete(key);
    return this.client.delete().key(key).exec();
  }

  keys(...args: string[]) {
    if (!this.etcdOptions_)
      throw new FrameworkError(FrameworkErrorCode.ErrComponentOptionsNotSet, 'etcd component options not set');

    return path.join(this.etcdOptions_.prefix, ...args);
  }

  get lease() {
    if (!this.lease_)
      throw new EtcdError(EtcdErrorCode.ErrEtcdLeaseNotFound, 'etcd lease not found');
    return this.lease_;
  }

  get client() {
    if (!this.etcd_)
      throw new FrameworkError(FrameworkErrorCode.ErrComponentNotConnected, 'component not connected');
    return this.etcd_;
  }

  get version() {
    return __VERSION__;
  }

  get emitter() {
    return this.emitter_;
  }

  get prefix() {
    if (!this.etcdOptions_)
      throw new FrameworkError(FrameworkErrorCode.ErrComponentOptionsNotSet, 'etcd component options not set');

    return this.etcdOptions_.prefix;
  }

  private etcd_?: Etcd3 | null;
  private etcdOptions_?: IEtcdComponentOptions;
  private lease_?: Lease | null;
  private emitter_: IEventEmitter<IEtcdEvent>;
  private persistValues_: Map<string, string>;
  private reconnecting_: boolean;
  private destroyed_: boolean;
}

export {EtcdComponent};
