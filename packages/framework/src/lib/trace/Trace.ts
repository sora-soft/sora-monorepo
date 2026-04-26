import {AsyncLocalStorage} from 'node:async_hooks';

import type {TraceContext} from './TraceContext.js';

export class Trace {
  private static storage_ = new AsyncLocalStorage<TraceContext>();

  static run<R>(context: TraceContext, callback: () => R): R {
    return context.run(this.storage_, callback);
  }

  static current() {
    return this.storage_.getStore();
  }
}
