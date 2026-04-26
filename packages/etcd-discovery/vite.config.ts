import { resolve } from 'node:path';
import dts from 'vite-plugin-dts';
import swc from 'vite-plugin-swc-transform';
import UnpluginTypia from '@typia/unplugin/vite';
import { createConfig } from '../../vite.config.base.ts';

export default createConfig(__dirname, {
  plugins: [
    UnpluginTypia({ enforce: 'pre', cache: true }),
    {
      ...swc({
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
      enforce: 'pre',
    },
    dts({
      outDir: 'dist',
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
    }),
  ],
});
