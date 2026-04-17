import 'reflect-metadata';
import type {AnySchema, ValidateFunction} from './Ajv.js';
import {ajv} from './Const.js';
import {TypeGuardError} from './TypeGuardError.js';

const assertionsMetadataKey = Symbol('assertions');

interface IParamValidator {
  validate: ValidateFunction;
  async: boolean;
}

export function AssertType(schema: void) {
  if (!(schema as unknown)) {
    throw new Error('Type guard should use under ttypescript');
  }
  const validate = ajv.compile(schema as unknown as AnySchema);
  return function (target: Object, propertyKey: string, parameterIndex: number) {
    const assertions: IParamValidator[] = Reflect.getOwnMetadata(assertionsMetadataKey, target, propertyKey) as IParamValidator[] || [];
    if(Reflect.getOwnMetadata('design:returntype', target, propertyKey) === Promise) {
      assertions[parameterIndex] = {validate, async: true};
    } else {
      assertions[parameterIndex] = {validate, async: false};
    }
    Reflect.defineMetadata(assertionsMetadataKey, assertions, target, propertyKey);
  };
}

export function ValidateClass() {
  return function (target: {prototype: Record<string, unknown>}) {
    for (const propertyKey of Object.getOwnPropertyNames(target.prototype)) {
      const assertions = Reflect.getOwnMetadata(assertionsMetadataKey, target.prototype, propertyKey) as IParamValidator[] || undefined;
      if (assertions) {
        const originalMethod = target.prototype[propertyKey] as (...args: unknown[]) => unknown;
        target.prototype[propertyKey] = function (...args: unknown[]) {
          for (let i = 0; i < assertions.length; i++) {
            const assertion = assertions[i];
            if (!assertion) {
              continue;
            }
            const valid = assertion.validate(args[i]);
            if (!valid) {
              const err = new TypeGuardError(assertion.validate.errors ? assertion.validate.errors[0] : null);
              if (assertion.async) {
                return Promise.reject(err);
              } else {
                throw err;
              }
            }
          }
          return originalMethod.apply(this, args) as unknown;
        };
      }
    }
  };
}
