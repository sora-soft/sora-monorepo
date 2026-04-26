import EventEmitter from 'node:events';

import {RetryErrorCode} from '../ErrorCode.js';
import {RetryEvent} from '../Event.js';
import type {IEventEmitter} from '../interface/event.js';
import {ErrorLevel, ExError} from './ExError.js';
import {Time} from './Time.js';

export class RetryError extends ExError {
  constructor(code: string, message: string) {
    super(code, 'RetryError', message, ErrorLevel.Unexpected, {});
    Object.setPrototypeOf(this, RetryError.prototype);
  }
}

export type RetryFunc<T> = (err: Error) => Promise<T>;
export type RetryExecutor<T> = () => Promise<T>;
interface IErrorEvent {
  [RetryEvent.Error]: (err: Error, nextRetry: number) => void;
  [RetryEvent.MaxRetryTime]: () => void;
}

export interface IRetryOptionsBase {
  maxRetryTimes: number;
}

export interface IRetryIncrementIntervalOptions extends IRetryOptionsBase {
  incrementInterval: true;
  maxRetryIntervalMS: number;
  minIntervalMS: number;
}

export interface IRetryFixedIntervalOptions extends IRetryOptionsBase {
  incrementInterval: false;
  intervalMS: number;
}

export type IRetryOptions = IRetryIncrementIntervalOptions | IRetryFixedIntervalOptions;
export const defaultRetryOptions: IRetryOptions = {
  maxRetryTimes: 0,
  incrementInterval: false,
  intervalMS: 1000,
};

class Retry<T> {
  constructor(executor: RetryExecutor<T>, options: IRetryOptions = defaultRetryOptions) {
    this.maxRetryTimes_ = options.maxRetryTimes;
    this.incrementInterval_ = options.incrementInterval;
    if (options.incrementInterval) {
      this.maxRetryIntervalMS_ = options.maxRetryIntervalMS;
      this.currentInterval_ = options.minIntervalMS;
    } else {
      this.intervalMS_ = options.intervalMS;
      this.currentInterval_ = this.intervalMS_;
    }

    this.count_ = 0;
    this.errorEmitter_ = new EventEmitter();
    this.executor_ = executor;
  }

  async doJob(): Promise<T> {
    this.count_ = 0;

    const retry = async (err: Error): Promise<T> => {
      this.count_++;
      this.errorEmitter_.emit(RetryEvent.Error, err, this.currentInterval_);
      if (this.count_ < this.maxRetryTimes_ || !this.maxRetryTimes_) {
        await Time.timeout(this.currentInterval_);
        if (this.incrementInterval_) {
          this.currentInterval_ = Math.min(this.maxRetryIntervalMS_ || 0, this.currentInterval_ * 2);
        }

        return this.executor_().catch((e: Error) => {
          return retry(e);
        });
      } else {
        this.errorEmitter_.emit(RetryEvent.MaxRetryTime);
        throw new RetryError(RetryErrorCode.ErrRetryTooManyRetry, 'retry exceeded max attempts');
      }
    };

    const res = await this.executor_().catch((err: Error) => {
      return retry(err);
    });
    return res;
  }

  get errorEmitter() {
    return this.errorEmitter_;
  }

  private maxRetryTimes_: number;
  private incrementInterval_: boolean;
  private intervalMS_?: number;
  private maxRetryIntervalMS_?: number;
  private currentInterval_: number;

  private count_: number;
  private errorEmitter_: IEventEmitter<IErrorEvent>;
  private executor_: RetryExecutor<T>;
}

export {Retry};
