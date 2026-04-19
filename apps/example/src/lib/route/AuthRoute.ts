import {Route, type Service} from '@sora-soft/framework';

import {AccountWorld} from '../../app/account/AccountWorld.js';
import {UserErrorCode} from '../../app/ErrorCode.js';
import {UserError} from '../../app/UserError.js';
import {AuthRPCHeader} from '../Const.js';

class AuthRoute<T extends Service = Service> extends Route {
  static auth(authName?: string) {
    return (target: AuthRoute, method: string) => {
      Route.registerMiddleware<AuthRoute>(target, method, async (route, body, request) => {
        const checkAuthName = [route.service.name, authName || method].join('/');
        const accountIdStr = request.getHeader(AuthRPCHeader.RPC_ACCOUNT_ID);

        if (!accountIdStr)
          throw new UserError(UserErrorCode.ErrNotLogin, 'ERR_NOT_LOGIN');

        const accountId = parseInt(accountIdStr, 10);

        const permission = await AccountWorld.fetchAccountPermission(accountId);
        const allowed = permission.isAllow(checkAuthName);
        if (!allowed) {
          throw new UserError(UserErrorCode.ErrAuthDeny, `ERR_AUTH_DENY, name=${checkAuthName}`);
        }
        return true;
      });
    };
  }

  static logined(target: AuthRoute, method: string) {
    Route.registerMiddleware(target, method, async (route, body, request) => {
      const accountId = request.getHeader(AuthRPCHeader.RPC_ACCOUNT_ID);

      if (!accountId)
        throw new UserError(UserErrorCode.ErrNotLogin, 'ERR_NOT_LOGIN');
      return true;
    });
  }

  constructor(service: T) {
    super();
    this.service_ = service;
  }

  get service() {
    return this.service_;
  }

  private service_: T;
}

export {AuthRoute};
