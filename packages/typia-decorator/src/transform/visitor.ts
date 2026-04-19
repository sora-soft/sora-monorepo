import {AssertProgrammer, ImportProgrammer} from '@typia/core';
import * as ts from 'typescript';

const guardDeclarationFile = 'runtime/index.d.ts';

function isGuardFromRuntime(declaration: ts.Declaration): boolean {
  const sourceFile = declaration.getSourceFile();
  const fileName = sourceFile.fileName.replace(/\\/g, '/');
  return fileName.endsWith(guardDeclarationFile);
}

function resolveGuardSymbol(
  decorator: ts.Decorator,
  checker: ts.TypeChecker
): boolean {
  const expr = decorator.expression;

  let identifier: ts.Expression;
  if (ts.isCallExpression(expr)) {
    identifier = expr.expression;
  } else {
    identifier = expr;
  }

  if (!ts.isIdentifier(identifier)) return false;

  let symbol = checker.getSymbolAtLocation(identifier);
  if (!symbol) return false;

  if (symbol.flags & (ts.SymbolFlags.Alias as number)) {
    symbol = checker.getAliasedSymbol(symbol);
  }

  const declarations = symbol.getDeclarations();
  if (!declarations || declarations.length === 0) return false;

  for (const decl of declarations) {
    if (isGuardFromRuntime(decl)) return true;
  }

  return false;
}

function getParamDecorators(param: ts.ParameterDeclaration): readonly ts.Decorator[] {
  return ts.getDecorators(param) ?? [];
}

interface GuardedParam {
  paramIndex: number;
  paramName: string;
  typeNode: ts.TypeNode;
  type: ts.Type;
  guardDecorator: ts.Decorator;
}

function findGuardedParams(
  method: ts.MethodDeclaration,
  checker: ts.TypeChecker
): GuardedParam[] {
  const parameters = method.parameters;
  if (!parameters || parameters.length === 0) return [];

  const guardedParams: GuardedParam[] = [];

  for (let i = 0; i < parameters.length; i++) {
    const param = parameters[i];
    if (!ts.isIdentifier(param.name)) continue;
    if (!param.type) continue;

    const decorators = getParamDecorators(param);
    for (const dec of decorators) {
      if (resolveGuardSymbol(dec, checker)) {
        const type = checker.getTypeFromTypeNode(param.type);
        guardedParams.push({
          paramIndex: i,
          paramName: param.name.text,
          typeNode: param.type,
          type,
          guardDecorator: dec,
        });
        break;
      }
    }
  }

  return guardedParams;
}

interface TransformEnv {
  program: ts.Program;
  checker: ts.TypeChecker;
  compilerOptions: ts.CompilerOptions;
  printer: ts.Printer;
}

function buildTypiaContext(
  env: TransformEnv,
  tsContext: ts.TransformationContext,
  importer: ImportProgrammer
): Parameters<typeof AssertProgrammer.write>[0]['context'] {
  return {
    program: env.program,
    compilerOptions: env.compilerOptions,
    checker: env.checker,
    printer: env.printer,
    options: {},
    transformer: tsContext,
    importer,
    extras: {
      addDiagnostic: (_: ts.Diagnostic) => 0,
    },
  };
}

function collectGuardedMethods(
  node: ts.Node,
  checker: ts.TypeChecker
): Map<ts.MethodDeclaration, GuardedParam[]> {
  const results = new Map<ts.MethodDeclaration, GuardedParam[]>();

  function visit(n: ts.Node) {
    if (ts.isMethodDeclaration(n)) {
      const guardedParams = findGuardedParams(n, checker);
      if (guardedParams.length > 0) {
        results.set(n, guardedParams);
      }
    }
    ts.forEachChild(n, visit);
  }

  visit(node);
  return results;
}

export function processSourceFile(
  sourceFile: ts.SourceFile,
  env: TransformEnv,
  tsContext: ts.TransformationContext
): ts.SourceFile {
  const {checker} = env;

  const guardedMethods = collectGuardedMethods(sourceFile, checker);
  if (guardedMethods.size === 0) return sourceFile;

  const importer = new ImportProgrammer({
    internalPrefix: 'typia_transform_',
  });

  const typiaCtx = buildTypiaContext(env, tsContext, importer);

  const modulo = ts.factory.createIdentifier('typia');
  (modulo as any).getText = () => 'typia';

  const assertStatementMap = new Map<ts.MethodDeclaration, ts.Statement[]>();
  for (const [methodNode, guardedParams] of guardedMethods) {
    const statements: ts.Statement[] = [];
    for (const gp of guardedParams) {
      const typeName = gp.typeNode.getFullText().trim();

      const assertFn = AssertProgrammer.write({
        context: typiaCtx,
        modulo,
        type: gp.type,
        name: typeName,
        config: {equals: false, guard: false},
      });

      const callWithArg = ts.factory.createCallExpression(
        assertFn,
        undefined,
        [ts.factory.createIdentifier(gp.paramName)]
      );

      statements.push(ts.factory.createExpressionStatement(callWithArg));
    }
    assertStatementMap.set(methodNode, statements);
  }

  function visitNode(node: ts.Node): ts.Node {
    if (ts.isMethodDeclaration(node) && guardedMethods.has(node)) {
      const assertStatements = assertStatementMap.get(node) ?? [];
      const guardDecoratorSet = new Set(
        (guardedMethods.get(node) ?? []).map((gp) => gp.guardDecorator)
      );

      const newParameters = ts.factory.createNodeArray(
        node.parameters.map((param) => {
          const decorators = getParamDecorators(param);
          const hasGuardDecorator = decorators.some((d) => guardDecoratorSet.has(d));
          if (!hasGuardDecorator) return param;

          const allModifiers = ts.getModifiers(param) ?? [];
          const filteredModifiers = allModifiers.length > 0 ? allModifiers : undefined;

          return ts.factory.updateParameterDeclaration(
            param,
            filteredModifiers,
            param.dotDotDotToken,
            param.name,
            param.questionToken,
            param.type,
            param.initializer
          );
        })
      );

      const existingBody = node.body ?? ts.factory.createBlock([], true);
      const newBody = ts.factory.updateBlock(
        existingBody,
        ts.factory.createNodeArray([...assertStatements, ...existingBody.statements])
      );

      const methodModifiers = ts.factory.createNodeArray([
        ...(ts.getDecorators(node) ?? []),
        ...(ts.getModifiers(node) ?? []),
      ]);

      return ts.factory.updateMethodDeclaration(
        node,
        methodModifiers,
        node.asteriskToken,
        node.name,
        node.questionToken,
        node.typeParameters,
        newParameters,
        node.type,
        newBody
      );
    }
    return node;
  }

  function visitDeep(node: ts.Node): ts.Node {
    const visited = visitNode(node);
    return ts.visitEachChild(visited, visitDeep, tsContext);
  }

  const transformed = ts.visitEachChild(sourceFile, visitDeep, tsContext) as ts.SourceFile;

  const importStatements = importer.toStatements();
  if (importStatements.length > 0) {
    return ts.factory.updateSourceFile(
      transformed,
      ts.factory.createNodeArray([...importStatements, ...transformed.statements])
    );
  }

  return transformed;
}
