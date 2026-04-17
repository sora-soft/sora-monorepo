import {v4} from 'uuid';

import {FrameworkErrorCode} from '../ErrorCode.js';
import type {IComponentMetaData, IComponentOptions} from '../interface/component.js';
import type {ExError} from '../utility/ExError.js';
import {FrameworkError} from '../utility/FrameworkError.js';
import {LifeRef} from '../utility/LifeRef.js';
import {Utility} from '../utility/Utility.js';
import {Logger} from './logger/Logger.js';
import {Runtime} from './Runtime.js';

abstract class Component {
  constructor() {
    this.id_ = v4();
    this.init_ = false;
    this.ref_ = new LifeRef();
    this.name_ = 'not-set';
    this.options_ = {};
  }

  protected abstract setOptions(options: IComponentOptions): void;
  loadOptions(options: IComponentOptions) {
    this.options_ = options;
    this.setOptions(options);
  }

  protected abstract connect(): Promise<void>;
  async start() {
    if (!this.options_)
      throw new FrameworkError(FrameworkErrorCode.ErrComponentOptionsNotSet, 'component options not set', {name: this.name_});

    await this.ref_.add(async () => {
      await this.connect().catch((err: ExError) => {
        Runtime.frameLogger.error(`component.${this.name_}`, err, {event: 'connect-component', error: Logger.errorMessage(err)});
        throw err;
      });
      Runtime.frameLogger.success(`component.${this.name_}`, {event: 'success-connect', options: this.options, version: this.version});
      this.init_ = true;
    });
  }

  protected abstract disconnect(): Promise<void>;
  async stop() {
    await this.ref_.minus(async () => {
      await this.disconnect().catch((err: ExError) => {
        Runtime.frameLogger.error(`component.${this.name_}`, err, {event: 'disconnect-component', error: Logger.errorMessage(err)});
      }).then(() => {
        Runtime.frameLogger.success(`component.${this.name_}`, {event: 'success-disconnect'});
      });
    }).catch((err: ExError) => {
      if (err.code === 'ERR_REF_NEGATIVE') {
        Runtime.frameLogger.warn(`component.${this.name_}`, {event: 'duplicate-stop'});
        return;
      }
      throw err;
    });
  }

  abstract get version(): string;

  get id() {
    return this.id_;
  }

  get name() {
    return this.name_;
  }

  set name(value: string) {
    this.name_ = value;
  }

  get ready() {
    return this.init_;
  }

  get options() {
    return this.options_;
  }

  get meta(): IComponentMetaData {
    return Utility.deepCopy({
      name: this.name_,
      ready: this.ready,
      version: this.version,
      options: this.options,
    });
  }

  protected id_: string;
  protected name_: string;
  protected options_: IComponentOptions;
  protected ref_: LifeRef<void>;
  private init_: boolean;
  // private ref_: number;
}

export {Component};
