import * as ts from 'typescript';

import {AnnotationReader} from './AnnotationReader';
import {transferJSDoc} from './JSDocUtils';
import {type ExportClassInfo, type ExportSimpleInfo} from './Types';

interface TransformedDeclaration {
  name: string;
  node: ts.Node;
  sourceFile: ts.SourceFile;
  originalNode?: ts.Node;
}

const frameworkModule = '@sora-soft/framework';

function getNodeDecorators(node: ts.Node): ts.Decorator[] {
  if (ts.canHaveDecorators(node)) {
    const decs = ts.getDecorators(node);
    if (decs && decs.length > 0) return [...decs];
  }

  const nodeAny = node as any;
  if (nodeAny.modifiers) {
    const decs: ts.Decorator[] = [];
    for (const mod of nodeAny.modifiers as readonly ts.Node[]) {
      if (mod.kind === ts.SyntaxKind.Decorator) {
        decs.push(mod as ts.Decorator);
      }
    }
    if (decs.length > 0) return decs;
  }

  return [];
}

class Transformer {
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
      if (!sourceFile) continue;

      const classDecl = this.findClassDeclaration(sourceFile, routeInfo.className);
      if (!classDecl) continue;

      const transformed = this.transformRouteClass(classDecl, sourceFile, routeInfo, targets, checker);
      results.push({
        name: routeInfo.className,
        node: transformed,
        sourceFile,
        originalNode: classDecl,
      });
    }

    for (const entityInfo of entities) {
      const sourceFile = program.getSourceFile(entityInfo.filePath);
      if (!sourceFile) continue;

      const classDecl = this.findClassDeclaration(sourceFile, entityInfo.className);
      if (!classDecl) continue;

      const transformed = this.transformEntityClass(classDecl, sourceFile, entityInfo, targets);
      results.push({
        name: entityInfo.className,
        node: transformed,
        sourceFile,
        originalNode: classDecl,
      });
    }

    for (const simpleInfo of simple) {
      const sourceFile = program.getSourceFile(simpleInfo.filePath);
      if (!sourceFile) continue;

      if (simpleInfo.kind === 'class') {
        const classDecl = this.findClassDeclaration(sourceFile, simpleInfo.name);
        if (!classDecl) continue;

        const transformed = this.transformGenericClass(classDecl, sourceFile, targets);
        results.push({
          name: simpleInfo.name,
          node: transformed,
          sourceFile,
        });
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
  ): ts.InterfaceDeclaration {
    const members: ts.TypeElement[] = [];
    const routeMethodImportMap = this.buildRouteMethodImportMap(sourceFile);

    for (const member of classDecl.members) {
      if (!ts.isMethodDeclaration(member)) continue;
      if (!member.name) continue;

      if (!this.isRouteMethod(member, routeMethodImportMap)) continue;

      const ignoreModes = AnnotationReader.readMemberIgnore(member);
      if (ignoreModes !== null && this.shouldIgnoreMember(ignoreModes, targets)) continue;

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
  ): ts.InterfaceDeclaration {
    const members: ts.TypeElement[] = [];

    for (const member of classDecl.members) {
      if (!ts.isPropertyDeclaration(member)) continue;
      if (!member.name) continue;

      if (this.hasModifier(member, ts.SyntaxKind.PrivateKeyword) ||
          this.hasModifier(member, ts.SyntaxKind.ProtectedKeyword) ||
          this.hasModifier(member, ts.SyntaxKind.StaticKeyword)) {
        continue;
      }

      const ignoreModes = AnnotationReader.readMemberIgnore(member);
      if (ignoreModes !== null && this.shouldIgnoreMember(ignoreModes, targets)) continue;

      const newProp = ts.factory.createPropertySignature(
        undefined,
        member.name,
        member.questionToken,
        member.type
      );

      members.push(transferJSDoc(member, newProp, sourceFile) as ts.TypeElement);
    }

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
  ): ts.InterfaceDeclaration {
    const members: ts.TypeElement[] = [];

    for (const member of classDecl.members) {
      if (this.hasModifier(member, ts.SyntaxKind.PrivateKeyword) ||
          this.hasModifier(member, ts.SyntaxKind.ProtectedKeyword) ||
          this.hasModifier(member, ts.SyntaxKind.StaticKeyword)) {
        continue;
      }

      if (ts.isConstructorDeclaration(member)) continue;

      const ignoreModes = AnnotationReader.readMemberIgnore(member);
      if (ignoreModes !== null && this.shouldIgnoreMember(ignoreModes, targets)) continue;

      if (ts.isMethodDeclaration(member)) {
        continue;
      } else if (ts.isPropertyDeclaration(member)) {
        const newProp = ts.factory.createPropertySignature(
          undefined,
          member.name!,
          member.questionToken,
          member.type
        );
        members.push(transferJSDoc(member, newProp, sourceFile) as ts.TypeElement);
      }
    }

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

  private shouldIgnoreMember(memberIgnoreModes: string[] | null, targets?: string[]): boolean {
    if (memberIgnoreModes === null) return false;
    if (memberIgnoreModes.length === 0) return true;
    if (!targets || targets.length === 0) return false;
    return targets.some(t => memberIgnoreModes.includes(t));
  }

  private isRouteMethod(member: ts.MethodDeclaration, routeMethodImportMap: Map<string, Set<string>>): boolean {
    const decorators = getNodeDecorators(member);

    for (const decorator of decorators) {
      const expr = decorator.expression;

      if (ts.isPropertyAccessExpression(expr)) {
        const objectName = expr.expression.getText();
        const methodName = expr.name.text;
        const routeMethods = routeMethodImportMap.get(objectName);
        if (routeMethods && routeMethods.has(methodName)) {
          return true;
        }
      }

      if (ts.isCallExpression(expr)) {
        const callee = expr.expression;
        if (ts.isPropertyAccessExpression(callee)) {
          const objectName = callee.expression.getText();
          const methodName = callee.name.text;
          const routeMethods = routeMethodImportMap.get(objectName);
          if (routeMethods && routeMethods.has(methodName)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  private buildRouteMethodImportMap(sourceFile: ts.SourceFile): Map<string, Set<string>> {
    const map = new Map<string, Set<string>>();

    for (const statement of sourceFile.statements) {
      if (!ts.isImportDeclaration(statement)) continue;

      const moduleSpecifier = (statement.moduleSpecifier as ts.StringLiteral).text;
      const isFramework = moduleSpecifier === frameworkModule ||
        moduleSpecifier.startsWith('@sora-soft/framework/');

      if (!isFramework) continue;

      const importClause = statement.importClause;
      if (!importClause?.namedBindings || !ts.isNamedImports(importClause.namedBindings)) continue;

      for (const element of importClause.namedBindings.elements) {
        const localName = element.name.text;
        const importedName = element.propertyName?.text || localName;
        if (importedName === 'Route') {
          const methods = map.get(localName) || new Set<string>();
          methods.add('method');
          methods.add('notify');
          map.set(localName, methods);
        }
      }
    }

    return map;
  }

  private findClassDeclaration(sourceFile: ts.SourceFile, className: string): ts.ClassDeclaration | null {
    for (const statement of sourceFile.statements) {
      if (ts.isClassDeclaration(statement) && statement.name?.text === className) {
        return statement;
      }
    }
    return null;
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
