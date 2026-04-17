import {BehaviorSubject} from 'rxjs';

import {type ErrorArgs, ErrorLevel, ExError} from './ExError.js';
import {TimeoutError} from './TimeoutError.js';

class LifeCycleError extends ExError {
  constructor(code: string, message: string, args?: ErrorArgs) {
    super(code, 'LifeCycleError', message, ErrorLevel.Unexpected, args || {});
    Error.captureStackTrace(this, this.constructor);
  }
}

class LifeCycle<T extends number> {
  constructor(state: T, backTrackable = true) {
    this.state_ = state;
    this.backTrackable_ = backTrackable;
    this.stateSubject_ = new BehaviorSubject(state);
  }

  setState(state: T) {
    const preState = this.state;
    if (preState > state && !this.backTrackable_) {
      throw new LifeCycleError('ERR_LIFE_CYCLE_CAN_NOT_BACK_TACK', 'lifecycle backtrack denied', {preState, state});
    }
    if (preState === state)
      return;
    this.state_ = state;
    this.stateSubject_.next(state);
  }

  destroy() {
    this.stateSubject_.complete();
  }

  waitFor(state: T, ttlMs: number) {
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        sub.unsubscribe();
        reject(new TimeoutError());
      }, ttlMs);

      const sub = this.stateSubject_.subscribe((s) => {
        if (s === state) {
          clearTimeout(timer);
          resolve();
          sub.unsubscribe();
        }
      });
    });
  }

  get state() {
    if (this.state_ === null) {
      throw new LifeCycleError('ERR_LIFECYCLE_IS_DESTROYED', 'lifecycle destroyed');
    }
    return this.state_;
  }

  get stateSubject() {
    return this.stateSubject_;
  }

  private state_: T | null;
  private backTrackable_: boolean;
  private stateSubject_: BehaviorSubject<T>;
}

export {LifeCycle};
