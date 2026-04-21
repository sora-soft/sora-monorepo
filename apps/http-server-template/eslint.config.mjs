import stylistic from '@stylistic/eslint-plugin';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';

export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: ['./tsconfig.json'],
        sourceType: 'module',
      },
      globals: {
        ...globals.es2020,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      '@stylistic/ts': stylistic,
      'unused-imports': unusedImports,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      "@stylistic/ts/comma-dangle": ["error", {
        "enums": "always-multiline",     // 强制要求枚举必须有末尾逗号
        "arrays": "always-multiline",
        "objects": "always-multiline",
        "imports": "always-multiline",
        "exports": "always-multiline",
        "functions": "never"
      }],
      "unused-imports/no-unused-imports": "error",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "@stylistic/ts/semi-spacing": ["error", {
        "before": false, // 禁止分号前有空格
        "after": true    // 强制分号后有空格（如果分号不是行末的话）
      }],
      "lines-between-class-members": ["error", "always", { "exceptAfterSingleLine": true }],
      "@typescript-eslint/no-floating-promises": "error",
      "@stylistic/ts/space-before-blocks": ["error", "always"],
      '@stylistic/ts/member-delimiter-style': ['error', {
        multiline: {
          delimiter: 'semi',
          requireLast: true,
        },
        singleline: {
          delimiter: 'semi',
          requireLast: false,
        },
        multilineDetection: 'brackets',
      }],
      "space-in-parens": ["error", "never"],
      '@typescript-eslint/no-unused-vars': ['warn', {
        destructuredArrayIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          "selector": ["variable", "parameter"],
          "filter": {
            "regex": "^_+$",
            "match": true
          },
          "format": null
        },
        {
          "selector": "interface",
          "format": ["PascalCase"]
        },
        {
          "selector": "enumMember",
          "format": ["PascalCase"]
        },
        {
          "selector": "variable",
          "format": ["camelCase"]
        },
        {
          "selector": "parameter",
          "format": ["camelCase"]
        },
        {
          "selector": ["function", "method"],
          "format": ["camelCase"]
        },
        {
          "selector": "typeLike",
          "format": ["PascalCase"]
        }
      ],
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/adjacent-overload-signatures': 'error',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/dot-notation': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
          disallowTypeAnnotations: true,
        },
      ],
      // '@typescript-eslint/naming-convention': [
      //   'error',
      //   {
      //     selector: 'variable',
      //     format: ['camelCase', 'UPPER_CASE', 'PascalCase', 'snake_case'],
      //     leadingUnderscore: 'allow',
      //     trailingUnderscore: 'allow',
      //   },
      // ],
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-parameter-properties': 'off',
      '@typescript-eslint/no-shadow': [
        'error',
        { hoist: 'all' },
      ],
      '@typescript-eslint/no-unused-expressions': 'error',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/prefer-function-type': 'error',
      '@typescript-eslint/prefer-namespace-keyword': 'error',
      '@stylistic/ts/quotes': ['error', 'single'],
      '@typescript-eslint/triple-slash-reference': [
        'error',
        {
          path: 'always',
          types: 'prefer-import',
          lib: 'always',
        },
      ],
      '@typescript-eslint/typedef': 'off',
      '@typescript-eslint/unified-signatures': 'error',
      'space-before-function-paren': ['error', {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always',
      }],
      'comma-spacing': ['error', {
        before: false,
        after: true,
      }],
      'brace-style': [
        'error',
        '1tbs',
        { allowSingleLine: true },
      ],
      'complexity': 'off',
      'constructor-super': 'error',
      'dot-notation': 'off',
      'eqeqeq': ['off', 'always'],
      'guard-for-in': 'error',
      'id-denylist': [
        'error',
        'Number', 'number', 'String', 'string', 'Boolean', 'boolean', 'Undefined', 'undefined',
      ],
      'id-match': 'error',
      'max-classes-per-file': 'off',
      '@stylistic/ts/indent': ['error', 2, {
        SwitchCase: 1,
        MemberExpression: 1,
        ignoredNodes: [
          // 'FunctionExpression > .params[decorators.length > 0]',
          // 'FunctionExpression > .params > :matches(Decorator, :not(:first-child))',
          // 'ClassBody.body > PropertyDefinition[decorators.length > 0] > .key',
        ],
      }],
      'no-mixed-spaces-and-tabs': 'error',
      'no-multi-spaces': 'error',
      'max-len': 'off',
      'new-parens': 'error',
      'no-caller': 'error',
      'no-cond-assign': 'error',
      'no-console': [
        'error',
        {
          allow: [
            'warn', 'dir', 'time', 'timeEnd', 'timeLog', 'trace', 'assert', 'clear',
            'count', 'countReset', 'group', 'groupEnd', 'table', 'debug', 'info',
            'dirxml', 'error', 'groupCollapsed', 'Console', 'profile', 'profileEnd',
            'timeStamp', 'context',
          ],
        },
      ],
      'no-debugger': 'error',
      'no-empty': 'off',
      'no-empty-function': 'off',
      'no-eval': 'error',
      'no-fallthrough': 'off',
      'no-invalid-this': 'off',
      'no-new-wrappers': 'error',
      'no-shadow': 'off',
      'no-throw-literal': 'error',
      'no-trailing-spaces': 'error',
      'no-undef-init': 'error',
      'no-underscore-dangle': 'off',
      'no-unsafe-finally': 'error',
      'no-unused-expressions': 'off',
      'no-unused-labels': 'error',
      'no-use-before-define': 'off',
      'no-var': 'error',
      'object-curly-spacing': 'error',
      'object-shorthand': 'error',
      'one-var': ['error', 'never'],
      'semi': ['error', 'always'],
      'prefer-const': 'error',
      'quotes': 'off',
      'radix': 'error',
      'spaced-comment': ['error', 'always', { markers: ['/'] }],
      'use-isnan': 'error',
      'valid-typeof': 'off',
    },
  },
];
