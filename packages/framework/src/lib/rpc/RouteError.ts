import {type ErrorArgs, type ErrorLevel, ExError} from '../../utility/ExError.js';

export class RouteError extends ExError {
  constructor(code: string, message: string, level: ErrorLevel, args?: ErrorArgs) {
    super(code, 'RouteError', message, level, args || {});
    Error.captureStackTrace(this, this.constructor);
  }
}
