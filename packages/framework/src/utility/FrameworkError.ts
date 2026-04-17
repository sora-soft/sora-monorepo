import type {FrameworkErrorCode} from '../ErrorCode.js';
import {type ErrorArgs, ErrorLevel, ExError} from './ExError.js';

class FrameworkError extends ExError {
  constructor(code: FrameworkErrorCode, message: string, args?: ErrorArgs) {
    super(code, 'FrameworkError', message, ErrorLevel.Unexpected, args || {});
    Object.setPrototypeOf(this, FrameworkError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export {FrameworkError};
