
import type {AsyncLocalStorage} from 'node:async_hooks';

import {StackUtility} from '../../utility/Utility.js';
import {Context} from './Context.js';

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

  run<R>(storage: AsyncLocalStorage<Scope<unknown>>, callback: () => R): R {
    if (this.isInChain(this.id)) {
      return callback();
    }

    this.parent = Context.current();
    // scope.parent = this.current();

    return storage.run(this, callback);
  }

  setStore(data: T) {
    this.store_ = data;
  }

  protected isInChain(id: string) {
    return Context.chain().some(s => s.id === id);
  }

  get store() {
    return this.store_;
  }

  get parent() {
    return this.parent_;
  }

  set parent(value: Scope<unknown> | undefined) {
    this.parent_ = value;
  }

  get stack() {
    return this.stack_;
  }

  get id() {
    return this.id_;
  }

  protected id_: string;
  protected parent_?: Scope<unknown>;
  protected store_: T;
  protected stack_: string;
}
