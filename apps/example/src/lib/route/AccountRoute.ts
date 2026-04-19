import {type FindOptionsRelations} from '@sora-soft/database-component/typeorm';
import {Route} from '@sora-soft/framework';

import {AccountPermission} from '../../app/account/AccountPermission.js';
import {AccountWorld} from '../../app/account/AccountWorld.js';
import {Account, AccountToken} from '../../app/database/Account.js';
import {UserErrorCode} from '../../app/ErrorCode.js';
import {UserError} from '../../app/UserError.js';
import {Com} from '../Com.js';
import {AuthRPCHeader} from '../Const.js';

interface IAccountOptions {
  relations?: FindOptionsRelations<Pick<Account, 'groupList'>>;
}

class AccountRoute extends Route {
  static account(options?: IAccountOptions) {
    return (target: AccountRoute, method: string) => {
      Route.registerProvider(target, method, Account, async (route, body, request) => {
        const accountIdStr = request.getHeader(AuthRPCHeader.RPC_ACCOUNT_ID);
        if (!accountIdStr)
          throw new UserError(UserErrorCode.ErrNotLogin, 'ERR_NOT_LOGIN');

        const accountId = parseInt(accountIdStr, 10);

        const relations = options?.relations || {};

        const account = await Com.businessDB.manager.findOne<Account>(Account, {
          where: {
            id: accountId,
          },
          relations,
        });
        if (!account)
          throw new UserError(UserErrorCode.ErrNotLogin, 'ERR_NOT_LOGIN');

        return account;
      });
    };
  }

  static token() {
    return (target: AccountRoute, method: string) => {
      Route.registerProvider(target, method, AccountToken, async (route, body, request) => {
        const session = request.getHeader(AuthRPCHeader.RPC_AUTHORIZATION);
        if (!session)
          throw new UserError(UserErrorCode.ErrNotLogin, 'ERR_NOT_LOGIN');

        const token = await Com.businessDB.manager.findOne(AccountToken, {
          where: {
            session,
          },
        });
        if (!token)
          throw new UserError(UserErrorCode.ErrNotLogin, 'ERR_NOT_LOGIN');

        return token;
      });
    };
  }

  static permission() {
    return (target: AccountRoute, method: string) => {
      Route.registerProvider(target, method, AccountPermission, async (route, body, request) => {
        const accountIdStr = request.getHeader(AuthRPCHeader.RPC_ACCOUNT_ID);
        if (!accountIdStr)
          throw new UserError(UserErrorCode.ErrNotLogin, 'ERR_NOT_LOGIN');

        const accountId = parseInt(accountIdStr, 10);

        return AccountWorld.fetchAccountPermission(accountId);
      });
    };
  }
}

export {AccountRoute};
