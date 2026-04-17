import type {TCPErrorCode} from '../../ErrorCode.js';
import {type ErrorArgs, type ErrorLevel, ExError} from '../../utility/ExError.js';

class TCPError extends ExError {
  constructor(code: TCPErrorCode, message: string, level: ErrorLevel, args?: ErrorArgs) {
    super(code, 'TCPError', message, level, args || {});
    Error.captureStackTrace(this, this.constructor);
  }
}

export {TCPError};
