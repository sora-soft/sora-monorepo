import {AsyncLocalStorage} from 'node:async_hooks';

import type {Scope} from './Scope.js';
import {RootScope} from './scope/RootScope.js';

type AbstractConstructor<T> = abstract new (...args: any[]) => T;

export interface IScopeClass<T extends Scope<unknown> = Scope<unknown>> {
  scope?: T;
}

export interface IContextStorage<T> {
  scope: Scope<T>;
  parent: IContextStorage<unknown> | null;
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

  private static storage_ = new AsyncLocalStorage<IContextStorage<unknown>>();

  static get root() {
    return this.rootStorage.scope;
  }

  private static rootStorage: IContextStorage<void> = {
    parent: null,
    scope: new RootScope(),
  };

  static run<T, R>(scope: Scope<T>, callback: () => R): R {
    if (this.chain().some(s => s.id === scope.id)) {
      return callback();
    }

    const current = this.currentStorage();
    return this.storage_.run({parent: current, scope}, callback);
  }

  private static currentStorage<T>() {
    return this.storage_.getStore() as IContextStorage<T> || this.rootStorage;
  }

  static current<T>() {
    const storage = this.currentStorage<T>();
    return storage.scope;
  }

  static bind<T extends Scope<unknown>, Args extends any[], R>(scope: T, func: (...args: Args) => R): (...args: Args) => R {
    return (...args: Args): R => {
      return this.run(scope, () => func(...args));
    };
  }

  static wrap<Args extends any[], R>(func: (...args: Args) => R): (...args: Args) => R {
    return (...args: Args): R => {
      return this.storage_.run(this.currentStorage(), func, ...args);
    };
  }

  static find<T extends Scope<unknown>>(targetClass: AbstractConstructor<T>): T | null {
    let iter: IContextStorage<unknown> | null = this.currentStorage();
    if (!iter) {
      return null;
    }

    while (iter) {
      if (iter.scope instanceof (targetClass as any)) {
        return iter.scope as T;
      }
      iter = iter.parent;
    }
    return null;
  }

  static chain(): Scope<unknown>[] {
    const result: Scope<unknown>[] = [];
    let iter: IContextStorage<unknown> | null = this.currentStorage();
    if (!iter)
      return result;

    while(iter) {
      result.unshift(iter.scope);
      iter = iter.parent;
    }

    return result;
  }
}
