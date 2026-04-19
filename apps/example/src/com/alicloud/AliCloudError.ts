import {ErrorLevel, ExError} from '@sora-soft/framework';

export enum AliCloudErrorCode {
  ErrSubNotLoaded = 'ERR_SUB_NOT_LOADED',
}

class AliCloudError extends ExError {
  constructor(code: AliCloudErrorCode, message: string) {
    super(code, 'AliCloudError', message, ErrorLevel.Unexpected, {});
    Object.setPrototypeOf(this, AliCloudError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}


export {AliCloudError};
