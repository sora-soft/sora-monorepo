import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import dts from 'vite-plugin-dts';
import swc from 'vite-plugin-swc-transform';
import UnpluginTypia from '@typia/unplugin/vite';
import typiaDecorator from '@sora-soft/typia-decorator/unplugin/vite';
import { defineConfig } from 'vite';

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));
const SRC = resolve(__dirname, 'src').replaceAll('\\', '/');

const nodeBuiltins = new Set([
  'assert', 'async_hooks', 'buffer', 'child_process', 'cluster',
  'console', 'constants', 'crypto', 'dgram', 'diagnostics_channel',
  'dns', 'domain', 'events', 'fs', 'http', 'http2', 'https',
  'inspector', 'module', 'net', 'os', 'path', 'perf_hooks',
  'process', 'punycode', 'querystring', 'readline', 'repl',
  'stream', 'string_decoder', 'sys', 'timers', 'tls', 'tty',
  'url', 'util', 'v8', 'vm', 'wasi', 'worker_threads', 'zlib',
]);

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
    dts({
      outDir: 'dist',
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
    }),
  ],
  define: {
    __VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        rxjs: resolve(__dirname, 'src/rxjs.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external(id: string) {
        if (id.startsWith('.') || id.startsWith('/')) return false;
        if (id.replaceAll('\\', '/').startsWith(SRC + '/')) return false;
        if (id.startsWith('node:')) return true;
        const bare = id.startsWith('@') ? id.split('/', 2).join('/') : id.split('/')[0];
        if (nodeBuiltins.has(bare)) return true;
        return true;
      },
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
    target: 'es2022',
    minify: false,
    sourcemap: true,
  },
});
