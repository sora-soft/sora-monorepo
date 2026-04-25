import { createFilter as rollupCreateFilter } from '@rollup/pluginutils';
import * as Diff from 'diff-match-patch-es';
import MagicString from 'magic-string';
import { resolve } from 'pathe';
import type { UnpluginFactory, UnpluginInstance } from 'unplugin';
import { createUnplugin } from 'unplugin';

import { Cache } from './cache.js';
import type { Options, ResolvedOptions } from './options.js';
import { resolveOptions } from './options.js';
import { transformDecorator } from './transform.js';
import { log } from './utils.js';

const PLUGIN_NAME = 'unplugin-typia-decorator';

const unpluginFactory: UnpluginFactory<Options | undefined, false> = (
  rawOptions = {},
) => {
  const options = resolveOptions(rawOptions);
  const filter = rollupCreateFilter(options.include, options.exclude);
  const { cache: cacheOptions, log: logOption } = options;

  const showLog = logOption === 'verbose' && cacheOptions;

  function generateCodeWithMap({
    source,
    code,
    id,
  }: {
    source: string;
    code: string;
    id: string;
  }) {
    const s = new MagicString(source);

    const diff = Diff.diff(source, code);
    Diff.diffCleanupSemantic(diff);

    let offset = 0;
    for (let index = 0; index < diff.length; index++) {
      const [type, text] = diff[index];
      const textLength = text.length;
      if (type === 0) {
        offset += textLength;
      } else if (type === 1) {
        s.prependLeft(offset, text);
      } else if (type === -1) {
        const next = diff.at(index + 1);
        if (next != null && next[0] === 1) {
          const replaceText = next[1];
          const firstNonWhitespaceIndexOfText = text.startsWith('\n')
            ? 0
            : text.search(/\S/);
          const offsetStart =
            offset +
            (firstNonWhitespaceIndexOfText > 0
              ? firstNonWhitespaceIndexOfText
              : 0);
          s.update(offsetStart, offset + textLength, replaceText);
          index += 1;
        } else {
          s.remove(offset, offset + textLength);
        }
        offset += textLength;
      }
    }

    if (!s.hasChanged()) {
      return;
    }

    return {
      code: s.toString(),
      map: s.generateMap({
        source: id,
        file: `${id}.map`,
        includeContent: true,
      }),
    };
  }

  return {
    name: PLUGIN_NAME,
    enforce: options.enforce,

    buildStart() {
      if (logOption !== false) {
        log('info', cacheOptions ? 'Cache enabled' : 'Cache disabled');
      }
    },

    transformInclude(id) {
      return filter(id);
    },

    async transform(source, id) {
      if (!source.includes('@guard')) {
        return;
      }
      if (!source.includes('typia-decorator')) {
        return;
      }

      const resolvedId = resolve(id);

      using cache = cacheOptions
        ? new Cache(resolvedId, source)
        : undefined;
      let code = cache?.data;

      if (showLog) {
        if (code != null) {
          log('info', `Cache hit: ${id}`);
        } else {
          log('info', `Cache miss: ${id}`);
        }
      }

      if (code == null) {
        code = await transformDecorator(resolvedId, source, options);

        if (showLog) {
          if (code != null) {
            log('info', `Transformed: ${id}`);
          } else {
            log('info', `Transform skipped: ${id}`);
          }
        }

        if (cache != null) {
          cache.data = code;
        }
      }

      if (code == null) {
        return;
      }

      return generateCodeWithMap({ source, code, id: resolvedId });
    },
  };
};

const unplugin: UnpluginInstance<Options | undefined, false> =
  createUnplugin(unpluginFactory);

export type { Options };
export default unplugin;
