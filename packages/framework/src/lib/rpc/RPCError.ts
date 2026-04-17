import type {IPayloadError} from '../../interface/rpc.js';
import {type ErrorArgs, ErrorLevel, ExError} from '../../utility/ExError.js';

export class RPCError extends ExError {
  constructor(code: string, message: string, args?: ErrorArgs) {
    super(code, 'RPCError', message, ErrorLevel.Unexpected, args || {});
    Error.captureStackTrace(this, this.constructor);
  }
}

export class RPCResponseError extends ExError {
  constructor(error: IPayloadError, method: string) {
    super(error.code, 'RPCResponseError', error.message, error.level, {method});
    Error.captureStackTrace(this, this.constructor);
  }
}
