import { createRequire } from 'node:module';
import { dirname, resolve } from 'pathe';
import { resolveTSConfig } from 'pkg-types';
import ts from 'typescript';

import type { ResolvedOptions } from './options.js';

const require = createRequire(import.meta.url);

const printer = ts.createPrinter();

let compilerOptions: ts.CompilerOptions | undefined;

const sourceCache = new Map<string, ts.SourceFile>();

export async function transformDecorator(
  id: string,
  source: string,
  options: ResolvedOptions,
): Promise<string | undefined> {
  compilerOptions = await getTsCompilerOption(options.cache, options.tsconfig);

  const { program, tsSource } = getProgramAndSource(
    id,
    source,
    compilerOptions,
    options.cache,
  );

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { default: createTransformer } = require('../../dist/transform/index.js') as {
    default: (program: ts.Program) => ts.TransformerFactory<ts.SourceFile>;
  };
  const transformerFactory = createTransformer(program);

  const transformationResult = ts.transform(tsSource, [transformerFactory], {
    ...program.getCompilerOptions(),
    sourceMap: true,
    inlineSources: true,
  });

  const file = transformationResult.transformed.find(
    (t) => resolve(t.fileName) === id,
  );

  if (file == null) {
    transformationResult.dispose();
    return undefined;
  }

  const data = printer.printFile(file);
  transformationResult.dispose();
  return data;
}

async function getTsCompilerOption(
  cacheEnable = true,
  tsconfigId?: string,
): Promise<ts.CompilerOptions> {
  const parseTsCompilerOptions = async () => {
    const readFile = (path: string) => ts.sys.readFile(path);
    const id =
      tsconfigId != null ? resolve(tsconfigId) : await resolveTSConfig();

    const tsconfigParseResult = ts.readConfigFile(id, readFile);
    if (tsconfigParseResult.error != null) {
      throw new Error(tsconfigParseResult.error.messageText.toString());
    }

    const tsconfig = ts.parseJsonConfigFileContent(
      tsconfigParseResult.config,
      ts.sys,
      dirname(id),
    );

    return tsconfig.options;
  };

  if (cacheEnable) {
    compilerOptions ??= await parseTsCompilerOptions();
  } else {
    compilerOptions = await parseTsCompilerOptions();
  }

  return compilerOptions;
}

function getProgramAndSource(
  id: string,
  source: string,
  compilerOptions: ts.CompilerOptions,
  cacheEnable = true,
): { program: ts.Program; tsSource: ts.SourceFile } {
  const tsSource = ts.createSourceFile(
    id,
    source,
    compilerOptions.target ?? ts.ScriptTarget.ES2020,
  );

  const host = ts.createCompilerHost(compilerOptions);

  host.getSourceFile = (fileName, languageVersion) => {
    if (fileName === id) {
      return tsSource;
    }

    if (cacheEnable) {
      const cached = sourceCache.get(fileName);
      if (cached != null) {
        return cached;
      }
    }

    const fileSource = ts.sys.readFile(fileName);
    if (fileSource == null) {
      return undefined;
    }

    const result = ts.createSourceFile(fileName, fileSource, languageVersion);

    if (cacheEnable) {
      sourceCache.set(fileName, result);
    }

    return result;
  };

  const program = ts.createProgram([id], compilerOptions, host);

  return { program, tsSource };
}
