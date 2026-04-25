import type { FilterPattern } from '@rollup/pluginutils';

export type Options = {
  include?: FilterPattern;
  exclude?: FilterPattern;
  enforce?: 'pre' | 'post' | undefined;
  tsconfig?: string;
  cache?: boolean;
  log?: boolean | 'verbose';
};

export type ResolvedOptions = Required<
  Pick<Options, 'include' | 'exclude' | 'enforce' | 'cache' | 'log'>
> &
  Pick<Options, 'tsconfig'>;

const defaultOptions = {
  include: [/\.[cm]?tsx?$/],
  exclude: [/node_modules/],
  enforce: 'pre',
  cache: false,
  log: true,
  tsconfig: undefined,
} as const;

export function resolveOptions(options: Options): ResolvedOptions {
  return {
    include: options.include ?? defaultOptions.include,
    exclude: options.exclude ?? defaultOptions.exclude,
    enforce: options.enforce ?? defaultOptions.enforce,
    cache: options.cache ?? defaultOptions.cache,
    log: options.log ?? defaultOptions.log,
    tsconfig: options.tsconfig ?? defaultOptions.tsconfig,
  };
}
