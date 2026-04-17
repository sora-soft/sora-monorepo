import {Scope} from '../Scope.js';

export abstract class LogScope<T> extends Scope<T> {
  abstract get logCategory(): string;
}
