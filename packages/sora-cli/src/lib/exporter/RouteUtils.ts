import * as ts from 'typescript';

const frameworkModule = '@sora-soft/framework';

export function getNodeDecorators(node: ts.Node): ts.Decorator[] {
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

export function buildRouteMethodImportMap(sourceFile: ts.SourceFile): Map<string, Set<string>> {
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

export function findClassDeclaration(sourceFile: ts.SourceFile, className: string): ts.ClassDeclaration | null {
  for (const statement of sourceFile.statements) {
    if (ts.isClassDeclaration(statement) && statement.name?.text === className) {
      return statement;
    }
  }
  return null;
}

export function isRouteMethod(member: ts.MethodDeclaration, routeMethodImportMap: Map<string, Set<string>>): boolean {
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

export function isRouteNotify(member: ts.MethodDeclaration, routeMethodImportMap: Map<string, Set<string>>): boolean {
  const decorators = getNodeDecorators(member);

  for (const decorator of decorators) {
    const expr = decorator.expression;

    if (ts.isPropertyAccessExpression(expr)) {
      const objectName = expr.expression.getText();
      const methodName = expr.name.text;
      if (methodName === 'notify') {
        const routeMethods = routeMethodImportMap.get(objectName);
        if (routeMethods && routeMethods.has('notify')) {
          return true;
        }
      }
    }

    if (ts.isCallExpression(expr)) {
      const callee = expr.expression;
      if (ts.isPropertyAccessExpression(callee)) {
        const objectName = callee.expression.getText();
        const methodName = callee.name.text;
        if (methodName === 'notify') {
          const routeMethods = routeMethodImportMap.get(objectName);
          if (routeMethods && routeMethods.has('notify')) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

export function shouldIgnoreMember(memberIgnoreModes: string[] | null, targets?: string[]): boolean {
  if (memberIgnoreModes === null) return false;
  if (memberIgnoreModes.length === 0) return true;
  if (!targets || targets.length === 0) return false;
  return targets.some(t => memberIgnoreModes.includes(t));
}
