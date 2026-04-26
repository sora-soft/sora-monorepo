import * as ts from 'typescript';

import {type DiagnosticCollector} from '../DiagnosticCollector';
import {AnnotationReader} from './AnnotationReader';
import {transferJSDoc} from './JSDocUtils';
import {buildRouteMethodImportMap, findClassDeclaration, isRouteMethod, shouldIgnoreMember} from './RouteUtils';
import {type ExportClassInfo, type ExportSimpleInfo} from './Types';

interface TransformedDeclaration {
  name: string;
  node: ts.Node;
  sourceFile: ts.SourceFile;
  originalNode?: ts.Node;
}

class Transformer {
  private diagnostics_: DiagnosticCollector | null;

  constructor(diagnostics?: DiagnosticCollector) {
    this.diagnostics_ = diagnostics || null;
  }

  transform(
    program: ts.Program,
    routes: ExportClassInfo[],
    entities: ExportClassInfo[],
    simple: ExportSimpleInfo[],
    targets?: string[]
  ): TransformedDeclaration[] {
    const results: TransformedDeclaration[] = [];
    const checker = program.getTypeChecker();

    for (const routeInfo of routes) {
      const sourceFile = program.getSourceFile(routeInfo.filePath);
      if (!sourceFile) {
        this.warnMissingSourceFile(routeInfo.filePath, routeInfo.className);
        continue;
      }

      const classDecl = findClassDeclaration(sourceFile, routeInfo.className);
      if (!classDecl) {
        this.warnMissingClass(sourceFile, routeInfo.className);
        continue;
      }

      const transformed = this.transformRouteClass(classDecl, sourceFile, routeInfo, targets, checker);
      if (!transformed) {
        this.warnEmptyResult(sourceFile, routeInfo.className, 'route');
      } else {
        results.push({
          name: routeInfo.className,
          node: transformed,
          sourceFile,
          originalNode: classDecl,
        });
      }
    }

    for (const entityInfo of entities) {
      const sourceFile = program.getSourceFile(entityInfo.filePath);
      if (!sourceFile) {
        this.warnMissingSourceFile(entityInfo.filePath, entityInfo.className);
        continue;
      }

      const classDecl = findClassDeclaration(sourceFile, entityInfo.className);
      if (!classDecl) {
        this.warnMissingClass(sourceFile, entityInfo.className);
        continue;
      }

      const transformed = this.transformEntityClass(classDecl, sourceFile, entityInfo, targets);
      if (!transformed) {
        this.warnEmptyResult(sourceFile, entityInfo.className, 'entity');
      } else {
        results.push({
          name: entityInfo.className,
          node: transformed,
          sourceFile,
          originalNode: classDecl,
        });
      }
    }

    for (const simpleInfo of simple) {
      const sourceFile = program.getSourceFile(simpleInfo.filePath);
      if (!sourceFile) {
        this.warnMissingSourceFile(simpleInfo.filePath, simpleInfo.name);
        continue;
      }

      if (simpleInfo.kind === 'class') {
        const classDecl = findClassDeclaration(sourceFile, simpleInfo.name);
        if (!classDecl) {
          this.warnMissingClass(sourceFile, simpleInfo.name);
          continue;
        }

        const transformed = this.transformGenericClass(classDecl, sourceFile, targets);
        if (!transformed) {
          this.warnEmptyResult(sourceFile, simpleInfo.name, 'generic');
        } else {
          results.push({
            name: simpleInfo.name,
            node: transformed,
            sourceFile,
          });
        }
      } else if (simpleInfo.kind === 'enum') {
        const decl = this.findEnumDeclaration(sourceFile, simpleInfo.name);
        if (!decl) continue;

        const transformed = this.transformEnum(decl, sourceFile);
        results.push({
          name: simpleInfo.name,
          node: transformed,
          sourceFile,
        });
      } else if (simpleInfo.kind === 'interface') {
        const decl = this.findInterfaceDeclaration(sourceFile, simpleInfo.name);
        if (!decl) continue;

        const transformed = this.transformInterface(decl, sourceFile);
        results.push({
          name: simpleInfo.name,
          node: transformed,
          sourceFile,
        });
      } else if (simpleInfo.kind === 'type') {
        const decl = this.findTypeAliasDeclaration(sourceFile, simpleInfo.name);
        if (!decl) continue;

        const transformed = this.transformTypeAlias(decl, sourceFile);
        results.push({
          name: simpleInfo.name,
          node: transformed,
          sourceFile,
        });
      }
    }

    return results;
  }

  private transformEnum(decl: ts.EnumDeclaration, sourceFile: ts.SourceFile): ts.EnumDeclaration {
    const modifiers = this.ensureExport(decl);

    const members = ts.factory.createNodeArray(
      decl.members.map(member => {
        ts.setTextRange(member, {pos: -1, end: -1});
        return transferJSDoc(member, member, sourceFile) as ts.EnumMember;
      })
    );

    const result = ts.factory.createEnumDeclaration(
      modifiers,
      ts.factory.createIdentifier(decl.name.text),
      members
    );

    return transferJSDoc(decl, result, sourceFile) as ts.EnumDeclaration;
  }

  private transformInterface(decl: ts.InterfaceDeclaration, sourceFile: ts.SourceFile): ts.InterfaceDeclaration {
    const modifiers = this.ensureExport(decl);

    const members = ts.factory.createNodeArray(
      decl.members.map(member => {
        ts.setTextRange(member, {pos: -1, end: -1});
        return transferJSDoc(member, member, sourceFile) as ts.TypeElement;
      })
    );

    const result = ts.factory.createInterfaceDeclaration(
      modifiers,
      ts.factory.createIdentifier(decl.name.text),
      decl.typeParameters,
      decl.heritageClauses,
      members
    );

    return transferJSDoc(decl, result, sourceFile) as ts.InterfaceDeclaration;
  }

  private transformTypeAlias(decl: ts.TypeAliasDeclaration, sourceFile: ts.SourceFile): ts.TypeAliasDeclaration {
    const modifiers = this.ensureExport(decl);
    const result = ts.factory.createTypeAliasDeclaration(
      modifiers,
      ts.factory.createIdentifier(decl.name.text),
      decl.typeParameters,
      decl.type
    );
    return transferJSDoc(decl, result, sourceFile) as ts.TypeAliasDeclaration;
  }

  private transformRouteClass(
    classDecl: ts.ClassDeclaration,
    sourceFile: ts.SourceFile,
    routeInfo: ExportClassInfo,
    targets: string[] | undefined,
    checker: ts.TypeChecker
  ): ts.InterfaceDeclaration | null {
    const members: ts.TypeElement[] = [];
    const routeMethodImportMap = buildRouteMethodImportMap(sourceFile);

    for (const member of classDecl.members) {
      if (!ts.isMethodDeclaration(member)) continue;
      if (!member.name) continue;

      if (!isRouteMethod(member, routeMethodImportMap)) continue;

      const ignoreModes = AnnotationReader.readMemberIgnore(member, sourceFile, this.diagnostics_ || undefined);
      if (ignoreModes !== null && shouldIgnoreMember(ignoreModes, targets)) continue;

      const params = member.parameters.slice(0, 1);

      let returnType = member.type;
      if (!returnType) {
        const signature = checker.getSignatureFromDeclaration(member);
        if (signature) {
          const returnTypeNode = checker.typeToTypeNode(
            signature.getReturnType(),
            undefined,
            ts.NodeBuilderFlags.NoTruncation
          );
          if (returnTypeNode) {
            returnType = returnTypeNode;
          }
        }
      }

      const newMethod = ts.factory.createMethodSignature(
        undefined,
        member.name,
        member.questionToken,
        member.typeParameters,
        this.updateParameters(params, sourceFile),
        returnType
      );

      members.push(transferJSDoc(member, newMethod, sourceFile) as ts.TypeElement);
    }

    if (members.length === 0) return null;

    const iface = ts.factory.createInterfaceDeclaration(
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      classDecl.name!,
      classDecl.typeParameters,
      undefined,
      members
    );

    return transferJSDoc(classDecl, iface, sourceFile) as ts.InterfaceDeclaration;
  }

  private transformEntityClass(
    classDecl: ts.ClassDeclaration,
    sourceFile: ts.SourceFile,
    entityInfo: ExportClassInfo,
    targets?: string[]
  ): ts.InterfaceDeclaration | null {
    const members: ts.TypeElement[] = [];

    for (const member of classDecl.members) {
      if (!ts.isPropertyDeclaration(member)) continue;
      if (!member.name) continue;

      if (this.hasModifier(member, ts.SyntaxKind.PrivateKeyword) ||
          this.hasModifier(member, ts.SyntaxKind.ProtectedKeyword) ||
          this.hasModifier(member, ts.SyntaxKind.StaticKeyword)) {
        continue;
      }

      if (!member.type && this.diagnostics_) {
        this.diagnostics_.addWarning(
          `Property '${member.name.getText(sourceFile)}' in class '${entityInfo.className}' in ${sourceFile.fileName} has no type annotation. It will be exported with 'any' type.`
        );
      }

      const ignoreModes = AnnotationReader.readMemberIgnore(member, sourceFile, this.diagnostics_ || undefined);
      if (ignoreModes !== null && shouldIgnoreMember(ignoreModes, targets)) continue;

      const newProp = ts.factory.createPropertySignature(
        undefined,
        member.name,
        member.questionToken,
        member.type
      );

      members.push(transferJSDoc(member, newProp, sourceFile) as ts.TypeElement);
    }

    if (members.length === 0) return null;

    const extendsClauses = classDecl.heritageClauses?.filter(
      clause => clause.token === ts.SyntaxKind.ExtendsKeyword
    );
    const heritageClauses = extendsClauses?.length ? extendsClauses : undefined;

    const iface = ts.factory.createInterfaceDeclaration(
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      classDecl.name!,
      classDecl.typeParameters,
      heritageClauses,
      members
    );

    return transferJSDoc(classDecl, iface, sourceFile) as ts.InterfaceDeclaration;
  }

  private transformGenericClass(
    classDecl: ts.ClassDeclaration,
    sourceFile: ts.SourceFile,
    targets?: string[]
  ): ts.InterfaceDeclaration | null {
    const members: ts.TypeElement[] = [];

    for (const member of classDecl.members) {
      if (this.hasModifier(member, ts.SyntaxKind.PrivateKeyword) ||
          this.hasModifier(member, ts.SyntaxKind.ProtectedKeyword) ||
          this.hasModifier(member, ts.SyntaxKind.StaticKeyword)) {
        continue;
      }

      if (ts.isConstructorDeclaration(member)) continue;

      const ignoreModes = AnnotationReader.readMemberIgnore(member, sourceFile, this.diagnostics_ || undefined);
      if (ignoreModes !== null && shouldIgnoreMember(ignoreModes, targets)) continue;

      if (ts.isMethodDeclaration(member)) {
        continue;
      } else if (ts.isPropertyDeclaration(member)) {
        if (!member.type && this.diagnostics_) {
          this.diagnostics_.addWarning(
            `Property '${member.name?.getText(sourceFile)}' in class '${classDecl.name?.getText(sourceFile)}' in ${sourceFile.fileName} has no type annotation. It will be exported with 'any' type.`
          );
        }
        const newProp = ts.factory.createPropertySignature(
          undefined,
          member.name!,
          member.questionToken,
          member.type
        );
        members.push(transferJSDoc(member, newProp, sourceFile) as ts.TypeElement);
      }
    }

    if (members.length === 0) return null;

    const extendsClauses = classDecl.heritageClauses?.filter(
      clause => clause.token === ts.SyntaxKind.ExtendsKeyword
    );
    const heritageClauses = extendsClauses?.length ? extendsClauses : undefined;

    const iface = ts.factory.createInterfaceDeclaration(
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      classDecl.name!,
      classDecl.typeParameters,
      heritageClauses,
      members
    );

    return transferJSDoc(classDecl, iface, sourceFile) as ts.InterfaceDeclaration;
  }

  private warnMissingSourceFile(filePath: string, name: string) {
    if (!this.diagnostics_) return;
    this.diagnostics_.addWarning(
      `Source file '${filePath}' not found for declaration '${name}'. Skipping.`
    );
  }

  private warnMissingClass(sourceFile: ts.SourceFile, className: string) {
    if (!this.diagnostics_) return;
    this.diagnostics_.addWarning(
      `Class '${className}' not found in '${sourceFile.fileName}'. Skipping.`
    );
  }

  private warnEmptyResult(sourceFile: ts.SourceFile, name: string, kind: string) {
    if (!this.diagnostics_) return;
    this.diagnostics_.addWarning(
      `No exportable members found for ${kind} class '${name}' in '${sourceFile.fileName}'. Skipping.`
    );
  }

  private findEnumDeclaration(sourceFile: ts.SourceFile, name: string): ts.EnumDeclaration | null {
    for (const statement of sourceFile.statements) {
      if (ts.isEnumDeclaration(statement) && statement.name.text === name) {
        return statement;
      }
    }
    return null;
  }

  private findInterfaceDeclaration(sourceFile: ts.SourceFile, name: string): ts.InterfaceDeclaration | null {
    for (const statement of sourceFile.statements) {
      if (ts.isInterfaceDeclaration(statement) && statement.name.text === name) {
        return statement;
      }
    }
    return null;
  }

  private findTypeAliasDeclaration(sourceFile: ts.SourceFile, name: string): ts.TypeAliasDeclaration | null {
    for (const statement of sourceFile.statements) {
      if (ts.isTypeAliasDeclaration(statement) && statement.name.text === name) {
        return statement;
      }
    }
    return null;
  }

  private hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean {
    if (ts.canHaveModifiers(node)) {
      const modifiers = ts.getModifiers(node) || [];
      return modifiers.some(m => m.kind === kind);
    }
    return false;
  }

  private ensureExport(node: ts.Declaration): ts.ModifierLike[] {
    const existing = ts.canHaveModifiers(node) ? (ts.getModifiers(node) || []) : [];
    const hasExport = existing.some(m => m.kind === ts.SyntaxKind.ExportKeyword);

    const result: ts.ModifierLike[] = [];
    if (!hasExport) result.push(ts.factory.createModifier(ts.SyntaxKind.ExportKeyword));
    result.push(...existing);
    return result;
  }

  private updateParameters(params: readonly ts.ParameterDeclaration[], _: ts.SourceFile): ts.NodeArray<ts.ParameterDeclaration> {
    const newParams = params.map(p => {
      return ts.factory.updateParameterDeclaration(
        p,
        undefined,
        p.dotDotDotToken,
        p.name,
        p.questionToken,
        p.type,
        undefined
      );
    });
    return ts.factory.createNodeArray(newParams);
  }
}

export {Transformer};
export type {TransformedDeclaration};
