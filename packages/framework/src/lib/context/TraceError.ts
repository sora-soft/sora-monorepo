import type {TraceErrorCode} from '../../ErrorCode.js';
import {type ErrorArgs, ErrorLevel, ExError} from '../../utility/ExError.js';

class TraceError extends ExError {
  constructor(code: TraceErrorCode, message: string, args?: ErrorArgs) {
    super(code, 'TraceError', message, ErrorLevel.Unexpected, args || {});
    Object.setPrototypeOf(this, TraceError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export {TraceError};
