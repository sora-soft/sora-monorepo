import baseConfig from "../../eslint.config.mjs";

export default [
  ...baseConfig,
  {
    rules: {
      'comma-dangle': 'off',
    },
  },
];
