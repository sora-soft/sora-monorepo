export enum ErrorLevel {
  Fatal = -1,
  Unexpected = 1,
  Expected = 2,
  Silent = 3,
}

export type ErrorArgs = {[key: string]: any};

export class ExError extends Error {
  static fromError(err: Error | ExError) {
    if (err instanceof ExError) {
      return err;
    } else {
      const exError = new ExError('ERR_UNKNOWN', 'Error', err.message, ErrorLevel.Unexpected, {});
      exError.stack = err.stack;
      return exError;
    }
  }

  constructor(code: string, name: string, message: string, level: ErrorLevel, args: ErrorArgs) {
    super(message);
    this.code_ = code;
    this.name_ = name;
    this.level_ = level;
    this.args_ = args;
    Error.captureStackTrace(this, this.constructor);
  }

  get code() {
    return this.code_;
  }

  get name() {
    return this.name_;
  }

  get level() {
    return this.level_;
  }

  get args() {
    return this.args_;
  }

  toJson() {
    return JSON.parse(JSON.stringify({
      code: this.code,
      name: this.name,
      level: this.level,
      message: this.message,
      args: this.args_,
    }));
  }

  private code_: string;
  private name_: string;
  private level_: ErrorLevel;
  private args_: ErrorArgs;
}
