import type {ErrorObject} from 'ajv';

class TypeGuardError extends Error {
  constructor(error: ErrorObject | null) {
    super();
    if (error) {
      this.error_ = error;
    }
  }

  get path() {
    return this.error_?.instancePath.slice(1).replaceAll('/', '.');
  }

  get type() {
    return this.error_?.keyword;
  }

  get message() {
    return `type guard error, ${this.path ? this.path + ' ' : ''}${this.error_?.message || 'unkown error'}`;
  }

  private error_: ErrorObject | null = null;
}

export {TypeGuardError};
