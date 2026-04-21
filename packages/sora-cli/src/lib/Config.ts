import fs = require('fs');
import path = require('path');
import * as ts from 'typescript';

interface ISoraConfig {
  root: string;
  dist: string;
  serviceDir: string;
  serviceNameEnum: string;
  serviceRegister: string;
  handlerDir: string;
  workerDir: string;
  workerNameEnum: string;
  workerRegister: string;
  databaseDir: string;
  componentNameEnum: string;
  comClass: string;
  apiDeclarationOutput: string;
  docOutput?: string;
}

class Config {
  async load() {
    await this.loadSoraConfig();
    await this.loadTSConfig();
  }

  async loadSoraConfig() {
    this.soraConfigPath_ = process.cwd();
    const configPath = path.resolve(this.soraConfigPath_, 'sora.json');

    if (!fs.existsSync(configPath)) {
      throw new Error(
        'Configuration file \'sora.json\' not found in the current directory. ' +
        'Run this command from the project root, or create a sora.json configuration file.'
      );
    }

    try {
      this.soraConfig_ = await import(configPath);
    } catch (err: any) {
      throw new Error(
        `Failed to parse 'sora.json': ${err.message}. Please check for JSON syntax errors.`
      );
    }
  }

  async loadTSConfig() {
    const tsConfigPath = path.resolve(process.cwd(), 'tsconfig.json');

    if (!fs.existsSync(tsConfigPath)) {
      throw new Error(
        'TypeScript configuration file \'tsconfig.json\' not found in the current directory.'
      );
    }

    let tsPkg: any;
    try {
      tsPkg = await import(tsConfigPath);
    } catch (err: any) {
      throw new Error(
        `Failed to parse 'tsconfig.json': ${err.message}. Please check for JSON syntax errors.`
      );
    }

    const result = ts.convertCompilerOptionsFromJson(tsPkg.compilerOptions, '');
    if (result.errors.length) {
      const messages = result.errors.map(e => {
        if (typeof e.messageText === 'string') return e.messageText;
        return (e.messageText as any).messageText || String(e.messageText);
      }).join('; ');
      throw new Error(`Invalid compiler options in 'tsconfig.json': ${messages}`);
    }
    this.tsConfig_ = result.options;
  }

  get sora() {
    return this.soraConfig_;
  }

  get soraRoot() {
    return path.resolve(this.soraConfigPath_, this.sora.root);
  }

  get ts() {
    return this.tsConfig_;
  }

  private soraConfig_!: ISoraConfig;
  private soraConfigPath_!: string;
  private tsConfig_!: ts.CompilerOptions;
}

export {Config};
