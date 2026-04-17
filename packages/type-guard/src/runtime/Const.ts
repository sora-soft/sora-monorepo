import {type Options, Ajv} from './Ajv.js';

export const AJV_OPTIONS: Options = {
  allowUnionTypes: true,
  validateFormats: false,
};

export const ajv = new Ajv(AJV_OPTIONS);
