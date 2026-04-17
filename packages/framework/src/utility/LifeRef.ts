import {BehaviorSubject} from 'rxjs';

import {type ErrorArgs, ErrorLevel, ExError} from './ExError.js';

export type RefCallback<T> = () => Promise<T>;

export class RefError extends ExError {
  constructor(code: string, message: string, args?: ErrorArgs) {
    super(code, 'RefError', message, ErrorLevel.Unexpected, args || {});
    Error.captureStackTrace(this, this.constructor);
  }
}


export class LifeRef<T = unknown> {
  constructor() {
    this.count_ = 0;
    this.countSubject_ = new BehaviorSubject(0);
  }

  async add(callback: RefCallback<T>): Promise<T> {
    this.count ++;
    if (this.count_ > 1 && this.startPromise_) {
      return this.startPromise_;
    }

    this.startPromise_ = callback();
    return this.startPromise_;
  }

  async minus(callback: RefCallback<T>) {
    this.count --;
    if (this.count_ < 0)
      throw new RefError('ERR_REF_NEGATIVE', 'ref count negative');

    if (this.count_ > 0) {
      return this.stopPromise_;
    }

    this.stopPromise_ = callback();
    return this.stopPromise_;
  }

  async waitFor(value: number) {
    if (value === this.count_) {
      return;
    }

    return new Promise<void>((resolve) => {
      const sub = this.countSubject_.subscribe((v) => {
        if (v === value) {
          sub.unsubscribe();
          resolve();
        }
      });
    });
  }

  get count() {
    return this.count_;
  }

  private set count(value: number) {
    this.count_ = value;
    this.countSubject_.next(value);
  }

  private count_: number;
  private countSubject_: BehaviorSubject<number>;
  private startPromise_?: Promise<T>;
  private stopPromise_?: Promise<T>;
}
