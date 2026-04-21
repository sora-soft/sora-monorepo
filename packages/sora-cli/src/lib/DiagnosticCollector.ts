import type * as ts from 'typescript';

export function formatNodeLocation(node: ts.Node, sourceFile: ts.SourceFile): string {
  const {line} = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  const relativePath = sourceFile.fileName.includes(process.cwd())
    ? sourceFile.fileName.substring(process.cwd().length + 1)
    : sourceFile.fileName;
  return `${relativePath}:${line + 1}`;
}

class DiagnosticCollector {
  private errors_: string[] = [];
  private warnings_: string[] = [];

  addError(message: string): void {
    this.errors_.push(message);
  }

  addWarning(message: string): void {
    this.warnings_.push(message);
  }

  getErrors(): readonly string[] {
    return this.errors_;
  }

  getWarnings(): readonly string[] {
    return this.warnings_;
  }

  hasErrors(): boolean {
    return this.errors_.length > 0;
  }

  reportTo(logFn: (msg: string) => void, warnFn: (msg: string) => void): void {
    for (const warning of this.warnings_) {
      warnFn(`Warning: ${warning}`);
    }
  }
}

export {DiagnosticCollector};
