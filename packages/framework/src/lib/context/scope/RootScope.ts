import {Context} from '../Context.js';
import {LogScope} from './LogScope.js';

export class RootScope extends LogScope<void> {
  static {
    Context.root = new RootScope();
  }

  constructor() {
    super('root');
  }

  get logCategory(): string {
    return 'runtime';
  }
}
