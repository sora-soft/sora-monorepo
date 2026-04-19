import {type IWorkerOptions, Node, Worker} from '@sora-soft/framework';
import md5 from 'md5';
import typia from 'typia';

import {Com} from '../../lib/Com.js';
import {AccountLoginType, rootGroupId} from '../account/AccountType.js';
import {AccountWorld} from '../account/AccountWorld.js';
import {AppError} from '../AppError.js';
import {AppErrorCode} from '../ErrorCode.js';
import {WorkerName} from './common/WorkerName.js';

export interface IAuthCommandWorkerOptions extends IWorkerOptions {
}

class AuthCommandWorker extends Worker {
  static register() {
    Node.registerWorker(WorkerName.AuthCommand, (options: IAuthCommandWorkerOptions) => {
      return new AuthCommandWorker(WorkerName.AuthCommand, options);
    });
  }

  constructor(name: string, options: IAuthCommandWorkerOptions) {
    super(name, options);
    typia.assert<IAuthCommandWorkerOptions>(options);
    this.options_ = options;
  }

  protected async startup() {
    await this.connectComponents([Com.businessDB, Com.businessRedis]);
    await AccountWorld.startup();
  }

  protected async shutdown() {
    await AccountWorld.shutdown();
  }

  async runCommand(commands: string[]) {
    const [action] = commands;
    const args= commands.slice(1);

    switch (action) {
      case 'create-root': {
        const [username, password] = args;

        const md5Password = md5(password);

        await AccountWorld.createAccount({
          nickname: username,
        }, [{
          type: AccountLoginType.Username,
          username,
          password: md5Password,
        }], [rootGroupId]);
        break;
      }
      default: {
        throw new AppError(AppErrorCode.ErrCommandNotFound, 'ERR_COMMAND_NOT_FOUND');
      }
    }
    return true;
  }

  private options_: IAuthCommandWorkerOptions;
}

export {AuthCommandWorker};

