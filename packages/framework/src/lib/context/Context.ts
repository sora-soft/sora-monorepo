import {AsyncLocalStorage} from 'node:async_hooks';

import type {Scope} from './Scope.js';

type AbstractConstructor<T> = abstract new (...args: any[]) => T;

export interface IScopeClass<T extends Scope<unknown> = Scope<unknown>> {
  scope?: T;
}

export type AbstractConstructorWithScope = abstract new (...args: any[]) => IScopeClass;

export class Context {
  static scopeClass<T extends AbstractConstructorWithScope>(target: T): T {
    const targetClass: any = target;
    class WrappedClass extends targetClass {
      constructor(...args: any[]) {
        super(...args);

        return new Proxy(this as any, {
          get(obj: IScopeClass, prop: string | symbol, receiver: any) {
            const value = Reflect.get(obj, prop, receiver);

            if (typeof value === 'function' && !Object.prototype.hasOwnProperty.call(obj, prop)) {
              return (...funcArgs: any[]) => {
                const classScope = obj.scope;
                if (classScope) {
                  return Context.run(classScope, () => {
                    return value.apply(receiver, funcArgs);
                  });
                } else {
                  return value.apply(receiver, funcArgs);
                }

              };
            }

            return value;
          },
        });
      }
    }

    return WrappedClass as unknown as T;
  }

  private static storage_ = new AsyncLocalStorage<Scope<unknown>>();

  static root: Scope<unknown>;

  static run<T, R>(scope: Scope<T>, callback: () => R): R {
    if (this.chain().some(s => s.id === scope.id)) {
      return callback();
    }

    scope.parent = this.current();

    return scope.run(this.storage_, callback);
  }

  static current<T>() {
    return this.storage_.getStore() as Scope<T> || this.root;
  }

  static bind<T extends Scope<unknown>, Args extends any[], R>(scope: T, func: (...args: Args) => R): (...args: Args) => R {
    return (...args: Args): R => {
      return this.storage_.run(scope, func, ...args);
    };
  }

  static wrap<Args extends any[], R>(func: (...args: Args) => R): (...args: Args) => R {
    return (...args: Args): R => {
      return this.storage_.run(this.current(), func, ...args);
    };
  }

  static find<T>(targetClass: AbstractConstructor<T>): T | null {
    let iter: Scope<unknown> | undefined = this.current();
    if (!iter) {
      return null;
    }

    while (iter) {
      if (iter instanceof (targetClass as any)) {
        return iter as T;
      }
      iter = iter.parent;
    }
    return null;
  }

  static chain(): Scope<unknown>[] {
    const result: Scope<unknown>[] = [];
    let iter: Scope<unknown> | undefined = this.current();
    if (!iter)
      return result;

    while(iter) {
      result.unshift(iter);
      iter = iter.parent;
    }

    return result;
  }
}
