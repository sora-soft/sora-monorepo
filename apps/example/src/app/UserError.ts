import {type ErrorArgs, ErrorLevel, ExError} from '@sora-soft/framework';

import {type UserErrorCode} from './ErrorCode.js';

class UserError extends ExError {
  constructor(code: UserErrorCode, message: string, args: ErrorArgs = {}) {
    super(code, 'UserError', message, ErrorLevel.Expected, args);
    Object.setPrototypeOf(this, UserError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export {UserError};
