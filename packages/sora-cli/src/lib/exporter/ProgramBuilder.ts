import * as fs from 'node:fs';
import * as path from 'node:path';
import * as ts from 'typescript';

import {type DiagnosticCollector} from '../DiagnosticCollector';

class ProgramBuilder {
  private rootDir_: string;
  private tsconfigPath_: string;
  private diagnostics_: DiagnosticCollector | null;

  constructor(rootDir: string, tsconfigPath: string, diagnostics?: DiagnosticCollector) {
    this.rootDir_ = rootDir;
    this.tsconfigPath_ = tsconfigPath;
    this.diagnostics_ = diagnostics || null;
  }

  build(): ts.Program {
    const files = this.collectTsFiles(this.rootDir_);
    const compilerOptions = this.loadCompilerOptions();

    const program = ts.createProgram(files, compilerOptions);
    return program;
  }

  getTypeChecker(program: ts.Program): ts.TypeChecker {
    return program.getTypeChecker();
  }

  private collectTsFiles(dir: string): string[] {
    if (!fs.existsSync(dir)) {
      throw new Error(
        `Source root directory '${dir}' does not exist. Check the 'root' setting in your sora.json.`
      );
    }

    const result: string[] = [];

    const walk = (currentDir: string) => {
      const entries = fs.readdirSync(currentDir, {withFileTypes: true});
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') {
            continue;
          }
          walk(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
          result.push(fullPath);
        }
      }
    };

    walk(dir);

    if (result.length === 0 && this.diagnostics_) {
      this.diagnostics_.addWarning(
        `No TypeScript source files found in '${dir}'. Make sure your source directory is correct.`
      );
    }

    return result;
  }

  private loadCompilerOptions(): ts.CompilerOptions {
    const configFileName = this.tsconfigPath_ || ts.findConfigFile(this.rootDir_, ts.sys.fileExists, 'tsconfig.json');
    if (!configFileName) {
      return {
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.CommonJS,
        strict: true,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      };
    }

    const configFile = ts.readConfigFile(configFileName, ts.sys.readFile);
    if (configFile.error) {
      const msg = typeof configFile.error.messageText === 'string'
        ? configFile.error.messageText
        : (configFile.error.messageText as any).messageText || String(configFile.error.messageText);
      throw new Error(`Failed to read tsconfig: ${msg}`);
    }

    const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(configFileName));
    return parsed.options;
  }
}

export {ProgramBuilder};
