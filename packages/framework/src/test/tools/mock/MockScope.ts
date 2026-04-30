import {v4 as uuidv4} from 'uuid';

import {Scope} from '../../../lib/context/Scope.js';

export class MockScope extends Scope<Record<string, unknown>> {
  constructor() {
    super(uuidv4(), {});
  }
}
