import {Component, ExError, FrameworkErrorCode, type IComponentOptions, Logger, Runtime} from '@sora-soft/framework';
import {guard} from '@sora-soft/typia-decorator';
import {createClient, type RedisClientType} from 'redis';
import Redlock, {type EvalArg} from 'redlock';

import {RedisError} from './RedisError.js';

export interface IRedisComponentOptions extends IComponentOptions {
  url: string;
  database: number;
  username?: string;
  password?: string;
  name?: string;
  commandsQueueMaxLength?: number;
  disableOfflineQueue?: boolean;
  readonly?: boolean;
  legacyMode?: boolean;
  pingInterval?: number;
}

class RedlockClient implements Redlock.CompatibleRedisClient {
  constructor(client: RedisClientType) {
    this.client_ = client;
  }

  eval(args: EvalArg[], callback?: (err: Error | null, res: any) => void) {

    const script = args[0] as string;
    const numkeys = args[1] as number;
    const keys = args.slice(2, 2 + numkeys) as string[];
    const arg = args.slice(2 + numkeys).map(v => v.toString());

    this.client_.eval(script, {
      keys,
      arguments: arg,
    }).then((res) => {
      if (callback)
        callback(null, res);
    }).catch((err: Error) => {
      if (callback)
        callback(err, null);
    });
  }

  evalsha(hash: string, args: EvalArg[], callback?: (err: Error | null, res: any) => void) {
    const numkeys = args[0] as number;
    const keys = args.slice(1, 1 + numkeys) as string[];
    const arg = args.slice(1 + numkeys).map(v => v.toString());
    this.client_.evalSha(hash, {
      keys,
      arguments: arg,
    }).then((res) => {
      if (callback)
        callback(null, res);
    }).catch((err: Error) => {
      if (callback)
        callback(err, null);
    });
  }

  private client_: RedisClientType;
}

class RedisComponent extends Component {
  protected setOptions(@guard options: IRedisComponentOptions) {
    this.redisOptions_ = options;
  }

  protected async connect() {
    this.client_ = createClient(this.redisOptions_);
    this.client_.on('error', (err: ExError) => {
      Runtime.frameLogger.error(`component.${this.name}`, err, {event: 'redis-client-error', err: Logger.errorMessage(err)});
      this.client_ = null;
    });
    await this.client_.connect();
    await this.client_.ping();
  }

  protected async disconnect() {
    await this.client.disconnect();
    this.client_ = null;
  }

  createLock(options: Redlock.Options) {
    const client = new RedlockClient(this.client);
    return new Redlock([client], options);
  }

  get client() {
    if (!this.client_)
      throw new RedisError(FrameworkErrorCode.ErrComponentNotConnected, 'redis client is null');
    return this.client_;
  }

  async setJSON<T>(key: string, object: T, ttlMs?: number) {
    if (ttlMs)
      await this.client.set(key, JSON.stringify(object), {PX: ttlMs});
    else
      await this.client.set(key, JSON.stringify(object));
  }

  async getJSON<T>(key: string) {
    const content = await this.client.get(key);
    if (content)
      return JSON.parse(content) as T;
    return null;
  }

  get version() {
    return __VERSION__;
  }

  private redisOptions_?: IRedisComponentOptions;
  private client_?: RedisClientType | null;
}

export {RedisComponent};
