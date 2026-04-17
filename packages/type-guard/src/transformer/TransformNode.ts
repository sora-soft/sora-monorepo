import objHash from 'object-hash';
import ts from 'typescript';
import type {PartialVisitorContext} from './VisitorContext.js';

const RuntimeFiles = {
  TypeGuard: 'TypeGuard.d.ts',
  Decorator: 'Decorator.d.ts',
};

const isFromRuntime = (declaration: ts.Declaration, targetFile: string): boolean => {
  const sourceFile = declaration.getSourceFile();
  return sourceFile.fileName.endsWith(targetFile);
};

export const transformNode = (node: ts.Node, visitorContext: PartialVisitorContext): ts.Node => {
  const {checker} = visitorContext;

  if (ts.isCallExpression(node)) {
    const signature = checker.getResolvedSignature(node);
    const declaration = signature?.declaration;

    if (
      declaration &&
      isFromRuntime(declaration, RuntimeFiles.TypeGuard) &&
      node.typeArguments?.length === 1
    ) {
      const name = (declaration as any).name?.getText();

      switch (name) {
        case 'is':
        case 'assert': {
          const typeArgument = node.typeArguments[0];
          const type = checker.getTypeFromTypeNode(typeArgument);
          const schema = visitorContext.schemaGenerator.getTypeDefinition(type, false, undefined, undefined, undefined, undefined, true);

          const expression = generateAst(schema);
          const hash = objHash(schema);
          if (expression) {
            const args = ts.factory.createNodeArray([...node.arguments, expression, ts.factory.createStringLiteral(hash)]);
            return ts.factory.updateCallExpression(node, node.expression, node.typeArguments, args);
          }
          break;
        }
      }
    }
  }

  if (ts.isDecorator(node) && ts.isParameter(node.parent)) {
    if (node.parent.type === undefined) return node;

    const type = checker.getTypeFromTypeNode(node.parent.type);

    // 装饰器可能是 @AssertType 或 @AssertType()
    const decoratorExpr = node.expression;
    const isCall = ts.isCallExpression(decoratorExpr);

    // 获取装饰器指向的符号声明
    const signature = isCall ? checker.getResolvedSignature(decoratorExpr) : undefined;
    const declaration = signature?.declaration || (isCall ? undefined : checker.getSymbolAtLocation(decoratorExpr)?.getDeclarations()?.[0]);

    if (
      declaration &&
            isFromRuntime(declaration, RuntimeFiles.Decorator)
    ) {
      const name = (declaration as any).name?.getText();
      switch (name) {
        case 'AssertType': {
          const schema = visitorContext.schemaGenerator.getTypeDefinition(type, false, undefined, undefined, undefined, undefined, true);
          const schemaExpression = generateAst(schema);
          if (schemaExpression) {
            const callExpression = isCall
              ? (decoratorExpr as ts.CallExpression)
              : ts.factory.createCallExpression(decoratorExpr as ts.Expression, undefined, []);

            return ts.factory.updateDecorator(
              node,
              ts.factory.updateCallExpression(
                callExpression,
                callExpression.expression,
                undefined,
                [schemaExpression],
              ),
            );
          }
          break;
        }
      }
    }
  }
  return node;
};

const generateAst = (origin: unknown): ts.Expression | null => {
  if (typeof origin === 'boolean') {
    return ts.factory.createToken(origin ? ts.SyntaxKind.TrueKeyword : ts.SyntaxKind.FalseKeyword) as ts.Expression;
  }
  if (typeof origin == 'string') {
    return ts.factory.createStringLiteral(origin);
  }
  if (typeof origin === 'number') {
    if (origin < 0) {
      return ts.factory.createPrefixUnaryExpression(
        ts.SyntaxKind.MinusToken,
        ts.factory.createNumericLiteral((-origin).toString()),
      );
    } else {
      return ts.factory.createNumericLiteral(origin.toString());
    }
  }
  if (typeof origin === 'object') {
    if (Array.isArray(origin)) {
      const elements = origin.map(m => generateAst(m)).filter(v => v !== null) as ts.Expression[];
      return ts.factory.createArrayLiteralExpression(elements);
    }
    if (origin === null) {
      return ts.factory.createToken(ts.SyntaxKind.NullKeyword);
    }
    const properties: ts.PropertyAssignment[] = [];
    for (const [key, value] of Object.entries(origin)) {
      const v = generateAst(value);
      if (v) {
        properties.push(ts.factory.createPropertyAssignment(ts.factory.createStringLiteral(key), v));
      }
    }
    return ts.factory.createObjectLiteralExpression(properties);
  }
  return null;
};
