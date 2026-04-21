import * as ts from 'typescript';

import {type DiagnosticCollector} from '../DiagnosticCollector';
import {transferJSDoc} from './JSDocUtils';
import {type TransformedDeclaration} from './Transformer';

interface ResolvedType {
  name: string;
  node: ts.Node;
  sourceFile: ts.SourceFile;
}

class TypeResolver {
  private visitedSymbols_ = new Set<ts.Symbol>();
  private collectedTypes_: ResolvedType[] = [];
  private diagnostics_: DiagnosticCollector | null;

  constructor(diagnostics?: DiagnosticCollector) {
    this.diagnostics_ = diagnostics || null;
  }

  resolve(program: ts.Program, declarations: TransformedDeclaration[]): ResolvedType[] {
    const checker = program.getTypeChecker();

    for (const decl of declarations) {
      this.collectFromTransformed(decl, checker);
    }

    return this.collectedTypes_;
  }

  private collectFromTransformed(decl: TransformedDeclaration, checker: ts.TypeChecker) {
    this.collectTypeDependencies(decl.node, checker, decl.sourceFile);
    this.resolveHeritageClauses(decl.node, checker);

    if (decl.originalNode) {
      this.resolveSyntheticReturnTypes(decl.node, decl.originalNode, checker, decl.sourceFile);
    }
  }

  private resolveHeritageClauses(node: ts.Node, checker: ts.TypeChecker) {
    if (!ts.isInterfaceDeclaration(node) || !node.heritageClauses) return;

    for (const clause of node.heritageClauses) {
      for (const type of clause.types) {
        const symbol = checker.getSymbolAtLocation(type.expression);
        if (symbol) {
          this.resolveSymbolDeclaration(symbol, checker);
        }
      }
    }
  }

  private resolveSyntheticReturnTypes(
    transformedNode: ts.Node,
    originalNode: ts.Node,
    checker: ts.TypeChecker,
    sourceFile: ts.SourceFile
  ) {
    if (!ts.isInterfaceDeclaration(transformedNode) || !ts.isClassDeclaration(originalNode)) return;

    const transformedMethods = new Map<string, ts.MethodSignature>();
    for (const m of transformedNode.members) {
      if (ts.isMethodSignature(m) && m.name) {
        transformedMethods.set(m.name.getText(sourceFile), m);
      }
    }

    for (const originalMethod of originalNode.members) {
      if (!ts.isMethodDeclaration(originalMethod) || !originalMethod.name) continue;
      const methodName = originalMethod.name.getText(sourceFile);
      const transformedMethod = transformedMethods.get(methodName);
      if (!transformedMethod) continue;

      if (originalMethod.type) {
        this.collectTypeDependencies(originalMethod.type, checker, sourceFile);
      } else {
        const signature = checker.getSignatureFromDeclaration(originalMethod);
        if (signature) {
          const returnType = signature.getReturnType();
          const symbols = returnType.aliasSymbol ? [returnType.aliasSymbol] :
            !returnType.aliasSymbol && returnType.symbol ? this.expandTypeSymbols(returnType, checker) : [];
          for (const sym of symbols) {
            this.resolveSymbolDeclaration(sym, checker);
          }
        }
      }

      if (transformedMethod.parameters.length > 0) {
        for (const p of transformedMethod.parameters) {
          if (p.type) {
            this.collectTypeDependencies(p.type, checker, sourceFile);
          }
        }
      }
    }
  }

  private expandTypeSymbols(type: ts.Type, checker: ts.TypeChecker): ts.Symbol[] {
    const result: ts.Symbol[] = [];

    if (type.isUnionOrIntersection()) {
      for (const t of type.types) {
        result.push(...this.expandTypeSymbols(t, checker));
      }
    } else if (type.symbol) {
      result.push(type.symbol);
    }

    if ((type as any).typeArguments) {
      for (const t of (type as any).typeArguments as ts.Type[]) {
        result.push(...this.expandTypeSymbols(t, checker));
      }
    }

    return result;
  }

  private resolveSymbolDeclaration(symbol: ts.Symbol, checker: ts.TypeChecker) {
    if (this.visitedSymbols_.has(symbol)) return;

    const declarations = this.getDeclarations(symbol, checker);
    if (!declarations || declarations.length === 0) return;

    for (const decl of declarations) {
      const declSourceFile = decl.getSourceFile();
      if (this.isBuiltInType(declSourceFile.fileName)) continue;
      if (this.visitedSymbols_.has(symbol)) continue;
      this.visitedSymbols_.add(symbol);
      this.collectResolvedDeclaration(decl, checker, declSourceFile);
    }
  }

  private getDeclarations(symbol: ts.Symbol, checker: ts.TypeChecker): ts.Declaration[] {
    const decls = symbol.getDeclarations();
    if (decls && decls.length > 0) {
      const firstDecl = decls[0];
      if (ts.isImportSpecifier(firstDecl)) {
        try {
          const aliased = checker.getAliasedSymbol(symbol);
          if (aliased) {
            const aliasedDecls = aliased.getDeclarations();
            if (aliasedDecls && aliasedDecls.length > 0) {
              return aliasedDecls;
            }
          }
        } catch {
        }
      }
    }
    return decls || [];
  }

  private collectTypeDependencies(node: ts.Node, checker: ts.TypeChecker, sourceFile: ts.SourceFile) {
    const visit = (child: ts.Node) => {
      if (ts.isTypeReferenceNode(child)) {
        this.resolveTypeReference(child, checker, sourceFile);
      } else if (ts.isIdentifier(child)) {
        this.resolveIdentifier(child, checker, sourceFile);
      }

      ts.forEachChild(child, visit);
    };

    ts.forEachChild(node, visit);
  }

  private resolveTypeReference(node: ts.TypeReferenceNode, checker: ts.TypeChecker, _: ts.SourceFile) {
    const typeName = node.typeName;

    const symbol = checker.getSymbolAtLocation(typeName);
    if (!symbol) {
      if (this.diagnostics_) {
        this.diagnostics_.addWarning(
          `Cannot resolve type '${typeName.getText()}'. The type symbol was not found.`
        );
      }
      return;
    }

    if (this.visitedSymbols_.has(symbol)) return;

    const declarations = this.getDeclarations(symbol, checker);
    if (!declarations || declarations.length === 0) {
      if (this.diagnostics_) {
        this.diagnostics_.addWarning(
          `Cannot resolve declarations for type '${typeName.getText()}'.`
        );
      }
      return;
    }

    for (const decl of declarations) {
      const declSourceFile = decl.getSourceFile();
      if (this.isBuiltInType(declSourceFile.fileName)) continue;

      if (this.visitedSymbols_.has(symbol)) continue;
      this.visitedSymbols_.add(symbol);

      this.collectResolvedDeclaration(decl, checker, declSourceFile);
    }
  }

  private resolveIdentifier(node: ts.Identifier, checker: ts.TypeChecker, _: ts.SourceFile) {
    const symbol = checker.getSymbolAtLocation(node);
    if (!symbol) return;

    const declarations = this.getDeclarations(symbol, checker);
    if (!declarations || declarations.length === 0) return;

    for (const decl of declarations) {
      const declSourceFile = decl.getSourceFile();
      if (this.isBuiltInType(declSourceFile.fileName)) continue;

      if (ts.isInterfaceDeclaration(decl) || ts.isTypeAliasDeclaration(decl) || ts.isEnumDeclaration(decl)) {
        this.resolveTypeFromDeclaration(decl, checker);
      }
    }
  }

  private collectResolvedDeclaration(decl: ts.Node, checker: ts.TypeChecker, declSourceFile: ts.SourceFile) {
    if (ts.isInterfaceDeclaration(decl)) {
      const name = decl.name.text;
      const members = ts.factory.createNodeArray(
        decl.members.map(member => {
          ts.setTextRange(member, {pos: -1, end: -1});
          return transferJSDoc(member, member, declSourceFile) as ts.TypeElement;
        })
      );
      const exported = ts.factory.createInterfaceDeclaration(
        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        decl.name,
        decl.typeParameters,
        decl.heritageClauses,
        members
      );
      const result = transferJSDoc(decl, exported, declSourceFile);
      this.collectedTypes_.push({name, node: result, sourceFile: declSourceFile});
      this.collectTypeDependencies(result, checker, declSourceFile);
      this.resolveHeritageClauses(result, checker);
    } else if (ts.isTypeAliasDeclaration(decl)) {
      const name = decl.name.text;
      const exported = ts.factory.createTypeAliasDeclaration(
        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        decl.name,
        decl.typeParameters,
        decl.type
      );
      const result = transferJSDoc(decl, exported, declSourceFile);
      this.collectedTypes_.push({name, node: result, sourceFile: declSourceFile});
      this.collectTypeDependencies(result, checker, declSourceFile);
    } else if (ts.isEnumDeclaration(decl)) {
      const name = decl.name.text;
      const members = ts.factory.createNodeArray(
        decl.members.map(member => {
          ts.setTextRange(member, {pos: -1, end: -1});
          return transferJSDoc(member, member, declSourceFile) as ts.EnumMember;
        })
      );
      const exported = ts.factory.createEnumDeclaration(
        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        decl.name,
        members
      );
      const result = transferJSDoc(decl, exported, declSourceFile);
      this.collectedTypes_.push({name, node: result, sourceFile: declSourceFile});
    } else if (ts.isClassDeclaration(decl)) {
      const name = decl.name?.text;
      if (!name) return;

      const members: ts.TypeElement[] = [];
      for (const member of decl.members) {
        if (ts.isConstructorDeclaration(member)) continue;
        if (ts.isMethodDeclaration(member)) continue;
        if (!ts.isPropertyDeclaration(member) || !member.name) continue;
        if (this.hasModifier(member, ts.SyntaxKind.PrivateKeyword) ||
            this.hasModifier(member, ts.SyntaxKind.ProtectedKeyword) ||
            this.hasModifier(member, ts.SyntaxKind.StaticKeyword)) {
          continue;
        }

        const newProp = ts.factory.createPropertySignature(
          undefined,
          member.name,
          member.questionToken,
          member.type
        );
        members.push(transferJSDoc(member, newProp, declSourceFile) as ts.TypeElement);
      }

      const extendsClauses = decl.heritageClauses?.filter(
        clause => clause.token === ts.SyntaxKind.ExtendsKeyword
      );
      const heritageClauses = extendsClauses?.length ? extendsClauses : undefined;

      const exported = ts.factory.createInterfaceDeclaration(
        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        decl.name!,
        decl.typeParameters,
        heritageClauses,
        members
      );

      const result = transferJSDoc(decl, exported, declSourceFile);
      this.collectedTypes_.push({name, node: result, sourceFile: declSourceFile});
      this.collectTypeDependencies(result, checker, declSourceFile);
      this.resolveHeritageClauses(result, checker);
    }
  }

  private resolveTypeFromDeclaration(decl: ts.Node, checker: ts.TypeChecker) {
    let nameNode: ts.Identifier | undefined;
    if (ts.isInterfaceDeclaration(decl)) {
      nameNode = decl.name;
    } else if (ts.isTypeAliasDeclaration(decl)) {
      nameNode = decl.name;
    } else if (ts.isEnumDeclaration(decl)) {
      nameNode = decl.name;
    } else {
      const children = decl.getChildren();
      if (children.length > 0 && ts.isIdentifier(children[0])) {
        nameNode = children[0];
      }
    }

    if (!nameNode) return;

    const symbol = checker.getSymbolAtLocation(nameNode);
    if (!symbol) return;
    if (this.visitedSymbols_.has(symbol)) return;

    const declSourceFile = decl.getSourceFile();

    if (ts.isInterfaceDeclaration(decl)) {
      this.visitedSymbols_.add(symbol);
      const name = decl.name.text;
      const members = ts.factory.createNodeArray(
        decl.members.map(member => {
          ts.setTextRange(member, {pos: -1, end: -1});
          return transferJSDoc(member, member, declSourceFile) as ts.TypeElement;
        })
      );
      const exported = ts.factory.createInterfaceDeclaration(
        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        decl.name,
        decl.typeParameters,
        decl.heritageClauses,
        members
      );
      const result = transferJSDoc(decl, exported, declSourceFile);
      this.collectedTypes_.push({name, node: result, sourceFile: declSourceFile});
      this.collectTypeDependencies(result, checker, declSourceFile);
      this.resolveHeritageClauses(result, checker);
    } else if (ts.isTypeAliasDeclaration(decl)) {
      this.visitedSymbols_.add(symbol);
      const name = decl.name.text;
      const exported = ts.factory.createTypeAliasDeclaration(
        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        decl.name,
        decl.typeParameters,
        decl.type
      );
      const result = transferJSDoc(decl, exported, declSourceFile);
      this.collectedTypes_.push({name, node: result, sourceFile: declSourceFile});
      this.collectTypeDependencies(result, checker, declSourceFile);
    } else if (ts.isEnumDeclaration(decl)) {
      this.visitedSymbols_.add(symbol);
      const name = decl.name.text;
      const members = ts.factory.createNodeArray(
        decl.members.map(member => {
          ts.setTextRange(member, {pos: -1, end: -1});
          return transferJSDoc(member, member, declSourceFile) as ts.EnumMember;
        })
      );
      const exported = ts.factory.createEnumDeclaration(
        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        decl.name,
        members
      );
      const result = transferJSDoc(decl, exported, declSourceFile);
      this.collectedTypes_.push({name, node: result, sourceFile: declSourceFile});
    }
  }

  private isBuiltInType(fileName: string): boolean {
    const builtInPaths = ['/typescript/lib/', '/@types/node/', 'node_modules'];
    const isBuiltIn = builtInPaths.some(p => fileName.includes(p));
    if (isBuiltIn && this.diagnostics_ && fileName.includes('node_modules')) {
      this.diagnostics_.addWarning(
        `External package type referenced from '${fileName}'. This type cannot be exported and will be skipped.`
      );
    }
    return isBuiltIn;
  }

  private hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean {
    if (ts.canHaveModifiers(node)) {
      const modifiers = ts.getModifiers(node) || [];
      return modifiers.some(m => m.kind === kind);
    }
    return false;
  }
}

export {TypeResolver};
export type {ResolvedType};
