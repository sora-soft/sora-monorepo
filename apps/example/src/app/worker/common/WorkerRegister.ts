import {AuthCommandWorker} from '../AuthCommandWorker.js';
import {DatabaseMigrateCommandWorker} from '../DatabaseMigrateCommandWorker.js';

class WorkerRegister {
  static init() {
    DatabaseMigrateCommandWorker.register();
    AuthCommandWorker.register();
  }
}

export {WorkerRegister};
