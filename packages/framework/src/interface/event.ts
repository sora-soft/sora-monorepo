import type {EventEmitter} from 'events';

export interface IEventEmitter<T extends {[key: string]: any}> extends Omit<EventEmitter, 'on' | 'emit'> {
  on<U extends keyof T>(
    event: U, listener: T[U]
  ): this;

  emit<U extends keyof T>(
    event: U, ...args: Parameters<T[U]>
  ): boolean;
}
