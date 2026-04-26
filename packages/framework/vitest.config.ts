import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import swc from 'vite-plugin-swc-transform';
import UnpluginTypia from '@typia/unplugin/vite';
import typiaDecorator from '@sora-soft/typia-decorator/unplugin/vite';
import { defineConfig } from 'vitest/config';

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));

export default defineConfig({
  plugins: [
    typiaDecorator({ enforce: 'pre' }),
    UnpluginTypia({ enforce: 'pre' }),
    swc({
      enforce: 'pre',
      swcOptions: {
        jsc: {
          target: 'es2022',
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true,
            useDefineForClassFields: false,
          },
          keepClassNames: true,
          externalHelpers: false,
        },
      },
    }),
  ],
  define: {
    __VERSION__: JSON.stringify(pkg.version),
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
