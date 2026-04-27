import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {defineConfig, type PluginOption} from 'vite';
import dts from 'vite-plugin-dts';
import swc from 'vite-plugin-swc-transform';
import UnpluginTypia from '@typia/unplugin/vite';
import typiaDecorator from '@sora-soft/typia-decorator/unplugin/vite';

interface CreateConfigOptions {
  plugins?: PluginOption[];
}

function resolveEntries(packageDir: string): Record<string, string> | string {
  const raw = readFileSync(resolve(packageDir, 'package.json'), 'utf-8');
  const pkg = JSON.parse(raw);
  const exports = pkg.exports;

  if (!exports) {
    return resolve(packageDir, 'src/index.ts');
  }

  const exportKeys = Object.keys(exports);
  if (exportKeys.length === 1 && exportKeys[0] === '.') {
    return resolve(packageDir, 'src/index.ts');
  }

  const entries: Record<string, string> = {};
  for (const [, exportValue] of Object.entries(exports)) {
    let distPath: string;
    if (typeof exportValue === 'string') {
      distPath = exportValue;
    } else if (typeof exportValue === 'object' && exportValue !== null) {
      distPath = exportValue.import || exportValue.default;
    }

    const filename = distPath!.split('/').pop()!.replace(/\.js$/, '');
    entries[filename] = resolve(packageDir, `src/${filename}.ts`);
  }

  return entries;
}

function createConfig(packageDir: string, options: CreateConfigOptions = {}) {
  const pkg = JSON.parse(readFileSync(resolve(packageDir, 'package.json'), 'utf-8'));
  const SRC = resolve(packageDir, 'src').replaceAll('\\', '/');
  const entries = resolveEntries(packageDir);

  return defineConfig({
    esbuild: false,
    // oxc: false,
    plugins: options.plugins ?? [],
    define: {
      __VERSION__: JSON.stringify(pkg.version),
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      lib: {
        entry: entries,
        formats: ['es'],
      },
      rollupOptions: {
        external(id: string) {
          if (id.startsWith('.') || id.startsWith('/')) return false;
          if (id.replaceAll('\\', '/').startsWith(SRC + '/')) return false;
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
}



export default createConfig(__dirname, {
  plugins: [
    typiaDecorator({ enforce: 'pre' }),
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
