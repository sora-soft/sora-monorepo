import * as ts from 'typescript';

import {AnnotationReader} from './AnnotationReader';
import {type ExportClassInfo, type ExportPlan, type ExportSimpleInfo, ExportStrategy} from './Types';

class Collector {
  collect(program: ts.Program): ExportPlan {
    const plan: ExportPlan = {
      routes: [],
      entities: [],
      simple: [],
    };

    for (const sourceFile of program.getSourceFiles()) {
      if (sourceFile.isDeclarationFile) continue;
      if (sourceFile.fileName.includes('node_modules')) continue;

      this.visitSourceFile(sourceFile, plan);
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

  private visitSourceFile(sourceFile: ts.SourceFile, plan: ExportPlan) {
    ts.forEachChild(sourceFile, (node) => {
      if (ts.isClassDeclaration(node)) {
        const info = AnnotationReader.readDeclaration(node);
        if (!info) return;

        const className = node.name?.text;
        if (!className) return;

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
        const info = AnnotationReader.readDeclaration(node);
        if (!info) return;

        plan.simple.push({
          filePath: sourceFile.fileName,
          name: node.name.text,
          kind: 'enum',
          modes: info.modes,
        });
      } else if (ts.isInterfaceDeclaration(node)) {
        const info = AnnotationReader.readDeclaration(node);
        if (!info) return;

        plan.simple.push({
          filePath: sourceFile.fileName,
          name: node.name.text,
          kind: 'interface',
          modes: info.modes,
        });
      } else if (ts.isTypeAliasDeclaration(node)) {
        const info = AnnotationReader.readDeclaration(node);
        if (!info) return;

        plan.simple.push({
          filePath: sourceFile.fileName,
          name: node.name.text,
          kind: 'type',
          modes: info.modes,
        });
      }
    });
  }
}

export {Collector};
