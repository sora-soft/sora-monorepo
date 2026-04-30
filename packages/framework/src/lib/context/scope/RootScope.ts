import {LogScope} from './LogScope.js';

export class RootScope extends LogScope<void> {
  constructor() {
    super('root');
  }

  get logCategory(): string {
    return 'runtime';
  }
}
