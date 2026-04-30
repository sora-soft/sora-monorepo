

import {StackUtility} from '../../utility/Utility.js';

export abstract class Scope<T> {
  constructor(id: string, store: T) {
    this.id_ = id;
    this.store_ = store;

    const targetClass = new.target || this.constructor;

    const stackLine = StackUtility.getInstantiationStack(targetClass);

    if (stackLine && stackLine.getFileName()) {
      this.stack_ = `${StackUtility.formatFileName(stackLine.getFileName()!)}:${stackLine.getLineNumber()}`;
    } else {
      this.stack_ = 'unknown';
    }
  }

  setStore(data: T) {
    this.store_ = data;
  }

  get store() {
    return this.store_;
  }

  get stack() {
    return this.stack_;
  }

  get id() {
    return this.id_;
  }

  protected id_: string;
  protected store_: T;
  protected stack_: string;
}
