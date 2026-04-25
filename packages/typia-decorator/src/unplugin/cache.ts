import findCacheDir from 'find-cache-dir';
import { createHash } from 'node:crypto';
import {
  accessSync,
  constants,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'pathe';

let decoratorVersion: string | undefined;

try {
  if (decoratorVersion == null) {
    const { createRequire } = await import('node:module');
    decoratorVersion = (
      createRequire(import.meta.url)(
        '@sora-soft/typia-decorator/package.json',
      ) as { version: string }
    ).version;
  }
} catch {}

export class Cache {
  #data: string | undefined;
  #hashKey: string;
  #hashPath: string;

  constructor(id: string, source: string) {
    this.#hashKey = this.getHashKey(id, source);
    this.#hashPath = join(getCacheDir(), this.#hashKey);
    this.#data = this.readCache();
  }

  [Symbol.dispose](): void {
    this.writeCache();
  }

  get data(): string | undefined {
    return this.#data;
  }

  set data(value: string | undefined) {
    this.#data = value;
  }

  private readCache(): string | undefined {
    if (!existsSync(this.#hashPath)) {
      return undefined;
    }

    const data = readFileSync(this.#hashPath, { encoding: 'utf8' });

    if (!data.endsWith(this.hashComment)) {
      return undefined;
    }

    return data;
  }

  private writeCache(): void {
    const cacheDir = dirname(this.#hashPath);

    if (this.#data == null && existsSync(this.#hashPath)) {
      rmSync(this.#hashPath);
      return;
    }

    if (!existsSync(cacheDir)) {
      mkdirSync(cacheDir, { recursive: true });
    }

    if (!this.isWritable(cacheDir)) {
      return;
    }

    writeFileSync(this.#hashPath, this.#data + this.hashComment, {
      encoding: 'utf8',
    });
  }

  private getHashKey(id: string, source: string): string {
    const h = createHash('md5').update(source).digest('hex');
    const { basename: base, dirname: dir } = {
      basename: id.split(/[\\/]/).pop() ?? 'unknown',
      dirname: id.split(/[\\/]/).slice(-2, -1)[0] ?? 'unknown',
    };
    return `${dir}_${base}_${h}`;
  }

  private get hashComment(): string {
    return `/* unplugin-typia-decorator-${decoratorVersion ?? ''}-${this.#hashKey} */\n`;
  }

  private isWritable(dir: string): boolean {
    try {
      accessSync(dir, constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }
}

function getCacheDir(): string {
  const cacheDir = findCacheDir({
    name: 'unplugin_typia_decorator',
    create: true,
  });

  if (cacheDir == null) {
    throw new Error('Cache directory not found');
  }

  return cacheDir;
}
