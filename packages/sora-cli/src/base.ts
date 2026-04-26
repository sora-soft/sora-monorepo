import {Command, Flags} from '@oclif/core';

import {Config} from './lib/Config';
import {FileTree} from './lib/fs/FileTree';

export interface ConfigFieldRequirement {
  field: string;
  format?: 'path#name' | 'path#class.method';
}

abstract class BaseCommand extends Command {
  static flags = {
    help: Flags.help({char: 'h'}),
  };

  protected soraConfig_: Config | null = null;
  protected fileTree_: FileTree | null = null;

  protected abstract requiredConfigFields(): ConfigFieldRequirement[];

  protected async loadConfig() {
    this.soraConfig_ = new Config();
    await this.soraConfig_.load();
    this.fileTree_ = new FileTree(this.soraConfig_.soraRoot);
    await this.fileTree_.load();
    this.validateConfig();
  }

  protected get soraConfig(): Config {
    if (!this.soraConfig_) throw new Error('Config not loaded. Call loadConfig() first.');
    return this.soraConfig_;
  }

  protected get fileTree(): FileTree {
    if (!this.fileTree_) throw new Error('FileTree not loaded. Call loadConfig() first.');
    return this.fileTree_;
  }

  private validateConfig() {
    const requirements = this.requiredConfigFields();
    const config = this.soraConfig_!.sora;
    const fileTree = this.fileTree_!;
    const commandId = this.id || 'unknown';

    for (const req of requirements) {
      const value = (config as any)[req.field];

      if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
        throw new Error(
          `Missing required field '${req.field}' in sora.json. ` +
          `This field is required by the '${commandId}' command.`
        );
      }

      if (req.format === 'path#name') {
        if (!value.includes('#')) {
          throw new Error(
            `Invalid format for field '${req.field}' in sora.json: ` +
            'value must contain \'#\' separator (expected format: \'path/to/file#EnumName\'). ' +
            `Got: '${value}'`
          );
        }
        const [filePath, name] = value.split('#');
        if (!filePath.trim() || !name.trim()) {
          throw new Error(
            `Invalid format for field '${req.field}' in sora.json: ` +
            'both path and name must be non-empty (expected format: \'path/to/file#EnumName\'). ' +
            `Got: '${value}'`
          );
        }
        if (!fileTree.getFile(filePath + '.ts')) {
          throw new Error(
            `File referenced by '${req.field}' not found: '${filePath}.ts'. ` +
            'Check the path in your sora.json.'
          );
        }
      }

      if (req.format === 'path#class.method') {
        if (!value.includes('#')) {
          throw new Error(
            `Invalid format for field '${req.field}' in sora.json: ` +
            'value must contain \'#\' separator (expected format: \'path/to/file#ClassName.methodName\'). ' +
            `Got: '${value}'`
          );
        }
        const [filePath, classMethod] = value.split('#');
        if (!filePath.trim() || !classMethod.trim()) {
          throw new Error(
            `Invalid format for field '${req.field}' in sora.json: ` +
            'both path and class.method must be non-empty (expected format: \'path/to/file#ClassName.methodName\'). ' +
            `Got: '${value}'`
          );
        }
        if (!classMethod.includes('.')) {
          throw new Error(
            `Invalid format for field '${req.field}' in sora.json: ` +
            'part after \'#\' must contain \'.\' separator (expected format: \'path/to/file#ClassName.methodName\'). ' +
            `Got: '${classMethod}'`
          );
        }
      }
    }
  }
}

export {BaseCommand};
