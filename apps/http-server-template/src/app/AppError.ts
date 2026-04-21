import {type ErrorArgs, ErrorLevel, ExError} from '@sora-soft/framework';

import {type AppErrorCode} from './ErrorCode.js';

class AppError extends ExError {
  constructor(code: AppErrorCode, message: string, level = ErrorLevel.Unexpected, args: ErrorArgs = {}) {
    super(code, 'AppError', message, level, args);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export {AppError};
