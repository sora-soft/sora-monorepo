import * as ts from 'typescript';

import {type DiagnosticCollector} from '../DiagnosticCollector';
import {AnnotationReader} from './AnnotationReader';
import {type ExportClassInfo, type ExportPlan, type ExportSimpleInfo, ExportStrategy} from './Types';

class Collector {
  private diagnostics_: DiagnosticCollector | null;

  constructor(diagnostics?: DiagnosticCollector) {
    this.diagnostics_ = diagnostics || null;
  }

  collect(program: ts.Program): ExportPlan {
    const plan: ExportPlan = {
      routes: [],
      entities: [],
      simple: [],
    };

    const seenNames = new Map<string, string>();

    for (const sourceFile of program.getSourceFiles()) {
      if (sourceFile.isDeclarationFile) continue;
      if (sourceFile.fileName.includes('node_modules')) continue;

      this.visitSourceFile(sourceFile, plan, seenNames);
    }

    const total = plan.routes.length + plan.entities.length + plan.simple.length;
    if (total === 0 && this.diagnostics_) {
      this.diagnostics_.addWarning(
        'No exportable declarations found. Make sure your classes/enums/interfaces/types are annotated with @soraExport.'
      );
    }

    return plan;
  }

  filterByTarget(plan: ExportPlan, targets: string[] | undefined): ExportPlan {
    if (!targets || targets.length === 0) {
      return plan;
    }

    const filterClass = (items: ExportClassInfo[]) => {
      return items.filter(item => {
        if (item.modes.length === 0) return true;
        return targets.some(t => item.modes.includes(t));
      });
    };

    const filterSimple = (items: ExportSimpleInfo[]) => {
      return items.filter(item => {
        if (item.modes.length === 0) return true;
        return targets.some(t => item.modes.includes(t));
      });
    };

    return {
      routes: filterClass(plan.routes),
      entities: filterClass(plan.entities),
      simple: filterSimple(plan.simple),
    };
  }

  private visitSourceFile(sourceFile: ts.SourceFile, plan: ExportPlan, seenNames: Map<string, string>) {
    ts.forEachChild(sourceFile, (node) => {
      if (ts.isClassDeclaration(node)) {
        const info = AnnotationReader.readDeclaration(node, sourceFile, this.diagnostics_ || undefined);
        if (!info) return;

        const className = node.name?.text;
        if (!className) return;

        this.checkDuplicateExport(className, sourceFile, seenNames);

        if (info.type === 'route') {
          plan.routes.push({
            filePath: sourceFile.fileName,
            className,
            strategy: ExportStrategy.Route,
            modes: info.modes,
          });
        } else if (info.type === 'entity') {
          plan.entities.push({
            filePath: sourceFile.fileName,
            className,
            strategy: ExportStrategy.Entity,
            modes: info.modes,
          });
        } else {
          plan.simple.push({
            filePath: sourceFile.fileName,
            name: className,
            kind: 'class',
            modes: info.modes,
          });
        }
      } else if (ts.isEnumDeclaration(node)) {
        const info = AnnotationReader.readDeclaration(node, sourceFile, this.diagnostics_ || undefined);
        if (!info) return;

        this.checkDuplicateExport(node.name.text, sourceFile, seenNames);

        plan.simple.push({
          filePath: sourceFile.fileName,
          name: node.name.text,
          kind: 'enum',
          modes: info.modes,
        });
      } else if (ts.isInterfaceDeclaration(node)) {
        const info = AnnotationReader.readDeclaration(node, sourceFile, this.diagnostics_ || undefined);
        if (!info) return;

        this.checkDuplicateExport(node.name.text, sourceFile, seenNames);

        plan.simple.push({
          filePath: sourceFile.fileName,
          name: node.name.text,
          kind: 'interface',
          modes: info.modes,
        });
      } else if (ts.isTypeAliasDeclaration(node)) {
        const info = AnnotationReader.readDeclaration(node, sourceFile, this.diagnostics_ || undefined);
        if (!info) return;

        this.checkDuplicateExport(node.name.text, sourceFile, seenNames);

        plan.simple.push({
          filePath: sourceFile.fileName,
          name: node.name.text,
          kind: 'type',
          modes: info.modes,
        });
      }
    });
  }

  private checkDuplicateExport(name: string, sourceFile: ts.SourceFile, seenNames: Map<string, string>) {
    const existingFile = seenNames.get(name);
    if (existingFile && this.diagnostics_) {
      const existingRelative = existingFile.includes(process.cwd()) ? existingFile.substring(process.cwd().length + 1) : existingFile;
      const currentRelative = sourceFile.fileName.includes(process.cwd()) ? sourceFile.fileName.substring(process.cwd().length + 1) : sourceFile.fileName;
      this.diagnostics_.addWarning(
        `Duplicate export name '${name}' found in both ${existingRelative} and ${currentRelative}. Only the first occurrence will be exported.`
      );
    } else {
      seenNames.set(name, sourceFile.fileName);
    }
  }
}

export {Collector};
