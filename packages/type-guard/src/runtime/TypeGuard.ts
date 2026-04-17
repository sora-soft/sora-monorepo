import type {AnyValidateFunction} from 'ajv/dist/core.js';
import type {AnySchema} from './Ajv.js';
import {ajv} from './Const.js';
import {TypeGuardError} from './TypeGuardError.js';

class TypeGuard {
  private static validateCache = new Map<string, AnyValidateFunction<unknown>>();

  static assert<T>(value: unknown, schema: void, hash: void): asserts value is T {
    if (!(schema as unknown)) {
      throw new Error('Type guard should use under ttypescript');
    }
    const validate = (hash as unknown ? this.validateCache.get(hash as unknown as string) : null) || ajv.compile(schema as unknown as AnySchema);
    this.validateCache.set(hash as unknown as string, validate);
    const valid = validate(value);
    if (!valid) {
      if (validate.errors && validate.errors.length) {
        throw new TypeGuardError(validate.errors[0]);
      } else {
        throw new TypeGuardError(null);
      }
    }
  }

  static is<T>(value: unknown, schema: void, hash: void): value is T {
    if (!(schema as unknown)) {
      throw new Error('Type guard should use under ttypescript');
    }
    const validate = (hash as unknown ? this.validateCache.get(hash as unknown as string) : null) || ajv.compile(schema as unknown as AnySchema);
    this.validateCache.set(hash as unknown as string, validate);
    const valid = validate(value);
    return valid as boolean;
  }
}

export {TypeGuard};
