import {type ErrorArgs, type ErrorLevel, ExError} from '../../utility/ExError.js';

export class ConnectorError extends ExError {
  constructor(code: string, message: string, level: ErrorLevel, args?: ErrorArgs) {
    super(code, 'ConnectorError', message, level, args || {});
    Error.captureStackTrace(this, this.constructor);
  }
}
