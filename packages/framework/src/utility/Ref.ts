import {BehaviorSubject} from 'rxjs';

import {RefError} from './LifeRef.js';

export class Ref {
  constructor() {
    this.count_ = 0;
    this.countSubject_ = new BehaviorSubject(0);
  }

  add() {
    this.count ++;
  }

  minus() {
    this.count --;
    if (this.count_ < 0)
      throw new RefError('ERR_REF_NEGATIVE', 'ref count negative');
  }

  set(value: number) {
    this.count = value;
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
}
